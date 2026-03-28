import React, { useState } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  MessageSquare, 
  UserPlus, 
  Calendar, 
  Star, 
  Phone, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Building2,
  ChevronRight,
  Upload,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  AlertCircle,
  QrCode,
  Scan,
  Camera,
  MapPin,
  Plus,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import QrScanner from 'react-qr-scanner';
import { UserRole, Employee, Client, Assignment, Feedback, ContactRequest, AccessPoint, CheckIn } from './types';
import { MOCK_EMPLOYEES, MOCK_CLIENTS, MOCK_ASSIGNMENTS, MOCK_FEEDBACKS, MOCK_CONTACTS, MOCK_ACCESS_POINTS, MOCK_CHECKINS, calculateValue } from './constants';

export default function App() {
  const [role, setRole] = useState<UserRole>('AGENCY');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(MOCK_FEEDBACKS);
  const [contacts, setContacts] = useState<ContactRequest[]>(MOCK_CONTACTS);
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>(MOCK_ACCESS_POINTS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(MOCK_CHECKINS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role Switcher for Demo
  const RoleSwitcher = () => (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-white p-2 rounded-full shadow-2xl border border-gray-200 z-50">
      <button 
        onClick={() => setRole('AGENCY')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'AGENCY' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        Agência
      </button>
      <button 
        onClick={() => setRole('MANAGER')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'MANAGER' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        Gerente
      </button>
      <button 
        onClick={() => setRole('EMPLOYEE')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'EMPLOYEE' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        Funcionário
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
      <RoleSwitcher />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Building2 size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">StaffLink</h1>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {role === 'AGENCY' && (
                <>
                  <SidebarItem 
                    icon={<LayoutDashboard size={20} />} 
                    label="Dashboard" 
                    active={activeTab === 'dashboard'} 
                    onClick={() => setActiveTab('dashboard')} 
                  />
                  <SidebarItem 
                    icon={<MessageSquare size={20} />} 
                    label="Feedbacks" 
                    active={activeTab === 'feedbacks'} 
                    onClick={() => setActiveTab('feedbacks')} 
                  />
                  <SidebarItem 
                    icon={<UserPlus size={20} />} 
                    label="Cadastros" 
                    active={activeTab === 'registrations'} 
                    onClick={() => setActiveTab('registrations')} 
                  />
                  <SidebarItem 
                    icon={<Calendar size={20} />} 
                    label="Escala" 
                    active={activeTab === 'staffing'} 
                    onClick={() => setActiveTab('staffing')} 
                  />
                  <SidebarItem 
                    icon={<QrCode size={20} />} 
                    label="Controle de Acesso" 
                    active={activeTab === 'access_control'} 
                    onClick={() => setActiveTab('access_control')} 
                  />
                </>
              )}
              {role === 'MANAGER' && (
                <>
                  <SidebarItem 
                    icon={<LayoutDashboard size={20} />} 
                    label="Minhas Escalas" 
                    active={activeTab === 'manager_dashboard'} 
                    onClick={() => setActiveTab('manager_dashboard')} 
                  />
                  <SidebarItem 
                    icon={<Star size={20} />} 
                    label="Avaliar Equipe" 
                    active={activeTab === 'manager_feedback'} 
                    onClick={() => setActiveTab('manager_feedback')} 
                  />
                </>
              )}
              {role === 'EMPLOYEE' && (
                <>
                  <SidebarItem 
                    icon={<Calendar size={20} />} 
                    label="Minha Agenda" 
                    active={activeTab === 'employee_schedule'} 
                    onClick={() => setActiveTab('employee_schedule')} 
                  />
                  <SidebarItem 
                    icon={<LayoutDashboard size={20} />} 
                    label="Perfil" 
                    active={activeTab === 'employee_profile'} 
                    onClick={() => setActiveTab('employee_profile')} 
                  />
                  <SidebarItem 
                    icon={<Scan size={20} />} 
                    label="PONTO" 
                    active={activeTab === 'employee_ponto'} 
                    onClick={() => setActiveTab('employee_ponto')} 
                  />
                </>
              )}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <LogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {role === 'AGENCY' ? 'Administrador Agência' : role === 'MANAGER' ? 'Gerente Unidade' : 'Funcionário Diarista'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://picsum.photos/seed/user/100" alt="Profile" />
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {role === 'AGENCY' && activeTab === 'dashboard' && (
                <AgencyDashboard 
                  assignments={assignments}
                  employees={employees}
                  contacts={contacts}
                />
              )}
              {role === 'AGENCY' && activeTab === 'feedbacks' && (
                <AgencyFeedbacks 
                  feedbacks={feedbacks}
                  employees={employees}
                />
              )}
              {role === 'AGENCY' && activeTab === 'registrations' && (
                <AgencyRegistrations 
                  employees={employees}
                  setEmployees={setEmployees}
                />
              )}
              {role === 'AGENCY' && activeTab === 'staffing' && (
                <AgencyStaffing 
                  employees={employees}
                  assignments={assignments}
                  setAssignments={setAssignments}
                />
              )}
              {role === 'AGENCY' && activeTab === 'access_control' && (
                <AgencyAccessControl 
                  accessPoints={accessPoints}
                  setAccessPoints={setAccessPoints}
                />
              )}
              
              {role === 'MANAGER' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                  <LayoutDashboard size={48} className="mb-4 opacity-20" />
                  <p className="text-lg">Interface do Gerente em desenvolvimento...</p>
                </div>
              )}
              {role === 'EMPLOYEE' && activeTab === 'employee_schedule' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                  <Calendar size={48} className="mb-4 opacity-20" />
                  <p className="text-lg">Sua agenda de escalas aparecerá aqui.</p>
                </div>
              )}
              {role === 'EMPLOYEE' && activeTab === 'employee_profile' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p className="text-lg">Seu perfil profissional.</p>
                </div>
              )}
              {role === 'EMPLOYEE' && activeTab === 'employee_ponto' && (
                <EmployeePonto 
                  accessPoints={accessPoints}
                  checkIns={checkIns}
                  setCheckIns={setCheckIns}
                />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-blue-50 text-blue-600 shadow-sm' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`${active ? 'text-blue-600' : 'text-gray-400'}`}>{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
    </button>
  );
}

function AgencyDashboard({ assignments, employees, contacts }: { assignments: Assignment[], employees: Employee[], contacts: ContactRequest[] }) {
  const today = new Date().toISOString().split('T')[0];
  const todayAssignments = assignments.filter(a => a.date === today);
  const totalValue = todayAssignments.reduce((acc, curr) => acc + curr.value, 0);
  const activeClients = new Set(todayAssignments.map(a => a.clientId)).size;
  const pendingContacts = contacts.filter(c => c.status === 'PENDING').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-gray-900">Visão Geral</h2>
        <p className="text-gray-500">Acompanhe o desempenho da sua agência hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Funcionários Escalados" 
          value={todayAssignments.length.toString()} 
          trend="+12% vs ontem"
        />
        <StatCard 
          icon={<TrendingUp className="text-green-600" />} 
          label="Valor Agregado (Hoje)" 
          value={`R$ ${totalValue.toFixed(2)}`} 
          trend="Média R$ 85/func"
        />
        <StatCard 
          icon={<Building2 className="text-purple-600" />} 
          label="Clientes Atendidos" 
          value={activeClients.toString()} 
          trend="2 novos contratos"
        />
        <StatCard 
          icon={<Phone className="text-orange-600" />} 
          label="Contatos Pendentes" 
          value={pendingContacts.toString()} 
          trend="Link Direto"
          alert={pendingContacts > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Escalas do Dia</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            {todayAssignments.map(as => {
              const emp = employees.find(e => e.id === as.employeeId);
              const cli = MOCK_CLIENTS.find(c => c.id === as.clientId);
              return (
                <div key={as.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {emp?.firstName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-gray-500">{cli?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-600">R$ {as.value.toFixed(2)}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">Confirmado</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Novos Contatos</h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">Aguardando</span>
          </div>
          <div className="space-y-4">
            {contacts.filter(c => c.status === 'PENDING').map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone}</p>
                  </div>
                </div>
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, trend, alert }: { icon: React.ReactNode, label: string, value: string, trend: string, alert?: boolean }) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${alert ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        {alert && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-gray-900 mb-2">{value}</h4>
      <p className="text-xs font-semibold text-gray-400">{trend}</p>
    </div>
  );
}

function AgencyFeedbacks({ feedbacks, employees }: { feedbacks: Feedback[], employees: Employee[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-gray-900">Feedback dos Clientes</h2>
        <p className="text-gray-500">Avaliações enviadas pelos gerentes das unidades.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {feedbacks.map(f => {
          const emp = employees.find(e => e.id === f.employeeId);
          return (
            <div key={f.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${emp?.id}/100`} alt="" />
                </div>
                <div>
                  <p className="font-bold">{emp?.firstName} {emp?.lastName}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 border-l border-gray-100 pl-6">
                <p className="text-gray-600 italic">"{f.comment}"</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{new Date(f.date).toLocaleDateString('pt-BR')}</span>
                  <span className="mx-2">•</span>
                  <span>Avaliado por: {MOCK_CLIENTS.find(c => c.id === f.managerId)?.managerName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function AgencyRegistrations({ employees, setEmployees }: { employees: Employee[], setEmployees: React.Dispatch<React.SetStateAction<Employee[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cpf: '',
    birthDate: '',
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      alert('Não aceitamos menores de idade.');
      return;
    }

    const newEmp: Employee = {
      id: `emp${Date.now()}`,
      ...formData,
      rating: 1,
      status: 'ACTIVE',
      complaints: 0,
    };

    setEmployees([...employees, newEmp]);
    setShowForm(false);
    setFormData({ firstName: '', lastName: '', cpf: '', birthDate: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Funcionários</h2>
          <p className="text-gray-500">Cadastre novos talentos ou gerencie os atuais.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const link = `${window.location.origin}/register?ref=agency`;
              navigator.clipboard.writeText(link);
              alert('Link de cadastro copiado!');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all"
          >
            <LinkIcon size={18} />
            Enviar Link
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            <UserPlus size={18} />
            Novo Cadastro
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Cadastro Direto</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nome</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Sobrenome</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">CPF</label>
                <input 
                  required
                  type="text" 
                  placeholder="000.000.000-00"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Data de Nascimento</label>
                <input 
                  required
                  type="date" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.birthDate}
                  onChange={e => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Foto 3x4</label>
                <div className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-all">
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs font-bold">Anexar Foto</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Documento (CPF)</label>
                <div className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-all">
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs font-bold">Anexar Documento</span>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Finalizar Cadastro
            </button>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Funcionário</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CPF</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nascimento</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Avaliação</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {emp.firstName[0]}
                    </div>
                    <span className="font-bold text-sm">{emp.firstName} {emp.lastName}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{emp.cpf}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(emp.birthDate).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {emp.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-gray-400 hover:text-blue-600 p-1"><ChevronRight size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function AgencyStaffing({ employees, assignments, setAssignments }: { employees: Employee[], assignments: Assignment[], setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>> }) {
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0].id);
  const [filterType, setFilterType] = useState<'RATING' | 'COMPLAINTS'>('RATING');

  const sortedEmployees = [...employees].sort((a, b) => {
    if (filterType === 'RATING') return b.rating - a.rating;
    return a.complaints - b.complaints;
  });

  const handleStaff = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const newAs: Assignment = {
      id: `as${Date.now()}`,
      employeeId: empId,
      clientId: selectedClient,
      date: new Date().toISOString().split('T')[0],
      value: calculateValue(emp.rating),
      status: 'SCHEDULED'
    };

    setAssignments([...assignments, newAs]);
    alert(`${emp.firstName} escalado com sucesso!`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-gray-900">Escala de Unidades</h2>
        <p className="text-gray-500">Selecione os melhores funcionários para cada parceiro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">1. Selecionar Cliente</h3>
            <div className="space-y-2">
              {MOCK_CLIENTS.map(cli => (
                <button 
                  key={cli.id}
                  onClick={() => setSelectedClient(cli.id)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                    selectedClient === cli.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold text-sm">{cli.name}</p>
                    <p className={`text-xs ${selectedClient === cli.id ? 'text-blue-100' : 'text-gray-400'}`}>Gerente: {cli.managerName}</p>
                  </div>
                  {selectedClient === cli.id && <CheckCircle size={20} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">2. Critério de Seleção</h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
              <button 
                onClick={() => setFilterType('RATING')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'RATING' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Star size={14} />
                Por Estrelas
              </button>
              <button 
                onClick={() => setFilterType('COMPLAINTS')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'COMPLAINTS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                <AlertCircle size={14} />
                Menor Reclamação
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">3. Funcionários Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedEmployees.map(emp => {
              const isAssigned = assignments.some(a => a.employeeId === emp.id && a.date === new Date().toISOString().split('T')[0]);
              return (
                <div key={emp.id} className={`p-4 rounded-2xl border transition-all ${isAssigned ? 'bg-gray-50 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${emp.id}/100`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{emp.firstName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">R$ {calculateValue(emp.rating)}/dia</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <AlertCircle size={12} />
                      <span>{emp.complaints} reclamações</span>
                    </div>
                    <button 
                      disabled={isAssigned}
                      onClick={() => handleStaff(emp.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isAssigned 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {isAssigned ? 'Já Escalado' : 'Escalar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AgencyAccessControl({ accessPoints, setAccessPoints }: { accessPoints: AccessPoint[], setAccessPoints: React.Dispatch<React.SetStateAction<AccessPoint[]>> }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    managerName: '',
    location: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAP: AccessPoint = {
      id: `ap${Date.now()}`,
      managerName: formData.managerName,
      location: formData.location,
      qrCodeValue: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAccessPoints([...accessPoints, newAP]);
    setShowForm(false);
    setFormData({ managerName: '', location: '' });
  };

  const downloadQRCode = (id: string, location: string) => {
    const canvas = document.getElementById(`canvas-${id}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${location.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-gray-900">Controle de Acesso</h2>
          <p className="text-gray-500">Gere e gerencie QR Codes para as unidades atendidas.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus size={20} />
          Adicionar Unidade
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Nova Unidade</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nome do Gestor</label>
              <input 
                required
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.managerName}
                onChange={e => setFormData({...formData, managerName: e.target.value})}
                placeholder="Ex: Ricardo Silva"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Localização da Empresa</label>
              <input 
                required
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="Ex: Supermercado Alvorada - Unidade Centro"
              />
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Gerar QR Code
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessPoints.map(ap => (
          <div key={ap.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="flex flex-col items-center text-center space-y-4 flex-1">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                <QRCodeSVG value={ap.qrCodeValue} size={150} />
                <div className="hidden">
                  <QRCodeCanvas id={`canvas-${ap.id}`} value={ap.qrCodeValue} size={512} />
                </div>
              </div>
              <div className="space-y-1 w-full">
                <h4 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">{ap.location}</h4>
                <p className="text-sm text-gray-500">Gestor: {ap.managerName}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                <Calendar size={12} />
                <span>Criado em {new Date(ap.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button 
                onClick={() => downloadQRCode(ap.id, ap.location)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Baixar QR Code
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmployeePonto({ accessPoints, checkIns, setCheckIns }: { accessPoints: AccessPoint[], checkIns: CheckIn[], setCheckIns: React.Dispatch<React.SetStateAction<CheckIn[]>> }) {
  const [step, setStep] = useState<'INITIAL' | 'SCANNING' | 'PHOTO' | 'SUCCESS'>('INITIAL');
  const [scannedPoint, setScannedPoint] = useState<AccessPoint | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleScan = (data: any) => {
    if (data) {
      const point = accessPoints.find(ap => ap.qrCodeValue === data.text);
      if (point) {
        setScannedPoint(point);
        setStep('PHOTO');
        startCamera();
      } else {
        alert('QR Code inválido para esta unidade.');
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Não foi possível acessar a câmera para a selfie.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photo = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photo);
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Save Check-in
        const newCheckIn: CheckIn = {
          id: `ci${Date.now()}`,
          employeeId: 'emp1', // Mock current user
          accessPointId: scannedPoint!.id,
          timestamp: new Date().toISOString(),
          photoUrl: photo,
        };
        setCheckIns(prev => [...prev, newCheckIn]);
        setStep('SUCCESS');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Registro de Ponto</h2>
        <p className="text-gray-500">Registre sua entrada ou saída na unidade.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
        {step === 'INITIAL' && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Scan size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Pronto para começar?</h3>
              <p className="text-sm text-gray-500 mt-2">Escaneie o QR Code fixado na parede da unidade.</p>
            </div>
            <button 
              onClick={() => setStep('SCANNING')}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Escanear QR Code
            </button>
          </div>
        )}

        {step === 'SCANNING' && (
          <div className="space-y-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-blue-600">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 border-dashed" />
              </div>
            </div>
            <button 
              onClick={() => setStep('INITIAL')}
              className="w-full py-3 text-gray-500 font-bold hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        )}

        {step === 'PHOTO' && (
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold">Verificação Facial</h3>
              <p className="text-sm text-gray-500 mt-1">Unidade: {scannedPoint?.location}</p>
            </div>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border-4 border-blue-600">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-2 border-white/50 rounded-[100px] border-dashed" />
              </div>
            </div>
            <button 
              onClick={takePhoto}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Camera size={24} />
              Tirar Foto e Bater Ponto
            </button>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="flex flex-col items-center space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600"
            >
              <CheckCircle size={48} />
            </motion.div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Ponto Registrado!</h3>
              <p className="text-sm text-gray-500 mt-2">Seu registro foi enviado com sucesso.</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={14} />
                  <span>{scannedPoint?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} />
                  <span>{new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep('INITIAL')}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
            >
              Voltar
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <h3 className="font-bold mb-4">Últimos Registros</h3>
        <div className="space-y-4">
          {checkIns.slice().reverse().map(ci => {
            const ap = accessPoints.find(p => p.id === ci.accessPointId);
            return (
              <div key={ci.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                    <img src={ci.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{ap?.location}</p>
                    <p className="text-[10px] text-gray-400">{new Date(ci.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <CheckCircle size={16} className="text-green-500" />
              </div>
            );
          })}
          {checkIns.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-4">Nenhum registro hoje.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
