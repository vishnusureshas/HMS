'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Search, Pill } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import type { Patient } from '@/types/patient';

interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  Patient?: Patient;
  Doctor?: { id: string; firstName: string; lastName: string };
}

export default function PrescriptionsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Patient>>('/patients', { params: { limit: '200' } });
      return data.data;
    },
  });

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const { data } = await api.get<ApiResponse<Prescription[]>>(`/prescriptions/patient/${selectedPatientId}`);
      return data.data;
    },
    enabled: !!selectedPatientId,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
      </div>

      <Card className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input placeholder="Search patients..." readOnly
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black min-w-[200px]">
            <option value="">Select a patient</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>
      </Card>

      {!selectedPatientId ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Select a patient to view prescriptions</p>
          </div>
        </Card>
      ) : isLoading ? (
        <PageSpinner />
      ) : (
        <Table<Prescription>
          columns={[
            { header: 'Date', accessor: (p) => formatDate(p.createdAt) },
            {
              header: 'Medicines',
              accessor: (p) => (
                <div className="space-y-1">
                  {p.medicines?.length > 0 ? p.medicines.map((m, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{m.name}</span> — {m.dosage}, {m.frequency} for {m.duration}
                    </div>
                  )) : <span className="text-gray-400">No medicines listed</span>}
                </div>
              ),
            },
            { header: 'Instructions', accessor: (p) => p.instructions || '—' },
            {
              header: 'Doctor',
              accessor: (p) => p.Doctor ? `Dr. ${p.Doctor.firstName} ${p.Doctor.lastName}` : '—',
            },
            {
              header: 'Status',
              accessor: (p) => <Badge variant={p.isActive ? 'success' : 'danger'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>,
            },
          ]}
          data={prescriptions || []}
        />
      )}
    </div>
  );
}
