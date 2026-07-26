import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const { data } = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.data.map((f: any) => f.url);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
      return [];
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploadMultiple, uploading };
}
