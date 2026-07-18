import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, User, Tag, MessageSquare, 
  Send, Check, AlertCircle, Sparkles, ShieldCheck 
} from 'lucide-react';

interface ContactUsProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledLeaderName?: string;
}

export default function ContactUs({ isOpen, onClose, prefilledLeaderName }: ContactUsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General Inquiry & Platform Support',
    subject: '',
    leaderName: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set default subject or prefilled fields on mount / prop change
  useEffect(() => {
    if (prefilledLeaderName) {
      setFormData(prev => ({
        ...prev,
        leaderName: prefilledLeaderName,
        category: 'Minister Profile Discrepancy / Suggestion',
        subject: `Dossier Correction Inquiry for ${prefilledLeaderName}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        leaderName: '',
        category: 'General Inquiry & Platform Support',
        subject: ''
      }));
    }
    setSuccess(false);
    setErrorMsg(null);
  }, [prefilledLeaderName, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim() || !formData.subject.trim()) {
      setErrorMsg('Please populate all required fields marked with *');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset form data
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: 'General Inquiry & Platform Support',
          subject: '',
          leaderName: '',
          message: ''
        });
      } else {
        setErrorMsg(data.message || 'The server encountered an error processing your query.');
      }
    } catch (err) {
      setErrorMsg('Connection failed. Please ensure the server is fully compiled and active.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          id="contact-backdrop"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-[#031511] text-white border border-emerald-950 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden z-10"
          id="contact-modal-body"
        >
          {/* Saffron Glowing Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-teal-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer focus:outline-none"
            title="Close"
            id="contact-close-btn"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Identity */}
            <div className="text-left space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>RIVA CLIENT COVENANT</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Raise a Public Inquiry</h3>
              <p className="text-xs text-slate-400">
                Your dossier inquiries, correction suggestions, and strategic requests are immediately forwarded to our director desk.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-950/30 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-4"
                  id="contact-success-card"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-white">Inquiry Forwarded Successfully</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your query card has been logged and dispatched. A real-time notification has been securely sent to our desk.
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Our Secretariat / War Room Desk will analyze and address your query within 24 operational hours.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                    id="contact-success-close"
                  >
                    Return to Dossier Grid
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left" id="contact-form">
                  
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="e.g., Rajesh Deshmukh"
                      />
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address *</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="e.g., rajesh@domain.com"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Dropdown for category */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category of Query *</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                      >
                        <option value="General Inquiry & Platform Support">General Inquiry & Platform Support</option>
                        <option value="Minister Profile Discrepancy / Suggestion">Minister Profile Discrepancy / Suggestion</option>
                        <option value="Campaign Advisory Setup / War Room Consultation">Campaign Advisory Setup / War Room Consultation</option>
                        <option value="RIVA Analytical Feedback">RIVA Analytical Feedback</option>
                      </select>
                      <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Subject and optional referenced leader row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Query Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="Brief summary of query"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Referenced Minister (If Any)</label>
                      <input
                        type="text"
                        name="leaderName"
                        value={formData.leaderName}
                        onChange={handleChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="e.g., Nitin Gadkari"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Detailed Query Message *</label>
                    <div className="relative font-sans">
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                        placeholder="Describe your query, suggest a correction, or describe the specific parameters you wish to consult RIVA on..."
                      />
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Errors display */}
                  {errorMsg && (
                    <div className="p-3 bg-red-950/35 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2" id="contact-error">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                      id="contact-cancel-btn"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      id="contact-submit-btn"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Submit Query & Email Alert</span>
                    </button>
                  </div>

                </form>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
