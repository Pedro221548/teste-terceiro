export type UserRole = 'AGENCY' | 'MANAGER' | 'EMPLOYEE';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  cpf: string;
  birthDate: string;
  photoUrl?: string;
  docUrl?: string;
  rating: number; // 1 to 5
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  complaints: number;
}

export interface Client {
  id: string;
  name: string;
  managerName: string;
}

export interface Assignment {
  id: string;
  employeeId: string;
  clientId: string;
  date: string;
  value: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface Feedback {
  id: string;
  assignmentId: string;
  employeeId: string;
  managerId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  status: 'PENDING' | 'CONTACTED';
  date: string;
}

export interface AccessPoint {
  id: string;
  managerName: string;
  location: string;
  qrCodeValue: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  employeeId: string;
  accessPointId: string;
  timestamp: string;
  photoUrl: string;
}
