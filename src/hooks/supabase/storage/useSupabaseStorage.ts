'use client';

import { supabase } from '@/lib/supabase/client/browser';
import { useState } from 'react';

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

export interface UseSupabaseStorageOptions {
  bucket: string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export interface UseSupabaseStorageReturn {
  uploadFile: (file: File) => Promise<string | null>;
  deleteFile: (path: string) => Promise<void>;
  progress: UploadProgress;
}

/**
 * Hook for interacting with Supabase Storage
 * @param options Storage options including bucket name and callbacks
 * @returns Object with upload and delete functions, plus progress state
 */
export function useSupabaseStorage({
  bucket,
  onProgress,
  onError
}: UseSupabaseStorageOptions): UseSupabaseStorageReturn {
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false
  });

  /**
   * Upload a file to Supabase Storage
   * @param file The file to upload
   * @returns The public URL of the uploaded file, or null if upload failed
   */
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setProgress({ progress: 0, isUploading: true });
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Set progress to 50% to indicate upload started
      setProgress({ progress: 50, isUploading: true });
      if (onProgress) onProgress(50);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      // Set progress to 100% to indicate upload completed
      setProgress({ progress: 100, isUploading: false });
      if (onProgress) onProgress(100);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      setProgress({ progress: 0, isUploading: false });
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      return null;
    }
  };

  /**
   * Delete a file from Supabase Storage
   * @param path The path of the file to delete
   */
  const deleteFile = async (path: string): Promise<void> => {
    try {
      // Extract the file path from the URL if it's a full URL
      const filePath = path.includes(bucket) 
        ? path.split(`${bucket}/`)[1] 
        : path;
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  return {
    uploadFile,
    deleteFile,
    progress
  };
}

// Example usage:
// const MyComponent = () => {
//   const { uploadFile, uploading, progress } = useSupabaseStorage({
//     bucket: 'avatars',
//     maxSize: 2 * 1024 * 1024, // 2MB
//     allowedFileTypes: ['image/jpeg', 'image/png'],
//   });
//
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       try {
//         const url = await uploadFile(file);
//         console.log('Uploaded file URL:', url);
//       } catch (error) {
//         console.error('Upload failed:', error);
//       }
//     }
//   };
//
//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       {uploading && <progress value={progress?.progress} max="100" />}
//     </div>
//   );
// }; 