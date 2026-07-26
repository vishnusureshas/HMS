'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import type { BillingFormData, BillingItem } from '@/types/billing';
import type { ApiResponse, PaginatedResponse } from '@/types/index';
import type { Patient } from '@/types/patient';

interface Props {
  initial?: Partial<BillingFormData>;
  onSubmit: (data: BillingFormData) => void;
  loading?: boolean;
}

const emptyItem = (): BillingItem => ({ description: '', quantity: 1, unitPrice: 0, amount: 0 });

export function BillingForm({ initial, onSubmit, loading }: Props) {
  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Patient>>('/patients', { params: { limit: '200' } });
      return data.data;
    },
  });

  const [form, setForm] = useState<BillingFormData>({
    patientId: initial?.patientId || '',
    appointmentId: initial?.appointmentId || '',
    items: initial?.items || [emptyItem()],
    subtotal: initial?.subtotal || '0',
    tax: initial?.tax || '0',
    discount: initial?.discount || '0',
    total: initial?.total || '0',
    dueDate: initial?.dueDate || '',
    paymentMethod: initial?.paymentMethod || '',
  });

  const update = (field: keyof BillingFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateItem = (index: number, field: keyof BillingItem, value: any) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].amount = items[index].quantity * items[index].unitPrice;
    }
    setForm((prev) => ({ ...prev, items }));
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    }
  };

  useEffect(() => {
    const subtotal = form.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08;
    const discount = parseFloat(form.discount) || 0;
    const total = subtotal + tax - discount;
    setForm((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    }));
  }, [form.items, form.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Invoice Items</label>
          <button type="button" onClick={addItem}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder="Description" className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black text-sm" />
              <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black text-sm" min={1} />
              <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black text-sm" />
              <span className="text-sm text-gray-600 py-2 w-20 text-right font-medium">${item.amount.toFixed(2)}</span>
              <button type="button" onClick={() => removeItem(i)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${form.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-medium">${form.tax}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-600">Discount</span>
          <input type="number" step="0.01" value={form.discount} onChange={(e) => update('discount', e.target.value)}
            className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black text-sm text-right" />
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>Total</span>
          <span>${form.total}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading} className="w-full py-2.5">
          {initial ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}
