import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMsg('Please populate all required fields.');
      return;
    }

    setSending(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: 'General Inquiry & Platform Support'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrorMsg(data.message || 'The server encountered an error processing your query.');
      }
    } catch (err) {
      setErrorMsg('Connection failed. Please ensure the server is fully compiled and active.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-12 text-left py-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Contact & Support</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white font-display">
          Raise Verification Query
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
          Report inaccuracies, request changes, or suggest new representatives for coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Contact Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider font-mono">
              Directory Desk
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">General Inquiries</p>
                  <p className="font-bold text-slate-850 dark:text-slate-300">aviralsu1996@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Head Office</p>
                  <p className="font-bold text-slate-850 dark:text-slate-300 leading-relaxed">
                    Jankipuram, Sector-I, Lucknow, Uttar Pradesh, 226021
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-8 rounded-2xl shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4 max-w-md mx-auto">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-lg leading-tight">Query Submitted</h3>
                <p className="text-slate-400 text-xs leading-normal">
                  Thank you. Your request has been queued in our registry. Our verification board will cross-reference the suggested data points and contact you.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="e.g. ramesh@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="e.g. Inaccurate portfolio for Yogi Adityanath"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Detailed Message / Verification Links</label>
                  <textarea
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Please write details and provide links to official gazettes or governmental disclosures if reporting an inaccuracy..."
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
