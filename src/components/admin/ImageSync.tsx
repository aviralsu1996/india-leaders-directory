import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Image as ImageIcon, Upload, Check, AlertCircle, 
  Loader2, RefreshCw, Sparkles, HelpCircle, UserCheck
} from 'lucide-react';
import { dbService, getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { SupabaseLeader } from '../../types';

interface ImageSyncProps {
  onSyncComplete: () => void;
}

export default function ImageSync({ onSyncComplete }: ImageSyncProps) {
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingLeaderId, setSyncingLeaderId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadLeader, setActiveUploadLeader] = useState<SupabaseLeader | null>(null);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const data = await dbService.getLeaders();
      setLeaders(data);
    } catch (err) {
      console.error('Failed to load leaders for image sync:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if an image is a placeholder
  const isPlaceholder = (url?: string) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.includes('placeholder') || 
      lower.includes('avatar') || 
      lower.includes('unsplash.com/photo-1541872703-74c5e44368f9') ||
      lower === ''
    );
  };

  // Calculate stats
  const missingLeaders = leaders.filter(l => isPlaceholder(l.image));
  const completedLeaders = leaders.filter(l => !isPlaceholder(l.image));

  const optimizeAndUploadFile = async (file: File, leader: SupabaseLeader) => {
    setSyncingLeaderId(leader.id);
    setUploadProgress(10);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabase();

    // Compression step: using HTML5 canvas
    const compressImage = (f: File): Promise<Blob> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height = Math.round((height * MAX_SIZE) / width);
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width = Math.round((width * MAX_SIZE) / height);
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => resolve(blob || f), 'image/webp', 0.82);
            } else {
              resolve(f);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(f);
      });
    };

    try {
      setUploadProgress(40);
      const webpBlob = await compressImage(file);
      setUploadProgress(60);

      const fileName = `${leader.slug}-${Date.now()}.webp`;

      let finalPublicUrl = '';

      if (isSupabaseConfigured && supabase) {
        // Upload to storage bucket 'leader-profiles'
        const { error: uploadError } = await supabase.storage
          .from('leader-profiles')
          .upload(fileName, webpBlob, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('leader-profiles')
          .getPublicUrl(fileName);

        finalPublicUrl = publicUrl;

        // Save to database
        await dbService.updateLeader(leader.id, {
          image: finalPublicUrl
        });

      } else {
        // Local state simulation
        finalPublicUrl = URL.createObjectURL(webpBlob);
        
        // Simulating DB update
        setLeaders(prev => prev.map(l => {
          if (l.id === leader.id) {
            return { ...l, image: finalPublicUrl };
          }
          return l;
        }));
      }

      setUploadProgress(100);
      setSuccessMsg(`Successfully synced profile image for ${leader.name}!`);
      
      // Update local state list
      setLeaders(prev => prev.map(l => {
        if (l.id === leader.id) {
          return { ...l, image: finalPublicUrl };
        }
        return l;
      }));

      onSyncComplete(); // Notify parent
    } catch (err: any) {
      console.error('Sync failed:', err);
      setErrorMsg(`Failed to sync image for ${leader.name}: ${err.message || 'Check database connectivity.'}`);
    } finally {
      setTimeout(() => {
        setSyncingLeaderId(null);
        setUploadProgress(0);
        setActiveUploadLeader(null);
      }, 1000);
    }
  };

  const triggerUploadClick = (leader: SupabaseLeader) => {
    setActiveUploadLeader(leader);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadLeader) {
      optimizeAndUploadFile(e.target.files[0], activeUploadLeader);
    }
  };

  return (
    <div className="space-y-6" id="image-sync-root">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Automated Profile Image Sync</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Match leaders lacking authentic portrait photographs and instantly upload verified assets to storage</p>
        </div>
        <button
          onClick={fetchLeaders}
          disabled={loading}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Scan Profiles</span>
        </button>
      </div>

      {/* Sync Counter Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/10">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase leading-none">Total Directory Profiles</p>
            <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{leaders.length}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase leading-none">Completed Image Count</p>
            <p className="text-xl font-black text-emerald-500 mt-1">{completedLeaders.length}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/10">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase leading-none">Missing Profile Images</p>
            <p className="text-xl font-black text-red-500 mt-1">{missingLeaders.length}</p>
          </div>
        </div>
      </div>

      {/* Upload Handler */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Progress Monitor */}
      {syncingLeaderId && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono font-bold flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              Compressing & Binding Public Storage URL to Database...
            </span>
            <span className="text-emerald-400 font-mono font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex gap-2.5 items-start animate-fadeIn">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Missing Images List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Leaders Lacking Custom Artwork ({missingLeaders.length})</h3>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-xs text-slate-400">Analyzing database catalogs...</p>
            </div>
          </div>
        ) : missingLeaders.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-emerald-500/5">
            <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-slate-700 dark:text-slate-200 font-bold">100% Image Sync Achieved!</p>
            <p className="text-xs text-slate-400 mt-1">All leadership listings contain fully authentic profile portrait files</p>
          </div>
        ) : (
          <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
            <div className="max-h-[400px] overflow-y-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-white/1 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider sticky top-0 border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="p-3">Current Photo</th>
                    <th className="p-3">Leader Profile</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Constituency</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {missingLeaders.map((leader) => (
                    <tr key={leader.id} className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all">
                      <td className="p-3 w-16">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <img 
                            src={leader.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100'} 
                            alt={leader.name} 
                            className="w-full h-full object-cover grayscale opacity-60"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{leader.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{leader.designation} • {leader.party}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-[9px] font-bold font-mono text-slate-500">
                          {leader.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {leader.constituency}, {leader.state}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => triggerUploadClick(leader)}
                          disabled={syncingLeaderId !== null}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 ml-auto cursor-pointer transition shadow-sm"
                        >
                          {syncingLeaderId === leader.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Sync Image</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
