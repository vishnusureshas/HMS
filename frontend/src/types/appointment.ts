import type { Patient } from './patient';
import type { Doctor } from './doctor';

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'in_person' | 'video' | 'phone';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  status: AppointmentStatus;
  type: AppointmentType;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  Patient?: Patient;
  Doctor?: Doctor;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  type: AppointmentType;
  notes: string;
}

export const APPOINTMENT_STATUSES: { value: AppointmentStatus; label: string; color: 'success' | 'warning' | 'danger' | 'info' }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'checked_in', label: 'Checked In', color: 'warning' },
  { value: 'in_progress', label: 'In Progress', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
  { value: 'no_show', label: 'No Show', color: 'danger' },
];
