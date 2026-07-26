'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Stethoscope, Calendar,
  FileText, Pill, DollarSign, Building2, Settings,
} from 'lucide-react';

const roleAccess: Record<string, string[]> = {
  Dashboard: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'],
  Patients: ['super_admin', 'admin', 'doctor', 'receptionist'],
  Doctors: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'],
  Appointments: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'],
  'Medical Records': ['super_admin', 'admin', 'doctor', 'patient'],
  Prescriptions: ['super_admin', 'admin', 'doctor', 'patient'],
  Billing: ['super_admin', 'admin', 'receptionist', 'patient'],
  Departments: ['super_admin', 'admin'],
  Settings: ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'],
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/medical-records', label: 'Medical Records', icon: FileText },
  { href: '/prescriptions', label: 'Prescriptions', icon: Pill },
  { href: '/billing', label: 'Billing', icon: DollarSign },
  { href: '/departments', label: 'Departments', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const visibleItems = navItems.filter(
    (item) => role && roleAccess[item.label]?.includes(role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-lg font-bold text-gray-800">HospitalMS</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
