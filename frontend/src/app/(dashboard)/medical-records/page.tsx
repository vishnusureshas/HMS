'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { Search, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import type { Patient } from '@/types/patient';

interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  diagnosis: string | null;
  symptoms: string | null;
  notes: string | null;
  createdAt: string;
  Patient?: Patient;
  Doctor?: { id: string; firstName: string; lastName: string };
}

export default function MedicalRecordsPage() {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Patient>>('/patients', { params: { limit: '200' } });
      return data.data;
    },
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-records', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const { data } = await api.get<ApiResponse<MedicalRecord[]>>(`/medical-records/patient/${selectedPatientId}`);
      return data.data;
    },
    enabled: !!selectedPatientId,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
      </div>

      <Card className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" />
          </div>
          <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black min-w-[200px]">
            <option value="">Select a patient</option>
            {patients?.filter((p) => !search || `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()))
              .map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
          </select>
        </div>
      </Card>

      {!selectedPatientId ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Select a patient to view records</p>
          </div>
        </Card>
      ) : isLoading ? (
        <PageSpinner />
      ) : (
        <Table<MedicalRecord>
          columns={[
            { header: 'Date', accessor: (r) => formatDate(r.createdAt) },
            { header: 'Diagnosis', accessor: (r) => r.diagnosis || '—' },
            { header: 'Symptoms', accessor: (r) => r.symptoms || '—' },
            { header: 'Notes', accessor: (r) => r.notes || '—' },
            {
              header: 'Doctor',
              accessor: (r) => r.Doctor ? `Dr. ${r.Doctor.firstName} ${r.Doctor.lastName}` : '—',
            },
          ]}
          data={records || []}
        />
      )}
    </div>
  );
}
