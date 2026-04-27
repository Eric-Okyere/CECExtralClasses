import Navbar from "../../components/Navbar";

export default function Terms() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 bg-white shadow-md mt-8 rounded-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Terms & Conditions
        </h1>

        <p className="text-gray-600 mb-4">
          Last Updated: April 2026
        </p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. Use of Platform
            </h2>
            <p>
              Our platform provides educational content such as video lessons,
              quizzes, and progress tracking tools for students.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. User Responsibilities
            </h2>
            <p>
              Users must provide accurate information, keep login credentials
              secure, and use the platform responsibly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. Subscription and Payments
            </h2>
            <p>
              Some features may require payment. Subscription fees must be paid
              in advance and may change with prior notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              4. Intellectual Property
            </h2>
            <p>
              All videos, quizzes, graphics, and learning materials on this
              platform are owned by EduJHS Ghana and may not be copied
              without permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. Limitation of Liability
            </h2>
            <p>
              We are not liable for interruptions, data loss, or academic
              outcomes resulting from the use of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              6. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of Ghana.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              7. Contact Us
            </h2>
            <p>
              For questions regarding these Terms, contact:
              <br />
              <span className="font-medium">support@edujhs.com</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}