export type UserRole = 'ADMIN' | 'AGENCY' | 'COMPANY' | 'EMPLOYEE' | 'REGISTRATION' | 'COMPANY_REGISTRATION' | 'AGENCY_REGISTRATION';

export interface Agency {
  id: string;
  name: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  stateRegistration?: string; // Inscrição Estadual
  openingDate: string;
  segment: string[]; // Segmento (ex: logística, construção, limpeza)
  
  // Endereço
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };

  // Responsável Legal
  responsibleName: string;
  responsibleCpf: string;
  responsibleRole: string; // Cargo
  phone: string;
  email: string;

  // Documentação
  documents?: {
    cnpjCard?: string;
    socialContract?: string;
    responsibleDoc?: string;
    addressProof?: string;
  };

  status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  pricing?: PricingConfig;
  ratingLabel?: string;
  
  // Operational Capacity
  employeeCount?: number;
  regime?: 'CLT' | 'TEMPORARY' | 'BOTH';
  regions?: string[];
  shifts?: ('DIURNO' | 'NOTURNO' | '24H')[];
  
  // Commercial Information
  billingMethod?: 'HOURLY' | 'DAILY' | 'CONTRACT';
  averageValue?: number;
  acceptsUrgency?: boolean;
}

export interface Employee {
  id: string;
  agencyId: string;
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
  role?: string;
}

export interface Client {
  id: string;
  agencyId: string;
  name: string;
  managerName: string;
  location?: string;
  activeScales?: number;
}

export interface Company {
  id: string;
  agencyId: string;
  name: string;
  responsibleName: string;
  cnpj?: string;
  phone: string;
  email: string;
  address?: string;
  createdAt: string;
  status?: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  documents?: {
    id: string;
    name: string;
    url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    uploadedAt: string;
  }[];
}

export interface Unit {
  id: string;
  agencyId: string;
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
  agencyId: string;
  companyId: string;
  unitId?: string;
  fullName: string;
  email: string;
  password?: string;
  photoUrl?: string;
  role: 'COMPANY';
  createdAt: string;
  status?: 'ACTIVE' | 'BLOCKED';
}

export interface Assignment {
  id: string;
  agencyId: string;
  employeeId: string;
  clientId: string;
  date: string;
  value: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  confirmed?: boolean;
}

export interface Feedback {
  id: string;
  agencyId: string;
  assignmentId: string;
  employeeId: string;
  managerId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ContactRequest {
  id: string;
  agencyId: string;
  name: string;
  phone: string;
  status: 'PENDING' | 'CONTACTED';
  date: string;
}

export interface AccessPoint {
  id: string;
  agencyId: string;
  managerName: string;
  location: string;
  qrCodeValue: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  agencyId: string;
  employeeId: string;
  accessPointId: string;
  location: string; // Denormalized for easier filtering
  timestamp: string;
  photoUrl: string;
  type: 'IN' | 'OUT';
}

export interface PricingConfig {
  agencyId?: string;
  type: 'STARS' | 'DAILY';
  stars: Record<string, { employee: number, company: number }>;
  weekly: Record<string, { employee: number, company: number }>;
}

export interface CompanyRequest {
  id: string;
  agencyId: string;
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
  agencyId: string;
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

export interface Notification {
  id: string;
  agencyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'INFO';
  read: boolean;
  createdAt: string;
  link?: string;
  assignmentId?: string;
}
