export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'receptionist' | 'patient';
  isActive: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface SelectOption {
  label: string;
  value: string;
}
