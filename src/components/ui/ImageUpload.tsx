'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from './Button';

export interface ImageUploadProps {
  initialUrl?: string;
  onChange: (file: File) => void | Promise<void>;
  maxSize?: number;
  aspectRatio?: number;
  className?: string;
}

export function ImageUpload({
  initialUrl,
  onChange,
  maxSize = 5,
  aspectRatio,
  className = ''
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(initialUrl || '');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Call onChange handler
      await onChange(file);

      // Clean up preview URL
      return () => URL.revokeObjectURL(objectUrl);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false
  });

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await onDrop([file]);
      }
    };
    input.click();
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <Button onClick={handleClick} variant="outline">
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-sm text-gray-600">Drop the image here...</p>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drag & drop an image here, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Max size: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
