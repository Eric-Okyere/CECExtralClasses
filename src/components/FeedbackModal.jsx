import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Loader2, User } from 'lucide-react';
import { API_BASE_URL } from '../services/BaseUrl';

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'bug', // 'bug', 'feature', 'general'
    message: '',
    email: '',
  });

  const FEEDBACK_ENDPOINT = `${API_BASE_URL}feedback`; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    setLoading(true);

    const payload = {
      ...form,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setForm({ name: '', type: 'bug', message: '', email: '' });
        }, 2000);
      } else {
        alert("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Something went wrong. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button with Attention-Grabbing Animations */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group flex items-center justify-center">
          {/* Animated Glowing Ring Behind Button */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping pointer-events-none" />

          {/* Floating Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce hover:animate-none"
            title="Give Feedback"
          >
            {/* Pulsing Icon */}
            <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold text-sm hidden sm:inline tracking-wide">
              Feedback
            </span>
            
            {/* Notification Dot */}
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thank You!</h3>
                <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve the platform.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" /> Send Feedback
                </h3>

                {/* Name Field (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Feedback Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Feedback Category
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="bug">🐛 Report a Bug</option>
                    <option value="feature">💡 Suggest an Improvement</option>
                    <option value="general">💬 General Feedback</option>
                  </select>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe what went wrong or what you'd like to see..."
                    className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Optional Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com (if you'd like a response)"
                    className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !form.message.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-all shadow-md hover:shadow-lg active:scale-98"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}