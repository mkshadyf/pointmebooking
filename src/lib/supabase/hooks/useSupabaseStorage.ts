'use client';

import { useState } from 'react';
import { supabase } from '../client';


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

export function useSupabaseStorage({
  bucket,
  onError
}: UseSupabaseStorageOptions): UseSupabaseStorageReturn {
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false
  });

  const client = supabase;

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setProgress({ progress: 0, isUploading: true });

      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = client.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress({ progress: 100, isUploading: false });
      return publicUrl;
    } catch (error) {
      setProgress({ progress: 0, isUploading: false });
      onError?.(error as Error);
      return null;
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    try {
      const { error } = await client.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return {
    uploadFile,
    deleteFile,
    progress,
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