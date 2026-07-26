import type { User } from './index';

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  address: string | null;
  bloodGroup: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  User?: User;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  bloodGroup: string;
}
