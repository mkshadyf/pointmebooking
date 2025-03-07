'use client';

import { useState } from 'react';
import { supabaseClientService } from '../services/core/supabase-client.service';

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

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setProgress({ progress: 0, isUploading: true });

      // Get the client
      const client = await supabaseClientService.getBrowserClient();

      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = await client.storage
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
      // Get the client
      const client = await supabaseClientService.getBrowserClient();
      
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
//   const { uploadFile, deleteFile, progress } = useSupabaseStorage({
//     bucket: 'avatars',
//     onError: (error) => console.error('Storage error:', error),
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
//       {progress.isUploading && <progress value={progress.progress} max="100" />}
//     </div>
//   );
// }; 