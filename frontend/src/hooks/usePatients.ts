import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Patient, PatientFormData } from '@/types/patient';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import { toast } from 'sonner';

export function usePatients(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Patient>>('/patients', { params });
      return data;
    },
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PatientFormData) => {
      const { data } = await api.post<ApiResponse<Patient>>('/patients', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create patient');
    },
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<PatientFormData>) => {
      const { data } = await api.put<ApiResponse<Patient>>(`/patients/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: ['patient', id] });
      toast.success('Patient updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update patient');
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete patient');
    },
  });
}
