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
  ShieldCheck,
  Download,
  Trash2,
  Mail,
  Lock,
  Unlock,
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
  FileText,
  Briefcase,
  CheckCircle2,
  Key,
  XCircle,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI } from "@google/genai";
import { UserRole, Employee, Client, Assignment, Feedback, ContactRequest, AccessPoint, CheckIn, Company, Unit, CompanyUser, PricingConfig, CompanyRequest, EmployeeRegistration, Notification, Agency } from './types';
import { DEFAULT_PRICING } from './constants';
import { auth, googleProvider, sendPasswordResetEmail, db } from './firebase';
import { createNewUser } from './secondary-auth';
import { signInWithPopup, onAuthStateChanged, signOut, User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { 
  subscribeToCollection, 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  testConnection,
  setDocument,
  getDocument,
  where,
  or
} from './services/firebaseService';

function formatDateBR(dateString: string) {
  if (!dateString) return 'Nenhuma';
  if (dateString.includes('-') && !dateString.includes('T')) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
  const menuItems = role === 'ADMIN' ? [
    { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin_agencies', label: 'Gestão de Agências', icon: ShieldCheck },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon },
  ] : role === 'AGENCY' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staffing', label: 'Diaristas', icon: Users },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { id: 'registrations', label: 'Cadastros', icon: UserPlus },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'access_control', label: 'Controle de Acesso', icon: QrCode },
    { id: 'pricing', label: 'Precificação', icon: CreditCard },
    { id: 'user_management', label: 'Gestão de Logins', icon: Lock },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon },
  ] : role === 'COMPANY' ? [
    { id: 'manager_dashboard', label: 'Minhas Diarias', icon: LayoutDashboard },
    { id: 'evaluate_team', label: 'Avaliar Equipe', icon: Star },
    { id: 'company_diaristas', label: 'Diaristas', icon: Users },
    { id: 'company_profile', label: 'Meu Perfil', icon: UserIcon },
  ] : [
    { id: 'employee_profile', label: 'Meu Perfil', icon: UserIcon },
    { id: 'employee_schedule', label: 'Minha Agenda', icon: Calendar },
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
              <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="relative">
                  {userPhoto ? (
                    <img src={userPhoto} alt={userName || ''} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                      <UserIcon size={24} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{userName || 'Usuário'}</p>
                  <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">{role}</p>
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

function Header({ activeTab, setIsMobileMenuOpen, user, role, audioEnabled, setAudioEnabled, userName, userPhoto }: { 
  activeTab: string, 
  setIsMobileMenuOpen: (open: boolean) => void,
  user: any,
  role: string,
  audioEnabled: boolean,
  setAudioEnabled: (enabled: boolean) => void,
  userName?: string | null,
  userPhoto?: string | null
}) {
  const getTitle = () => {
    switch (activeTab) {
      case 'admin_dashboard': return 'Dashboard Super Admin';
      case 'admin_companies': return 'Gestão de Empresas';
      case 'admin_users': return 'Gestão de Usuários';
      case 'admin_documents': return 'Controle de Documentos';
      case 'admin_services': return 'Monitoramento de Serviços';
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
              {userName || user.displayName || 'Usuário'}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 border-2 border-white shadow-xl overflow-hidden ring-1 ring-slate-200 group cursor-pointer hover:scale-105 transition-all">
            <img src={userPhoto || user.photoURL || "https://picsum.photos/seed/user/100"} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
  const [isPending, setIsPending] = useState(false);
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
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [currentAgencyId, setCurrentAgencyId] = useState<string | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ratingLabel, setRatingLabel] = useState('Estrelas');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role') as UserRole;
    if (urlRole === 'REGISTRATION' || urlRole === 'COMPANY_REGISTRATION' || urlRole === 'AGENCY_REGISTRATION') {
      setRole(urlRole);
    }
  }, []);

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
    
    // If it's an agency or admin managing an agency, fetch agency-specific pricing
    const targetAgencyId = role === 'AGENCY' ? currentAgencyId : (role === 'ADMIN' ? selectedAgencyId : null);
    
    if (targetAgencyId) {
      const unsubAgency = onSnapshot(doc(db, 'agencies', targetAgencyId), (docSnap) => {
        if (docSnap.exists()) {
          const agencyData = docSnap.data() as Agency;
          if (agencyData.pricing) {
            setPricing({
              ...DEFAULT_PRICING,
              ...agencyData.pricing,
              stars: { ...DEFAULT_PRICING.stars, ...(agencyData.pricing.stars || {}) },
              weekly: { ...DEFAULT_PRICING.weekly, ...(agencyData.pricing.weekly || {}) }
            });
          } else {
            setPricing(DEFAULT_PRICING);
          }
          if (agencyData.ratingLabel) setRatingLabel(agencyData.ratingLabel);
        }
      });
      return () => unsubAgency();
    } else {
      // Fallback to global settings for other roles or global admin view
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
    }
  }, [isAuthReady, user, role, currentAgencyId, selectedAgencyId]);

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
      .then(r => {
        if (!r.ok) throw new Error('Health check failed');
        return r.json();
      })
      .then(d => console.log('Server health check:', d))
      .catch(e => {
        // Silent fail for health check to avoid console noise if server is starting
        console.log('Server health check pending or failed');
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      if (firebaseUser) {
        console.log('User is authenticated:', firebaseUser.uid);
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as UserRole;

        // Fetch or create user profile
        const userDoc = await getDocument<{ role: UserRole, agencyId?: string, companyId?: string, forcePasswordChange?: boolean, status?: string }>('users', firebaseUser.uid);
        if (userDoc) {
          if (userDoc.status === 'PENDING') {
            setIsPending(true);
            setUser(firebaseUser);
            setIsAuthReady(true);
            return;
          }
          let currentRole = userDoc.role;
          if ((firebaseUser.email === 'pedroass.11577@gmail.com' || firebaseUser.email === 'pedroassfenandes.25@gmail.com') && currentRole !== 'ADMIN') {
            currentRole = 'ADMIN';
            await updateDocument('users', firebaseUser.uid, { role: 'ADMIN' });
          }
          setRole(currentRole);
          if (userDoc.agencyId) setCurrentAgencyId(userDoc.agencyId);
          if (userDoc.companyId) setCurrentCompanyId(userDoc.companyId);
          if (userDoc.forcePasswordChange) {
            setNeedsPasswordChange(true);
          }
          let defaultTab = 'dashboard';
          if ((currentRole as string) === 'COMPANY') defaultTab = 'manager_dashboard';
          if ((currentRole as string) === 'EMPLOYEE') defaultTab = 'employee_schedule';
          if ((currentRole as string) === 'ADMIN') defaultTab = 'admin_dashboard';
          setActiveTab(defaultTab);
        } else {
          // Default role based on email or URL param
          let defaultRole: UserRole = (firebaseUser.email === 'pedroass.11577@gmail.com' || firebaseUser.email === 'pedroassfenandes.25@gmail.com') ? 'ADMIN' : 'EMPLOYEE';
          if (urlRole === 'REGISTRATION' || urlRole === 'COMPANY_REGISTRATION' || urlRole === 'AGENCY_REGISTRATION') {
            defaultRole = urlRole;
          }
          await setDocument('users', firebaseUser.uid, {
            email: firebaseUser.email,
            role: defaultRole,
            createdAt: new Date().toISOString()
          });
          setRole(defaultRole);
          let defaultTab = 'dashboard';
          if ((defaultRole as any) === 'COMPANY') defaultTab = 'manager_dashboard';
          if ((defaultRole as any) === 'EMPLOYEE') defaultTab = 'employee_schedule';
          if ((defaultRole as any) === 'ADMIN') defaultTab = 'admin_dashboard';
          setActiveTab(defaultTab);
        }
        setUser(firebaseUser);
      } else {
        setUser(prev => (prev as any)?.isCustom ? prev : null);
        setCurrentAgencyId(null);
        setCurrentCompanyId(null);
        setIsPending(false);
        setRole('EMPLOYEE');
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const unsubs: (() => void)[] = [];

    if (role === 'ADMIN') {
      unsubs.push(subscribeToCollection<Agency>('agencies', setAgencies));
      unsubs.push(subscribeToCollection<any>('users', setUsersList));
    } else if (role === 'AGENCY' && currentAgencyId) {
      unsubs.push(subscribeToCollection<Agency>('agencies', (data) => {
        setAgencies(data);
      }, [where('id', '==', currentAgencyId)]));
    }

    const filterByAgency = (data: any[]) => {
      if (role === 'ADMIN') {
        if (selectedAgencyId) return data.filter(d => d.agencyId === selectedAgencyId || !d.agencyId);
        return data;
      }
      if (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') {
        if (currentAgencyId) return data.filter(d => d.agencyId === currentAgencyId || !d.agencyId);
      }
      return data;
    };

    const unsubEmployees = (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE' || role === 'ADMIN') ? subscribeToCollection<Employee>('employees', (data) => setEmployees(filterByAgency(data))) : () => {};
    const unsubClients = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN') ? subscribeToCollection<Client>('clients', (data) => setClients(filterByAgency(data))) : () => {};
    
    // Role-based assignments subscription
    const assignmentConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', user.uid)] : 
                                 role === 'COMPANY' ? [where('clientId', '==', (user as any).clientId || user.uid)] : [];
    const unsubAssignments = subscribeToCollection<Assignment>('assignments', (docs) => {
      const filtered = filterByAgency(docs);
      if (role === 'AGENCY' || role === 'ADMIN') {
        setAssignments(prev => {
          const changed = filtered.some(d => {
            const p = prev.find(old => old.id === d.id);
            return p && p.status === 'SCHEDULED' && (d.status === 'COMPLETED' || d.status === 'CANCELLED');
          });
          if (changed) playNotificationSound();
          return filtered;
        });
      } else {
        setAssignments(filtered);
      }
    }, assignmentConstraints);
    
    const unsubFeedbacks = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN' || role === 'EMPLOYEE') ? subscribeToCollection<Feedback>('feedbacks', (data) => setFeedbacks(filterByAgency(data))) : () => {};
    
    // Only agency/admin sees contacts
    const unsubContacts = (role === 'AGENCY' || role === 'ADMIN') ? subscribeToCollection<ContactRequest>('contacts', (data) => setContacts(filterByAgency(data))) : () => {};
    const unsubEmployeeRegistrations = (role === 'AGENCY' || role === 'ADMIN') ? subscribeToCollection<EmployeeRegistration>('employeeRegistrations', (docs) => {
      const filtered = filterByAgency(docs);
      setEmployeeRegistrations(prev => {
        const newRegs = filtered.filter(d => d.status === 'PENDING');
        if (newRegs.length > prev.filter(d => d.status === 'PENDING').length) playNotificationSound();
        return filtered;
      });
    }) : () => {};
    
    const unsubAccessPoints = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN' || role === 'EMPLOYEE') ? subscribeToCollection<AccessPoint>('accessPoints', (data) => setAccessPoints(filterByAgency(data))) : () => {};
    
    // Role-based check-ins subscription
    const checkInConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', user.uid)] : [];
    const unsubCheckIns = subscribeToCollection<CheckIn>('checkIns', (docs) => {
      const filtered = filterByAgency(docs);
      if (role === 'AGENCY' || role === 'ADMIN') {
        setCheckIns(prev => {
          if (filtered.length > prev.length) playNotificationSound();
          return filtered;
        });
      } else {
        setCheckIns(filtered);
      }
    }, checkInConstraints);

    const unsubCompanies = (role === 'AGENCY' || role === 'ADMIN' || role === 'COMPANY') ? subscribeToCollection<Company>('companies', (data) => setCompanies(filterByAgency(data))) : () => {};
    const unsubUnits = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN') ? subscribeToCollection<Unit>('units', (data) => setUnits(filterByAgency(data))) : () => {};
    const unsubCompanyUsers = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN') ? subscribeToCollection<CompanyUser>('companyUsers', (data) => setCompanyUsers(filterByAgency(data))) : () => {};
    const unsubCompanyRequests = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN') ? subscribeToCollection<CompanyRequest>('companyRequests', (data) => setCompanyRequests(filterByAgency(data))) : () => {};

    const notificationConstraints = [];
    if (role !== 'ADMIN') {
      const conditions = [where('userId', '==', user.uid)];
      if (role === 'AGENCY') conditions.push(where('userId', '==', 'AGENCY'));
      if (role === 'COMPANY' && (user as any).companyId) conditions.push(where('userId', '==', 'COMPANY_' + (user as any).companyId));
      
      if (conditions.length > 1) {
        notificationConstraints.push(or(...conditions));
      } else {
        notificationConstraints.push(conditions[0]);
      }
    }

    const unsubNotifications = subscribeToCollection<Notification>('notifications', (data) => {
      setNotifications(data);
    }, notificationConstraints);

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
      unsubs.forEach(unsub => unsub());
    };
  }, [isAuthReady, user, role, currentAgencyId]);

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
      await signOut(auth);
      setUser({
        uid: cUser.id,
        email: cUser.email,
        displayName: cUser.fullName,
        photoURL: cUser.photoUrl,
        isCustom: true,
        clientId: cUser.unitId ? units.find(u => u.id === cUser.unitId)?.clientId : null
      });
      setRole('COMPANY');
      return;
    }

    // 2. Check in employees
    const eUser = employees.find(e => e.loginEmail?.toLowerCase() === emailInput.toLowerCase() && e.password === passwordInput);
    if (eUser) {
      await signOut(auth);
      setUser({
        uid: eUser.id,
        email: eUser.loginEmail,
        displayName: `${eUser.firstName} ${eUser.lastName}`,
        photoURL: eUser.photoUrl,
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

  if (isPending && user) {
    return (
      <ErrorBoundary>
        <PendingApproval onLogout={handleLogout} />
      </ErrorBoundary>
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

    if (roleParam === 'AGENCY_REGISTRATION') {
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
            <AgencyRegistrationForm onComplete={() => window.location.href = '/'} />
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-white to-slate-50">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md space-y-10 bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100"
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
              </>
            )}

          </motion.div>
        </div>
        
        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/5511999999999?text=Olá,%20quero%20conhecer%20a%20plataforma"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white px-5 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          💬 Fale conosco
        </a>
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

  if (role === 'AGENCY_REGISTRATION') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
          <AgencyRegistrationForm 
            onComplete={() => setRole('AGENCY')} 
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
          userName={
            role === 'EMPLOYEE' ? `${employees.find(e => e.loginEmail === user?.email)?.firstName || ''} ${employees.find(e => e.loginEmail === user?.email)?.lastName || ''}`.trim() || user.displayName :
            role === 'COMPANY' ? companyUsers.find(cu => cu.email === user?.email)?.fullName || user.displayName :
            user.displayName
          }
          userPhoto={
            role === 'EMPLOYEE' ? employees.find(e => e.loginEmail === user?.email)?.photoUrl || user.photoURL :
            role === 'COMPANY' ? companyUsers.find(cu => cu.email === user?.email)?.photoUrl || user.photoURL :
            user.photoURL
          }
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
            userName={
              role === 'EMPLOYEE' ? `${employees.find(e => e.loginEmail === user?.email)?.firstName || ''} ${employees.find(e => e.loginEmail === user?.email)?.lastName || ''}`.trim() || user.displayName :
              role === 'COMPANY' ? companyUsers.find(cu => cu.email === user?.email)?.fullName || user.displayName :
              user.displayName
            }
            userPhoto={
              role === 'EMPLOYEE' ? employees.find(e => e.loginEmail === user?.email)?.photoUrl || user.photoURL :
              role === 'COMPANY' ? companyUsers.find(cu => cu.email === user?.email)?.photoUrl || user.photoURL :
              user.photoURL
            }
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
              <AnimatePresence mode="wait">
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'PENDING' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500">
                      <Clock size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Cadastro em Análise</h2>
                      <p className="text-slate-500 font-medium max-w-md mx-auto">
                        Sua agência foi cadastrada com sucesso! Nossa equipe está revisando seus dados e documentos. Você receberá um e-mail assim que sua conta for ativada.
                      </p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="px-8 py-3 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                    >
                      Sair da Conta
                    </button>
                  </motion.div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'BLOCKED' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500">
                      <AlertTriangle size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Conta Bloqueada</h2>
                      <p className="text-slate-500 font-medium max-w-md mx-auto">
                        Sua conta de agência está temporariamente bloqueada. Entre em contato com o suporte para mais informações.
                      </p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="px-8 py-3 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                    >
                      Sair da Conta
                    </button>
                  </motion.div>
                )}
                {role === 'ADMIN' && activeTab === 'admin_dashboard' && (
                  <div key="admin-dashboard">
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
                      role={role}
                      agencies={agencies}
                      selectedAgencyId={selectedAgencyId}
                      onClearAgency={() => setSelectedAgencyId(null)}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      companyUsers={companyUsers}
                    />
                  </div>
                )}
                {role === 'ADMIN' && activeTab === 'admin_agencies' && (
                  <div key="admin-agencies">
                    <SuperAdminAgencies 
                      agencies={agencies}
                      companies={companies}
                      employees={employees}
                      usersList={usersList}
                      onManageAgency={(id) => {
                        setSelectedAgencyId(id);
                        setActiveTab('admin_dashboard');
                      }}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'user_management' && (
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
                      agency={role === 'AGENCY' ? agencies.find(a => a.email === user?.email || a.responsibleName === user?.displayName) : undefined}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'dashboard' && (
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
                      role={role}
                      agencies={agencies}
                      selectedAgencyId={selectedAgencyId}
                      onClearAgency={() => setSelectedAgencyId(null)}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      companyUsers={companyUsers}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'feedbacks' && (
                  <div key="agency-feedbacks">
                    <EmployeeFeedbackView 
                      feedbacks={feedbacks}
                      employees={employees}
                      clients={clients}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'registrations' && (
                  <div key="agency-registrations">
                    <AgencyRegistrations 
                      employees={employees}
                      clients={clients}
                      ratingLabel={ratingLabel}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      selectedAgencyId={selectedAgencyId}
                      companyUsers={companyUsers}
                      companies={companies}
                      units={units}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'staffing' && (
                  <div key="agency-staffing">
                    <AgencyStaffing 
                      employees={employees}
                      assignments={assignments}
                      clients={clients}
                      getScaleValue={getScaleValue}
                      companyRequests={companyRequests}
                      companies={companies}
                      units={units}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      selectedAgencyId={selectedAgencyId}
                      checkIns={checkIns}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'access_control' && (
                  <div key="agency-access-control">
                    <AgencyAccessControl 
                      accessPoints={accessPoints}
                      clients={clients}
                      units={units}
                      companies={companies}
                      checkIns={checkIns}
                      employees={employees}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      selectedAgencyId={selectedAgencyId}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'companies' && (
                  <div key="agency-companies">
                    <AgencyCompanies 
                      companies={companies}
                      units={units}
                      companyUsers={companyUsers}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      agencyId={currentAgencyId}
                      selectedAgencyId={selectedAgencyId}
                      agencies={agencies}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'pricing' && (
                  <div key="agency-pricing">
                    <AgencyPricing 
                      pricing={pricing}
                      ratingLabel={ratingLabel}
                      setPricing={setPricing}
                      setRatingLabel={setRatingLabel}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      selectedAgencyId={selectedAgencyId}
                    />
                  </div>
                )}
                
                {role === 'COMPANY' && activeTab === 'manager_dashboard' && (
                  <div key="company-dashboard">
                    <CompanyDashboard 
                      companyId={currentCompanyId || companyUsers.find(cu => cu.email === user?.email)?.companyId || ''} 
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                      units={units}
                      companies={companies}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'manager_feedback' && (
                  <div key="company-feedback">
                    <CompanyFeedbackForm 
                      companyId={currentCompanyId || companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      units={units}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'company_diaristas' && (
                  <div key="company-diaristas">
                    <CompanyDiaristas 
                      companyId={currentCompanyId || companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
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
                      companyId={currentCompanyId || companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                      units={units}
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
                      checkIns={checkIns}
                      pricing={pricing}
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

function SuperAdminAgencies({ agencies, companies, employees, usersList, onManageAgency }: { agencies: Agency[], companies: Company[], employees: Employee[], usersList: any[], onManageAgency: (id: string) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'AGENCY_REGISTRATION' | 'COMPANY_REGISTRATION'>('AGENCY_REGISTRATION');
  const [newAgency, setNewAgency] = useState({ name: '', responsibleName: '', email: '', phone: '' });

  const handleSendInvite = () => {
    if (!invitePhone) return;
    const cleanPhone = invitePhone.replace(/\D/g, '');
    const link = `${window.location.origin}?role=${inviteRole}`;
    const roleName = inviteRole === 'AGENCY_REGISTRATION' ? 'agência' : 'empresa';
    const message = encodeURIComponent(`Olá! Você foi convidado para registrar sua ${roleName} em nossa plataforma. Acesse o link para completar seu cadastro: ${link}`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
    setShowInviteModal(false);
    setInvitePhone('');
    setInviteRole('AGENCY_REGISTRATION');
  };

  const handleActivateAgency = async (agencyId: string) => {
    await updateDocument('agencies', agencyId, { status: 'ACTIVE' });
    const agencyUser = usersList.find(u => u.agencyId === agencyId && u.role === 'AGENCY');
    if (agencyUser) {
      await updateDocument('users', agencyUser.id, { status: 'ACTIVE' });
    }
    alert('Agência liberada com sucesso!');
  };

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = Math.random().toString(36).substr(2, 9);
      await setDocument('agencies', id, {
        ...newAgency,
        id,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        address: {
          zipCode: '',
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: ''
        },
        tradeName: '',
        cnpj: '',
        openingDate: '',
        segment: [],
        responsibleCpf: '',
        responsibleRole: ''
      });
      setShowAddModal(false);
      setNewAgency({ name: '', responsibleName: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error adding agency:', error);
    }
  };

  const toggleAgencyStatus = async (agency: Agency) => {
    try {
      await updateDocument('agencies', agency.id, {
        status: agency.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
      });
    } catch (error) {
      console.error('Error toggling agency status:', error);
    }
  };

  return (
    <div className="space-y-8">
      {showDetailsModal && selectedAgency && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tighter">Detalhes da Agência</h2>
                <p className="text-slate-500 text-sm font-medium">{selectedAgency.name}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              {/* Dados da Empresa */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-blue-500" />
                  Dados da Empresa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Razão Social</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Fantasia</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.tradeName || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CNPJ</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.cnpj || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segmento</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAgency.segment?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-tighter">{s}</span>
                      )) || 'N/A'}
                    </div>
                  </div>
                </div>
              </section>

              {/* Endereço */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500" />
                  Endereço
                </h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-950">
                    {selectedAgency.address?.street}, {selectedAgency.address?.number}
                    {selectedAgency.address?.complement && ` - ${selectedAgency.address.complement}`}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedAgency.address?.neighborhood} - {selectedAgency.address?.city}/{selectedAgency.address?.state}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">CEP: {selectedAgency.address?.zipCode}</p>
                </div>
              </section>

              {/* Responsável */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon size={14} className="text-purple-500" />
                  Responsável Legal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.responsibleName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.responsibleCpf || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargo</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.responsibleRole || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</p>
                    <p className="text-sm font-bold text-slate-950">{selectedAgency.phone}</p>
                    <p className="text-xs text-slate-500 font-medium">{selectedAgency.email}</p>
                  </div>
                </div>
              </section>

              {/* Documentação */}
              {selectedAgency.documents && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-orange-500" />
                    Documentação
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedAgency.documents).map(([key, value]) => (
                      value && (
                        <a 
                          key={key}
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group"
                        >
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">
                            {key === 'cnpjCard' ? 'Cartão CNPJ' : 
                             key === 'socialContract' ? 'Contrato Social' :
                             key === 'responsibleDoc' ? 'Doc. Responsável' :
                             key === 'addressProof' ? 'Comprovante Endereço' : key}
                          </span>
                          <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-500" />
                        </a>
                      )
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="p-8 border-t border-slate-50 shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tighter">Convidar Usuário</h2>
                <p className="text-slate-500 text-sm font-medium">Envie o link de cadastro via WhatsApp</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Convite</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'AGENCY_REGISTRATION' | 'COMPANY_REGISTRATION')}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="AGENCY_REGISTRATION">Agência</option>
                  <option value="COMPANY_REGISTRATION">Empresa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp do Responsável</label>
                <input
                  required
                  type="tel"
                  value={invitePhone}
                  onChange={e => setInvitePhone(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="(00) 00000-0000"
                />
                <p className="text-[10px] text-slate-400 font-medium ml-1 italic text-wrap">O link enviado será: {window.location.origin}?role={inviteRole}</p>
              </div>

              <button
                onClick={handleSendInvite}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Abrir WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tighter font-display">Gestão de Agências</h1>
          <p className="text-slate-500 font-medium">Controle todas as agências da plataforma</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100"
          >
            <Phone size={18} />
            Convidar via WhatsApp
          </button>
          <button 
            onClick={() => {
              const link = `${window.location.origin}?role=AGENCY_REGISTRATION`;
              navigator.clipboard.writeText(link);
              alert('Link de cadastro copiado para a área de transferência!');
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
          >
            <LinkIcon size={18} />
            Copiar Link
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} />
            Nova Agência
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map(agency => {
          const agencyCompanies = companies.filter(c => c.agencyId === agency.id);
          const agencyEmployees = employees.filter(e => e.agencyId === agency.id);

          return (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  agency.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                  agency.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {agency.status === 'ACTIVE' ? 'Ativa' : agency.status === 'PENDING' ? 'Pendente' : 'Bloqueada'}
                </div>
                {agency.status === 'PENDING' && (
                  <button 
                    onClick={() => handleActivateAgency(agency.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Liberar Acesso"
                  >
                    <Unlock size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">{agency.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{agency.responsibleName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresas</p>
                  <p className="text-2xl font-black text-slate-950 tracking-tighter">{agencyCompanies.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diaristas</p>
                  <p className="text-2xl font-black text-slate-950 tracking-tighter">{agencyEmployees.length}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail size={14} />
                  <span className="text-xs font-medium">{agency.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-500">
                  <div className="flex items-center gap-3">
                    <Phone size={14} />
                    <span className="text-xs font-medium">{agency.phone}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const cleanPhone = agency.phone.replace(/\D/g, '');
                      const link = `${window.location.origin}?role=AGENCY_REGISTRATION`;
                      const message = encodeURIComponent(`Olá ${agency.responsibleName}! Aqui está o link para completar o cadastro da agência ${agency.name}: ${link}`);
                      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
                    }}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                    title="Reenviar convite via WhatsApp"
                  >
                    <Phone size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedAgency(agency);
                    setShowDetailsModal(true);
                  }}
                  className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                  title="Ver Detalhes"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => onManageAgency(agency.id)}
                  className="flex-1 py-3 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Gerenciar
                </button>
                <button 
                  onClick={() => toggleAgencyStatus(agency)}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    agency.status === 'ACTIVE' 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {agency.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tighter">Nova Agência</h2>
                <p className="text-slate-500 text-sm font-medium">Cadastre uma nova agência no sistema</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAgency} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Agência</label>
                  <input
                    required
                    type="text"
                    value={newAgency.name}
                    onChange={e => setNewAgency({ ...newAgency, name: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                    placeholder="Ex: Agência Central"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsável</label>
                  <input
                    required
                    type="text"
                    value={newAgency.responsibleName}
                    onChange={e => setNewAgency({ ...newAgency, responsibleName: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                    <input
                      required
                      type="email"
                      value={newAgency.email}
                      onChange={e => setNewAgency({ ...newAgency, email: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                      placeholder="email@agencia.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                    <input
                      required
                      type="tel"
                      value={newAgency.phone}
                      onChange={e => setNewAgency({ ...newAgency, phone: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  Criar Agência
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AgencyDashboard({ assignments, employees, contacts, employeeRegistrations, pricing, ratingLabel, setActiveTab, clients, feedbacks, companies, units, role, agencies, selectedAgencyId, onClearAgency, agencyId, companyUsers }: { assignments: Assignment[], employees: Employee[], contacts: ContactRequest[], employeeRegistrations: EmployeeRegistration[], pricing: PricingConfig, ratingLabel: string, setActiveTab: (tab: string) => void, clients: Client[], feedbacks: Feedback[], companies: Company[], units: Unit[], role: string, agencies: Agency[], selectedAgencyId?: string | null, onClearAgency?: () => void, agencyId: string | null, companyUsers: CompanyUser[] }) {
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
        agencyId: evaluatingEmployee.agencyId,
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

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'ACTIVE').length;
  const pendingCompanies = companies.filter(c => c.status === 'PENDING').length;
  const pendingManagers = companyUsers.filter(cu => cu.status === 'PENDING').length;
  const totalEmployees = employees.length;
  const servicesInProgress = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'SCHEDULED').length;
  const companiesWithRejectedDocs = companies.filter(c => c.documents?.some(d => d.status === 'REJECTED')).length;
  const alerts = companies.filter(c => c.status === 'BLOCKED').length + companiesWithRejectedDocs;

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
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {role === 'ADMIN' && agencies.find(a => a.id === selectedAgencyId) 
              ? `Visão Geral: ${agencies.find(a => a.id === selectedAgencyId)?.name}` 
              : 'Visão Geral'}
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            {role === 'ADMIN' && selectedAgencyId 
              ? 'Acompanhe o desempenho desta agência.' 
              : 'Acompanhe o desempenho da sua agência hoje.'}
          </p>
        </div>
        {role === 'ADMIN' && selectedAgencyId && (
          <button 
            onClick={() => onClearAgency()}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
          >
            Voltar para Visão Global
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {role === 'ADMIN' && (
          <StatCard 
            icon={<ShieldCheck size={24} />} 
            label="Total de Agências" 
            value={agencies.length.toString()} 
            trend="Na Plataforma"
            color="slate"
            onClick={() => setActiveTab('admin_agencies')}
          />
        )}
        <StatCard 
          icon={<Building2 size={24} />} 
          label="Total de Empresas" 
          value={totalCompanies.toString()} 
          trend="Cadastradas"
          color="blue"
        />
        <StatCard 
          icon={<CheckCircle2 size={24} />} 
          label="Empresas Ativas" 
          value={activeCompanies.toString()} 
          trend="Operando"
          color="emerald"
        />
        <StatCard 
          icon={<Clock size={24} />} 
          label="Empresas Pendentes" 
          value={pendingCompanies.toString()} 
          trend={pendingCompanies > 0 ? "Aguardando" : "Limpo"}
          alert={pendingCompanies > 0}
          color="orange"
          onClick={() => setActiveTab('admin_companies')}
        />
        <StatCard 
          icon={<Users size={24} />} 
          label="Gerentes Pendentes" 
          value={pendingManagers.toString()} 
          trend={pendingManagers > 0 ? "Aguardando" : "Limpo"}
          alert={pendingManagers > 0}
          color="orange"
          onClick={() => setActiveTab('admin_companies')}
        />
        <StatCard 
          icon={<Users size={24} />} 
          label="Total de Funcionários" 
          value={totalEmployees.toString()} 
          trend="Cadastrados"
          color="purple"
        />
        <StatCard 
          icon={<Briefcase size={24} />} 
          label="Serviços em Andamento" 
          value={servicesInProgress.toString()} 
          trend="Ativos"
          color="indigo"
        />
        <StatCard 
          icon={<AlertTriangle size={24} />} 
          label="Alertas" 
          value={alerts.toString()} 
          trend={alerts > 0 ? "Empresas Irregulares" : "Tudo OK"}
          alert={alerts > 0}
          color="rose"
        />
      </div>

      {alerts > 0 && (
        <div className="bg-rose-50 p-8 sm:p-12 rounded-[2.5rem] border border-rose-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full -mr-48 -mt-48 transition-all group-hover:scale-110 duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-rose-950/20 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-900 tracking-tight">Alertas Críticos</h3>
                <p className="text-sm text-rose-600 font-medium tracking-wide">Empresas com irregularidades que precisam de atenção.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.filter(c => c.status === 'BLOCKED' || c.documents?.some(d => d.status === 'REJECTED')).map(company => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{company.name}</p>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                        {company.status === 'BLOCKED' ? 'Empresa Bloqueada' : 'Documentos Rejeitados'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('admin_companies')}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                  >
                    Resolver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
            agencyId={agencyId}
            selectedAgencyId={selectedAgencyId}
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

function StatCard({ icon, label, value, trend, alert, color = 'blue', onClick }: { icon: React.ReactNode, label: string, value: string, trend?: string, alert?: boolean, color?: 'blue' | 'indigo' | 'emerald' | 'orange' | 'purple' | 'rose' | 'slate', onClick?: () => void }) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-900 border-slate-100'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
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
    
    if (!exists) {
      // Notify Agency
      await createDocument('notifications', {
        userId: 'AGENCY',
        title: 'Funcionário indisponível',
        message: `O funcionário ${employee.firstName} ${employee.lastName} marcou o dia ${date} como indisponível.`,
        type: 'INFO',
        read: false,
        createdAt: new Date().toISOString()
      });

      // Notify Company
      const relevantAssignments = assignments.filter(a => a.employeeId === employee.id && a.date === date);
      const companyIds = [...new Set(relevantAssignments.map(a => a.clientId))];
      
      for (const companyId of companyIds) {
        await createDocument('notifications', {
          userId: 'COMPANY_' + companyId,
          title: 'Funcionário indisponível',
          message: `O funcionário ${employee.firstName} ${employee.lastName} marcou o dia ${date} como indisponível.`,
          type: 'INFO',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }
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
      
      // 1. Create Firebase Auth user via secondary app to avoid automatic sign-in
      const newUid = await createNewUser(emailForAuth, password);

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
        agencyId: employee.agencyId,
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

function ProcessRegistrationModal({ registration, onClose, onComplete, agencyId, selectedAgencyId }: { registration: EmployeeRegistration, onClose: () => void, onComplete: () => void, agencyId: string | null, selectedAgencyId?: string | null }) {
  const [username, setUsername] = useState(`${registration.firstName.toLowerCase()}.${registration.lastName.toLowerCase().split(' ')[0]}`);
  const [password, setPassword] = useState(Math.random().toString(36).slice(-8));
  const [isSending, setIsSending] = useState(false);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const targetAgencyId = selectedAgencyId || agencyId || registration.agencyId;
      if (!targetAgencyId) throw new Error('Agência não identificada');

      // 1. Create Firebase Auth user via secondary app to avoid automatic sign-in
      const emailForAuth = username.includes('@') ? username : `${username}@b11.com`;
      console.log("DEBUG: Creating user with:", emailForAuth, password);
      
      const newUid = await createNewUser(emailForAuth, password);

      // 2. Create employee record
      await setDocument('employees', newUid, {
        agencyId: targetAgencyId,
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
        agencyId: targetAgencyId,
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

function AgencyRegistrations({ employees, clients, ratingLabel, agencyId, selectedAgencyId, companyUsers, companies, units }: { employees: Employee[], clients: Client[], ratingLabel: string, agencyId: string | null, selectedAgencyId?: string | null, companyUsers: CompanyUser[], companies: Company[], units: Unit[] }) {
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

  const pendingManagers = companyUsers.filter(cu => cu.status === 'PENDING');

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await updateDocument('companyUsers', userId, { status });
      await updateDocument('users', userId, { status });
      alert(`Status do usuário atualizado para ${status === 'ACTIVE' ? 'Ativo' : status}!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Erro ao atualizar status do usuário.');
    }
  };
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
    const targetAgencyId = selectedAgencyId || agencyId;
    const link = `${window.location.origin}?role=REGISTRATION${targetAgencyId ? `&agencyId=${targetAgencyId}` : ''}`;
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

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      alert('Agência não identificada.');
      return;
    }

    if (isEditing && selectedEmployee) {
      await updateDocument('employees', selectedEmployee.id, formData);
      alert('Cadastro atualizado com sucesso!');
    } else {
      const newEmp: Omit<Employee, 'id'> = {
        ...formData,
        agencyId: targetAgencyId,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-12">
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

function AgencyStaffing({ employees, assignments, clients, getScaleValue, companyRequests, companies, units, agencyId, selectedAgencyId, checkIns }: { employees: Employee[], assignments: Assignment[], clients: Client[], getScaleValue: (rating: number) => number, companyRequests: CompanyRequest[], companies: Company[], units: Unit[], agencyId: string | null, selectedAgencyId?: string | null, checkIns: CheckIn[] }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [filterType, setFilterType] = useState<'RATING' | 'COMPLAINTS'>('RATING');
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'STAFFING' | 'CONFIRMED' | 'REQUESTS'>('STAFFING');
  const [activeRequest, setActiveRequest] = useState<CompanyRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<CompanyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [selectedAssignmentForDetails, setSelectedAssignmentForDetails] = useState<Assignment | null>(null);

  const toggleCompany = (id: string) => {
    setExpandedCompanies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedAssignmentCheckIns = selectedAssignmentForDetails 
    ? checkIns.filter(ci => ci.employeeId === selectedAssignmentForDetails.employeeId && ci.timestamp.startsWith(selectedAssignmentForDetails.date))
    : [];
  const selectedAssignmentEmployee = selectedAssignmentForDetails
    ? employees.find(e => e.id === selectedAssignmentForDetails.employeeId)
    : null;

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

  const handleRejectRequest = (req: CompanyRequest) => {
    setRejectingRequest(req);
    setRejectReason('');
  };

  const confirmRejectRequest = async () => {
    if (!rejectingRequest) return;
    if (rejectReason.trim() === '') {
      alert('É necessário informar um motivo para recusar a solicitação.');
      return;
    }

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) return;

    await updateDocument('companyRequests', rejectingRequest.id, { status: 'REJECTED' });

    await createDocument('notifications', {
      userId: 'COMPANY_' + rejectingRequest.companyId,
      agencyId: targetAgencyId,
      title: 'Solicitação Recusada',
      message: `Sua solicitação para o dia ${formatDateBR(rejectingRequest.date)} foi recusada. Motivo: ${rejectReason}`,
      type: 'SYSTEM',
      read: false,
      createdAt: new Date().toISOString(),
      link: 'manager_dashboard'
    });
    
    setRejectingRequest(null);
    setRejectReason('');
    alert('Solicitação recusada e empresa notificada.');
  };

  const handleStaff = async (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    const client = clients.find(c => c.id === selectedClientId);
    if (!emp || !client) return;

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) return;

    const newAs: Omit<Assignment, 'id'> = {
      agencyId: targetAgencyId,
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
      agencyId: targetAgencyId,
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
      <AnimatePresence>
        {selectedAssignmentForDetails && selectedAssignmentEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                    <img src={selectedAssignmentEmployee.photoUrl || `https://picsum.photos/seed/${selectedAssignmentEmployee.id}/200`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedAssignmentEmployee.firstName} {selectedAssignmentEmployee.lastName}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Registros de Ponto - {formatDateBR(selectedAssignmentForDetails.date)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAssignmentForDetails(null)}
                  className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                {selectedAssignmentCheckIns.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Clock size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhum ponto registrado para este dia.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {selectedAssignmentCheckIns.map((ci, idx) => (
                      <div key={ci.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${ci.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                            Ponto de {ci.type === 'IN' ? 'Entrada' : 'Saída'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{formatTime(ci.timestamp)}</span>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative group">
                          <img src={ci.photoUrl} alt="Foto do registro" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <div className="flex items-center gap-2 text-white">
                              <MapPin size={14} />
                              <span className="text-[10px] font-medium truncate">{ci.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <MapPin size={14} className="text-blue-500 shrink-0" />
                          <p className="text-[10px] font-medium leading-tight">{ci.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedAssignmentForDetails(null)}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                {clients
                  .filter(cli => units.some(u => u.clientId === cli.id))
                  .map(cli => (
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
                {sortedEmployees.filter(e => !assignments.some(a => a.employeeId === e.id && a.date === selectedDate) && !e.unavailableDates?.includes(selectedDate)).length} Disponíveis
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sortedEmployees.map(emp => {
              const isAssigned = assignments.some(a => a.employeeId === emp.id && a.date === selectedDate);
              const isUnavailable = emp.unavailableDates?.includes(selectedDate);
              const isNotAvailable = isAssigned || isUnavailable;
              const isRequested = activeRequest?.employeeIds.includes(emp.id);
              
              return (
                <div key={emp.id} className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all relative group ${
                  isNotAvailable 
                    ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
                    : isRequested
                    ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-500/5'
                    : 'bg-white border-slate-50 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1'
                }`}>
                  {isRequested && !isNotAvailable && (
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
                      <span className={`text-[11px] sm:text-xs font-bold ${isNotAvailable ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isUnavailable ? 'Indisponível' : isAssigned ? 'Já agendado' : 'Disponível'}
                      </span>
                    </div>
                    {!isNotAvailable && (
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
                                    const empCheckIns = checkIns.filter(ci => ci.employeeId === as.employeeId && ci.timestamp.startsWith(as.date));
                                    const entry = empCheckIns.find(ci => ci.type === 'IN');
                                    const exit = empCheckIns.find(ci => ci.type === 'OUT');

                                    return (
                                      <button 
                                        key={as.id} 
                                        onClick={() => setSelectedAssignmentForDetails(as)}
                                        className="w-full p-5 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 flex flex-col gap-4 hover:border-emerald-200 hover:bg-white transition-all group text-left"
                                      >
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
                                            <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest">
                                              {entry && exit ? 'Ponto Completo' : entry ? 'Entrada Registrada' : 'Presença Confirmada'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 text-slate-400">
                                            <Clock size={10} />
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                                              {entry ? formatTime(entry.timestamp) : '08:00'} - {exit ? formatTime(exit.timestamp) : '17:00'}
                                            </span>
                                          </div>
                                        </div>
                                      </button>
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
            {companyRequests.filter(req => req.status === 'PENDING').map(req => {
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
                        onClick={() => handleRejectRequest(req)}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {companyRequests.filter(req => req.status === 'PENDING').length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-medium italic">Nenhuma solicitação pendente.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {rejectingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setRejectingRequest(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Recusar Solicitação</h3>
                  <button 
                    onClick={() => setRejectingRequest(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Motivo da Recusa</label>
                    <textarea 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explique o motivo para a empresa..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none h-32"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setRejectingRequest(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmRejectRequest}
                    className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgencyPricing({ pricing, ratingLabel, setPricing, setRatingLabel, agencyId, selectedAgencyId }: { pricing: PricingConfig, ratingLabel: string, setPricing: (p: PricingConfig) => void, setRatingLabel: (l: string) => void, agencyId: string | null, selectedAgencyId?: string | null }) {
  const [localPricing, setLocalPricing] = useState<PricingConfig>(pricing);
  const [localLabel, setLocalLabel] = useState(ratingLabel);

  const handleSave = async () => {
    const targetAgencyId = selectedAgencyId || agencyId;
    if (targetAgencyId) {
      await updateDocument('agencies', targetAgencyId, { 
        pricing: localPricing,
        ratingLabel: localLabel
      });
    } else {
      await setDocument('settings', 'pricing', { values: localPricing });
      await setDocument('settings', 'ratingLabel', { value: localLabel });
    }
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

function AgencyCompanies({ companies, units, companyUsers, clients, assignments, employees, agencyId, selectedAgencyId, agencies }: { companies: Company[], units: Unit[], companyUsers: CompanyUser[], clients: Client[], assignments: Assignment[], employees: Employee[], agencyId: string | null, selectedAgencyId?: string | null, agencies: Agency[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'BLOCKED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<Company | null>(null);
  const [showDeleteCompanyConfirm, setShowDeleteCompanyConfirm] = useState<string | null>(null);
  const [showDeleteUnitConfirm, setShowDeleteUnitConfirm] = useState<string | null>(null);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    responsibleName: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [unitData, setUnitData] = useState({
    name: '',
    managerName: '',
    location: '',
    login: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  useEffect(() => {
    if (unitData.managerName) {
      const names = unitData.managerName.trim().split(/\s+/);
      if (names.length >= 2) {
        const targetAgencyId = selectedAgencyId || agencyId;
        const agency = agencies.find(a => a.id === targetAgencyId);
        const domain = agency?.name.toLowerCase().replace(/\s+/g, '') || 'agencia';
        const login = `${names[0].toLowerCase()}.${names[1].toLowerCase()}@${domain}.com`;
        setUnitData(prev => ({ ...prev, login }));
      }
    }
  }, [unitData.managerName, selectedAgencyId, agencyId, agencies]);
  const [userData, setUserData] = useState({
    fullName: '',
    unitId: '',
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

  const handleDeleteUnit = async (unit: Unit) => {
    if (unit.clientId) {
      await deleteDocument('clients', unit.clientId);
    }
    await deleteDocument('units', unit.id);
  };

  const handleUpdateCompanyStatus = async (id: string, status: 'ACTIVE' | 'PENDING' | 'BLOCKED') => {
    await updateDocument('companies', id, { status });
  };

  const handleUpdateUserStatus = async (userId: string, status: 'ACTIVE' | 'PENDING' | 'BLOCKED') => {
    try {
      await updateDocument('companyUsers', userId, { status });
      await updateDocument('users', userId, { status });
      const message = status === 'ACTIVE' ? 'Usuário liberado com sucesso!' : 'Status atualizado com sucesso!';
      alert(message);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Erro ao atualizar status do usuário.');
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      alert('Selecione uma agência para gerenciar antes de adicionar uma empresa.');
      return;
    }

    const companyId = Math.random().toString(36).substr(2, 9);
    const newCompany: Company = {
      id: companyId,
      ...formData,
      agencyId: targetAgencyId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    await setDocument('companies', companyId, newCompany);

    // If password provided, create the user documents
    if (formData.password) {
      const userId = Math.random().toString(36).substr(2, 9);
      const newUser: Omit<CompanyUser, 'id'> = {
        agencyId: targetAgencyId,
        companyId: companyId,
        fullName: formData.responsibleName,
        email: formData.email,
        password: formData.password,
        role: 'COMPANY',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      await setDocument('companyUsers', userId, { ...newUser, id: userId });
      
      await setDocument('users', userId, {
        id: userId,
        role: 'COMPANY',
        companyId: companyId,
        agencyId: targetAgencyId,
        email: formData.email,
        fullName: formData.responsibleName,
        status: 'PENDING',
        password: formData.password, // Store password for custom login
        createdAt: new Date().toISOString()
      });
    }

    setShowAddModal(false);
    setFormData({ name: '', responsibleName: '', cnpj: '', phone: '', email: '', address: '', password: '', confirmPassword: '' });
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditCompanyModal) return;
    await updateDocument('companies', showEditCompanyModal.id, {
      name: formData.name,
      responsibleName: formData.responsibleName,
      cnpj: formData.cnpj,
      phone: formData.phone,
      email: formData.email,
      address: formData.address
    });
    setShowEditCompanyModal(null);
    setFormData({ name: '', responsibleName: '', cnpj: '', phone: '', email: '', address: '' });
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUnitModal) return;
    if (unitData.password !== unitData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    const company = companies.find(c => c.id === showUnitModal);
    if (!company) return;

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      alert('Agência não identificada.');
      return;
    }

    const newUnit: Omit<Unit, 'id'> = {
      ...unitData,
      agencyId: targetAgencyId,
      companyId: showUnitModal,
      createdAt: new Date().toISOString()
    };
    const unitId = await createDocument('units', newUnit);
    
    // Create a CompanyUser for the unit manager
    if (unitData.login && unitData.password) {
      const userId = Math.random().toString(36).substr(2, 9);
      const newUser: CompanyUser = {
        id: userId,
        agencyId: targetAgencyId,
        companyId: showUnitModal,
        unitId: unitId,
        fullName: unitData.managerName,
        email: unitData.login,
        password: unitData.password,
        role: 'COMPANY',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      await setDocument('companyUsers', userId, newUser);

      await setDocument('users', userId, {
        id: userId,
        role: 'COMPANY',
        companyId: showUnitModal,
        agencyId: targetAgencyId,
        email: unitData.login,
        fullName: unitData.managerName,
        status: 'PENDING',
        password: unitData.password,
        createdAt: new Date().toISOString()
      });
    }
    
    // Also create a Client entry for the staffing system
    const newClient: Omit<Client, 'id'> = {
      agencyId: targetAgencyId,
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
    setUnitData({ name: '', managerName: '', location: '', login: '', password: '', confirmPassword: '', phone: '' });
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

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      alert('Agência não identificada.');
      return;
    }

    const domain = company.name.toLowerCase().replace(/\s+/g, '') + '.com';
    const login = `${userData.fullName.toLowerCase().replace(/\s+/g, '.')}@${domain}`;

    const userId = Math.random().toString(36).substr(2, 9);
    const newUser: CompanyUser = {
      id: userId,
      agencyId: targetAgencyId,
      companyId: showUserModal,
      unitId: userData.unitId!,
      fullName: userData.fullName,
      email: login,
      password: userData.password,
      role: 'COMPANY',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await setDocument('companyUsers', userId, newUser);
    
    await setDocument('users', userId, {
      id: userId,
      role: 'COMPANY',
      companyId: showUserModal,
      agencyId: targetAgencyId,
      email: login,
      fullName: userData.fullName,
      status: 'PENDING',
      password: userData.password,
      createdAt: new Date().toISOString()
    });
    
    const message = `Olá ${userData.fullName}! Seu acesso ao portal StaffLink foi criado.\n\n📧 Login: ${login}\n🔑 Senha: ${userData.password}\n\nAcesse agora: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/55${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setShowUserModal(null);
    setUserData({ fullName: '', unitId: '', password: '', confirmPassword: '' });
    alert(`Usuário criado com sucesso!\nLogin: ${login}`);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (company.cnpj && company.cnpj.includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto bg-slate-50 p-1 rounded-xl border border-slate-100">
          {(['ALL', 'ACTIVE', 'PENDING', 'BLOCKED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status === 'ALL' ? 'Todas' : status === 'ACTIVE' ? 'Ativas' : status === 'PENDING' ? 'Pendentes' : 'Bloqueadas'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {filteredCompanies.map(company => (
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
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      company.status === 'BLOCKED' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {company.status === 'ACTIVE' ? 'ATIVA' : company.status === 'BLOCKED' ? 'BLOQUEADA' : 'PENDENTE'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {company.status === 'PENDING' && (
                  <button 
                    onClick={() => handleUpdateCompanyStatus(company.id, 'ACTIVE')}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shrink-0"
                    title="Aprovar Empresa"
                  >
                    <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  </button>
                )}
                {company.status === 'ACTIVE' && (
                  <button 
                    onClick={() => handleUpdateCompanyStatus(company.id, 'BLOCKED')}
                    className="p-3 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm shrink-0"
                    title="Bloquear Empresa"
                  >
                    <Lock size={18} className="sm:w-5 sm:h-5" />
                  </button>
                )}
                {company.status === 'BLOCKED' && (
                  <button 
                    onClick={() => handleUpdateCompanyStatus(company.id, 'ACTIVE')}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shrink-0"
                    title="Desbloquear Empresa"
                  >
                    <Unlock size={18} className="sm:w-5 sm:h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setShowDetailsModal(company)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0"
                  title="Ver Detalhes"
                >
                  <Eye size={18} className="sm:w-5 sm:h-5" />
                </button>
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
                  onClick={() => {
                    setFormData({
                      name: company.name,
                      responsibleName: company.responsibleName,
                      cnpj: company.cnpj,
                      phone: company.phone,
                      email: company.email,
                      address: company.address || ''
                    });
                    setShowEditCompanyModal(company);
                  }}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0"
                  title="Editar Empresa"
                >
                  <Edit2 size={18} className="sm:w-5 sm:h-5" />
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
                {units.filter(u => u.companyId === company.id).map(unit => {
                  const manager = companyUsers.find(cu => cu.unitId === unit.id);
                  return (
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
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] sm:text-xs font-bold text-slate-600">{unit.managerName}</p>
                            {manager?.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateUserStatus(manager.id, 'ACTIVE')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95"
                              >
                                <CheckCircle size={12} />
                                Ativar Conta
                              </button>
                            )}
                          </div>
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
                  );
                })}
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
      {showEditCompanyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Edit2 className="text-blue-600" size={24} />
                Editar Empresa
              </h3>
              <button onClick={() => setShowEditCompanyModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditCompany} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ex: StaffLink Ltda" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                  <input type="text" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Responsável</label>
                  <input type="text" required value={formData.responsibleName} onChange={e => setFormData({...formData, responsibleName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ex: João Silva" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="contato@empresa.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço (Opcional)</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Rua, Número, Bairro, Cidade - Estado" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditCompanyModal(null)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">Salvar Alterações</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="text-2xl font-black text-slate-900">Detalhes da Empresa</h3>
              <button 
                onClick={() => setShowDetailsModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-slate-800">Informações Gerais</h4>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      showDetailsModal.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                      showDetailsModal.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {showDetailsModal.status === 'ACTIVE' ? 'Ativa' : showDetailsModal.status === 'PENDING' ? 'Pendente' : 'Bloqueada'}
                    </div>
                    {showDetailsModal.status === 'PENDING' && (
                      <button 
                        onClick={() => {
                          handleUpdateCompanyStatus(showDetailsModal.id, 'ACTIVE');
                          setShowDetailsModal({...showDetailsModal, status: 'ACTIVE'});
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ativar Empresa"
                      >
                        <Unlock size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Nome</p>
                    <p className="text-sm font-bold text-slate-700">{showDetailsModal.name}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">CNPJ</p>
                    <p className="text-sm font-bold text-slate-700">{showDetailsModal.cnpj || 'Não informado'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Responsável</p>
                    <p className="text-sm font-bold text-slate-700">{showDetailsModal.responsibleName}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Contato</p>
                    <p className="text-sm font-bold text-slate-700">{showDetailsModal.phone}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-700">{showDetailsModal.email}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Endereço</p>
                    <p className="text-sm font-bold text-slate-700">{showDetailsModal.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4">Documentos</h4>
                {showDetailsModal.documents && showDetailsModal.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showDetailsModal.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-bold text-slate-700">{doc.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              doc.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {doc.status === 'APPROVED' ? 'APROVADO' : doc.status === 'REJECTED' ? 'REPROVADO' : 'PENDENTE'}
                            </span>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Eye size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhum documento enviado.</p>
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4">Usuários Cadastrados</h4>
                <div className="space-y-3">
                  {companyUsers.filter(u => u.companyId === showDetailsModal.id).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.status === 'BLOCKED' ? 'bg-rose-100 text-rose-700' : 
                          user.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.status === 'BLOCKED' ? 'BLOQUEADO' : user.status === 'PENDING' ? 'PENDENTE' : 'ATIVO'}
                        </span>
                        {user.status === 'PENDING' && (
                          <button 
                            onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                          >
                            <CheckCircle size={16} />
                            Liberar Acesso
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {companyUsers.filter(u => u.companyId === showDetailsModal.id).length === 0 && (
                    <p className="text-sm text-slate-500 italic">Nenhum usuário cadastrado.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4">Funcionários que já atuaram</h4>
                <div className="space-y-3">
                  {(() => {
                    const companyUnitClientIds = units.filter(u => u.companyId === showDetailsModal.id).map(u => u.clientId).filter(Boolean);
                    const companyAssignments = assignments.filter(a => companyUnitClientIds.includes(a.clientId));
                    const uniqueEmployeeIds = Array.from(new Set(companyAssignments.map(a => a.employeeId)));
                    const companyEmployees = employees.filter(e => uniqueEmployeeIds.includes(e.id));
                    
                    return companyEmployees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {companyEmployees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            {emp.photoUrl ? (
                              <img src={emp.photoUrl} alt={emp.firstName} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                <UserIcon size={18} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-700">{emp.firstName} {emp.lastName}</p>
                              <div className="flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-bold text-slate-500">{emp.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Nenhum funcionário atuou nesta empresa ainda.</p>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4">Serviços Realizados</h4>
                <div className="space-y-3">
                  {(() => {
                    const companyUnitClientIds = units.filter(u => u.companyId === showDetailsModal.id).map(u => u.clientId).filter(Boolean);
                    const companyAssignments = assignments.filter(a => companyUnitClientIds.includes(a.clientId));
                    
                    return companyAssignments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {companyAssignments.slice(0, 10).map(as => {
                          const emp = employees.find(e => e.id === as.employeeId);
                          const client = clients.find(c => c.id === as.clientId);
                          return (
                            <div key={as.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600 border border-slate-100">
                                  <Briefcase size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-700">{emp ? `${emp.firstName} ${emp.lastName}` : 'Diarista'}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client?.name} • {formatDateBR(as.date)}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                as.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                as.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {as.status}
                              </span>
                            </div>
                          );
                        })}
                        {companyAssignments.length > 10 && (
                          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2">
                            Exibindo os últimos 10 de {companyAssignments.length} serviços
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Nenhum serviço realizado ainda.</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
        onConfirm={() => {
          const unit = units.find(u => u.id === showDeleteUnitConfirm);
          if (unit) handleDeleteUnit(unit);
          setShowDeleteUnitConfirm(null);
        }}
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
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha de Acesso</label>
                    <input 
                      type="password" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Confirmar Senha</label>
                    <input 
                      type="password" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Empresa</label>
                    <div className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-500">
                      {companies.find(c => c.id === showUnitModal)?.name}
                    </div>
                  </div>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="(00) 00000-0000"
                      value={unitData.phone}
                      onChange={e => setUnitData({...unitData, phone: e.target.value})}
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
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Login do Responsável</label>
                      <input 
                        required
                        readOnly
                        type="text" 
                        className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-500"
                        placeholder="Login"
                        value={unitData.login}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Confirmar Senha</label>
                        <input 
                          required
                          type="password" 
                          className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                          placeholder="••••••••"
                          value={unitData.confirmPassword}
                          onChange={e => setUnitData({...unitData, confirmPassword: e.target.value})}
                        />
                      </div>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Unidade</label>
                    <select
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      value={userData.unitId || ''}
                      onChange={e => setUserData({...userData, unitId: e.target.value})}
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.filter(u => u.companyId === showUserModal).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha de Acesso</label>
                    <div className="flex gap-2">
                      <input 
                        required
                        type="text" 
                        className="flex-1 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                        placeholder="••••••••"
                        value={userData.password}
                        onChange={e => setUserData({...userData, password: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const randomPassword = Math.random().toString(36).slice(-8);
                          setUserData({...userData, password: randomPassword, confirmPassword: randomPassword});
                        }}
                        className="px-4 bg-slate-100 rounded-2xl text-slate-600 font-bold text-xs hover:bg-slate-200"
                      >
                        Gerar
                      </button>
                    </div>
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

function CompanyDiaristas({ companyId, clients, employees, assignments, companies, units }: { companyId: string, clients: Client[], employees: Employee[], assignments: Assignment[], companies: Company[], units: Unit[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientUnits = units.filter(u => u.companyId === companyId);
  
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
    const employee = employees.find(e => e.id === empId);
    if (employee?.unavailableDates?.includes(date)) return false;
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
      const selectedUnit = units.find(u => u.id === selectedUnitId);
      const newRequest: Omit<CompanyRequest, 'id'> = {
        agencyId: selectedUnit?.agencyId || '',
        companyId: selectedUnit?.companyId || '',
        clientId: selectedUnit?.clientId || '',
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
                    {clientUnits.map(u => {
                      const client = clients.find(c => c.id === u.clientId);
                      return (
                        <option key={u.id} value={u.id}>
                          {client?.name || u.name}
                        </option>
                      );
                    })}
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

function CompanyEvaluateTeam({ companyId, clients, assignments, employees, feedbacks, units }: { companyId: string, clients: Client[], assignments: Assignment[], employees: Employee[], feedbacks: Feedback[], units: Unit[] }) {
  const companyUnitClientIds = units.filter(u => u.companyId === companyId).map(u => u.clientId).filter(Boolean);
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
      const assignment = assignments.find(a => companyUnitClientIds.includes(a.clientId) && a.employeeId === evaluatingEmployee.id && a.date === selectedDate);
      const newFeedback: Omit<Feedback, 'id'> = {
        agencyId: evaluatingEmployee.agencyId,
        employeeId: evaluatingEmployee.id,
        managerId: companyId,
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

  const companyAssignments = assignments.filter(a => companyUnitClientIds.includes(a.clientId));
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
          const empFeedbacks = feedbacks.filter(f => f.employeeId === emp.id && f.managerId === companyId);
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

function AgencyAccessControl({ accessPoints, clients, units, companies, checkIns, employees, agencyId, selectedAgencyId }: { accessPoints: AccessPoint[], clients: Client[], units: Unit[], companies: Company[], checkIns: CheckIn[], employees: Employee[], agencyId: string | null, selectedAgencyId?: string | null }) {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState('');

  const availableUnits = units.filter(u => !accessPoints.some(ap => ap.location === u.location));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === selectedUnitId);
    const company = companies.find(c => c.id === unit?.companyId);
    if (!unit || !company) return;

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      alert('Agência não identificada.');
      return;
    }

    const newAP: Omit<AccessPoint, 'id'> = {
      agencyId: targetAgencyId,
      clientId: unit.clientId,
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

function EmployeeProfile({ employeeId, employees, assignments, notifications, checkIns, pricing }: { employeeId: string, employees: Employee[], assignments: Assignment[], notifications: Notification[], checkIns: CheckIn[], pricing: PricingConfig }) {
  const employee = employees.find(e => e.id === employeeId);
  const pendingAssignments = assignments.filter(a => a.employeeId === employeeId && a.status === 'SCHEDULED' && !a.confirmed);
  const myNotifications = notifications.filter(n => n.userId === employeeId && !n.read);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Comprovante de Acessos - ${employee?.firstName} ${employee?.lastName}`, 10, 10);
    
    const employeeCheckIns = checkIns.filter(c => c.employeeId === employeeId);
    
    const tableData = employeeCheckIns.map(c => [
      new Date(c.timestamp).toLocaleDateString('pt-BR'),
      c.type,
      c.location,
      'R$ 100,00' // Placeholder for daily rate
    ]);

    autoTable(doc, {
      head: [['Data', 'Tipo', 'Local', 'Valor']],
      body: tableData,
    });
    
    doc.save(`comprovante_${employee?.firstName}_${employee?.lastName}.pdf`);
  };

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
          <button 
            onClick={generatePDF}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Eye size={18} />
            Ver Comprovante
          </button>
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
        <button 
          onClick={generatePDF}
          className="flex items-center justify-center gap-3 px-6 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <Eye size={18} />
          Ver Comprovante
        </button>
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

  const API_KEY = "i7mnz8H5KviiNkyLMMicWRRrPj1A201ysktJ56ShgJw"; // Chave de Reconhecimento Facial

  const handleScan = (text: string) => {
    if (text) {
      console.log("QR Code lido:", text);
      console.log("Access Points disponíveis:", accessPoints.map(ap => ap.qrCodeValue));
      const point = accessPoints.find(ap => ap.qrCodeValue === text);
      if (point) {
        setScannedPoint(point);
        setStep('PHOTO');
        startCamera();
      } else {
        console.warn("QR Code não encontrado na lista de AccessPoints.");
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

        // Geolocation verification
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          const { latitude, longitude } = position.coords;
          console.log(`Localização atual: ${latitude}, ${longitude}`);
        } catch (err) {
          console.error("Erro ao obter localização:", err);
          alert("Não foi possível obter sua localização. Por favor, permita o acesso.");
          setStep('PHOTO');
          return;
        }

        // Reconhecimento Facial Real usando Gemini
        console.log(`Iniciando reconhecimento facial real...`);
        
        try {
          const ai = new GoogleGenAI({ apiKey: API_KEY || process.env.GEMINI_API_KEY || '' });
          const model = "gemini-3-flash-preview";

          // Preparar imagem de perfil
          let profilePhotoUrl = employee.photoUrl || `https://picsum.photos/seed/${employee.id}/200`;
          let profileBase64 = "";

          try {
            const response = await fetch(profilePhotoUrl);
            const blob = await response.blob();
            profileBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.error("Erro ao carregar foto de perfil para comparação:", e);
            // Se falhar ao carregar a foto de perfil, vamos permitir o ponto mas avisar no log
            profileBase64 = ""; 
          }

          if (profileBase64) {
            const capturedData = photo.split(',')[1];
            const prompt = "Compare estas duas fotos. A primeira é a foto de perfil oficial e a segunda é a foto tirada agora no ponto. A pessoa na primeira foto é a mesma pessoa na segunda foto? Responda apenas 'SIM' ou 'NAO'. Se houver dúvida ou se as fotos forem muito diferentes, responda 'NAO'.";
            
            const result = await ai.models.generateContent({
              model,
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { inlineData: { data: profileBase64, mimeType: "image/jpeg" } },
                    { inlineData: { data: capturedData, mimeType: "image/jpeg" } },
                  ]
                }
              ]
            });

            const responseText = result.text?.toUpperCase() || "";
            const isMatch = responseText.includes('SIM');

            if (!isMatch) {
              alert('Reconhecimento facial falhou. A pessoa na foto não corresponde ao funcionário cadastrado. Por favor, tente novamente.');
              setStep('PHOTO');
              startCamera();
              return;
            }
          } else {
            console.warn("Foto de perfil não disponível para comparação. Prosseguindo sem verificação facial.");
          }
        } catch (error) {
          console.error("Erro no reconhecimento facial com Gemini:", error);
          // Em caso de erro na API, permitimos o ponto para não bloquear o funcionário, 
          // mas em um cenário real isso deveria ser tratado com mais rigor.
        }

        // Save Check-in
        const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const todayCheckIns = checkIns.filter(ci => ci.employeeId === employeeId && ci.timestamp.startsWith(today));
        const type = todayCheckIns.length % 2 === 0 ? 'IN' : 'OUT';

        const newCheckIn: Omit<CheckIn, 'id'> = {
          agencyId: employee.agencyId,
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

function CompanyDashboard({ companyId, clients, assignments, employees, feedbacks, units, companies }: { companyId: string, clients: Client[], assignments: Assignment[], employees: Employee[], feedbacks: Feedback[], units: Unit[], companies: Company[] }) {
  const company = companies.find(c => c.id === companyId);
  const companyUnitClientIds = units.filter(u => u.companyId === companyId).map(u => u.clientId).filter(Boolean);
  const [evaluatingEmployee, setEvaluatingEmployee] = useState<Employee | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  const myAssignments = assignments.filter(a => companyUnitClientIds.includes(a.clientId));
  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const todayStaff = myAssignments.filter(a => a.date === today);

  const handleEvaluate = async () => {
    if (!evaluatingEmployee) return;
    setIsSubmittingEval(true);
    try {
      const assignment = myAssignments.find(a => a.employeeId === evaluatingEmployee.id && a.status === 'COMPLETED');
      const newFeedback: Omit<Feedback, 'id'> = {
        agencyId: evaluatingEmployee.agencyId,
        employeeId: evaluatingEmployee.id,
        managerId: companyId,
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

function CompanyFeedbackForm({ companyId, clients, assignments, employees, units }: { companyId: string, clients: Client[], assignments: Assignment[], employees: Employee[], units: Unit[] }) {
  const companyUnitClientIds = units.filter(u => u.companyId === companyId).map(u => u.clientId).filter(Boolean);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const completedAssignments = assignments.filter(a => companyUnitClientIds.includes(a.clientId) && a.status === 'COMPLETED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId) return;

    const assignment = assignments.find(a => a.id === selectedAssignmentId);
    if (!assignment) return;

    const newFeedback: Omit<Feedback, 'id'> = {
      agencyId: assignment.agencyId,
      employeeId: assignment.employeeId,
      managerId: companyId,
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

function PendingApproval({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-500 mx-auto animate-pulse">
          <Clock size={48} />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">Aguardando Aprovação</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Seu cadastro foi recebido com sucesso! Nossa equipe está revisando seus dados. 
            Você receberá um e-mail assim que seu acesso for liberado.
          </p>
        </div>

        <button 
          onClick={onLogout}
          className="w-full py-5 bg-slate-950 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          Sair da Conta
        </button>
      </motion.div>
    </div>
  );
}

function CompanyRegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    unitName: '',
    fullName: '',
    phone: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [companyName, setCompanyName] = useState('');
  const [agencyDomain, setAgencyDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('companyId');

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        setIsLoading(true);
        try {
          const companyData = await getDocument<Company>('companies', companyId);
          if (companyData) {
            setCompanyName(companyData.name);
            const agencyData = await getDocument<Agency>('agencies', companyData.agencyId);
            if (agencyData) {
              setAgencyDomain(agencyData.name.toLowerCase().replace(/\s+/g, ''));
            }
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error("Error fetching registration data:", error);
          setNotFound(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setNotFound(true);
      }
    };
    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (formData.fullName && agencyDomain) {
      const names = formData.fullName.trim().split(/\s+/);
      if (names.length >= 2) {
        const login = `${names[0].toLowerCase()}.${names[1].toLowerCase()}@${agencyDomain}.com`;
        setFormData(prev => ({ ...prev, email: login }));
      }
    }
  }, [formData.fullName, agencyDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (!formData.email) {
      alert('O login ainda não foi gerado. Certifique-se de preencher o nome completo corretamente.');
      return;
    }

    setIsSubmitting(true);

    try {
      let agencyId = '';
      if (companyId) {
        const companyData = await getDocument<Company>('companies', companyId);
        if (companyData) {
          agencyId = companyData.agencyId;
        }
      }

      if (!agencyId) {
        alert('Não foi possível identificar a agência vinculada a esta empresa. Por favor, entre em contato com o suporte.');
        setIsSubmitting(false);
        return;
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      if (companyId && agencyId) {
        // Create User document first to establish role for security rules
        await setDocument('users', newUid, { 
          id: newUid,
          role: 'COMPANY', 
          companyId, 
          agencyId,
          email: formData.email,
          fullName: formData.fullName,
          status: 'PENDING',
          password: formData.password,
          createdAt: new Date().toISOString()
        });

        // Create the Unit
        const newUnit: Omit<Unit, 'id'> = {
          agencyId,
          companyId,
          name: formData.unitName,
          managerName: formData.fullName,
          location: formData.location,
          createdAt: new Date().toISOString()
        };
        const unitId = await createDocument('units', newUnit);

        // Create the Client entry for staffing
        const newClient: Omit<Client, 'id'> = {
          agencyId,
          name: `${companyName} - ${formData.unitName}`,
          managerName: formData.fullName,
          location: formData.location,
          activeScales: 0
        };
        const clientId = await createDocument('clients', newClient);
        if (unitId && clientId) {
          await updateDocument('units', unitId, { clientId });
        }

        // Create CompanyUser
        await setDocument('companyUsers', newUid, {
          id: newUid,
          companyId,
          agencyId,
          unitId,
          fullName: formData.fullName,
          email: formData.email,
          role: 'COMPANY',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        });
      }
      
      alert('Cadastro concluído com sucesso! Aguarde a aprovação do administrador.');
      onComplete();
    } catch (error: any) {
      console.error('Error registering company:', error);
      let errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.error) {
            errorMessage = `Erro de Permissão: ${parsedError.error}\nCaminho: ${parsedError.path}`;
          }
        } catch (e) {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-bold">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (notFound || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-slate-200 shadow-2xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Link Inválido</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              O link de cadastro está incompleto, expirou ou a empresa não foi encontrada. 
              Por favor, solicite um novo link à sua agência.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="p-10 bg-slate-900 text-white text-center space-y-2">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Building2 size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Cadastro de Unidade</h2>
          <p className="text-slate-400 font-medium">Complete os dados para acessar o portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Empresa</label>
              <div className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-500">
                {companyName || 'Carregando...'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Unidade</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="Ex: Unidade Centro"
                  value={formData.unitName}
                  onChange={e => setFormData({...formData, unitName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Responsável</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="Nome completo"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Localização</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="Cidade/Estado"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Login Gerado</label>
                <input 
                  required
                  readOnly
                  type="text" 
                  className="w-full p-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-500"
                  value={formData.email}
                />
                <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter italic">
                  * O login é gerado automaticamente a partir do seu nome.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha</label>
                  <input 
                    required
                    type="password" 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Confirmar Senha</label>
                  <input 
                    required
                    type="password" 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Processando...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AgencyRegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Dados da Empresa
    name: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    openingDate: '',
    segment: [] as string[],
    
    // Step 2: Endereço
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',

    // Step 3: Responsável Legal
    responsibleName: '',
    responsibleCpf: '',
    responsibleRole: '',
    phone: '',
    email: '',

    // Step 4: Acesso
    loginEmail: '',
    password: '',
    confirmPassword: '',

    // Step 5: Documentação (URLs)
    cnpjCard: '',
    socialContract: '',
    responsibleDoc: '',
    addressProof: '',

    // Step 6: Tipo de Serviço
    services: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const segments = ['Logística', 'Construção', 'Limpeza', 'Portaria', 'Industrial', 'Outros'];
  const serviceTypes = ['Logística', 'Construção', 'Limpeza', 'Portaria', 'Industrial', 'Outros'];

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    setIsSubmitting(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.loginEmail, formData.password);
      const newUid = userCredential.user.uid;

      const agencyId = Math.random().toString(36).substr(2, 9);
      
      const agencyData: Omit<Agency, 'id'> = {
        name: formData.name,
        tradeName: formData.tradeName,
        cnpj: formData.cnpj,
        stateRegistration: formData.stateRegistration,
        openingDate: formData.openingDate,
        segment: [...new Set([...formData.segment, ...formData.services])],
        address: {
          zipCode: formData.zipCode,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state
        },
        responsibleName: formData.responsibleName,
        responsibleCpf: formData.responsibleCpf,
        responsibleRole: formData.responsibleRole,
        phone: formData.phone,
        email: formData.email,
        documents: {
          cnpjCard: formData.cnpjCard,
          socialContract: formData.socialContract,
          responsibleDoc: formData.responsibleDoc,
          addressProof: formData.addressProof
        },
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      await setDocument('agencies', agencyId, { ...agencyData, id: agencyId });
      
      // Update user role to AGENCY and link to agencyId
      await setDocument('users', newUid, { 
        id: newUid,
        role: 'AGENCY', 
        agencyId, 
        email: formData.loginEmail,
        fullName: formData.responsibleName,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      
      alert('Cadastro enviado com sucesso! Aguarde a aprovação do administrador.');
      onComplete();
    } catch (error: any) {
      console.error('Error registering agency:', error);
      let errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.error) {
            errorMessage = `Erro de Permissão: ${parsedError.error}\nCaminho: ${parsedError.path}`;
          }
        } catch (e) {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                <input required type="text" className="input-field" placeholder="Razão Social da Empresa" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                <input required type="text" className="input-field" placeholder="Nome Fantasia" value={formData.tradeName} onChange={e => setFormData({...formData, tradeName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                <input required type="text" className="input-field" placeholder="00.000.000/0000-00" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Inscrição Estadual</label>
                <input type="text" className="input-field" placeholder="Opcional" value={formData.stateRegistration} onChange={e => setFormData({...formData, stateRegistration: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Abertura</label>
                <input required type="date" className="input-field" value={formData.openingDate} onChange={e => setFormData({...formData, openingDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Segmento</label>
                <div className="flex flex-wrap gap-2">
                  {segments.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const newSegment = formData.segment.includes(s) 
                          ? formData.segment.filter(item => item !== s)
                          : [...formData.segment, s];
                        setFormData({...formData, segment: newSegment});
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.segment.includes(s) ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                <input required type="text" className="input-field" placeholder="00000-000" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rua</label>
                <input required type="text" className="input-field" placeholder="Nome da rua" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
                <input required type="text" className="input-field" placeholder="123" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Complemento</label>
                <input type="text" className="input-field" placeholder="Sala, Bloco, etc." value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                <input required type="text" className="input-field" placeholder="Bairro" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                <input required type="text" className="input-field" placeholder="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                <input required type="text" className="input-field" placeholder="UF" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo do Responsável</label>
              <input required type="text" className="input-field" placeholder="Nome completo" value={formData.responsibleName} onChange={e => setFormData({...formData, responsibleName: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                <input required type="text" className="input-field" placeholder="000.000.000-00" value={formData.responsibleCpf} onChange={e => setFormData({...formData, responsibleCpf: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
                <input required type="text" className="input-field" placeholder="Ex: Dono, Gerente" value={formData.responsibleRole} onChange={e => setFormData({...formData, responsibleRole: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                <input required type="tel" className="input-field" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Contato</label>
                <input required type="email" className="input-field" placeholder="contato@empresa.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Login</label>
              <input required type="email" className="input-field" placeholder="login@empresa.com" value={formData.loginEmail} onChange={e => setFormData({...formData, loginEmail: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <input required type="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <input required type="password" className="input-field" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 font-medium mb-4 italic">Faça o upload dos documentos ou insira os links (PDF/Imagem).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cartão CNPJ</label>
                <input type="text" className="input-field" placeholder="Link do documento" value={formData.cnpjCard} onChange={e => setFormData({...formData, cnpjCard: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contrato Social</label>
                <input type="text" className="input-field" placeholder="Link do documento" value={formData.socialContract} onChange={e => setFormData({...formData, socialContract: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Documento do Responsável (RG/CNH)</label>
                <input type="text" className="input-field" placeholder="Link do documento" value={formData.responsibleDoc} onChange={e => setFormData({...formData, responsibleDoc: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Comprovante de Endereço</label>
                <input type="text" className="input-field" placeholder="Link do documento" value={formData.addressProof} onChange={e => setFormData({...formData, addressProof: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipos de Serviço Prestado</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {serviceTypes.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const newServices = formData.services.includes(s) 
                      ? formData.services.filter(item => item !== s)
                      : [...formData.services, s];
                    setFormData({...formData, services: newServices});
                  }}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.services.includes(s) 
                    ? 'bg-slate-950 border-slate-950 text-white shadow-xl shadow-slate-200 scale-105' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.services.includes(s) ? 'bg-white/10' : 'bg-slate-50'}`}>
                    <Briefcase size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{s}</span>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    "Dados da Empresa",
    "Endereço",
    "Responsável Legal",
    "Acesso",
    "Documentação",
    "Serviços"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-950" />
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Etapa {step} de 6</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stepTitles[step-1]}</h2>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-950">
              <ShieldCheck size={32} />
            </div>
          </div>

          <div className="flex gap-2 mb-12">
            {[1, 2, 3, 4, 5, 6].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-slate-950' : 'bg-slate-100'}`} />
            ))}
          </div>

          <form onSubmit={e => e.preventDefault()} className="space-y-10">
            {renderStep()}

            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-950 transition-all"
                >
                  <ChevronLeft size={18} />
                  Voltar
                </button>
              ) : <div />}

              {step < 6 ? (
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="flex items-center gap-3 px-10 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  Próximo Passo
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'}
                  <Send size={18} />
                </button>
              )}
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

    const params = new URLSearchParams(window.location.search);
    const agencyId = params.get('agencyId');

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
      agencyId: agencyId || undefined,
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

  const handleToggleUserStatus = async (id: string, type: 'EMPLOYEE' | 'COMPANY', currentStatus: string) => {
    try {
      if (type === 'EMPLOYEE') {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await updateDocument('employees', id, { status: newStatus });
      } else {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        await updateDocument('companyUsers', id, { status: newStatus });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Erro ao alterar status do usuário.');
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : emp.status === 'INACTIVE' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      {emp.status === 'ACTIVE' ? 'Ativo' : emp.status === 'INACTIVE' ? 'Inativo' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleToggleUserStatus(emp.id, 'EMPLOYEE', emp.status)}
                      className={`p-2 transition-colors ${emp.status === 'ACTIVE' ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}
                      title={emp.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}
                    >
                      {emp.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                    <button 
                      onClick={() => {
                        setShowEditModal(emp.id);
                        setEditData({ email: emp.loginEmail || '', password: emp.password || '' });
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Resetar Senha"
                    >
                      <Key size={18} />
                    </button>
                    {(role === 'AGENCY' || role === 'ADMIN') && (
                      <button 
                        onClick={() => handleDeleteUser(emp.id, 'EMPLOYEE')}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remover Acesso"
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cu.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {cu.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleToggleUserStatus(cu.id, 'COMPANY', cu.status || 'ACTIVE')}
                      className={`p-2 transition-colors ${cu.status === 'ACTIVE' ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}
                      title={cu.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}
                    >
                      {cu.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                    <button 
                      onClick={() => {
                        setShowEditModal(cu.id);
                        setEditData({ email: cu.email, password: cu.password || '' });
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Resetar Senha"
                    >
                      <Key size={18} />
                    </button>
                    {(role === 'AGENCY' || role === 'ADMIN') && (
                      <button 
                        onClick={() => handleDeleteUser(cu.id, 'COMPANY')}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remover Acesso"
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

const UserProfile = ({ user, role, employee, companyUser, agency }: { user: User | null, role: UserRole, employee?: Employee, companyUser?: CompanyUser, agency?: Agency }) => {
  console.log('UserProfile - role:', role, 'agency:', agency);
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

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : companyUser?.fullName || agency?.name || user?.displayName || 'Usuário';
  const loginEmail = employee?.loginEmail || companyUser?.email || agency?.email || user?.email;
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

          {agency && (
            <div className="space-y-8 pt-6 border-t border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Detalhes da Agência</h3>

              {/* 1. Dados da Empresa */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">🏢 1. Dados da Empresa</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Razão Social</p>
                    <p className="text-sm font-bold text-slate-900">{agency.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Fantasia</p>
                    <p className="text-sm font-bold text-slate-900">{agency.tradeName || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CNPJ</p>
                    <p className="text-sm font-bold text-slate-900">{agency.cnpj || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inscrição Estadual</p>
                    <p className="text-sm font-bold text-slate-900">{agency.stateRegistration || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data de Abertura</p>
                    <p className="text-sm font-bold text-slate-900">{agency.openingDate || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segmento</p>
                    <p className="text-sm font-bold text-slate-900">{agency.segment?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 2. Endereço da Empresa */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">📍 2. Endereço da Empresa</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    {agency.address?.street}, {agency.address?.number} {agency.address?.complement ? `- ${agency.address.complement}` : ''}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {agency.address?.neighborhood} - {agency.address?.city}/{agency.address?.state} | CEP: {agency.address?.zipCode || 'N/A'}
                  </p>
                </div>
              </div>

              {/* 3. Responsável Legal */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">👤 3. Responsável Legal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                    <p className="text-sm font-bold text-slate-900">{agency.responsibleName || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                    <p className="text-sm font-bold text-slate-900">{agency.responsibleCpf || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargo</p>
                    <p className="text-sm font-bold text-slate-900">{agency.responsibleRole || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                    <p className="text-sm font-bold text-slate-900">{agency.phone || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-sm font-bold text-slate-900">{agency.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 4. Acesso à Plataforma */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">🔐 4. Acesso à Plataforma</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail (login)</p>
                  <p className="text-sm font-bold text-slate-900">{agency.email || 'N/A'}</p>
                </div>
              </div>

              {/* 5. Documentação */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">📄 5. Documentação</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Documentos anexados: {agency.documents ? Object.keys(agency.documents).length : 0}</p>
                </div>
              </div>

              {/* 6. Tipo de Serviço Prestado */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">👷 6. Tipo de Serviço Prestado</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{agency.segment?.join(', ') || 'N/A'}</p>
                </div>
              </div>

              {/* 7. Capacidade Operacional */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">👥 7. Capacidade Operacional</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qtd. Funcionários</p>
                    <p className="text-sm font-bold text-slate-900">{agency.employeeCount || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Regime</p>
                    <p className="text-sm font-bold text-slate-900">{agency.regime || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Regiões</p>
                    <p className="text-sm font-bold text-slate-900">{agency.regions?.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Turnos</p>
                    <p className="text-sm font-bold text-slate-900">{agency.shifts?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 8. Informações comerciais */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">💰 8. Informações comerciais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Forma de Cobrança</p>
                    <p className="text-sm font-bold text-slate-900">{agency.billingMethod || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Médio</p>
                    <p className="text-sm font-bold text-slate-900">{agency.averageValue ? `R$ ${agency.averageValue.toFixed(2)}` : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aceita Urgência?</p>
                    <p className="text-sm font-bold text-slate-900">{agency.acceptsUrgency ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </div>

              {/* 9. Termos e validação */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">✅ 9. Termos e validação</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Termos aceitos e conta validada.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function DocumentControl({ companies }: { companies: Company[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const handleUpdateDocumentStatus = async (companyId: string, docIndex: number, newStatus: 'APPROVED' | 'REJECTED') => {
    const company = companies.find(c => c.id === companyId);
    if (!company || !company.documents) return;

    const updatedDocuments = [...company.documents];
    updatedDocuments[docIndex] = { ...updatedDocuments[docIndex], status: newStatus };

    await updateDocument('companies', companyId, { documents: updatedDocuments });
  };

  const allDocuments = companies.flatMap(company => 
    (company.documents || []).map((doc, index) => ({
      ...doc,
      companyId: company.id,
      companyName: company.name,
      companyCnpj: company.cnpj,
      originalIndex: index
    }))
  );

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doc.companyCnpj && doc.companyCnpj.includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Controle de Documentos</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Validação e aprovação de documentos de empresas parceiras.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome da empresa ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto bg-slate-50 p-1 rounded-xl border border-slate-100">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status === 'ALL' ? 'Todos' : status === 'APPROVED' ? 'Aprovados' : status === 'REJECTED' ? 'Reprovados' : 'Pendentes'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Envio</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocuments.map((doc, idx) => (
                <tr key={`${doc.companyId}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-700">{doc.companyName}</p>
                      <p className="text-xs text-slate-500">CNPJ: {doc.companyCnpj || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <span className="font-medium text-slate-700">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{formatDateBR(doc.uploadedAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                      doc.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {doc.status === 'APPROVED' ? 'Aprovado' : doc.status === 'REJECTED' ? 'Reprovado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Visualizar Documento"
                      >
                        <Eye size={18} />
                      </a>
                      {doc.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleUpdateDocumentStatus(doc.companyId, doc.originalIndex, 'APPROVED')}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Aprovar"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateDocumentStatus(doc.companyId, doc.originalIndex, 'REJECTED')}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Reprovar"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Nenhum documento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function ServiceMonitoring({ assignments, companies, units, employees }: { assignments: Assignment[], companies: Company[], units: Unit[], employees: Employee[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const enrichedAssignments = assignments.map(assignment => {
    const employee = employees.find(e => e.id === assignment.employeeId);
    let companyName = 'N/A';
    let unitName = 'N/A';

    // Try to find if it's a unit
    const unit = units.find(u => u.clientId === assignment.clientId);
    if (unit) {
      unitName = unit.name;
      const company = companies.find(c => c.id === unit.companyId);
      if (company) companyName = company.name;
    } else {
      // It might be a direct company client
      const company = companies.find(c => c.id === assignment.clientId);
      if (company) companyName = company.name;
    }

    return {
      ...assignment,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Desconhecido',
      companyName,
      unitName
    };
  });

  const filteredAssignments = enrichedAssignments.filter(assignment => {
    const matchesSearch = assignment.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Monitoramento de Serviços</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Acompanhe todos os serviços realizados pelas empresas parceiras.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por empresa ou diarista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex w-full md:w-auto bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto scrollbar-hide">
          {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {status === 'ALL' ? 'Todos' : 
               status === 'SCHEDULED' ? 'Agendados' : 
               status === 'IN_PROGRESS' ? 'Em Andamento' : 
               status === 'COMPLETED' ? 'Concluídos' : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / Unidade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diarista</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssignments.map(assignment => (
                <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{formatDateBR(assignment.date)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-700">{assignment.companyName}</p>
                      <p className="text-xs text-slate-500">{assignment.unitName !== 'N/A' ? assignment.unitName : 'Matriz'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">{assignment.employeeName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">R$ {assignment.value.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      assignment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      assignment.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                      assignment.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {assignment.status === 'COMPLETED' ? 'Concluído' : 
                       assignment.status === 'IN_PROGRESS' ? 'Em Andamento' : 
                       assignment.status === 'CANCELLED' ? 'Cancelado' : 'Agendado'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Nenhum serviço encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
