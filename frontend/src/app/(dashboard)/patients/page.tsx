'use client';
import { useState } from 'react';
import { usePatients, useCreatePatient, useDeletePatient } from '@/hooks/usePatients';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PatientForm } from '@/components/forms/PatientForm';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { Patient, PatientFormData } from '@/types/patient';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const { data, isLoading } = usePatients({ search, page: String(page), limit: '10' });
  const createMutation = useCreatePatient();
  const deleteMutation = useDeletePatient();

  const handleSubmit = (formData: PatientFormData) => {
    if (editing) {
      createMutation.mutate(formData, {
        onSuccess: () => { setModalOpen(false); setEditing(null); },
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => { setModalOpen(false); },
      });
    }
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const genderBadge = (gender: string | null) => {
    if (!gender) return '—';
    return <Badge variant={gender === 'male' ? 'info' : gender === 'female' ? 'warning' : 'info'}>{gender}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Patient
        </Button>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search patients by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
          />
        </div>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <Table<Patient>
            columns={[
              { header: 'Name', accessor: (p) => `${p.firstName} ${p.lastName}` },
              { header: 'Gender', accessor: (p) => genderBadge(p.gender) },
              { header: 'Phone', accessor: (p) => p.phone || '—' },
              { header: 'Blood Group', accessor: (p) => p.bloodGroup || '—' },
              { header: 'Email', accessor: (p) => p.User?.email || '—' },
              {
                header: 'Actions',
                accessor: (p) => (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={data?.data || []}
          />
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Page {data.pagination.page} of {data.pagination.pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">Previous</button>
                <button disabled={page >= (data.pagination.pages || 1)} onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Patient' : 'Add Patient'}>
        <PatientForm
          initial={editing ? { firstName: editing.firstName, lastName: editing.lastName, dateOfBirth: editing.dateOfBirth || '', gender: editing.gender || '', phone: editing.phone || '', address: editing.address || '', bloodGroup: editing.bloodGroup || '' } : undefined}
          onSubmit={handleSubmit}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
