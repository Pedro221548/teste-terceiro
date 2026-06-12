import { 
  BarChart3, 
  Users, 
  ClipboardList, 
  Settings, 
  Briefcase, 
  HelpCircle, 
  Calendar,
  Building,
  Star,
  Activity,
  PlusCircle,
  FileText,
  CreditCard,
  Building2,
  Trello,
  LayoutDashboard,
  QrCode,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

export const getMenuItems = (role: string, agencyPlan?: string) => {
  const restrictedForStarter = ['feed', 'ponto', 'access_flow', 'feedbacks', 'pricing', 'reports'];

  // Base items per role
  let items = [];

  if (role === 'SUPERADMIN') {
    items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'companies', label: 'Agências', icon: Building2 },
      { id: 'billing', label: 'Faturamento', icon: CreditCard },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ];
  } else if (role === 'ADMIN') {
    items = [
      { id: 'admin_dashboard', label: 'Visão Geral', icon: BarChart3 },
      { id: 'admin_agencies', label: 'Agências', icon: Building2 },
      { id: 'admin_plans', label: 'Planos', icon: Star },
    ];
  } else if (role === 'AGENCY') {
    items = [
      { id: 'dashboard', label: 'Overview', icon: BarChart3 },
      { id: 'feed', label: 'Feed & Mural', icon: LayoutDashboard },
      { id: 'staffing', label: 'Staffing', icon: Users },
      { id: 'ponto', label: 'Ponto', icon: QrCode },
      { id: 'access_flow', label: 'Controle de Acessos', icon: ShieldAlert },
      { id: 'companies', label: 'Parceiros', icon: Briefcase },
      { id: 'registrations', label: 'Solicitações', icon: ClipboardList },
      { id: 'assignments', label: 'Escalas', icon: Calendar },
      { id: 'feedbacks', label: 'Feedbacks', icon: Star },
      { id: 'reports', label: 'Relatórios', icon: FileText },
      { id: 'contacts', label: 'Chamados', icon: HelpCircle },
      { id: 'pricing', label: 'Invoices', icon: CreditCard },
      { id: 'user_management', label: 'Usuários', icon: Users },
      { id: 'employee_training', label: 'Treinamentos', icon: GraduationCap },
      { id: 'profile', label: 'Configurações', icon: Settings },
    ];
  } else if (role === 'COMPANY') {
    items = [
      { id: 'manager_dashboard', label: 'Overview', icon: Building },
      { id: 'timeline', label: 'Escalas & Aprovação', icon: Activity },
      { id: 'new_request', label: 'Solicitar Staff', icon: PlusCircle },
      { id: 'reports', label: 'Relatórios', icon: FileText },
      { id: 'profile', label: 'Configurações', icon: Settings },
    ];
  } else if (role === 'EMPLOYEE') {
    items = [
      { id: 'employee_checkin', label: 'Meu Ponto', icon: QrCode },
      { id: 'employee_schedule', label: 'Minhas Escalas', icon: Calendar },
      { id: 'feed', label: 'Feed & Mural', icon: LayoutDashboard },
      { id: 'employee_training', label: 'Treinamentos', icon: GraduationCap },
      { id: 'profile', label: 'Meu Perfil', icon: Settings },
    ];
  }

  // Filter out restricted items if agencyPlan is STARTER
  if (role === 'AGENCY' && agencyPlan === 'STARTER') {
    items = items.filter(item => !restrictedForStarter.includes(item.id));
  }

  return items;
};
