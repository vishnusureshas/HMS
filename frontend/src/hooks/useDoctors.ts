import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Doctor, DoctorFormData } from '@/types/doctor';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import { toast } from 'sonner';

export function useDoctors(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Doctor>>('/doctors', { params });
      return data;
    },
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DoctorFormData) => {
      const { data } = await api.post<ApiResponse<Doctor>>('/doctors', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create doctor');
    },
  });
}

export function useUpdateDoctor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DoctorFormData>) => {
      const { data } = await api.put<ApiResponse<Doctor>>(`/doctors/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      qc.invalidateQueries({ queryKey: ['doctor', id] });
      toast.success('Doctor updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update doctor');
    },
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/doctors/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete doctor');
    },
  });
}
