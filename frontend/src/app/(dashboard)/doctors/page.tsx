'use client';
import { useState } from 'react';
import { useDoctors, useCreateDoctor, useDeleteDoctor } from '@/hooks/useDoctors';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DoctorForm } from '@/components/forms/DoctorForm';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { Doctor, DoctorFormData } from '@/types/doctor';

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);

  const { data, isLoading } = useDoctors({ search, page: String(page), limit: '10' });
  const createMutation = useCreateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleSubmit = (formData: DoctorFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => { setModalOpen(false); setEditing(null); },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Doctor
        </Button>
      </div>

      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search doctors by name or specialization..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
          />
        </div>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <Table<Doctor>
            columns={[
              { header: 'Name', accessor: (d) => `Dr. ${d.firstName} ${d.lastName}` },
              { header: 'Specialization', accessor: (d) => d.specialization || '—' },
              { header: 'Department', accessor: (d) => d.Department?.name || '—' },
              { header: 'License', accessor: (d) => d.licenseNumber || '—' },
              { header: 'Fee', accessor: (d) => d.consultationFee ? `$${d.consultationFee}` : '—' },
              {
                header: 'Status',
                accessor: (d) => <Badge variant={d.isActive ? 'success' : 'danger'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
              },
              {
                header: 'Actions',
                accessor: (d) => (
                  <div className="flex gap-2">
                    <button onClick={() => deleteMutation.mutate(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button disabled={page >= (data.pagination.pages || 1)} onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title="Add Doctor">
        <DoctorForm onSubmit={handleSubmit} loading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
