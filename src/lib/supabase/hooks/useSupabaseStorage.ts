'use client';

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';
import { validateUrl } from '../utils/validators';

interface UseSupabaseStorageProps {
  bucket: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UploadProgress {
  loaded: number;
  total: number;
}

interface UseSupabaseStorageReturn {
  uploadFile: (file: File) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: Error | null;
}

export function useSupabaseStorage({
  bucket,
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: UseSupabaseStorageProps): UseSupabaseStorageReturn {
  const supabase = useSupabaseClient<SupabaseClient>();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validateFile = useCallback(
    (file: File) => {
      if (!file) {
        throw new Error('No file provided');
      }

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        );
      }

      if (file.size > maxSize) {
        throw new Error(
          `File size too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
        );
      }
    },
    [allowedTypes, maxSize]
  );

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      try {
        setError(null);
        setIsUploading(true);
        setProgress({ loaded: 0, total: file.size });

        // Validate file
        validateFile(file);

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file
        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress: { loaded: number; total: number }) => {
              setProgress({
                loaded: progress.loaded,
                total: progress.total,
              });
            },
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        if (!validateUrl(publicUrl)) {
          throw new Error('Invalid public URL generated');
        }

        return publicUrl;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Upload failed'));
        throw err;
      } finally {
        setIsUploading(false);
        setProgress(null);
      }
    },
    [bucket, validateFile, supabase.storage]
  );

  const deleteFile = useCallback(
    async (path: string) => {
      try {
        setError(null);
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([path]);

        if (deleteError) {
          throw deleteError;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Delete failed'));
        throw err;
      }
    },
    [bucket, supabase.storage]
  );

  return {
    uploadFile,
    deleteFile,
    isUploading,
    progress,
    error,
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