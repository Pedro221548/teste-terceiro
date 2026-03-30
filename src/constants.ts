import { Employee, Client, Assignment, Feedback, ContactRequest, AccessPoint, CheckIn } from './types';

export const PRICING_BY_STARS = {
  1: 50,
  2: 60,
  3: 70,
  4: 80,
  5: 90
};

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp1',
    firstName: 'João',
    lastName: 'Silva',
    cpf: '123.456.789-00',
    birthDate: '1990-05-15',
    phone: '11999999999',
    rating: 4,
    status: 'ACTIVE',
    complaints: 0,
    lastAssignmentDate: '2026-03-25',
    unavailableDates: []
  },
  {
    id: 'emp2',
    firstName: 'Maria',
    lastName: 'Oliveira',
    cpf: '987.654.321-11',
    birthDate: '1985-10-20',
    phone: '11888888888',
    rating: 5,
    status: 'ACTIVE',
    complaints: 0,
    lastAssignmentDate: '2026-03-20',
    unavailableDates: []
  },
  {
    id: 'emp3',
    firstName: 'Carlos',
    lastName: 'Santos',
    cpf: '456.789.123-22',
    birthDate: '1995-02-28',
    phone: '11777777777',
    rating: 3,
    status: 'ACTIVE',
    complaints: 5,
    lastAssignmentDate: '2026-02-15', // More than 30 days ago
    unavailableDates: []
  },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli1', name: 'Supermercado Alvorada', managerName: 'Ricardo' },
  { id: 'cli2', name: 'Restaurante Sabor Real', managerName: 'Ana' },
  { id: 'cli3', name: 'CLIMA RIO', managerName: 'Gestor Clima Rio' },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'as1', employeeId: 'emp1', clientId: 'cli1', date: new Date().toISOString().split('T')[0], value: 80, status: 'SCHEDULED' },
  { id: 'as2', employeeId: 'emp2', clientId: 'cli2', date: new Date().toISOString().split('T')[0], value: 90, status: 'SCHEDULED' },
];

export const MOCK_FEEDBACKS: Feedback[] = [
  { id: 'f1', assignmentId: 'as1', employeeId: 'emp1', managerId: 'cli1', rating: 4, comment: 'Muito pontual e prestativo.', date: '2026-03-27' },
];

export const MOCK_CONTACTS: ContactRequest[] = [
  { id: 'c1', name: 'Pedro Souza', phone: '(11) 98888-7777', status: 'PENDING', date: '2026-03-28' },
];

export const MOCK_ACCESS_POINTS: AccessPoint[] = [
  { id: 'ap1', managerName: 'Ricardo', location: 'Supermercado Alvorada - Entrada Principal', qrCodeValue: 'unit-alvorada-001', createdAt: '2026-03-28' },
  { id: 'ap2', managerName: 'Gestor Clima Rio', location: 'CLIMA RIO', qrCodeValue: 'unit-climario-001', createdAt: '2026-03-28' },
];

export const MOCK_CHECKINS: CheckIn[] = [];

export const calculateValue = (rating: number) => {
  return 50 + (rating - 1) * 10;
};
