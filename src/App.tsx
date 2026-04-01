import React, { useState, useEffect, Component } from 'react';
import { 
  Users, 
  User as UserIcon,
  LayoutDashboard, 
  MessageSquare, 
  UserPlus, 
  Calendar, 
  Star, 
  Phone, 
  CheckCircle, 
  Clock, 
  CreditCard,
  TrendingUp, 
  Building2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  Upload,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  AlertCircle,
  AlertTriangle,
  Eye,
  QrCode,
  Scan,
  Camera,
  MapPin,
  Plus,
  Download,
  Trash2,
  Mail,
  Lock,
  Search,
  Settings,
  Filter,
  Send,
  Cake,
  Database,
  Bell,
  ArrowUpRight,
  ArrowRight,
  TrendingUp as TrendingUpIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { UserRole, Employee, Client, Assignment, Feedback, ContactRequest, AccessPoint, CheckIn, Company, Unit, CompanyUser, PricingConfig, CompanyRequest, EmployeeRegistration, Notification } from './types';
import { DEFAULT_PRICING } from './constants';
import { auth, googleProvider, sendPasswordResetEmail } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { 
  subscribeToCollection, 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  testConnection,
  setDocument,
  getDocument,
  where
} from './services/firebaseService';

function formatDateBR(dateString: string) {
  if (!dateString) return 'Nenhuma';
  if (dateString.includes('-') && !dateString.includes('T')) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  return new Date(dateString).toLocaleDateString('pt-BR');
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-sm text-left text-xs overflow-auto max-h-40">
                {this.state.error?.message || JSON.stringify(this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

function Sidebar({ role, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, userEmail, userName, userPhoto, handleLogout }: { 
  role: string, 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  isMobileMenuOpen: boolean,
  setIsMobileMenuOpen: (open: boolean) => void,
  userEmail: string | null,
  userName: string | null,
  userPhoto: string | null,
  handleLogout: () => void
}) {
  const menuItems = role === 'ADMIN' || role === 'AGENCY' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staffing', label: 'Diaristas', icon: Users },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'registrations', label: 'Cadastros', icon: UserPlus },
    { id: 'access_control', label: 'Controle de Acesso', icon: QrCode },
    { id: 'pricing', label: 'Precificação', icon: CreditCard },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { id: 'user_management', label: 'Gestão de Logins', icon: Lock },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon },
  ] : role === 'COMPANY' ? [
    { id: 'manager_dashboard', label: 'Minhas Diarias', icon: LayoutDashboard },
    { id: 'evaluate_team', label: 'Avaliar Equipe', icon: Star },
    { id: 'company_diaristas', label: 'Diaristas', icon: Users },
    { id: 'company_profile', label: 'Meu Perfil', icon: UserIcon },
  ] : [
    { id: 'employee_schedule', label: 'Minha Agenda', icon: Calendar },
    { id: 'employee_profile', label: 'Meu Perfil', icon: UserIcon },
    { id: 'employee_ponto', label: 'PONTO', icon: Scan },
  ];

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tighter text-slate-950 font-display">StaffLink</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Enterprise</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu Principal</p>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={<item.icon size={18} />}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-50 bg-slate-50/50">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  {userPhoto ? (
                    <img src={userPhoto} alt={userName || ''} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{userName || 'Usuário'}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={14} />
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ activeTab, setIsMobileMenuOpen, user, role, audioEnabled, setAudioEnabled }: { 
  activeTab: string, 
  setIsMobileMenuOpen: (open: boolean) => void,
  user: any,
  role: string,
  audioEnabled: boolean,
  setAudioEnabled: (enabled: boolean) => void
}) {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Geral';
      case 'staffing': return 'Gestão de Diaristas';
      case 'companies': return 'Empresas Parceiras';
      case 'registrations': return 'Cadastros Pendentes';
      case 'access_control': return 'Controle de Acesso';
      case 'pricing': return 'Configuração de Preços';
      case 'feedbacks': return 'Feedbacks & Avaliações';
      case 'user_management': return 'Gestão de Usuários';
      case 'profile': return 'Meu Perfil Profissional';
      case 'manager_dashboard': return 'Minhas Diarias';
      case 'evaluate_team': return 'Avaliação de Equipe';
      case 'company_diaristas': return 'Equipe de Diaristas';
      case 'company_profile': return 'Perfil da Empresa';
      case 'employee_schedule': return 'Minha Agenda';
      case 'employee_profile': return 'Meu Perfil';
      case 'employee_ponto': return 'Registro de Ponto';
      default: return 'Visão Geral';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-display truncate max-w-[180px] sm:max-w-none">{getTitle()}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">StaffLink Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">
              {user.displayName || 'Usuário'}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 border-2 border-white shadow-xl overflow-hidden ring-1 ring-slate-200 group cursor-pointer hover:scale-105 transition-all">
            <img src={user.photoURL || "https://picsum.photos/seed/user/100"} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </header>
  );
}

function ChangePasswordScreen({ user, onComplete, handleLogout }: { user: any, onComplete: () => void, handleLogout: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // 2. Update forcePasswordChange flag in Firestore
      await updateDocument('users', user.uid, { forcePasswordChange: false });

      onComplete();
    } catch (err: any) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Por segurança, você precisa fazer login novamente para trocar a senha.');
        setTimeout(handleLogout, 3000);
      } else {
        setError('Erro ao atualizar senha: ' + err.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
            <Lock className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Trocar Senha</h3>
          <p className="text-xs text-slate-400 font-medium mt-2">Este é seu primeiro acesso. Por segurança, você deve definir uma nova senha.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-xs text-red-600 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nova Senha</label>
              <input 
                required
                type="password" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Confirmar Nova Senha</label>
              <input 
                required
                type="password" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? 'Atualizando...' : 'Salvar Nova Senha'}
            </button>
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all"
            >
              Sair e trocar depois
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | any | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('AGENCY');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [employeeRegistrations, setEmployeeRegistrations] = useState<EmployeeRegistration[]>([]);
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ratingLabel, setRatingLabel] = useState('Estrelas');

  useEffect(() => {
    const handleInteraction = () => {
      setAudioEnabled(true);
      // Remove listeners after first interaction
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const [resetErrorMessage, setResetErrorMessage] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('LOADING');
    setResetErrorMessage('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setResetStatus('ERROR');
      setResetErrorMessage(err.message || 'Falha ao enviar e-mail');
    }
  };

  const getScaleValue = (rating: number) => {
    if (pricing.type === 'STARS') {
      const p = pricing.stars?.[rating.toString()];
      return p ? p.employee + p.company : 0;
    } else {
      const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const day = daysOfWeek[new Date().getDay()];
      const p = pricing.weekly?.[day];
      return p ? p.employee + p.company : 0;
    }
  };

  useEffect(() => {
    if (!isAuthReady || !user) return;
    const unsubPricing = subscribeToCollection<any>('settings', (docs) => {
      const pricingDoc = docs.find(d => d.id === 'pricing');
      const labelDoc = docs.find(d => d.id === 'ratingLabel');
      if (pricingDoc) {
        setPricing({
          ...DEFAULT_PRICING,
          ...pricingDoc.values,
          stars: { ...DEFAULT_PRICING.stars, ...(pricingDoc.values?.stars || {}) },
          weekly: { ...DEFAULT_PRICING.weekly, ...(pricingDoc.values?.weekly || {}) }
        });
      }
      if (labelDoc) setRatingLabel(labelDoc.value);
    });
    return () => unsubPricing();
  }, [isAuthReady, user]);

  const playNotificationSound = () => {
    if (!audioEnabled) {
      console.warn('Audio not enabled yet. User must interact with the page first.');
      return;
    }
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => {
      if (e.name === 'NotAllowedError') {
        setAudioEnabled(false);
      }
      console.error('Error playing sound:', e);
    });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    testConnection();
    
    // Check server health
    fetch('/api/health')
      .then(r => r.json())
      .then(d => console.log('Server health check:', d))
      .catch(e => console.error('Server health check failed:', e));

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      if (firebaseUser) {
        console.log('User is authenticated:', firebaseUser.uid);
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as UserRole;

        // Fetch or create user profile
        const userDoc = await getDocument<{ role: UserRole, forcePasswordChange?: boolean }>('users', firebaseUser.uid);
        if (userDoc) {
          setRole(userDoc.role);
          if (userDoc.forcePasswordChange) {
            setNeedsPasswordChange(true);
          }
        } else {
          // Default role based on email or URL param
          let defaultRole: UserRole = firebaseUser.email === 'pedroass.11577@gmail.com' ? 'AGENCY' : 'EMPLOYEE';
          if (urlRole === 'REGISTRATION' || urlRole === 'COMPANY_REGISTRATION') {
            defaultRole = urlRole;
          }
          await setDocument('users', firebaseUser.uid, {
            email: firebaseUser.email,
            role: defaultRole,
            createdAt: new Date().toISOString()
          });
          setRole(defaultRole);
        }
        setUser(firebaseUser);
      } else {
        setUser(prev => (prev as any)?.isCustom ? prev : null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const unsubEmployees = role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE' ? subscribeToCollection<Employee>('employees', setEmployees) : () => {};
    const unsubClients = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Client>('clients', setClients) : () => {};
    
    // Role-based assignments subscription
    const assignmentConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', user.uid)] : 
                                 role === 'COMPANY' ? [where('clientId', '==', (user as any).clientId || user.uid)] : [];
    const unsubAssignments = subscribeToCollection<Assignment>('assignments', (docs) => {
      if (role === 'AGENCY') {
        setAssignments(prev => {
          const changed = docs.some(d => {
            const p = prev.find(old => old.id === d.id);
            return p && p.status === 'SCHEDULED' && (d.status === 'COMPLETED' || d.status === 'CANCELLED');
          });
          if (changed) playNotificationSound();
          return docs;
        });
      } else {
        setAssignments(docs);
      }
    }, assignmentConstraints);
    
    const unsubFeedbacks = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Feedback>('feedbacks', setFeedbacks) : () => {};
    
    // Only agency sees contacts
    const unsubContacts = role === 'AGENCY' ? subscribeToCollection<ContactRequest>('contacts', setContacts) : () => {};
    const unsubEmployeeRegistrations = role === 'AGENCY' ? subscribeToCollection<EmployeeRegistration>('employeeRegistrations', (docs) => {
      setEmployeeRegistrations(prev => {
        const newRegs = docs.filter(d => d.status === 'PENDING');
        if (newRegs.length > prev.filter(d => d.status === 'PENDING').length) playNotificationSound();
        return docs;
      });
    }) : () => {};
    
    const unsubAccessPoints = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<AccessPoint>('accessPoints', setAccessPoints) : () => {};
    
    // Role-based check-ins subscription
    const checkInConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', user.uid)] : [];
    const unsubCheckIns = subscribeToCollection<CheckIn>('checkIns', (docs) => {
      if (role === 'AGENCY') {
        setCheckIns(prev => {
          if (docs.length > prev.length) playNotificationSound();
          return docs;
        });
      } else {
        setCheckIns(docs);
      }
    }, checkInConstraints);

    const unsubCompanies = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Company>('companies', setCompanies) : () => {};
    const unsubUnits = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Unit>('units', setUnits) : () => {};
    const unsubCompanyUsers = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<CompanyUser>('companyUsers', setCompanyUsers) : () => {};
    const unsubCompanyRequests = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<CompanyRequest>('companyRequests', (docs) => {
      if (role === 'AGENCY') {
        setCompanyRequests(prev => {
          const newRequests = docs.filter(d => d.status === 'PENDING');
          if (newRequests.length > prev.filter(d => d.status === 'PENDING').length) playNotificationSound();
          return docs;
        });
      } else {
        setCompanyRequests(docs);
      }
    }) : () => {};
    const unsubNotifications = subscribeToCollection<Notification>('notifications', setNotifications, [where('userId', '==', user.uid)]);

    return () => {
      unsubEmployees();
      unsubClients();
      unsubAssignments();
      unsubFeedbacks();
      unsubContacts();
      unsubEmployeeRegistrations();
      unsubAccessPoints();
      unsubCheckIns();
      unsubCompanies();
      unsubUnits();
      unsubCompanyUsers();
      unsubCompanyRequests();
      unsubNotifications();
    };
  }, [isAuthReady, user, role]);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Erro ao autenticar com Google.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // 1. Check in companyUsers
    const cUser = companyUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput);
    if (cUser) {
      setUser({
        uid: cUser.id,
        email: cUser.email,
        displayName: cUser.fullName,
        isCustom: true,
        clientId: cUser.unitId ? units.find(u => u.id === cUser.unitId)?.clientId : null
      });
      setRole('COMPANY');
      return;
    }

    // 2. Check in employees
    const eUser = employees.find(e => e.loginEmail?.toLowerCase() === emailInput.toLowerCase() && e.password === passwordInput);
    if (eUser) {
      setUser({
        uid: eUser.id,
        email: eUser.loginEmail,
        displayName: `${eUser.firstName} ${eUser.lastName}`,
        isCustom: true
      });
      setRole('EMPLOYEE');
      return;
    }

    // 4. Attempt Firebase Authentication
    console.log("DEBUG: Attempting login with:", emailInput, passwordInput);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      const firebaseUser = userCredential.user;
      
      // Fetch role from Firestore
      const userDoc = await getDocument<{ role: UserRole }>('users', firebaseUser.uid);
      if (userDoc) {
        setRole(userDoc.role);
        setUser(firebaseUser);
      } else {
        setLoginError('Usuário não possui perfil configurado.');
      }
      return;
    } catch (error) {
      console.error('Firebase Auth error:', error);
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    try {
      setEmailInput('');
      setPasswordInput('');
      if (user?.isCustom) {
        setUser(null);
        setRole('AGENCY');
        return;
      }
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const tabParam = params.get('tab');
    
    if (roleParam === 'REGISTRATION') {
      setRole('REGISTRATION');
    } else if (roleParam === 'EMPLOYEE') {
      setRole('EMPLOYEE');
    } else if (roleParam === 'COMPANY') {
      setRole('COMPANY');
    }

    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam === 'REGISTRATION') {
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
            <RegistrationForm onComplete={() => window.location.href = '/'} />
          </div>
        </ErrorBoundary>
      );
    }
    
    if (roleParam === 'COMPANY_REGISTRATION') {
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
            <CompanyRegistrationForm onComplete={() => window.location.href = '/'} />
          </div>
        </ErrorBoundary>
      );
    }

    return (
      <div className="min-h-screen flex bg-white overflow-hidden">
        {/* Left Side: Branding & Purpose */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-950 p-20 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full -mr-80 -mt-80 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full -ml-80 -mb-80 blur-[140px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-20">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 shadow-2xl transform -rotate-6">
                <Building2 size={28} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white font-display">StaffLink</h1>
            </div>
            
            <div className="space-y-8 max-w-xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-black text-white leading-[0.95] tracking-tight font-display"
              >
                Gestão de <br />
                <span className="text-slate-400 italic">Diaristas</span> <br />
                em tempo real.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-400 font-medium leading-relaxed max-w-md"
              >
                O ecossistema definitivo para agências que buscam automação, controle e excelência operacional.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl mt-12 group"
              >
                <img 
                  src="https://i.postimg.cc/DzDWGjNx/Chat-GPT-Image-30-de-mar-de-2026-02-01-43.png" 
                  alt="StaffLink Dashboard" 
                  className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-8 text-slate-500 text-sm font-medium">
            <span>© 2026 StaffLink Inc.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-[#FBFBFA]">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md space-y-10"
          >
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white">
                <Building2 size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter font-display">StaffLink</h1>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 font-display">Bem-vindo de volta.</h3>
              <p className="text-slate-500 font-medium">Acesse sua conta para gerenciar suas diarias.</p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 font-display">Esqueceu a senha?</h3>
                  <p className="text-slate-500 font-medium text-sm">Insira seu e-mail para receber um link de redefinição.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Cadastro</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      placeholder="seu-email@exemplo.com"
                      className="input-modern pl-12"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {resetStatus === 'SUCCESS' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium">
                    E-mail enviado com sucesso! Verifique sua caixa de entrada.
                  </div>
                )}

                {resetStatus === 'ERROR' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {resetErrorMessage || 'Erro ao enviar e-mail. Verifique se o endereço está correto.'}
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    type="submit" 
                    disabled={resetStatus === 'LOADING'}
                    className="btn-modern-primary w-full h-14 text-lg disabled:opacity-50"
                  >
                    {resetStatus === 'LOADING' ? 'Enviando...' : 'Enviar Link de Redefinição'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all"
                  >
                    Voltar para o Login
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        placeholder="exemplo@stafflink.com"
                        className="input-modern pl-12"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                      <button 
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="input-modern pl-12"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium"
                    >
                      <AlertCircle size={18} />
                      {loginError}
                    </motion.div>
                  )}

                  <button type="submit" className="btn-modern-primary w-full h-14 text-lg">
                    Entrar na Plataforma
                    <ChevronRight size={20} />
                  </button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#FBFBFA] px-4 text-slate-400 font-bold tracking-widest">Ou continue com</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogin}
                  className="btn-modern-secondary w-full h-14 flex items-center justify-center gap-3"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  Google Workspace
                </button>
              </>
            )}

            <div className="pt-8 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Ainda não é parceiro? <br />
                <a href="?role=COMPANY_REGISTRATION" className="text-slate-950 font-black hover:underline decoration-2 underline-offset-4">Cadastre sua empresa</a> ou <a href="?role=REGISTRATION" className="text-slate-950 font-black hover:underline decoration-2 underline-offset-4">seja um diarista</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (role === 'REGISTRATION') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
          <RegistrationForm 
            onComplete={() => setRole('EMPLOYEE')} 
          />
        </div>
      </ErrorBoundary>
    );
  }

  if (role === 'COMPANY_REGISTRATION') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
          <CompanyRegistrationForm 
            onComplete={() => setRole('COMPANY')} 
          />
        </div>
      </ErrorBoundary>
    );
  }

  if (needsPasswordChange && user) {
    return (
      <ErrorBoundary>
        <ChangePasswordScreen 
          user={user} 
          onComplete={() => setNeedsPasswordChange(false)} 
          handleLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
        <Sidebar 
          role={role} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userEmail={user.email}
          userName={user.displayName}
          userPhoto={user.photoURL}
          handleLogout={handleLogout}
        />

        <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
          <Header 
            activeTab={activeTab} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
            user={user}
            role={role}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
              <AnimatePresence mode="wait">
                {role === 'AGENCY' && activeTab === 'user_management' && (
                  <div key="agency-user-management">
                    <UserManagement 
                      employees={employees}
                      companyUsers={companyUsers}
                      role={role}
                    />
                  </div>
                )}
                {activeTab === 'profile' && (
                  <div key="user-profile">
                    <UserProfile 
                      user={user}
                      role={role}
                      employee={role === 'EMPLOYEE' ? employees.find(e => e.loginEmail === user?.email) : undefined}
                      companyUser={role === 'COMPANY' ? companyUsers.find(cu => cu.email === user?.email) : undefined}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'dashboard' && (
                  <div key="agency-dashboard">
                    <AgencyDashboard 
                      assignments={assignments}
                      employees={employees}
                      contacts={contacts}
                      employeeRegistrations={employeeRegistrations}
                      pricing={pricing}
                      ratingLabel={ratingLabel}
                      setActiveTab={setActiveTab}
                      clients={clients}
                      feedbacks={feedbacks}
                      companies={companies}
                      units={units}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'feedbacks' && (
                  <div key="agency-feedbacks">
                    <EmployeeFeedbackView 
                      feedbacks={feedbacks}
                      employees={employees}
                      clients={clients}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'registrations' && (
                  <div key="agency-registrations">
                    <AgencyRegistrations 
                      employees={employees}
                      clients={clients}
                      ratingLabel={ratingLabel}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'staffing' && (
                  <div key="agency-staffing">
                    <AgencyStaffing 
                      employees={employees}
                      assignments={assignments}
                      clients={clients}
                      getScaleValue={getScaleValue}
                      companyRequests={companyRequests}
                      companies={companies}
                      units={units}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'access_control' && (
                  <div key="agency-access-control">
                    <AgencyAccessControl 
                      accessPoints={accessPoints}
                      clients={clients}
                      units={units}
                      companies={companies}
                      checkIns={checkIns}
                      employees={employees}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'companies' && (
                  <div key="agency-companies">
                    <AgencyCompanies 
                      companies={companies}
                      units={units}
                      companyUsers={companyUsers}
                      clients={clients}
                    />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'pricing' && (
                  <div key="agency-pricing">
                    <AgencyPricing 
                      pricing={pricing}
                      ratingLabel={ratingLabel}
                      setPricing={setPricing}
                      setRatingLabel={setRatingLabel}
                    />
                  </div>
                )}
                
                {role === 'COMPANY' && activeTab === 'manager_dashboard' && (
                  <div key="company-dashboard">
                    <CompanyDashboard 
                      clientId={companyUsers.find(cu => cu.email === user?.email)?.companyId || ''} 
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'manager_feedback' && (
                  <div key="company-feedback">
                    <CompanyFeedbackForm 
                      clientId={companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'company_diaristas' && (
                  <div key="company-diaristas">
                    <CompanyDiaristas 
                      clientId={companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
                      clients={clients}
                      employees={employees}
                      assignments={assignments}
                      companies={companies}
                      units={units}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'evaluate_team' && (
                  <div key="company-evaluate">
                    <CompanyEvaluateTeam 
                      clientId={companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'company_profile' && (
                  <div key="company-profile">
                    <CompanyProfile 
                      companyUserId={user.uid}
                      companyUsers={companyUsers}
                      companies={companies}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_schedule' && (
                  <div key="employee-schedule">
                    <EmployeeSchedule 
                      employeeId={employees.find(e => e.loginEmail === user?.email)?.id || ''} 
                      employees={employees}
                      assignments={assignments}
                      notifications={notifications}
                      clients={clients}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_profile' && (
                  <div key="employee-profile">
                    <EmployeeProfile 
                      employeeId={employees.find(e => e.loginEmail === user?.email)?.id || ''}
                      employees={employees}
                      assignments={assignments}
                      notifications={notifications}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_ponto' && (
                  <div key="employee-ponto">
                    <EmployeePonto 
                      employeeId={employees.find(e => e.loginEmail === user?.email)?.id || ''}
                      employees={employees}
                      accessPoints={accessPoints}
                      checkIns={checkIns}
                      assignments={assignments}
                    />
                  </div>
                )}
              </AnimatePresence>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}


function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, key?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-slate-950 text-white shadow-2xl shadow-slate-900/20' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <div className={`transition-all duration-300 ${active ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-slate-950 group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}

function AgencyDashboard({ assignments, employees, contacts, employeeRegistrations, pricing, ratingLabel, setActiveTab, clients, feedbacks, companies, units }: { assignments: Assignment[], employees: Employee[], contacts: ContactRequest[], employeeRegistrations: EmployeeRegistration[], pricing: PricingConfig, ratingLabel: string, setActiveTab: (tab: string) => void, clients: Client[], feedbacks: Feedback[], companies: Company[], units: Unit[] }) {
  const [selectedRegistration, setSelectedRegistration] = useState<EmployeeRegistration | null>(null);
  const [showProcessRegistrationModal, setShowProcessRegistrationModal] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [evaluatingEmployee, setEvaluatingEmployee] = useState<Employee | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  
  const toggleCompany = (id: string) => {
    setExpandedCompanies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEvaluate = async () => {
    if (!evaluatingEmployee) return;
    setIsSubmittingEval(true);
    try {
      const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const assignment = assignments.find(a => a.employeeId === evaluatingEmployee.id && a.date === today);
      
      const newFeedback: Omit<Feedback, 'id'> = {
        employeeId: evaluatingEmployee.id,
        managerId: assignment?.clientId || 'agency',
        assignmentId: assignment?.id || 'manual',
        rating: evalRating,
        comment: evalComment,
        date: new Date().toISOString()
      };
      await createDocument('feedbacks', newFeedback);
      
      const newRating = Math.round((evaluatingEmployee.rating + evalRating) / 2);
      await updateDocument('employees', evaluatingEmployee.id, { rating: newRating });
      
      setEvaluatingEmployee(null);
      setEvalComment('');
      setEvalRating(5);
      alert('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const todayAssignments = assignments.filter(a => a.date === today);
  const totalValue = todayAssignments.reduce((acc, curr) => acc + curr.value, 0);
  const activeClients = new Set(todayAssignments.map(a => a.clientId)).size;
  const pendingContacts = contacts.filter(c => c.status === 'PENDING').length;

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = daysOfWeek[new Date().getDay()];

  // Grouping logic for AgencyDashboard
  const groupedByCompany = todayAssignments.reduce((acc, as) => {
    const unit = units.find(u => u.clientId === as.clientId);
    const companyId = unit?.companyId || as.clientId; // Fallback to clientId if no unit found
    if (!acc[companyId]) acc[companyId] = { assignments: [], units: {} };
    
    acc[companyId].assignments.push(as);
    
    if (unit) {
      if (!acc[companyId].units[unit.id]) acc[companyId].units[unit.id] = [];
      acc[companyId].units[unit.id].push(as);
    } else {
      if (!acc[companyId].units['default']) acc[companyId].units['default'] = [];
      acc[companyId].units['default'].push(as);
    }
    
    return acc;
  }, {} as Record<string, { assignments: Assignment[], units: Record<string, Assignment[]> }>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Visão Geral</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Acompanhe o desempenho da sua agência hoje.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users size={24} />} 
          label="Diaristas Agendados" 
          value={todayAssignments.length.toString()} 
          trend="+12%"
          color="blue"
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Faturamento Hoje" 
          value={`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          trend={`R$ ${(totalValue / (todayAssignments.length || 1)).toFixed(0)}/avg`}
          color="emerald"
        />
        <StatCard 
          icon={<Building2 size={24} />} 
          label="Empresas Atendidas" 
          value={activeClients.toString()} 
          trend="Ativo"
          color="purple"
        />
        <StatCard 
          icon={<Phone size={24} />} 
          label="Novos Contatos" 
          value={pendingContacts.toString()} 
          trend={pendingContacts > 0 ? "Urgente" : "Limpo"}
          alert={pendingContacts > 0}
          color="orange"
        />
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 transition-all group-hover:scale-110 duration-1000"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-slate-950/20 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                {pricing.type === 'STARS' ? <Star size={32} className="fill-yellow-400 text-yellow-400" /> : <Calendar size={32} />}
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Tabela de Preços {pricing.type === 'STARS' ? `por ${ratingLabel}` : 'por Dia'}
                </h3>
                <p className="text-sm text-slate-400 font-medium tracking-wide">Valores baseados na configuração atual do sistema.</p>
              </div>
            </div>
            {pricing.type === 'DAILY' && (
              <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 w-fit shadow-sm">
                Hoje: {todayName}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pricing.type === 'STARS' ? (
              Object.entries(pricing.stars || {}).map(([stars, p]) => (
                <div key={stars} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-6 hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group/price relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover/price:scale-150 duration-700"></div>
                  <div className="flex gap-1.5 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < parseInt(stars) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">R$ {(p.employee + p.company).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Valor por diária</p>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative z-10">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(parseInt(stars) / 5) * 100}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => {
                const p = pricing.weekly?.[day] || { employee: 0, company: 0 };
                const isToday = day === todayName;
                return (
                  <div key={day} className={`p-8 rounded-[2.5rem] border flex flex-col items-center gap-6 transition-all group/price relative overflow-hidden ${isToday ? 'bg-slate-950 border-slate-950 text-white shadow-2xl shadow-slate-950/30 scale-105 z-10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10'}`}>
                    {isToday && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{day}</span>
                    <div className="text-center">
                      <p className={`text-3xl font-black tracking-tight ${isToday ? 'text-white' : 'text-slate-900'}`}>R$ {(p.employee + p.company).toFixed(2)}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-3 ${isToday ? 'text-slate-500' : 'text-slate-400'}`}>Valor por diária</p>
                    </div>
                    {isToday && (
                      <div className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                        Vigente Agora
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700"></div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-2xl shadow-slate-950/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Diarias do Dia</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Diaria ativa hoje</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('agency_staffing')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm active:scale-95"
            >
              Ver Agenda
            </button>
          </div>
          <div className="space-y-8 relative z-10">
            {todayAssignments.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                  <Calendar size={40} />
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-tight italic">Nenhuma diaria programada para hoje.</p>
              </div>
            ) : (
              Object.entries(groupedByCompany).map(([companyId, data]) => {
                const company = companies.find(c => c.id === companyId);
                const client = clients.find(c => c.id === companyId);
                const companyName = company?.name || client?.name || 'Empresa não encontrada';
                const isExpanded = expandedCompanies[companyId] === true;
                
                return (
                  <div key={companyId} className="space-y-4">
                    <button 
                      onClick={() => toggleCompany(companyId)}
                      className="w-full flex items-center gap-3 px-2 group/header"
                    >
                      <div className={`w-8 h-8 rounded-lg ${isExpanded ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} flex items-center justify-center border border-blue-100 transition-all`}>
                        <Building2 size={16} />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{companyName}</h4>
                      <div className="flex-1 h-px bg-slate-100"></div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.assignments.length} Diárias</span>
                        <div className={`p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover/header:bg-blue-50 group-hover/header:text-blue-600 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="space-y-6 pl-4 border-l-2 border-slate-50 ml-4">
                        {Object.entries(data.units).map(([unitId, unitAssignments]) => {
                          const unit = units.find(u => u.id === unitId);
                          const unitName = unit?.name || 'Geral';
                          
                          return (
                            <div key={unitId} className="space-y-3">
                              <div className="flex items-center gap-2">
                                <MapPin size={12} className="text-slate-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{unitName}</span>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {unitAssignments.map(as => {
                                  const emp = employees.find(e => e.id === as.employeeId);
                                  return (
                                    <div key={as.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all group/item relative overflow-hidden gap-4 sm:gap-6">
                                      <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-lg sm:shadow-xl group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500 shrink-0">
                                          <img 
                                            src={emp?.photoUrl || `https://picsum.photos/seed/${emp?.id}/200`} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-black text-slate-950 text-sm sm:text-lg tracking-tight group-hover/item:text-blue-600 transition-colors truncate">{emp?.firstName} {emp?.lastName}</p>
                                          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-0.5 sm:mt-1">
                                            <p className="text-[8px] sm:text-[10px] text-blue-600 font-black uppercase tracking-widest">08:00 - 17:00</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 relative z-10 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                        <div className="flex items-center gap-2">
                                          {as.status === 'COMPLETED' && !feedbacks.some(f => f.assignmentId === as.id) && (
                                            <button 
                                              onClick={() => setEvaluatingEmployee(emp || null)}
                                              className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                              title="Avaliar Profissional"
                                            >
                                              <Star size={14} />
                                            </button>
                                          )}
                                          <p className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">R$ {as.value.toFixed(2)}</p>
                                        </div>
                                        <span className={`px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${
                                          as.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                          as.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                          'bg-slate-50 text-slate-400 border-slate-200'
                                        }`}>
                                          {as.status === 'COMPLETED' ? 'Concluído' : as.status === 'SCHEDULED' ? 'Agendado' : 'Cancelado'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700"></div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-2xl shadow-slate-950/20 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Novos Contatos</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Leads do site</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-100 shadow-sm">
              {contacts.filter(c => c.status === 'PENDING').length + employeeRegistrations.filter(r => r.status === 'PENDING').length} Pendentes
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            {contacts.filter(c => c.status === 'PENDING').length === 0 && employeeRegistrations.filter(r => r.status === 'PENDING').length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                  <CheckCircle size={40} />
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-tight italic">Tudo em dia por aqui.</p>
              </div>
            ) : (
              <>
                {contacts.filter(c => c.status === 'PENDING').map(c => (
                  <div key={c.id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-500/5 transition-all group/contact">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-xl border border-slate-100 group-hover/contact:scale-110 group-hover/contact:rotate-3 transition-transform duration-500">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-950 text-base tracking-tight">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{c.phone}</p>
                      </div>
                    </div>
                    <button className="p-4 bg-slate-950 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 group/btn">
                      <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
                {employeeRegistrations.filter(r => r.status === 'PENDING').map(r => (
                  <div key={r.id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 bg-emerald-50/30 hover:bg-white hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group/reg">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-xl border border-slate-100 group-hover/reg:scale-110 group-hover/reg:-rotate-3 transition-transform duration-500">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-950 text-base tracking-tight">{r.firstName} {r.lastName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{r.phone}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedRegistration(r);
                        setShowProcessRegistrationModal(true);
                      }}
                      className="p-4 bg-slate-950 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95 group/btn"
                    >
                      <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {showProcessRegistrationModal && selectedRegistration && (
          <ProcessRegistrationModal 
            registration={selectedRegistration}
            onClose={() => setShowProcessRegistrationModal(false)}
            onComplete={() => {
              setShowProcessRegistrationModal(false);
              setSelectedRegistration(null);
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {evaluatingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Avaliar Profissional</h3>
                  <button onClick={() => setEvaluatingEmployee(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                    <img src={evaluatingEmployee.photoUrl || `https://picsum.photos/seed/${evaluatingEmployee.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{evaluatingEmployee.firstName} {evaluatingEmployee.lastName}</p>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Profissional</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sua Nota</label>
                  <div className="flex items-center justify-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEvalRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          size={32}
                          className={star <= evalRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Comentário (Opcional)</label>
                  <textarea
                    value={evalComment}
                    onChange={(e) => setEvalComment(e.target.value)}
                    placeholder="Como foi o desempenho do profissional?"
                    className="w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 transition-colors min-h-[120px] text-slate-700 font-medium"
                  />
                </div>

                <button
                  onClick={handleEvaluate}
                  disabled={isSubmittingEval}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50"
                >
                  {isSubmittingEval ? 'Enviando...' : 'Confirmar Avaliação'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  variant = 'danger' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string, 
  confirmText?: string, 
  cancelText?: string,
  variant?: 'danger' | 'primary' | 'warning'
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-10 text-center"
          >
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              variant === 'danger' ? 'bg-rose-50 text-rose-600' : 
              variant === 'warning' ? 'bg-amber-50 text-amber-600' : 
              'bg-blue-50 text-blue-600'
            }`}>
              {variant === 'danger' ? <Trash2 size={40} /> : 
               variant === 'warning' ? <AlertCircle size={40} /> : 
               <CheckCircle size={40} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">{title}</h3>
            <p className="text-slate-500 font-medium mb-10">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 px-6 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg ${
                  variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 
                  variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 
                  'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value, trend, alert, color = 'blue' }: { icon: React.ReactNode, label: string, value: string, trend?: string, alert?: boolean, color?: 'blue' | 'indigo' | 'emerald' | 'orange' | 'purple' | 'rose' }) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]} border transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${colorClasses[color]} border`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform duration-300">{value}</h3>
      </div>
      {alert && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
      )}
    </div>
  );
}

function EmployeeSchedule({ employeeId, employees, assignments, notifications, clients }: { employeeId: string, employees: Employee[], assignments: Assignment[], notifications: Notification[], clients: Client[] }) {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'UNAVAILABILITY'>('SCHEDULE');
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const employee = employees.find(e => e.id === employeeId);
  const myAssignments = assignments.filter(a => a.employeeId === employeeId && a.status === 'SCHEDULED');
  const myNotifications = notifications.filter(n => n.userId === employeeId && !n.read);

  const handleConfirm = async (assignmentId: string) => {
    await updateDocument('assignments', assignmentId, { confirmed: true });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  if (!employee) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center space-y-6 shadow-sm">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100 rotate-6">
          <UserIcon size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Perfil não encontrado</h3>
          <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">Selecione um funcionário cadastrado no seletor de teste acima para visualizar a agenda.</p>
        </div>
      </div>
    );
  }

  const toggleUnavailability = async (date: string) => {
    if (!employee) return;
    const current = employee.unavailableDates || [];
    const exists = current.includes(date);
    const newDates = exists ? current.filter(d => d !== date) : [...current, date];
    await updateDocument('employees', employee.id, { unavailableDates: newDates });
  };

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-10 relative"
    >
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3"
          >
            <CheckCircle size={20} />
            Diaria confirmada com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Minha Agenda</h2>
        <p className="text-slate-500 font-medium text-xs sm:text-base">Gerencie suas diarias e informe sua disponibilidade.</p>
      </div>

      {/* Notifications Section */}
      {myNotifications.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Notificações Prioritárias</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {myNotifications.map(notification => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 text-white p-8 sm:p-12 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-950/40 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <Bell size={40} className="animate-bounce" />
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase">{notification.title}</h4>
                    <p className="text-base font-medium text-slate-400 max-w-md leading-relaxed">{notification.message}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-10">
                  <button 
                    onClick={async () => {
                      if (notification.assignmentId) {
                        await handleConfirm(notification.assignmentId);
                      }
                      await updateDocument('notifications', notification.id, { read: true });
                    }}
                    className="w-full sm:w-auto px-8 py-6 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95"
                  >
                    Confirmar
                  </button>
                  <button 
                    onClick={async () => {
                      if (notification.assignmentId) {
                        await updateDocument('assignments', notification.assignmentId, { status: 'CANCELLED' });
                      }
                      await updateDocument('notifications', notification.id, { read: true });
                    }}
                    className="w-full sm:w-auto px-8 py-6 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-2xl active:scale-95"
                  >
                    Recusar
                  </button>
                  <button 
                    onClick={() => updateDocument('notifications', notification.id, { read: true })}
                    className="p-6 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all hidden lg:block"
                  >
                    <X size={28} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 p-2 bg-slate-100 rounded-2xl w-full sm:w-fit border border-slate-200/50 mx-4 sm:mx-0">
        <button 
          onClick={() => setActiveTab('SCHEDULE')}
          className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'SCHEDULE' ? 'bg-white text-slate-950 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-950'}`}
        >
          Minhas Diarias
        </button>
        <button 
          onClick={() => setActiveTab('UNAVAILABILITY')}
          className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'UNAVAILABILITY' ? 'bg-white text-slate-950 shadow-xl shadow-slate-900/5' : 'text-slate-500 hover:text-slate-950'}`}
        >
          Indisponibilidade
        </button>
      </div>

      {activeTab === 'SCHEDULE' ? (
        <div className="grid grid-cols-1 gap-6 px-4 sm:px-0">
          {myAssignments.length === 0 ? (
            <div className="bg-white p-12 sm:p-24 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                <Calendar size={40} className="sm:hidden" />
                <Calendar size={48} className="hidden sm:block" />
              </div>
              <p className="text-slate-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">Você não tem diarias agendadas no momento.</p>
            </div>
          ) : (
            myAssignments.map(as => {
              const cli = clients.find(c => c.id === as.clientId);
              const locationDisplay = cli?.location?.startsWith('http') ? 'Ver no Mapa' : (cli?.location || 'Unidade Central');
              return (
                <div key={as.id} className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8 hover:shadow-2xl hover:shadow-slate-900/5 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="flex items-center gap-4 sm:gap-8 relative z-10">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner shrink-0">
                      <Building2 size={24} className="sm:hidden" />
                      <Building2 size={36} className="hidden sm:block" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-950 text-lg sm:text-2xl tracking-tight uppercase group-hover:text-blue-600 transition-colors truncate">{cli?.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-[9px] sm:text-[10px] font-black text-slate-400 mt-2 sm:mt-3 uppercase tracking-widest">
                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors shadow-sm"><Calendar size={12} className="text-blue-600" /> {formatDateBR(as.date)}</span>
                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors shadow-sm"><Clock size={12} className="text-blue-600" /> 08:00 - 17:00</span>
                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors shadow-sm max-w-[120px] sm:max-w-none">
                          <MapPin size={12} className="text-blue-600" /> 
                          <span className="truncate">{locationDisplay}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-4 pt-6 sm:pt-0 border-t sm:border-t-0 border-slate-50 relative z-10">
                    <div className="text-left sm:text-right">
                      <p className="text-2xl sm:text-4xl font-black text-emerald-600 tracking-tight">R$ {as.value.toFixed(2)}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">Valor Líquido</p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 border border-blue-500">Confirmado</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white p-10 sm:p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-1000"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12 relative z-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Indisponibilidade</h3>
              <p className="text-sm text-slate-400 font-medium">Selecione os dias que você NÃO poderá trabalhar.</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <button onClick={prevMonth} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-950">
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-slate-950 min-w-[140px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button onClick={nextMonth} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-950">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative z-10">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {[...Array(firstDayOfMonth)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isUnavailable = employee?.unavailableDates?.includes(dateStr);
                const isPast = new Date(currentYear, currentMonth, day) < new Date(new Date().setHours(0,0,0,0));
                
                return (
                  <button 
                    key={day}
                    disabled={isPast}
                    onClick={() => toggleUnavailability(dateStr)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative group/day ${
                      isUnavailable 
                        ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 scale-105 z-10' 
                        : isPast
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'
                        : 'bg-slate-50 text-slate-700 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-200 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-sm sm:text-lg font-black tracking-tight">{day}</span>
                    {isUnavailable && <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5 hidden sm:block">Indisponível</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex items-start gap-6 p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group/info">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 transition-transform group-hover/info:scale-150 duration-700"></div>
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/20 rotate-3 group-hover/info:rotate-0 transition-transform duration-500 relative z-10">
              <Info size={28} />
            </div>
            <div className="relative z-10">
              <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">Importante</h4>
              <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
                Informe sua indisponibilidade com pelo menos 24h de antecedência. Dias marcados em vermelho indicam que você não receberá convites para diarias.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
function EmployeeFeedbackView({ feedbacks, employees, clients }: { feedbacks: Feedback[], employees: Employee[], clients: Client[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex flex-col gap-1 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Feedback dos Clientes</h2>
        <p className="text-slate-500 font-medium text-xs sm:text-base">Avaliações enviadas pelos gerentes das unidades.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 px-4 sm:px-0">
        {feedbacks.map(f => {
          const emp = employees.find(e => e.id === f.employeeId);
          return (
            <div key={f.id} className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 sm:gap-16 hover:shadow-2xl hover:shadow-slate-900/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-1000"></div>
              
              <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-6 sm:min-w-[240px] relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] bg-slate-50 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500">
                  <img src={`https://picsum.photos/seed/${emp?.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-center sm:text-left space-y-1 sm:space-y-2">
                  <p className="font-black text-slate-950 text-lg sm:text-xl tracking-tight uppercase">{emp?.firstName} {emp?.lastName}</p>
                  <div className="flex justify-center sm:justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-100'} />
                    ))}
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1 sm:pt-2">Avaliado por Gerente</p>
                </div>
              </div>
              
              <div className="flex-1 sm:border-l sm:border-slate-100 sm:pl-16 flex flex-col justify-center relative z-10">
                <div className="relative">
                  <span className="absolute -top-6 -left-4 sm:-top-10 sm:-left-6 text-6xl sm:text-8xl text-slate-100 font-serif pointer-events-none select-none">“</span>
                  <p className="text-slate-700 font-medium italic text-base sm:text-2xl leading-relaxed relative z-10">
                    {f.comment}
                  </p>
                  <span className="absolute -bottom-10 -right-4 sm:-bottom-16 sm:-right-6 text-6xl sm:text-8xl text-slate-100 font-serif pointer-events-none select-none rotate-180">“</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-3 mt-8 sm:mt-10 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors"><Calendar size={12} className="text-blue-600" /> {formatDateBR(f.date)}</span>
                  <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors"><Building2 size={12} className="text-blue-600" /> {clients.find(c => c.id === f.managerId)?.name || 'Unidade Parceira'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CreateUserModal({ employee, onClose, onComplete }: { employee: Employee, onClose: () => void, onComplete: (username: string) => void }) {
  const [username, setUsername] = useState(`${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase().split(' ')[0]}`);
  const [password, setPassword] = useState(Math.random().toString(36).slice(-8));
  const [isSending, setIsSending] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const emailForAuth = username.includes('@') ? username : `${username}@b11.com`;
      
      // 1. Create Firebase Auth user via Admin API
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailForAuth, 
          password, 
          displayName: `${employee.firstName} ${employee.lastName}` 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const { uid: newUid } = await response.json();

      // 2. Update employee record with the new UID (moving from old ID to new UID)
      const { id: oldId, ...employeeData } = employee;
      const updatedEmployeeData = { 
        ...employeeData,
        username, 
        loginEmail: emailForAuth,
        status: 'ACTIVE' 
      };
      
      await setDocument('employees', newUid, updatedEmployeeData);
      await deleteDocument('employees', oldId);

      // 3. Set user role
      await setDocument('users', newUid, { 
        role: 'EMPLOYEE', 
        email: employee.personalEmail,
        forcePasswordChange: true,
        createdAt: new Date().toISOString()
      });

      alert(`Usuário criado com sucesso! Credenciais enviadas para ${employee.personalEmail || employee.phone}.`);
      onComplete(username);
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Erro ao criar usuário: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Criar Usuário</h3>
            <p className="text-xs text-slate-400 font-medium">Defina as credenciais de acesso para {employee.firstName}.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome de Usuário</label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha Temporária</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setPassword(Math.random().toString(36).slice(-8))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 font-bold text-xs"
                >
                  Gerar Nova
                </button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                Um e-mail será enviado para <span className="underline">{employee.personalEmail || 'e-mail não informado'}</span> com estas credenciais.
              </p>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSending}
            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isSending ? 'Criando...' : 'Finalizar e Enviar Acesso'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ProcessRegistrationModal({ registration, onClose, onComplete }: { registration: EmployeeRegistration, onClose: () => void, onComplete: () => void }) {
  const [username, setUsername] = useState(`${registration.firstName.toLowerCase()}.${registration.lastName.toLowerCase().split(' ')[0]}`);
  const [password, setPassword] = useState(Math.random().toString(36).slice(-8));
  const [isSending, setIsSending] = useState(false);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // 1. Create Firebase Auth user via Admin API to avoid automatic sign-in
      const emailForAuth = username.includes('@') ? username : `${username}@b11.com`;
      console.log("DEBUG: Creating user with:", emailForAuth, password);
      
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailForAuth, 
          password, 
          displayName: `${registration.firstName} ${registration.lastName}` 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const { uid: newUid } = await response.json();

      // 2. Create employee record
      await setDocument('employees', newUid, {
        firstName: registration.firstName,
        lastName: registration.lastName,
        cpf: registration.cpf,
        birthDate: registration.birthDate,
        phone: registration.phone,
        personalEmail: registration.personalEmail,
        loginEmail: emailForAuth,
        lgpdAuthorized: registration.lgpdAuthorized,
        photoUrl: registration.photoUrl,
        docUrl: registration.docUrl,
        username,
        status: 'ACTIVE',
        rating: 5,
        complaints: 0,
        lastAssignmentDate: "",
        unavailableDates: []
      });

      // 3. Set user role
      await setDocument('users', newUid, { 
        role: 'EMPLOYEE', 
        email: registration.personalEmail,
        forcePasswordChange: true,
        createdAt: new Date().toISOString()
      });

      // 4. Mark registration as processed
      await updateDocument('employeeRegistrations', registration.id, { status: 'PROCESSED' });

      // 5. Simulate sending credentials
      console.log(`Enviando credenciais para ${registration.phone}...`);
      const message = `Olá ${registration.firstName}! Seu cadastro foi aprovado.\n\nUsuário: ${username}\nSenha: ${password}\n\nAcesse o sistema em: ${window.location.origin}`;
      const whatsappUrl = `https://wa.me/55${registration.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      alert(`Cadastro finalizado! Credenciais enviadas para ${registration.phone}.`);
      onComplete();
    } catch (error: any) {
      console.error('Error processing registration:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está cadastrado. Tente outro.');
      } else {
        alert('Erro ao processar cadastro. Verifique os dados e tente novamente.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Processar Cadastro</h3>
            <p className="text-xs text-slate-400 font-medium">Finalizar cadastro de {registration.firstName}.</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleProcess} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome de Usuário</label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha Temporária</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setPassword(Math.random().toString(36).slice(-8))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 font-bold text-xs"
                >
                  Gerar Nova
                </button>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSending}
            className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isSending ? 'Processando...' : 'Finalizar e Enviar Acesso'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AgencyRegistrations({ employees, clients, ratingLabel }: { employees: Employee[], clients: Client[], ratingLabel: string }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPhone, setLinkPhone] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [employeeToCreateUserFor, setEmployeeToCreateUserFor] = useState<Employee | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    personalEmail: '',
    lgpdAuthorized: false,
    photoUrl: '',
    docUrl: '',
  });

  const handleEdit = (emp: Employee) => {
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      cpf: emp.cpf,
      birthDate: emp.birthDate,
      phone: emp.phone,
      personalEmail: emp.personalEmail || '',
      lgpdAuthorized: emp.lgpdAuthorized || false,
      photoUrl: emp.photoUrl || '',
      docUrl: emp.docUrl || '',
    });
    setIsEditing(true);
    setShowForm(true);
    setSelectedEmployee(emp);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const inactiveEmployees = employees.filter(emp => {
    if (!emp.lastAssignmentDate) return false;
    const lastDate = new Date(emp.lastAssignmentDate);
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  });

  const highComplaintEmployees = employees.filter(emp => emp.complaints >= 3);

  const handleDeleteEmployee = (emp: Employee) => {
    setDeleteEmployee(emp);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteEmployee) {
      try {
        console.log(`DEBUG: Deleting user ${deleteEmployee.id} from Auth...`);
        const response = await fetch(`${window.location.origin}/api/delete-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            uid: deleteEmployee.id,
            email: deleteEmployee.loginEmail 
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error from delete-user API:', errorData);
        } else {
          console.log('Successfully called delete-user API');
        }
      } catch (error) {
        console.error('Failed to call delete-user API:', error);
      }
      
      await deleteDocument('employees', deleteEmployee.id);
      await deleteDocument('users', deleteEmployee.id);
      setDeleteEmployee(null);
      setSelectedEmployee(null);
    }
  };

  const handleApprove = async (id: string) => {
    await updateDocument('employees', id, { status: 'ACTIVE' });
    setSelectedEmployee(null);
  };

  const sendInactivityWarning = (emp: Employee) => {
    const message = `Olá ${emp.firstName}, notamos que você está há mais de 30 dias sem realizar diarias. Informamos que seu cadastro poderá ser removido dos nossos registros em breve. Caso tenha interesse em continuar, entre em contato!`;
    const whatsappUrl = `https://wa.me/55${emp.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Não foi possível acessar a câmera.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setFormData({ ...formData, photoUrl: photoData });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    const link = `${window.location.origin}?role=REGISTRATION`;
    const message = `Olá! Aqui está o link para o seu cadastro na agência: ${link}`;
    const cleanPhone = linkPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setShowLinkModal(false);
    setLinkPhone('');
  };

  const handleRegister = async (e: React.FormEvent) => {
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

    if (isEditing && selectedEmployee) {
      await updateDocument('employees', selectedEmployee.id, formData);
      alert('Cadastro atualizado com sucesso!');
    } else {
      const newEmp: Omit<Employee, 'id'> = {
        ...formData,
        rating: 1,
        status: 'PENDING',
        complaints: 0,
      };
      await createDocument('employees', newEmp);
      alert('Funcionário cadastrado com sucesso!');
    }

    setShowForm(false);
    setIsEditing(false);
    setSelectedEmployee(null);
    setFormData({ firstName: '', lastName: '', cpf: '', birthDate: '', phone: '', personalEmail: '', lgpdAuthorized: false, photoUrl: '', docUrl: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-10"
    >
      <AnimatePresence>
        {showCreateUserModal && employeeToCreateUserFor && (
          <CreateUserModal 
            employee={employeeToCreateUserFor}
            onClose={() => {
              setShowCreateUserModal(false);
              setEmployeeToCreateUserFor(null);
            }}
            onComplete={() => {
              setShowCreateUserModal(false);
              setEmployeeToCreateUserFor(null);
            }}
          />
        )}
      </AnimatePresence>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-4xl font-black text-slate-900 tracking-tight">Gestão de Funcionários</h2>
          <p className="text-slate-500 font-medium text-[9px] sm:text-base">Cadastre novos talentos ou gerencie os atuais.</p>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowLinkModal(true)}
            className="flex-1 sm:w-auto flex items-center justify-center gap-1.5 px-2 py-2 border-2 border-blue-600 text-blue-600 rounded-lg sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[8px] sm:text-[9px] hover:bg-blue-50 transition-all active:scale-95"
          >
            <LinkIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
            Enviar Link
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex-1 sm:w-auto flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-600 text-white rounded-lg sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[8px] sm:text-[9px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus size={12} className="sm:w-[14px] sm:h-[14px]" />
            Novo Cadastro
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLinkModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Enviar Link</h3>
                  <p className="text-xs text-slate-400 font-medium">O link será enviado via WhatsApp.</p>
                </div>
                <button onClick={() => setShowLinkModal(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSendLink} className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp do Funcionário</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      value={linkPhone}
                      onChange={e => setLinkPhone(e.target.value)}
                      placeholder="Ex: 11999999999"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95">
                  <Phone size={20} />
                  Enviar via WhatsApp
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg sm:max-w-2xl overflow-hidden relative"
          >
            {isCameraOpen && (
              <div className="absolute inset-0 z-50 bg-black flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="p-4 flex justify-center gap-4 bg-black/50 backdrop-blur-md">
                  <button onClick={stopCamera} className="p-3 bg-white/10 text-white rounded-full hover:bg-red-600 transition-all border border-white/20"><X size={20} /></button>
                  <button onClick={takePhoto} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/50"><Camera size={20} /></button>
                </div>
              </div>
            )}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{isEditing ? 'Editar Cadastro' : 'Cadastro Direto'}</h3>
                <p className="text-[10px] text-slate-400 font-medium">{isEditing ? 'Atualize os dados.' : 'Preencha os dados.'}</p>
              </div>
              <button onClick={() => { setShowForm(false); setIsEditing(false); setSelectedEmployee(null); }} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nome</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sobrenome</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">CPF</label>
                  <input 
                    required
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Data de Nascimento</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">E-mail Pessoal</label>
                <input 
                  required
                  type="email" 
                  className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                  value={formData.personalEmail}
                  onChange={e => setFormData({...formData, personalEmail: e.target.value})}
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <input 
                  required
                  type="checkbox" 
                  id="lgpd-agency"
                  className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  checked={formData.lgpdAuthorized}
                  onChange={e => setFormData({...formData, lgpdAuthorized: e.target.checked})}
                />
                <label htmlFor="lgpd-agency" className="text-[9px] text-slate-500 font-medium leading-relaxed">
                  Autorizo o uso dos dados conforme a LGPD.
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Foto Profissional</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={startCamera}
                    className="p-4 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-all bg-slate-50/50 group"
                  >
                    <Camera size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Câmera</p>
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-300 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer transition-all bg-slate-50/50 group"
                  >
                    <Upload size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Galeria</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleGalleryUpload} 
                    />
                  </div>
                </div>
              </div>
                {formData.photoUrl && (
                  <div className="flex justify-center mt-4">
                    <div className="relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group">
                      <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={32} className="text-white" />
                      </div>
                    </div>
                  </div>
                )}
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                {isEditing ? 'Salvar Alterações' : 'Finalizar Cadastro'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white border border-slate-200 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base md:text-lg">Inatividade</h3>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium">+30 dias sem diarias</p>
              </div>
            </div>
            <span className="bg-orange-100 text-orange-700 text-[9px] md:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
              {inactiveEmployees.length} Alertas
            </span>
          </div>
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {inactiveEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                <CheckCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium italic">Tudo em dia!</p>
              </div>
            ) : (
              inactiveEmployees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-white transition-all group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                      {emp.firstName[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{emp.firstName} {emp.lastName}</span>
                  </div>
                  <button 
                    onClick={() => sendInactivityWarning(emp)}
                    className="text-[10px] bg-white text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm"
                  >
                    Notificar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Reclamações</h3>
                <p className="text-xs text-slate-400 font-medium">Críticas recorrentes</p>
              </div>
            </div>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
              {highComplaintEmployees.length} Críticos
            </span>
          </div>
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {highComplaintEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                <CheckCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium italic">Nenhuma queixa.</p>
              </div>
            ) : (
              highComplaintEmployees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-white transition-all group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">
                      {emp.firstName[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{emp.firstName} {emp.lastName}</span>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl font-bold border border-rose-100">
                    {emp.complaints} Queixas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Base de Funcionários</h3>
          <div className="flex gap-2">
            <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total: {employees.length}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionário</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Documento</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Nascimento</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Performance</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] sm:text-xs border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          emp.firstName[0]
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[10px] sm:text-xs group-hover:text-blue-600 transition-colors">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold tracking-tight">{emp.phone}</p>
                        {emp.personalEmail && <p className="text-[8px] sm:text-[9px] text-blue-500 font-bold tracking-tight hidden sm:block">{emp.personalEmail}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4 text-[9px] sm:text-[10px] text-slate-500 font-mono tracking-tighter hidden sm:table-cell">{emp.cpf}</td>
                  <td className="p-2 sm:p-4 text-[9px] sm:text-[10px] text-slate-500 font-medium hidden sm:table-cell">{formatDateBR(emp.birthDate)}</td>
                  <td className="p-2 sm:p-4 hidden md:table-cell">
                    <div className="flex gap-0.5 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  </td>
                  <td className="p-2 sm:p-4">
                    <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg font-black uppercase tracking-wider border ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      emp.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100/50' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {emp.status === 'ACTIVE' ? 'Ativo' : emp.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                      {emp.status === 'PENDING' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmployeeToCreateUserFor(emp);
                            setShowCreateUserModal(true);
                          }}
                          className="text-[8px] sm:text-[10px] bg-blue-600 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                          Criar Usuário
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(emp)}
                        className="p-1.5 sm:p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-all"
                        title="Editar Cadastro"
                      >
                        <UserPlus className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(emp)}
                        className="p-1.5 sm:p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <div className="p-0.5 sm:p-1 text-slate-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {employees.map(emp => (
            <div 
              key={emp.id} 
              className="p-6 space-y-4 active:bg-slate-50 transition-colors"
              onClick={() => setSelectedEmployee(emp)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      emp.firstName[0]
                    )}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-base">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.phone}</p>
                  </div>
                </div>
                <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${
                  emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  emp.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {emp.status === 'ACTIVE' ? 'Ativo' : emp.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Documento</p>
                  <p className="text-xs font-bold text-slate-600">{emp.cpf}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-4" onClick={e => e.stopPropagation()}>
                {emp.status === 'PENDING' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmployeeToCreateUserFor(emp);
                      setShowCreateUserModal(true);
                    }}
                    className="flex-1 min-w-[120px] text-[9px] bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-100"
                  >
                    Criar Usuário
                  </button>
                )}
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleEdit(emp)}
                    className="flex-1 p-2.5 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Editar</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(emp)}
                    className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Excluir Cadastro"
        message="Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita."
      />

      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 sm:px-8 pb-6 sm:pb-8">
                <div className="relative -mt-8 sm:-mt-12 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.25rem] sm:rounded-[1.5rem] border-4 border-white bg-slate-100 overflow-hidden shadow-xl shrink-0">
                    <img src={selectedEmployee.photoUrl || `https://picsum.photos/seed/${selectedEmployee.id}/400`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="pb-1 sm:pb-2 text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <div className="flex gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < selectedEmployee.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                        ))}
                      </div>
                      <span className="text-[9px] sm:text-xs font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg">({selectedEmployee.rating}.0)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Informações Gerais</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <CreditCard size={14} />
                          </div>
                          <div>
                            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Documento</p>
                            <p className="text-[11px] sm:text-xs font-mono font-bold text-slate-700">{selectedEmployee.cpf}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">Nascimento</p>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-700">{formatDateBR(selectedEmployee.birthDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Phone size={14} />
                          </div>
                          <div>
                            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">WhatsApp</p>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-700">{selectedEmployee.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Status Operacional</h4>
                      <span className={`text-[8px] sm:text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border shadow-sm ${
                        selectedEmployee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        selectedEmployee.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {selectedEmployee.status === 'ACTIVE' ? 'Ativo' : selectedEmployee.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Histórico & Feedback</h4>
                      <div className="bg-slate-50 p-4 sm:p-5 rounded-[1.25rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full -mr-8 -mt-8 transition-all group-hover:scale-150"></div>
                        <div className="flex items-center gap-2 text-rose-600 mb-3">
                          <AlertCircle size={16} />
                          <span className="text-[9px] font-black uppercase tracking-wider">{selectedEmployee.complaints} Reclamações</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed italic font-medium">"Funcionário demonstrou bom desempenho nas últimas diarias, porém precisa melhorar a pontualidade."</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button 
                        onClick={() => handleDeleteEmployee(selectedEmployee)}
                        className="w-full py-3.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100/30"
                      >
                        <Trash2 size={16} />
                        Excluir Registro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgencyStaffing({ employees, assignments, clients, getScaleValue, companyRequests, companies, units }: { employees: Employee[], assignments: Assignment[], clients: Client[], getScaleValue: (rating: number) => number, companyRequests: CompanyRequest[], companies: Company[], units: Unit[] }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [filterType, setFilterType] = useState<'RATING' | 'COMPLAINTS'>('RATING');
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'STAFFING' | 'CONFIRMED' | 'REQUESTS'>('STAFFING');
  const [activeRequest, setActiveRequest] = useState<CompanyRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

  const toggleCompany = (id: string) => {
    setExpandedCompanies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmedAssignments = assignments.filter(a => a.confirmed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Grouping logic for AgencyStaffing
  const groupedConfirmedByCompany = confirmedAssignments.reduce((acc, as) => {
    const unit = units.find(u => u.clientId === as.clientId);
    const companyId = unit?.companyId || as.clientId;
    if (!acc[companyId]) acc[companyId] = { assignments: [], units: {} };
    
    acc[companyId].assignments.push(as);
    
    if (unit) {
      if (!acc[companyId].units[unit.id]) acc[companyId].units[unit.id] = [];
      acc[companyId].units[unit.id].push(as);
    } else {
      if (!acc[companyId].units['default']) acc[companyId].units['default'] = [];
      acc[companyId].units['default'].push(as);
    }
    
    return acc;
  }, {} as Record<string, { assignments: Assignment[], units: Record<string, Assignment[]> }>);

  const sortedEmployees = [...employees]
    .filter(e => (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (filterType === 'RATING') return b.rating - a.rating;
      return a.complaints - b.complaints;
    });

  const handleAttendRequest = async (req: CompanyRequest) => {
    setActiveRequest(req);
    setSelectedClientId(req.clientId);
    setSelectedDate(req.date);
    setActiveSubTab('STAFFING');
    // Mark as being attended
    await updateDocument('companyRequests', req.id, { status: 'PENDING' });
  };

  const handleFinishRequest = async () => {
    if (activeRequest) {
      await updateDocument('companyRequests', activeRequest.id, { status: 'ACCEPTED' });
      setActiveRequest(null);
      alert('Solicitação finalizada com sucesso!');
    }
  };

  const handleStaff = async (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    const client = clients.find(c => c.id === selectedClientId);
    if (!emp || !client) return;

    const newAs: Omit<Assignment, 'id'> = {
      employeeId: empId,
      clientId: selectedClientId,
      date: selectedDate,
      value: getScaleValue(emp.rating),
      status: 'SCHEDULED',
      confirmed: false
    };

    const assignmentId = await createDocument('assignments', newAs);
    await updateDocument('employees', empId, { lastAssignmentDate: selectedDate });
    
    // Create internal notification
    await createDocument('notifications', {
      userId: empId,
      title: 'Nova Diaria Agendada',
      message: `Você foi agendado para ${client.name} no dia ${formatDateBR(selectedDate)}.`,
      type: 'ASSIGNMENT',
      read: false,
      createdAt: new Date().toISOString(),
      assignmentId: assignmentId,
      link: 'employee_profile'
    });
    
    // WhatsApp Notification with confirmation link
    const appUrl = window.location.origin;
    const confirmationLink = `${appUrl}?role=EMPLOYEE&tab=employee_profile`;
    const message = `Olá ${emp.firstName}! Você foi agendado para atuar na unidade ${client.name}.\n\n📅 Data: ${formatDateBR(selectedDate)}\n⏰ Horário: 08:00\n📍 Localização: ${client.location || client.name}\n\n✅ Por favor, confirme sua presença clicando no link abaixo:\n${confirmationLink}\n\n⚠️ Lembre-se: Há um QR Code na parede da unidade para você bater o ponto usando o app. Boa diaria!`;
    const whatsappUrl = `https://wa.me/55${emp.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    alert(`${emp.firstName} agendado com sucesso para o dia ${formatDateBR(selectedDate)}!`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {activeRequest && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-2xl shadow-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Atendendo Solicitação</h3>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">
                {clients.find(c => c.id === activeRequest.clientId)?.name} • {formatDateBR(activeRequest.date)} • {activeRequest.quantity} Profissionais
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Progresso</p>
              <p className="text-xl font-black">
                {assignments.filter(a => a.clientId === activeRequest.clientId && a.date === activeRequest.date).length} / {activeRequest.quantity}
              </p>
            </div>
            <button 
              onClick={handleFinishRequest}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all active:scale-95"
            >
              Finalizar
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Diaria Inteligente</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Distribua sua equipe com base em performance e disponibilidade.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl sm:rounded-[1.5rem] border border-slate-200 overflow-x-auto max-w-full no-scrollbar">
          <button 
            onClick={() => setActiveSubTab('STAFFING')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'STAFFING' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Agendar
          </button>
          <button 
            onClick={() => setActiveSubTab('CONFIRMED')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'CONFIRMED' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Confirmados
          </button>
          <button 
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'REQUESTS' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Solicitações
          </button>
        </div>
      </div>

      {activeSubTab === 'STAFFING' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                  Buscar Profissional
                </h3>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Nome do profissional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                />
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">2</div>
                Data da Diaria
              </h3>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 sm:p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
              />
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">3</div>
                Selecionar Parceiro
              </h3>
              <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {clients.map(cli => (
                  <button 
                    key={cli.id}
                    onClick={() => setSelectedClientId(cli.id)}
                    className={`w-full p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all border-2 ${
                      selectedClientId === cli.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1' 
                        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-blue-100'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-black text-xs sm:text-sm uppercase tracking-tight">{cli.name}</p>
                      <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedClientId === cli.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        Responsável: {cli.managerName}
                      </p>
                    </div>
                    {selectedClientId === cli.id && <CheckCircle size={18} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">4</div>
                Critério de Filtro
              </h3>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-[1.5rem]">
                <button 
                  onClick={() => setFilterType('RATING')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 sm:py-4 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === 'RATING' ? 'bg-white text-blue-600 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star size={16} className={filterType === 'RATING' ? 'fill-yellow-400 text-yellow-400' : ''} />
                  Estrelas
                </button>
                <button 
                  onClick={() => setFilterType('COMPLAINTS')}
                  className={`flex flex-col items-center justify-center gap-2 py-3 sm:py-4 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === 'COMPLAINTS' ? 'bg-white text-blue-600 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <AlertCircle size={16} />
                  Queixas
                </button>
              </div>
            </div>
          </div>

        <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm">5</div>
              Equipe Disponível
            </h3>
            <div className="px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 w-fit">
              <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {sortedEmployees.filter(e => !assignments.some(a => a.employeeId === e.id && a.date === selectedDate)).length} Disponíveis
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sortedEmployees.map(emp => {
              const isAssigned = assignments.some(a => a.employeeId === emp.id && a.date === selectedDate);
              const isRequested = activeRequest?.employeeIds.includes(emp.id);
              
              return (
                <div key={emp.id} className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all relative group ${
                  isAssigned 
                    ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
                    : isRequested
                    ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-500/5'
                    : 'bg-white border-slate-50 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1'
                }`}>
                  {isRequested && !isAssigned && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg z-20 animate-bounce">
                      Solicitado
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.25rem] bg-slate-100 overflow-hidden border-2 sm:border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                        <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base sm:text-lg leading-tight">{emp.firstName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={8} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                            ))}
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-black text-slate-400">({emp.rating}.0)</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-blue-100">
                      <p className="text-[9px] sm:text-[10px] text-blue-600 font-black uppercase tracking-widest">R$ {getScaleValue(emp.rating)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                      <span className={`text-[11px] sm:text-xs font-bold ${isAssigned ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isAssigned ? 'Já agendado' : 'Disponível'}
                      </span>
                    </div>
                    {!isAssigned && (
                      <button 
                        onClick={() => handleStaff(emp.id)}
                        className="px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                      >
                        Agendar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      ) : activeSubTab === 'CONFIRMED' ? (
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Profissionais Confirmados</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">Equipe que já confirmou presença para o dia selecionado.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 w-fit">
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  {assignments.filter(a => a.confirmed).length} Confirmados Total
                </span>
              </div>
            </div>
          </div>

          {confirmedAssignments.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <CheckCircle size={40} />
              </div>
              <p className="text-slate-400 font-medium">Nenhuma confirmação para esta data ainda.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedConfirmedByCompany).map(([companyId, companyData]) => {
                const company = companies.find(c => c.id === companyId);
                const client = clients.find(c => c.id === companyId);
                const companyName = company?.name || client?.name || 'Empresa não identificada';
                const isExpanded = expandedCompanies[companyId] === true;

                return (
                  <div key={companyId} className="space-y-6">
                    <button 
                      onClick={() => toggleCompany(companyId)}
                      className="w-full flex items-center gap-4 px-2 group/header"
                    >
                      <div className={`w-10 h-10 rounded-xl ${isExpanded ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center border border-emerald-100 transition-all`}>
                        <Building2 size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">{companyName}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{companyData.assignments.length} Profissionais Confirmados</p>
                      </div>
                      <div className="flex-1 h-px bg-slate-100"></div>
                      <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/header:bg-blue-50 group-hover/header:text-blue-600 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-8 pl-4 border-l-2 border-slate-100 ml-6"
                        >
                          {Object.entries(companyData.units).map(([unitId, unitAssignments]) => {
                            const unit = units.find(u => u.id === unitId);
                            const unitName = unit?.name || (unitId === 'default' ? 'Unidade Principal' : 'Unidade não identificada');

                            return (
                              <div key={unitId} className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                  <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">{unitName}</h5>
                                  <span className="text-[10px] font-bold text-slate-400">({unitAssignments.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                  {unitAssignments.map(as => {
                                    const emp = employees.find(e => e.id === as.employeeId);
                                    if (!emp) return null;
                                    return (
                                      <div key={as.id} className="p-5 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 flex flex-col gap-4 hover:border-emerald-200 hover:bg-white transition-all group">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                            <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                          </div>
                                          <div>
                                            <p className="font-black text-slate-900 text-sm sm:text-base">{emp.firstName} {emp.lastName}</p>
                                            <p className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">Confirmado para {formatDateBR(as.date)}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600">
                                            <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                                            <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest">Presença Confirmada</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-slate-400">
                                            <Clock size={10} />
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">08:00 - 17:00</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Solicitações das Empresas</h3>
              <p className="text-slate-400 text-[9px] sm:text-xs font-black uppercase tracking-widest">Pedidos de profissionais para datas específicas</p>
            </div>
          </div>

          <div className="space-y-6">
            {companyRequests.map(req => {
              const client = clients.find(c => c.id === req.clientId);
              return (
                <div key={req.id} className="p-6 sm:p-8 bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-slate-100 shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{client?.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} /> {formatDateBR(req.date)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Users size={12} /> {req.quantity} Profissionais
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex -space-x-3">
                      {req.employeeIds.map(empId => {
                        const emp = employees.find(e => e.id === empId);
                        return (
                          <div key={empId} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-slate-200" title={emp?.firstName}>
                            <img src={emp?.photoUrl || `https://picsum.photos/seed/${empId}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAttendRequest(req)}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                      >
                        Atender
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('Deseja recusar esta solicitação?')) {
                            await updateDocument('companyRequests', req.id, { status: 'REJECTED' });
                          }
                        }}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {companyRequests.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-medium italic">Nenhuma solicitação pendente.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function AgencyPricing({ pricing, ratingLabel, setPricing, setRatingLabel }: { pricing: PricingConfig, ratingLabel: string, setPricing: (p: PricingConfig) => void, setRatingLabel: (l: string) => void }) {
  const [localPricing, setLocalPricing] = useState<PricingConfig>(pricing);
  const [localLabel, setLocalLabel] = useState(ratingLabel);

  const handleSave = async () => {
    await setDocument('settings', 'pricing', { values: localPricing });
    await setDocument('settings', 'ratingLabel', { value: localLabel });
    setPricing(localPricing);
    setRatingLabel(localLabel);
    alert('Configurações salvas com sucesso!');
  };

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Configurações de Preço</h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Defina os valores das diárias e o sistema de classificação.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setLocalPricing({ ...localPricing, type: 'STARS' })}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${localPricing.type === 'STARS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Por {localLabel}
            </button>
            <button 
              onClick={() => setLocalPricing({ ...localPricing, type: 'DAILY' })}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${localPricing.type === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Por Dia
            </button>
          </div>
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <CheckCircle size={18} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm space-y-6 sm:space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              {localPricing.type === 'STARS' ? <Star size={20} /> : <Calendar size={20} />}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {localPricing.type === 'STARS' ? `Valores por ${localLabel}` : 'Valores por Dia da Semana'}
            </h3>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {localPricing.type === 'STARS' ? (
              ['1', '2', '3', '4', '5'].map(stars => (
                <div key={stars} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 hover:border-blue-200 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < Number(stars) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-600">{stars} {localLabel}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Funcionário Recebe</label>
                      <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within/input:text-blue-600 transition-colors">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                          value={localPricing.stars?.[stars]?.employee || 0}
                          onChange={e => {
                            const newStars = { ...(localPricing.stars || {}) };
                            newStars[stars] = { ...newStars[stars], employee: Number(e.target.value) };
                            setLocalPricing({ ...localPricing, stars: newStars });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Empresa Fica</label>
                      <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within/input:text-blue-600 transition-colors">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                          value={localPricing.stars?.[stars]?.company || 0}
                          onChange={e => {
                            const newStars = { ...(localPricing.stars || {}) };
                            newStars[stars] = { ...newStars[stars], company: Number(e.target.value) };
                            setLocalPricing({ ...localPricing, stars: newStars });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              daysOfWeek.map(day => (
                <div key={day} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 hover:border-blue-200 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">{day}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Funcionário Recebe</label>
                      <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within/input:text-blue-600 transition-colors">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                          value={localPricing.weekly?.[day]?.employee || 0}
                          onChange={e => {
                            const newWeekly = { ...(localPricing.weekly || {}) };
                            newWeekly[day] = { ...newWeekly[day], employee: Number(e.target.value) };
                            setLocalPricing({ ...localPricing, weekly: newWeekly });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Empresa Fica</label>
                      <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within/input:text-blue-600 transition-colors">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                          value={localPricing.weekly?.[day]?.company || 0}
                          onChange={e => {
                            const newWeekly = { ...(localPricing.weekly || {}) };
                            newWeekly[day] = { ...newWeekly[day], company: Number(e.target.value) };
                            setLocalPricing({ ...localPricing, weekly: newWeekly });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-10">
          <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm space-y-6 sm:space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Sistema de Classificação</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Classificação</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-sm sm:text-base text-slate-700"
                  placeholder="Ex: Estrelas, Nível, Categoria"
                  value={localLabel}
                  onChange={e => setLocalLabel(e.target.value)}
                />
                <p className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-medium italic">* Isso mudará como o sistema se refere à pontuação do funcionário.</p>
              </div>

              <div className="p-4 sm:p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 shrink-0" size={18} />
                  <p className="text-[11px] sm:text-xs text-blue-700 leading-relaxed font-medium">
                    Ao alterar o nome da classificação, todos os dashboards e relatórios serão atualizados automaticamente para refletir o novo termo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-black mb-4 tracking-tight">Resumo de Ganhos</h3>
            <p className="text-sm sm:text-base text-blue-100 mb-6 sm:mb-8 font-medium leading-relaxed">
              O valor total cobrado do cliente é a soma do que o funcionário recebe e a taxa da empresa.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <span className="text-xs sm:text-sm font-bold opacity-80">Média Funcionário</span>
                <span className="text-lg sm:text-xl font-black">R$ 65,00</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <span className="text-xs sm:text-sm font-bold opacity-80">Média Empresa</span>
                <span className="text-lg sm:text-xl font-black">R$ 15,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AgencyCompanies({ companies, units, companyUsers, clients }: { companies: Company[], units: Unit[], companyUsers: CompanyUser[], clients: Client[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState<string | null>(null);
  const [showDeleteCompanyConfirm, setShowDeleteCompanyConfirm] = useState<string | null>(null);
  const [showDeleteUnitConfirm, setShowDeleteUnitConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    responsibleName: '',
    cnpj: '',
    phone: '',
    email: '',
    address: ''
  });
  const [unitData, setUnitData] = useState({
    name: '',
    managerName: '',
    location: '',
    login: '',
    password: ''
  });
  const [userData, setUserData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const handleSendRegistrationLink = (company: Company) => {
    const link = `${window.location.origin}?role=COMPANY_REGISTRATION&companyId=${company.id}`;
    const message = `Olá ${company.responsibleName}! Aqui está o link para completar o cadastro da sua empresa no portal StaffLink: ${link}`;
    const cleanPhone = company.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteCompany = async (id: string) => {
    await deleteDocument('companies', id);
  };

  const handleDeleteUnit = async (id: string) => {
    await deleteDocument('units', id);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCompany: Omit<Company, 'id'> = {
      ...formData,
      createdAt: new Date().toISOString()
    };
    await createDocument('companies', newCompany);
    setShowAddModal(false);
    setFormData({ name: '', responsibleName: '', cnpj: '', phone: '', email: '', address: '' });
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUnitModal) return;
    const company = companies.find(c => c.id === showUnitModal);
    if (!company) return;

    const newUnit: Omit<Unit, 'id'> = {
      ...unitData,
      companyId: showUnitModal,
      createdAt: new Date().toISOString()
    };
    const unitId = await createDocument('units', newUnit);
    
    // Create a CompanyUser for the unit manager
    if (unitData.login && unitData.password) {
      const newUser: Omit<CompanyUser, 'id'> = {
        companyId: showUnitModal,
        unitId: unitId,
        fullName: unitData.managerName,
        email: unitData.login,
        password: unitData.password,
        role: 'COMPANY',
        createdAt: new Date().toISOString()
      };
      await createDocument('companyUsers', newUser);
    }
    
    // Also create a Client entry for the staffing system
    const newClient: Omit<Client, 'id'> = {
      name: `${company.name} - ${unitData.name}`,
      managerName: unitData.managerName,
      location: unitData.location,
      activeScales: 0
    };
    const clientId = await createDocument('clients', newClient);

    if (unitId && clientId) {
      await updateDocument('units', unitId, { clientId });
    }

    setShowUnitModal(null);
    setUnitData({ name: '', managerName: '', location: '', login: '', password: '' });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUserModal) return;
    if (userData.password !== userData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    const company = companies.find(c => c.id === showUserModal);
    if (!company) return;

    const domain = company.name.toLowerCase().replace(/\s+/g, '') + '.com';
    const login = `${userData.fullName.toLowerCase().replace(/\s+/g, '.')}@${domain}`;

    const newUser: Omit<CompanyUser, 'id'> = {
      companyId: showUserModal,
      fullName: userData.fullName,
      email: login,
      role: 'COMPANY',
      createdAt: new Date().toISOString()
    };

    // In a real app, we would use Firebase Auth to create the user with the password.
    // Here we just save to companyUsers collection for the demo.
    await createDocument('companyUsers', newUser);
    
    const message = `Olá ${userData.fullName}! Seu acesso ao portal StaffLink foi criado.\n\n📧 Login: ${login}\n🔑 Senha: ${userData.password}\n\nAcesse agora: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/55${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setShowUserModal(null);
    setUserData({ fullName: '', password: '', confirmPassword: '' });
    alert(`Usuário criado com sucesso!\nLogin: ${login}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Gestão de Parceiros</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Controle total sobre empresas, unidades e acessos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} />
          Cadastrar Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {companies.map(company => (
          <div key={company.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 transition-all group-hover:scale-150"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner shrink-0">
                  <Building2 size={28} className="sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ: {company.cnpj || 'Não informado'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <button 
                  onClick={() => setShowUserModal(company.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0"
                  title="Criar Acesso"
                >
                  <UserPlus size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => handleSendRegistrationLink(company)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shrink-0"
                  title="Enviar Link de Cadastro"
                >
                  <LinkIcon size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => setShowUnitModal(company.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shrink-0"
                  title="Adicionar Unidade"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => setShowDeleteCompanyConfirm(company.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm shrink-0"
                  title="Excluir Empresa"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 relative z-10">
              <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável</p>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{company.responsibleName}</p>
              </div>
              <div className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</p>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{company.phone}</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Unidades Operacionais</h4>
                <span className="bg-blue-50 text-blue-600 text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-lg">
                  {units.filter(u => u.companyId === company.id).length} Unidades
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {units.filter(u => u.companyId === company.id).map(unit => (
                  <div key={unit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group/unit gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/unit:bg-blue-50 group-hover/unit:text-blue-600 transition-all shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">{unit.name}</p>
                        {unit.location && (
                          <a 
                            href={unit.location.startsWith('http') ? unit.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unit.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 bg-blue-50 text-blue-600 rounded-xl text-[9px] sm:text-[10px] font-bold hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
                          >
                            <MapPin size={12} />
                            Ver Localização
                          </a>
                        )}
                        {unit.login && (
                          <p className="text-[9px] sm:text-[10px] text-blue-500 font-bold mt-1">Login: {unit.login}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">Gerente</p>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-600">{unit.managerName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowDeleteUnitConfirm(unit.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Excluir Unidade"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {units.filter(u => u.companyId === company.id).length === 0 && (
                  <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-medium italic">Nenhuma unidade cadastrada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ConfirmationModal 
        isOpen={!!showDeleteCompanyConfirm}
        onClose={() => setShowDeleteCompanyConfirm(null)}
        onConfirm={() => showDeleteCompanyConfirm && handleDeleteCompany(showDeleteCompanyConfirm)}
        title="Excluir Empresa"
        message="Deseja realmente excluir esta empresa? Todas as unidades e usuários vinculados serão mantidos, mas a empresa não aparecerá mais na lista."
      />

      <ConfirmationModal 
        isOpen={!!showDeleteUnitConfirm}
        onClose={() => setShowDeleteUnitConfirm(null)}
        onConfirm={() => showDeleteUnitConfirm && handleDeleteUnit(showDeleteUnitConfirm)}
        title="Excluir Unidade"
        message="Deseja realmente excluir esta unidade?"
      />

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nova Empresa</h3>
                  <p className="text-xs text-slate-400 font-medium">Preencha os dados básicos do parceiro.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddCompany} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Empresa</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Ex: Hotel Palace"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Responsável</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Nome completo"
                      value={formData.responsibleName}
                      onChange={e => setFormData({...formData, responsibleName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CNPJ</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={e => setFormData({...formData, cnpj: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">E-mail</label>
                    <input 
                      required
                      type="email" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="contato@empresa.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Endereço (Opcional)</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Rua, Número, Bairro, Cidade"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                  Salvar Empresa
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showUnitModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nova Unidade</h3>
                  <p className="text-xs text-slate-400 font-medium">Adicione um novo local de operação.</p>
                </div>
                <button onClick={() => setShowUnitModal(null)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddUnit} className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Unidade</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Ex: Unidade Centro"
                      value={unitData.name}
                      onChange={e => setUnitData({...unitData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gerente Responsável</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Nome do gerente"
                      value={unitData.managerName}
                      onChange={e => setUnitData({...unitData, managerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Localização / Endereço</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Endereço completo"
                      value={unitData.location}
                      onChange={e => setUnitData({...unitData, location: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Login do Responsável</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                        placeholder="Login"
                        value={unitData.login}
                        onChange={e => setUnitData({...unitData, login: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha</label>
                      <input 
                        required
                        type="password" 
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                        placeholder="••••••••"
                        value={unitData.password}
                        onChange={e => setUnitData({...unitData, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95">
                  Confirmar Unidade
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showUserModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Criar Acesso</h3>
                  <p className="text-xs text-slate-400 font-medium">Gere login e senha para o parceiro.</p>
                </div>
                <button onClick={() => setShowUserModal(null)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome Completo</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Nome do usuário"
                      value={userData.fullName}
                      onChange={e => setUserData({...userData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha de Acesso</label>
                    <input 
                      required
                      type="password" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={userData.password}
                      onChange={e => setUserData({...userData, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Confirmar Senha</label>
                    <input 
                      required
                      type="password" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={userData.confirmPassword}
                      onChange={e => setUserData({...userData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                  Gerar Login & Notificar
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompanyDiaristas({ clientId, clients, employees, assignments, companies, units }: { clientId: string, clients: Client[], employees: Employee[], assignments: Assignment[], companies: Company[], units: Unit[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientUnits = units.filter(u => u.clientId === clientId);
  
  useEffect(() => {
    if (clientUnits.length > 0 && !selectedUnitId) {
      setSelectedUnitId(clientUnits[0].id);
    }
  }, [clientUnits]);

  const filteredEmployees = employees.filter(emp => {
    if (emp.status !== 'ACTIVE') return false;
    if (emp.rating < minRating) return false;
    const matchesSearch = (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const isEmployeeAvailable = (empId: string, date: string) => {
    return !assignments.some(a => a.employeeId === empId && a.date === date && a.status !== 'CANCELLED');
  };

  const handleToggleEmployee = (empId: string) => {
    if (selectedEmployeeIds.includes(empId)) {
      setSelectedEmployeeIds(prev => prev.filter(id => id !== empId));
    } else {
      setSelectedEmployeeIds(prev => [...prev, empId]);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedUnitId) {
      alert('Selecione uma unidade.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newRequest: Omit<CompanyRequest, 'id'> = {
        companyId: units.find(u => u.id === selectedUnitId)?.companyId || '',
        clientId: clientId,
        employeeIds: selectedEmployeeIds,
        quantity: Math.max(quantity, selectedEmployeeIds.length),
        date: selectedDate,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      await createDocument('companyRequests', newRequest);
      alert('Solicitação enviada com sucesso para a agência!');
      setSelectedEmployeeIds([]);
      setQuantity(1);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Diaristas <Star size={32} className="fill-yellow-400 text-yellow-400" />
        </h2>
        <p className="text-slate-500 font-medium">Selecione os profissionais preferidos ou solicite reforço para suas unidades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-8 sticky top-24">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  <Filter size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Filtros</h3>
              </div>
              {(selectedUnitId !== clientUnits[0]?.id || minRating > 0 || quantity > 1) && (
                <button 
                  onClick={() => {
                    setSelectedUnitId(clientUnits[0]?.id || '');
                    setMinRating(0);
                    setQuantity(1);
                  }}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Buscar por Nome</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                    <Search size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ex: João Silva..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Unidade de Destino</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                    <Building2 size={16} />
                  </div>
                  <select 
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 appearance-none shadow-inner"
                  >
                    {clientUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Data da Diaria</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Total de Profissionais</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                    <Users size={16} />
                  </div>
                  <input 
                    type="number" 
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Classificação Mínima</label>
                  {minRating > 0 && <span className="text-[10px] font-black text-blue-600 uppercase">{minRating} Estrelas</span>}
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => setMinRating(star === minRating ? 0 : star)}
                      className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${minRating >= star ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/20 scale-105 z-10' : 'bg-white text-slate-300 hover:text-slate-400 hover:bg-slate-50'}`}
                    >
                      <Star size={18} className={minRating >= star ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Solicitar Diaria</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 font-bold text-center mt-4 uppercase tracking-widest">A agência receberá sua solicitação em tempo real.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map(emp => {
              const available = isEmployeeAvailable(emp.id, selectedDate);
              const isSelected = selectedEmployeeIds.includes(emp.id);
              return (
                <div 
                  key={emp.id} 
                  onClick={() => available && handleToggleEmployee(emp.id)}
                  className={`bg-white p-6 rounded-[2rem] border-2 transition-all group relative cursor-pointer overflow-hidden ${
                    isSelected ? 'border-blue-600 shadow-xl shadow-blue-500/10 bg-blue-50/5' : 
                    available ? 'border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-500/5' : 'border-slate-100 opacity-60 grayscale'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all ${isSelected ? 'bg-blue-600/5 scale-150' : 'bg-slate-50 group-hover:scale-150'}`}></div>
                  
                  {!available && (
                    <div className="absolute top-4 right-4 bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest z-20 border border-rose-100">
                      Indisponível
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-lg z-20 shadow-lg animate-in zoom-in duration-300">
                      <CheckCircle size={14} />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                      <img 
                        src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{emp.firstName} {emp.lastName}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                              key={s} 
                              size={10} 
                              className={s <= emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{emp.rating}.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Especialidade</span>
                      <span className="text-slate-900">{emp.role === 'DIARISTA' ? 'Diarista' : emp.role}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Status</span>
                      <span className={available ? 'text-emerald-600' : 'text-rose-600'}>
                        {available ? 'Disponível' : 'Ocupado'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Diária</span>
                      <span className="text-sm font-black text-slate-900 tracking-tight">R$ 180,00</span>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                      <ChevronRight size={16} />
                    </div>
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

function CompanyEvaluateTeam({ clientId, clients, assignments, employees, feedbacks }: { clientId: string, clients: Client[], assignments: Assignment[], employees: Employee[], feedbacks: Feedback[] }) {
  const client = clients.find(c => c.id === clientId);
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [evaluatingEmployee, setEvaluatingEmployee] = useState<Employee | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const handleEvaluate = async () => {
    if (!evaluatingEmployee) return;
    setIsSubmittingEval(true);
    try {
      const assignment = assignments.find(a => a.clientId === clientId && a.employeeId === evaluatingEmployee.id && a.date === selectedDate);
      const newFeedback: Omit<Feedback, 'id'> = {
        employeeId: evaluatingEmployee.id,
        managerId: clientId,
        assignmentId: assignment?.id || 'manual',
        rating: evalRating,
        comment: evalComment,
        date: new Date().toISOString()
      };
      await createDocument('feedbacks', newFeedback);
      
      const newRating = Math.round((evaluatingEmployee.rating + evalRating) / 2);
      await updateDocument('employees', evaluatingEmployee.id, { rating: newRating });
      
      setEvaluatingEmployee(null);
      setEvalComment('');
      setEvalRating(5);
      alert('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  if (!client) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Users size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Acesso Negado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Selecione uma empresa cadastrada no seletor de teste acima para avaliar sua equipe.</p>
      </div>
    );
  }

  const companyAssignments = assignments.filter(a => a.clientId === clientId);
  const dateAssignments = companyAssignments.filter(a => a.date === selectedDate);
  const dateEmployeeIds = Array.from(new Set(dateAssignments.map(a => a.employeeId)));
  const dateEmployees = employees.filter(e => dateEmployeeIds.includes(e.id));

  const workedEmployeeIds = Array.from(new Set(companyAssignments.map(a => a.employeeId)));
  const workedEmployees = employees.filter(e => workedEmployeeIds.includes(e.id) && !dateEmployeeIds.includes(e.id));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Avaliar Equipe</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Visualize e avalie os profissionais que atuam em suas unidades.</p>
        </div>
        <div className="bg-white p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 self-start lg:self-auto">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Filtrar por Data</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-slate-700 outline-none bg-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl ${selectedDate === today ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'} text-white flex items-center justify-center shadow-lg`}>
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedDate === today ? 'Equipe de Hoje' : `Equipe de ${formatDateBR(selectedDate)}`}
            </h3>
            <p className={`${selectedDate === today ? 'text-emerald-600' : 'text-blue-600'} text-[10px] font-black uppercase tracking-widest`}>
              {dateEmployees.length} Profissionais agendados
            </p>
          </div>
        </div>
        
        {dateEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {dateEmployees.map(emp => {
              const assignment = dateAssignments.find(a => a.employeeId === emp.id);
              return (
                <div key={emp.id} className={`bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 ${selectedDate === today ? 'border-emerald-100 shadow-emerald-500/5' : 'border-blue-100 shadow-blue-500/5'} shadow-xl transition-all group relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${selectedDate === today ? 'bg-emerald-500/5' : 'bg-blue-500/5'} rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150`}></div>
                  <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                        <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      {assignment?.confirmed && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{emp.firstName} {emp.lastName}</h3>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${assignment?.confirmed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {assignment?.confirmed ? 'Confirmado' : 'Aguardando Confirmação'}
                        </span>
                      </div>
                    </div>
                    {/* Evaluation Button for past or current dates */}
                    <button 
                      onClick={() => setEvaluatingEmployee(emp)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                    >
                      Avaliar Profissional
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">Nenhum profissional agendado para esta data.</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-sm">
            <Star size={20} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Histórico da Equipe</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Profissionais que já atuaram com você</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {workedEmployees.map(emp => {
          const empFeedbacks = feedbacks.filter(f => f.employeeId === emp.id && f.managerId === clientId);
          return (
            <div key={emp.id} className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
              
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                    <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-black text-slate-700">{emp.rating}.0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{emp.firstName} {emp.lastName}</h3>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                    ))}
                  </div>
                </div>

                <div className="w-full pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimas Avaliações</span>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg">
                      {empFeedbacks.length} Registros
                    </span>
                  </div>
                  <div className="space-y-3">
                    {empFeedbacks.slice(0, 2).map(f => (
                      <div key={f.id} className="text-left p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 italic font-medium">"{f.comment}"</p>
                      </div>
                    ))}
                    {empFeedbacks.length === 0 && (
                      <div className="py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-medium italic">Nenhuma avaliação detalhada.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-700 font-black uppercase tracking-widest text-center">
                    Conformidade LGPD: Dados sensíveis ocultos
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {workedEmployees.length === 0 && (
          <div className="col-span-full py-16 sm:py-32 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2">Nenhum profissional encontrado</h3>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Os profissionais aparecerão aqui após trabalharem em suas unidades.</p>
          </div>
        )}
      </div>
    </div>

      <AnimatePresence>
        {evaluatingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Avaliar Profissional</h3>
                  <button onClick={() => setEvaluatingEmployee(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                    <img src={evaluatingEmployee.photoUrl || `https://picsum.photos/seed/${evaluatingEmployee.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{evaluatingEmployee.firstName} {evaluatingEmployee.lastName}</p>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Profissional</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sua Nota</label>
                  <div className="flex items-center justify-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEvalRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          size={32}
                          className={star <= evalRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Comentário (Opcional)</label>
                  <textarea
                    value={evalComment}
                    onChange={(e) => setEvalComment(e.target.value)}
                    placeholder="Como foi o desempenho do profissional?"
                    className="w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 transition-colors min-h-[120px] text-slate-700 font-medium"
                  />
                </div>

                <button
                  onClick={handleEvaluate}
                  disabled={isSubmittingEval}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50"
                >
                  {isSubmittingEval ? 'Enviando...' : 'Confirmar Avaliação'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgencyAccessControl({ accessPoints, clients, units, companies, checkIns, employees }: { accessPoints: AccessPoint[], clients: Client[], units: Unit[], companies: Company[], checkIns: CheckIn[], employees: Employee[] }) {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState('');

  const availableUnits = units.filter(u => !accessPoints.some(ap => ap.location === u.location));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === selectedUnitId);
    const company = companies.find(c => c.id === unit?.companyId);
    if (!unit || !company) return;

    const newAP: Omit<AccessPoint, 'id'> = {
      managerName: unit.managerName,
      location: unit.location,
      qrCodeValue: `unit-${unit.id}-${Date.now()}`,
      createdAt: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    };
    
    await createDocument('accessPoints', newAP);
    setShowForm(false);
    setSelectedUnitId('');
  };

  const handleDeleteAccessPoint = async (id: string) => {
    const ap = accessPoints.find(a => a.id === id);
    if (!ap) return;
    const clientToDelete = clients.find(c => c.location === ap.location);
    await deleteDocument('accessPoints', id);
    if (clientToDelete) {
      await deleteDocument('clients', clientToDelete.id);
    }
    setShowDeleteConfirm(null);
  };

  const downloadQRCode = (ap: AccessPoint) => {
    const canvas = document.getElementById(`canvas-${ap.id}`) as HTMLCanvasElement;
    if (canvas) {
      const unitId = ap.qrCodeValue.split('-')[1];
      const unit = units.find(u => u.id === unitId);
      const company = companies.find(c => c.id === unit?.companyId);
      
      // Create a new canvas for the box
      const boxCanvas = document.createElement('canvas');
      const ctx = boxCanvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const height = 1000;
      boxCanvas.width = width;
      boxCanvas.height = height;

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Draw QR Code
      ctx.drawImage(canvas, 150, 100, 500, 500);

      // Draw Text
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      
      // Company Name
      ctx.font = 'bold 40px Arial';
      ctx.fillText(company?.name || 'Empresa', width / 2, 680);

      // Unit Name
      ctx.font = '30px Arial';
      ctx.fillText(unit?.name || ap.location, width / 2, 740);

      // Date
      ctx.font = '24px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Gerado em: ${formatDateBR(ap.createdAt)}`, width / 2, 800);

      // Agency Name
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#2563eb';
      ctx.fillText('StaffLink', width / 2, 900);

      const pngUrl = boxCanvas.toDataURL("image/png");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${ap.location.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Group check-ins by company
  const checkInsByCompany = companies
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(company => {
      const companyUnits = units.filter(u => u.companyId === company.id);
      const companyCheckIns = checkIns.filter(ci => companyUnits.some(u => u.location === ci.location));
      return {
        company,
        checkIns: companyCheckIns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      };
    })
    .filter(item => item.checkIns.length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Controle de Acesso</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Gere e gerencie QR Codes para as unidades atendidas.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} />
          Adicionar Unidade
        </button>
      </div>

      <ConfirmationModal 
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteAccessPoint(showDeleteConfirm)}
        title="Excluir Unidade"
        message="Deseja realmente excluir esta unidade e empresa?"
      />

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Nova Unidade</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Gere um QR Code para controle de ponto.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-6 sm:p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Selecionar Unidade Cadastrada</label>
                    <select 
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 appearance-none text-sm"
                      value={selectedUnitId}
                      onChange={e => setSelectedUnitId(e.target.value)}
                    >
                      <option value="">Selecione uma unidade...</option>
                      {availableUnits.map(unit => {
                        const company = companies.find(c => c.id === unit.companyId);
                        return (
                          <option key={unit.id} value={unit.id}>
                            {company?.name} - {unit.name}
                          </option>
                        );
                      })}
                    </select>
                    {availableUnits.length === 0 && (
                      <p className="text-[9px] sm:text-[10px] text-amber-600 font-bold mt-2 italic">
                        Todas as unidades cadastradas já possuem QR Code.
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!selectedUnitId}
                  className="w-full py-5 bg-blue-600 text-white rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gerar QR Code
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[...accessPoints].sort((a, b) => a.location.localeCompare(b.location)).map(ap => (
          <div key={ap.id} className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
            
            <div className="flex flex-col items-center text-center space-y-6 flex-1 relative z-10">
              <div className="p-4 sm:p-6 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-xl group-hover:scale-105 transition-transform relative">
                <QRCodeSVG value={ap.qrCodeValue} size={120} className="sm:w-[180px] sm:h-[180px]" />
                <div className="hidden">
                  <QRCodeCanvas id={`canvas-${ap.id}`} value={ap.qrCodeValue} size={512} />
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <h4 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center">{ap.location}</h4>
                <div className="flex items-center justify-center gap-2 text-slate-500 font-medium">
                  <Users size={14} className="text-blue-600" />
                  <span className="text-xs sm:text-sm">Gestor: {ap.managerName}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
                <Calendar size={12} />
                <span>Criado em {formatDateBR(ap.createdAt)}</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-100 flex flex-col gap-3 relative z-10">
              {ap.location.startsWith('http') && (
                <a 
                  href={ap.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 sm:py-4 bg-blue-50 text-blue-600 rounded-xl sm:rounded-[1.25rem] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-blue-100 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <MapPin size={16} />
                  Ver Localização
                </a>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={() => downloadQRCode(ap)}
                  className="flex-1 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-[1.25rem] font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Download size={16} />
                  Baixar
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(ap.id)}
                  className="p-3 sm:p-4 bg-rose-50 text-rose-600 rounded-xl sm:rounded-[1.25rem] hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                  title="Excluir Empresa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clock-in Monitoring section */}
      <div className="space-y-10 mt-20">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Monitoramento de Pontos</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Acompanhe os pontos batidos por empresa em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {checkInsByCompany.map(({ company, checkIns: companyCheckIns }) => (
            <div key={company.id} className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Building2 size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{company.name}</h3>
              </div>

              <div className="overflow-x-auto -mx-8 sm:-mx-12">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-8 sm:px-12 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionário</th>
                      <th className="px-8 sm:px-12 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</th>
                      <th className="px-8 sm:px-12 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
                      <th className="px-8 sm:px-12 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {companyCheckIns.map(ci => {
                      const employee = employees.find(e => e.id === ci.employeeId);
                      return (
                        <tr key={ci.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 sm:px-12 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                                {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                              </div>
                              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                {employee ? `${employee.firstName} ${employee.lastName}` : 'Desconhecido'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 sm:px-12 py-6 text-slate-500 font-medium">{ci.location}</td>
                          <td className="px-8 sm:px-12 py-6 text-slate-500 font-medium">
                            {new Date(ci.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-8 sm:px-12 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              ci.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {ci.type === 'IN' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CompanyProfile({ companyUserId, companyUsers, companies }: { companyUserId: string, companyUsers: CompanyUser[], companies: Company[] }) {
  const companyUser = companyUsers.find(cu => cu.id === companyUserId);
  const company = companies.find(c => c.id === companyUser?.companyId);

  if (!companyUser) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <UserIcon size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Perfil não encontrado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Não foi possível carregar as informações do seu perfil.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meu Perfil</h2>
        <p className="text-slate-500 font-medium text-sm">Gerencie suas informações de acesso e dados da empresa.</p>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 z-0" />
        
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
            {companyUser.photoUrl ? (
              <img 
                src={companyUser.photoUrl} 
                alt="" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600 font-black text-4xl">
                {companyUser.fullName[0]}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
            <CheckCircle size={16} />
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
          <div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">{companyUser.fullName}</h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Gestor Empresa
              </span>
              {company && (
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={12} />
                  {company.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-500">Acesso Ativo</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-400">Desde {formatDateBR(companyUser.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Access Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={16} />
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dados de Acesso</h4>
          </div>
          
          <div className="space-y-4">
            <ProfileInfoItem 
              icon={<Mail size={18} />} 
              label="E-mail de Login" 
              value={companyUser.email} 
              color="blue"
            />
            {companyUser.password && (
              <ProfileInfoItem 
                icon={<Lock size={18} />} 
                label="Senha" 
                value="••••••••" 
                color="blue"
              />
            )}
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dados da Empresa</h4>
          </div>

          <div className="space-y-4">
            {company ? (
              <>
                <ProfileInfoItem 
                  icon={<Building2 size={18} />} 
                  label="Razão Social" 
                  value={company.name} 
                  color="slate"
                />
                <ProfileInfoItem 
                  icon={<CreditCard size={18} />} 
                  label="CNPJ" 
                  value={company.cnpj || 'Não informado'} 
                  color="slate"
                />
                <ProfileInfoItem 
                  icon={<Phone size={18} />} 
                  label="Telefone Comercial" 
                  value={company.phone} 
                  color="slate"
                />
                {company.address && (
                  <ProfileInfoItem 
                    icon={<MapPin size={18} />} 
                    label="Endereço" 
                    value={company.address} 
                    color="slate"
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 italic">Informações da empresa não vinculadas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy & Data Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Privacidade e Segurança</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Gestão de Dados Corporativos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              Como gestor, você tem acesso a informações sensíveis de diarias e funcionários. O StaffLink garante que todos os dados sejam tratados com o mais alto nível de segurança e em conformidade com a <strong>LGPD</strong>.
            </p>
            <p className="text-[10px] text-slate-400 italic mt-6 font-medium">
              * O acesso é pessoal e intransferível. Todas as ações realizadas no portal são auditadas para sua segurança.
            </p>
          </div>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PrivacyListItem title="Acesso Restrito" description="Suas credenciais são criptografadas e protegidas." />
            <PrivacyListItem title="Auditoria de Ações" description="Registramos logs de alterações para conformidade." />
            <PrivacyListItem title="Proteção de Dados" description="Dados de funcionários são mascarados quando possível." />
            <PrivacyListItem title="Segurança de Rede" description="Toda comunicação é feita via túneis SSL/TLS seguros." />
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function EmployeeProfile({ employeeId, employees, assignments, notifications }: { employeeId: string, employees: Employee[], assignments: Assignment[], notifications: Notification[] }) {
  const employee = employees.find(e => e.id === employeeId);
  const pendingAssignments = assignments.filter(a => a.employeeId === employeeId && a.status === 'SCHEDULED' && !a.confirmed);
  const myNotifications = notifications.filter(n => n.userId === employeeId && !n.read);

  if (!employee) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <UserIcon size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Acesso Negado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Selecione um funcionário cadastrado no seletor de teste acima para ver o perfil.</p>
      </div>
    );
  }

  const handleConfirm = async (assignmentId: string) => {
    await updateDocument('assignments', assignmentId, { confirmed: true });
    alert('Diaria confirmada com sucesso!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meu Perfil</h2>
        <p className="text-slate-500 font-medium text-sm">Gerencie suas informações e acompanhe seu desempenho.</p>
      </div>

      {/* Notifications Section */}
      {myNotifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notificações Pendentes</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {myNotifications.map(notification => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{notification.title}</h4>
                    <p className="text-xs font-medium text-blue-600 mt-1">{notification.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={async () => {
                      if (notification.assignmentId) {
                        await handleConfirm(notification.assignmentId);
                      }
                      await updateDocument('notifications', notification.id, { read: true });
                    }}
                    className="flex-1 sm:flex-none px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                  >
                    Confirmar Presença
                  </button>
                  <button 
                    onClick={() => updateDocument('notifications', notification.id, { read: true })}
                    className="p-4 text-blue-400 hover:bg-blue-100 rounded-2xl transition-all"
                    title="Marcar como lida"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Hero Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />
        
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
            <img 
              src={employee.photoUrl || `https://picsum.photos/seed/${employee.id}/400`} 
              alt="" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'} text-white p-2 rounded-xl shadow-lg border-2 border-white`}>
            {employee.status === 'ACTIVE' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
          <div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">{employee.firstName} {employee.lastName}</h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${employee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {employee.status === 'ACTIVE' ? 'Funcionário Ativo' : 'Cadastro Pendente'}
              </span>
              {employee.role && (
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {employee.role}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className={i < employee.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
            ))}
            <span className="ml-2 text-sm font-bold text-slate-400">({employee.rating.toFixed(1)})</span>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
          {employee.docUrl && (
            <a 
              href={employee.docUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Eye size={18} />
              Ver Comprovante
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Data Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
              <Cake size={16} />
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dados Pessoais</h4>
          </div>
          
          <div className="space-y-4">
            <ProfileInfoItem 
              icon={<Cake size={18} />} 
              label="Data de Nascimento" 
              value={formatDateBR(employee.birthDate)} 
            />
            <ProfileInfoItem 
              icon={<CreditCard size={18} />} 
              label="Documento (CPF)" 
              value={employee.cpf} 
            />
            <ProfileInfoItem 
              icon={<Lock size={18} />} 
              label="Status LGPD" 
              value={employee.lgpdAuthorized ? 'Autorizado' : 'Não Autorizado'}
              valueColor={employee.lgpdAuthorized ? 'text-emerald-600' : 'text-rose-600'}
            />
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone size={16} />
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Informações de Contato</h4>
          </div>

          <div className="space-y-4">
            <ProfileInfoItem 
              icon={<Phone size={18} />} 
              label="Telefone" 
              value={employee.phone} 
              color="blue"
            />
            {employee.personalEmail && (
              <ProfileInfoItem 
                icon={<Mail size={18} />} 
                label="E-mail Pessoal" 
                value={employee.personalEmail} 
                color="blue"
              />
            )}
            {employee.loginEmail && (
              <ProfileInfoItem 
                icon={<Mail size={18} />} 
                label="E-mail de Login" 
                value={employee.loginEmail} 
                color="blue"
              />
            )}
            {employee.username && (
              <ProfileInfoItem 
                icon={<UserIcon size={18} />} 
                label="Usuário" 
                value={employee.username} 
                color="blue"
              />
            )}
          </div>
        </div>
      </div>

      {/* Privacy & Data Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Privacidade e Dados (LGPD)</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Lei Geral de Proteção de Dados</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              Em conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong>, informamos que seus dados pessoais (nome, CPF, foto e contato) são utilizados exclusivamente para as seguintes finalidades dentro da nossa plataforma:
            </p>
            <p className="text-[10px] text-slate-400 italic mt-6 font-medium">
              * Seus dados são armazenados em ambiente seguro e não são compartilhados com terceiros fora do ecossistema de contratação da plataforma.
            </p>
          </div>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PrivacyListItem title="Identificação Profissional" description="Para que as empresas saibam quem irá realizar o serviço." />
            <PrivacyListItem title="Controle de Ponto" description="Sua foto é utilizada no reconhecimento facial para autenticidade." />
            <PrivacyListItem title="Comunicação" description="Seu telefone é usado para envio de diarias via WhatsApp." />
            <PrivacyListItem title="Segurança" description="Documentos armazenados para conformidade e antecedentes." />
          </ul>
        </div>
      </div>

      {/* Mobile Doc Link */}
      <div className="lg:hidden">
        {employee.docUrl && (
          <a 
            href={employee.docUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Eye size={18} />
            Ver Comprovante
          </a>
        )}
      </div>

      {/* Unavailable Dates Card */}
      {employee.unavailableDates && employee.unavailableDates.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Datas Indisponíveis</h4>
          <div className="flex flex-wrap gap-3">
            {employee.unavailableDates.map(date => (
              <span key={date} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100">
                {formatDateBR(date)}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ProfileInfoItem({ icon, label, value, color = 'slate', valueColor }: { icon: React.ReactNode, label: string, value: string, color?: 'slate' | 'blue', valueColor?: string }) {
  const bgColor = color === 'blue' ? 'bg-blue-50/50' : 'bg-slate-50/50';
  const iconBg = color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400';
  
  return (
    <div className={`group p-4 ${bgColor} rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={`text-sm font-bold truncate ${valueColor || 'text-slate-700'}`} title={value}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function PrivacyListItem({ title, description }: { title: string, description: string }) {
  return (
    <li className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{description}</p>
    </li>
  );
}

function EmployeePonto({ employeeId, employees, accessPoints, checkIns, assignments }: { employeeId: string, employees: Employee[], accessPoints: AccessPoint[], checkIns: CheckIn[], assignments: Assignment[] }) {
  const [step, setStep] = useState<'INITIAL' | 'SCANNING' | 'PHOTO' | 'VERIFYING' | 'SUCCESS'>('INITIAL');
  const [scannedPoint, setScannedPoint] = useState<AccessPoint | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const employee = employees.find(e => e.id === employeeId);

  if (!employee) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Scan size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Acesso Negado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Selecione um funcionário cadastrado no seletor de teste acima para bater o ponto.</p>
      </div>
    );
  }

  const API_KEY = "B1pjmJOODdN7OWa5CY9qgqZCLdgCqez4"; // Chave de Reconhecimento Facial

  const handleScan = (text: string) => {
    if (text) {
      const point = accessPoints.find(ap => ap.qrCodeValue === text);
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

  const takePhoto = async () => {
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

        setStep('VERIFYING');

        // Simulação de chamada para API de Reconhecimento Facial usando a chave fornecida
        console.log(`Iniciando reconhecimento facial com a chave: ${API_KEY}`);
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simula tempo de processamento

        // Save Check-in
        const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const todayCheckIns = checkIns.filter(ci => ci.employeeId === employeeId && ci.timestamp.startsWith(today));
        const type = todayCheckIns.length % 2 === 0 ? 'IN' : 'OUT';

        const newCheckIn: Omit<CheckIn, 'id'> = {
          employeeId: employeeId,
          accessPointId: scannedPoint!.id,
          location: scannedPoint!.location,
          timestamp: new Date().toISOString(),
          photoUrl: photo,
          type: type
        };
        await createDocument('checkIns', newCheckIn);

        // Update Assignment status
        const assignment = assignments.find(a => 
          a.employeeId === employeeId && 
          (a.clientId === scannedPoint!.clientId || a.clientId === scannedPoint!.id) && 
          a.date === today &&
          a.status === 'SCHEDULED'
        );
        if (assignment && type === 'IN') {
          await updateDocument('assignments', assignment.id, { status: 'COMPLETED' });
        }

        setStep('SUCCESS');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto space-y-6 sm:space-y-10 px-4 sm:px-0"
    >
      <div className="text-center space-y-2 sm:space-y-3">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Registro de Ponto</h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base">Registre sua entrada ou saída na unidade com segurança.</p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        {step === 'INITIAL' && (
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-50 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-inner">
              <Scan size={48} className="sm:hidden" />
              <Scan size={64} className="hidden sm:block" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pronto para começar?</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Escaneie o QR Code fixado na parede da unidade.</p>
            </div>
            <button 
              onClick={() => setStep('SCANNING')}
              className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              Escanear QR Code
            </button>
          </div>
        )}

        {step === 'SCANNING' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="relative aspect-square rounded-2xl sm:rounded-[2rem] overflow-hidden border-4 border-blue-600 shadow-2xl">
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    handleScan(result[0].rawValue);
                  }
                }}
                onError={handleError}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' }
                }}
                allowMultiple={false}
                scanDelay={300}
              />
              <div className="absolute inset-0 border-[30px] sm:border-[60px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 border-dashed rounded-xl" />
              </div>
            </div>
            <button 
              onClick={() => setStep('INITIAL')}
              className="w-full py-3 sm:py-4 text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-slate-600 transition-colors"
            >
              Cancelar Operação
            </button>
          </div>
        )}

        {step === 'PHOTO' && (
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verificação Facial</h3>
              <p className="text-[10px] sm:text-sm text-blue-600 font-bold uppercase tracking-widest">{scannedPoint?.location}</p>
            </div>
            <div className="relative aspect-square w-full rounded-2xl sm:rounded-[2rem] overflow-hidden bg-black border-4 border-blue-600 shadow-2xl">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 sm:w-64 sm:h-80 border-2 border-white/50 rounded-[80px] sm:rounded-[100px] border-dashed" />
              </div>
            </div>
            <button 
              onClick={takePhoto}
              className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              <Camera size={20} className="sm:hidden" />
              <Camera size={24} className="hidden sm:block" />
              Tirar Foto e Bater Ponto
            </button>
          </div>
        )}

        {step === 'VERIFYING' && (
          <div className="flex flex-col items-center space-y-6 sm:space-y-8 py-8 sm:py-12">
            <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
              <div className="absolute inset-0 border-4 sm:border-8 border-slate-100 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 sm:border-8 border-blue-600 rounded-full border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <Camera size={32} className="sm:hidden" />
                <Camera size={40} className="hidden sm:block" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Validando Identidade</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Processando reconhecimento facial via IA...</p>
              <div className="mt-4 sm:mt-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 rounded-xl inline-block border border-slate-100">
                <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest">Protocolo: {API_KEY.substring(0, 8)}</p>
              </div>
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-emerald-50 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-inner"
            >
              <CheckCircle size={48} className="sm:hidden" />
              <CheckCircle size={64} className="hidden sm:block" />
            </motion.div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Ponto Registrado!</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Seu registro foi processado e enviado com sucesso.</p>
              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-[2rem] text-left space-y-3 sm:space-y-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">{scannedPoint?.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">{new Date().toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep('INITIAL')}
              className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-black transition-all shadow-xl active:scale-95"
            >
              Concluir
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs">Últimos Registros</h3>
          <span className="text-[9px] sm:text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">Hoje</span>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {checkIns.slice().reverse().map(ci => {
            const ap = accessPoints.find(p => p.id === ci.accessPointId);
            return (
              <div key={ci.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                    <img src={ci.photoUrl} alt="Selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">{ap?.location}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{new Date(ci.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={14} className="sm:hidden" />
                  <CheckCircle size={16} className="hidden sm:block" />
                </div>
              </div>
            );
          })}
          {checkIns.length === 0 && (
            <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-medium italic">Nenhum registro encontrado hoje.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CompanyDashboard({ clientId, clients, assignments, employees, feedbacks }: { clientId: string, clients: Client[], assignments: Assignment[], employees: Employee[], feedbacks: Feedback[] }) {
  const client = clients.find(c => c.id === clientId);
  const [evaluatingEmployee, setEvaluatingEmployee] = useState<Employee | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  if (!client) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Building2 size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Acesso Negado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Selecione uma empresa cadastrada no seletor de teste acima para visualizar o dashboard.</p>
      </div>
    );
  }

  const myAssignments = assignments.filter(a => a.clientId === clientId);
  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const todayStaff = myAssignments.filter(a => a.date === today);

  const handleEvaluate = async () => {
    if (!evaluatingEmployee) return;
    setIsSubmittingEval(true);
    try {
      const assignment = myAssignments.find(a => a.employeeId === evaluatingEmployee.id && a.status === 'COMPLETED');
      const newFeedback: Omit<Feedback, 'id'> = {
        employeeId: evaluatingEmployee.id,
        managerId: clientId,
        assignmentId: assignment?.id || 'manual',
        rating: evalRating,
        comment: evalComment,
        date: new Date().toISOString()
      };
      await createDocument('feedbacks', newFeedback);
      
      const newRating = Math.round((evaluatingEmployee.rating + evalRating) / 2);
      await updateDocument('employees', evaluatingEmployee.id, { rating: newRating });
      
      setEvaluatingEmployee(null);
      setEvalComment('');
      setEvalRating(5);
      alert('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="flex flex-col gap-2 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase">Minhas Diarias</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-base">Acompanhe os funcionários agendados para suas unidades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <StatCard 
            icon={<Users size={24} className="text-blue-600" />} 
            label="Equipe Hoje" 
            value={todayStaff.length.toString()} 
            color="blue"
          />
          <StatCard 
            icon={<Calendar size={24} className="text-indigo-600" />} 
            label="Total de Diarias" 
            value={myAssignments.length.toString()} 
            color="indigo"
          />
          <StatCard 
            icon={<Clock size={24} className="text-emerald-600" />} 
            label="Próxima Diaria" 
            value={myAssignments.find(a => a.date > today)?.date ? formatDateBR(myAssignments.find(a => a.date > today)!.date) : 'Nenhuma'} 
            color="emerald"
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group">
          <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/30 gap-4">
            <h3 className="text-[10px] font-black text-slate-950 tracking-[0.2em] uppercase">Histórico de Diarias</h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 self-start sm:self-auto shadow-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span>Atualizado em tempo real</span>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar hidden md:block">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white">
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Funcionário</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Data Agendada</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myAssignments.sort((a, b) => b.date.localeCompare(a.date)).map(as => {
                  const emp = employees.find(e => e.id === as.employeeId);
                  const isToday = as.date === today;
                  return (
                    <tr key={as.id} className={`transition-all duration-300 group/row ${isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-slate-950 font-black text-xl border border-slate-100 shadow-xl group-hover/row:scale-110 group-hover/row:rotate-3 transition-all duration-500 relative overflow-hidden">
                            <img src={`https://picsum.photos/seed/${emp?.id}/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-black text-slate-950 tracking-tight text-lg group-hover/row:text-blue-600 transition-colors">{emp?.firstName} {emp?.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Profissional Parceiro</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-slate-950 font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit shadow-sm group-hover/row:border-blue-200 transition-colors">
                            <Calendar size={14} className="text-blue-600" />
                            {formatDateBR(as.date)}
                          </div>
                          <div className="flex items-center gap-3 text-slate-400 font-black text-[9px] uppercase tracking-widest px-4">
                            <Clock size={12} className="text-slate-300" />
                            08:00 - 17:00
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <span className={`text-[10px] px-6 py-2 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all ${
                            as.status === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-emerald-500/20 border border-emerald-500' : 
                            as.status === 'SCHEDULED' ? 'bg-blue-600 text-white shadow-blue-500/20 border border-blue-500' :
                            'bg-slate-500 text-white shadow-slate-500/20 border border-slate-400'
                          }`}>
                            {as.status === 'COMPLETED' ? 'Concluído' : 
                             as.status === 'SCHEDULED' ? 'Agendado' : 'Pendente'}
                          </span>
                          {as.status === 'COMPLETED' && !feedbacks.some(f => f.assignmentId === as.id) && (
                            <button 
                              onClick={() => setEvaluatingEmployee(emp || null)}
                              className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                              title="Avaliar Profissional"
                            >
                              <Star size={18} />
                            </button>
                          )}
                          {isToday && (
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                              Hoje
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-slate-100">
            {myAssignments.sort((a, b) => b.date.localeCompare(a.date)).map(as => {
              const emp = employees.find(e => e.id === as.employeeId);
              const isToday = as.date === today;
              return (
                <div key={as.id} className={`p-5 sm:p-6 space-y-4 sm:space-y-5 transition-colors ${isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center text-slate-950 font-black text-xs sm:text-sm border border-slate-100 shadow-sm overflow-hidden shrink-0">
                        <img src={`https://picsum.photos/seed/${emp?.id}/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-950 text-xs sm:text-sm tracking-tight truncate">{emp?.firstName} {emp?.lastName}</p>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Profissional Parceiro</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest text-[8px] sm:text-[9px] border ${
                      as.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      as.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {as.status === 'COMPLETED' ? 'Concluído' : as.status === 'SCHEDULED' ? 'Agendado' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-widest bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                      <Calendar size={10} className="text-blue-600" />
                      {formatDateBR(as.date)}
                    </div>
                    <div className="flex items-center gap-3">
                      {as.status === 'COMPLETED' && !feedbacks.some(f => f.assignmentId === as.id) && (
                        <button 
                          onClick={() => setEvaluatingEmployee(emp || null)}
                          className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg border border-amber-100 text-[8px] font-black uppercase tracking-widest"
                        >
                          <Star size={10} />
                          Avaliar
                        </button>
                      )}
                      {isToday && (
                        <span className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          Hoje
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {myAssignments.length === 0 && (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100">
                  <Calendar size={40} />
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Nenhuma diaria encontrada.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {evaluatingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Avaliar Profissional</h3>
                  <button onClick={() => setEvaluatingEmployee(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                    <img src={evaluatingEmployee.photoUrl || `https://picsum.photos/seed/${evaluatingEmployee.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{evaluatingEmployee.firstName} {evaluatingEmployee.lastName}</p>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Profissional</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sua Nota</label>
                  <div className="flex items-center justify-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEvalRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          size={32}
                          className={star <= evalRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Comentário (Opcional)</label>
                  <textarea
                    value={evalComment}
                    onChange={(e) => setEvalComment(e.target.value)}
                    placeholder="Como foi o desempenho do profissional?"
                    className="w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 transition-colors min-h-[120px] text-slate-700 font-medium"
                  />
                </div>

                <button
                  onClick={handleEvaluate}
                  disabled={isSubmittingEval}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50"
                >
                  {isSubmittingEval ? 'Enviando...' : 'Confirmar Avaliação'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function CompanyFeedbackForm({ clientId, clients, assignments, employees }: { clientId: string, clients: Client[], assignments: Assignment[], employees: Employee[] }) {
  const client = clients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <MessageSquare size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Acesso Negado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Selecione uma empresa cadastrada no seletor de teste acima para enviar feedbacks.</p>
      </div>
    );
  }

  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const completedAssignments = assignments.filter(a => a.clientId === clientId && a.status === 'COMPLETED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId) return;

    const assignment = assignments.find(a => a.id === selectedAssignmentId);
    if (!assignment) return;

    const newFeedback: Omit<Feedback, 'id'> = {
      employeeId: assignment.employeeId,
      managerId: clientId,
      assignmentId: selectedAssignmentId,
      rating,
      comment,
      date: new Date().toISOString()
    };

    await createDocument('feedbacks', newFeedback);
    
    // Update employee rating (simplified)
    const emp = employees.find(e => e.id === assignment.employeeId);
    if (emp) {
      const newRating = Math.round((emp.rating + rating) / 2);
      await updateDocument('employees', emp.id, { rating: newRating });
    }

    alert('Feedback enviado com sucesso!');
    setSelectedAssignmentId('');
    setComment('');
    setRating(5);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Avaliar Equipe</h2>
        <p className="text-slate-500 font-medium tracking-wide">Sua opinião é fundamental para mantermos a excelência.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
        
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selecione a Diaria</label>
          <select 
            required
            className="input-field"
            value={selectedAssignmentId}
            onChange={e => setSelectedAssignmentId(e.target.value)}
          >
            <option value="">Selecione um funcionário/data</option>
            {completedAssignments.map(as => {
              const emp = employees.find(e => e.id === as.employeeId);
              return (
                <option key={as.id} value={as.id}>
                  {emp?.firstName} - {formatDateBR(as.date)}
                </option>
              );
            })}
          </select>
        </div>

        <div className="space-y-4 text-center py-6 bg-slate-50/50 rounded-3xl border border-slate-100">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Sua Avaliação</label>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-all hover:scale-125 active:scale-90"
              >
                <Star 
                  size={40} 
                  className={star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-200'} 
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            {rating === 5 ? 'Excelente!' : rating === 4 ? 'Muito Bom' : rating === 3 ? 'Bom' : rating === 2 ? 'Regular' : 'Poderia ser melhor'}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Comentário Adicional</label>
          <textarea 
            required
            className="input-field min-h-[140px] resize-none"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Conte-nos como foi a experiência com este profissional..."
          />
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          Enviar Avaliação
        </button>
      </form>
    </motion.div>
  );
}

function CompanyRegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('companyId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    setIsSubmitting(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      if (companyId) {
        // Use setDocument to ensure the document ID is the UID
        await setDocument('companyUsers', newUid, {
          companyId,
          fullName: formData.fullName,
          email: formData.email,
          role: 'COMPANY',
          createdAt: new Date().toISOString()
        });
        
        // Update user role to COMPANY
        await setDocument('users', newUid, { role: 'COMPANY', companyId, email: formData.email });
      }
      
      alert('Cadastro concluído com sucesso!');
      onComplete();
    } catch (error) {
      console.error('Error registering company:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-indigo-600" />
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 mx-auto mb-4">
              <Building2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cadastro de Responsável</h2>
            <p className="text-slate-500 mt-2 font-medium">Complete seu acesso para gerenciar sua empresa.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input 
                required
                type="text" 
                className="input-field"
                placeholder="Ex: João Silva Santos"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  className="input-field"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                <input 
                  required
                  type="email" 
                  className="input-field"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <input 
                  required
                  type="password" 
                  className="input-field"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <input 
                  required
                  type="password" 
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-purple-600 text-white rounded-[24px] font-black text-xl hover:bg-purple-700 transition-all shadow-2xl shadow-purple-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Processando...' : 'Finalizar Cadastro'}
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
                Ao enviar, você concorda com nossos termos de uso e LGPD.
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function RegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    personalEmail: '',
    lgpdAuthorized: false,
    photo: null as string | null,
    document: null as File | null,
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Não foi possível acessar a câmera.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setFormData({ ...formData, photo: photoData });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.photo) {
      alert("Por favor, tire uma foto para o cadastro.");
      return;
    }

    const names = formData.fullName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '';

    const newEmployeeRegistration = {
      firstName,
      lastName,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      phone: formData.phone,
      personalEmail: formData.personalEmail,
      lgpdAuthorized: formData.lgpdAuthorized,
      photoUrl: formData.photo || undefined,
      docUrl: formData.document ? formData.document.name : undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await createDocument('employeeRegistrations', newEmployeeRegistration);
    alert('Cadastro enviado com sucesso! Nossa equipe entrará em contato.');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4">
              <UserPlus size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Faça seu Cadastro</h2>
            <p className="text-slate-500 mt-2 font-medium">Junte-se à maior rede de staff do Brasil.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input 
                required
                type="text" 
                className="input-field"
                placeholder="Ex: João Silva Santos"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                <input 
                  required
                  type="text" 
                  className="input-field"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  className="input-field"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
              <input 
                required
                type="date" 
                className="input-field"
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Pessoal</label>
              <input 
                required
                type="email" 
                className="input-field"
                placeholder="seuemail@exemplo.com"
                value={formData.personalEmail}
                onChange={e => setFormData({...formData, personalEmail: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Foto de Perfil (Selfie)</label>
                <div className="relative">
                  {formData.photo ? (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 shadow-sm">
                      <img src={formData.photo} alt="Selfie" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button 
                          type="button"
                          onClick={startCamera}
                          className="p-3 bg-white/90 backdrop-blur rounded-2xl text-blue-600 shadow-xl hover:bg-white transition-all"
                        >
                          <Camera size={20} />
                        </button>
                        <label className="p-3 bg-white/90 backdrop-blur rounded-2xl text-blue-600 shadow-xl hover:bg-white cursor-pointer transition-all">
                          <Upload size={20} />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormData({...formData, photo: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={startCamera}
                        className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                      >
                        <Camera className="text-slate-400 group-hover:text-blue-600 transition-colors" size={32} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Tirar Foto</span>
                      </button>
                      <label className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                        <Upload className="text-slate-400 group-hover:text-blue-600 transition-colors" size={32} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Galeria</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({...formData, photo: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Documento (RG ou CNH)</label>
                <div className="relative h-full min-h-[140px]">
                  <input 
                    required
                    type="file" 
                    accept="image/*,application/pdf"
                    className="hidden" 
                    id="doc-upload"
                    onChange={e => setFormData({...formData, document: e.target.files?.[0] || null})}
                  />
                  <label 
                    htmlFor="doc-upload"
                    className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                  >
                    <Upload className={formData.document ? 'text-emerald-500' : 'text-slate-400 group-hover:text-blue-600'} size={32} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4 group-hover:text-blue-600 transition-colors">
                      {formData.document ? formData.document.name : 'Anexar cópia do documento'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input 
                required
                type="checkbox" 
                id="lgpd"
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                checked={formData.lgpdAuthorized}
                onChange={e => setFormData({...formData, lgpdAuthorized: e.target.checked})}
              />
              <label htmlFor="lgpd" className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Autorizo o uso dos meus dados pessoais para fins de cadastro e diarias de trabalho, conforme as diretrizes da <span className="font-bold text-slate-700">LGPD (Lei Geral de Proteção de Dados)</span>.
              </label>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98]"
              >
                Finalizar Cadastro
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
                Ao enviar, você concorda com nossos termos de uso e LGPD.
              </p>
            </div>
          </form>
        </div>

        <AnimatePresence>
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4">
              <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none">
                  <div className="w-full h-full border-2 border-white/30 rounded-3xl border-dashed" />
                </div>
                
                <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-10">
                  <button 
                    type="button"
                    onClick={stopCamera}
                    className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-all"
                  >
                    <X size={28} />
                  </button>
                  <button 
                    type="button"
                    onClick={takePhoto}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <div className="w-20 h-20 border-4 border-slate-100 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full" />
                    </div>
                  </button>
                  <div className="w-14 h-14" />
                </div>
              </div>
              <p className="text-white mt-6 font-medium">Posicione seu rosto no centro</p>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const UserManagement = ({ employees, companyUsers, role }: { employees: Employee[], companyUsers: CompanyUser[], role: UserRole | null }) => {
  const [filter, setFilter] = useState<'EMPLOYEE' | 'COMPANY'>('EMPLOYEE');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'EMPLOYEE' | 'COMPANY' } | null>(null);
  const [editData, setEditData] = useState({
    email: '',
    password: ''
  });

  const handleSaveLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    if (filter === 'EMPLOYEE') {
      await updateDocument('employees', showEditModal, {
        loginEmail: editData.email,
        password: editData.password
      });
    } else {
      await updateDocument('companyUsers', showEditModal, {
        email: editData.email,
        password: editData.password
      });
    }

    setShowEditModal(null);
    setEditData({ email: '', password: '' });
    alert('Credenciais atualizadas com sucesso!');
  };

  const handleDeleteUser = (id: string, type: 'EMPLOYEE' | 'COMPANY') => {
    setDeleteTarget({ id, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    try {
      await deleteDocument(type === 'EMPLOYEE' ? 'employees' : 'companyUsers', id);
      await deleteDocument('users', id);
      alert('Usuário excluído com sucesso!');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao excluir usuário.');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.loginEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanyUsers = companyUsers.filter(cu => 
    cu.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cu.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Logins</h2>
          <p className="text-slate-500 font-medium">Administre as credenciais de acesso de funcionários e empresas.</p>
        </div>
        <div className="flex w-full sm:w-auto bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setFilter('EMPLOYEE')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'EMPLOYEE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Funcionários
          </button>
          <button 
            onClick={() => setFilter('COMPANY')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'COMPANY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Empresas
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={`Pesquisar por nome ou e-mail em ${filter === 'EMPLOYEE' ? 'Funcionários' : 'Empresas'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-slate-700 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</th>
              <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Login</th>
              <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 py-4 sm:px-8 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filter === 'EMPLOYEE' ? (
              filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-4 sm:px-8 sm:py-6">
                    <div className="flex items-center gap-4">
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} alt={emp.firstName} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                      )}
                      <span className="font-bold text-slate-700">{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-8 sm:py-6">
                    <span className="text-sm font-medium text-slate-500">{emp.loginEmail || 'Não definido'}</span>
                  </td>
                  <td className="px-4 py-4 sm:px-8 sm:py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.loginEmail ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {emp.loginEmail ? 'Ativo' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setShowEditModal(emp.id);
                        setEditData({ email: emp.loginEmail || '', password: emp.password || '' });
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Lock size={18} />
                    </button>
                    {role === 'AGENCY' && (
                      <button 
                        onClick={() => handleDeleteUser(emp.id, 'EMPLOYEE')}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              filteredCompanyUsers.map(cu => (
                <tr key={cu.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {cu.photoUrl ? (
                        <img src={cu.photoUrl} alt={cu.fullName} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          {cu.fullName[0]}
                        </div>
                      )}
                      <span className="font-bold text-slate-700">{cu.fullName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-500">{cu.email}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                      Ativo
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setShowEditModal(cu.id);
                        setEditData({ email: cu.email, password: cu.password || '' });
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Lock size={18} />
                    </button>
                    {role === 'AGENCY' && (
                      <button 
                        onClick={() => handleDeleteUser(cu.id, 'COMPANY')}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 p-10 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Excluir usuário?</h3>
                <p className="text-slate-500 text-sm font-medium">Esta ação não pode ser desfeita. Tem certeza que deseja remover este usuário permanentemente?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Editar Acesso</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Defina as credenciais de login</p>
                    </div>
                  </div>
                  <button onClick={() => setShowEditModal(null)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail de Login</label>
                    <input 
                      type="email" 
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      value={editData.email}
                      onChange={e => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha de Acesso</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      value={editData.password}
                      onChange={e => setEditData({ ...editData, password: e.target.value })}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Salvar Credenciais
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const UserProfile = ({ user, role, employee, companyUser }: { user: User | null, role: UserRole, employee?: Employee, companyUser?: CompanyUser }) => {
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [resetErrorMessage, setResetErrorMessage] = useState('');

  const handleSendResetEmail = async () => {
    const email = employee?.personalEmail || companyUser?.email || user?.email;
    if (!email) {
      alert("E-mail não encontrado!");
      return;
    }

    setResetStatus('LOADING');
    setResetErrorMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetStatus('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setResetStatus('ERROR');
      setResetErrorMessage(err.message || 'Falha ao enviar e-mail');
    }
  };

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : companyUser?.fullName || user?.displayName || 'Usuário';
  const loginEmail = employee?.loginEmail || companyUser?.email || user?.email;
  const personalEmail = employee?.personalEmail || '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-12">
            <div className="w-24 h-24 rounded-[2rem] bg-white p-2 shadow-xl">
              <div className="w-full h-full rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400">
                <UserIcon size={40} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-12 sm:pt-16 p-6 sm:p-12 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{displayName}</h2>
              <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] mt-1">{role === 'AGENCY' ? 'Administrador Agência' : role === 'COMPANY' ? 'Gestor Empresa' : 'Diarista Profissional'}</p>
            </div>
            <button 
              onClick={handleSendResetEmail}
              disabled={resetStatus === 'LOADING'}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {resetStatus === 'LOADING' ? 'Enviando...' : 'Redefinir Senha'}
            </button>
          </div>

          {resetStatus === 'SUCCESS' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-medium">
              E-mail de redefinição enviado com sucesso para {employee?.personalEmail || companyUser?.email || user?.email}!
            </div>
          )}

          {resetStatus === 'ERROR' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              {resetErrorMessage || 'Erro ao enviar e-mail de redefinição. Tente novamente mais tarde.'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail de Login</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm truncate">
                {loginEmail}
              </div>
            </div>
            {personalEmail && (
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Pessoal</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm truncate">
                  {personalEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
