'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/index';

interface Department {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  Doctors?: { id: string }[];
}

const canManage = (role: string | null) => role === 'super_admin' || role === 'admin';

export default function DepartmentsPage() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Department[]>>('/departments');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; description: string }) => {
      await api.post('/departments', payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department created'); setModalOpen(false); setFormName(''); setFormDesc(''); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/departments/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        {canManage(role) && (
          <Button onClick={() => { setFormName(''); setFormDesc(''); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments?.map((dept) => (
            <Card key={dept.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                    <p className="text-xs text-gray-500">{dept.Doctors?.length || 0} doctors</p>
                  </div>
                </div>
                <Badge variant={dept.isActive ? 'success' : 'danger'}>{dept.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              {dept.description && <p className="text-sm text-gray-500 mt-3">{dept.description}</p>}
              {canManage(role) && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => deleteMutation.mutate(dept.id)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </Card>
          ))}
          {(!departments || departments.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No departments yet</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Department" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input value={formName} onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black resize-none" />
          </div>
          <Button onClick={() => createMutation.mutate({ name: formName, description: formDesc })}
            loading={createMutation.isPending} className="w-full py-2.5">
            Create Department
          </Button>
        </div>
      </Modal>
    </div>
  );
}
