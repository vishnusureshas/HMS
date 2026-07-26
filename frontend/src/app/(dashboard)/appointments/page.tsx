'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments, useCreateAppointment, useUpdateAppointmentStatus, useDeleteAppointment } from '@/hooks/useAppointments';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AppointmentForm } from '@/components/forms/AppointmentForm';
import { Plus, Search, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Appointment, AppointmentFormData, AppointmentStatus } from '@/types/appointment';
import { APPOINTMENT_STATUSES } from '@/types/appointment';

const canCreate = (role: string | null) => role && ['super_admin', 'admin', 'receptionist', 'doctor'].includes(role);
const canManageStatus = (role: string | null) => role && ['super_admin', 'admin', 'receptionist', 'doctor'].includes(role);
const canDelete = (role: string | null) => role && ['super_admin', 'admin'].includes(role);

export default function AppointmentsPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const params: Record<string, string> = { page: String(page), limit: '10' };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useAppointments(params);
  const createMutation = useCreateAppointment();
  const updateStatus = useUpdateAppointmentStatus();
  const deleteMutation = useDeleteAppointment();

  const handleSubmit = (formData: AppointmentFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setModalOpen(false),
    });
  };

  const statusBadge = (status: AppointmentStatus) => {
    const s = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return s ? <Badge variant={s.color}>{s.label}</Badge> : <Badge>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        {canCreate(role) && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Appointment
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black">
            <option value="">All Statuses</option>
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <Table<Appointment>
            columns={[
              { header: 'Patient', accessor: (a) => a.Patient ? `${a.Patient.firstName} ${a.Patient.lastName}` : '—' },
              { header: 'Doctor', accessor: (a) => a.Doctor ? `Dr. ${a.Doctor.firstName} ${a.Doctor.lastName}` : '—' },
              { header: 'Date & Time', accessor: (a) => formatDate(a.appointmentDate) },
              { header: 'Type', accessor: (a) => a.type.replace('_', ' ') },
              { header: 'Status', accessor: (a) => statusBadge(a.status) },
              ...(canManageStatus(role) || canDelete(role) ? [{
                header: 'Actions' as const,
                accessor: (a: Appointment) => (
                  <div className="flex gap-2">
                    {canManageStatus(role) && a.status === 'scheduled' && (
                      <button onClick={() => updateStatus.mutate({ id: a.id, status: 'checked_in' })}
                        className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors">
                        Check In
                      </button>
                    )}
                    {canManageStatus(role) && a.status === 'checked_in' && (
                      <button onClick={() => updateStatus.mutate({ id: a.id, status: 'completed' })}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                        Complete
                      </button>
                    )}
                    {canManageStatus(role) && a.status === 'scheduled' && (
                      <button onClick={() => updateStatus.mutate({ id: a.id, status: 'cancelled' })}
                        className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors">
                        Cancel
                      </button>
                    )}
                    {canDelete(role) && (
                      <button onClick={() => deleteMutation.mutate(a.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ),
              }] : []),
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Appointment" size="lg">
        <AppointmentForm onSubmit={handleSubmit} loading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
