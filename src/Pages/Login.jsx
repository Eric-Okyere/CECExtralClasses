import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Phone,
  MessageCircle,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { API_BASE_URL } from "../services/BaseUrl";
import Logo from "../assets/Logo.jpeg";

const PhoneInputComponent = PhoneInput.default
  ? PhoneInput.default
  : PhoneInput;

const getApiUrl = (endpoint) => {
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

// Helper: Verifies if user has completed required learning profile setup
const isProfileComplete = (user) => {
  if (!user) return false;
  const level = user.learningProfile?.level || user.level;
  const gender = user.learningProfile?.gender || user.gender;
  return Boolean(level && gender);
};

export default function Login() {
  // Shown when the session timed out and the user was sent back here.
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get("expired")
      ? "Your session has expired. Please sign in again."
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  // UI Modals
  const [showModal, setShowModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();

  // Profile Setup State
  const [extraInfo, setExtraInfo] = useState({
    level: "",
    gender: "",
    role: "student",
    childFirstName: "",
    childLastName: "",
    relationship: "",
    childAge: "",
    parentPhone: "",
    disabilityProfile: {
      hasDisability: false,
      type: "None",
      details: "",
      accommodationsNeeded: "",
    },
  });

  // --- 1. CHECK LOCALSTORAGE ON MOUNT (PREVENTS REFRESH BYPASS) ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserStr = localStorage.getItem("user");

    if (storedToken && storedUserStr) {
      try {
        const parsedUser = JSON.parse(storedUserStr);
        setLoggedInUser(parsedUser);

        // If logged in but profile is NOT complete, force showModal and stay on this page
        if (!isProfileComplete(parsedUser)) {
          setShowModal(true);
        } else {
          // Profile is complete, navigate to home/dashboard
          navigate("/", { replace: true });
        }
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }
  }, [navigate]);

  // --- GOOGLE LOGIN HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setLoadingMessage("Authenticating with Google...");
    setError("");

    try {
      const res = await fetch(getApiUrl("auth/google-login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setLoggedInUser(data.user);

        // Check if new user OR existing user without completed profile
        if (data.isNewUser || !isProfileComplete(data.user)) {
          setShowModal(true);
          setLoading(false);
        } else {
          setLoadingMessage("Welcome back! Redirecting...");
          navigate("/", { replace: true });
        }
      } else {
        setError(data.msg || "Google authentication failed.");
        setLoading(false);
      }
    } catch (err) {
      setError("Server connection error during Google login.");
      setLoading(false);
    }
  };

  // --- UPDATE PROFILE SETUP HANDLER ---
  const handleUpdateProfile = async () => {
    const userId = loggedInUser?._id || loggedInUser?.id;
    if (!userId) {
      setError("User session missing. Please try logging in again.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Saving profile details...");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const isParent = extraInfo.role === "parent_managed";

      const payload = {
        role: isParent ? "parent" : "learner",
        acceptedTerms: agreed,
        acceptedTermsAt: new Date(),
        learningProfile: {
          ...loggedInUser?.learningProfile,
          level: extraInfo.level,
          gender: extraInfo.gender,
          age: extraInfo.childAge ? Number(extraInfo.childAge) : undefined,
        },
        parentDetails: {
          ...loggedInUser?.parentDetails,
          phoneNumber: extraInfo.parentPhone,
          relationship: isParent ? extraInfo.relationship : undefined,
        },
        disabilityProfile: extraInfo.disabilityProfile,
      };

      const res = await fetch(getApiUrl(`auth/update-profile/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || data.message || "Profile update failed.");
        setLoading(false);
        return;
      }

      const userToStore = data.user ? data.user : data;

      // Link child if parent_managed
      if (isParent) {
        setLoadingMessage("Linking child account...");
        const childPayload = {
          parentId: userId,
          firstName: extraInfo.childFirstName,
          lastName: extraInfo.childLastName,
          age: Number(extraInfo.childAge),
          level: extraInfo.level,
          gender: extraInfo.gender,
          disabilityProfile: extraInfo.disabilityProfile,
        };

        const childRes = await fetch(getApiUrl("auth/add-child"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(childPayload),
        });

        if (!childRes.ok) {
          const childData = await childRes.json();
          console.warn("Child Creation Warning:", childData.msg);
        }
      }

      // Update local storage with complete profile
      localStorage.setItem("user", JSON.stringify(userToStore));
      setShowModal(false);
      setLoadingMessage("Profile updated! Redirecting...");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Profile Setup Error:", err);
      setError("Something went wrong while updating profile.");
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const baseValid =
      Boolean(extraInfo.parentPhone) &&
      Boolean(extraInfo.gender) &&
      Boolean(agreed);

    if (extraInfo.role === "student") {
      return baseValid && Boolean(extraInfo.level);
    }

    if (extraInfo.role === "parent_managed") {
      return (
        baseValid &&
        Boolean(extraInfo.level) &&
        Boolean(extraInfo.childFirstName) &&
        Boolean(extraInfo.childLastName) &&
        Boolean(extraInfo.relationship)
      );
    }

    return false;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] px-4 font-sans text-slate-900 relative">
      {loading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-center items-center z-[100] text-white">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-semibold tracking-wide">
            {loadingMessage || "Please wait..."}
          </p>
        </div>
      )}

      <div className="bg-white p-10 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <img src={Logo} alt="CEC Logo" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase">CEC Extra Classes</h2>
          <p className="text-slate-400 text-xs mt-1 uppercase">
            Where Learning Knows No Limit
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google Login Failed")}
        />

        <div className="pt-6 mt-6 border-t border-slate-50 grid grid-cols-2 gap-3">
          <a
            href="https://wa.me/233246748199"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl text-xs font-bold"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>

          <a
            href="tel:+233246748199"
            className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold"
          >
            <Phone size={16} />
            Call Us
          </a>
        </div>
      </div>

      {/* --- MODAL: FORCED FIRST TIME PROFILE SETUP --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-black text-center mb-2 uppercase">
              Profile Setup 🎓
            </h2>
            <p className="text-xs text-center text-slate-500 mb-6">
              Please complete your profile details to continue.
            </p>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-xs">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Role Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-xl text-sm font-bold ${
                    extraInfo.role === "student"
                      ? "bg-white text-blue-600 shadow"
                      : "text-slate-400"
                  }`}
                  onClick={() =>
                    setExtraInfo({ ...extraInfo, role: "student" })
                  }
                >
                  Solo Learner
                </button>

                <button
                  type="button"
                  className={`flex-1 py-3 rounded-xl text-sm font-bold ${
                    extraInfo.role === "parent_managed"
                      ? "bg-white text-blue-600 shadow"
                      : "text-slate-400"
                  }`}
                  onClick={() =>
                    setExtraInfo({ ...extraInfo, role: "parent_managed" })
                  }
                >
                  Parent / Guardian
                </button>
              </div>

              {/* Dynamic Fields */}
              {extraInfo.role === "parent_managed" ? (
                <>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Child's Details
                    </p>

                    <input
                      type="text"
                      placeholder="Child's First Name *"
                      className="w-full p-4 bg-slate-50 rounded-xl text-sm"
                      value={extraInfo.childFirstName}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          childFirstName: e.target.value,
                        })
                      }
                    />

                    <input
                      type="text"
                      placeholder="Child's Last Name *"
                      className="w-full p-4 bg-slate-50 rounded-xl text-sm"
                      value={extraInfo.childLastName}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          childLastName: e.target.value,
                        })
                      }
                    />

                    <select
                      className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 text-sm font-medium"
                      value={extraInfo.level}
                      onChange={(e) =>
                        setExtraInfo({ ...extraInfo, level: e.target.value })
                      }
                    >
                      <option value="">Select Child's Grade Level *</option>
                      <option value="JHS 1">BASIC 7</option>
                      <option value="JHS 2">BASIC 8</option>
                      <option value="JHS 3">BASIC 9</option>
                    </select>

                    <select
                      className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 text-sm font-medium"
                      value={extraInfo.gender}
                      onChange={(e) =>
                        setExtraInfo({ ...extraInfo, gender: e.target.value })
                      }
                    >
                      <option value="">Select Child's Gender *</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Child's Age"
                      className="w-full p-4 bg-slate-50 rounded-xl text-sm"
                      value={extraInfo.childAge}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          childAge: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Parent / Guardian Contact
                    </p>

                    <select
                      className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 text-sm font-medium"
                      value={extraInfo.relationship}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          relationship: e.target.value,
                        })
                      }
                    >
                      <option value="">Your Relationship to Child *</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>

                    <PhoneInputComponent
                      country={"gh"}
                      value={extraInfo.parentPhone}
                      onChange={(value) =>
                        setExtraInfo({ ...extraInfo, parentPhone: value })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <select
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 text-sm font-medium"
                    value={extraInfo.level}
                    onChange={(e) =>
                      setExtraInfo({ ...extraInfo, level: e.target.value })
                    }
                  >
                    <option value="">Select Your Grade Level *</option>
                    <option value="JHS 1">BASIC 7</option>
                    <option value="JHS 2">BASIC 8</option>
                    <option value="JHS 3">BASIC 9</option>
                  </select>

                  <select
                    className="w-full p-4 bg-slate-50 rounded-xl text-slate-800 text-sm font-medium"
                    value={extraInfo.gender}
                    onChange={(e) =>
                      setExtraInfo({ ...extraInfo, gender: e.target.value })
                    }
                  >
                    <option value="">Select Your Gender *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Your Age"
                    className="w-full p-4 bg-slate-50 rounded-xl text-sm"
                    value={extraInfo.childAge}
                    onChange={(e) =>
                      setExtraInfo({
                        ...extraInfo,
                        childAge: e.target.value,
                      })
                    }
                  />

                  <PhoneInputComponent
                    country={"gh"}
                    value={extraInfo.parentPhone}
                    onChange={(value) =>
                      setExtraInfo({ ...extraInfo, parentPhone: value })
                    }
                  />
                </>
              )}

              {/* Disability Profile Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extraInfo.disabilityProfile.hasDisability}
                    onChange={(e) =>
                      setExtraInfo({
                        ...extraInfo,
                        disabilityProfile: {
                          ...extraInfo.disabilityProfile,
                          hasDisability: e.target.checked,
                          type: e.target.checked
                            ? extraInfo.disabilityProfile.type
                            : "None",
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {extraInfo.role === "parent_managed"
                      ? "Child requires special educational accommodations / has a disability"
                      : "Learner requires special educational accommodations / has a disability"}
                  </span>
                </label>

                {extraInfo.disabilityProfile.hasDisability && (
                  <div className="space-y-3 pt-2">
                    <select
                      className="w-full p-3 bg-white rounded-xl text-xs font-medium border border-slate-200"
                      value={extraInfo.disabilityProfile.type}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          disabilityProfile: {
                            ...extraInfo.disabilityProfile,
                            type: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="None">Select Type</option>
                      <option value="Visual">Visual Impairment</option>
                      <option value="Hearing">Hearing Impairment</option>
                      <option value="Learning/Cognitive">
                        Learning / Cognitive (e.g. Dyslexia, ADHD)
                      </option>
                      <option value="Physical/Mobility">Physical / Mobility</option>
                      <option value="Speech/Language">Speech / Language</option>
                      <option value="Other">Other</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Details / Diagnosis (optional)"
                      className="w-full p-3 bg-white rounded-xl text-xs border border-slate-200"
                      value={extraInfo.disabilityProfile.details}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          disabilityProfile: {
                            ...extraInfo.disabilityProfile,
                            details: e.target.value,
                          },
                        })
                      }
                    />

                    <input
                      type="text"
                      placeholder="Accommodations Needed"
                      className="w-full p-3 bg-white rounded-xl text-xs border border-slate-200"
                      value={extraInfo.disabilityProfile.accommodationsNeeded}
                      onChange={(e) =>
                        setExtraInfo({
                          ...extraInfo,
                          disabilityProfile: {
                            ...extraInfo.disabilityProfile,
                            accommodationsNeeded: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2 text-sm pt-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <p className="text-slate-500 text-xs">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600 font-semibold">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-blue-600 font-semibold">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpdateProfile}
                disabled={!isFormValid() || loading}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold disabled:bg-slate-300 flex justify-center items-center gap-2 shadow-lg shadow-green-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save & Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}