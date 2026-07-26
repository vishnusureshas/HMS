'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { AppointmentFormData, AppointmentType } from '@/types/appointment';
import type { ApiResponse } from '@/types/index';
import type { Patient } from '@/types/patient';
import type { Doctor } from '@/types/doctor';
import type { PaginatedResponse } from '@/types/index';

interface Props {
  initial?: Partial<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  loading?: boolean;
}

export function AppointmentForm({ initial, onSubmit, loading }: Props) {
  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Patient>>('/patients', { params: { limit: '200' } });
      return data.data;
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Doctor>>('/doctors', { params: { limit: '200' } });
      return data.data;
    },
  });

  const [form, setForm] = useState<AppointmentFormData>({
    patientId: initial?.patientId || '',
    doctorId: initial?.doctorId || '',
    appointmentDate: initial?.appointmentDate || '',
    type: initial?.type || 'in_person',
    notes: initial?.notes || '',
  });

  const update = (field: keyof AppointmentFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const types: { value: AppointmentType; label: string }[] = [
    { value: 'in_person', label: 'In Person' },
    { value: 'video', label: 'Video Call' },
    { value: 'phone', label: 'Phone Call' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
          <select value={form.patientId} onChange={(e) => update('patientId', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" required>
            <option value="">Select patient</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
          <select value={form.doctorId} onChange={(e) => update('doctorId', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" required>
            <option value="">Select doctor</option>
            {doctors?.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
          <input type="datetime-local" value={form.appointmentDate} onChange={(e) => update('appointmentDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={form.type} onChange={(e) => update('type', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black">
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading} className="w-full py-2.5">
          {initial ? 'Update Appointment' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  );
}
