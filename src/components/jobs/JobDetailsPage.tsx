import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Building, MapPin, Calendar, Clock, ExternalLink, 
  FileText, Bookmark, Share2, CheckCircle2, AlertTriangle, XCircle, 
  Check, Copy, Award, Shield, DollarSign, GraduationCap, Users, Briefcase
} from 'lucide-react';
import { Job } from '../../types';
import { dbService } from '../../lib/supabaseClient';

interface JobDetailsPageProps {
  slug: string;
  onBack: () => void;
  onSelectJob: (slug: string) => void;
}

export default function JobDetailsPage({ slug, onBack, onSelectJob }: JobDetailsPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await dbService.getJobBySlug(slug);
        setJob(data);

        if (data) {
          const allJobs = await dbService.getJobs();
          const related = allJobs.filter(j => j.slug !== slug && (j.category === data.category || j.organization === data.organization)).slice(0, 3);
          setRelatedJobs(related);
        }

        // Check bookmarks
        const bookmarks = JSON.parse(localStorage.getItem('know_your_minister_job_bookmarks') || '[]');
        if (data && bookmarks.includes(data.id)) {
          setBookmarked(true);
        } else {
          setBookmarked(false);
        }
      } catch (err) {
        console.error('Error loading job details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title || 'Government Job Notification',
          text: `Check out this verified government job notification: ${job?.title}`,
          url
        });
        return;
      } catch (e) {
        // Fallback to copy
      }
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmark = () => {
    if (!job) return;
    const bookmarks: string[] = JSON.parse(localStorage.getItem('know_your_minister_job_bookmarks') || '[]');
    let updated: string[] = [];
    if (bookmarks.includes(job.id)) {
      updated = bookmarks.filter(id => id !== job.id);
      setBookmarked(false);
    } else {
      updated = [...bookmarks, job.id];
      setBookmarked(true);
    }
    localStorage.setItem('know_your_minister_job_bookmarks', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3 font-mono text-xs text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Fetching recruitment notification details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-12 rounded-3xl text-center space-y-4 text-left">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recruitment Notification Not Found</h2>
        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
          The government job notification you are looking for may have expired or been relocated.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
        >
          Return to Jobs Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 text-left">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>

        <div className="flex items-center gap-2">
          
          <button
            onClick={toggleBookmark}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              bookmarked 
                ? 'bg-amber-500 text-white border-amber-500' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark Job'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
            title="Share Job Notification"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share'}</span>
          </button>

        </div>
      </div>

      {/* HERO / MAIN TITLE HEADER */}
      <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 space-y-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider ${
              job.category === 'Central' 
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/40' 
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/40'
            }`}>
              {job.category} Government
            </span>
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {job.state}
            </span>
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50">
              {job.employment_type}
            </span>
            {job.notification_number && (
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/30">
                Notice No: {job.notification_number}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white font-display leading-tight">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
              <Building className="w-4 h-4 text-emerald-500" />
              <span>{job.organization}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span>{job.department}</span>
            </div>
          </div>

          {/* Quick CTA row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={job.official_apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>Apply Now (Official Website)</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {job.notification_pdf && (
              <a
                href={job.notification_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Official Notification PDF</span>
              </a>
            )}

            {job.official_website && (
              <a
                href={job.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Department Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>
      </div>

      {/* KEY SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Parameters */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white font-mono uppercase tracking-wider border-b border-slate-100 dark:border-slate-900 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span>Job Specifications & Eligibility</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Total Vacancies
                </p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {job.vacancies.toLocaleString('en-IN')} Posts
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Salary / Pay Scale
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {job.salary}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Educational Qualification
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {job.qualification}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Age Limit
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {job.age_limit}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Experience Required
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {job.experience}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Application Fee
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {job.application_fee || 'As per official advertisement'}
                </p>
              </div>

            </div>

            {/* Description */}
            {job.description && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Overview & Role Description
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}

            {/* Selection Process */}
            {job.selection_process && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Selection Process
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {job.selection_process}
                </p>
              </div>
            )}

            {/* Required Documents */}
            {job.required_documents && job.required_documents.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-900">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Required Verification Documents
                </h3>
                <ul className="space-y-2">
                  {job.required_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

        {/* Right 1 Col: Important Dates & Portal Details */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white font-mono uppercase tracking-wider border-b border-slate-100 dark:border-slate-900 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Important Timeline Dates</span>
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-0.5 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Application Start Date
                </span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">
                  {job.application_start}
                </span>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl space-y-0.5 border border-amber-500/20">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold block">
                  Application Last Date
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">
                  {job.application_end}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={job.official_apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Official Apply Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                * Re-directed straight to verified government recruitment portal. Never third party.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* RELATED JOBS */}
      {relatedJobs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900">
          <h2 className="text-lg font-black text-slate-800 dark:text-white font-display">
            Related Recruitment Opportunities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedJobs.map((rJob) => (
              <div
                key={rJob.id}
                onClick={() => onSelectJob(rJob.slug)}
                className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-5 rounded-2xl hover:border-emerald-500/30 transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase">
                    {rJob.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    {rJob.vacancies} Vacancies
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {rJob.title}
                </h3>

                <p className="text-[11px] text-slate-400 truncate">
                  {rJob.organization}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
