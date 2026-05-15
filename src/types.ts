export type UserRole = 'ADMIN' | 'AGENCY' | 'COMPANY' | 'EMPLOYEE' | 'REGISTRATION' | 'COMPANY_REGISTRATION' | 'AGENCY_REGISTRATION';

export type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

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
    country?: string;
    addressLine1?: string;
    addressLine2?: string;
  };

  // Responsável Legal
  responsibleName: string;
  responsibleCpf: string;
  responsibleRole: string; // Cargo
  phone: string;
  email: string;
  
  // Additional Info
  logoUrl?: string;
  legalName?: string;
  taxId?: string;
  website?: string;
  termsUrl?: string;

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
  
  // Subscription & Limits
  plan: PlanType;
  subscriptionStatus: 'ACTIVE' | 'PAID' | 'TRIAL' | 'EXPIRED';
  maxEmployees?: number;
  maxCompanies?: number;
  
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

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  maxEmployees: number;
  maxCompanies: number;
  features: string[];
  updatedAt: string;
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
  faceReferenceUrl?: string;
  rating: number; // 1 to 5
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  complaints: number;
  lastAssignmentDate?: string;
  unavailableDates?: string[];
  role?: string;
  
  // New Features
  level: 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';
  attendanceRate: number; // 0 to 100
  totalEarnings: number;
  documentExpirations?: {
    aso?: string;
    criminalRecord?: string;
    training?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  category?: 'DIARISTA' | 'CONTRATADO';
  eSocialUrl?: string;
  profession?: string;
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
  paymentDay?: string;
  createdAt: string;
  status?: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  services?: string[];
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
  qrCode?: string;
  
  // New Features
  coordinates?: {
    lat: number;
    lng: number;
  };
  favoriteEmployees?: string[]; // Array of employee IDs
}

export interface CheckIn {
  id: string;
  employeeId: string;
  unitId: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  photoUrl: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  isAdjustment?: boolean;
  adjustmentReason?: string;
  approvedBy?: string;
  approvedAt?: string;
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
  status?: 'ACTIVE' | 'PENDING' | 'BLOCKED';
}

export interface Assignment {
  id: string;
  agencyId: string;
  companyId?: string;
  employeeId: string;
  clientId: string;
  unitId?: string;
  date: string;
  value: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  confirmed?: boolean;
  
  // New Features
  paymentStatus: 'PENDING' | 'PAID' | 'PROCESSING';
  createdAt?: string;
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

export interface ProfessionPricing {
  type: 'STARS' | 'DAILY';
  stars: Record<string, { employee: number, company: number }>;
  weekly: Record<string, { employee: number, company: number }>;
}

export interface PricingConfig {
  agencyId?: string;
  type: 'STARS' | 'DAILY';
  stars: Record<string, { employee: number, company: number }>;
  weekly: Record<string, { employee: number, company: number }>;
  professions?: Record<string, ProfessionPricing>;
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
  broadcasted?: boolean;
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
  faceReferenceUrl?: string;
  status: 'PENDING' | 'PROCESSED';
  createdAt: string;
  category?: 'DIARISTA' | 'CONTRATADO';
  eSocialUrl?: string;
  profession?: string;
}

export interface AppNotification {
  id: string;
  agencyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'INFO' | 'TRAINING' | 'URGENT';
  read: boolean;
  createdAt: string;
  link?: string;
  assignmentId?: string;
}

export interface Message {
  id: string;
  chatId: string; // agencyId_employeeId or agencyId_companyId
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Bulletin {
  id: string;
  agencyId: string;
  title: string;
  content: string;
  type: 'TRAINING' | 'ANNOUNCEMENT' | 'URGENT';
  targetRoles: UserRole[];
  createdAt: string;
  attachmentUrl?: string;
}

export interface Invoice {
  id: string;
  agencyId: string;
  companyId: string;
  month: string; // YYYY-MM
  amount: number;
  status: 'OPEN' | 'PAID' | 'OVERDUE';
  assignmentIds: string[];
  createdAt: string;
}
