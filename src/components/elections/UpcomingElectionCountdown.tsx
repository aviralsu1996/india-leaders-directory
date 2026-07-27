import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Vote, MapPin, ChevronRight, Bell, ShieldCheck, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { ElectionRecord } from '../../data/electionsData';

interface UpcomingElectionCountdownProps {
  elections: ElectionRecord[];
  onSelectElection?: (slug: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: boolean;
}

// Fallback target date generator if exact date string isn't standard ISO
function parseTargetDate(election: ElectionRecord): Date {
  if (election.polling_date) {
    const parsed = new Date(election.polling_date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (election.official_schedule) {
    const parsed = new Date(election.official_schedule);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  // Default estimates based on state & expected year/month
  const year = election.election_year || election.year || 2026;
  const monthStr = (election.expected_month || '').toLowerCase();

  let monthIdx = 3; // April default
  if (monthStr.includes('jan')) monthIdx = 0;
  else if (monthStr.includes('feb')) monthIdx = 1;
  else if (monthStr.includes('mar')) monthIdx = 2;
  else if (monthStr.includes('apr')) monthIdx = 3;
  else if (monthStr.includes('may')) monthIdx = 4;
  else if (monthStr.includes('jun')) monthIdx = 5;
  else if (monthStr.includes('jul')) monthIdx = 6;
  else if (monthStr.includes('aug')) monthIdx = 7;
  else if (monthStr.includes('sep')) monthIdx = 8;
  else if (monthStr.includes('oct')) monthIdx = 9;
  else if (monthStr.includes('nov')) monthIdx = 10;
  else if (monthStr.includes('dec')) monthIdx = 11;

  // Set target date to 15th of expected month
  return new Date(year, monthIdx, 15, 8, 0, 0);
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isPast: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(difference / 1000),
    isPast: false
  };
}

export default function UpcomingElectionCountdown({ elections, onSelectElection }: UpcomingElectionCountdownProps) {
  // Filter upcoming elections
  const upcomingElections = elections.filter(
    e => e.status === 'Official Schedule' || e.status === 'Tentative' || e.status === 'Official'
  );

  const [selectedElectionId, setSelectedElectionId] = useState<string>('');

  useEffect(() => {
    if (upcomingElections.length > 0 && !selectedElectionId) {
      setSelectedElectionId(upcomingElections[0].id);
    }
  }, [elections]);

  const activeElection = upcomingElections.find(e => e.id === selectedElectionId) || upcomingElections[0] || elections[0];

  const [targetDate, setTargetDate] = useState<Date>(() => activeElection ? parseTargetDate(activeElection) : new Date());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    if (activeElection) {
      const parsedDate = parseTargetDate(activeElection);
      setTargetDate(parsedDate);
      setTimeLeft(calculateTimeLeft(parsedDate));
    }
  }, [selectedElectionId, activeElection]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!activeElection) return null;

  const electionTitle = activeElection.title || `${activeElection.state} Legislative Assembly Election ${activeElection.election_year || 2026}`;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden space-y-6">
      {/* Background glow / ambient radial lights */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Badge & Dropdown Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Poll Countdown
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 font-bold text-xs flex items-center gap-1 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official ECI Schedule Data
          </span>
        </div>

        {/* Upcoming Elections Selector Dropdown */}
        {upcomingElections.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium hidden sm:inline">Track Poll:</label>
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="bg-slate-800/90 text-slate-100 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {upcomingElections.map((elec) => (
                <option key={elec.id} value={elec.id}>
                  {elec.state} ({elec.election_year || elec.year || 2026})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Election Headline & Meta */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <MapPin className="w-4 h-4" /> {activeElection.state} • {activeElection.election_type || activeElection.type || 'Assembly Election'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {electionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
            <span>📅 Target Polling Date: <strong className="text-emerald-300">{targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
            <span>•</span>
            <span>🏛️ Total Assembly Seats: <strong className="text-white">{activeElection.assembly_seats || activeElection.total_seats || 126} Seats</strong></span>
          </p>
        </div>

        {/* Action Button */}
        {activeElection.slug && (
          <button
            onClick={() => onSelectElection && onSelectElection(activeElection.slug!)}
            className="self-start lg:self-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            Explore Election Dossier <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Ticker Digit Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Days Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 text-center hover:border-emerald-500/50 transition-all group">
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors font-mono">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
            Days Remaining
          </span>
        </div>

        {/* Hours Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 text-center hover:border-emerald-500/50 transition-all group">
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors font-mono">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
            Hours
          </span>
        </div>

        {/* Minutes Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 text-center hover:border-emerald-500/50 transition-all group">
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
            Minutes
          </span>
        </div>

        {/* Seconds Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-500/40 text-center hover:border-emerald-400 transition-all group relative overflow-hidden">
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-emerald-400 font-mono">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mt-1">
            Seconds
          </span>
        </div>
      </div>

      {/* Key Electoral Metrics Strip */}
      <div className="relative z-10 pt-2 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Status: <strong className="text-white">{activeElection.status}</strong></span>
        </div>
        <div>
          <span>Governing Party: <strong className="text-emerald-300">{activeElection.winning_party || activeElection.current_governing_party || 'NDA / UPA / Incumbent'}</strong></span>
        </div>
        <div>
          <span>ECI Official Portal: </span>
          <a
            href={activeElection.eci_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-1 ml-1"
          >
            eci.gov.in <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
