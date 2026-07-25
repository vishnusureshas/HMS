'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Users, Stethoscope, Calendar, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.stats;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Patients', value: stats?.totalPatients ?? '—', icon: Users, color: 'text-blue-600' },
    { label: 'Active Doctors', value: stats?.totalDoctors ?? '—', icon: Stethoscope, color: 'text-green-600' },
    { label: "Today's Appointments", value: stats?.todayAppointments ?? '—', icon: Calendar, color: 'text-purple-600' },
    { label: 'Revenue', value: stats?.revenue ? `$${Number(stats.revenue).toLocaleString()}` : '$0', icon: DollarSign, color: 'text-amber-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
