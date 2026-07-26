'use client';
import { useState, useRef } from 'react';
import { Upload, X, FileAudio } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({
  onUploadComplete,
  accept = 'image/*,audio/*,.pdf',
  maxSize = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > maxSize * 1024 * 1024) {
      toast.error(`File must be under ${maxSize}MB`);
      return;
    }

    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadComplete(data.data.url);
      toast.success('File uploaded successfully');
      setFile(null);
      setPreview(null);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Click to upload</p>
          <p className="text-xs text-gray-400">Images, Audio, PDF (max {maxSize}MB)</p>
        </button>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-32 rounded object-contain" />
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <FileAudio className="h-6 w-6" />
              <span className="text-sm truncate">{file.name}</span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
