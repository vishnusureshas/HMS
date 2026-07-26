'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBillingList, useCreateBilling, useRecordPayment } from '@/hooks/useBilling';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BillingForm } from '@/components/forms/BillingForm';
import { Plus, DollarSign } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Billing, BillingFormData } from '@/types/billing';

const canManage = (role: string | null) => role && ['super_admin', 'admin', 'receptionist'].includes(role);

export default function BillingPage() {
  const { role } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; billingId: string; dueAmount: string }>({ open: false, billingId: '', dueAmount: '0' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const params: Record<string, string> = { page: String(page), limit: '10' };
  if (statusFilter) params.paymentStatus = statusFilter;

  const { data, isLoading } = useBillingList(params);
  const createMutation = useCreateBilling();
  const payMutation = useRecordPayment();

  const handleSubmit = (formData: BillingFormData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setModalOpen(false),
    });
  };

  const handlePayment = () => {
    if (!paymentAmount) return;
    payMutation.mutate({
      id: paymentModal.billingId,
      amount: parseFloat(paymentAmount),
      paymentMethod,
    }, {
      onSuccess: () => {
        setPaymentModal({ open: false, billingId: '', dueAmount: '0' });
        setPaymentAmount('');
      },
    });
  };

  const paymentStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      paid: { variant: 'success', label: 'Paid' },
      partial: { variant: 'warning', label: 'Partial' },
      pending: { variant: 'danger', label: 'Pending' },
      refunded: { variant: 'info', label: 'Refunded' },
    };
    const s = map[status] || { variant: 'info', label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Billing</h1>
        {canManage(role) && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <Table<Billing>
            columns={[
              { header: 'Invoice', accessor: 'invoiceNo' },
              { header: 'Patient', accessor: (b) => b.Patient ? `${b.Patient.firstName} ${b.Patient.lastName}` : '—' },
              { header: 'Total', accessor: (b) => `$${parseFloat(b.total).toLocaleString()}` },
              { header: 'Paid', accessor: (b) => `$${parseFloat(b.paidAmount).toLocaleString()}` },
              { header: 'Due', accessor: (b) => `$${parseFloat(b.dueAmount).toLocaleString()}` },
              { header: 'Status', accessor: (b) => paymentStatusBadge(b.paymentStatus) },
              { header: 'Date', accessor: (b) => formatDate(b.createdAt) },
              ...(canManage(role) ? [{
                header: 'Actions' as const,
                accessor: (b: Billing) => (
                  <div className="flex gap-2">
                    {b.paymentStatus !== 'paid' && b.paymentStatus !== 'refunded' && (
                      <button onClick={() => { setPaymentModal({ open: true, billingId: b.id, dueAmount: b.dueAmount }); setPaymentAmount(b.dueAmount); }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                        <DollarSign className="h-3 w-3" /> Pay
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice" size="lg">
        <BillingForm onSubmit={handleSubmit} loading={createMutation.isPending} />
      </Modal>

      <Modal open={paymentModal.open} onClose={() => setPaymentModal({ open: false, billingId: '', dueAmount: '0' })} title="Record Payment" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="insurance">Insurance</option>
              <option value="online">Online</option>
            </select>
          </div>
          <Button onClick={handlePayment} loading={payMutation.isPending} className="w-full py-2.5">
            Record Payment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
