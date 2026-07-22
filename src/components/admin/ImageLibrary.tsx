import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Trash2, RefreshCw, Check, 
  AlertCircle, X, Grid, List, Loader2, Plus, Copy, ImageDown
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';

interface ImageLibraryProps {
  onSelectImage?: (url: string) => void;
  selectedUrl?: string;
}

interface StoredImage {
  name: string;
  url: string;
  size: number;
  created_at: string;
}

export default function ImageLibrary({ onSelectImage, selectedUrl }: ImageLibraryProps) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStorageImages();
  }, []);

  const fetchStorageImages = async () => {
    if (!isSupabaseConfigured) {
      // Local mock storage list if Supabase isn't connected
      const mockImages = [
        { name: 'narendra_modi.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/The_official_portrait_of_Shri_Narendra_Modi%2C_the_Prime_Minister_of_the_Republic_of_India.jpg', size: 145000, created_at: new Date().toISOString() },
        { name: 'yogi_adityanath.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Yogi_Adityanath_in_2023.jpg', size: 98000, created_at: new Date().toISOString() },
        { name: 'mamata_banerjee.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Mamata_Banerjee_portrait_2019.jpg', size: 120000, created_at: new Date().toISOString() },
        { name: 'nitin_gadkari.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Nitin_Gadkari_Official_Portrait_2024.jpg', size: 135000, created_at: new Date().toISOString() },
        { name: 'amit_shah.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Amit_Shah_Official_Portrait_2024.jpg', size: 110000, created_at: new Date().toISOString() }
      ];
      setImages(mockImages);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = getSupabase();
      
      // List items in 'leader-profiles' bucket
      const { data, error } = await supabase.storage.from('leader-profiles').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

      if (error) {
        // If bucket doesn't exist, try to create it or report
        if (error.message.includes('not found')) {
          setErrorMsg("Storage Bucket 'leader-profiles' was not found. Please create a public bucket named 'leader-profiles' in your Supabase Console.");
        } else {
          setErrorMsg(error.message);
        }
        setImages([]);
        return;
      }

      if (data) {
        const imageList = data.map((item: any) => {
          const { data: { publicUrl } } = supabase.storage.from('leader-profiles').getPublicUrl(item.name);
          return {
            name: item.name,
            url: publicUrl,
            size: item.metadata?.size || 0,
            created_at: item.created_at || new Date().toISOString()
          };
        });
        setImages(imageList);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch images from storage.');
    } finally {
      setLoading(false);
    }
  };

  // Optimize image client-side using Canvas before uploading
  const optimizeImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Standard optimization dimensions: max 800px width/height
          const MAX_SIZE = 800;
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
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file); // Fallback
              }
            }, 'image/webp', 0.82); // Optimize as WebP with 82% quality
          } else {
            resolve(file);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFiles = async (files: FileList) => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(10);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabase();
    if (!isSupabaseConfigured || !supabase) {
      // Offline fallback success simulation
      setTimeout(() => {
        setUploadProgress(60);
        setTimeout(() => {
          setUploadProgress(100);
          const newMockImages: StoredImage[] = Array.from(files).map((file, i) => ({
            name: `mock-${Date.now()}-${i}-${file.name}`,
            url: URL.createObjectURL(file), // Local blob URL for simulation
            size: file.size,
            created_at: new Date().toISOString()
          }));
          setImages(prev => [...newMockImages, ...prev]);
          setSuccessMsg(`Successfully simulated upload of ${files.length} file(s) locally.`);
          setUploading(false);
          setUploadProgress(0);
        }, 600);
      }, 500);
      return;
    }

    try {
      let completedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Ensure image format is supported
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          setErrorMsg(`Unsupported file format: ${file.name}. Please upload JPG, PNG or WEBP.`);
          continue;
        }

        let uploadData: Blob | File = file;
        let fileExtension = file.name.split('.').pop() || 'jpg';
        let uploadName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${optimizeImages ? 'webp' : fileExtension}`;

        if (optimizeImages) {
          uploadData = await optimizeImageFile(file);
        }

        setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));

        const { data, error } = await supabase.storage
          .from('leader-profiles')
          .upload(uploadName, uploadData, {
            contentType: optimizeImages ? 'image/webp' : file.type,
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw error;
        }
        completedCount++;
      }

      setUploadProgress(100);
      setSuccessMsg(`Uploaded ${completedCount} image(s) successfully directly to Supabase Storage.`);
      fetchStorageImages();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload files. Verify your Supabase Storage rules or bucket configuration.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFiles(e.target.files);
    }
  };

  const handleDeleteImage = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Supabase Storage?`)) return;

    if (!isSupabaseConfigured) {
      setImages(prev => prev.filter(img => img.name !== name));
      setSuccessMsg(`Deleted local mock image ${name}.`);
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.storage.from('leader-profiles').remove([name]);
      if (error) throw error;
      
      setSuccessMsg(`Deleted "${name}" successfully.`);
      fetchStorageImages();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete file.');
    }
  };

  const handleCopyLink = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" id="image-library-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Image Asset Library</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Upload, optimize, and manage leader profile photographs directly in Supabase Storage buckets</p>
        </div>
        <button
          onClick={fetchStorageImages}
          disabled={loading}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Upload Drag and Drop box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' 
            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/1 bg-opacity-40'
        }`}
        id="drag-upload-container"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          id="multiple-file-uploader"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-500/20">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Drag & Drop profile pictures here, or <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer underline hover:text-emerald-500" onClick={() => fileInputRef.current?.click()}>browse files</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Accepts JPG, PNG, WEBP files. Multiple upload supported.</p>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="optimize-check"
              checked={optimizeImages}
              onChange={(e) => setOptimizeImages(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/10 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="optimize-check" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              Auto-compress and convert to optimized WebP format (Highly Recommended)
            </label>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono font-bold flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              Compressing & Uploading directly to Storage...
            </span>
            <span className="text-emerald-400 font-mono font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Notification Banners */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-normal">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex gap-2.5 items-start">
          <Check className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
          <p className="leading-normal">{successMsg}</p>
        </div>
      )}

      {!isSupabaseConfigured && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Sandbox Mode:</span> Supabase is not configured yet. Uploads will be simulated locally and profile photos will use temporary client-side mock assets.
          </div>
        </div>
      )}

      {/* Media Files Grid */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">All Uploaded Photos ({images.length})</h3>
        
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-xs text-slate-400">Loading catalog assets...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/20 dark:bg-white/1 bg-opacity-20">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-slate-500 font-bold">No images uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload a photo to start populating your profile directory database</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div 
                key={img.name} 
                className={`group relative rounded-2xl overflow-hidden border transition-all bg-white dark:bg-[#040807] ${
                  selectedUrl === img.url 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/25 scale-95 shadow-md' 
                    : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md'
                }`}
              >
                {/* Image Preview Window */}
                <div className="aspect-square bg-slate-900 overflow-hidden relative flex items-center justify-center">
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  
                  {/* Hover Quick Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleCopyLink(img.url, img.name)}
                        className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg transition-all"
                        title="Copy Public URL"
                      >
                        {copiedName === img.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.name)}
                        className="p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg transition-all"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {onSelectImage && (
                      <button
                        onClick={() => onSelectImage(img.url)}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg tracking-wider uppercase transition-all"
                      >
                        Select Profile Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-2.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate" title={img.name}>{img.name}</p>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 flex justify-between">
                    <span>{formatSize(img.size)}</span>
                    <span>{new Date(img.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
