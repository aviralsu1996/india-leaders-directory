import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Copy, Check, Info, FileText, Award, HelpCircle, Instagram, Twitter, Youtube, TrendingUp, Zap } from 'lucide-react';

export default function GeminiStrategist() {
  const [party, setParty] = useState('bjp');
  const [constituency, setConstituency] = useState('Lucknow East');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [themes, setThemes] = useState('Employment opportunities, clean drinking water, women empowerment, smart public parks');
  const [opponent, setOpponent] = useState('Incumbent complacency, slow infrastructure deployment, inaccessible leaders');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [instagram, setInstagram] = useState('https://instagram.com/candidate_official');
  const [twitter, setTwitter] = useState('https://x.com/candidate_official');
  const [youtube, setYoutube] = useState('https://youtube.com/@candidate_channel');
  const [boosterPrompt, setBoosterPrompt] = useState('Audit my digital brand presence and suggest platform-specific booster tactics to double youth engagement.');

  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'manifesto' | 'speech' | 'booster' | 'custom'>('manifesto');

  const partiesOptions = [
    { value: 'bjp', label: 'Bharatiya Janata Party (BJP)' },
    { value: 'inc', label: 'Indian National Congress (INC)' },
    { value: 'aap', label: 'Aam Aadmi Party (AAP)' },
    { value: 'tmc', label: 'All India Trinamool Congress (TMC)' },
    { value: 'independent', label: 'Independent / Alliance Candidate' }
  ];

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateStrategy = async (type: 'manifesto' | 'speech' | 'booster' | 'custom') => {
    setLoading(true);
    setError(null);
    setOutput('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          party: partiesOptions.find(p => p.value === party)?.label || party,
          constituency,
          stateName,
          keyThemes: themes,
          opponentInfo: opponent,
          instagram: type === 'booster' ? instagram : undefined,
          twitter: type === 'booster' ? twitter : undefined,
          youtube: type === 'booster' ? youtube : undefined,
          prompt: type === 'custom' ? customPrompt : (type === 'booster' ? boosterPrompt : undefined)
        })
      });

      const data = await response.json();
      if (data.success) {
        setOutput(data.text);
      } else {
        setError(data.message || 'Gemini strategist is currently offline. Please configure a valid GEMINI_API_KEY under Settings > Secrets.');
      }
    } catch (err: any) {
      setError('Failed to contact political strategy AI server. Please make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-xl" id="gemini-strategist-panel">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-red-950 p-6 md:p-8 border-b border-slate-800 relative">
        {/* Glow */}
        <div className="absolute right-10 top-5 w-48 h-48 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-start md:items-center gap-4 relative z-10">
          <div className="p-3 bg-red-600 rounded-xl text-white shadow-lg shadow-red-900/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-900 text-[10px] tracking-wider uppercase font-mono font-bold rounded-full">
              RIVA proprietary AI Node
            </span>
            <h3 className="text-2xl font-bold font-sans tracking-tight mt-1">
              RIVA AI Campaign Strategist & Manifesto Draft Builder
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Engineered using the Google Gemini model and pre-trained with 25 successful Indian assembly campaigns. Draft localized manifestos, high-impact slogans, and crowd-rally speech outlines in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Inputs Panel (Left) */}
        <div className="lg:col-span-5 p-6 md:p-8 border-r border-slate-800 bg-slate-950">
          {/* Tab Selection */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab('manifesto')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all duration-150 text-center ${
                activeTab === 'manifesto' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Manifesto
            </button>
            <button
              onClick={() => setActiveTab('speech')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all duration-150 text-center ${
                activeTab === 'speech' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Rally Speech
            </button>
            <button
              onClick={() => setActiveTab('booster')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all duration-150 text-center ${
                activeTab === 'booster' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Social Booster
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded transition-all duration-150 text-center ${
                activeTab === 'custom' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              4. Ask RIVA
            </button>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Select Candidate Party Line
              </label>
              <select
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 font-sans"
              >
                {partiesOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  State Name
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="e.g. West Bengal"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                  Constituency
                </label>
                <input
                  type="text"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="e.g. Lucknow East"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'manifesto' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  key="manifesto-form"
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
                      <span>Key Local Themes & Slogans</span>
                      <span className="text-[10px] text-red-400 font-normal">Highly Targeted</span>
                    </label>
                    <textarea
                      value={themes}
                      onChange={(e) => setThemes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 leading-relaxed"
                      placeholder="e.g., Youth employment, subsidized women public transport, drinking water channels"
                    />
                  </div>
                  <button
                    onClick={() => generateStrategy('manifesto')}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-sans font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Analyzing clusters...' : 'Generate AI Slogans & Slatelines'}
                    <Send className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {activeTab === 'speech' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  key="speech-form"
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Opponent Weaknesses or Strategic Advantage
                    </label>
                    <textarea
                      value={opponent}
                      onChange={(e) => setOpponent(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 leading-relaxed"
                      placeholder="e.g., Inaccessible MLAs, poor roads during monsoon, long load-shedding hours"
                    />
                  </div>
                  <button
                    onClick={() => generateStrategy('speech')}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-sans font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Synthesizing speech outline...' : 'Draft Strategic Speech Outline'}
                    <FileText className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {activeTab === 'booster' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  key="booster-form"
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span>Instagram Profile Link</span>
                    </label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      placeholder="https://instagram.com/candidate_official"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>X (Twitter) Profile Link</span>
                    </label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      placeholder="https://x.com/candidate_official"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>YouTube Channel Link</span>
                    </label>
                    <input
                      type="url"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      placeholder="https://youtube.com/@candidate_channel"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      Target Audit Focus & Prompts
                    </label>
                    <textarea
                      value={boosterPrompt}
                      onChange={(e) => setBoosterPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 leading-relaxed"
                      placeholder="e.g. Focus on clean energy, target young first-time voters with custom hooks."
                    />
                  </div>

                  <button
                    onClick={() => generateStrategy('booster')}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 disabled:bg-slate-800 text-white font-sans font-bold rounded-xl text-xs transition-all duration-200 shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 mt-2"
                  >
                    {loading ? 'Performing profile audits...' : 'Generate Profile Audit & Boost Strategy'}
                    <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {activeTab === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  key="custom-form"
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Ask CEO Raghavan Iyer Anything
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 leading-relaxed"
                      placeholder="e.g. Provide a digital campaign crisis protocol for handling a viral edited opposition clip on Twitter."
                    />
                  </div>
                  <button
                    onClick={() => generateStrategy('custom')}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-sans font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Drafting crisis memo...' : 'Ask RIVA Strategy Adviser'}
                    <Award className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p>
                RIVA AI requires your Gemini API secret configuration. If you haven't set your secret, you can preview the structured layout and form controls immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Output Panel (Right) */}
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-slate-900 relative">
          {/* Output header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <span className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">
              STRATEGY MEMORANDUM OUTLINE
            </span>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white py-1 px-2.5 bg-slate-800 border border-slate-700 rounded-lg transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Draft'}</span>
              </button>
            )}
          </div>

          {/* Core scrollable content area */}
          <div className="flex-1 min-h-[300px] max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">Analyzing demographic maps...</p>
                  <p className="text-xs text-slate-500 font-mono">RIVA INTEL CORRELATION IN PROGRESS</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950 rounded-xl border border-red-900/30">
                <HelpCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-sm font-bold text-red-400">{error}</p>
                <p className="text-xs text-slate-400 mt-2 max-w-md">
                  To activate real-time Gemini strategic suggestions, copy your Google AI Studio API Key and paste it inside the **Secrets / API Keys** menu in the top-right Settings panel.
                </p>
              </div>
            ) : output ? (
              <div className="text-left whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed space-y-4 select-text">
                {output}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-sm font-bold text-slate-400">Strategizer Standby</p>
                <p className="text-xs max-w-sm mt-1">
                  Fill in the constituency metrics on the left, click generating triggers, and let Gemini draft your next victory plan.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>RIVA Core Agent v2.4.0</span>
            <span>Secure Enterprise SSL Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
