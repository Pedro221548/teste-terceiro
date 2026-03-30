export type UserRole = 'AGENCY' | 'COMPANY' | 'EMPLOYEE' | 'REGISTRATION' | 'COMPANY_REGISTRATION';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  personalEmail?: string;
  loginEmail?: string;
  password?: string;
  lgpdAuthorized: boolean;
  username?: string;
  photoUrl?: string;
  docUrl?: string;
  rating: number; // 1 to 5
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  complaints: number;
  lastAssignmentDate?: string;
  unavailableDates?: string[];
}

export interface Client {
  id: string;
  name: string;
  managerName: string;
  location?: string;
  activeScales?: number;
}

export interface Company {
  id: string;
  name: string;
  responsibleName: string;
  cnpj?: string;
  phone: string;
  email: string;
  address?: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  companyId: string;
  clientId?: string; // Link to the Client document for staffing
  name: string;
  managerName: string;
  location: string;
  login?: string;
  password?: string;
  createdAt: string;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  unitId?: string;
  fullName: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: 'COMPANY';
  createdAt: string;
}

export interface Assignment {
  id: string;
  employeeId: string;
  clientId: string;
  date: string;
  value: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  confirmed?: boolean;
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

export interface PricingConfig {
  type: 'STARS' | 'DAILY';
  stars: Record<string, { employee: number, company: number }>;
  weekly: Record<string, { employee: number, company: number }>;
}

export interface CompanyRequest {
  id: string;
  companyId: string;
  clientId: string;
  employeeIds: string[];
  quantity: number;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface EmployeeRegistration {
  id: string;
  firstName: string;
  lastName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  personalEmail: string;
  lgpdAuthorized: boolean;
  photoUrl?: string;
  docUrl?: string;
  status: 'PENDING' | 'PROCESSED';
  createdAt: string;
}
