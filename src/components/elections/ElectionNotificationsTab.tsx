import React, { useState, useEffect } from 'react';
import { ElectionNotification, ELECTION_NOTIFICATIONS_DATA } from '../../data/electionsData';
import { electionsDbService } from '../../lib/electionsDbService';
import { Bell, ExternalLink, Calendar, FileText, Search, ShieldCheck } from 'lucide-react';

export default function ElectionNotificationsTab() {
  const [notifications, setNotifications] = useState<ElectionNotification[]>(ELECTION_NOTIFICATIONS_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await electionsDbService.getNotifications();
      if (data && data.length > 0) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Error loading notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Code of Conduct', 'Schedule', 'Press Release', 'Notification'];

  const filteredNotifs = selectedCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Header & Filter bar */}
      <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" /> Election Commission Gazetted Announcements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified official notifications, Model Code of Conduct, press releases & schedules from ECI
            </p>
          </div>

          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200/50">
            Source: eci.gov.in
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Notices' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Notifications Widget List */}
      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {filteredNotifs.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase border border-emerald-200/40">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.published_date}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {item.notification_title}
                </h4>
              </div>

              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-50 dark:bg-white/10 hover:bg-emerald-600 hover:text-white text-slate-600 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
                title="View ECI Source"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.summary}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Source: <strong className="text-slate-700 dark:text-slate-300">{item.source}</strong></span>
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                Download Official PDF / Notice <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
