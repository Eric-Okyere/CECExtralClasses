import Navbar from "../../components/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 bg-white shadow-md mt-8 rounded-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-4">
          Last Updated: April 2026
        </p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information such as your name, email address,
              school details, lessons watched, quiz results, and
              account activity to provide educational services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. How We Use Information
            </h2>
            <p>
              Your information helps us deliver lessons, track progress,
              improve user experience, and provide support.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. Protection of Children
            </h2>
            <p>
              Since our platform is intended for students, including minors,
              we may request parental or guardian consent where necessary.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              4. Data Security
            </h2>
            <p>
              We implement reasonable security measures to protect
              user data from unauthorized access or misuse.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. Third-Party Services
            </h2>
            <p>
              We may use trusted third-party providers for hosting,
              analytics, and payment processing.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              6. Contact Us
            </h2>
            <p>
              For questions regarding this Privacy Policy, contact us at:
              <br />
              <span className="font-medium">support@edujhs.com</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}