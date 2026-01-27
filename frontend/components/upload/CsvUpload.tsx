'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api';
import { useClassificationStore } from '@/store/classificationStore';

export default function CsvUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSession = useClassificationStore((state) => state.setSession);

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await APIClient.uploadCSV(file);

      // Set session in store
      setSession(
        response.session_id,
        response.first_batch,
        response.total_websites
      );

      // Navigate to classification page
      router.push(`/classify/${response.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded
          p-16 text-center cursor-pointer
          transition-colors
          ${
            isDragging
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div>
            <p className="text-base text-gray-900 font-medium">
              {isUploading ? 'Uploading...' : 'Drop CSV file here'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              or click to select a file
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 mt-4">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-2">Requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>CSV file with a column containing website URLs</li>
          <li>Column can be named: url, URL, website, domain, or link</li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
}
