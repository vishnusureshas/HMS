'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { PatientFormData } from '@/types/patient';

interface Props {
  initial?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
  loading?: boolean;
}

export function PatientForm({ initial, onSubmit, loading }: Props) {
  const [form, setForm] = useState<PatientFormData>({
    firstName: initial?.firstName || '',
    lastName: initial?.lastName || '',
    dateOfBirth: initial?.dateOfBirth || '',
    gender: initial?.gender || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    bloodGroup: initial?.bloodGroup || '',
  });

  const update = (field: keyof PatientFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select value={form.gender} onChange={(e) => update('gender', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black">
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea value={form.address} onChange={(e) => update('address', e.target.value)} rows={2}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading} className="w-full py-2.5">
          {initial ? 'Update Patient' : 'Create Patient'}
        </Button>
      </div>
    </form>
  );
}
