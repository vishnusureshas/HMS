import type { User } from './index';

export interface Doctor {
  id: string;
  userId: string;
  departmentId: string | null;
  firstName: string;
  lastName: string;
  specialization: string | null;
  licenseNumber: string | null;
  consultationFee: string | null;
  availableDays: string[] | null;
  availableTime: Record<string, string> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  User?: User;
  Department?: {
    id: string;
    name: string;
  };
}

export interface DoctorFormData {
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  consultationFee: string;
  departmentId: string;
  email?: string;
  password?: string;
}
