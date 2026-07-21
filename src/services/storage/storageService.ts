import { getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { STORAGE_BUCKET, STORAGE_PATHS } from '../../lib/imageUtils';

export type StorageFolder = keyof typeof STORAGE_PATHS;

export interface UploadOptions {
  folder: StorageFolder;
  fileName: string;
  file: File | Blob;
  contentType?: string;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  path: string;
  publicUrl: string;
  error?: string;
}

export class StorageService {
  readonly bucket = STORAGE_BUCKET;

  getStoragePath(folder: StorageFolder, fileName: string): string {
    const prefix = STORAGE_PATHS[folder];
    return `${prefix}/${fileName}`;
  }

  getPublicUrl(path: string): string {
    const sb = getSupabase();
    if (!sb) return '';
    const { data } = sb.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    if (!isSupabaseConfigured) {
      return { success: false, path: '', publicUrl: '', error: 'Supabase not configured' };
    }

    const sb = getSupabase();
    if (!sb) {
      return { success: false, path: '', publicUrl: '', error: 'Supabase client unavailable' };
    }

    const path = this.getStoragePath(options.folder, options.fileName);
    const { error } = await sb.storage.from(this.bucket).upload(path, options.file, {
      contentType: options.contentType || options.file.type || 'image/webp',
      upsert: options.upsert ?? true,
    });

    if (error) {
      return { success: false, path, publicUrl: '', error: error.message };
    }

    return { success: true, path, publicUrl: this.getPublicUrl(path) };
  }

  async list(folder: StorageFolder, limit = 100): Promise<{ name: string; publicUrl: string }[]> {
    const sb = getSupabase();
    if (!sb) return [];

    const prefix = STORAGE_PATHS[folder];
    const { data, error } = await sb.storage.from(this.bucket).list(prefix, { limit });
    if (error || !data) return [];

    return data
      .filter((item) => item.name && !item.name.startsWith('.'))
      .map((item) => {
        const path = `${prefix}/${item.name}`;
        return { name: item.name, publicUrl: this.getPublicUrl(path) };
      });
  }

  async remove(path: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb) return false;
    const { error } = await sb.storage.from(this.bucket).remove([path]);
    return !error;
  }

  async listAllFolders(): Promise<Record<StorageFolder, { name: string; publicUrl: string }[]>> {
    const folders = Object.keys(STORAGE_PATHS) as StorageFolder[];
    const result = {} as Record<StorageFolder, { name: string; publicUrl: string }[]>;
    for (const folder of folders) {
      result[folder] = await this.list(folder);
    }
    return result;
  }
}

export const storageService = new StorageService();
