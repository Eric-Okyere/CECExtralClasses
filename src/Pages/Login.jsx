import React, { useState } from "react";
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

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();

  const [extraInfo, setExtraInfo] = useState({
    level: "",
    role: "student",
    childFirstName: "",
    childLastName: "",
    relationship: "",
    childAge: "",
    parentPhone: "",
  });

  const checkProfileComplete = (user) => {
    return user.learningProfile?.level || user.role === "parent";
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}auth/google-login`, {
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

        if (!checkProfileComplete(data.user)) {
          setLoggedInUser(data.user);
          setShowModal(true);
        } else {
          navigate("/");
        }
      } else {
        setError(data.msg || "Google authentication failed.");
      }
    } catch (error) {
      setError("Server connection error during Google login.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        role: extraInfo.role === "student" ? "learner" : "parent",
        level: extraInfo.level,
        childAge: extraInfo.childAge,
        parentPhone: extraInfo.parentPhone,
        relationship: extraInfo.relationship,
        childFirstName: extraInfo.childFirstName,
        childLastName: extraInfo.childLastName,
        acceptedTerms: agreed,
        acceptedTermsAt: new Date(),
      };

      const res = await fetch(
        `${API_BASE_URL}auth/update-profile/${loggedInUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        const userToStore = data.user ? data.user : data;
        localStorage.setItem("user", JSON.stringify(userToStore));
        setShowModal(false);
        navigate("/");
      } else {
        setError(data.msg || "Profile update failed.");
      }
    } catch (error) {
      setError("Something went wrong while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value) => {
    setExtraInfo({
      ...extraInfo,
      parentPhone: value,
    });
  };

  const isFormValid = () => {
    const base =
      extraInfo.level &&
      extraInfo.childAge &&
      extraInfo.parentPhone &&
      agreed;

    if (extraInfo.role === "student") {
      return base;
    }

    return (
      base &&
      extraInfo.childFirstName &&
      extraInfo.childLastName &&
      extraInfo.relationship
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] px-4 font-sans text-slate-900">
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
            href="https://wa.me/233209317581"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl text-xs font-bold"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>

          <a
            href="tel:+233209317581"
            className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold"
          >
            <Phone size={16} />
            Call Us
          </a>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-black text-center mb-6 uppercase">
              Profile Setup 🎓
            </h2>

            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
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

              <select
                className="w-full p-4 bg-slate-50 rounded-xl"
                value={extraInfo.level}
                onChange={(e) =>
                  setExtraInfo({ ...extraInfo, level: e.target.value })
                }
              >
                <option value="">Select Grade Level</option>
                <option value="JHS 1">JHS 1</option>
                <option value="JHS 2">JHS 2</option>
                <option value="JHS 3">JHS 3</option>
              </select>

              {extraInfo.role === "parent_managed" && (
                <>
                  <input
                    type="text"
                    placeholder="Child First Name"
                    className="w-full p-4 bg-slate-50 rounded-xl"
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
                    placeholder="Child Last Name"
                    className="w-full p-4 bg-slate-50 rounded-xl"
                    value={extraInfo.childLastName}
                    onChange={(e) =>
                      setExtraInfo({
                        ...extraInfo,
                        childLastName: e.target.value,
                      })
                    }
                  />

                  <select
                    className="w-full p-4 bg-slate-50 rounded-xl"
                    value={extraInfo.relationship}
                    onChange={(e) =>
                      setExtraInfo({
                        ...extraInfo,
                        relationship: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </>
              )}

              <input
                type="number"
                placeholder="Age"
                className="w-full p-4 bg-slate-50 rounded-xl"
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
                onChange={handlePhoneChange}
              />

              <div className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <p className="text-slate-500">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="text-blue-600">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={!isFormValid() || loading}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold disabled:bg-slate-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" />
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