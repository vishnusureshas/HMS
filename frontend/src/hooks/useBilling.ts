import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Billing, BillingFormData } from '@/types/billing';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import { toast } from 'sonner';

export function useBillingList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['billing', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Billing>>('/billing', { params });
      return data;
    },
  });
}

export function useBilling(id: string) {
  return useQuery({
    queryKey: ['billing', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Billing>>(`/billing/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBilling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BillingFormData) => {
      const { data } = await api.post<ApiResponse<Billing>>('/billing', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Invoice created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create invoice');
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, paymentMethod }: { id: string; amount: number; paymentMethod: string }) => {
      const { data } = await api.post<ApiResponse<Billing>>(`/billing/${id}/payment`, { amount, paymentMethod });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      toast.success('Payment recorded successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    },
  });
}
