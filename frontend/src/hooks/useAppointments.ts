import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Appointment, AppointmentFormData, AppointmentStatus } from '@/types/appointment';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import { toast } from 'sonner';

export function useAppointments(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Appointment>>('/appointments', { params });
      return data;
    },
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AppointmentFormData) => {
      const { data } = await api.post<ApiResponse<Appointment>>('/appointments', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create appointment');
    },
  });
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AppointmentFormData>) => {
      const { data } = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Appointment updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update appointment');
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { data } = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete appointment');
    },
  });
}
