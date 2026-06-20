import toast, { Toaster } from 'react-hot-toast';
import React, { useState, useEffect, useRef, Component } from 'react';
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
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
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
  FileSpreadsheet,
  Send,
  Cake,
  Database,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  ArrowLeft,
  TrendingUp as TrendingUpIcon,
  Volume2,
  VolumeX,
  FileText,
  Briefcase,
  CheckCircle2,
  Flame,
  Key,
  XCircle,
  Edit2,
  ExternalLink,
  Activity,
  Play,
  HelpCircle,
  QrCode,
  Scan,
  MapPin,
  Camera,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import imageCompression from 'browser-image-compression';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Feed } from './components/Feed';
import MapViewerModal from './components/MapViewerModal';
import { UserRole, Employee, Client, Assignment, Feedback, ContactRequest, Company, Unit, CompanyUser, PricingConfig, CompanyRequest, EmployeeRegistration, AppNotification, Agency, Message, Bulletin, Invoice, Plan, CheckIn, PlanType } from './types';
import { LandingPage } from './components/LandingPage';
import { DEFAULT_PRICING } from './constants';
import { auth, googleProvider, sendPasswordResetEmail, db, messaging, generateToken, onMessage } from './firebase';
import { createNewUser } from './secondary-auth';
import { signInWithPopup, onAuthStateChanged, signOut, User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile, fetchSignInMethodsForEmail } from 'firebase/auth';
import { onSnapshot, doc, collection, query, getDocs } from 'firebase/firestore';
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

function formatDateBR(dateString: string | Date | undefined | null) {
  if (!dateString) return '--/--/----';
  try {
    const ds = typeof dateString === 'string' ? dateString : dateString.toISOString();
    if (ds.includes('-') && !ds.includes('T')) {
      const [year, month, day] = ds.split('-');
      if (!year || !month || !day) return '--/--/----';
      return `${day}/${month}/${year}`;
    }
    const date = new Date(ds);
    if (isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return '--/--/----';
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors duration-500">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-transparent dark:border-slate-800">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <pre className="mt-4 p-4 bg-gray-100 dark:bg-slate-950 rounded-sm text-left text-xs overflow-auto max-h-40 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-800">
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

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}

function AppNavbar({ role, activeTab, setActiveTab, userEmail, userName, userPhoto, handleLogout, agencyPlan, setIsMobileMenuOpen, isDarkMode, setIsDarkMode, unreadNotifications = 0 }: { 
  role: string, 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  userEmail: string | null,
  userName: string | null,
  userPhoto: string | null,
  handleLogout: () => void,
  agencyPlan?: PlanType,
  setIsMobileMenuOpen: (open: boolean) => void,
  isDarkMode: boolean,
  setIsDarkMode: (val: boolean) => void,
  unreadNotifications?: number
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allMenuItems: MenuItem[] = role === 'ADMIN' ? [
    { id: 'admin_dashboard', label: 'Início', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'admin_agencies', label: 'Gestão de Agências', icon: ShieldCheck, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
    { id: 'admin_plans', label: 'Planos de Assinatura', icon: CreditCard, color: 'text-accent-cyan bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-accent-indigo bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' },
  ] : role === 'AGENCY' ? [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'staffing', label: 'Solicitação', icon: Users, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
    { id: 'access_flow', label: 'Fluxo de acesso', icon: Activity, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
    { id: 'ponto', label: 'Ponto de controle', icon: QrCode, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
    { id: 'registrations', label: 'Cadastros', icon: UserPlus, color: 'text-accent-emerald bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
    { id: 'companies', label: 'Empresas', icon: Building2, color: 'text-accent-indigo bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' },
    { id: 'pricing', label: 'Precificação', icon: CreditCard, color: 'text-accent-cyan bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' },
    { id: 'reports', label: 'Relatórios', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'user_management', label: 'Gestão de Logins', icon: Lock, color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800' },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
  ] : role === 'COMPANY' ? [
    { id: 'manager_dashboard', label: 'Início', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'access_flow', label: 'Fluxo de acesso', icon: Activity, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
    { id: 'evaluate_team', label: 'Avaliar Equipe', icon: Star, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'company_diaristas', label: 'Solicitação', icon: Users, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
    { id: 'company_reports', label: 'Relatórios', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'company_profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-accent-indigo bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' },
  ] : [
    { id: 'employee_profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'employee_ponto', label: 'Bater Ponto', icon: Scan, color: 'text-accent-rose bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
    { id: 'employee_schedule', label: 'Agenda', icon: Calendar, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (role === 'AGENCY' && agencyPlan === 'STARTER') {
      const restrictedForStarter = ['feed', 'ponto', 'access_flow', 'feedbacks', 'pricing', 'reports'];
      return !restrictedForStarter.includes(item.id);
    }
    if (role === 'EMPLOYEE' && agencyPlan === 'STARTER') {
      const restrictedForStarter = ['feed', 'employee_ponto'];
      return !restrictedForStarter.includes(item.id);
    }
    if (role === 'COMPANY' && agencyPlan === 'STARTER') {
      const restrictedForStarter = ['feed', 'access_flow'];
      return !restrictedForStarter.includes(item.id);
    }
    return true;
  });

  const agencyGroups = role === 'AGENCY' ? [
    { 
      label: 'Operacional', 
      items: menuItems.filter(i => ['staffing', 'access_flow', 'ponto'].includes(i.id)) 
    },
    { 
      label: 'Gestão & Acesso', 
      items: menuItems.filter(i => ['registrations', 'companies', 'pricing'].includes(i.id)) 
    },
    { 
      label: 'Sistema', 
      items: menuItems.filter(i => ['reports', 'user_management', 'feedbacks', 'profile'].includes(i.id)) 
    }
  ] : role === 'COMPANY' ? [
    {
      label: 'Operacional',
      items: menuItems.filter(i => ['company_diaristas', 'access_flow', 'evaluate_team'].includes(i.id))
    },
    {
      label: 'Sistema',
      items: menuItems.filter(i => ['company_reports', 'company_profile'].includes(i.id))
    }
  ] : role === 'EMPLOYEE' ? [
    {
      label: 'Operacional',
      items: menuItems.filter(i => ['employee_ponto', 'employee_schedule'].includes(i.id))
    },
    {
      label: 'Pessoal',
      items: menuItems.filter(i => ['employee_profile'].includes(i.id))
    }
  ] : [];

  const mainItems = (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') 
    ? menuItems.filter(i => ['dashboard', 'admin_dashboard', 'manager_dashboard', 'feed'].includes(i.id)) 
    : menuItems;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="flex-shrink-0 cursor-pointer" onClick={() => setActiveTab(role === 'ADMIN' ? 'admin_dashboard' : role === 'AGENCY' ? 'dashboard' : role === 'COMPANY' ? 'manager_dashboard' : 'employee_profile')}>
              <img 
                src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
                alt="Logotipo" 
                className="h-10 sm:h-12 w-auto dark:brightness-0 dark:invert" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {role !== 'ADMIN' && (
              <button 
                onClick={() => setActiveTab(role === 'EMPLOYEE' ? 'employee_profile' : role === 'COMPANY' ? 'company_profile' : 'dashboard')}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                title="Notificações"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 border-none">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">{userName || 'Usuário'}</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{role === 'AGENCY' ? 'Agência' : role === 'ADMIN' ? 'Admin' : role === 'COMPANY' ? 'Empresa' : 'Colaborador'}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative" ref={profileMenuRef}>
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden cursor-pointer active:scale-95 transition-all"
                >
                  <img 
                    src={userPhoto || "https://picsum.photos/seed/user/100"} 
                    alt="Foto de Perfil" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-[100] origin-top-right transition-colors duration-500"
                    >
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setActiveTab(role === 'EMPLOYEE' ? 'employee_profile' : role === 'COMPANY' ? 'company_profile' : 'profile');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                          <UserIcon size={14} className="text-slate-400 dark:text-slate-500" />
                          MEU PERFIL
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                        <button 
                          onClick={() => {
                            handleLogout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <LogOut size={14} />
                          SAIR DA CONTA
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 py-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-slate-950 dark:bg-brand-500 text-white shadow-lg' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-white' : item.color?.split(' ')[0]} />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest leading-none">
                {item.label}
              </span>
            </button>
          ))}

          {agencyGroups.length > 0 && agencyGroups.map((group) => (
            <div key={group.label} className="relative group px-1">
              <button className={`flex items-center gap-2 px-5 py-4 rounded-xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] sm:text-[11px] h-full ${group.items.some(i => i.id === activeTab) ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:text-slate-900 focus:bg-slate-50 focus:dark:bg-slate-900'}`}>
                {group.label}
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform opacity-50" />
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-[100] origin-top p-2 translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0">
                <div className="grid gap-1">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left ${activeTab === item.id ? 'bg-slate-950 dark:bg-brand-500 text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white focus:bg-slate-50 focus:text-slate-950'}`}
                    >
                      <item.icon size={16} className={activeTab === item.id ? 'text-white' : item.color?.split(' ')[0]} />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none flex-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

function MobileSidebar({ role, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, userName, userPhoto, handleLogout, agencyPlan, isDarkMode, setIsDarkMode, unreadNotifications = 0 }: { 
  role: string, 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  isMobileMenuOpen: boolean,
  setIsMobileMenuOpen: (open: boolean) => void,
  userName: string | null,
  userPhoto: string | null,
  handleLogout: () => void,
  agencyPlan?: PlanType,
  isDarkMode: boolean,
  setIsDarkMode: (val: boolean) => void,
  unreadNotifications?: number
}) {
  const allMenuItems: MenuItem[] = role === 'ADMIN' ? [
    { id: 'admin_dashboard', label: 'Início', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'admin_agencies', label: 'Gestão de Agências', icon: ShieldCheck, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
    { id: 'admin_plans', label: 'Planos de Assinatura', icon: CreditCard, color: 'text-accent-cyan bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-accent-indigo bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' },
  ] : role === 'AGENCY' ? [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'staffing', label: 'Solicitação', icon: Users, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
    { id: 'access_flow', label: 'Fluxo de acesso', icon: Activity, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
    { id: 'ponto', label: 'Ponto de controle', icon: QrCode, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
    { id: 'registrations', label: 'Cadastros', icon: UserPlus, color: 'text-accent-emerald bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' },
    { id: 'companies', label: 'Empresas', icon: Building2, color: 'text-accent-indigo bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' },
    { id: 'pricing', label: 'Precificação', icon: CreditCard, color: 'text-accent-cyan bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' },
    { id: 'reports', label: 'Relatórios', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'user_management', label: 'Gestão de Logins', icon: Lock, color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800' },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
  ] : role === 'COMPANY' ? [
    { id: 'manager_dashboard', label: 'Início', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'access_flow', label: 'Fluxo de acesso', icon: Activity, color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
    { id: 'evaluate_team', label: 'Avaliar Equipe', icon: Star, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'company_diaristas', label: 'Solicitação', icon: Users, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
    { id: 'company_reports', label: 'Relatórios', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'company_profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-accent-indigo bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20' },
  ] : [
    { id: 'employee_profile', label: 'Meu Perfil', icon: UserIcon, color: 'text-brand-600 bg-brand-50 dark:text-blue-400 dark:bg-blue-900/20' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, color: 'text-accent-amber bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' },
    { id: 'employee_ponto', label: 'Bater Ponto', icon: Scan, color: 'text-accent-rose bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20' },
    { id: 'employee_schedule', label: 'Agenda', icon: Calendar, color: 'text-accent-violet bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (role === 'AGENCY' && agencyPlan === 'STARTER') {
      const restrictedForStarter = ['feed', 'ponto', 'access_flow', 'feedbacks', 'pricing', 'reports'];
      return !restrictedForStarter.includes(item.id);
    }
    if (role === 'EMPLOYEE' && agencyPlan === 'STARTER') {
      const restrictedForStarter = ['feed', 'employee_ponto'];
      return !restrictedForStarter.includes(item.id);
    }
    if (role === 'COMPANY' && agencyPlan === 'STARTER') {
      const restrictedForStarter = ['feed', 'access_flow'];
      return !restrictedForStarter.includes(item.id);
    }
    return true;
  });

  const agencyGroups = role === 'AGENCY' ? [
    { 
      label: 'Operacional', 
      items: menuItems.filter(i => ['staffing', 'access_flow', 'ponto'].includes(i.id)) 
    },
    { 
      label: 'Gestão & Acesso', 
      items: menuItems.filter(i => ['registrations', 'companies', 'pricing'].includes(i.id)) 
    },
    { 
      label: 'Sistema', 
      items: menuItems.filter(i => ['reports', 'user_management', 'feedbacks', 'profile'].includes(i.id)) 
    }
  ] : role === 'COMPANY' ? [
    {
      label: 'Operacional',
      items: menuItems.filter(i => ['company_diaristas', 'access_flow', 'evaluate_team'].includes(i.id))
    },
    {
      label: 'Sistema',
      items: menuItems.filter(i => ['company_reports', 'company_profile'].includes(i.id))
    }
  ] : role === 'EMPLOYEE' ? [
    {
      label: 'Operacional',
      items: menuItems.filter(i => ['employee_ponto', 'employee_schedule'].includes(i.id))
    },
    {
      label: 'Pessoal',
      items: menuItems.filter(i => ['employee_profile'].includes(i.id))
    }
  ] : [];

  const mainItems = (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') 
    ? menuItems.filter(i => ['dashboard', 'admin_dashboard', 'manager_dashboard', 'feed'].includes(i.id)) 
    : menuItems;

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 bottom-0 z-[110] w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full transition-colors duration-500">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <img 
                src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
                alt="Logotipo" 
                className="h-10 w-auto dark:brightness-0 dark:invert"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img src={userPhoto || "https://picsum.photos/seed/user/100"} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-slate-900 dark:text-white truncate uppercase">{userName || 'Usuário'}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Main Items like Dashboard and Feed */}
            {mainItems.length > 0 && (
              <div className="space-y-1">
                {mainItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-slate-950 dark:bg-brand-500 text-white shadow-xl scale-[1.02]' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-white' : item.color?.split(' ')[0]} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Categorized Groups */}
            {agencyGroups.length > 0 ? (
              agencyGroups.map(group => (
                <div key={group.label} className="space-y-2">
                  <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                          activeTab === item.id 
                            ? 'bg-slate-950 dark:bg-brand-500 text-white shadow-xl scale-[1.02]' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <item.icon size={18} className={activeTab === item.id ? 'text-white' : item.color?.split(' ')[0]} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-slate-950 dark:bg-brand-500 text-white shadow-xl scale-[1.02]' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-white' : item.color?.split(' ')[0]} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-[11px] font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all shadow-sm border border-rose-100 dark:border-rose-900/50"
            >
              <LogOut size={16} />
              SAIR DA CONTA
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ChangePasswordScreen({ user, onComplete, handleLogout, isDarkMode, setIsDarkMode }: { user: any, onComplete: () => void, handleLogout: () => void, isDarkMode: boolean, setIsDarkMode: (val: boolean) => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
      <div className="absolute top-4 right-4 relative z-10">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden relative z-0"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100 dark:shadow-blue-900/20">
            <Lock className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Trocar Senha</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2">Este é seu primeiro acesso. Por segurança, você deve definir uma nova senha.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Nova Senha</label>
              <div className="relative">
                <input 
                  required
                  type={showNewPassword ? "text" : "password"} 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Confirmar Nova Senha</label>
              <div className="relative">
                <input 
                  required
                  type={showConfirmPassword ? "text" : "password"} 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? 'Atualizando...' : 'Salvar Nova Senha'}
            </button>
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full py-4 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            >
              Sair e trocar depois
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SubscriptionFlow({ 
  plan, 
  user, 
  onComplete, 
  onCancel,
  isDarkMode,
  setIsDarkMode
}: { 
  plan: Plan, 
  user: any, 
  onComplete: (planId: PlanType) => void,
  onCancel: () => void,
  isDarkMode: boolean,
  setIsDarkMode: (val: boolean) => void
}) {
  const [step, setStep] = useState<'SUMMARY' | 'PAYMENT' | 'CONFIRMATION'>('SUMMARY');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('CONFIRMATION');
    }, 2000);
  };

  if (step === 'SUMMARY') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="absolute top-4 right-4 relative z-10">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-xl w-full p-8 sm:p-12 rounded-[2.5rem] border shadow-2xl relative z-0 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
        >
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-colors ${isDarkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-brand-50 text-brand-500'}`}>
              <FileText size={40} />
            </div>
            <h3 className="text-3xl font-black tracking-tight font-display mb-2">Resumo da Assinatura</h3>
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Confirme os detalhes do seu plano antes de prosseguir.</p>
          </div>

          <div className={`p-6 rounded-2xl border mb-8 transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Plano Selecionado</span>
              <span className="text-brand-500 font-black uppercase tracking-tight">{plan.name}</span>
            </div>
            <div className="space-y-3">
              {plan.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={16} className="text-brand-500" />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Valor Mensal</span>
              <span className="text-2xl font-black tracking-tighter">
                {plan.price === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              Cancelar
            </button>
            <button 
              onClick={() => setStep('PAYMENT')}
              className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20"
            >
              Ir para Pagamento
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'PAYMENT') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`max-w-xl w-full p-8 sm:p-12 rounded-[2.5rem] border shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
        >
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-colors ${isDarkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-brand-50 text-brand-500'}`}>
              <CreditCard size={40} />
            </div>
            <h3 className="text-3xl font-black tracking-tight font-display mb-2">Pagamento</h3>
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Insira os dados do seu cartão para ativar o plano.</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome no Cartão</label>
              <input 
                type="text" 
                placeholder="Ex: JOÃO A SILVA"
                className={`w-full p-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-black border-slate-800' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Cartão</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  className={`w-full pl-12 pr-4 py-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-black border-slate-800' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validade</label>
                <input 
                  type="text" 
                  placeholder="MM/AA"
                  className={`w-full p-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-black border-slate-800' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                <input 
                  type="text" 
                  placeholder="000"
                  className={`w-full p-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-black border-slate-800' : 'bg-slate-50 border-slate-100 focus:bg-white'}`}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-5 bg-brand-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? 'Processando...' : `Pagar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}`}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-xl w-full p-12 rounded-[3rem] border shadow-2xl text-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
      >
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 size={56} />
        </div>
        <h3 className="text-4xl font-black tracking-tight font-display mb-4">Pagamento Confirmado!</h3>
        <p className={`text-lg font-medium mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Seu plano <span className="text-brand-500 font-bold">{plan.name}</span> foi ativado com sucesso. Agora você tem acesso total aos recursos contratados.
        </p>
        <button 
          onClick={() => onComplete(plan.id)}
          className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Ir para o Dashboard
        </button>
      </motion.div>
    </div>
  );
}

function UnitQRManager({ units, companies, agencyId, selectedAgencyId }: { units: Unit[], companies: Company[], agencyId: string | null, selectedAgencyId?: string | null }) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    name: '',
    companyId: '',
    location: ''
  });

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitData.name || !newUnitData.companyId || !newUnitData.location) {
      toast('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetAgencyId = selectedAgencyId || agencyId;
      const unitId = crypto.randomUUID();
      const clientId = crypto.randomUUID();

      // Create internal client for the unit
      await createDocument('clients', {
        id: clientId,
        agencyId: targetAgencyId,
        name: newUnitData.name,
        location: newUnitData.location,
        type: 'UNIT',
        createdAt: new Date().toISOString()
      });

      // Create unit
      await createDocument('units', {
        id: unitId,
        agencyId: targetAgencyId,
        companyId: newUnitData.companyId,
        name: newUnitData.name,
        location: newUnitData.location,
        clientId: clientId,
        createdAt: new Date().toISOString()
      });

      setShowAddUnitModal(false);
      setNewUnitData({ name: '', companyId: '', location: '' });
      toast.success('Unidade e QR Code gerados com sucesso!');
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Erro ao gerar nova unidade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('unit-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${selectedUnit?.name || 'unidade'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAddUnitModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Gerar Novo QR Code (Nova Unidade)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map(unit => {
          const company = companies.find(c => c.id === unit.companyId);
          return (
            <div key={unit.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">{unit.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{company?.name || 'Empresa'}</p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <QrCode size={20} />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                <MapPin size={14} />
                {unit.location}
              </p>
              <button 
                onClick={() => setSelectedUnit(unit)}
                className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                Ver QR Code
              </button>
            </div>
          );
        })}
        {units.length === 0 && (
          <div className="col-span-full bg-slate-50 p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold italic">Nenhuma unidade cadastrada para gerar QR Code.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">QR Code da Unidade</h3>
                <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 mb-8 flex flex-col items-center justify-center">
                <div className="absolute opacity-0 pointer-events-none">
                  <QRCodeCanvas 
                    id="unit-qr-canvas"
                    value={selectedUnit.id} 
                    size={1024} 
                    level="H" 
                    includeMargin={true} 
                  />
                </div>
                <QRCodeSVG value={selectedUnit.id} size={200} level="H" includeMargin={true} />
                <p className="mt-6 font-black text-slate-900 uppercase tracking-widest text-xs uppercase">{selectedUnit.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {selectedUnit.id}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleDownloadQR}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Download size={18} />
                  Baixar QR Code (PNG)
                </button>
                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 border border-slate-200"
                >
                  <FileText size={18} />
                  Imprimir QR Code
                </button>
                <p className="text-[10px] text-slate-400 font-medium">
                  Baixe a imagem para enviar via WhatsApp ou imprima para fixar na unidade.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddUnitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nova Unidade / QR Code</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Cadastre uma nova unidade para gerar o ponto</p>
                </div>
                <button onClick={() => setShowAddUnitModal(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
                  <X size={24} className="text-slate-400 dark:text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateUnit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Unidade</label>
                    <input 
                      required
                      type="text"
                      placeholder="Ex: Unidade Centro, Filial SP..."
                      value={newUnitData.name}
                      onChange={e => setNewUnitData({...newUnitData, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa Parceira</label>
                    <select 
                      required
                      value={newUnitData.companyId}
                      onChange={e => setNewUnitData({...newUnitData, companyId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                    >
                      <option value="">Selecione a empresa...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização / Endereço</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        required
                        type="text"
                        placeholder="Rua, Número, Bairro, Cidade..."
                        value={newUnitData.location}
                        onChange={e => setNewUnitData({...newUnitData, location: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddUnitModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Gerando...' : 'Gerar QR Code'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SimplePonto({ user, employees, units, checkins }: { user: any, employees: Employee[], units: Unit[], checkins: CheckIn[] }) {
  const [scanning, setScanning] = useState(false);
  const [scannedUnitId, setScannedUnitId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [type, setType] = useState<'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END' | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjType, setAdjType] = useState<'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END'>('IN');
  const [adjTime, setAdjTime] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjUnitId, setAdjUnitId] = useState('');
  const [adjDate, setAdjDate] = useState('');
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const unit = units.find(u => u.id === scannedUnitId);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Erro ao acessar a câmera.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhoto(dataUrl);
        
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
      }
    }
  };

  const handleRegister = async () => {
    if (!user || !scannedUnitId || !photo || !type) return;

    const loadingToast = toast.loading('Registrando ponto...');
    try {
      const checkinData: Partial<CheckIn> = {
        employeeId: user.uid,
        unitId: scannedUnitId,
        timestamp: new Date().toISOString(),
        type: type,
        photoUrl: photo
      };

      await createDocument('checkins', checkinData);
      toast.success('Ponto registrado com sucesso!', { id: loadingToast });
      
      // Reset state
      setScanning(false);
      setScannedUnitId(null);
      setPhoto(null);
      setType(null);
    } catch (err) {
      console.error("Error registering check-in:", err);
      toast.error("Erro ao registrar ponto.", { id: loadingToast });
    }
  };

  const myCheckins = checkins.filter(ci => ci.employeeId === user?.uid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const lastPunchType = myCheckins.length > 0 ? myCheckins[0].type : null;
  
  let nextPunchBtn: { type: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END', label: string, color: string, icon: any } = {
    type: 'IN', label: 'ENTRADA', color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-emerald-900/20 text-white', icon: <ArrowUpRight size={24} />
  };

  if (lastPunchType === 'IN') {
    nextPunchBtn = { type: 'BREAK_START', label: 'SAÍDA INTERVALO', color: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 dark:shadow-amber-900/20 text-white', icon: <ArrowRight size={24} /> };
  } else if (lastPunchType === 'BREAK_START') {
    nextPunchBtn = { type: 'BREAK_END', label: 'VOLTA INTERVALO', color: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 dark:shadow-blue-900/20 text-white', icon: <ArrowUpRight size={24} /> };
  } else if (lastPunchType === 'BREAK_END') {
    nextPunchBtn = { type: 'OUT', label: 'SAÍDA', color: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100 dark:shadow-rose-900/20 text-white', icon: <ArrowRight size={24} className="rotate-45" /> };
  } else if (lastPunchType === 'OUT') {
    nextPunchBtn = { type: 'IN', label: 'ENTRADA', color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-emerald-900/20 text-white', icon: <ArrowUpRight size={24} /> };
  }

  const handleAdjustmentSubmit = async () => {
    if (!user || !adjUnitId || !adjTime || !adjReason) {
      toast.error('Preencha todos os campos do ajuste.');
      return;
    }

    setIsSubmittingAdj(true);
    const loadingToast = toast.loading('Enviando solicitação...');
    try {
      // Use the provided adjDate for the adjustment
      const dateToUse = adjDate || new Date().toISOString().split('T')[0];
      const adjustmentTimestamp = new Date(dateToUse + 'T' + adjTime).toISOString();

      const adjData: Partial<CheckIn> = {
        employeeId: user.uid,
        unitId: adjUnitId,
        timestamp: adjustmentTimestamp,
        type: adjType,
        photoUrl: '', // No photo for manual adjustments
        isAdjustment: true,
        status: 'PENDING',
        adjustmentReason: adjReason,
        createdAt: new Date().toISOString()
      } as any;

      await createDocument('checkins', adjData);
      toast.success('Solicitação de ajuste enviada!', { id: loadingToast });
      setShowAdjustmentModal(false);
      setAdjReason('');
      setAdjTime('');
    } catch (err) {
      console.error("Error submitting adjustment:", err);
      toast.error("Erro ao enviar solicitação.", { id: loadingToast });
    } finally {
      setIsSubmittingAdj(false);
    }
  };

  // Logic to identify inconsistencies (12h after the only punch)
  const getInconsistencies = () => {
    if (!user) return [];
    
    // Group by date
    const checkinsByDate: Record<string, CheckIn[]> = {};
    myCheckins.forEach(ci => {
      const date = formatDateBR(ci.timestamp);
      if (!checkinsByDate[date]) checkinsByDate[date] = [];
      checkinsByDate[date].push(ci);
    });

    const inconsistencies: { date: string, lastPunch: CheckIn }[] = [];
    const now = new Date().getTime();

    Object.entries(checkinsByDate).forEach(([date, cis]) => {
      if (cis.length === 1) {
        const lastPunch = cis[0];
        const punchTime = new Date(lastPunch.timestamp).getTime();
        const diffHours = (now - punchTime) / (1000 * 60 * 60);
        
        if (diffHours >= 12) {
          inconsistencies.push({ date, lastPunch });
        }
      }
    });

    return inconsistencies;
  };

  const myInconsistencies = getInconsistencies();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {!scanning && !scannedUnitId ? (
        <div className="space-y-8">
          {/* Inconsistency Notification */}
          {myInconsistencies.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Inconsistência Identificada</h4>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Você possui {myInconsistencies.length} ponto(s) aguardando ajuste</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const inc = myInconsistencies[0];
                  setAdjUnitId(inc.lastPunch.unitId);
                  const nextAdjType = inc.lastPunch.type === 'IN' ? 'BREAK_START' : inc.lastPunch.type === 'BREAK_START' ? 'BREAK_END' : inc.lastPunch.type === 'BREAK_END' ? 'OUT' : 'IN';
                  setAdjType(nextAdjType);
                  // Extract YYYY-MM-DD from the timestamp
                  setAdjDate(new Date(inc.lastPunch.timestamp).toISOString().split('T')[0]);
                  setShowAdjustmentModal(true);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
              >
                Ajustar Agora
              </button>
            </div>
          )}
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <QrCode size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Registro de Ponto</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto">
              Escaneie o QR Code da unidade para registrar sua entrada ou saída.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => { setType(nextPunchBtn.type); setScanning(true); }}
                className={`w-full max-w-xs py-6 ${nextPunchBtn.color} rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl flex flex-col items-center gap-3`}
              >
                {nextPunchBtn.icon}
                {nextPunchBtn.label}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4">Meus Últimos Registros</h4>
            <div className="space-y-3">
              {myCheckins.slice(0, 5).map(ci => {
                const ciUnit = units.find(u => u.id === ci.unitId);
                return (
                  <div key={ci.id} className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ci.type === 'IN' || ci.type === 'BREAK_END' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : ci.type === 'BREAK_START' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
                        {ci.type === 'IN' || ci.type === 'BREAK_END' ? <ArrowUpRight size={20} /> : <ArrowRight size={20} className={ci.type === 'OUT' ? "rotate-45" : ""} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">
                          {ci.type === 'IN' ? 'Entrada' : ci.type === 'BREAK_START' ? 'Saída Intervalo' : ci.type === 'BREAK_END' ? 'Volta Intervalo' : 'Saída'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{ciUnit?.name || 'Unidade'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white text-sm">{formatTime(ci.timestamp)}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{formatDateBR(ci.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
              {myCheckins.length === 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-slate-400 dark:text-slate-500 font-bold text-sm italic">Nenhum registro encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : scanning ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Escaneie o QR Code</h3>
            <button onClick={() => { setScanning(false); setType(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={20} className="dark:text-slate-400" />
            </button>
          </div>
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-900 relative">
            <Scanner
              onScan={(result) => {
                if (result && result[0]?.rawValue) {
                  setScannedUnitId(result[0].rawValue);
                  setScanning(false);
                  startCamera();
                }
              }}
              onError={(error) => console.error(error)}
              styles={{ container: { width: '100%', height: '100%' } }}
            />
            <div className="absolute inset-0 border-[40px] border-slate-900/40 pointer-events-none">
              <div className="w-full h-full border-2 border-emerald-500 rounded-2xl animate-pulse"></div>
            </div>
          </div>
          <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6 font-medium">
            Posicione o QR Code da unidade dentro do quadrado para escanear.
          </p>
        </div>
      ) : scannedUnitId && !photo ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Tirar Foto</h3>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{unit?.name || 'Unidade'}</p>
            </div>
            <button onClick={() => { setScannedUnitId(null); setType(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={20} className="dark:text-slate-400" />
            </button>
          </div>
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-900 relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button 
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 dark:border-white/20 flex items-center justify-center shadow-xl active:scale-90 transition-all"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-full"></div>
              </button>
            </div>
          </div>
          <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6 font-medium">
            Tire uma foto sua no local para confirmar o registro.
          </p>
        </div>
      ) : scannedUnitId && photo ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Confirmar Registro</h3>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{type === 'IN' ? 'Entrada' : type === 'BREAK_START' ? 'Saída Intervalo' : type === 'BREAK_END' ? 'Volta Intervalo' : 'Saída'} em {unit?.name}</p>
            </div>
            <button onClick={() => { setPhoto(null); startCamera(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={20} className="dark:text-slate-400" />
            </button>
          </div>
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-8">
            <img src={photo} alt="Captured" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-4">
            <button 
              onClick={handleRegister}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-95"
            >
              <CheckCircle size={18} />
              Confirmar e Salvar
            </button>
            <button 
              onClick={() => { setPhoto(null); startCamera(); }}
              className="w-full py-4 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            >
              Tirar outra foto
            </button>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAdjustmentModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Solicitar Ajuste Manual</h3>
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">Ajuste de ponto pendente</p>
                  </div>
                  <button onClick={() => setShowAdjustmentModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 font-display">Tipo de Batida</label>
                      <select 
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END')}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                      >
                        <option value="IN">Entrada</option>
                        <option value="BREAK_START">Saída Intervalo</option>
                        <option value="BREAK_END">Volta Intervalo</option>
                        <option value="OUT">Saída</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 font-display">Horário</label>
                      <input 
                        type="time"
                        value={adjTime}
                        onChange={(e) => setAdjTime(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 font-display">Unidade</label>
                    <select 
                      value={adjUnitId}
                      onChange={(e) => setAdjUnitId(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Selecione a Unidade</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 font-display">Motivo do Ajuste</label>
                    <textarea 
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      placeholder="Descreva o motivo da falta de batida..."
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none h-32"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowAdjustmentModal(false)}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAdjustmentSubmit}
                    disabled={isSubmittingAdj}
                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingAdj ? 'Enviando...' : 'Enviar para Aprovação'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgencyPendingScreen({ status, onLogout, isDarkMode, setIsDarkMode }: { status?: string, onLogout: () => void, isDarkMode: boolean, setIsDarkMode: (val: boolean) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black p-4 relative">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center border border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Conta em Análise</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          {status === 'BLOCKED' 
            ? 'Sua conta foi bloqueada. Entre em contato com o suporte.'
            : 'Seu cadastro está sendo analisado pela nossa equipe. Você receberá um e-mail assim que for liberado.'}
        </p>
        <button
          onClick={onLogout}
          className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('AGENCY');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [staffingSubTab, setStaffingSubTab] = useState<'STAFFING' | 'CONFIRMED' | 'REQUESTS' | 'INCONSISTENCIES'>('STAFFING');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [passwordToVerify, setPasswordToVerify] = useState('');
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Subscription Flow States
  const [pendingSubscriptionPlan, setPendingSubscriptionPlan] = useState<Plan | null>(() => {
    const saved = localStorage.getItem('pendingSubscriptionPlan');
    return saved ? JSON.parse(saved) : null;
  });
  const [subscriptionStep, setSubscriptionStep] = useState<'IDLE' | 'SUMMARY' | 'PAYMENT' | 'CONFIRMATION'>(() => {
    const saved = localStorage.getItem('pendingSubscriptionPlan');
    return saved ? 'SUMMARY' : 'IDLE';
  });

  useEffect(() => {
    if (pendingSubscriptionPlan) {
      localStorage.setItem('pendingSubscriptionPlan', JSON.stringify(pendingSubscriptionPlan));
    } else {
      localStorage.removeItem('pendingSubscriptionPlan');
    }
  }, [pendingSubscriptionPlan]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    
    if (tab === 'staffing') {
      setStaffingSubTab('STAFFING');
    }

    const currentAgency = agencies.find(a => a.id === currentAgencyId);
    if (currentAgency?.plan === 'STARTER') {
      const restrictedForStarter = ['feed', 'ponto', 'employee_ponto', 'access_flow', 'feedbacks', 'pricing', 'reports'];
      if (restrictedForStarter.includes(tab)) {
        toast.error('Este recurso não está disponível no plano Starter. Faça o upgrade para o plano Profissional para acessar.');
        return;
      }
    }

    if (role === 'ADMIN' && tab !== 'admin_dashboard') {
      setSelectedAgencyId(null);
    }
    const protectedTabs = ['pricing', 'user_management', 'profile', 'company_profile', 'employee_profile'];
    if (protectedTabs.includes(tab)) {
      setPendingTab(tab);
      setShowPasswordModal(true);
      setPasswordToVerify('');
      setPasswordError(null);
    } else {
      setActiveTab(tab);
    }
  };

  const verifyPasswordAndNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingPassword(true);
    setPasswordError(null);
    try {
      if (!auth.currentUser || !auth.currentUser.email) throw new Error('Usuário não autenticado');
      
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordToVerify);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      if (pendingTab) {
        setActiveTab(pendingTab);
        setShowPasswordModal(false);
        setPendingTab(null);
      }
    } catch (error: any) {
      console.error('Error verifying password:', error);
      setPasswordError('Senha incorreta. Por favor, tente novamente.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [employeeRegistrations, setEmployeeRegistrations] = useState<EmployeeRegistration[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [currentAgencyId, setCurrentAgencyId] = useState<string | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ratingLabel, setRatingLabel] = useState('Estrelas');
  const [orgInfo, setOrgInfo] = useState<any>(null);

  useEffect(() => {
    if (role === 'ADMIN') {
      const unsubscribe = onSnapshot(doc(db, 'settings', 'organization'), (snapshot) => {
        if (snapshot.exists()) {
          setOrgInfo(snapshot.data());
        }
      }, (error) => {
        console.error('Firestore Error (settings/organization):', error);
      });
      return () => unsubscribe();
    }
  }, [role]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role') as UserRole;
    if (urlRole === 'REGISTRATION' || urlRole === 'COMPANY_REGISTRATION' || urlRole === 'AGENCY_REGISTRATION') {
      setRole(urlRole);
    }
  }, []);

  // Real-time Firebase listeners handles updates immediately.
  // We removed the auto-refresh because it resets the local state and prevents 
  // delta-based real-time notifications from working correctly.

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

  useEffect(() => {
    if (role === 'ADMIN' && plans.length === 0 && isAuthReady) {
      const initializePlans = async () => {
        const defaultPlans: Plan[] = [
          {
            id: 'STARTER',
            name: 'Plano Starter',
            price: 200,
            maxEmployees: 50,
            maxCompanies: 10,
            features: [
              '3 Meses de Acesso Completo',
              'Gestão de até 10 Empresas Parceiras',
              'Até 50 Diaristas Cadastrados',
              'Dashboard Geral de Operações',
              'Escala de Trabalho (Agenda)'
            ],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'PROFESSIONAL',
            name: 'Plano Professional',
            price: 299,
            maxEmployees: 150,
            maxCompanies: 50,
            features: [
              'Gestão de até 50 Empresas Parceiras',
              'Até 150 Diaristas',
              'Controle de Acesso via QR Code (PONTO)',
              'Fluxo de Acesso Dinâmico',
              'Interação em Tempo Real (Feed)',
              'Gestão de Feedbacks e Avaliações',
              'Configuração de Precificação customizada',
              'Relatórios de Produtividade'
            ],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'ENTERPRISE',
            name: 'Plano Enterprise',
            price: 599,
            maxEmployees: 9999,
            maxCompanies: 9999,
            features: [
              'Tudo do Professional',
              'Empresas Parceiras Ilimitadas',
              'Diaristas Ilimitados',
              'White-label parcial',
              'Módulo de Faturamento Automático',
              'Suporte Prioritário',
              'Dashboard de Auditoria'
            ],
            updatedAt: new Date().toISOString()
          }
        ];
        
        for (const plan of defaultPlans) {
          await setDocument('plans', plan.id, plan);
        }
      };
      initializePlans();
    }
  }, [role, plans.length, isAuthReady]);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const [resetErrorMessage, setResetErrorMessage] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetErrorMessage('Por favor, digite um e-mail válido.');
      return;
    }
    setResetStatus('LOADING');
    setResetErrorMessage('');
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, resetEmail);
      if (!signInMethods || signInMethods.length === 0) {
        setResetStatus('ERROR');
        setResetErrorMessage('Este e-mail não está registrado no sistema.');
        return;
      }
      const actionCodeSettings = {
        url: `${window.location.origin}/?mode=resetPassword&oobCode=`,
        handleCodeInApp: false
      };
      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      setResetStatus('SUCCESS');
      setResetEmail('');
      toast.success(`Link enviado para ${resetEmail}!\n\nVerifique seu email. Link expira em 1 hora.`);
    } catch (err: any) {
      console.error('Erro ao enviar email:', err);
      setResetStatus('ERROR');
      if (err.code === 'auth/too-many-requests') {
        setResetErrorMessage('Muitas tentativas. Tente novamente em alguns minutos.');
      } else if (err.code === 'auth/user-not-found') {
        setResetErrorMessage('Este e-mail não está registrado.');
      } else {
        setResetErrorMessage('Falha ao enviar e-mail. Verifique e tente novamente.');
      }
    }
  };

  const getScaleValue = (emp: Employee) => {
    const prof = emp.profession;
    const targetPricing = (prof && pricing.professions?.[prof]) || pricing;

    if (targetPricing.type === 'STARS') {
      const p = targetPricing.stars?.[emp.rating.toString()];
      return p ? p.employee + p.company : 0;
    } else {
      const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const day = daysOfWeek[new Date().getDay()];
      const p = targetPricing.weekly?.[day];
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
    // CORRIGIDO: Usar asset local em vez de URL externa hardcoded
    const audio = new Audio('/sounds/notification.mp3');
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
      if (process.env.NODE_ENV === 'development') console.debug('Auth ready:', firebaseUser?.uid);
      if (firebaseUser) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as UserRole;

        // Fetch or create user profile
        const userDoc = await getDocument<{ role: UserRole, agencyId?: string, companyId?: string, forcePasswordChange?: boolean, status?: string }>('users', firebaseUser.uid);
        if (userDoc) {
          if (userDoc.status === 'PENDING') {
            // Auto-activate to remove pending screen permanently
            try {
              await updateDocument('users', firebaseUser.uid, { status: 'ACTIVE', isTrial: true });
              if (userDoc.companyId) {
                await updateDocument('companies', userDoc.companyId, { status: 'ACTIVE', isTrial: true });
              }
              await updateDocument('companyUsers', firebaseUser.uid, { status: 'ACTIVE', isTrial: true });
              userDoc.status = 'ACTIVE';
            } catch (error) {
              console.error('Error auto-activating user:', error);
            }
          }
          let currentRole = userDoc.role;
          setRole(currentRole);
          
          if (pendingSubscriptionPlan) {
            setSubscriptionStep('SUMMARY');
          }

          if (userDoc.agencyId) {
            setCurrentAgencyId(userDoc.agencyId);
          } else if (currentRole === 'AGENCY') {
            // Fallback: try to find agency by email
            const agencyDoc = await getDocs(query(collection(db, 'agencies'), where('email', '==', firebaseUser.email)));
            if (!agencyDoc.empty) {
              const foundAgencyId = agencyDoc.docs[0].id;
              setCurrentAgencyId(foundAgencyId);
              await updateDocument('users', firebaseUser.uid, { agencyId: foundAgencyId });
            }
          } else if (currentRole === 'EMPLOYEE') {
            // Try to find employee by email to get agencyId
            const empDoc = await getDocs(query(collection(db, 'employees'), where('loginEmail', '==', firebaseUser.email)));
            if (!empDoc.empty) {
              const foundAgencyId = empDoc.docs[0].data().agencyId;
              setCurrentAgencyId(foundAgencyId);
              await updateDocument('users', firebaseUser.uid, { agencyId: foundAgencyId });
            }
          } else if (currentRole === 'COMPANY') {
            // Try to find company user by email to get agencyId
            const companyUserDoc = await getDocs(query(collection(db, 'companyUsers'), where('email', '==', firebaseUser.email)));
            if (!companyUserDoc.empty) {
              const foundAgencyId = companyUserDoc.docs[0].data().agencyId;
              setCurrentAgencyId(foundAgencyId);
              await updateDocument('users', firebaseUser.uid, { agencyId: foundAgencyId });
            }
          }
          if (userDoc.companyId) setCurrentCompanyId(userDoc.companyId);
          if ((userDoc as any).unitId) setCurrentUnitId((userDoc as any).unitId);
          if (userDoc.forcePasswordChange) {
            setNeedsPasswordChange(true);
          }
          let defaultTab = 'dashboard';
          if ((currentRole as string) === 'COMPANY') defaultTab = 'manager_dashboard';
          if ((currentRole as string) === 'EMPLOYEE') defaultTab = 'employee_schedule';
          if ((currentRole as string) === 'ADMIN') defaultTab = 'admin_dashboard';
          setActiveTab(defaultTab);
        } else {
          // Default role based on URL param or fallback
          let defaultRole: UserRole = 'REGISTRATION';
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
        setUser(null);
        setCurrentAgencyId(null);
        setCurrentCompanyId(null);
        setCurrentUnitId(null);
        setIsPending(false);
        setRole('EMPLOYEE');
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(async permission => {
          console.log('Notification permission:', permission);
          if (permission === 'granted') {
            const token = await generateToken();
            if (token) {
              console.log('FCM Token generated:', token);
              await updateDocument('users', user.uid, { fcmToken: token });
            }
          }
        });
      } else if (Notification.permission === 'granted') {
        generateToken().then(async token => {
          if (token) {
            console.log('FCM Token existing:', token);
            await updateDocument('users', user.uid, { fcmToken: token });
          }
        });
      }
    }

    if (messaging) {
      const unsubscribeMsg = onMessage(messaging, (payload) => {
        console.log('Message received in foreground: ', payload);
        if ('Notification' in window && Notification.permission === 'granted') {
          const notificationTitle = payload.notification?.title || 'Nova Notificação';
          const notificationOptions = {
            body: payload.notification?.body,
            icon: '/favicon.ico',
            requireInteraction: true
          };
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification(notificationTitle, notificationOptions);
            });
          }
          playNotificationSound();
        }
      });
      return () => unsubscribeMsg();
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthReady) return;

    const unsubs: (() => void)[] = [];

    // Fetch plans publicly for login page and other views
    unsubs.push(subscribeToCollection<Plan>('plans', setPlans));

    if (!user) {
      return () => {
        unsubs.forEach(unsub => unsub());
      };
    }

    const agencyForQueries = currentAgencyId || selectedAgencyId;
    if (agencyForQueries) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const qCheckins = query(
        collection(db, 'checkins'),
        where('agencyId', '==', agencyForQueries),
        where('timestamp', '>=', thirtyDaysAgo.toISOString())
      );
      unsubs.push(onSnapshot(qCheckins, (snapshot) => {
        setCheckins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn)));
      }));
    } else if (role === 'ADMIN') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const qCheckins = query(
        collection(db, 'checkins'),
        where('timestamp', '>=', thirtyDaysAgo.toISOString())
      );
      unsubs.push(onSnapshot(qCheckins, (snapshot) => {
        setCheckins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn)));
      }));
    }

    if (role === 'ADMIN') {
      unsubs.push(subscribeToCollection<Agency>('agencies', setAgencies));
      unsubs.push(subscribeToCollection<any>('users', setUsersList));
    } else if ((role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId) {
      const unsubAgency = onSnapshot(doc(db, 'agencies', currentAgencyId), (docSnap) => {
        if (docSnap.exists()) {
          setAgencies([{ id: docSnap.id, ...docSnap.data() } as Agency]);
        }
      }, (error) => {
        console.error('Error fetching agency:', error);
      });
      unsubs.push(unsubAgency);
    }

    const filterByAgency = (data: any[]) => {
      if (role === 'ADMIN') {
        if (selectedAgencyId) return data.filter(d => d.agencyId === selectedAgencyId);
        return data;
      }
      if (role === 'AGENCY' || role === 'COMPANY') {
        if (currentAgencyId) return data.filter(d => d.agencyId === currentAgencyId);
      }
      if (role === 'EMPLOYEE') {
        // Employees should see all clients/units/companies to avoid N/A in their schedule
        // Their assignments are already filtered by employeeId in the query
        return data;
      }
      return data;
    };

    const unsubEmployees = (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE' || role === 'ADMIN') ? subscribeToCollection<Employee>('employees', (data) => setEmployees(filterByAgency(data)), (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    const unsubClients = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN' || role === 'EMPLOYEE') ? subscribeToCollection<Client>('clients', (data) => {
      setClients(filterByAgency(data));
    }, (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    
    // Role-based assignments subscription
    const assignmentConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', user.uid)] : 
                                  (role === 'AGENCY' || role === 'COMPANY') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] :
                                  [];
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
    
    const unsubFeedbacks = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN' || role === 'EMPLOYEE') ? subscribeToCollection<Feedback>('feedbacks', (data) => setFeedbacks(filterByAgency(data)), (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    
    // Only agency/admin sees contacts
    const unsubContacts = (role === 'AGENCY' || role === 'ADMIN') ? subscribeToCollection<ContactRequest>('contacts', (data) => setContacts(filterByAgency(data)), role === 'AGENCY' && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    const unsubEmployeeRegistrations = (role === 'AGENCY' || role === 'ADMIN') ? subscribeToCollection<EmployeeRegistration>('employeeRegistrations', (docs) => {
      const filtered = filterByAgency(docs);
      setEmployeeRegistrations(prev => {
        const newRegs = filtered.filter(d => d.status === 'PENDING');
        if (newRegs.length > prev.filter(d => d.status === 'PENDING').length) playNotificationSound();
        return filtered;
      });
    }, role === 'AGENCY' && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    
    // Role-based check-ins subscription
    
    const unsubCompanies = (role === 'AGENCY' || role === 'ADMIN' || role === 'COMPANY' || role === 'EMPLOYEE') ? subscribeToCollection<Company>('companies', (data) => {
      setCompanies(filterByAgency(data));
    }, (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    const unsubUnits = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN' || role === 'EMPLOYEE') ? subscribeToCollection<Unit>('units', (data) => {
      setUnits(filterByAgency(data));
    }, (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    const unsubCompanyUsers = (role === 'AGENCY' || role === 'COMPANY' || role === 'ADMIN') ? subscribeToCollection<CompanyUser>('companyUsers', (data) => setCompanyUsers(filterByAgency(data)), (role === 'AGENCY' || role === 'COMPANY') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};
    const unsubCompanyRequests = subscribeToCollection<CompanyRequest>('companyRequests', (docs) => {
      const filtered = filterByAgency(docs);
      
      setCompanyRequests(prev => {
        if (role === 'AGENCY' || role === 'ADMIN') {
          const newReqs = filtered.filter(d => d.status === 'PENDING');
          const prevReqs = prev.filter(d => d.status === 'PENDING');
          
          if (newReqs.length > prevReqs.length && prev.length > 0) {
            playNotificationSound();
            
            if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification('Nova Solicitação!', {
                  body: 'Uma nova solicitação de trabalho das empresas acabou de chegar.',
                  icon: '/favicon.ico',
                  requireInteraction: true
                });
              });
            }
          }
        }
        return filtered;
      });
    }, (role === 'AGENCY' || role === 'COMPANY') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []);

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

    const unsubNotifications = subscribeToCollection<AppNotification>('notifications', (data) => {
      setNotifications(data);
    }, notificationConstraints);

    const unsubBulletins = subscribeToCollection<Bulletin>('bulletins', (data) => {
      setBulletins(data);
    }, (role === 'AGENCY' || role === 'COMPANY' || role === 'EMPLOYEE') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []);

    const unsubInvoices = (role === 'AGENCY' || role === 'COMPANY') ? subscribeToCollection<Invoice>('invoices', (data) => {
      setInvoices(data);
    }, (role === 'AGENCY' || role === 'COMPANY') && currentAgencyId ? [where('agencyId', '==', currentAgencyId)] : []) : () => {};

    return () => {
      unsubEmployees();
      unsubClients();
      unsubAssignments();
      unsubFeedbacks();
      unsubContacts();
      unsubEmployeeRegistrations();
      unsubCompanies();
      unsubUnits();
      unsubCompanyUsers();
      unsubCompanyRequests();
      unsubNotifications();
      unsubBulletins();
      unsubInvoices();
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

    // Default Firebase Authentication
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
      setPasswordInput(''); // CORRIGIDO: Senha é limpa após erro de login
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleSubscriptionComplete = async (planId: PlanType) => {
    if (!currentAgencyId) return;
    
    try {
      const selectedPlan = plans.find(p => p.id === planId);
      await setDocument('agencies', currentAgencyId, {
        plan: planId,
        subscriptionStatus: 'ACTIVE',
        maxEmployees: selectedPlan?.maxEmployees || 50,
        maxCompanies: selectedPlan?.maxCompanies || 10,
        updatedAt: new Date().toISOString()
      }, true); // Merge true
      
      toast.success('Assinatura ativada com sucesso!');
      setPendingSubscriptionPlan(null);
      setSubscriptionStep('IDLE');
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Erro ao ativar assinatura.');
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setPendingSubscriptionPlan(plan);
    if (!user) {
      setRole('AGENCY_REGISTRATION');
      const params = new URLSearchParams(window.location.search);
      params.set('role', 'AGENCY_REGISTRATION');
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    } else {
      setSubscriptionStep('SUMMARY');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black relative transition-colors duration-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">v1.1.0</div>
      </div>
    );
  }

  if (isPending && user) {
    if (role === 'AGENCY') {
      const agency = agencies.find(a => a.id === currentAgencyId);
      return (
        <ErrorBoundary>
          <AgencyOnboarding 
            user={user} 
            agency={agency} 
            plans={plans} 
            onLogout={handleLogout} 
          />
          <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">v1.1.0</div>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <PendingApproval onLogout={handleLogout} />
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">v1.1.0</div>
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
            <Toaster position="top-center" />
            <RegistrationForm onComplete={() => window.location.href = '/'} agencies={agencies} />
            <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50">v1.1.0</div>
          </div>
        </ErrorBoundary>
      );
    }
    
    if (roleParam === 'COMPANY_REGISTRATION') {
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
            <Toaster position="top-center" />
            <CompanyRegistrationForm onComplete={() => window.location.href = '/'} />
            <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50">v1.1.0</div>
          </div>
        </ErrorBoundary>
      );
    }

    if (roleParam === 'AGENCY_REGISTRATION') {
      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
            <Toaster position="top-center" />
            <AgencyRegistrationForm onComplete={() => window.location.href = '/'} plans={plans} />
            <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50">v1.1.0</div>
          </div>
        </ErrorBoundary>
      );
    }

    return (
      <div className="relative">
        <LandingPage
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          handleEmailLogin={handleEmailLogin}
          loginError={loginError}
          isForgotPassword={isForgotPassword}
          setIsForgotPassword={setIsForgotPassword}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          handleResetPassword={handleResetPassword}
          resetStatus={resetStatus}
          plans={plans}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSelectPlan={handleSelectPlan}
        />
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50">v1.1.0</div>
      </div>
    );
  }

  if (needsPasswordChange && user) {
    return (
      <ErrorBoundary>
        <ChangePasswordScreen 
          user={user} 
          onComplete={() => setNeedsPasswordChange(false)} 
          handleLogout={handleLogout}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">v1.1.0</div>
      </ErrorBoundary>
    );
  }

  const currentAgencyPlan = agencies.find(a => a.id === currentAgencyId)?.plan;
  const agencyInfo = agencies.find(a => a.id === currentAgencyId);

  // CORRIGIDO: Se agência logada estiver PENDING/BLOCKED, redirecionar para tela bloqueio.
  if (role === 'AGENCY' && agencyInfo && agencyInfo.status !== 'ACTIVE') {
    return <AgencyPendingScreen status={agencyInfo.status} onLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
  }

  if (user && pendingSubscriptionPlan && subscriptionStep !== 'IDLE') {
    return (
      <ErrorBoundary>
        <Toaster position="top-center" />
        <SubscriptionFlow 
          plan={pendingSubscriptionPlan}
          user={user}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onComplete={handleSubscriptionComplete}
          onCancel={() => {
            setPendingSubscriptionPlan(null);
            setSubscriptionStep('IDLE');
          }}
        />
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">v1.1.0</div>
      </ErrorBoundary>
    );
  }

  // CORRIGIDO: Badge de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-black font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-500">
        <Toaster position="top-center" />
        <AppNavbar 
          role={role} 
          activeTab={activeTab} 
          setActiveTab={handleTabChange}
          userEmail={user.email}
          userName={
            role === 'EMPLOYEE' ? (() => {
              const emp = employees.find(e => e.id === user?.uid || e.loginEmail === user?.email);
              return emp ? `${emp.firstName} ${emp.lastName}`.trim() : user.displayName;
            })() :
            role === 'COMPANY' ? companyUsers.find(cu => cu.id === user?.uid || cu.email === user?.email)?.fullName || user.displayName :
            role === 'AGENCY' ? agencies.find(a => a.id === currentAgencyId)?.name || user.displayName :
            role === 'ADMIN' ? orgInfo?.name || user.displayName :
            user.displayName
          }
          userPhoto={
            role === 'EMPLOYEE' ? employees.find(e => e.id === user?.uid || e.loginEmail === user?.email)?.photoUrl || user.photoURL :
            role === 'COMPANY' ? companyUsers.find(cu => cu.id === user?.uid || cu.email === user?.email)?.photoUrl || user.photoURL :
            role === 'AGENCY' ? agencies.find(a => a.id === currentAgencyId)?.logoUrl || user.photoURL :
            role === 'ADMIN' ? orgInfo?.logoUrl || user.photoURL :
            user.photoURL
          }
          handleLogout={handleLogout}
          agencyPlan={currentAgencyPlan}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          unreadNotifications={unreadCount}
        />

        <MobileSidebar 
          role={role}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userName={
            role === 'EMPLOYEE' ? (() => {
              const emp = employees.find(e => e.id === user?.uid || e.loginEmail === user?.email);
              return emp ? `${emp.firstName} ${emp.lastName}`.trim() : user.displayName;
            })() :
            role === 'COMPANY' ? companyUsers.find(cu => cu.id === user?.uid || cu.email === user?.email)?.fullName || user.displayName :
            role === 'AGENCY' ? agencies.find(a => a.id === currentAgencyId)?.name || user.displayName :
            role === 'ADMIN' ? orgInfo?.name || user.displayName :
            user.displayName
          }
          userPhoto={
            role === 'EMPLOYEE' ? employees.find(e => e.id === user?.uid || e.loginEmail === user?.email)?.photoUrl || user.photoURL :
            role === 'COMPANY' ? companyUsers.find(cu => cu.id === user?.uid || cu.email === user?.email)?.photoUrl || user.photoURL :
            role === 'AGENCY' ? agencies.find(a => a.id === currentAgencyId)?.logoUrl || user.photoURL :
            role === 'ADMIN' ? orgInfo?.logoUrl || user.photoURL :
            user.photoURL
          }
          handleLogout={handleLogout}
          agencyPlan={currentAgencyPlan}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          unreadNotifications={unreadCount}
        />

        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-black transition-colors duration-500">
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full pb-32">
              <AnimatePresence mode="wait">
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'PENDING' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-500 dark:text-blue-400">
                      <Clock size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">Cadastro em Análise</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
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
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center text-red-500 dark:text-red-400">
                      <AlertTriangle size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">Conta Bloqueada</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
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
                      setStaffingSubTab={setStaffingSubTab}
                      clients={clients}
                      feedbacks={feedbacks}
                      companies={companies}
                      units={units}
                      role={role}
                      agencies={agencies}
                      selectedAgencyId={selectedAgencyId}
                      onClearAgency={() => setSelectedAgencyId(null)}
                      onSelectAgency={(id: string) => setSelectedAgencyId(id)}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      companyUsers={companyUsers}
                      plans={plans}
                      companyRequests={companyRequests}
                      isDarkMode={isDarkMode}
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
                      plans={plans}
                      onManageAgency={(id) => {
                        setSelectedAgencyId(id);
                        setActiveTab('admin_dashboard');
                      }}
                    />
                  </div>
                )}
                {role === 'ADMIN' && activeTab === 'admin_plans' && (
                  <div key="admin-plans">
                    <SuperAdminPlans plans={plans} />
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
                      agency={role === 'AGENCY' ? agencies.find(a => a.id === currentAgencyId) : undefined}
                    />
                  </div>
                )}
                {activeTab === 'feed' && currentAgencyPlan !== 'STARTER' && (
                  <div key="feed">
                    <Feed />
                  </div>
                )}
                {role === 'AGENCY' && activeTab === 'ponto' && currentAgencyPlan !== 'STARTER' && (
                  <div key="ponto">
                    <UnitQRManager 
                      units={units} 
                      companies={companies} 
                      agencyId={currentAgencyId}
                      selectedAgencyId={selectedAgencyId}
                    />
                  </div>
                )}
                {activeTab === 'access_flow' && currentAgencyPlan !== 'STARTER' && (
                  <div key="access_flow">
                    <AccessFlow 
                      checkins={checkins}
                      employees={employees}
                      units={units}
                      companies={companies}
                      clients={clients}
                      formatDateBR={formatDateBR}
                      forcedUnitId={role === 'COMPANY' ? (currentUnitId || companyUsers.find(cu => cu.email === user?.email)?.unitId) : undefined}
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
                      setStaffingSubTab={setStaffingSubTab}
                      clients={clients}
                      feedbacks={feedbacks}
                      companies={companies}
                      units={units}
                      role={role}
                      agencies={agencies}
                      selectedAgencyId={selectedAgencyId}
                      onClearAgency={() => setSelectedAgencyId(null)}
                      onSelectAgency={() => {}}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      companyUsers={companyUsers}
                      plans={plans}
                      companyRequests={companyRequests}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'feedbacks' && currentAgencyPlan !== 'STARTER' && (
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
                      agencies={agencies}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'staffing' && (
                  <div key="agency-staffing">
                    <AgencyStaffing 
                      user={user}
                      employees={employees}
                      assignments={assignments}
                      clients={clients}
                      getScaleValue={getScaleValue}
                      companyRequests={companyRequests}
                      companies={companies}
                      units={units}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
                      selectedAgencyId={selectedAgencyId}
                      checkins={checkins}
                      agencies={agencies}
                      initialSubTab={staffingSubTab}
                    />
                  </div>
                )}
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'reports' && currentAgencyPlan !== 'STARTER' && (
                  <div key="agency-reports">
                    <AgencyReports 
                      employees={employees}
                      assignments={assignments}
                      clients={clients}
                      companies={companies}
                      units={units}
                      agencyId={role === 'AGENCY' ? currentAgencyId : null}
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
                {role === 'AGENCY' && agencies.find(a => a.id === currentAgencyId)?.status === 'ACTIVE' && activeTab === 'pricing' && currentAgencyPlan !== 'STARTER' && (
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
                    {console.log('CompanyDashboard props:', { currentCompanyId, currentUnitId, companyUsers, user, assignments, units })}
                    <CompanyDashboard 
                      companyId={currentCompanyId || companyUsers.find(cu => cu.email === user?.email)?.companyId || ''} 
                      unitId={currentUnitId || companyUsers.find(cu => cu.email === user?.email)?.unitId}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                      units={units}
                      companies={companies}
                      invoices={invoices}
                      bulletins={bulletins}
                      companyRequests={companyRequests}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'manager_feedback' && (
                  <div key="company-feedback">
                    <CompanyFeedbackForm 
                      companyId={currentCompanyId || companyUsers.find(cu => cu.email === user?.email)?.companyId || ''}
                      unitId={currentUnitId || companyUsers.find(cu => cu.email === user?.email)?.unitId}
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
                      unitId={currentUnitId || companyUsers.find(cu => cu.email === user?.email)?.unitId}
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
                      unitId={currentUnitId || companyUsers.find(cu => cu.email === user?.email)?.unitId}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                      units={units}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'company_reports' && (
                  <div key="company-reports">
                    <CompanyReports 
                      employees={employees}
                      assignments={assignments}
                      clients={clients}
                      units={units}
                      companyId={(user as any).companyId}
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
                {role === 'EMPLOYEE' && activeTab === 'employee_ponto' && currentAgencyPlan !== 'STARTER' && (
                  <div key="employee-ponto">
                    <SimplePonto 
                      user={user}
                      employees={employees}
                      units={units}
                      checkins={checkins}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_schedule' && (
                  <div key="employee-schedule">
                    <EmployeeSchedule 
                      employeeId={employees.find(e => e.id === user?.uid || e.loginEmail === user?.email)?.id || ''} 
                      employees={employees}
                      assignments={assignments}
                      notifications={notifications}
                      clients={clients}
                      units={units}
                      companies={companies}
                      agencies={agencies}
                      bulletins={bulletins}
                      invoices={invoices}
                      checkins={checkins}
                      companyRequests={companyRequests}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_profile' && (
                  <div key="employee-profile">
                    <EmployeeProfile 
                      employeeId={employees.find(e => e.id === user?.uid || e.loginEmail === user?.email)?.id || ''}
                      employees={employees}
                      assignments={assignments}
                      notifications={notifications}
                      pricing={pricing}
                      clients={clients}
                      companies={companies}
                    />
                  </div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showPasswordModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
                    >
                      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Área Restrita</h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Confirme sua identidade</p>
                        </div>
                        <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                          <X size={24} className="text-slate-400" />
                        </button>
                      </div>

                      <form onSubmit={verifyPasswordAndNavigate} className="p-8 space-y-6">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                          <Lock className="text-blue-600 mt-0.5" size={18} />
                          <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            Para acessar esta seção, você precisa confirmar sua senha de usuário por segurança.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Senha</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              required
                              type="password" 
                              placeholder="••••••••"
                              className={`w-full pl-12 p-4 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-700 ${passwordError ? 'border-rose-500 focus:border-rose-500' : 'border-transparent focus:border-slate-900'}`}
                              value={passwordToVerify}
                              onChange={e => setPasswordToVerify(e.target.value)}
                              autoFocus
                            />
                          </div>
                          {passwordError && (
                            <p className="text-[10px] text-rose-500 font-bold ml-1">{passwordError}</p>
                          )}
                        </div>

                        <button 
                          type="submit"
                          disabled={isVerifyingPassword}
                          className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                          {isVerifyingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={18} />
                              Confirmar Acesso
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
          </main>
          <BottomNav 
            role={role} 
            activeTab={activeTab} 
            handleTabChange={handleTabChange} 
            agencyPlan={agencyInfo?.plan}
          />
          <div className="fixed bottom-20 lg:bottom-4 right-4 z-[9999] pointer-events-none opacity-100 text-[10px] font-black text-slate-400 bg-white/50 dark:bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-800/50 transition-all">v1.1.0</div>
        </div>
      </div>
    </ErrorBoundary>
  );
}


interface SidebarItemProps {
  key?: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

function SidebarItem({ icon, label, active, onClick, color }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-slate-950 text-white shadow-2xl shadow-slate-900/20' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
        ${active ? 'bg-white/10' : color ? color.split(' ')[1] : 'bg-slate-100'}
        ${active ? 'text-white' : color ? color.split(' ')[0] : 'text-slate-500'}
        group-hover:scale-110 group-hover:rotate-3
      `}>
        {icon}
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
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

function BottomNav({ role, activeTab, handleTabChange, agencyPlan }: { 
  role: string, 
  activeTab: string, 
  handleTabChange: (tab: string) => void,
  agencyPlan?: PlanType
}) {
  const restrictedForStarter = ['feed', 'ponto', 'access_flow', 'feedbacks', 'pricing', 'reports'];
  
  const menuItemsRaw: MenuItem[] = role === 'ADMIN' ? [
    { id: 'admin_dashboard', label: 'Home', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50' },
    { id: 'admin_agencies', label: 'Agências', icon: ShieldCheck, color: 'text-accent-violet bg-violet-50' },
    { id: 'admin_plans', label: 'Planos', icon: CreditCard, color: 'text-accent-cyan bg-cyan-50' },
    { id: 'profile', label: 'Perfil', icon: UserIcon, color: 'text-accent-indigo bg-indigo-50' },
  ] : role === 'AGENCY' ? [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50' },
    { id: 'staffing', label: 'Solicitação', icon: Users, color: 'text-accent-violet bg-violet-50' },
    { id: 'registrations', label: 'Cadastros', icon: UserPlus, color: 'text-accent-emerald bg-emerald-50' },
    { id: 'access_flow', label: 'Fluxo', icon: Activity, color: 'text-accent-rose bg-rose-50' },
    // CORRIGIDO: O id correto para a aba de Ponto é 'ponto'
    { id: 'ponto', label: 'Ponto', icon: QrCode, color: 'text-accent-rose bg-rose-50' },
    { id: 'profile', label: 'Perfil', icon: UserIcon, color: 'text-brand-600 bg-brand-50' },
  ] : role === 'COMPANY' ? [
    { id: 'manager_dashboard', label: 'Home', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50' },
    { id: 'evaluate_team', label: 'Avaliar', icon: Star, color: 'text-accent-amber bg-amber-50' },
    { id: 'company_diaristas', label: 'Solicitação', icon: Users, color: 'text-accent-violet bg-violet-50' },
    { id: 'company_profile', label: 'Perfil', icon: UserIcon, color: 'text-accent-indigo bg-indigo-50' },
  ] : [
    { id: 'employee_profile', label: 'Perfil', icon: UserIcon, color: 'text-brand-600 bg-brand-50' },
    { id: 'employee_schedule', label: 'Agenda', icon: Calendar, color: 'text-accent-violet bg-violet-50' },
    { id: 'employee_ponto', label: 'Bater Ponto', icon: QrCode, color: 'text-accent-rose bg-rose-50' },
  ];

  // CORRIGIDO: Aplicando restrições do plano STARTER para agências
  const menuItems = menuItemsRaw.filter(item =>
    role !== 'AGENCY' || agencyPlan !== 'STARTER' || !restrictedForStarter.includes(item.id)
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 z-40 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              // CORRIGIDO: Usando handleTabChange para aplicar os guards de senha corretamente
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-2xl transition-all ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="bottomNavDot"
                  className="w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SuperAdminAgencies({ agencies, companies, employees, usersList, onManageAgency, plans }: { agencies: Agency[], companies: Company[], employees: Employee[], usersList: any[], onManageAgency: (id: string) => void, plans: Plan[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<string | null>(null);
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
    const agency = agencies.find(a => a.id === agencyId);
    const starterPlan = plans.find(p => p.id === 'STARTER');
    
    await updateDocument('agencies', agencyId, { 
      status: 'ACTIVE',
      plan: agency?.plan || 'STARTER',
      maxEmployees: agency?.maxEmployees || starterPlan?.maxEmployees || 50,
      maxCompanies: agency?.maxCompanies || starterPlan?.maxCompanies || 10
    });
    const agencyUser = usersList.find(u => u.agencyId === agencyId && u.role === 'AGENCY');
    if (agencyUser) {
      await updateDocument('users', agencyUser.id, { status: 'ACTIVE' });
    }
    toast.success('Agência liberada com sucesso!');
  };

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = crypto.randomUUID();
      const starterPlan = plans.find(p => p.id === 'STARTER');
      
      await setDocument('agencies', id, {
        ...newAgency,
        id,
        status: 'ACTIVE',
        plan: 'STARTER',
        maxEmployees: starterPlan?.maxEmployees || 50,
        maxCompanies: starterPlan?.maxCompanies || 10,
        subscriptionStatus: 'TRIAL',
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

  const handleDeleteAgency = async () => {
    if (!agencyToDelete) return;

    try {
      // Coleções para procurar e excluir dados vinculados a agencyId
      const collectionsToClean = [
        'users', 'employees', 'clients', 'companies', 'units', 'companyUsers',
        'companyRequests', 'employeeRegistrations', 'assignments', 'feedbacks',
        'contacts', 'checkins', 'invoices', 'bulletins', 'feedPosts'
      ];
      
      // Excluir a agência
      await deleteDocument('agencies', agencyToDelete);
      
      // Criar queries para deletar todos os documentos das coleções que pertençam a esta agência
      for (const col of collectionsToClean) {
        try {
          const q = query(collection(db, col), where('agencyId', '==', agencyToDelete));
          const querySnapshot = await getDocs(q);
          const deletePromises = querySnapshot.docs.map(docSnap => deleteDocument(col, docSnap.id));
          await Promise.all(deletePromises);
        } catch (colError) {
          console.error(`Erro ao limpar coleção ${col} para agência ${agencyToDelete}:`, colError);
        }
      }
      
      // Opcional: deletar comentários de posts que foram excluídos (um pouco complexo para client-side genérico,
      // mas os feedPosts já foram isolados pela query agencyId agora).
      
      toast.success('Agência e todos os seus dados vinculados foram excluídos permanentemente!');
      setShowDetailsModal(false);
      setAgencyToDelete(null);
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast.error('Erro ao excluir a agência. Alguns dados podem ter ficado residuais.');
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={!!agencyToDelete}
        onClose={() => setAgencyToDelete(null)}
        onConfirm={handleDeleteAgency}
        title="Excluir Agência"
        message="Tem certeza que deseja EXCLUIR PERMANENTEMENTE esta agência e todos os seus dados vinculados? Esta ação não pode ser desfeita."
        confirmText="Excluir Permanentemente"
      />
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

              {/* Plano de Assinatura */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={14} className="text-cyan-500" />
                  Plano de Assinatura
                </h3>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plano Atual</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          selectedAgency.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-600' :
                          selectedAgency.plan === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {selectedAgency.plan || 'STARTER'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {selectedAgency.subscriptionStatus === 'ACTIVE' ? 'Ativo' : 
                           selectedAgency.subscriptionStatus === 'TRIAL' ? 'Período de Teste' :
                           selectedAgency.subscriptionStatus === 'EXPIRED' ? 'Expirado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Mensal</p>
                      <p className="text-lg font-black text-slate-950">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plans.find(p => p.id === (selectedAgency.plan || 'STARTER'))?.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alterar Plano</label>
                    <div className="grid grid-cols-3 gap-2">
                      {plans.map(plan => (
                        <button
                          key={plan.id}
                          onClick={async () => {
                            await updateDocument('agencies', selectedAgency.id, { 
                              plan: plan.id,
                              maxEmployees: plan.maxEmployees,
                              maxCompanies: plan.maxCompanies
                            });
                            setSelectedAgency({ 
                              ...selectedAgency, 
                              plan: plan.id,
                              maxEmployees: plan.maxEmployees,
                              maxCompanies: plan.maxCompanies
                            });
                          }}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            selectedAgency.plan === plan.id
                            ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {plan.name.replace('Plano ', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Assinatura</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['ACTIVE', 'PAID', 'TRIAL', 'EXPIRED'].map(status => (
                        <button
                          key={status}
                          onClick={async () => {
                            await updateDocument('agencies', selectedAgency.id, { subscriptionStatus: status });
                            setSelectedAgency({ ...selectedAgency, subscriptionStatus: status as any });
                          }}
                          className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            selectedAgency.subscriptionStatus === status
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {status === 'ACTIVE' ? 'Ativo' : 
                           status === 'PAID' ? 'Pago' :
                           status === 'TRIAL' ? 'Teste' : 'Expirado'}
                        </button>
                      ))}
                    </div>
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
              toast('Link de cadastro copiado para a área de transferência!');
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

      <div className="space-y-12">
        {['ENTERPRISE', 'PROFESSIONAL', 'STARTER'].map(plan => {
          const planAgencies = agencies.filter(a => (a.plan || 'STARTER') === plan);
          if (planAgencies.length === 0) return null;

          return (
            <div key={plan} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  plan === 'ENTERPRISE' ? 'bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.4)]' :
                  plan === 'PROFESSIONAL' ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' :
                  'bg-slate-400'
                }`} />
                <h2 className="text-xl font-black text-slate-950 tracking-tighter font-display flex items-center gap-3 uppercase tracking-widest">
                  Plano {plan === 'ENTERPRISE' ? 'Enterprise' : plan === 'PROFESSIONAL' ? 'Professional' : 'Starter'}
                  {plan === 'STARTER' && <Flame size={20} className="text-orange-500 fill-orange-500 animate-pulse" />}
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 lowercase">
                    {planAgencies.length} {planAgencies.length === 1 ? 'agência' : 'agências'}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planAgencies.map(agency => {
                  const agencyCompanies = companies.filter(c => c.agencyId === agency.id);
                  const agencyEmployees = employees.filter(e => e.agencyId === agency.id);
                  const currentPlan = plans.find(p => p.id === (agency.plan || 'STARTER'));
                  const maxCos = agency.maxCompanies || currentPlan?.maxCompanies || 0;
                  const maxEmps = agency.maxEmployees || currentPlan?.maxEmployees || 0;

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
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-950 tracking-tight">{agency.name}</h3>
                            {(agency.plan === 'STARTER' || !agency.plan) && <Flame size={14} className="text-orange-500 fill-orange-500" />}
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{agency.responsibleName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresas</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-black text-slate-950 tracking-tighter">{agencyCompanies.length}</p>
                            <span className="text-[10px] font-bold text-slate-400">
                              / {maxCos >= 9999 ? 'ilimitado' : maxCos}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diaristas</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-black text-slate-950 tracking-tighter">{agencyEmployees.length}</p>
                            <span className="text-[10px] font-bold text-slate-400">
                              / {maxEmps >= 9999 ? 'ilimitado' : maxEmps}
                            </span>
                          </div>
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
                          onClick={() => setAgencyToDelete(agency.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                          title="Excluir Agência"
                        >
                          <Trash2 size={18} />
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
            </div>
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

function SuperAdminPlans({ plans }: { plans: Plan[] }) {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await updateDocument('plans', editingPlan.id, { 
        price: editingPlan.price,
        maxEmployees: editingPlan.maxEmployees,
        maxCompanies: editingPlan.maxCompanies,
        updatedAt: new Date().toISOString()
      });
      setEditingPlan(null);
      toast.success('Plano atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tighter font-display">Planos de Assinatura</h1>
        <p className="text-slate-500 font-medium">Configure os valores e limites dos planos da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col ${
              plan.id === 'PROFESSIONAL' ? 'ring-2 ring-blue-500 ring-offset-4' : ''
            }`}
          >
            {plan.id === 'PROFESSIONAL' && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest">
                Mais Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-950 tracking-tighter mb-2 flex items-center gap-2">
                {plan.id === 'STARTER' ? 'Plano Starter' : plan.name}
                {plan.id === 'STARTER' && <Flame className="text-orange-500 fill-orange-500" size={20} />}
              </h3>
              <div className="flex items-baseline gap-2">
                {plan.id === 'STARTER' && (
                  <span className="text-slate-400 font-bold text-sm line-through">
                    R$ 200,00
                  </span>
                )}
                <span className="text-4xl font-black text-slate-950 tracking-tighter">
                  {plan.id === 'STARTER' ? 'R$ 0,00' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                </span>
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/mês</span>
              </div>
              {plan.id === 'STARTER' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                    3 Primeiros meses grátis
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Limites</p>
                <div className="flex justify-between text-sm font-bold text-slate-950">
                  <span>Diaristas:</span>
                  <span>{plan.maxEmployees > 5000 ? 'Ilimitado' : plan.maxEmployees}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-950">
                  <span>Empresas:</span>
                  <span>{plan.maxCompanies > 5000 ? 'Ilimitado' : plan.maxCompanies}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recursos</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setEditingPlan(plan)}
              className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Edit2 size={16} />
              Editar Plano
            </button>
          </motion.div>
        ))}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tighter">Editar {editingPlan.name}</h2>
                <p className="text-slate-500 text-sm font-medium">Ajuste os valores e limites</p>
              </div>
              <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Mensal (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={Number.isNaN(editingPlan.price) ? '' : editingPlan.price}
                    onChange={e => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max. Diaristas</label>
                    <input
                      required
                      type="number"
                      value={Number.isNaN(editingPlan.maxEmployees) ? '' : editingPlan.maxEmployees}
                      onChange={e => setEditingPlan({ ...editingPlan, maxEmployees: parseInt(e.target.value) })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max. Empresas</label>
                    <input
                      required
                      type="number"
                      value={Number.isNaN(editingPlan.maxCompanies) ? '' : editingPlan.maxCompanies}
                      onChange={e => setEditingPlan({ ...editingPlan, maxCompanies: parseInt(e.target.value) })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic px-1">
                  * Use valores altos (ex: 9999) para representar acesso ilimitado.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AgencyDashboard({ assignments, employees, contacts, employeeRegistrations, pricing, ratingLabel, setActiveTab, setStaffingSubTab, clients, feedbacks, companies, units, role, agencies, selectedAgencyId, onClearAgency, onSelectAgency, agencyId, companyUsers, plans, companyRequests, isDarkMode }: { assignments: Assignment[], employees: Employee[], contacts: ContactRequest[], employeeRegistrations: EmployeeRegistration[], pricing: PricingConfig, ratingLabel: string, setActiveTab: (tab: string) => void, setStaffingSubTab?: (tab: 'STAFFING' | 'CONFIRMED' | 'REQUESTS' | 'INCONSISTENCIES') => void, clients: Client[], feedbacks: Feedback[], companies: Company[], units: Unit[], role: string, agencies: Agency[], selectedAgencyId?: string | null, onClearAgency?: () => void, onSelectAgency?: (id: string) => void, agencyId: string | null, companyUsers: CompanyUser[], plans: Plan[], companyRequests: CompanyRequest[], isDarkMode: boolean }) {
  const [selectedRegistration, setSelectedRegistration] = useState<EmployeeRegistration | null>(null);
  const [showProcessRegistrationModal, setShowProcessRegistrationModal] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [editingAgencyLimits, setEditingAgencyLimits] = useState<Agency | null>(null);
  const [maxEmployees, setMaxEmployees] = useState<string>('');
  const [maxCompanies, setMaxCompanies] = useState<string>('');
  const [isUpdatingLimits, setIsUpdatingLimits] = useState(false);
  const [dashboardPricingProfession, setDashboardPricingProfession] = useState<string>('default');

  const targetPricing = dashboardPricingProfession === 'default'
    ? pricing
    : (pricing.professions?.[dashboardPricingProfession] || pricing);

  const handleUpdateLimits = async () => {
    if (!editingAgencyLimits) return;
    setIsUpdatingLimits(true);
    try {
      await updateDocument('agencies', editingAgencyLimits.id, {
        maxEmployees: maxEmployees === '' ? null : parseInt(maxEmployees),
        maxCompanies: maxCompanies === '' ? null : parseInt(maxCompanies)
      });
      setEditingAgencyLimits(null);
      toast.success('Limites atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating limits:', error);
      toast.error('Erro ao atualizar limites.');
    } finally {
      setIsUpdatingLimits(false);
    }
  };

  // Chart Data Preparation
  const statusCounts = assignments.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Concluídos', value: statusCounts['COMPLETED'] || 0, color: '#10b981' },
    { name: 'Em Andamento', value: statusCounts['IN_PROGRESS'] || 0, color: '#3b82f6' },
    { name: 'Agendados', value: statusCounts['SCHEDULED'] || 0, color: '#8b5cf6' },
    { name: 'Cancelados', value: statusCounts['CANCELLED'] || 0, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  }).reverse();

  const barData = last6Months.map(month => {
    const monthAssignments = assignments.filter(a => a.date.startsWith(month) && a.status === 'COMPLETED');
    const revenue = monthAssignments.reduce((acc, curr) => acc + curr.value, 0);
    return {
      name: month.split('-').reverse().join('/'),
      Faturamento: revenue
    };
  });

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
      toast.success('Avaliação enviada com sucesso!');
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

  if (role === 'ADMIN' && !selectedAgencyId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-10"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Dashboard Super Admin</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">Acompanhe o desempenho global da plataforma.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<ShieldCheck size={24} />} 
            label="Total de Agências" 
            value={agencies.length.toString()} 
            trend="Cadastradas"
            color="violet"
            onClick={() => setActiveTab('admin_agencies')}
          />
          <StatCard 
            icon={<Building2 size={24} />} 
            label="Total de Empresas" 
            value={totalCompanies.toString()} 
            trend="Operando"
            color="blue"
          />
          <StatCard 
            icon={<CheckCircle2 size={24} />} 
            label="Empresas Ativas" 
            value={activeCompanies.toString()} 
            trend="Limpo"
            color="emerald"
          />
          <StatCard 
            icon={<Clock size={24} />} 
            label="Empresas Pendentes" 
            value={pendingCompanies.toString()} 
            trend="Limpo"
            color="amber"
          />
          <StatCard 
            icon={<Users size={24} />} 
            label="Gerentes Pendentes" 
            value={pendingManagers.toString()} 
            trend="Cadastrados"
            color="orange"
          />
          <StatCard 
            icon={<Users size={24} />} 
            label="Total de Funcionários" 
            value={totalEmployees.toString()} 
            trend="Ativos"
            color="purple"
            onClick={() => setActiveTab('registrations')}
          />
          <StatCard 
            icon={<Briefcase size={24} />} 
            label="Serviços em Andamento" 
            value={servicesInProgress.toString()} 
            trend={alerts > 0 ? "Alertas" : "Tudo OK"}
            alert={alerts > 0}
            color="indigo"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 dark:bg-brand-500 text-white flex items-center justify-center shadow-2xl shadow-slate-950/20 dark:shadow-brand-500/20">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Agências Cadastradas</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">Lista de parceiros na plataforma</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agencies.map(agency => {
              const agencyEmployees = employees.filter(e => e.agencyId === agency.id).length;
              const agencyCompanies = companies.filter(c => c.agencyId === agency.id).length;
              return (
                <div key={agency.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{agency.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{agencyEmployees} Colaboradores</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{agencyCompanies} Empresas</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingAgencyLimits(agency);
                          setMaxEmployees(agency.maxEmployees?.toString() || '');
                          setMaxCompanies(agency.maxCompanies?.toString() || '');
                        }}
                        className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-900 dark:hover:bg-brand-500 hover:text-white hover:border-slate-900 dark:hover:border-brand-500 transition-all shadow-sm"
                        title="Definir Limites"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={() => onSelectAgency && onSelectAgency(agency.id)}
                        className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {editingAgencyLimits && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
              >
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Limites da Agência</h3>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{editingAgencyLimits.name}</p>
                  </div>
                  <button onClick={() => setEditingAgencyLimits(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Limite de Funcionários</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="number" 
                          placeholder="Sem limite"
                          className="w-full pl-12 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                          value={maxEmployees}
                          onChange={e => setMaxEmployees(e.target.value)}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Deixe vazio para não ter limite de cadastros.</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Limite de Empresas</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="number" 
                          placeholder="Sem limite"
                          className="w-full pl-12 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-slate-700"
                          value={maxCompanies}
                          onChange={e => setMaxCompanies(e.target.value)}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Deixe vazio para não ter limite de cadastros.</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateLimits}
                    disabled={isUpdatingLimits}
                    className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingLimits ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {role === 'ADMIN' && agencies.find(a => a.id === selectedAgencyId) 
              ? agencies.find(a => a.id === selectedAgencyId)?.name 
              : role === 'AGENCY' ? agencies.find(a => a.id === agencyId)?.name || 'Visão Geral' : 'Visão Geral'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
            {role === 'ADMIN' && selectedAgencyId 
              ? 'Acompanhe o desempenho desta agência.' 
              : 'Acompanhe o desempenho da sua agência hoje.'}
          </p>
        </div>
        {role === 'ADMIN' && selectedAgencyId && (
          <button 
            onClick={() => onClearAgency()}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Voltar para Visão Global
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {role === 'AGENCY' && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Plano {agencies.find(a => a.id === agencyId)?.plan}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    agencies.find(a => a.id === agencyId)?.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {agencies.find(a => a.id === agencyId)?.subscriptionStatus === 'TRIAL' ? 'Período de Teste' : 'Ativo'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Seu plano atual e limites</p>
                {(() => {
                  const currentPlan = plans.find(p => p.id === agencies.find(a => a.id === agencyId)?.plan);
                  if (currentPlan) {
                    return (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {currentPlan.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{f}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Solicitação</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all" 
                      style={{ width: `${Math.min(100, (totalEmployees / (agencies.find(a => a.id === agencyId)?.maxEmployees || 9999)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">{totalEmployees} / {agencies.find(a => a.id === agencyId)?.maxEmployees || '∞'}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Empresas</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 transition-all" 
                      style={{ width: `${Math.min(100, (totalCompanies / (agencies.find(a => a.id === agencyId)?.maxCompanies || 9999)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">{totalCompanies} / {agencies.find(a => a.id === agencyId)?.maxCompanies || '∞'}</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-slate-950 dark:bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-brand-600 transition-all active:scale-95">
                Upgrade
              </button>
            </div>
          </div>
        )}
        {role === 'ADMIN' && (
          <StatCard 
            icon={<ShieldCheck size={24} />} 
            label="Total de Agências" 
            value={agencies.length.toString()} 
            trend="Na Plataforma"
            color="violet"
            onClick={() => setActiveTab('admin_agencies')}
          />
        )}
        {role === 'AGENCY' && (
          <StatCard 
            icon={<FileText size={24} />} 
            label="Solicitações" 
            value={companyRequests.filter(r => r.status === 'PENDING').length.toString()} 
            trend="Pendentes"
            color="amber"
            onClick={() => {
              if (setStaffingSubTab) setStaffingSubTab('REQUESTS');
              setActiveTab('staffing');
            }}
          />
        )}
        <StatCard 
          icon={<Building2 size={24} />} 
          label="Total de Empresas" 
          value={totalCompanies.toString()} 
          trend="Cadastradas"
          color="blue"
          onClick={() => setActiveTab('companies')}
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
          color="amber"
          onClick={() => setActiveTab('admin_companies')}
        />
        <StatCard 
          icon={<Users size={24} />} 
          label="Gerentes Pendentes" 
          value={pendingManagers.toString()} 
          trend={pendingManagers > 0 ? "Aguardando" : "Limpo"}
          alert={pendingManagers > 0}
          color="amber"
          onClick={() => setActiveTab('admin_companies')}
        />
        <StatCard 
          icon={<Users size={24} />} 
          label="Total de Funcionários" 
          value={totalEmployees.toString()} 
          trend="Cadastrados"
          color="purple"
          onClick={() => setActiveTab('registrations')}
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

      {role === 'AGENCY' && companyRequests.filter(req => req.status === 'PENDING').length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Solicitações das Empresas</h3>
              <p className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-xs font-black uppercase tracking-widest mt-0.5">Pedidos de profissionais para datas específicas</p>
            </div>
          </div>

          <div className="space-y-6">
            {companyRequests.filter(req => req.status === 'PENDING').map(req => {
              const client = clients.find(c => c.id === req.clientId);
              return (
                <div key={req.id} className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-colors duration-500">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-black rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{client?.name || 'Cliente não encontrado'}</h4>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Calendar size={12} /> {formatDateBR(req.date)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Users size={12} /> {req.quantity} {req.quantity === 1 ? 'Profissional' : 'Profissionais'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => {
                          if (setStaffingSubTab) setStaffingSubTab('REQUESTS');
                          setActiveTab('staffing');
                        }}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 text-center leading-none"
                      >
                        Atender
                      </button>
                      <button 
                        onClick={() => {
                          if (setStaffingSubTab) setStaffingSubTab('REQUESTS');
                          setActiveTab('staffing');
                        }}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 text-center leading-none shadow-sm"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-500">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Faturamento (Últimos 6 meses)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                <RechartsTooltip 
                  cursor={{ fill: isDarkMode ? '#0f172a' : '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDarkMode ? '#020617' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: isDarkMode ? '#3b82f6' : '#2563eb' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                />
                <Bar dataKey="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-500">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Status das Diárias</h3>
          <div className="h-72 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#020617' : '#ffffff',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Nenhum dado disponível</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {alerts > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 p-8 sm:p-12 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full -mr-48 -mt-48 transition-all group-hover:scale-110 duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-rose-950/20 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-900 dark:text-rose-100 tracking-tight">Alertas Críticos</h3>
                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium tracking-wide">Empresas com irregularidades que precisam de atenção.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.filter(c => c.status === 'BLOCKED' || c.documents?.some(d => d.status === 'REJECTED')).map(company => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{company.name}</p>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                        {company.status === 'BLOCKED' ? 'Empresa Bloqueada' : 'Documentos Rejeitados'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('admin_companies')}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                  >
                    Resolver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {role !== 'ADMIN' && (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 transition-all group-hover:scale-110 duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-950 dark:bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-slate-950/20 dark:shadow-black/20 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  {targetPricing.type === 'STARS' ? <Star size={32} className="fill-yellow-400 text-yellow-400" /> : <Calendar size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Tabela de Preços {targetPricing.type === 'STARS' ? `por ${ratingLabel}` : 'por Dia'}
                  </h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium tracking-wide">Valores baseados na configuração atual do sistema.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {(Object.keys(pricing.professions || {}).length > 0) && (
                  <select 
                    value={dashboardPricingProfession} 
                    onChange={e => setDashboardPricingProfession(e.target.value)}
                    className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 transition-colors shadow-sm"
                  >
                    <option value="">Selecione uma função...</option>
                    {Object.keys(pricing.professions || {}).map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                )}
                {targetPricing.type === 'DAILY' && (
                  <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 w-fit shadow-sm">
                    Hoje: {todayName}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {targetPricing.type === 'STARS' ? (
                Object.entries(targetPricing.stars || {}).map(([stars, p]) => (
                  <div key={stars} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group/price relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover/price:scale-150 duration-700"></div>
                    <div className="flex gap-1.5 relative z-10">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < parseInt(stars) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700'} />
                      ))}
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">R$ {(p.employee + p.company).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-3">Valor por diária</p>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(parseInt(stars) / 5) * 100}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => {
                  const p = targetPricing.weekly?.[day] || { employee: 0, company: 0 };
                  const isToday = day === todayName;
                  return (
                    <div key={day} className={`p-8 rounded-[2.5rem] border flex flex-col items-center gap-6 transition-all group/price relative overflow-hidden transition-colors duration-500 ${isToday ? 'bg-slate-950 dark:bg-brand-600 border-slate-950 dark:border-brand-600 text-white shadow-2xl shadow-slate-950/30 dark:shadow-brand-600/30 scale-105 z-10 font-bold' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:text-slate-100'}`}>
                      {isToday && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-400 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{day}</span>
                      <div className="text-center">
                        <p className={`text-3xl font-black tracking-tight ${isToday ? 'text-white' : 'text-slate-900 dark:text-white'}`}>R$ {(p.employee + p.company).toFixed(2)}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-3 ${isToday ? 'text-slate-500 dark:text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>Valor por diária</p>
                      </div>
                      {isToday && (
                        <div className="px-4 py-1.5 bg-blue-600/20 dark:bg-white/20 text-blue-400 dark:text-white rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20 dark:border-white/20">
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
      )}

      {role !== 'ADMIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 dark:bg-brand-500 text-white flex items-center justify-center shadow-2xl shadow-slate-950/20 dark:shadow-brand-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500 transition-colors">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Diarias do Dia</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">Diaria ativa hoje</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('agency_staffing')}
                className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm active:scale-95"
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
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {data.assignments.length} {data.assignments.length === 1 ? 'Diária' : 'Diárias'}
                          </span>
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
                                      <div key={as.id} className="flex items-center p-4 sm:p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all group/item relative overflow-hidden gap-4">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500 shrink-0 flex items-center justify-center bg-white">
                                          {emp?.photoUrl ? (
                                            <img 
                                              src={emp.photoUrl} 
                                              alt="" 
                                              className="w-full h-full object-cover"
                                              referrerPolicy="no-referrer"
                                            />
                                          ) : (
                                            <UserIcon size={24} className="text-slate-300" />
                                          )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <p className="font-black text-slate-900 text-sm sm:text-base tracking-tight uppercase leading-tight">
                                            {emp?.firstName} {emp?.lastName}
                                          </p>
                                          <p className="text-[9px] sm:text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">
                                            08:00 - 17:00
                                          </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                          <div className="flex items-center gap-2">
                                            {as.status === 'COMPLETED' && !feedbacks.some(f => f.assignmentId === as.id) && (
                                              <button 
                                                onClick={() => setEvaluatingEmployee(emp || null)}
                                                className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Avaliar Profissional"
                                              >
                                                <Star size={12} />
                                              </button>
                                            )}
                                            <p className="text-sm sm:text-xl font-black text-slate-950 tracking-tight leading-none">
                                              R$ {as.value.toFixed(2)}
                                            </p>
                                          </div>
                                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border whitespace-nowrap ${
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
                            {r.eSocialUrl && (
                              <span className="text-[7px] px-1 rounded bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest flex items-center gap-0.5 ml-2">
                                <FileText size={8} />
                                eSocial
                              </span>
                            )}
                            <span className={`text-[7px] px-1 rounded bg-slate-100 text-slate-500 font-black uppercase tracking-widest ml-1 ${r.category === 'CONTRATADO' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'}`}>
                              {r.category === 'CONTRATADO' ? 'CLT' : 'Diarista'}
                            </span>
                            {r.profession && (
                              <span className="text-[7px] px-1 rounded bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest ml-1">
                                {r.profession}
                              </span>
                            )}
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
              agencies={agencies}
              employees={employees}
            />
          )}
        </div>
      )}

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
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-white">
                    {evaluatingEmployee.photoUrl ? (
                      <img src={evaluatingEmployee.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={24} className="text-slate-300" />
                    )}
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

function StatCard({ icon, label, value, trend, alert, color = 'blue', onClick }: { icon: React.ReactNode, label: string, value: string, trend?: string, alert?: boolean, color?: 'blue' | 'indigo' | 'emerald' | 'orange' | 'purple' | 'rose' | 'slate' | 'violet' | 'amber' | 'cyan', onClick?: () => void }) {
  const colorClasses: any = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/50',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50',
    slate: 'bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-slate-100 border-slate-100 dark:border-slate-800/50',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-accent-violet dark:text-violet-400 border-violet-100 dark:border-violet-800/50',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-accent-amber dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-accent-cyan dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/50'
  };

  const iconColors: any = {
    blue: 'bg-blue-600 text-white shadow-blue-500/20',
    indigo: 'bg-indigo-600 text-white shadow-indigo-500/20',
    emerald: 'bg-emerald-600 text-white shadow-emerald-500/20',
    orange: 'bg-orange-600 text-white shadow-orange-500/20',
    purple: 'bg-purple-600 text-white shadow-purple-500/20',
    rose: 'bg-rose-600 text-white shadow-rose-500/20',
    slate: 'bg-slate-600 text-white shadow-slate-500/20',
    violet: 'bg-accent-violet text-white shadow-violet-500/20',
    amber: 'bg-accent-amber text-white shadow-amber-500/20',
    cyan: 'bg-accent-cyan text-white shadow-cyan-500/20'
  };

  return (
    <div 
      onClick={onClick}
      className={`p-3.5 sm:p-8 rounded-xl sm:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 dark:hover:shadow-black/20 transition-all duration-500 group relative overflow-hidden ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150 ${iconColors[color]?.split(' ')[0] || 'bg-blue-600'}`} />
      
      <div className="flex items-center justify-between mb-2 sm:mb-6 relative z-10">
        <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 bg-linear-to-br from-white/10 to-transparent ${iconColors[color] || 'bg-blue-600 text-white'}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${colorClasses[color]} border shadow-sm`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[6px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0 sm:mb-1.5">{label}</p>
        <h3 className="text-sm sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight group-hover:translate-x-1 transition-transform duration-300">{value}</h3>
      </div>
      {alert && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
      )}
    </div>
  );
}

function EmployeeSchedule({ employeeId, employees, assignments, notifications, clients, units, companies, agencies, bulletins, invoices, checkins, companyRequests, isDarkMode }: { employeeId: string, employees: Employee[], assignments: Assignment[], notifications: AppNotification[], clients: Client[], units: Unit[], companies: Company[], agencies: Agency[], bulletins: Bulletin[], invoices: Invoice[], checkins: CheckIn[], companyRequests: CompanyRequest[], isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'UNAVAILABILITY' | 'FINANCE' | 'MURAL'>('SCHEDULE');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFaceUpdate, setShowFaceUpdate] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [prevOfferIds, setPrevOfferIds] = useState<string[]>([]);
  const [cancelingAssignment, setCancelingAssignment] = useState<Assignment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
  
  // Local Map Modal State
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapCompanyDetails, setMapCompanyDetails] = useState<{
    name: string;
    address: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  
  const employee = employees.find(e => e.id === employeeId);
  const myAssignments = assignments.filter(a => a.employeeId === employeeId);
  const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const scheduledAssignments = myAssignments
    .filter(a => a.status === 'SCHEDULED' && a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const completedAssignments = myAssignments
    .filter(a => a.status === 'COMPLETED')
    .sort((a, b) => b.date.localeCompare(a.date));
  const myNotifications = notifications.filter(n => n.userId === employeeId && !n.read);
  const myBulletins = bulletins.filter(b => b.targetRoles.includes('EMPLOYEE'));

  const myOffers = companyRequests.filter(req => {
    if (!req.broadcasted) return false;
    if (req.status !== 'PENDING') return false;
    if (req.date < todayStr) return false;
    if (employee && req.agencyId !== employee.agencyId) return false;
    const isAssigned = assignments.some(a => a.employeeId === employeeId && a.clientId === req.clientId && a.date === req.date && a.status !== 'CANCELLED');
    if (isAssigned) return false;
    if (employee?.unavailableDates?.includes(req.date)) return false;
    const assignedCount = assignments.filter(a => a.clientId === req.clientId && a.date === req.date && a.status !== 'CANCELLED').length;
    if (assignedCount >= req.quantity) return false;
    return true;
  });

  useEffect(() => {
    const currentOfferIds = myOffers.map(o => o.id);
    const newOffers = currentOfferIds.filter(id => !prevOfferIds.includes(id));
    if (newOffers.length > 0 && prevOfferIds.length > 0 && 'Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('Nova Vaga!', {
          body: 'Uma nova solicitação de trabalho está disponível para você!',
          icon: '/favicon.ico',
          requireInteraction: true
        });
      });
      console.log('Mobile notification sent for new offers');
    }
    // Update ref/state if it changed
    if (currentOfferIds.join(',') !== prevOfferIds.join(',')) {
      setPrevOfferIds(currentOfferIds);
    }
  }, [myOffers]);

  const getDayCheckins = (date: string) => {
    return checkins.filter(ci => 
      ci.employeeId === employeeId && 
      formatDateBR(ci.timestamp) === formatDateBR(date)
    );
  };

  const financeAssignments = myAssignments
    .filter(a => a.status !== 'CANCELLED')
    .filter(a => a.status === 'COMPLETED' || getDayCheckins(a.date).length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalEarnings = financeAssignments
    .filter(a => a.status === 'COMPLETED' && getDayCheckins(a.date).length >= 2)
    .reduce((acc, curr) => acc + curr.value, 0);

  const pendingEarnings = financeAssignments
    .filter(a => (a.status === 'COMPLETED' || getDayCheckins(a.date).length >= 2) && a.paymentStatus === 'PENDING')
    .reduce((acc, curr) => acc + curr.value, 0);

  const handleConfirm = async (assignmentId: string) => {
    await updateDocument('assignments', assignmentId, { confirmed: true });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleCancelAssignment = (assignment: Assignment) => {
    setCancelingAssignment(assignment);
    setCancelReason('');
  };

  const confirmCancelAssignment = async () => {
    if (!cancelingAssignment) return;
    try {
      setIsCanceling(true);
      await deleteDocument('assignments', cancelingAssignment.id);
      
      const reasonText = cancelReason.trim() ? ` Motivo: ${cancelReason}` : '';
      
      // Notify agency that employee cancelled
      await createDocument('notifications', {
        userId: 'AGENCY',
        agencyId: cancelingAssignment.agencyId,
        title: 'Cancelamento de Diária',
        message: `O funcionário ${employee?.firstName} ${employee?.lastName} cancelou a diária do dia ${formatDateBR(cancelingAssignment.date)}. Uma nova vaga foi reaberta.${reasonText}`,
        type: 'ALERT',
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success('Diária cancelada com sucesso. Obrigado por avisar!');
      setCancelingAssignment(null);
      setCancelReason('');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cancelar diária.');
    } finally {
      setIsCanceling(false);
    }
  };

  const DEFAULT_MAP_LAT = -23.55052;
  const DEFAULT_MAP_LNG = -46.633308;

  const handleOpenMap = (clientOrUnit: any) => {
    if (!clientOrUnit) return;
    
    const name = clientOrUnit.name || 'Cliente';
    const address = clientOrUnit.location || clientOrUnit.address || '';
    const linkedCompany = clientOrUnit.companyId ? companies.find(c => c.id === clientOrUnit.companyId) : null;
    const phone = clientOrUnit.phone || linkedCompany?.phone || '';
    const email = clientOrUnit.email || linkedCompany?.email || '';
    
    let latitude = clientOrUnit.latitude;
    let longitude = clientOrUnit.longitude;
    
    if (latitude === undefined || latitude === null || isNaN(latitude)) {
      if (clientOrUnit.coordinates?.lat) {
        latitude = clientOrUnit.coordinates.lat;
        longitude = clientOrUnit.coordinates.lng;
      } else {
        const hash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const latOffset = ((hash % 100) - 50) / 1000;
        const lngOffset = ((hash % 70) - 35) / 1000;
        latitude = DEFAULT_MAP_LAT + latOffset;
        longitude = DEFAULT_MAP_LNG + lngOffset;
      }
    }
    
    setMapCompanyDetails({
      name,
      address,
      phone,
      email,
      latitude,
      longitude
    });
    setMapModalOpen(true);
  };

  const handleOpenMapForNotification = (notification: any) => {
    let clientToMap = null;
    
    if (notification.clientId) {
      clientToMap = clients.find(c => c.id === notification.clientId);
    }
    
    if (!clientToMap) {
      clientToMap = clients.find(c => {
        const cName = c.name?.toLowerCase() || '';
        const nMsg = notification.message?.toLowerCase() || '';
        return cName && nMsg.includes(cName);
      });
    }
    
    if (clientToMap) {
      handleOpenMap(clientToMap);
    } else {
      const matchedName = notification.message?.match(/empresa\s+([A-Za-z0-9\s\-]+?)\./i);
      const name = matchedName?.[1] || notification.title || 'Cliente';
      
      setMapCompanyDetails({
        name,
        address: 'Consulte o painel da vaga para obter o endereço.',
        latitude: DEFAULT_MAP_LAT,
        longitude: DEFAULT_MAP_LNG
      });
      setMapModalOpen(true);
    }
  };

    const handleAcceptOffer = async (req: CompanyRequest) => {
    try {
      // Find unitId if company uses units. The simplest is we don't know the exact unit if there are multiple.
      // Usually clientId represents the unit if it's a matrix structure.
      const newAssignment: Omit<Assignment, 'id'> = {
        agencyId: req.agencyId,
        companyId: req.companyId,
        clientId: req.clientId,
        unitId: '', // Default to empty
        employeeId: employeeId,
        date: req.date,
        status: 'SCHEDULED',
        value: 0, // Will be set by agency or default
        confirmed: true, // Employee already confirmed by accepting
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString()
      };
      await createDocument('assignments', newAssignment);
      
      // Notify Company
      await createDocument('notifications', {
        userId: 'COMPANY_' + req.companyId,
        agencyId: req.agencyId,
        title: 'Vaga Aceita!',
        message: `O funcionário ${employee?.firstName} ${employee?.lastName} aceitou a vaga para o dia ${formatDateBR(req.date)}.`,
        type: 'SUCCESS',
        read: false,
        createdAt: new Date().toISOString()
      });

      // Push Notification
      try {
        await fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Vaga Aceita!',
            body: `Um profissional aceitou a solicitação de vaga para o dia ${formatDateBR(req.date)}.`,
            targetCompanyId: req.companyId
          })
        });
      } catch(e) {
        console.warn("Failed to send push notification via API");
      }

      toast.success('Você aceitou a vaga e ela já está na sua agenda!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao aceitar vaga.');
    }
  };

  if (!employee) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-sm transition-colors duration-500">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 dark:text-slate-700 border border-slate-100 dark:border-slate-800 rotate-6">
          <UserIcon size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Perfil não encontrado</h3>
          <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto text-sm font-medium leading-relaxed">Não encontramos uma agenda vinculada a este e-mail. Entre em contato com sua agência.</p>
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
      className="space-y-6 sm:space-y-10 relative overflow-x-hidden"
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

      <div className="flex flex-col gap-0.5 px-2 sm:px-0 mb-2 sm:mb-0 items-center text-center sm:items-start sm:text-left">
        <h2 className="text-base sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Minha Agenda</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-[8px] sm:text-base">Gerencie suas diarias e informe sua disponibilidade.</p>
      </div>

      {/* Notifications Section */}
      {myNotifications.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <h3 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Notificações Prioritárias</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {myNotifications.map(notification => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 dark:bg-brand-900/50 text-white p-8 sm:p-12 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-950/40 relative overflow-hidden group border border-transparent dark:border-brand-500/20"
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
                    {(notification.type === 'ASSIGNMENT' || notification.clientId || notification.requestId || notification.title?.toLowerCase().includes('oportunidade')) && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMapForNotification(notification)}
                          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95"
                        >
                          <MapPin size={12} className="text-blue-400" />
                          <span>📍 Ver Localização</span>
                        </button>
                      </div>
                    )}
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

      {/* Job Offers Section */}
      {myOffers.length > 0 && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <h3 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Vagas Disponíveis</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {myOffers.map(offer => {
              const client = clients.find(c => c.id === offer.clientId);
              const isLocationLink = client?.location?.startsWith('http') || client?.location?.startsWith('www');
              
              return (
                <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 text-slate-900 dark:text-white p-8 sm:p-12 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-10 shadow-emerald-200 relative overflow-hidden group"
                >
                  <div className="flex items-center gap-8 relative z-10 w-full">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-200 rotate-6 group-hover:rotate-0 transition-transform duration-500 shrink-0">
                      <Briefcase size={40} className="animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left space-y-3 w-full">
                      <h4 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 tracking-tight uppercase">Nova Solicitação: {client?.name}</h4>
                      <div className="flex flex-col gap-2">
                        <p className="text-base font-medium text-emerald-700 dark:text-emerald-500 max-w-md leading-relaxed">
                          Data: {formatDateBR(offer.date)}<br/>
                          Vagas totais: {offer.quantity}
                        </p>
                        
                        {client && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => handleOpenMap(client)}
                              className="inline-flex items-center gap-2 bg-emerald-650 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              <MapPin size={14} /> 📍 Ver Localização no Mapa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-10">
                    <button 
                      onClick={() => handleAcceptOffer(offer)}
                      className="w-full sm:w-auto px-8 py-6 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95"
                    >
                      Aceitar Vaga
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-nowrap sm:flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg sm:rounded-2xl w-fit max-w-[calc(100%-1rem)] sm:w-fit border border-slate-200/50 dark:border-slate-800 mx-auto sm:mx-0 overflow-x-auto no-scrollbar transition-colors">
        <button 
          onClick={() => setActiveTab('SCHEDULE')}
          className={`flex-none px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'SCHEDULE' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
        >
          Agenda
        </button>
        <button 
          onClick={() => setActiveTab('FINANCE')}
          className={`flex-none px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'FINANCE' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
        >
          Financeiro
        </button>
        <button 
          onClick={() => setActiveTab('UNAVAILABILITY')}
          className={`flex-none px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-md sm:rounded-xl text-[6px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'UNAVAILABILITY' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
        >
          Indisponibilidade
        </button>
      </div>

      {activeTab === 'SCHEDULE' ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 px-4 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 mb-2 sm:mb-4">
            <StatCard 
              icon={<TrendingUp size={20} className="sm:w-6 sm:h-6" />} 
              label="Taxa de Presença" 
              value={`${employee.attendanceRate || 100}%`} 
              color="blue" 
            />
            <StatCard 
              icon={<Star size={20} className="sm:w-6 sm:h-6" />} 
              label="Nível Atual" 
              value={employee.level || 'BRONZE'} 
              color="amber" 
            />
            <StatCard 
              icon={<CheckCircle size={20} className="sm:w-6 sm:h-6" />} 
              label="Diárias Realizadas" 
              value={completedAssignments.length.toString()} 
              color="emerald" 
            />
          </div>

          {scheduledAssignments.length === 0 ? (
            <div className="bg-white p-12 sm:p-24 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                <Calendar size={40} className="sm:hidden" />
                <Calendar size={48} className="hidden sm:block" />
              </div>
              <p className="text-slate-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">Você não tem diarias agendadas no momento.</p>
            </div>
          ) : (
            Object.entries(
              scheduledAssignments.reduce((acc, as) => {
                if (!acc[as.date]) acc[as.date] = [];
                acc[as.date].push(as);
                return acc;
              }, {} as Record<string, Assignment[]>)
            )
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, dateAssignments]) => (
              <div key={date} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-xl shadow-blue-500/40"></div>
                  <h3 className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    {formatDateBR(date)}
                    <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold tracking-normal italic">
                      {dateAssignments.length} {dateAssignments.length === 1 ? 'Diária' : 'Diárias'}
                    </span>
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {dateAssignments.map(as => {
                    const cli = clients.find(c => c.id === as.clientId);
                    const unit = as.unitId ? units.find(u => u.id === as.unitId) : units.find(u => u.clientId === as.clientId);
                    const company = as.companyId ? companies.find(c => c.id === as.companyId) : (unit ? companies.find(c => c.id === unit.companyId) : companies.find(c => c.id === as.clientId));
                    const agency = agencies.find(a => a.id === as.agencyId);
                    
                    // Fallback for responsible name if unit is missing but client has managerName
                    const responsibleName = unit?.managerName || cli?.managerName || 'Responsável não definido';
                    const unitName = unit?.name || 'Matriz';
                    const companyName = company?.name || cli?.name || 'Empresa não identificada';

                    return (
                      <div key={as.id} className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 hover:shadow-2xl hover:shadow-slate-900/5 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="flex items-center gap-4 sm:gap-8 relative z-10">
                          <div className="w-12 h-12 sm:w-20 sm:h-20 bg-slate-50 rounded-xl sm:rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner shrink-0">
                            <Building2 size={24} className="sm:w-9 sm:h-9" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-950 text-base sm:text-2xl tracking-tight uppercase group-hover:text-blue-600 transition-colors">{cli?.name || unitName}</h4>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Empresa: {companyName}</p>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Unidade: {unitName}</p>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 sm:mt-1">Responsável: {responsibleName}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                              {cli?.location?.startsWith('http') ? (
                                <a href={cli.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                  <MapPin size={10} className="sm:w-3 sm:h-3" /> Ver no Mapa
                                </a>
                              ) : (
                                <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                                  <MapPin size={10} className="sm:w-3 sm:h-3" /> {cli?.location || 'Localização não definida'}
                                </span>
                              )}
                              {agency?.phone && (
                                <a href={`https://wa.me/${agency.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                                  <Phone size={10} className="sm:w-3 sm:h-3" /> Suporte
                                </a>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-6 gap-y-1.5 sm:gap-y-3 text-[8px] sm:text-[10px] font-black text-slate-400 mt-2 sm:mt-3 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-slate-100 group-hover:bg-white transition-colors shadow-sm"><Clock size={10} className="text-blue-600 sm:w-3 sm:h-3" /> 08:00 - 17:00</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-4 pt-6 sm:pt-0 border-t sm:border-t-0 border-slate-50 relative z-10">
                          <div className="text-left sm:text-right">
                            <p className="text-2xl sm:text-4xl font-black text-emerald-600 tracking-tight">R$ {as.value.toFixed(2)}</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">Valor Líquido</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <span className="text-[9px] sm:text-[10px] px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 border border-blue-500 text-center w-full">Confirmado</span>
                            <button 
                              onClick={() => handleCancelAssignment(as)}
                              className="text-[9px] sm:text-[10px] px-4 sm:px-6 py-1.5 sm:py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-black uppercase tracking-widest transition-colors border border-rose-100 text-center w-full"
                            >
                              Cancelar Diária
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'FINANCE' ? (
        <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-950 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 sm:p-4 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md">
                    <CreditCard size={24} className="text-blue-400 sm:w-8 sm:h-8" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Saldo Disponível</span>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1">Total a Receber</p>
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tight">R$ {pendingEarnings.toFixed(2)}</h3>
                </div>
                <button className="w-full py-3 sm:py-4 bg-white text-slate-950 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95">
                  Solicitar Adiantamento
                </button>
              </div>
            </div>
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl">
                  <TrendingUp size={24} className="text-emerald-600 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Ganhos Totais</span>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1">Acumulado na Plataforma</p>
                <h3 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">R$ {totalEarnings.toFixed(2)}</h3>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-slate-400 text-[10px] sm:text-xs font-medium leading-relaxed">Seu nível atual é <span className="text-amber-600 font-black">{employee.level || 'BRONZE'}</span>. Continue realizando diárias para aumentar seus ganhos!</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950 tracking-tight uppercase">Histórico de Pagamentos</h3>
              <button className="p-3 text-slate-400 hover:text-slate-950 transition-colors">
                <Filter size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Local</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financeAssignments.map(as => {
                    const cli = clients.find(c => c.id === as.clientId);
                    const dayCi = getDayCheckins(as.date);
                    const isInconsistent = dayCi.length === 1;
                    
                    return (
                      <tr key={as.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 font-medium text-slate-600">{formatDateBR(as.date)}</td>
                        <td className="p-6 font-black text-slate-950">{cli?.name || 'Unidade não identificada'}</td>
                        <td className="p-6 font-black text-slate-950">R$ {as.value.toFixed(2)}</td>
                        <td className="p-6">
                          {isInconsistent ? (
                            <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">
                              Inconsistência de Ponto
                            </span>
                          ) : (
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${as.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {as.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'MURAL' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 sm:px-0">
          {myBulletins.length === 0 ? (
            <div className="col-span-full bg-white p-24 rounded-[3rem] border border-slate-100 text-center space-y-6 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                <FileText size={48} />
              </div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Nenhum aviso no mural no momento.</p>
            </div>
          ) : (
            myBulletins.map(bulletin => (
              <div key={bulletin.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${bulletin.type === 'URGENT' ? 'bg-rose-500' : bulletin.type === 'TRAINING' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${bulletin.type === 'URGENT' ? 'bg-rose-50 text-rose-600' : bulletin.type === 'TRAINING' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {bulletin.type}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateBR(bulletin.createdAt)}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-slate-950 tracking-tight uppercase group-hover:text-blue-600 transition-colors">{bulletin.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">{bulletin.content}</p>
                  </div>
                  {bulletin.attachmentUrl && (
                    <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                      <Download size={16} />
                      Baixar Material de Apoio
                    </button>
                  )}
                </div>
              </div>
            ))
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

      {/* Cancel Assignment Modal */}
      {cancelingAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isCanceling && setCancelingAssignment(null)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Cancelar Diária</h3>
                  <p className="text-sm font-medium text-slate-500">Atenção: Cancelamentos devem ser feitos com no mínimo 2h de antecedência para não prejudicar a logística da unidade.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo (Opcional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all h-32 resize-none"
                  placeholder="Por que você está cancelando esta diária?"
                ></textarea>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setCancelingAssignment(null)}
                  disabled={isCanceling}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
                <button 
                  onClick={confirmCancelAssignment}
                  disabled={isCanceling}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCanceling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    'Confirmar Cancelamento'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Map modal inside EmployeeSchedule */}
      <AnimatePresence>
        {mapModalOpen && mapCompanyDetails && (
          <MapViewerModal
            isOpen={mapModalOpen}
            onClose={() => setMapModalOpen(false)}
            companyName={mapCompanyDetails.name}
            address={mapCompanyDetails.address}
            phone={mapCompanyDetails.phone}
            email={mapCompanyDetails.email}
            latitude={mapCompanyDetails.latitude}
            longitude={mapCompanyDetails.longitude}
          />
        )}
      </AnimatePresence>
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
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] bg-slate-50 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500 flex items-center justify-center">
                  {emp?.photoUrl ? (
                    <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={32} className="text-slate-300" />
                  )}
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

function CreateUserModal({ employee, onClose, onComplete, agencies, agencyId, selectedAgencyId }: { employee: Employee, onClose: () => void, onComplete: (username: string) => void, agencies: Agency[], agencyId: string | null, selectedAgencyId?: string | null }) {
  const [username, setUsername] = useState(`${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase().split(' ')[0]}`);
  const [password, setPassword] = useState(Math.random().toString(36).slice(-8));
  const [isSending, setIsSending] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const targetAgencyId = selectedAgencyId || agencyId || employee.agencyId;
      const currentAgency = agencies.find(a => a.id === targetAgencyId);
      const agencyDomainName = currentAgency?.tradeName 
        ? currentAgency.tradeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') 
        : currentAgency?.name 
          ? currentAgency.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') 
          : 'b11';
      const domain = `${agencyDomainName || 'b11'}.com`;
      
      const emailForAuth = username.includes('@') ? username : `${username}@${domain}`;
      
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

      toast.success(`Usuário criado com sucesso! Credenciais enviadas para ${employee.personalEmail || employee.phone}.`);
      onComplete(username);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast('Erro ao criar usuário: ' + error.message);
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

function ProcessRegistrationModal({ registration, onClose, onComplete, agencyId, selectedAgencyId, agencies, employees }: { registration: EmployeeRegistration, onClose: () => void, onComplete: () => void, agencyId: string | null, selectedAgencyId?: string | null, agencies: Agency[], employees: Employee[] }) {
  const [username, setUsername] = useState(`${registration.firstName.toLowerCase()}.${registration.lastName.toLowerCase().split(' ')[0]}`);
  const [password, setPassword] = useState(Math.random().toString(36).slice(-8));
  const [profession, setProfession] = useState(registration.profession || '');
  const [isSending, setIsSending] = useState(false);

  const currentAgency = agencies.find(a => a.id === (selectedAgencyId || agencyId || registration.agencyId));
  const professionsList = currentAgency?.segment || ['Logística', 'Segurança', 'Limpeza', 'Eventos', 'Administração'];

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const targetAgencyId = selectedAgencyId || agencyId || registration.agencyId;
      if (!targetAgencyId) throw new Error('Agência não identificada');

      // Check limits
      const agency = agencies.find(a => a.id === targetAgencyId);
      if (agency && agency.maxEmployees !== undefined && agency.maxEmployees !== null) {
        const currentEmployees = employees.filter(emp => emp.agencyId === targetAgencyId).length;
        if (currentEmployees >= agency.maxEmployees) {
          toast(`Limite de funcionários atingido (${agency.maxEmployees}). Entre em contato com o administrador para aumentar o limite.`);
          setIsSending(false);
          return;
        }
      }

      // 1. Create Firebase Auth user via secondary app to avoid automatic sign-in
      const agencyDomainName = currentAgency?.tradeName 
        ? currentAgency.tradeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') 
        : currentAgency?.name 
          ? currentAgency.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') 
          : 'b11';
      const domain = `${agencyDomainName || 'b11'}.com`;
      
      const emailForAuth = username.includes('@') ? username : `${username}@${domain}`;
      
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
        faceReferenceUrl: registration.faceReferenceUrl || registration.photoUrl,
        username,
        status: 'ACTIVE',
        rating: 5,
        complaints: 0,
        lastAssignmentDate: "",
        unavailableDates: [],
        eSocialUrl: registration.eSocialUrl || '',
        category: registration.category || 'DIARISTA',
        profession: profession || registration.profession || ''
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
      
      toast.success(`Cadastro finalizado! Credenciais enviadas para ${registration.phone}.`);
      onComplete();
    } catch (error: any) {
      console.error('Error processing registration:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast('Este e-mail já está cadastrado. Tente outro.');
      } else {
        toast.error('Erro ao processar cadastro. Verifique os dados e tente novamente.');
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Confirmar Profissão</label>
              <select 
                required
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                value={profession}
                onChange={e => setProfession(e.target.value)}
              >
                <option value="">Selecione...</option>
                {professionsList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Outros">Outros</option>
              </select>
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

          {(registration.docUrl || registration.eSocialUrl) && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Documentação Anexada</label>
              <div className="grid grid-cols-2 gap-3">
                {registration.docUrl && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2">
                    <Database size={16} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 truncate">Documento ID</span>
                  </div>
                )}
                {registration.eSocialUrl && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-bold text-indigo-700 truncate">eSocial</span>
                  </div>
                )}
              </div>
            </div>
          )}

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

function AgencyRegistrations({ employees, clients, ratingLabel, agencyId, selectedAgencyId, companyUsers, companies, units, agencies }: { employees: Employee[], clients: Client[], ratingLabel: string, agencyId: string | null, selectedAgencyId?: string | null, companyUsers: CompanyUser[], companies: Company[], units: Unit[], agencies: Agency[] }) {
  const [searchTerm, setSearchTerm] = useState('');
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
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DIARISTA' | 'CONTRATADO'>('ALL');
  const [professionFilter, setProfessionFilter] = useState<string>('ALL');
  const [linkCategory, setLinkCategory] = useState<'DIARISTA' | 'CONTRATADO'>('DIARISTA');
  const [regStep, setRegStep] = useState(1);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const pendingManagers = companyUsers.filter(cu => cu.status === 'PENDING');

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await updateDocument('companyUsers', userId, { status });
      await updateDocument('users', userId, { status });
      toast(`Status do usuário atualizado para ${status === 'ACTIVE' ? 'Ativo' : status}!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Erro ao atualizar status do usuário.');
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
    eSocialUrl: '',
    category: 'DIARISTA' as 'DIARISTA' | 'CONTRATADO',
    profession: '',
  });

  const currentAgency = agencies.find(a => a.id === (selectedAgencyId || agencyId));
  const agencyProfessions = Object.keys(currentAgency?.pricing?.professions || {});
  const baseProfessions = currentAgency?.segment || [];
  const defaultProfessions = ['Logística', 'Segurança', 'Limpeza', 'Eventos', 'Administração'];
  const professions = Array.from(new Set([...baseProfessions, ...agencyProfessions, ...defaultProfessions])).sort();

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
      eSocialUrl: emp.eSocialUrl || '',
      category: emp.category || 'DIARISTA',
      profession: emp.profession || '',
    });
    setIsEditing(true);
    setRegStep(1);
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

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      emp.cpf.includes(debouncedSearchTerm) ||
      emp.phone.includes(debouncedSearchTerm);
    const matchesCategory = categoryFilter === 'ALL' || emp.category === categoryFilter;
    const matchesProfession = professionFilter === 'ALL' || emp.profession === professionFilter;
    return matchesSearch && matchesCategory && matchesProfession;
  });

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
      
      try {
        const q = query(collection(db, 'feedPosts'), where('creatorId', '==', deleteEmployee.id));
        const qs = await getDocs(q);
        await Promise.all(qs.docs.map(d => deleteDocument('feedPosts', d.id)));
      } catch (e) {
        console.error('Failed to cleanup feedposts for user', e);
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
      toast("Não foi possível acessar a câmera.");
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
    const link = `${window.location.origin}?role=REGISTRATION${targetAgencyId ? `&agencyId=${targetAgencyId}` : ''}&category=${linkCategory}`;
    const message = `Olá! Aqui está o link para o seu cadastro na agência (${linkCategory === 'DIARISTA' ? 'Diarista' : 'Contratado CLT'}): ${link}`;
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
      toast('Não aceitamos menores de idade.');
      return;
    }

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      toast('Agência não identificada.');
      return;
    }

    if (isEditing && selectedEmployee) {
      await updateDocument('employees', selectedEmployee.id, formData);
      toast.success('Cadastro atualizado com sucesso!');
      setShowForm(false);
      setIsEditing(false);
      setSelectedEmployee(null);
      setFormData({ firstName: '', lastName: '', cpf: '', birthDate: '', phone: '', personalEmail: '', lgpdAuthorized: false, photoUrl: '', docUrl: '', eSocialUrl: '', category: 'DIARISTA', profession: '' });
      setRegStep(1);
    } else {
      // Create path
      if (regStep === 1) {
        // Check limits
        const agency = agencies.find(a => a.id === targetAgencyId);
        if (agency && agency.maxEmployees !== undefined && agency.maxEmployees !== null) {
          const currentEmployees = employees.length;
          if (currentEmployees >= agency.maxEmployees) {
            toast(`Limite de funcionários atingido (${agency.maxEmployees}). Entre em contato com o administrador para aumentar o limite.`);
            return;
          }
        }

        // Generate email and password
        const cleanFirst = formData.firstName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const cleanLast = formData.lastName.trim().split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        const currentAgency = agencies.find(a => a.id === targetAgencyId);
        const agencyDomainName = currentAgency?.tradeName 
          ? currentAgency.tradeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') 
          : currentAgency?.name 
            ? currentAgency.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '') 
            : 'b11';
        const domain = `${agencyDomainName || 'b11'}.com`;
        const emailForAuth = `${cleanFirst}.${cleanLast}@${domain}`;
        const pwd = Math.random().toString(36).slice(-8);

        setGeneratedEmail(emailForAuth);
        setGeneratedPassword(pwd);
        setRegStep(2);
      } else if (regStep === 2) {
        const loadingId = toast.loading('Criando credenciais e finalizando cadastro...');
        try {
          // 1. Create Firebase Auth user
          const newUid = await createNewUser(generatedEmail, generatedPassword);

          // 2. Create employee record with the new UID
          const newEmp = {
            ...formData,
            username: generatedEmail.split('@')[0],
            loginEmail: generatedEmail,
            agencyId: targetAgencyId,
            rating: 1,
            status: 'ACTIVE',
            complaints: 0,
          };
          await setDocument('employees', newUid, newEmp);

          // 3. Create user authorization role document
          await setDocument('users', newUid, {
            role: 'EMPLOYEE',
            email: formData.personalEmail,
            agencyId: targetAgencyId,
            forcePasswordChange: true,
            createdAt: new Date().toISOString()
          });

          toast.success('Cadastro concluído!', { id: loadingId });

          // 4. Redirect to WhatsApp with credentials
          const cleanPhone = formData.phone.replace(/\D/g, '');
          const message = `Olá, ${formData.firstName}! Seu cadastro completo no ProStaff Brasil foi realizado.\n\nAqui estão seus dados para acesso:\n📧 Login: ${generatedEmail}\n🔑 Senha: ${generatedPassword}\n\nAcesse pelo site: Prostaff.com`;
          const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');

          // Clean up and reset states
          setShowForm(false);
          setIsEditing(false);
          setSelectedEmployee(null);
          setFormData({ firstName: '', lastName: '', cpf: '', birthDate: '', phone: '', personalEmail: '', lgpdAuthorized: false, photoUrl: '', docUrl: '', eSocialUrl: '', category: 'DIARISTA', profession: '' });
          setRegStep(1);
          setGeneratedEmail('');
          setGeneratedPassword('');
        } catch (error: any) {
          console.error('Error creating user/employee:', error);
          toast.error('Erro ao finalizar cadastro: ' + error.message, { id: loadingId });
        }
      }
    }
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
            agencies={agencies}
            agencyId={agencyId}
            selectedAgencyId={selectedAgencyId}
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
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setCategoryFilter('DIARISTA')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'DIARISTA' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              Diaristas
            </button>
            <button 
              onClick={() => setCategoryFilter('CONTRATADO')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'CONTRATADO' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              Contratados
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfessionFilter('ALL')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${professionFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md transform -translate-y-0.5' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
            >
              Qualquer Profissão
            </motion.button>
            {professions.map(prof => (
              <motion.button 
                key={prof}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfessionFilter(prof)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${professionFilter === prof ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform -translate-y-0.5' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
              >
                {prof}
              </motion.button>
            ))}
          </div>
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
            onClick={() => {
              setRegStep(1);
              setGeneratedEmail('');
              setGeneratedPassword('');
              setShowForm(true);
            }}
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
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoria do Cadastro</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setLinkCategory('DIARISTA')}
                        className={`p-4 rounded-2xl border-2 font-bold transition-all ${linkCategory === 'DIARISTA' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        Diarista
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkCategory('CONTRATADO')}
                        className={`p-4 rounded-2xl border-2 font-bold transition-all ${linkCategory === 'CONTRATADO' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        Contratado CLT
                      </button>
                    </div>
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
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {regStep === 2 ? 'Cadastro Direto - Acesso' : isEditing ? 'Editar Cadastro' : 'Cadastro Direto'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {regStep === 2 ? 'Verifique as credenciais geradas.' : isEditing ? 'Atualize os dados.' : 'Preencha os dados.'}
                </p>
              </div>
              <button onClick={() => { setShowForm(false); setIsEditing(false); setSelectedEmployee(null); setRegStep(1); setGeneratedEmail(''); setGeneratedPassword(''); }} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {regStep === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Nome</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Sobrenome</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Categoria</label>
                    <select 
                      required
                      className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as 'DIARISTA' | 'CONTRATADO'})}
                    >
                      <option value="DIARISTA">Diarista</option>
                      <option value="CONTRATADO">Contratado CLT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Profissão / Segmento</label>
                    <select 
                      required
                      className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                      value={formData.profession}
                      onChange={e => setFormData({...formData, profession: e.target.value})}
                    >
                      <option value="">Selecione uma profissão...</option>
                      {professions.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Documento eSocial (PDF/IMG)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all">
                          <FileText size={16} />
                          <span className="text-xs font-bold truncate">
                            {formData.eSocialUrl ? 'Documento Anexado' : 'Selecionar Arquivo'}
                          </span>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({...formData, eSocialUrl: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {formData.eSocialUrl && (
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, eSocialUrl: ''})}
                          className="p-3 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">CPF</label>
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
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Data de Nascimento</label>
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
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold font-bold">WhatsApp / Telefone</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="Ex: 11999999999"
                      className="w-full p-3 bg-slate-50 border-2 border-transparent rounded-lg focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">E-mail Pessoal</label>
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
                    <label htmlFor="lgpd-agency" className="text-[9px] text-slate-500 font-medium leading-relaxed font-bold">
                      Autorizo o uso dos dados conforme a LGPD.
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Foto Profissional</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        onClick={startCamera}
                        className="p-4 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-all bg-slate-50/50 group"
                      >
                        <Camera size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                        <p className="text-[9px] font-black uppercase tracking-widest font-bold">Câmera</p>
                      </div>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-300 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer transition-all bg-slate-50/50 group"
                      >
                        <Upload size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                        <p className="text-[9px] font-black uppercase tracking-widest font-bold">Galeria</p>
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
                    {isEditing ? 'Salvar Alterações' : 'Avançar'}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col gap-5">
                    <p className="text-xs text-slate-500 font-bold leading-relaxed text-center">
                      Estas serão as credenciais de acesso provisórias geradas para o funcionário <strong className="text-slate-800">{formData.firstName}</strong>:
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">E-mail para Login</label>
                        <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-slate-200">
                          <Mail size={16} className="text-slate-400" />
                          <span className="flex-1 font-mono text-sm text-slate-700 font-black truncate">{generatedEmail}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(generatedEmail);
                              toast.success('Login copiado!');
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Senha Provisória</label>
                        <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-slate-200">
                          <Lock size={16} className="text-slate-400" />
                          <span className="flex-1 font-mono text-sm text-slate-700 font-black">{generatedPassword}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPassword);
                              toast.success('Senha copiada!');
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 text-blue-700 text-xs font-bold leading-relaxed rounded-2xl border border-blue-100 flex gap-2">
                    <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                    <p>Ao finalizar, as credenciais e o link de acesso <strong className="text-blue-800">Prostaff.com</strong> serão enviados automaticamente para o WhatsApp do funcionário.</p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setRegStep(1)} 
                      className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Voltar
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-12">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-md dark:shadow-black/50 transition-all group">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 dark:group-hover:bg-orange-500 group-hover:text-white transition-all">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">Inatividade</h3>
                <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium">+30 dias sem diarias</p>
              </div>
            </div>
            <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-[9px] md:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
              {inactiveEmployees.length} Alertas
            </span>
          </div>
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {inactiveEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-700">
                <CheckCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium italic">Tudo em dia!</p>
              </div>
            ) : (
              inactiveEmployees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900 hover:bg-white dark:hover:bg-black transition-all group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">
                      {emp.firstName[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{emp.firstName} {emp.lastName}</span>
                  </div>
                  <button 
                    onClick={() => sendInactivityWarning(emp)}
                    className="text-[10px] bg-white dark:bg-black text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white hover:border-orange-600 dark:hover:border-orange-500 transition-all shadow-sm"
                  >
                    Notificar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm hover:shadow-md dark:shadow-black/50 transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 dark:group-hover:bg-rose-500 group-hover:text-white transition-all">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Reclamações</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Críticas recorrentes</p>
              </div>
            </div>
            <span className="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
              {highComplaintEmployees.length} Críticos
            </span>
          </div>
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {highComplaintEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-700">
                <CheckCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium italic">Nenhuma queixa.</p>
              </div>
            ) : (
              highComplaintEmployees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 hover:bg-white dark:hover:bg-black transition-all group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 text-xs font-bold">
                      {emp.firstName[0]}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{emp.firstName} {emp.lastName}</span>
                  </div>
                  <span className="text-[10px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl font-bold border border-rose-100 dark:border-rose-900">
                    {emp.complaints} Queixas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/30 dark:bg-zinc-950/30 gap-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Base de Funcionários</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Buscar por nome, CPF ou tel..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:border-blue-600 outline-none transition-all text-slate-700 dark:text-slate-200"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total: {employees.length}
            </div>
            {searchTerm && (
              <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Encontrados: {filteredEmployees.length}
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-black border-b border-slate-100 dark:border-slate-800">
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Funcionário</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:table-cell">Documento</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:table-cell">Nascimento</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:table-cell">Performance</th>
                <th className="p-2 sm:p-4 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredEmployees.map(emp => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-[10px] sm:text-xs border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          emp.firstName[0]
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-[10px] sm:text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{emp.firstName} {emp.lastName}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-tight">{emp.phone}</p>
                          <span className={`text-[7px] px-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest ${emp.category === 'CONTRATADO' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'}`}>
                            {emp.category === 'CONTRATADO' ? 'CLT' : 'Diarista'}
                          </span>
                          {emp.profession && (
                            <span className="text-[7px] px-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest">
                              {emp.profession}
                            </span>
                          )}
                          {emp.eSocialUrl && (
                            <span className="text-[7px] px-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest flex items-center gap-0.5">
                              <FileText size={8} />
                              eSocial
                            </span>
                          )}
                        </div>
                        {emp.personalEmail && <p className="text-[8px] sm:text-[9px] text-blue-500 dark:text-blue-400 font-bold tracking-tight hidden sm:block">{emp.personalEmail}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tighter hidden sm:table-cell">{emp.cpf}</td>
                  <td className="p-2 sm:p-4 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">{formatDateBR(emp.birthDate)}</td>
                  <td className="p-2 sm:p-4 hidden md:table-cell">
                    <div className="flex gap-0.5 bg-slate-50 dark:bg-black w-fit px-2 py-1 rounded-lg border border-transparent dark:border-slate-800 transition-colors">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-800'} />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredEmployees.map(emp => (
            <div 
              key={emp.id} 
              className="p-4 space-y-4 active:bg-slate-50 transition-colors"
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
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.25rem] sm:rounded-[1.5rem] border-4 border-white bg-slate-100 overflow-hidden shadow-xl shrink-0 flex items-center justify-center">
                    {selectedEmployee.photoUrl ? (
                      <img src={selectedEmployee.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={48} className="text-slate-300" />
                    )}
                  </div>
                  <div className="pb-1 sm:pb-2 text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${selectedEmployee.category === 'CONTRATADO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {selectedEmployee.category === 'CONTRATADO' ? 'Contratado CLT' : 'Diarista'}
                      </span>
                      {selectedEmployee.profession && (
                        <span className="text-[8px] sm:text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {selectedEmployee.profession}
                        </span>
                      )}
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
                      <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Status Profissional</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={async () => {
                            await updateDocument('employees', selectedEmployee.id, { category: 'DIARISTA' });
                            setSelectedEmployee({ ...selectedEmployee, category: 'DIARISTA' });
                            toast.success('Categoria atualizada para Diarista');
                          }}
                          className={`text-[8px] sm:text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border transition-all ${selectedEmployee.category === 'DIARISTA' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                        >
                          Diarista
                        </button>
                        <button
                          onClick={async () => {
                            await updateDocument('employees', selectedEmployee.id, { category: 'CONTRATADO' });
                            setSelectedEmployee({ ...selectedEmployee, category: 'CONTRATADO' });
                            toast.success('Categoria atualizada para CLT');
                          }}
                          className={`text-[8px] sm:text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border transition-all ${selectedEmployee.category === 'CONTRATADO' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                        >
                          CLT
                        </button>
                      </div>

                      <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Profissão / Cargo</h4>
                      <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                        value={selectedEmployee.profession || ''}
                        onChange={async (e) => {
                          const newProf = e.target.value;
                          await updateDocument('employees', selectedEmployee.id, { profession: newProf });
                          setSelectedEmployee({ ...selectedEmployee, profession: newProf });
                          toast.success(`Profissão atualizada para ${newProf}`);
                        }}
                      >
                        <option value="">Selecione...</option>
                        {professions.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>

                    <div>
                      <h4 className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Documentação eSocial</h4>
                      {selectedEmployee.eSocialUrl ? (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = selectedEmployee.eSocialUrl!;
                              link.download = `eSocial_${selectedEmployee.firstName}_${selectedEmployee.lastName}`;
                              link.click();
                            }}
                            className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all font-bold text-xs"
                          >
                            <FileText size={16} />
                            Ver / Baixar eSocial
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm('Deseja remover este documento?')) {
                                await updateDocument('employees', selectedEmployee.id, { eSocialUrl: '' });
                                setSelectedEmployee({ ...selectedEmployee, eSocialUrl: '' });
                                toast.success('Documento removido');
                              }
                            }}
                            className="p-3 bg-white border border-rose-100 text-rose-400 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all">
                            <Upload size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Anexar eSocial</span>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,application/pdf"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  const url = reader.result as string;
                                  await updateDocument('employees', selectedEmployee.id, { eSocialUrl: url });
                                  setSelectedEmployee({ ...selectedEmployee, eSocialUrl: url });
                                  toast.success('eSocial anexado com sucesso!');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
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

function AccessFlow({ 
  checkins, 
  employees, 
  units, 
  companies, 
  clients,
  formatDateBR,
  forcedUnitId
}: { 
  checkins: CheckIn[], 
  employees: Employee[], 
  units: Unit[], 
  companies: Company[], 
  clients: Client[],
  formatDateBR: (date: string | Date) => string,
  forcedUnitId?: string
}) {
  const [filters, setFilters] = useState({
    companyId: '',
    unitId: forcedUnitId || '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    category: ''
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredCheckins = checkins.filter(ci => {
    const unit = units.find(u => u.id === ci.unitId);
    const emp = employees.find(e => e.id === ci.employeeId);
    const checkinDate = ci.timestamp.split('T')[0];

    if (filters.companyId && unit?.companyId !== filters.companyId) return false;
    if (filters.unitId && ci.unitId !== filters.unitId) return false;
    if (filters.startDate && checkinDate < filters.startDate) return false;
    if (filters.endDate && checkinDate > filters.endDate) return false;
    if (filters.category && emp?.category !== filters.category) return false;
    if (filters.searchTerm) {
      const fullName = `${emp?.firstName || ''} ${emp?.lastName || ''}`.toLowerCase();
      if (!fullName.includes(filters.searchTerm.toLowerCase())) return false;
    }

    return true;
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const exportToExcel = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const { saveAs } = await import('file-saver');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fluxo de Acesso');

      // Define columns
      worksheet.columns = [
        { header: 'Funcionário', key: 'employee', width: 35 },
        { header: 'Contato', key: 'contact', width: 20 },
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Entradas', key: 'entries', width: 25 },
        { header: 'Saídas', key: 'exits', width: 25 },
        { header: 'Unidade', key: 'unit', width: 35 },
      ];

      // Group checkins by employee and date
      const grouped = filteredCheckins.reduce((acc, ci) => {
        const date = ci.timestamp.split('T')[0];
        const key = `${ci.employeeId}_${date}_${ci.unitId}`;
        if (!acc[key]) {
          const emp = employees.find(e => e.id === ci.employeeId);
          const unit = units.find(u => u.id === ci.unitId);
          acc[key] = {
            employee: emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
            contact: emp?.phone || 'N/A',
            date: formatDateBR(date),
            entries: [],
            exits: [],
            unit: unit?.name || 'N/A'
          };
        }
        const time = new Date(ci.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (ci.type === 'IN' || ci.type === 'BREAK_END') acc[key].entries.push(time);
        else acc[key].exits.push(time);
        return acc;
      }, {} as Record<string, any>);

      // Add rows
      Object.values(grouped).forEach(data => {
        worksheet.addRow({
          ...data,
          entries: data.entries.sort().join(', '),
          exits: data.exits.sort().join(', ')
        });
      });

      // Apply styling: Centered, Borders, and Header styling
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (rowNumber === 1) {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF1E293B' } // slate-800
            };
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `fluxo_acesso_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao gerar o relatório Excel.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
            <Activity size={32} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Fluxo de Acesso</h2>
            <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1">Gestão de Entradas e Saídas</p>
          </div>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 group"
        >
          <FileSpreadsheet size={20} className="group-hover:rotate-12 transition-transform" /> 
          Relatório Excel
        </button>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Briefcase size={12} className="text-indigo-600" /> Tipo / Categoria
            </label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner cursor-pointer"
            >
              <option value="">Todos os Tipos</option>
              <option value="DIARISTA">Diarista</option>
              <option value="CONTRATADO">Funcionário / CLT</option>
            </select>
          </div>
          {!forcedUnitId && (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                  <Building2 size={12} className="text-blue-600" /> Empresa Parceira
                </label>
                <select 
                  value={filters.companyId}
                  onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner cursor-pointer"
                >
                  <option value="">Todas as Empresas</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                  <QrCode size={12} className="text-rose-600" /> Unidade
                </label>
                <select 
                  value={filters.unitId}
                  onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner cursor-pointer"
                >
                  <option value="">Todas as Unidades</option>
                  {units
                    .filter(u => !filters.companyId || u.companyId === filters.companyId)
                    .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Calendar size={12} className="text-emerald-600" /> Início
            </label>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Calendar size={12} className="text-emerald-600" /> Fim
            </label>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <div className="space-y-3 max-w-2xl mx-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Search size={12} className="text-blue-600" /> Pesquisar Nome do Profissional
            </label>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Digite o nome para filtrar a lista abaixo..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-base shadow-inner text-center sm:text-left"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {(() => {
          // Group by employeeId only
          const grouped = filteredCheckins.reduce((acc, ci) => {
            const key = ci.employeeId;
            if (!acc[key]) {
              acc[key] = {
                key,
                employeeId: ci.employeeId,
                punches: []
              };
            }
            acc[key].punches.push(ci);
            return acc;
          }, {} as Record<string, { key: string, employeeId: string, punches: CheckIn[] }>);

          // Sort professionals by their latest punch timestamp
          const finalGroups = Object.values(grouped).sort((a, b) => {
            const latestA = [...a.punches].sort((x, y) => y.timestamp.localeCompare(x.timestamp))[0].timestamp;
            const latestB = [...b.punches].sort((x, y) => y.timestamp.localeCompare(x.timestamp))[0].timestamp;
            return latestB.localeCompare(latestA);
          });

          if (finalGroups.length === 0) {
            return (
              <div className="bg-white rounded-[3rem] p-20 text-center space-y-4 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-200 ring-4 ring-emerald-50/50">
                  <Activity size={40} />
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Nenhum fluxo registrado para este período.</p>
              </div>
            );
          }

          return finalGroups.map(group => {
            const emp = employees.find(e => e.id === group.employeeId);
            const isExpanded = expandedRow === group.key;
            const sortedPunches = [...group.punches].sort((a,b) => b.timestamp.localeCompare(a.timestamp));

            return (
              <div key={group.key} className={`rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
                isExpanded 
                  ? 'bg-white shadow-2xl shadow-emerald-900/10 ring-2 ring-emerald-500/20' 
                  : 'bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-100'
              }`}>
                {/* Header Row */}
                <button 
                  onClick={() => setExpandedRow(isExpanded ? null : group.key)}
                  className={`w-full px-8 py-7 flex items-center justify-between transition-all text-left ${
                    isExpanded ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all ${
                        isExpanded ? 'border-emerald-500 shadow-lg scale-110' : 'border-white shadow-sm'
                      }`}>
                        {emp?.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
                            {emp?.firstName?.charAt(0) || 'P'}
                          </div>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-black uppercase tracking-tight leading-none mb-2 transition-all ${
                        isExpanded ? 'text-emerald-900 text-xl' : 'text-slate-900 text-lg'
                      }`}>
                        {emp ? `${emp.firstName} ${emp.lastName}` : 'N/A'}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                          {emp?.phone || 'PROFISSIONAL'}
                        </span>
                        {isExpanded && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1"
                          >
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            Visualizando Histórico
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total de Registros</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-600 leading-none">{group.punches.length}</span>
                        <div className="h-4 w-px bg-slate-100" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Punches</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                      isExpanded 
                        ? 'bg-emerald-600 text-white rotate-180 shadow-emerald-200' 
                        : 'bg-white text-slate-300 rotate-0'
                    }`}>
                      <ChevronDown size={22} />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-10">
                        <div className="overflow-hidden rounded-[2rem] border border-emerald-100/50 bg-white shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-emerald-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Data</th>
                                <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Horário</th>
                                <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Unidade</th>
                                <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Ponto de Acesso</th>
                                <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em] text-right">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50/30">
                              {sortedPunches.map((p, idx) => {
                                const unit = units.find(u => u.id === p.unitId);
                                const isEntry = p.type === 'IN';
                                return (
                                  <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={idx} 
                                    className="group/row hover:bg-emerald-50/20 transition-colors"
                                  >
                                    <td className="px-8 py-5">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                          {formatDateBR(p.timestamp.split('T')[0])}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                          Calendário
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-8 py-5">
                                      <span className="text-sm font-black text-emerald-600 tabular-nums bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
                                        {new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </span>
                                    </td>
                                    <td className="px-8 py-5">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                          {unit?.name || 'N/A'}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                          PROSTAFF UNIT
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-8 py-5">
                                      <div className="flex items-center gap-2 group-hover/row:translate-x-1 transition-transform">
                                        <div className="w-1 h-3 rounded-full bg-slate-200 group-hover/row:bg-emerald-500 transition-colors" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                          {p.isAdjustment ? 'Registro Manual / Sistema' : `Acesso Físico - Unidade ${unit?.name}`}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                      <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-sm transition-all group-hover/row:shadow-md ${
                                        p.type === 'IN' || p.type === 'BREAK_END' 
                                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                          : p.type === 'BREAK_START'
                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                            : 'bg-rose-600 text-white hover:bg-rose-700'
                                      }`}>
                                        {p.type === 'IN' ? (
                                          <>
                                            <ArrowDownLeft size={16} />
                                            <span>Entrada</span>
                                          </>
                                        ) : p.type === 'BREAK_START' ? (
                                          <>
                                            <ArrowUpRight size={16} />
                                            <span>S. Intervalo</span>
                                          </>
                                        ) : p.type === 'BREAK_END' ? (
                                          <>
                                            <ArrowDownLeft size={16} />
                                            <span>V. Intervalo</span>
                                          </>
                                        ) : (
                                          <>
                                            <ArrowUpRight size={16} />
                                            <span>Saída</span>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          });
        })()}
      </div>
    </motion.div>
  );
}

function AgencyStaffing({ user, employees, assignments, clients, getScaleValue, companyRequests, companies, units, agencyId, selectedAgencyId, checkins, agencies, initialSubTab = 'STAFFING' }: { user: any, employees: Employee[], assignments: Assignment[], clients: Client[], getScaleValue: (emp: Employee) => number, companyRequests: CompanyRequest[], companies: Company[], units: Unit[], agencyId: string | null, selectedAgencyId?: string | null, checkins: CheckIn[], agencies: Agency[], initialSubTab?: 'STAFFING' | 'CONFIRMED' | 'REQUESTS' | 'INCONSISTENCIES' }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [filterType, setFilterType] = useState<'RATING' | 'COMPLAINTS'>('RATING');
  const [professionFilter, setProfessionFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'STAFFING' | 'CONFIRMED' | 'REQUESTS' | 'INCONSISTENCIES'>(initialSubTab);

  // Modal capture states for attending requests
  const [attendModalOpen, setAttendModalOpen] = useState(false);
  const [requestForModal, setRequestForModal] = useState<CompanyRequest | null>(null);
  const [modalJobFunction, setModalJobFunction] = useState('');
  const [modalDailyRate, setModalDailyRate] = useState('');
  const [modalChannels, setModalChannels] = useState<string[]>(['IN_APP', 'PUSH', 'WHATSAPP']);

  React.useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [activeRequest, setActiveRequest] = useState<CompanyRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<CompanyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Map Modal State Definition
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapCompanyDetails, setMapCompanyDetails] = useState<{
    name: string;
    address: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [expandedInconsistencyEmpId, setExpandedInconsistencyEmpId] = useState<string | null>(null);
  const [selectedAssignmentForDetails, setSelectedAssignmentForDetails] = useState<Assignment | null>(null);
  const selectedAssignmentEmployee = selectedAssignmentForDetails ? employees.find(e => e.id === selectedAssignmentForDetails.employeeId) : null;

  const toggleCompany = (id: string) => {
    setExpandedCompanies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const confirmedAssignments = assignments.filter(a => a.confirmed && a.date >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Grouping logic for AgencyStaffing
  const groupedConfirmedByDate = confirmedAssignments.reduce((acc, as) => {
    const date = as.date;
    if (!acc[date]) acc[date] = { assignments: [], companies: {} };
    
    acc[date].assignments.push(as);
    
    const unit = units.find(u => u.clientId === as.clientId);
    const companyId = unit?.companyId || as.clientId;
    
    if (!acc[date].companies[companyId]) acc[date].companies[companyId] = [];
    acc[date].companies[companyId].push(as);
    
    return acc;
  }, {} as Record<string, { assignments: Assignment[], companies: Record<string, Assignment[]> }>);

  const getMatchScore = (emp: Employee, unit?: Unit) => {
    let score = emp.rating * 20; // 0-100
    score += emp.attendanceRate * 0.5; // 0-50
    if (emp.level === 'DIAMANTE') score += 20;
    else if (emp.level === 'OURO') score += 15;
    else if (emp.level === 'PRATA') score += 10;
    
    if (unit?.coordinates && emp.address?.coordinates) {
      const dist = calculateDistance(unit.coordinates.lat, unit.coordinates.lng, emp.address.coordinates.lat, emp.address.coordinates.lng);
      if (dist < 5000) score += 20; // < 5km
      else if (dist < 15000) score += 10; // < 15km
    }
    return score;
  };

  const targetAgencyId = selectedAgencyId || agencyId;
  const currentAgency = agencies.find(a => a.id === targetAgencyId);
  const agencyProfessions = Object.keys(currentAgency?.pricing?.professions || {});
  const professions = Array.from(new Set([
    ...(currentAgency?.segment || []),
    ...agencyProfessions,
    ...employees.filter(e => e.agencyId === targetAgencyId).map(e => e.profession).filter(Boolean) as string[]
  ])).sort();

  const sortedEmployees = [...employees]
    .filter(e => e.agencyId === targetAgencyId)
    .filter(e => e.status !== 'INACTIVE')
    .filter(e => (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(e => professionFilter === 'ALL' || e.profession === professionFilter)
    .sort((a, b) => {
      const unit = units.find(u => u.clientId === selectedClientId);
      const scoreA = getMatchScore(a, unit);
      const scoreB = getMatchScore(b, unit);
      
      if (selectedClientId) return scoreB - scoreA;
      if (filterType === 'RATING') return b.rating - a.rating;
      return a.complaints - b.complaints;
    });

  const handleApproveAdjustment = async (ci: CheckIn) => {
    try {
      await updateDocument('checkins', ci.id, { 
        status: 'APPROVED',
        approvedBy: user.uid,
        approvedAt: new Date().toISOString()
      });
      toast.success('Ajuste aprovado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao aprovar ajuste.');
    }
  };

  const handleRejectAdjustment = async (ci: CheckIn) => {
    try {
      await updateDocument('checkins', ci.id, { 
        status: 'REJECTED',
        approvedBy: user.uid,
        approvedAt: new Date().toISOString()
      });
      toast.success('Ajuste recusado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao recusar ajuste.');
    }
  };

  const formatBRL = (valStr: string) => {
    const digits = valStr.replace(/\D/g, '');
    if (!digits) return '';
    const numericValue = parseFloat(digits) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const parseBRLToFloat = (valStr: string) => {
    const digits = valStr.replace(/\D/g, '');
    if (!digits) return 0;
    return parseFloat(digits) / 100;
  };

  const handleAttendRequest = (req: CompanyRequest) => {
    setRequestForModal(req);
    setModalJobFunction(req.jobFunction || '');
    setModalDailyRate(req.dailyRate ? formatBRL(String(req.dailyRate * 100)) : '');
    setModalChannels(req.notificationChannels || ['IN_APP', 'PUSH', 'WHATSAPP']);
    setAttendModalOpen(true);
  };

  const confirmAttendRequest = async () => {
    if (!requestForModal) return;
    if (!modalJobFunction) {
      toast.error('Por favor, selecione a Função/Cargo.');
      return;
    }
    if (!modalDailyRate) {
      toast.error('Por favor, insira o valor da diária.');
      return;
    }

    const rateValue = parseBRLToFloat(modalDailyRate);
    if (rateValue <= 0) {
      toast.error('O valor da diária deve ser maior que zero.');
      return;
    }

    const loadId = toast.loading('Processando atendimento e divulgando vaga...');
    try {
      const targetAgencyId = selectedAgencyId || agencyId;
      const client = clients.find(c => c.id === requestForModal.clientId);
      const companyName = client?.name || 'Prostaff Cliente';
      const formattedDate = formatDateBR(requestForModal.date);
      const formattedRate = modalDailyRate;

      // 1. Update the Company Request document in Firestore
      await updateDocument('companyRequests', requestForModal.id, {
        status: 'EM_ATENDIMENTO',
        jobFunction: modalJobFunction,
        dailyRate: rateValue,
        notificationChannels: modalChannels,
        broadcasted: true
      });

      // 2. Identify employees to notify
      const activeEmployees = employees.filter(e => e.agencyId === targetAgencyId && e.status === 'ACTIVE');

      // 3. Send In-App notifications (Save to Firestore 'notifications' collection)
      if (modalChannels.includes('IN_APP')) {
        for (const emp of activeEmployees) {
          try {
            await createDocument('notifications', {
              userId: emp.id,
              title: `Oportunidade: ${modalJobFunction}`,
              message: `Vaga de trabalho para ${modalJobFunction} no dia ${formattedDate} na empresa ${companyName}. Diária de ${formattedRate}. Acesse o Prostaff para aceitar!`,
              type: 'ASSIGNMENT',
              read: false,
              createdAt: new Date().toISOString(),
              requestId: requestForModal.id,
              clientId: requestForModal.clientId
            });

            // Log notification creation
            await fetch('/api/log-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channel: 'IN_APP',
                title: `Oportunidade: ${modalJobFunction}`,
                message: `Vaga de trabalho para ${modalJobFunction} no dia ${formattedDate} na empresa ${companyName}. Diária de ${formattedRate}.`,
                employeeId: emp.id,
                agencyId: targetAgencyId,
                requestId: requestForModal.id
              })
            });
          } catch (e) {
            console.error('Error sending in-app notification', e);
          }
        }
      }

      // 4. Send Push Notifications via API
      if (modalChannels.includes('PUSH')) {
        try {
          await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Nova Vaga: ${modalJobFunction}`,
              body: `${companyName} precisa de profissional para o dia ${formattedDate}. Diária: ${formattedRate}.`,
              targetRoles: ['EMPLOYEE'],
              targetAgencyId: targetAgencyId
            })
          });

          // Log push notification
          for (const emp of activeEmployees) {
            await fetch('/api/log-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channel: 'PUSH',
                title: `Nova Vaga: ${modalJobFunction}`,
                message: `${companyName} precisa de profissional para o dia ${formattedDate}. Diária: ${formattedRate}.`,
                employeeId: emp.id,
                agencyId: targetAgencyId,
                requestId: requestForModal.id
              })
            });
          }
        } catch (e) {
          console.warn("Error sending push notification via API:", e);
        }
      }

      // 5. Send WhatsApp notifications via API
      if (modalChannels.includes('WHATSAPP')) {
        for (const emp of activeEmployees) {
          const cleanPhone = emp.phone ? emp.phone.replace(/\D/g, '') : '';
          if (cleanPhone) {
            try {
              const whatsappMsg = `Olá, ${emp.firstName}! Nova oportunidade de trabalho no Prostaff Brasil:\n\n🏢 Empresa/Cliente: *${companyName}*\n📅 Data: *${formattedDate}*\n💼 Função: *${modalJobFunction}*\n💰 Diária: *${formattedRate}*\n\n👉 Acesse o painel pelo site para aceitar a vaga!`;
              
              await fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone: cleanPhone,
                  message: whatsappMsg,
                  employeeId: emp.id,
                  agencyId: targetAgencyId,
                  requestId: requestForModal.id,
                  jobFunction: modalJobFunction,
                  dailyRate: rateValue
                })
              });
            } catch (error) {
              console.error('Error sending whatsapp notification', error);
            }
          }
        }
      }

      toast.success('Solicitação em atendimento! Notificações enviadas aos profissionais.', { id: loadId });
      
      // Set assignment states to immediately display the staffing visual screen
      const reqToStaff: CompanyRequest = {
        ...requestForModal,
        status: 'EM_ATENDIMENTO' as const,
        jobFunction: modalJobFunction,
        dailyRate: rateValue,
        notificationChannels: modalChannels,
        broadcasted: true
      };
      
      setActiveRequest(reqToStaff);
      setSelectedClientId(requestForModal.clientId);
      setSelectedDate(requestForModal.date);
      setActiveSubTab('STAFFING');
      
      // Reset modal state
      setAttendModalOpen(false);
      setRequestForModal(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao processar atendimento: ' + err.message, { id: loadId });
    }
  };

  const handleFinishRequest = async () => {
    if (activeRequest) {
      await updateDocument('companyRequests', activeRequest.id, { status: 'ACCEPTED' });
      setActiveRequest(null);
      toast.success('Solicitação finalizada com sucesso!');
    }
  };

  const handleRejectRequest = (req: CompanyRequest) => {
    setRejectingRequest(req);
    setRejectReason('');
  };

  const confirmRejectRequest = async () => {
    if (!rejectingRequest) return;
    if (rejectReason.trim() === '') {
      toast('É necessário informar um motivo para recusar a solicitação.');
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
    toast('Solicitação recusada e empresa notificada.');
  };

  const handleStaff = async (empId: string) => {
    if (!selectedClientId) {
      toast('Por favor, selecione um parceiro antes de escalar o funcionário.');
      return;
    }
    const emp = employees.find(e => e.id === empId);
    const client = clients.find(c => c.id === selectedClientId);
    if (!emp || !client) return;

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) return;

    const unit = units.find(u => u.clientId === selectedClientId);
    const companyId = unit?.companyId;

    const newAs: Omit<Assignment, 'id'> = {
      agencyId: targetAgencyId,
      companyId: companyId || '',
      employeeId: empId,
      clientId: selectedClientId,
      unitId: unit?.id,
      date: selectedDate,
      value: getScaleValue(emp),
      status: 'SCHEDULED',
      confirmed: false,
      paymentStatus: 'PENDING'
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

    // Notify Unit Manager
    if (unit) {
      await createDocument('notifications', {
        userId: 'UNIT_' + unit.id,
        agencyId: targetAgencyId,
        title: 'Profissional Confirmado',
        message: `O profissional ${emp.firstName} ${emp.lastName} foi escalado para a unidade ${unit.name} no dia ${formatDateBR(selectedDate)}.`,
        type: 'INFO',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
    
    // WhatsApp Notification with confirmation link
    const appUrl = window.location.origin;
    const confirmationLink = `${appUrl}?role=EMPLOYEE&tab=employee_profile`;
    const message = `Olá ${emp.firstName}! Você foi agendado para atuar na unidade ${client.name}.\n\n📅 Data: ${formatDateBR(selectedDate)}\n⏰ Horário: 08:00\n📍 Localização: ${client.location || client.name}\n\n✅ Por favor, confirme sua presença clicando no link abaixo:\n${confirmationLink}\n\n⚠️ Lembre-se: Há um QR Code na parede da unidade para você bater o ponto usando o app. Boa diaria!`;
    const whatsappUrl = `https://wa.me/55${emp.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast.success(`${emp.firstName} agendado com sucesso para o dia ${formatDateBR(selectedDate)}!`);
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
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md flex items-center justify-center bg-white">
                    {selectedAssignmentEmployee.photoUrl ? (
                      <img src={selectedAssignmentEmployee.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={24} className="text-slate-300" />
                    )}
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
                {(() => {
                  const dayCheckins = checkins.filter(ci => {
                    const isSameEmployee = ci.employeeId === selectedAssignmentForDetails.employeeId;
                    const ciDate = formatDateBR(ci.timestamp);
                    const assignmentDate = formatDateBR(selectedAssignmentForDetails.date);
                    const isSameDay = ciDate === assignmentDate;
                    
                    if (isSameEmployee && !isSameDay) {
                      console.log('Check-in found for employee but different day:', { ciDate, assignmentDate, ciTimestamp: ci.timestamp });
                    }
                    
                    return isSameEmployee && isSameDay;
                  });

                  if (dayCheckins.length > 0) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {dayCheckins
                          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                          .map((ci, idx) => (
                            <div key={ci.id || idx} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  ci.type === 'IN' || ci.type === 'BREAK_END' ? 'bg-emerald-100 text-emerald-600' : ci.type === 'BREAK_START' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {ci.type === 'IN' ? 'Entrada' : ci.type === 'BREAK_START' ? 'S. Intervalo' : ci.type === 'BREAK_END' ? 'V. Intervalo' : 'Saída'}
                                </div>
                                <span className="text-xs font-bold text-slate-400">
                                  {new Date(ci.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-200 shadow-inner border-2 border-white">
                                {ci.photoUrl ? (
                                  <img 
                                    src={ci.photoUrl} 
                                    alt={`Foto de ${ci.type}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Camera size={32} />
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-slate-500">
                                <MapPin size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                  {units.find(u => u.id === ci.unitId)?.name || 'Unidade não identificada'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  }

                  return (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Calendar size={32} />
                      </div>
                      <p className="text-slate-400 font-medium">Nenhum registro de ponto encontrado para este dia.</p>
                      <p className="text-[10px] text-slate-300 uppercase tracking-widest">
                        Data da Escala: {formatDateBR(selectedAssignmentForDetails.date)}
                      </p>
                    </div>
                  );
                })()}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Solicitação</h2>
          <p className="text-slate-500 font-medium text-[10px] sm:text-base">Distribua sua equipe com base em performance e disponibilidade.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl sm:rounded-[1.5rem] border border-slate-200 overflow-x-auto max-w-full no-scrollbar">
          <button 
            onClick={() => setActiveSubTab('STAFFING')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'STAFFING' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Agendar
          </button>
          <button 
            onClick={() => setActiveSubTab('CONFIRMED')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'CONFIRMED' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Confirmados
          </button>
          <button 
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'REQUESTS' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Pedidos
          </button>
          <button 
            onClick={() => setActiveSubTab('INCONSISTENCIES')}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'INCONSISTENCIES' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Inconsistência de Ponto
          </button>
        </div>
      </div>

      {activeSubTab === 'STAFFING' ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between h-full">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                  Data da Diaria
                </h3>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 sm:p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm h-[60px]"
                />
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">2</div>
                Selecionar Parceiro
              </h3>
              <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {clients
                  .filter(cli => units.some(u => u.clientId === cli.id))
                  .filter(cli => professionFilter === 'ALL' || units.some(u => u.clientId === cli.id && companies.find(c => c.id === u.companyId)?.services?.includes(professionFilter)))
                  .map(cli => (
                  <button 
                    key={cli.id}
                    onClick={() => setSelectedClientId(cli.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all border-2 ${
                      selectedClientId === cli.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' 
                        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-blue-100'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-black text-[10px] uppercase tracking-tight leading-tight">{cli.name}</p>
                    </div>
                    {selectedClientId === cli.id && <CheckCircle size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm w-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">3</div>
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

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm w-full flex flex-col justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">4</div>
                Tipo de Serviço
              </h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setProfessionFilter('ALL')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    professionFilter === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  Todos
                </button>
                {professions.map(p => (
                  <button 
                    key={p}
                    onClick={() => setProfessionFilter(p)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      professionFilter === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm relative">
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
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.25rem] bg-slate-100 overflow-hidden border-2 sm:border-4 border-white shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon size={24} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900 text-base sm:text-lg leading-tight">{emp.firstName}</p>
                          {emp.profession && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-100">{emp.profession}</span>
                          )}
                          {selectedClientId && getMatchScore(emp, units.find(u => u.clientId === selectedClientId)) > 80 && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-lg animate-pulse shrink-0">Smart Match</span>
                          )}
                        </div>
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
                      <p className="text-[9px] sm:text-[10px] text-blue-600 font-black uppercase tracking-widest">R$ {getScaleValue(emp)}</p>
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
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Profissionais Confirmados</h3>
              <p className="text-slate-400 text-[10px] sm:text-sm font-medium">Equipe que já confirmou presença para o dia selecionado.</p>
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
              {Object.entries(groupedConfirmedByDate).map(([date, dateData]) => {
                const isExpanded = expandedCompanies[date] === true;

                return (
                  <div key={date} className="space-y-6">
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleCompany(date)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCompany(date); }}
                      className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 px-2 py-4 sm:py-0 group/header cursor-pointer outline-none"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-10 h-10 rounded-xl ${isExpanded ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center border border-emerald-100 transition-all shrink-0`}>
                          <Building2 size={20} />
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase sm:max-w-none">{formatDateBR(date)}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dateData.assignments.length} Profissionais</p>
                        </div>
                      </div>
                      <div className="hidden sm:block flex-1 h-px bg-slate-100 mx-4"></div>
                      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const text = dateData.assignments
                                .map(a => {
                                  const emp = employees.find(e => e.id === a.employeeId);
                                  return emp ? `${emp.firstName} ${emp.lastName} - CPF: ${emp.cpf || 'N/A'}` : '';
                                })
                                .join('\n');
                              navigator.clipboard.writeText(text);
                              toast('Lista copiada!');
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 font-black uppercase tracking-widest text-[9px] hover:bg-blue-100 transition-all whitespace-nowrap"
                          >
                            Copiar
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const JSZip = (await import('jszip')).default;
                              const { saveAs } = await import('file-saver');
                              const zip = new JSZip();
                              
                              const promises = dateData.assignments.map(async (a) => {
                                const emp = employees.find(e => e.id === a.employeeId);
                                if (emp && emp.photoUrl) {
                                  try {
                                    const response = await fetch(emp.photoUrl);
                                    const blob = await response.blob();
                                    const fileName = `${emp.firstName}_${emp.lastName}_${emp.cpf || 'N_A'}.jpg`;
                                    zip.file(fileName, blob);
                                  } catch (e) {
                                    console.error('Error fetching photo:', e);
                                  }
                                }
                              });
                              
                              await Promise.all(promises);
                              const content = await zip.generateAsync({ type: 'blob' });
                              saveAs(content, `fotos_diaristas_${formatDateBR(date).replace(/\s+/g, '_')}.zip`);
                            }}
                            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 transition-all whitespace-nowrap"
                          >
                            Fotos
                          </button>
                        </div>
                        <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/header:bg-blue-50 group-hover/header:text-blue-600 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-8 pl-4 border-l-2 border-slate-100 ml-6"
                        >
                          {Object.entries(dateData.companies).map(([companyId, companyAssignments]) => {
                            const company = companies.find(c => c.id === companyId);
                            const client = clients.find(c => c.id === companyId);
                            const companyName = company?.name || client?.name || 'Empresa não identificada';

                            return (
                              <div key={companyId} className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                  <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">{companyName}</h5>
                                  <span className="text-[10px] font-bold text-slate-400">({companyAssignments.length})</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                  {companyAssignments.map(as => {
                                    const emp = employees.find(e => e.id === as.employeeId);
                                    if (!emp) return null;

                                    const empCi = checkins.filter(ci => ci.employeeId === as.employeeId && formatDateBR(ci.timestamp) === formatDateBR(as.date));
                                    const dayPunches = [...empCi].sort((a,b) => a.timestamp.localeCompare(b.timestamp));

                                    return (
                                      <button 
                                        key={as.id} 
                                        onClick={() => setSelectedAssignmentForDetails(as)}
                                        className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left group"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-white shrink-0">
                                            {emp.photoUrl ? (
                                              <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <UserIcon size={20} className="text-slate-300" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                                              {emp.firstName} {emp.lastName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[9px] font-black text-slate-400">CPF: {emp.cpf || 'N/A'}</span>
                                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{emp.phone}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 sm:gap-8">
                                          <div className="hidden md:flex flex-col items-end">
                                            {dayPunches.length === 0 ? (
                                              <span className="text-[10px] text-slate-300 font-black uppercase">Sem registros</span>
                                            ) : (
                                              <div className="flex gap-2">
                                                {dayPunches.map((p, pidx) => (
                                                  <span key={pidx} className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${
                                                    p.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                  }`}>
                                                    {new Date(p.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-3">
                                            {dayPunches.length === 1 && (
                                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                                                <AlertCircle size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Incompleto</span>
                                              </div>
                                            )}
                                            {dayPunches.length >= 2 && (
                                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                                                <CheckCircle size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Presente</span>
                                              </div>
                                            )}
                                            {dayPunches.length === 0 && (
                                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg border border-slate-200">
                                                <Clock size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Aguardando</span>
                                              </div>
                                            )}
                                            <div className="p-2 bg-white rounded-xl text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                              <ChevronRight size={16} />
                                            </div>
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
      ) : activeSubTab === 'INCONSISTENCIES' ? (
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm space-y-12">
          {/* Section for Manual Adjustments pending approval */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Solicitações de Ajuste</h3>
                <p className="text-slate-400 text-[9px] sm:text-xs font-black uppercase tracking-widest">Colaboradores solicitando correção de ponto manual</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {(() => {
                const pendingAdjustments = checkins.filter(ci => ci.isAdjustment && ci.status === 'PENDING');
                const groupedByEmployee = pendingAdjustments.reduce((acc, ci) => {
                  if (!acc[ci.employeeId]) acc[ci.employeeId] = [];
                  acc[ci.employeeId].push(ci);
                  return acc;
                }, {} as Record<string, CheckIn[]>);

                const employeeIds = Object.keys(groupedByEmployee);

                if (employeeIds.length === 0) {
                  return (
                    <div className="col-span-full py-10 text-center font-bold text-slate-300 italic">
                      Nenhuma solicitação de ajuste pendente.
                    </div>
                  );
                }

                return employeeIds.map(empId => {
                  const emp = employees.find(e => e.id === empId);
                  const items = groupedByEmployee[empId];
                  return (
                    <div key={empId} className="p-6 sm:p-8 bg-white rounded-[2rem] border border-slate-200 space-y-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                          {emp?.photoUrl ? (
                            <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={24} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{items.length} {items.length === 1 ? 'Solicitação' : 'Solicitações'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {items.map(ci => {
                          const unit = units.find(u => u.id === ci.unitId);
                          return (
                            <div key={ci.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                                      ci.type === 'IN' || ci.type === 'BREAK_END' ? 'bg-emerald-50 text-emerald-600' : ci.type === 'BREAK_START' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                      Aju. {ci.type === 'IN' ? 'Entrada' : ci.type === 'BREAK_START' ? 'Saída Int.' : ci.type === 'BREAK_END' ? 'Volta Int.' : 'Saída'}
                                    </span>
                                    <span className="font-black text-slate-900 text-sm">{formatTime(ci.timestamp)} - {formatDateBR(ci.timestamp)}</span>
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unit?.name}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleApproveAdjustment(ci)}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-700 transition-all active:scale-95"
                                  >
                                    Aprovar
                                  </button>
                                  <button 
                                    onClick={() => handleRejectAdjustment(ci)}
                                    className="px-6 py-2.5 bg-white text-rose-600 border border-rose-100 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-50 transition-all active:scale-95"
                                  >
                                    Recusar
                                  </button>
                                </div>
                              </div>
                              {ci.adjustmentReason && (
                                <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                                  <p className="text-xs text-slate-600 italic">" {ci.adjustmentReason} "</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Inconsistências de Ponto</h3>
                <p className="text-slate-400 text-[10px] sm:text-sm font-medium">Escalações com registros incompletos (apenas entrada ou apenas saída).</p>
              </div>
              <div className="px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100 w-fit">
                <span className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest">
                  Ações Necessárias
                </span>
              </div>
            </div>

            <div className="space-y-6">
            {(() => {
              const currentAgencyIdValue = selectedAgencyId || agencyId;
              const inconsistenciesByEmployee = assignments
                .filter(as => as.agencyId === currentAgencyIdValue)
                .reduce((acc, as) => {
                  const dayCi = checkins.filter(ci => 
                    ci.employeeId === as.employeeId && 
                    formatDateBR(ci.timestamp) === formatDateBR(as.date)
                  );
                  if (dayCi.length === 1) {
                    if (!acc[as.employeeId]) acc[as.employeeId] = [];
                    acc[as.employeeId].push({ as, ci: dayCi[0] });
                  }
                  return acc;
                }, {} as Record<string, { as: Assignment, ci: CheckIn }[]>);

              const employeeIds = Object.keys(inconsistenciesByEmployee);

              if (employeeIds.length === 0) {
                return (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <CheckCircle size={40} />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhuma inconsistência detectada no momento.</p>
                  </div>
                );
              }

              return employeeIds.map(empId => {
                const emp = employees.find(e => e.id === empId);
                const incidents = inconsistenciesByEmployee[empId].sort((a, b) => new Date(b.as.date).getTime() - new Date(a.as.date).getTime());
                const isExpanded = expandedInconsistencyEmpId === empId;

                return (
                  <div key={empId} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm transition-all mb-4 last:mb-0">
                    <button 
                      onClick={() => setExpandedInconsistencyEmpId(isExpanded ? null : empId)}
                      className="w-full p-6 sm:p-8 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-slate-100 shrink-0">
                          {emp?.photoUrl ? (
                            <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon size={24} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{emp?.firstName} {emp?.lastName}</h4>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 mt-1">
                            {incidents.length} {incidents.length === 1 ? 'Inconsistência' : 'Inconsistências'} detectada(s)
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl transition-all ${isExpanded ? 'bg-slate-900 text-white shadow-lg rotate-180' : 'bg-slate-100 text-slate-400 rotate-0'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-slate-800"
                        >
                          <div className="p-4 sm:p-8 space-y-6">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 sm:p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Horário / Data</th>
                                    <th className="p-4 sm:p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unidade</th>
                                    <th className="p-4 sm:p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Operação</th>
                                    <th className="p-4 sm:p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Ações</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {incidents.map((inc, idx) => {
                                    const client = clients.find(c => c.id === inc.as.clientId);
                                    return (
                                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4 sm:p-6">
                                          <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white text-sm">{new Date(inc.ci.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{formatDateBR(inc.as.date)}</span>
                                          </div>
                                        </td>
                                        <td className="p-4 sm:p-6">
                                          <p className="font-black text-slate-900 dark:text-white text-sm">{client?.name}</p>
                                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID: {inc.ci.unitId}</p>
                                        </td>
                                        <td className="p-4 sm:p-6 text-center">
                                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${
                                            inc.ci.type === 'IN' || inc.ci.type === 'BREAK_END' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : inc.ci.type === 'BREAK_START' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                                          }`}>
                                            {inc.ci.type === 'IN' ? 'Entrada' : inc.ci.type === 'BREAK_START' ? 'S. Intervalo' : inc.ci.type === 'BREAK_END' ? 'V. Intervalo' : 'Saída'}
                                          </span>
                                        </td>
                                        <td className="p-4 sm:p-6 text-center">
                                          <button 
                                            onClick={() => {
                                              const message = `Olá ${emp?.firstName}! Notamos que seu ponto do dia ${formatDateBR(inc.as.date)} está incompleto. Por favor, acesse o app e solicite o ajuste do ponto para que possamos processar seu pagamento.`;
                                              const whatsappUrl = `https://wa.me/55${emp?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                                              window.open(whatsappUrl, '_blank');
                                            }}
                                            className="px-4 py-2.5 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mx-auto"
                                          >
                                            <AlertTriangle size={14} />
                                            Solicitar Ajuste
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Solicitações das Empresas</h3>
              <p className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-xs font-black uppercase tracking-widest">Pedidos de profissionais para datas específicas</p>
            </div>
          </div>

          <div className="space-y-6">
            {companyRequests.filter(req => req.status === 'PENDING' || req.status === 'EM_ATENDIMENTO').map(req => {
              const client = clients.find(c => c.id === req.clientId);
              const isEmAtendimento = req.status === 'EM_ATENDIMENTO';
              return (
                <div key={req.id} className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-colors">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-black rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{client?.name}</h4>
                        {isEmAtendimento && (
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-lg text-[8px] font-black uppercase tracking-wider">
                            Em Atendimento
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Calendar size={12} /> {formatDateBR(req.date)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Users size={12} /> {req.quantity} Profissionais
                        </span>
                        {req.jobFunction && (
                          <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Cargo: {req.jobFunction}
                          </span>
                        )}
                        {req.dailyRate !== undefined && req.dailyRate !== null && (
                          <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Diária: R$ {req.dailyRate.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex -space-x-3">
                      {req.employeeIds.map(empId => {
                        const emp = employees.find(e => e.id === empId);
                        return (
                          <div key={empId} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-slate-200 flex items-center justify-center" title={emp?.firstName}>
                            {emp?.photoUrl ? (
                              <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserIcon size={16} className="text-slate-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleAttendRequest(req)}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-white rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] h-[48px] hover:shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                          isEmAtendimento ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                      >
                        {isEmAtendimento ? 'Ajustar Vaga' : 'Atender'}
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(req)}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] h-[48px] hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-150 transition-all active:scale-95 flex items-center justify-center"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {companyRequests.filter(req => req.status === 'PENDING' || req.status === 'EM_ATENDIMENTO').length === 0 && (
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

        {attendModalOpen && requestForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setAttendModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Atender Solicitação</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">Configurar diária e canais de comunicação</p>
                  </div>
                  <button 
                    onClick={() => setAttendModalOpen(false)}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>Empresa/Cliente:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">{clients.find(c => c.id === requestForModal.clientId)?.name || 'Cliente'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>Data da Vaga:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">{formatDateBR(requestForModal.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>Quantidade Solicitada:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">{requestForModal.quantity} {requestForModal.quantity === 1 ? 'Profissional' : 'Profissionais'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-2">Função / Cargo <span className="text-rose-500">*</span></label>
                    <select
                      value={modalJobFunction}
                      onChange={(e) => setModalJobFunction(e.target.value)}
                      required
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-950 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 text-sm transition-all h-[52px]"
                    >
                      <option value="">Selecione a profissão/cargo...</option>
                      {(professions.length > 0 ? professions : ['Logística', 'Segurança', 'Limpeza', 'Eventos', 'Administração', 'Copa/Cozinha', 'Portaria', 'Recepcionista', 'Outros']).map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-2">Valor da Diária (R$) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={modalDailyRate}
                      onChange={(e) => setModalDailyRate(formatBRL(e.target.value))}
                      placeholder="Ex: R$ 150,00"
                      required
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-950 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 text-sm transition-all h-[52px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-2 mb-2">Canais de Notificação</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'IN_APP', label: 'In-App', desc: 'Painel Interno' },
                        { id: 'PUSH', label: 'Push', desc: 'Navegador' },
                        { id: 'WHATSAPP', label: 'WhatsApp', desc: 'WhatsApp Direto' }
                      ].map(ch => {
                        const isSelected = modalChannels.includes(ch.id);
                        return (
                          <button
                            type="button"
                            key={ch.id}
                            onClick={() => {
                              if (isSelected) {
                                setModalChannels(prev => prev.filter(item => item !== ch.id));
                              } else {
                                setModalChannels(prev => [...prev, ch.id]);
                              }
                            }}
                            className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer h-24 ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' 
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xs font-black uppercase tracking-wider">{ch.label}</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1">{ch.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setAttendModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all h-[52px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmAttendRequest}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 h-[52px]"
                  >
                    Avançar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {mapModalOpen && mapCompanyDetails && (
          <MapViewerModal
            isOpen={mapModalOpen}
            onClose={() => setMapModalOpen(false)}
            companyName={mapCompanyDetails.name}
            address={mapCompanyDetails.address}
            phone={mapCompanyDetails.phone}
            email={mapCompanyDetails.email}
            latitude={mapCompanyDetails.latitude}
            longitude={mapCompanyDetails.longitude}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgencyPricing({ pricing, ratingLabel, setPricing, setRatingLabel, agencyId, selectedAgencyId }: { pricing: PricingConfig, ratingLabel: string, setPricing: (p: PricingConfig) => void, setRatingLabel: (l: string) => void, agencyId: string | null, selectedAgencyId?: string | null }) {
  const [localPricing, setLocalPricing] = useState<PricingConfig>(pricing);
  const [localLabel, setLocalLabel] = useState(ratingLabel);
  const [selectedProfession, setSelectedProfession] = useState<string>(Object.keys(pricing.professions || {})[0] || '');
  const [isAddingProfession, setIsAddingProfession] = useState(false);
  const [newProfessionName, setNewProfessionName] = useState('');

  const targetPricing = selectedProfession 
    ? (localPricing.professions?.[selectedProfession] || {
        type: localPricing.type || 'STARS',
        stars: localPricing.stars ? { ...localPricing.stars } : { '1': { employee: 0, company: 0 }, '2': { employee: 0, company: 0 }, '3': { employee: 0, company: 0 }, '4': { employee: 0, company: 0 }, '5': { employee: 0, company: 0 } },
        weekly: localPricing.weekly ? { ...localPricing.weekly } : {}
      })
    : null;

  const updateTargetPricing = (updater: (prev: typeof targetPricing) => typeof targetPricing) => {
    if (!selectedProfession || !targetPricing) return;
    setLocalPricing(prev => {
      const currentProfessions = prev.professions || {};
      const currentTarget = currentProfessions[selectedProfession] || {
        type: prev.type || 'STARS',
        stars: prev.stars ? JSON.parse(JSON.stringify(prev.stars)) : {},
        weekly: prev.weekly ? JSON.parse(JSON.stringify(prev.weekly)) : {}
      };
      const result = updater(currentTarget);
      return {
        ...prev,
        professions: {
          ...currentProfessions,
          [selectedProfession]: result
        }
      };
    });
  };

  const handleAddProfession = () => {
    if (!newProfessionName.trim()) return;
    const name = newProfessionName.trim();
    setLocalPricing(prev => ({
      ...prev,
      professions: {
        ...(prev.professions || {}),
        [name]: {
          type: prev.type,
          stars: JSON.parse(JSON.stringify(prev.stars)),
          weekly: JSON.parse(JSON.stringify(prev.weekly))
        }
      }
    }));
    setSelectedProfession(name);
    setNewProfessionName('');
    setIsAddingProfession(false);
  };

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
    toast.success('Configurações salvas com sucesso!');
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
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <CheckCircle size={18} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center overflow-x-auto custom-scrollbar">
        <div className="flex gap-2">
          {Object.keys(localPricing.professions || {}).map(prof => (
            <button 
              key={prof}
              onClick={() => setSelectedProfession(prof)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${selectedProfession === prof ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <Briefcase size={14} />
              {prof}
            </button>
          ))}
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>
        
        {!isAddingProfession ? (
          <button 
            onClick={() => setIsAddingProfession(true)}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center gap-2"
          >
            <Plus size={14} />
            Nova Função
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Ex: Vigilante"
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 w-full sm:w-48"
              value={newProfessionName}
              onChange={e => setNewProfessionName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddProfession()}
              autoFocus
            />
            <button onClick={handleAddProfession} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <CheckCircle2 size={18} />
            </button>
            <button onClick={() => setIsAddingProfession(false)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {selectedProfession && targetPricing && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                {targetPricing.type === 'STARS' ? <Star size={20} /> : <Calendar size={20} />}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {targetPricing.type === 'STARS' ? `Valores por ${localLabel}` : 'Valores por Dia da Semana'}
              </h3>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner w-full relative z-10">
            <button 
              onClick={() => updateTargetPricing(prev => ({ ...prev, type: 'STARS' }))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${targetPricing.type === 'STARS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Por {localLabel}
              <div className="group/tooltip relative">
                <HelpCircle size={14} className={`${targetPricing.type === 'STARS' ? 'text-blue-400 hover:text-blue-600' : 'text-slate-400 hover:text-slate-600'} transition-colors`} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-900 text-[10px] text-white font-medium normal-case rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none text-center leading-tight">
                  Valores variam conforme a qualificação ({localLabel}) do funcionário.
                </div>
              </div>
            </button>
            <button 
              onClick={() => updateTargetPricing(prev => ({ ...prev, type: 'DAILY' }))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${targetPricing.type === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Por Dia
              <div className="group/tooltip relative">
                <HelpCircle size={14} className={`${targetPricing.type === 'DAILY' ? 'text-blue-400 hover:text-blue-600' : 'text-slate-400 hover:text-slate-600'} transition-colors`} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-900 text-[10px] text-white font-medium normal-case rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none text-center leading-tight">
                  Valores fixos baseados no dia da semana do serviço.
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {targetPricing.type === 'STARS' ? (
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
                          value={targetPricing.stars?.[stars]?.employee || 0}
                          onChange={e => {
                            updateTargetPricing(prev => {
                              const newStars = { ...(prev.stars || {}) };
                              newStars[stars] = { ...newStars[stars], employee: Number(e.target.value) };
                              return { ...prev, stars: newStars };
                            });
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
                          value={targetPricing.stars?.[stars]?.company || 0}
                          onChange={e => {
                            updateTargetPricing(prev => {
                              const newStars = { ...(prev.stars || {}) };
                              newStars[stars] = { ...newStars[stars], company: Number(e.target.value) };
                              return { ...prev, stars: newStars };
                            });
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
                          value={targetPricing.weekly?.[day]?.employee || 0}
                          onChange={e => {
                            updateTargetPricing(prev => {
                              const newWeekly = { ...(prev.weekly || {}) };
                              newWeekly[day] = { ...newWeekly[day], employee: Number(e.target.value) };
                              return { ...prev, weekly: newWeekly };
                            });
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
                          value={targetPricing.weekly?.[day]?.company || 0}
                          onChange={e => {
                            updateTargetPricing(prev => {
                              const newWeekly = { ...(prev.weekly || {}) };
                              newWeekly[day] = { ...newWeekly[day], company: Number(e.target.value) };
                              return { ...prev, weekly: newWeekly };
                            });
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
      )}
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
  const [showServicesModal, setShowServicesModal] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    responsibleName: '',
    cnpj: '',
    phone: '',
    email: '',
    address: '',
    paymentDay: '',
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
  const targetAgencyIdForProfessions = selectedAgencyId || agencyId;
  const currentAgencyForProfessions = agencies.find(a => a.id === targetAgencyIdForProfessions);
  const agencyProfessions2 = Object.keys(currentAgencyForProfessions?.pricing?.professions || {});
  const professions = Array.from(new Set([
    ...(currentAgencyForProfessions?.segment || []),
    ...agencyProfessions2,
    ...employees.filter(e => e.agencyId === targetAgencyIdForProfessions).map(e => e.profession).filter(Boolean) as string[]
  ])).sort();

  const [userData, setUserData] = useState({
    fullName: '',
    unitId: '',
    password: '',
    confirmPassword: ''
  });

  const handleSendRegistrationLink = (company: Company) => {
    const link = `${window.location.origin}?role=COMPANY_REGISTRATION&companyId=${company.id}`;
    const message = `Olá ${company.responsibleName}! Aqui está o link para completar o cadastro da sua empresa no portal ProStaff Brasil: ${link}`;
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

  const handleUpdateServices = async (company: Company, newServices: string[]) => {
    try {
      await updateDocument('companies', company.id, { services: newServices });
      setShowServicesModal(null);
      toast.success('Serviços atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating services:', error);
      toast.error('Erro ao atualizar serviços.');
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: 'ACTIVE' | 'PENDING' | 'BLOCKED') => {
    try {
      await updateDocument('companyUsers', userId, { status });
      await updateDocument('users', userId, { status });
      const message = status === 'ACTIVE' ? 'Usuário liberado com sucesso!' : 'Status atualizado com sucesso!';
      toast(message);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Erro ao atualizar status do usuário.');
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast('As senhas não coincidem!');
      return;
    }

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      toast('Selecione uma agência para gerenciar antes de adicionar uma empresa.');
      return;
    }

    // Check limits
    const agency = agencies.find(a => a.id === targetAgencyId);
    if (agency && agency.maxCompanies !== undefined && agency.maxCompanies !== null) {
      const currentCompanies = companies.length;
      if (currentCompanies >= agency.maxCompanies) {
        toast(`Limite de empresas atingido (${agency.maxCompanies}). Entre em contato com o administrador para aumentar o limite.`);
        return;
      }
    }

    const companyId = crypto.randomUUID();
    const newCompany: Company = {
      id: companyId,
      ...formData,
      agencyId: targetAgencyId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    await setDocument('companies', companyId, newCompany);

    // If password provided, create the user documents
    if (formData.password) {
      // Create Firebase Auth user via secondary app
      const newUid = await createNewUser(formData.email, formData.password);
      
      const newUser: Omit<CompanyUser, 'id' | 'password'> = {
        agencyId: targetAgencyId,
        companyId: companyId,
        fullName: formData.responsibleName,
        email: formData.email,
        role: 'COMPANY',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      await setDocument('companyUsers', newUid, { ...newUser, id: newUid });
      
      await setDocument('users', newUid, {
        id: newUid,
        role: 'COMPANY',
        companyId: companyId,
        agencyId: targetAgencyId,
        email: formData.email,
        fullName: formData.responsibleName,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    setShowAddModal(false);
    setFormData({ name: '', responsibleName: '', cnpj: '', phone: '', email: '', address: '', paymentDay: '', password: '', confirmPassword: '' });
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
      address: formData.address,
      paymentDay: formData.paymentDay
    });
    setShowEditCompanyModal(null);
    setFormData({ name: '', responsibleName: '', cnpj: '', phone: '', email: '', address: '', paymentDay: '' });
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUnitModal) return;
    if (unitData.password !== unitData.confirmPassword) {
      toast('As senhas não coincidem!');
      return;
    }
    const company = companies.find(c => c.id === showUnitModal);
    if (!company) return;

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      toast('Agência não identificada.');
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
      // Create Firebase Auth user via secondary app
      const newUid = await createNewUser(unitData.login, unitData.password);
      
      const newUser: Omit<CompanyUser, 'password'> = {
        id: newUid,
        agencyId: targetAgencyId,
        companyId: showUnitModal,
        unitId: unitId,
        fullName: unitData.managerName,
        email: unitData.login,
        role: 'COMPANY',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      await setDocument('companyUsers', newUid, newUser);

      await setDocument('users', newUid, {
        id: newUid,
        role: 'COMPANY',
        companyId: showUnitModal,
        agencyId: targetAgencyId,
        email: unitData.login,
        fullName: unitData.managerName,
        status: 'ACTIVE',
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
      toast('As senhas não coincidem!');
      return;
    }
    const company = companies.find(c => c.id === showUserModal);
    if (!company) return;

    const targetAgencyId = selectedAgencyId || agencyId;
    if (!targetAgencyId) {
      toast('Agência não identificada.');
      return;
    }

    const domain = company.name.toLowerCase().replace(/\s+/g, '') + '.com';
    const login = `${userData.fullName.toLowerCase().replace(/\s+/g, '.')}@${domain}`;

    // Create Firebase Auth user via secondary app
    const newUid = await createNewUser(login, userData.password);

    const newUser: Omit<CompanyUser, 'password'> = {
      id: newUid,
      agencyId: targetAgencyId,
      companyId: showUserModal,
      unitId: userData.unitId!,
      fullName: userData.fullName,
      email: login,
      role: 'COMPANY',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    await setDocument('companyUsers', newUid, newUser);
    
    await setDocument('users', newUid, {
      id: newUid,
      role: 'COMPANY',
      companyId: showUserModal,
      agencyId: targetAgencyId,
      email: login,
      fullName: userData.fullName,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });
    
    const message = `Olá ${userData.fullName}! Seu acesso ao portal ProStaff Brasil foi criado.\n\n📧 Login: ${login}\n🔑 Senha: ${userData.password}\n\nAcesse agora: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/55${company.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setShowUserModal(null);
    setUserData({ fullName: '', unitId: '', password: '', confirmPassword: '' });
    toast.success(`Usuário criado com sucesso!\nLogin: ${login}`);
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                          (company.cnpj && company.cnpj.includes(debouncedSearchTerm));
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

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 sm:gap-8 place-items-stretch">
        {filteredCompanies.map(company => (
          <div key={company.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden w-full max-w-[642px] mx-auto">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 transition-all group-hover:scale-150"></div>
            
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8 relative z-10 w-full">
              <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-[280px]">
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
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-50/80 rounded-[2rem] border border-slate-100/80 shadow-inner shrink-0 flex-nowrap">
                  {company.status === 'PENDING' && (
                    <button 
                      onClick={() => handleUpdateCompanyStatus(company.id, 'ACTIVE')}
                      className="p-2 sm:p-2.5 text-emerald-600 hover:bg-white hover:shadow-md rounded-full transition-all shrink-0"
                      title="Aprovar Empresa"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {company.status === 'ACTIVE' && (
                    <button 
                      onClick={() => handleUpdateCompanyStatus(company.id, 'BLOCKED')}
                      className="p-2 sm:p-2.5 text-rose-600 hover:bg-white hover:shadow-md rounded-full transition-all shrink-0"
                      title="Bloquear Empresa"
                    >
                      <Lock size={18} />
                    </button>
                  )}
                  {company.status === 'BLOCKED' && (
                    <button 
                      onClick={() => handleUpdateCompanyStatus(company.id, 'ACTIVE')}
                      className="p-2 sm:p-2.5 text-emerald-600 hover:bg-white hover:shadow-md rounded-full transition-all shrink-0"
                      title="Desbloquear Empresa"
                    >
                      <Unlock size={18} />
                    </button>
                  )}
                  {(company.status === 'PENDING' || company.status === 'ACTIVE' || company.status === 'BLOCKED') && (
                    <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
                  )}
                  <button 
                    onClick={() => setShowDetailsModal(company)}
                    className="p-2 sm:p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-full transition-all shrink-0"
                    title="Ver Detalhes"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => setShowServicesModal(company)}
                    className={`p-2 sm:p-2.5 rounded-full transition-all shrink-0 relative group/btn ${company.services?.length ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md'}`}
                    title="Meus Serviços"
                  >
                    <Briefcase size={18} />
                    {company.services && company.services.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white pointer-events-none shadow-sm">{company.services.length}</span>
                    )}
                  </button>
                  <button 
                    onClick={() => setShowUserModal(company.id)}
                    className="p-2 sm:p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-full transition-all shrink-0"
                    title="Criar Acesso"
                  >
                    <UserPlus size={18} />
                  </button>
                  <button 
                    onClick={() => handleSendRegistrationLink(company)}
                    className="p-2 sm:p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-full transition-all shrink-0"
                    title="Enviar Link de Cadastro"
                  >
                    <LinkIcon size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button 
                    onClick={() => setShowUnitModal(company.id)}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm hover:shadow-md rounded-full transition-all shrink-0"
                    title="Adicionar Unidade"
                  >
                    <Plus size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({
                        name: company.name,
                        responsibleName: company.responsibleName,
                        cnpj: company.cnpj,
                        phone: company.phone,
                        email: company.email,
                        address: company.address || '',
                        paymentDay: company.paymentDay || ''
                      });
                      setShowEditCompanyModal(company);
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm hover:shadow-md rounded-full transition-all shrink-0"
                    title="Editar Empresa"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteCompanyConfirm(company.id)}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-slate-400 hover:text-rose-600 border border-slate-100 shadow-sm hover:shadow-md rounded-full transition-all shrink-0"
                    title="Excluir Empresa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
                          <p className="text-xs sm:text-sm font-bold text-slate-700">{unit.name}</p>
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
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Dia do Pagamento (Ex: Todo dia 05)</label>
                  <input type="text" value={formData.paymentDay} onChange={e => setFormData({...formData, paymentDay: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Ex: Todo dia 05" />
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
            className="bg-white dark:bg-black rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800 transition-colors"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 transition-colors">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Detalhes da Empresa</h3>
              <button 
                onClick={() => setShowDetailsModal(null)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl transition-colors border border-transparent dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Nome</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{showDetailsModal.name}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl transition-colors border border-transparent dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">CNPJ</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{showDetailsModal.cnpj || 'Não informado'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl transition-colors border border-transparent dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Responsável</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{showDetailsModal.responsibleName}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl transition-colors border border-transparent dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Contato</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{showDetailsModal.phone}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl transition-colors border border-transparent dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{showDetailsModal.email}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl transition-colors border border-transparent dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Endereço</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{showDetailsModal.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Documentos</h4>
                {showDetailsModal.documents && showDetailsModal.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showDetailsModal.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{doc.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              doc.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                              doc.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' :
                              'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              {doc.status === 'APPROVED' ? 'APROVADO' : doc.status === 'REJECTED' ? 'REPROVADO' : 'PENDENTE'}
                            </span>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
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
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Usuários Cadastrados</h4>
                <div className="space-y-3">
                  {companyUsers.filter(u => u.companyId === showDetailsModal.id).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.status === 'BLOCKED' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' : 
                          user.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                          'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {user.status === 'BLOCKED' ? 'BLOQUEADO' : user.status === 'PENDING' ? 'PENDENTE' : 'ATIVO'}
                        </span>
                        {user.status === 'PENDING' && (
                          <button 
                            onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
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
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Funcionários que já atuaram</h4>
                <div className="space-y-3">
                  {(() => {
                    const companyUnitClientIds = units.filter(u => u.companyId === showDetailsModal.id).map(u => u.clientId).filter(Boolean);
                    const companyAssignments = assignments.filter(a => companyUnitClientIds.includes(a.clientId));
                    const uniqueEmployeeIds = Array.from(new Set(companyAssignments.map(a => a.employeeId)));
                    const companyEmployees = employees.filter(e => uniqueEmployeeIds.includes(e.id));
                    
                    return companyEmployees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {companyEmployees.map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                            {emp.photoUrl ? (
                              <img src={emp.photoUrl} alt={emp.firstName} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-black flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
                                <UserIcon size={18} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{emp.firstName} {emp.lastName}</p>
                              <div className="flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{emp.rating.toFixed(1)}</span>
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
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Serviços Realizados</h4>
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
                            <div key={as.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-black flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800 transition-colors">
                                  <Briefcase size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{emp ? `${emp.firstName} ${emp.lastName}` : 'Diarista'}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client?.name} • {formatDateBR(as.date)}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                as.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                                as.status === 'CANCELLED' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' :
                                'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
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
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dia do Pagamento (Ex: Todo dia 05)</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      placeholder="Ex: Todo dia 05"
                      value={formData.paymentDay}
                      onChange={e => setFormData({...formData, paymentDay: e.target.value})}
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

        {showServicesModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Serviços</h3>
                    <p className="text-xs text-slate-400 font-medium">Defina os serviços prestados para <span className="font-bold text-slate-600">{showServicesModal.name}</span></p>
                  </div>
                </div>
                <button onClick={() => setShowServicesModal(null)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-4">
                  {professions.map(prof => {
                    const isSelected = showServicesModal.services?.includes(prof) || false;
                    return (
                      <div key={prof} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                        <span className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{prof}</span>
                        <button 
                          onClick={() => {
                            const current = showServicesModal.services || [];
                            const updated = isSelected ? current.filter(s => s !== prof) : [...current, prof];
                            setShowServicesModal({ ...showServicesModal, services: updated });
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
                        >
                          {isSelected ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                        </button>
                      </div>
                    );
                  })}
                  {professions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm font-bold text-slate-500">Nenhum serviço/profissão cadastrada na agência.</p>
                      <p className="text-xs font-medium text-slate-400 mt-2">Adicione nas Configurações de Preço.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 bg-white shrink-0">
                <button 
                  onClick={() => handleUpdateServices(showServicesModal, showServicesModal.services || [])}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                  Salvar Serviços
                </button>
              </div>
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

function CompanyDiaristas({ companyId, unitId, clients, employees, assignments, companies, units }: { companyId: string, unitId?: string, clients: Client[], employees: Employee[], assignments: Assignment[], companies: Company[], units: Unit[] }) {
  const [startDate, setStartDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [selectedUnitId, setSelectedUnitId] = useState(unitId || '');
  const [minRating, setMinRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientUnits = units.filter(u => u.companyId === companyId && (!unitId || u.id === unitId));
  
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

  const getDatesInRange = (start: string, end: string) => {
    const dates = [];
    let currentDate = new Date(start);
    const lastDate = new Date(end);
    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const isEmployeeAvailable = (empId: string, start: string, end: string) => {
    const dates = getDatesInRange(start, end);
    const employee = employees.find(e => e.id === empId);
    
    for (const date of dates) {
      if (employee?.unavailableDates?.includes(date)) return false;
      if (assignments.some(a => a.employeeId === empId && a.date === date && a.status !== 'CANCELLED')) return false;
    }
    return true;
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
      toast('Selecione uma unidade.');
      return;
    }
    if (startDate > endDate) {
      toast.error('A data final deve ser maior ou igual à data inicial.');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedUnit = units.find(u => u.id === selectedUnitId);
      const dates = getDatesInRange(startDate, endDate);
      
      const requests = dates.map(date => ({
        agencyId: selectedUnit?.agencyId || '',
        companyId: selectedUnit?.companyId || '',
        clientId: selectedUnit?.clientId || '',
        employeeIds: selectedEmployeeIds,
        quantity: Math.max(quantity, selectedEmployeeIds.length),
        date: date,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString()
      }));

      for (const req of requests) {
        await createDocument('companyRequests', req);
      }
      
      // Notify agency via push
      if (selectedUnit?.agencyId) {
        try {
          await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Nova Solicitação de Trabalho',
              body: `A unidade ${selectedUnit.name} solicitou ${quantity} profissionais.`,
              targetRoles: ['AGENCY', 'ADMIN'],
              targetAgencyId: selectedUnit.agencyId
            })
          });
        } catch(e) {
          console.warn("Failed to send push notification via API");
        }
      }

      toast.success('Solicitação enviada com sucesso para a agência!');
      setSelectedEmployeeIds([]);
      setQuantity(1);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Erro ao enviar solicitação.');
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
          Solicitação <Star size={32} className="fill-yellow-400 text-yellow-400" />
        </h2>
        <p className="text-slate-500 font-medium">Selecione os profissionais preferidos ou solicite reforço para suas unidades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 space-y-8 sticky top-24 transition-colors">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Período da Diária</label>
                <div className="flex flex-col gap-3">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                      <Calendar size={16} />
                    </div>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Até</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-600 flex items-center justify-center transition-all">
                      <Calendar size={16} />
                    </div>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 shadow-inner"
                    />
                  </div>
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
                    value={Number.isNaN(quantity) ? '' : quantity}
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

        <div className="lg:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map(emp => {
              const available = isEmployeeAvailable(emp.id, startDate, endDate);
              const isSelected = selectedEmployeeIds.includes(emp.id);
              return (
                <div 
                  key={emp.id} 
                  onClick={() => available && handleToggleEmployee(emp.id)}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 transition-all group relative cursor-pointer overflow-hidden ${
                    isSelected ? 'border-blue-600 shadow-xl shadow-blue-500/10 bg-blue-50/5 dark:bg-blue-900/10' : 
                    available ? 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-slate-500/5' : 'border-slate-100 dark:border-slate-800 opacity-60 grayscale'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all ${isSelected ? 'bg-blue-600/5 dark:bg-blue-400/5 scale-150' : 'bg-slate-50 dark:bg-slate-800 group-hover:scale-150'}`}></div>
                  
                  {!available && (
                    <div className="absolute top-4 right-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest z-20 border border-rose-100 dark:border-rose-900/30">
                      Indisponível
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-lg z-20 shadow-lg animate-in zoom-in duration-300">
                      <CheckCircle size={14} />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center bg-white dark:bg-slate-800">
                      {emp.photoUrl ? (
                        <img 
                          src={emp.photoUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <UserIcon size={24} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{emp.firstName} {emp.lastName}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                              key={s} 
                              size={10} 
                              className={s <= emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700'} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{emp.rating}.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <span>Especialidade</span>
                      <span className="text-slate-900 dark:text-slate-200">{emp.role === 'DIARISTA' ? 'Diarista' : emp.role}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <span>Status</span>
                      <span className={available ? 'text-emerald-600' : 'text-rose-600'}>
                        {available ? 'Disponível' : 'Ocupado'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Valor Diária</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">R$ 180,00</span>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
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

function CompanyEvaluateTeam({ companyId, unitId, clients, assignments, employees, feedbacks, units }: { companyId: string, unitId?: string, clients: Client[], assignments: Assignment[], employees: Employee[], feedbacks: Feedback[], units: Unit[] }) {
  const companyUnitClientIds = units.filter(u => u.companyId === companyId && (!unitId || u.id === unitId)).map(u => u.clientId).filter(Boolean);
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
      toast.success('Avaliação enviada com sucesso!');
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

  const workedEmployeeIds = Array.from(new Set(companyAssignments.filter(a => a.status === 'COMPLETED').map(a => a.employeeId)));
  const workedEmployees = employees.filter(e => workedEmployeeIds.includes(e.id));

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
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon size={32} className="text-slate-300" />
                        )}
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
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={32} className="text-slate-300" />
                    )}
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
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-white">
                    {evaluatingEmployee.photoUrl ? (
                      <img src={evaluatingEmployee.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={24} className="text-slate-300" />
                    )}
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

const exportToExcel = async (data: any[], columns: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório');

  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20
  }));

  data.forEach(item => {
    worksheet.addRow(item);
  });

  // Styling
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10, bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};

const exportToPDF = (data: any[], columns: any[], filename: string, title: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  
  const tableColumn = columns.map(col => col.header);
  const tableRows = data.map(item => columns.map(col => item[col.key]));

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 }
  });

  doc.save(`${filename}.pdf`);
};

function AgencyReports({ employees, assignments, clients, companies, units, agencyId }: { 
  employees: Employee[], 
  assignments: Assignment[], 
  clients: Client[], 
  companies: Company[], 
  units: Unit[],
  agencyId: string | null 
}) {
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 8) + '01');
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  const handleExportEmployees = async (format: 'excel' | 'pdf') => {
    const periodAssignments = assignments.filter(a => a.date >= startDate && a.date <= endDate && a.status === 'COMPLETED');
    
    const reportData = employees.map(emp => {
      const empAssignments = periodAssignments.filter(a => a.employeeId === emp.id);
      const daysWorked = empAssignments.length;
      const totalValue = empAssignments.reduce((acc, curr) => acc + curr.value, 0);
      
      if (daysWorked === 0) return null;

      return {
        name: `${emp.firstName} ${emp.lastName}`,
        cpf: emp.cpf || 'N/A',
        phone: emp.phone || 'N/A',
        days: daysWorked,
        value: `R$ ${totalValue.toFixed(2)}`
      };
    }).filter(Boolean);

    const columns = [
      { header: 'Nome do Funcionário', key: 'name', width: 30 },
      { header: 'CPF', key: 'cpf', width: 20 },
      { header: 'Número', key: 'phone', width: 20 },
      { header: 'Dias Trabalhados', key: 'days', width: 20 },
      { header: 'Valor Total', key: 'value', width: 20 },
    ];

    if (format === 'excel') {
      await exportToExcel(reportData, columns, `Relatorio_Diaristas_${startDate}_A_${endDate}`);
    } else {
      exportToPDF(reportData, columns, `Relatorio_Diaristas_${startDate}_A_${endDate}`, `Relatório de Diaristas - ${formatDateBR(startDate)} a ${formatDateBR(endDate)}`);
    }
  };

  const handleExportCompanies = async (format: 'excel' | 'pdf') => {
    const periodAssignments = assignments.filter(a => a.date >= startDate && a.date <= endDate && a.status === 'COMPLETED');
    
    const reportData = companies.map(comp => {
      const compUnits = units.filter(u => u.companyId === comp.id);
      const compAssignments = periodAssignments.filter(a => compUnits.some(u => u.clientId === a.clientId));
      
      if (compAssignments.length === 0) return null;

      const presentEmployees = Array.from(new Set(compAssignments.map(a => {
        const emp = employees.find(e => e.id === a.employeeId);
        return emp ? `${emp.firstName} ${emp.lastName}` : 'N/A';
      }))).join(', ');

      const totalValue = compAssignments.reduce((acc, curr) => acc + curr.value, 0);

      return {
        name: comp.name,
        employees: presentEmployees,
        total: `R$ ${totalValue.toFixed(2)}`,
        paymentDay: comp.paymentDay || 'N/A'
      };
    }).filter(Boolean);

    const columns = [
      { header: 'Nome da Empresa', key: 'name', width: 30 },
      { header: 'Funcionários Presentes', key: 'employees', width: 50 },
      { header: 'Total a Pagar', key: 'total', width: 20 },
      { header: 'Dia do Pagamento', key: 'paymentDay', width: 20 },
    ];

    if (format === 'excel') {
      await exportToExcel(reportData, columns, `Relatorio_Empresas_${startDate}_A_${endDate}`);
    } else {
      exportToPDF(reportData, columns, `Relatorio_Empresas_${startDate}_A_${endDate}`, `Relatório de Empresas - ${formatDateBR(startDate)} a ${formatDateBR(endDate)}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Relatórios de Exportação</h2>
        <p className="text-slate-500 font-medium">Gere planilhas detalhadas dos processos selecionando um período específico.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Data Inicial</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-64 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Data Final</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-64 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Relatório de Solicitação</h3>
              <p className="text-sm text-slate-500 mt-1">Exporta nome, CPF, telefone, dias trabalhados e valor total.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => handleExportEmployees('excel')}
                className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Excel
              </button>
              <button 
                onClick={() => handleExportEmployees('pdf')}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
              >
                <FileText size={16} /> PDF
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Relatório de Empresas</h3>
              <p className="text-sm text-slate-500 mt-1">Exporta nome da empresa, funcionários do mês, total a pagar e dia de pagamento.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => handleExportCompanies('excel')}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Excel
              </button>
              <button 
                onClick={() => handleExportCompanies('pdf')}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
              >
                <FileText size={16} /> PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyReports({ employees, assignments, clients, units, companyId }: { 
  employees: Employee[], 
  assignments: Assignment[], 
  clients: Client[], 
  units: Unit[],
  companyId: string 
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const handleExportMyReport = async (format: 'excel' | 'pdf') => {
    const compUnits = units.filter(u => u.companyId === companyId);
    const monthAssignments = assignments.filter(a => 
      a.date.startsWith(selectedMonth) && 
      a.status === 'COMPLETED' && 
      compUnits.some(u => u.clientId === a.clientId)
    );

    const reportData = monthAssignments.map(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      const unit = units.find(u => u.clientId === a.clientId);
      return {
        date: formatDateBR(a.date),
        employee: emp ? `${emp.firstName} ${emp.lastName}` : 'N/A',
        unit: unit ? unit.name : 'N/A',
        value: `R$ ${a.value.toFixed(2)}`
      };
    });

    const columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Profissional', key: 'employee', width: 30 },
      { header: 'Unidade', key: 'unit', width: 25 },
      { header: 'Valor da Diária', key: 'value', width: 20 },
    ];

    if (format === 'excel') {
      await exportToExcel(reportData, columns, `Relatorio_Mensal_${selectedMonth}`);
    } else {
      exportToPDF(reportData, columns, `Relatorio_Mensal_${selectedMonth}`, `Relatório Mensal - ${selectedMonth}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Relatórios Mensais</h2>
        <p className="text-slate-500 font-medium">Exporte o detalhamento das diárias realizadas no mês.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Mês de Referência</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-64 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
            />
          </div>
        </div>

        <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Detalhamento de Diárias</h3>
            <p className="text-sm text-slate-500 mt-1">Gera uma planilha com todas as diárias concluídas, profissionais e valores.</p>
          </div>
          <button 
            onClick={handleExportMyReport}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
          >
            <Download size={18} />
            Exportar Planilha
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyProfile({ companyUserId, companyUsers, companies }: { companyUserId: string, companyUsers: CompanyUser[], companies: Company[] }) {
  const companyUser = companyUsers.find(cu => cu.id === companyUserId);
  const company = companies.find(c => c.id === companyUser?.companyId);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && companyUser) {
      if (file.size > 2 * 1024 * 1024) {
        toast('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          try {
            await updateDocument('companyUsers', companyUser.id, { photoUrl: compressedBase64 });
            toast.success('Foto de perfil atualizada no sistema interno!', { duration: 5000 });
            if (auth.currentUser) {
              await updateProfile(auth.currentUser, { photoURL: compressedBase64 });
            }
          } catch (err: any) {
             const errorStr = err.message || String(err);
             toast.error(errorStr.includes('too large') || errorStr.includes('1,048,576') ? 'A imagem é muito grande mesmo após compressão. Cancele e tente uma imagem com menos detalhes.' : 'Erro ao atualizar foto de perfil.');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

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
          <label className="block w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl cursor-pointer relative group">
            {companyUser.photoUrl ? (
              <img 
                src={companyUser.photoUrl} 
                alt="" 
                className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600 font-black text-4xl group-hover:opacity-50 transition-opacity">
                {companyUser.fullName[0]}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <Camera size={24} className="text-white drop-shadow-md" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white pointer-events-none">
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
              Como gestor, você tem acesso a informações sensíveis de diarias e funcionários. O ProStaff Brasil garante que todos os dados sejam tratados com o mais alto nível de segurança e em conformidade com a <strong>LGPD</strong>.
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

function EmployeeProfile({ employeeId, employees, assignments, notifications, pricing, clients, companies }: { employeeId: string, employees: Employee[], assignments: Assignment[], notifications: AppNotification[], pricing: PricingConfig, clients: Client[], companies: Company[] }) {
  const [showFaceUpdate, setShowFaceUpdate] = useState(false);
  
  // Local Map Modal State for EmployeeProfile
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapCompanyDetails, setMapCompanyDetails] = useState<{
    name: string;
    address: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

  const DEFAULT_MAP_LAT = -23.55052;
  const DEFAULT_MAP_LNG = -46.633308;

  const handleOpenMap = (clientOrUnit: any) => {
    if (!clientOrUnit) return;
    
    const name = clientOrUnit.name || 'Cliente';
    const address = clientOrUnit.location || clientOrUnit.address || '';
    const linkedCompany = clientOrUnit.companyId ? companies.find(c => c.id === clientOrUnit.companyId) : null;
    const phone = clientOrUnit.phone || linkedCompany?.phone || '';
    const email = clientOrUnit.email || linkedCompany?.email || '';
    
    let latitude = clientOrUnit.latitude;
    let longitude = clientOrUnit.longitude;
    
    if (latitude === undefined || latitude === null || isNaN(latitude)) {
      if (clientOrUnit.coordinates?.lat) {
        latitude = clientOrUnit.coordinates.lat;
        longitude = clientOrUnit.coordinates.lng;
      } else {
        const hash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const latOffset = ((hash % 100) - 50) / 1000;
        const lngOffset = ((hash % 70) - 35) / 1000;
        latitude = DEFAULT_MAP_LAT + latOffset;
        longitude = DEFAULT_MAP_LNG + lngOffset;
      }
    }
    
    setMapCompanyDetails({
      name,
      address,
      phone,
      email,
      latitude,
      longitude
    });
    setMapModalOpen(true);
  };

  const handleOpenMapForNotification = (notification: any) => {
    let clientToMap = null;
    
    if (notification.clientId) {
      clientToMap = clients?.find(c => c.id === notification.clientId);
    }
    
    if (!clientToMap) {
      clientToMap = clients?.find(c => {
        const cName = c.name?.toLowerCase() || '';
        const nMsg = notification.message?.toLowerCase() || '';
        return cName && nMsg.includes(cName);
      });
    }
    
    if (clientToMap) {
      handleOpenMap(clientToMap);
    } else {
      const matchedName = notification.message?.match(/empresa\s+([A-Za-z0-9\s\-]+?)\./i);
      const name = matchedName?.[1] || notification.title || 'Cliente';
      
      setMapCompanyDetails({
        name,
        address: 'Consulte o painel da vaga para obter o endereço.',
        latitude: DEFAULT_MAP_LAT,
        longitude: DEFAULT_MAP_LNG
      });
      setMapModalOpen(true);
    }
  };

  const employee = employees.find(e => e.id === employeeId);
  const pendingAssignments = assignments.filter(a => a.employeeId === employeeId && a.status === 'SCHEDULED' && !a.confirmed);
  const myNotifications = notifications.filter(n => n.userId === employeeId && !n.read);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && employee) {
      if (file.size > 2 * 1024 * 1024) {
        toast('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          try {
            await updateDocument('employees', employee.id, { photoUrl: compressedBase64 });
            toast.success('Foto de perfil atualizada no sistema interno!', { duration: 5000 });
            // For Firebase Auth compatibility we'll also update the user photoURL
            if (auth.currentUser) {
              await updateProfile(auth.currentUser, { photoURL: compressedBase64 });
            }
          } catch (err: any) {
             const errorStr = err.message || String(err);
             toast.error(errorStr.includes('too large') || errorStr.includes('1,048,576') ? 'A imagem é muito grande mesmo após compressão. Cancele e tente uma imagem com menos detalhes.' : 'Erro ao atualizar foto de perfil.');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  if (!employee) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <UserIcon size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Perfil não Encontrado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Não encontramos um registro de funcionário vinculado a este e-mail. Entre em contato com sua agência para completar seu cadastro.</p>
      </div>
    );
  }

  const handleConfirm = async (assignmentId: string) => {
    await updateDocument('assignments', assignmentId, { confirmed: true });
    toast.success('Diaria confirmada com sucesso!');
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
                    {(notification.type === 'ASSIGNMENT' || notification.clientId || notification.requestId || notification.title?.toLowerCase().includes('oportunidade')) && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMapForNotification(notification)}
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all active:scale-95 border border-transparent shadow-sm"
                        >
                          <MapPin size={10} />
                          Ver Localização no Mapa
                        </button>
                      </div>
                    )}
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
          <label className="block w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-white cursor-pointer relative group">
            {employee.photoUrl ? (
              <img 
                src={employee.photoUrl} 
                alt="" 
                className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon size={48} className="text-slate-300 group-hover:opacity-50 transition-opacity" />
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <Camera size={24} className="text-white drop-shadow-md" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div className={`absolute -bottom-1 -right-1 ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'} text-white p-2 rounded-xl shadow-lg border-2 border-white pointer-events-none`}>
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
            <PrivacyListItem title="Comunicação" description="Seu telefone é usado para envio de diarias via WhatsApp." />
            <PrivacyListItem title="Segurança" description="Documentos armazenados para conformidade e antecedentes." />
          </ul>
        </div>
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

      {/* Map viewer modal inside EmployeeProfile */}
      <AnimatePresence>
        {mapModalOpen && mapCompanyDetails && (
          <MapViewerModal
            isOpen={mapModalOpen}
            onClose={() => setMapModalOpen(false)}
            companyName={mapCompanyDetails.name}
            address={mapCompanyDetails.address}
            phone={mapCompanyDetails.phone}
            email={mapCompanyDetails.email}
            latitude={mapCompanyDetails.latitude}
            longitude={mapCompanyDetails.longitude}
          />
        )}
      </AnimatePresence>
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
          <p className={`text-sm font-bold ${valueColor || 'text-slate-700'}`} title={value}>{value}</p>
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

function CompanyDashboard({ companyId, unitId, clients, assignments, employees, feedbacks, units, companies, invoices, bulletins, companyRequests, isDarkMode }: { companyId: string, unitId?: string, clients: Client[], assignments: Assignment[], employees: Employee[], feedbacks: Feedback[], units: Unit[], companies: Company[], invoices: Invoice[], bulletins: Bulletin[], companyRequests: CompanyRequest[], isDarkMode: boolean }) {
  if (!companyId) return <div className="p-8 text-center text-slate-500">Carregando dados da empresa...</div>;
  const [activeTab, setActiveTab] = useState<'STAFF' | 'BILLING' | 'FAVORITES' | 'MURAL' | 'REQUESTS'>('STAFF');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const company = companies.find(c => c.id === companyId);
  const companyUnitClientIds = units.filter(u => u.companyId === companyId).map(u => u.clientId).filter(Boolean);
  const myInvoices = invoices.filter(i => i.companyId === companyId);
  const myUnits = units.filter(u => u.companyId === companyId);
  const favoriteEmployees = employees.filter(e => myUnits.some(u => u.favoriteEmployees?.includes(e.id)));

  const isTrial = company?.isTrial;

  const [evaluatingEmployee, setEvaluatingEmployee] = useState<Employee | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  
  const [editingRequest, setEditingRequest] = useState<CompanyRequest | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editDate, setEditDate] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [requestStep, setRequestStep] = useState<1 | 2>(1);
  const [reqQuantity, setReqQuantity] = useState(1);
  const [reqClientId, setReqClientId] = useState('');
  const [reqStartDate, setReqStartDate] = useState('');
  const [reqEndDate, setReqEndDate] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const allAssignments = assignments.filter(a => {
    if (unitId) {
      return a.unitId === unitId || (!a.unitId && units.find(u => u.id === unitId)?.clientId === a.clientId);
    }
    return units.some(u => (a.unitId ? u.id === a.unitId : u.clientId === a.clientId) && u.companyId === companyId);
  });

  const allRequests = companyRequests.filter(r => {
    if (unitId) {
      return units.find(u => u.id === unitId)?.clientId === r.clientId;
    }
    return r.companyId === companyId;
  });

  const myAssignments = allAssignments.filter(a => a.date >= today);
  const myRequests = allRequests.filter(r => r.date >= today);

  const allDates = Array.from(new Set([
    ...myAssignments.map(a => a.date),
    ...myRequests.map(r => r.date)
  ]))
    .sort((a, b) => b.localeCompare(a));

  const totalPages = Math.ceil(allDates.length / itemsPerPage);
  const paginatedDates = allDates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const todayStaff = myAssignments.filter(a => a.date === today);

  const [expandedDates, setExpandedDates] = useState<string[]>([today]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  // Chart Data Preparation
  const statusCounts = allAssignments.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Concluídos', value: statusCounts['COMPLETED'] || 0, color: '#10b981' },
    { name: 'Em Andamento', value: statusCounts['IN_PROGRESS'] || 0, color: '#3b82f6' },
    { name: 'Agendados', value: statusCounts['SCHEDULED'] || 0, color: '#8b5cf6' },
    { name: 'Cancelados', value: statusCounts['CANCELLED'] || 0, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  }).reverse();

  const barData = last6Months.map(month => {
    const monthAssignments = allAssignments.filter(a => a.date.startsWith(month) && a.status === 'COMPLETED');
    const expenses = monthAssignments.reduce((acc, curr) => acc + curr.value, 0);
    return {
      name: month.split('-').reverse().join('/'),
      Gastos: expenses
    };
  });

  const handleCreateRequestSubmit = async () => {
    if (!reqClientId || !reqStartDate || reqQuantity < 1) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    const end = reqEndDate || reqStartDate;
    if (end < reqStartDate) {
      toast.error('Data final inválida.');
      return;
    }

    setIsSubmittingReq(true);
    try {
      const datesToRequest: string[] = [];
      let currentDate = new Date(reqStartDate);
      currentDate = new Date(currentDate.getTime() + currentDate.getTimezoneOffset() * 60000);
      const limitDate = new Date(end);
      let limitDateLocal = new Date(limitDate.getTime() + limitDate.getTimezoneOffset() * 60000);

      while (currentDate <= limitDateLocal) {
        datesToRequest.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const client = clients.find(c => c.id === reqClientId);
      const agencyId = company?.agencyId || (client ? client.agencyId : '');
      
      for (const date of datesToRequest) {
        await createDocument('companyRequests', {
          agencyId,
          companyId,
          clientId: reqClientId,
          employeeIds: [],
          quantity: reqQuantity,
          date,
          status: 'PENDING',
          broadcasted: true,
          createdAt: new Date().toISOString()
        });
      }

      toast.success('Solicitação enviada com sucesso!');
      setIsCreatingRequest(false);
      setRequestStep(1);
      setReqClientId('');
      setReqStartDate('');
      setReqEndDate('');
      setReqQuantity(1);
    } catch (e) {
      toast.error('Erro ao enviar solicitação.');
      console.error(e);
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleEvaluate = async () => {
    if (!evaluatingEmployee) return;
    setIsSubmittingEval(true);
    try {
      const assignment = allAssignments.find(a => a.employeeId === evaluatingEmployee.id && a.status === 'COMPLETED');
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
      toast.success('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta solicitação?')) {
      try {
        await updateDocument('companyRequests', requestId, { status: 'REJECTED' });
        toast.success('Solicitação cancelada com sucesso.');
      } catch (error) {
        console.error('Error cancelling request:', error);
        toast.error('Erro ao cancelar solicitação.');
      }
    }
  };

  const handleOpenEdit = (req: CompanyRequest) => {
    setEditingRequest(req);
    setEditQuantity(req.quantity);
    setEditDate(req.date);
  };

  const handleUpdateItems = async () => {
    if (!editingRequest) return;
    if (editDate < today) {
      toast.error('A data não pode ser anterior a hoje.');
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await updateDocument('companyRequests', editingRequest.id, {
        quantity: editQuantity,
        date: editDate
      });
      toast.success('Solicitação atualizada com sucesso!');
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Erro ao atualizar solicitação.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        {isTrial && (
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
              <AlertCircle size={120} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-blue-700 dark:text-blue-400 mb-1">Empresa em Modo Experiência</h3>
                <p className="text-sm font-medium text-blue-600/80 dark:text-blue-300/80">
                  Sua conta foi criada e está em análise pela agência. Durante este período, você pode explorar os recursos e visualizar as funcionalidades da plataforma.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 px-2 sm:px-0 mb-2 sm:mb-0 items-center text-center sm:items-start sm:text-left">
          <h2 className="text-base sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Minhas Diarias</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-[8px] sm:text-base">Acompanhe os funcionários agendados para suas unidades.</p>
        </div>

        <div className="flex flex-nowrap sm:flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg sm:rounded-2xl w-fit max-w-[calc(100%-1rem)] sm:w-fit border border-slate-200/50 dark:border-slate-800 mx-auto sm:mx-0 overflow-x-auto no-scrollbar transition-colors">
          <button 
            onClick={() => setActiveTab('STAFF')}
            className={`flex-none px-3 sm:px-8 py-2 sm:py-3 rounded-md sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'STAFF' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Equipe
          </button>
          <button 
            onClick={() => setActiveTab('BILLING')}
            className={`flex-none px-3 sm:px-8 py-2 sm:py-3 rounded-md sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'BILLING' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Faturamento
          </button>
          <button 
            onClick={() => setActiveTab('FAVORITES')}
            className={`flex-none px-3 sm:px-8 py-2 sm:py-3 rounded-md sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'FAVORITES' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Favoritos
          </button>
          <button 
            onClick={() => setActiveTab('REQUESTS')}
            className={`flex-none px-3 sm:px-8 py-2 sm:py-3 rounded-md sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'REQUESTS' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xl shadow-slate-900/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Solicitações
          </button>
        </div>

        {activeTab === 'STAFF' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-8">
              <StatCard 
                icon={<Users size={20} className="sm:w-6 sm:h-6" />} 
                label="Equipe Hoje" 
                value={todayStaff.length.toString()} 
                color="violet"
              />
              <StatCard 
                icon={<Calendar size={20} className="sm:w-6 sm:h-6" />} 
                label="Total de Diarias" 
                value={myAssignments.length.toString()} 
                color="indigo"
              />
              <StatCard 
                icon={<Clock size={20} className="sm:w-6 sm:h-6" />} 
                label="Próxima Diaria" 
                value={myAssignments.find(a => a.date > today)?.date ? formatDateBR(myAssignments.find(a => a.date > today)!.date) : 'Nenhuma'} 
                color="emerald"
              />
            </div>

            <div 
              onClick={() => {
                setActiveTab('REQUESTS');
                setIsCreatingRequest(true);
                setRequestStep(1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer rounded-[2.5rem] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              <div className="flex items-center gap-6 text-white text-center sm:text-left">
                <div className="w-16 h-16 bg-indigo-500/50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-3xl">✨</span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Solicitar Nova Diarista</h3>
                  <p className="text-indigo-200 font-medium text-sm sm:text-base">Precisa de reforço? Peça uma ou mais diaristas agora mesmo.</p>
                </div>
              </div>
              <div className="flex bg-white text-indigo-600 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shrink-0 items-center justify-center w-full sm:w-auto">
                Fazer Solicitação
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group">
              <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/30 gap-4">
                <h3 className="text-[10px] font-black text-slate-950 tracking-[0.2em] uppercase">Histórico de Diarias</h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 self-start sm:self-auto shadow-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span>Atualizado em tempo real</span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {paginatedDates.map(date => {
                  const dateAssignments = myAssignments.filter(a => a.date === date);
                  const dateRequests = myRequests.filter(r => r.date === date);
                  const totalRequested = dateRequests.reduce((acc, curr) => acc + curr.quantity, 0);
                  const totalAssigned = dateAssignments.length;
                  const isToday = date === today;

                  return (
                    <div key={date} className={`transition-colors border-b border-slate-100 last:border-0 ${isToday ? 'bg-blue-50/10' : 'hover:bg-slate-50/30'}`}>
                      <div 
                        onClick={() => toggleDate(date)}
                        className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${isToday ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                            <Calendar size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-black text-slate-900">{formatDateBR(date)}</h4>
                              {isToday && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest">Hoje</span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                              {totalRequested > 0 && <span className="text-amber-600">{totalRequested} Solicitados</span>}
                              {totalRequested > 0 && totalAssigned > 0 && <span className="mx-2 text-slate-300">•</span>}
                              {totalAssigned > 0 && <span className="text-emerald-600">{totalAssigned} Agendados</span>}
                            </p>
                          </div>
                        </div>
                        <div className={`p-2 rounded-xl bg-slate-100 text-slate-400 transition-transform duration-300 ${expandedDates.includes(date) ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                          <ChevronDown size={20} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedDates.includes(date) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 sm:p-8 pt-0 sm:pt-0 space-y-6">
                              {dateRequests.map(req => {
                          const unit = units.find(u => u.clientId === req.clientId);
                          return (
                            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-amber-100 bg-amber-50/30">
                              <div>
                                <p className="font-black text-slate-900 text-sm">Solicitação para {unit?.name || 'Unidade'}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                  {req.quantity} Profissionais {req.employeeIds?.length > 0 ? '(Específicos)' : '(Qualquer)'}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-[10px] px-4 py-1.5 rounded-lg font-black uppercase tracking-widest ${
                                  req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                  req.status === 'EM_ATENDIMENTO' ? 'bg-blue-100 text-blue-700' :
                                  req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {req.status === 'PENDING' ? 'Pendente' : req.status === 'EM_ATENDIMENTO' ? 'Em Atendimento' : req.status === 'ACCEPTED' ? 'Aceito' : 'Cancelado'}
                                </span>
                                {(req.status === 'PENDING' || req.status === 'EM_ATENDIMENTO') && (
                                  <button 
                                    onClick={() => handleCancelRequest(req.id)}
                                    className="text-[10px] font-black text-red-600 hover:text-red-800 uppercase tracking-widest transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {dateAssignments.map(as => {
                          const emp = employees.find(e => e.id === as.employeeId);
                          const unit = units.find(u => u.id === as.unitId);
                          return (
                            <div key={as.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-100 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                                  {emp?.photoUrl ? (
                                    <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <UserIcon size={20} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-sm">{emp ? `${emp.firstName} ${emp.lastName}` : 'Funcionário'}</p>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{unit?.name || 'Unidade'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-[10px] px-4 py-1.5 rounded-lg font-black uppercase tracking-widest ${
                                  as.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                                  as.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {as.status === 'COMPLETED' ? 'Finalizado' : as.status === 'SCHEDULED' ? 'Agendado' : 'Cancelado'}
                                </span>
                                {as.status === 'COMPLETED' && !feedbacks.some(f => f.assignmentId === as.id) && (
                                  <button 
                                    onClick={() => setEvaluatingEmployee(emp || null)}
                                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-amber-50 hover:text-amber-500 transition-all"
                                    title="Avaliar"
                                  >
                                    <Star size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

                {allDates.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100">
                        <Calendar size={40} />
                      </div>
                      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Nenhum registro encontrado.</p>
                    </div>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 p-6 border-t border-slate-100 bg-slate-50/30">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors">Anterior</button>
                  <span className="text-xs font-black text-slate-900">{currentPage} de {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors">Próximo</button>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'BILLING' ? (
          <div className="space-y-4 sm:space-y-8 px-4 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl">
                    <CreditCard size={24} className="text-blue-600 sm:w-8 sm:h-8" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Fatura Atual</span>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1">Total do Mês</p>
                  <h3 className="text-2xl sm:text-5xl font-black text-slate-950 tracking-tight">R$ {myAssignments.filter(a => a.status === 'COMPLETED').reduce((acc, curr) => acc + curr.value, 0).toFixed(2)}</h3>
                </div>
              </div>
              <div className="bg-slate-950 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 sm:p-4 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md">
                      <TrendingUp size={24} className="text-emerald-400 sm:w-8 sm:h-8" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Status</span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1">Próximo Vencimento</p>
                    <h3 className="text-2xl sm:text-5xl font-black tracking-tight">Dia {company?.paymentDay || '10'}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-500">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Gastos (Últimos 6 meses)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                      <RechartsTooltip 
                        cursor={{ fill: isDarkMode ? '#0f172a' : '#f8fafc' }}
                        contentStyle={{ 
                          borderRadius: '1rem', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: isDarkMode ? '#020617' : '#ffffff',
                          color: isDarkMode ? '#ffffff' : '#000000',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: isDarkMode ? '#3b82f6' : '#2563eb' }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gastos']}
                      />
                      <Bar dataKey="Gastos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-500">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Status das Diárias</h3>
                <div className="h-72 w-full flex items-center justify-center">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            borderRadius: '1rem', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: isDarkMode ? '#020617' : '#ffffff',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Nenhum dado disponível</p>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-950 tracking-tight uppercase">Histórico de Faturas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myInvoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 font-medium text-slate-600">{invoice.month}</td>
                        <td className="p-6 font-black text-slate-950">R$ {invoice.amount.toFixed(2)}</td>
                        <td className="p-6">
                          <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            <Download size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'REQUESTS' ? (
          <div className="space-y-4 px-4 sm:px-0">
            {!isCreatingRequest && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setIsCreatingRequest(true)} 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Nova Solicitação
                </button>
              </div>
            )}
            
            {isCreatingRequest ? (
              <div className="bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 z-0 opacity-50" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Nova Solicitação</h3>
                      <p className="text-sm font-medium text-slate-500">Passo {requestStep} de 2</p>
                    </div>
                    {requestStep === 2 && (
                       <button onClick={() => setRequestStep(1)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Seta Voltar</button>
                    )}
                    <button onClick={() => setIsCreatingRequest(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                    </button>
                  </div>

                  {requestStep === 1 ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade de Destino</label>
                        <select
                          value={reqClientId}
                          onChange={(e) => setReqClientId(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                          <option value="">Selecione uma unidade</option>
                          {myUnits.map(u => (
                            <option key={u.id} value={u.clientId}>{u.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Início</label>
                          <input
                            type="date"
                            min={today}
                            value={reqStartDate}
                            onChange={(e) => setReqStartDate(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Fim (Opcional)</label>
                          <input
                            type="date"
                            min={reqStartDate || today}
                            value={reqEndDate}
                            onChange={(e) => setReqEndDate(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade de Diaristas por dia</label>
                        <input
                          type="number"
                          min="1"
                          value={reqQuantity}
                          onChange={(e) => setReqQuantity(parseInt(e.target.value))}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!reqClientId || !reqStartDate || reqQuantity < 1) {
                            toast.error('Preencha os campos obrigatórios (Unidade, Data Início e Quantidade).');
                            return;
                          }
                          setRequestStep(2);
                        }}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                      >
                        Avançar para Revisão
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 text-center">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                           <Users size={24} className="text-indigo-600" />
                         </div>
                         <h4 className="text-lg font-black text-slate-900 uppercase">Revise sua Solicitação</h4>
                         <p className="text-slate-500 font-medium text-sm">
                           Você está solicitando <strong className="text-slate-900">{reqQuantity} diarista(s)</strong> para a unidade <strong className="text-slate-900">{myUnits.find(u => u.clientId === reqClientId)?.name}</strong>.
                           <br/><br/>
                           Período: <strong className="text-slate-900">{formatDateBR(reqStartDate)}</strong> {reqEndDate && reqEndDate !== reqStartDate ? ` até ${formatDateBR(reqEndDate)}` : ''}.
                         </p>
                      </div>
                      
                      <button
                        onClick={handleCreateRequestSubmit}
                        disabled={isSubmittingReq}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isSubmittingReq ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : 'Confirmar e Enviar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">Nenhuma solicitação encontrada no momento.</div>
            ) : (
              myRequests.map(req => {
                const unit = units.find(u => u.clientId === req.clientId);
                const assignedStaff = allAssignments.filter(a => a.date === req.date && a.clientId === req.clientId && a.status !== 'CANCELLED');
                
                return (
                  <div key={req.id} className="flex flex-col gap-4 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          req.status === 'EM_ATENDIMENTO' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-red-50 text-red-600 border-rose-100'
                        }`}>
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base uppercase tracking-tight">Solicitação para {unit?.name || 'Unidade'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {req.quantity} Profissionais {req.employeeIds?.length > 0 ? '(Específicos)' : '(Qualquer)'} - {formatDateBR(req.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border transition-all ${
                          req.status === 'PENDING' ? 'bg-amber-100/50 text-amber-700 border-amber-200' :
                          req.status === 'EM_ATENDIMENTO' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                          req.status === 'ACCEPTED' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' :
                          'bg-red-100/50 text-rose-700 border-rose-200'
                        }`}>
                          {req.status === 'PENDING' ? 'Pendente' : req.status === 'EM_ATENDIMENTO' ? 'Em Atendimento' : req.status === 'ACCEPTED' ? 'Aceito' : 'Cancelado'}
                        </span>
                        
                        {(req.status === 'PENDING' || req.status === 'EM_ATENDIMENTO') && (
                          <>
                            {req.status === 'PENDING' && (
                              <button 
                                onClick={() => handleOpenEdit(req)}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                              >
                                Editar
                              </button>
                            )}
                            <button 
                              onClick={() => handleCancelRequest(req.id)}
                              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Assigned Staff Section */}
                    {req.status === 'ACCEPTED' && (
                      <div className="mt-4 pt-6 border-t border-slate-50 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pessoas Escaladas ({assignedStaff.length}/{req.quantity})</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {assignedStaff.map(as => {
                            const emp = employees.find(e => e.id === as.employeeId);
                            if (!emp) return null;
                            return (
                              <div key={as.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-white group-hover:scale-105 transition-transform">
                                  {emp.photoUrl ? (
                                    <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                                      {emp.firstName?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-slate-900 text-xs uppercase tracking-tight leading-tight">{emp.firstName} {emp.lastName}</p>
                                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{emp.phone}</p>
                                </div>
                              </div>
                            );
                          })}
                          {assignedStaff.length === 0 && (
                            <p className="text-xs font-medium text-slate-400 italic py-2">Aguardando definição da agência...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === 'MURAL' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 px-4 sm:px-0">
            {bulletins.filter(b => b.targetRoles.includes('COMPANY')).length === 0 ? (
              <div className="col-span-full bg-white p-12 sm:p-24 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 text-center space-y-4 sm:space-y-6 shadow-sm">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-xl sm:rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                  <FileText size={32} className="sm:w-12 sm:h-12" />
                </div>
                <p className="text-slate-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">Nenhum aviso no mural no momento.</p>
              </div>
            ) : (
              bulletins.filter(b => b.targetRoles.includes('COMPANY')).map(bulletin => (
                <div key={bulletin.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-2 h-full ${bulletin.type === 'URGENT' ? 'bg-rose-500' : bulletin.type === 'TRAINING' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${bulletin.type === 'URGENT' ? 'bg-rose-50 text-rose-600' : bulletin.type === 'TRAINING' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {bulletin.type}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateBR(bulletin.createdAt)}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-slate-950 tracking-tight uppercase group-hover:text-blue-600 transition-colors">{bulletin.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">{bulletin.content}</p>
                    </div>
                    {bulletin.attachmentUrl && (
                      <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                        <Download size={16} />
                        Baixar Material de Apoio
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
            {favoriteEmployees.length === 0 ? (
              <div className="col-span-full bg-white p-24 rounded-[3rem] border border-slate-100 text-center space-y-6 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                  <Star size={48} />
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Você ainda não favoritou nenhum funcionário.</p>
              </div>
            ) : (
              favoriteEmployees.map(emp => (
                <div key={emp.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-900/5 transition-all group relative overflow-hidden">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 overflow-hidden shadow-xl group-hover:scale-110 transition-transform duration-500">
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <UserIcon size={40} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-950 tracking-tight uppercase">{emp.firstName} {emp.lastName}</h4>
                      <div className="flex items-center justify-center gap-1 text-amber-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.round(emp.rating) ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-3 bg-slate-50 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                      Solicitar Preferencial
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {editingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Edit2 size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Editar Solicitação</h3>
                  </div>
                  <button onClick={() => setEditingRequest(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantidade de Profissionais</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                      <input 
                        type="number"
                        min="1"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseInt(e.target.value))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data da Diária</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                      <input 
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        min={today}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setEditingRequest(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={handleUpdateItems}
                    disabled={isSubmittingEdit}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingEdit ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

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
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-white">
                    {evaluatingEmployee.photoUrl ? (
                      <img src={evaluatingEmployee.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={24} className="text-slate-300" />
                    )}
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

function CompanyFeedbackForm({ companyId, unitId, clients, assignments, employees, units }: { companyId: string, unitId?: string, clients: Client[], assignments: Assignment[], employees: Employee[], units: Unit[] }) {
  const companyUnitClientIds = units.filter(u => u.companyId === companyId && (!unitId || u.id === unitId)).map(u => u.clientId).filter(Boolean);
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

    toast.success('Feedback enviado com sucesso!');
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
      toast('As senhas não coincidem!');
      return;
    }

    if (!formData.email) {
      toast('O login ainda não foi gerado. Certifique-se de preencher o nome completo corretamente.');
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
        toast('Não foi possível identificar a agência vinculada a esta empresa. Por favor, entre em contato com o suporte.');
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
          status: 'ACTIVE',
          isTrial: true,
          createdAt: new Date().toISOString()
        });

        // Set the company itself to active if it's pending
        await updateDocument('companies', companyId, { status: 'ACTIVE', isTrial: true });

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
          status: 'ACTIVE',
          isTrial: true,
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success('Cadastro concluído com sucesso!');
      setTimeout(() => {
        onComplete();
      }, 1500);
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
      
      toast.error(errorMessage);
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
        <div className="p-10 bg-slate-900 text-white text-center space-y-2 relative">
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
            title="Voltar ao Início"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200/50 overflow-hidden">
            <img 
              src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
              alt="ProStaff Brasil" 
              className="w-full h-auto object-contain p-2"
              referrerPolicy="no-referrer"
            />
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

function AgencyRegistrationForm({ onComplete, plans }: { onComplete: () => void, plans: Plan[] }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    logoUrl: '',

    // Step 5: Documentação (URLs)
    cnpjCard: '',
    socialContract: '',
    responsibleDoc: '',
    addressProof: '',

    // Step 6: Tipo de Serviço
    services: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const segments = ['Logística', 'Condomínios', 'Limpeza', 'Eventos', 'Industrial', 'Outros'];
  const serviceTypes = ['Logística', 'Condomínios', 'Limpeza', 'Eventos', 'Industrial', 'Outros'];

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    setIsSubmitting(true);
    console.log('Starting agency registration process...');

    try {
      // Create Firebase Auth user
      console.log('Creating Firebase Auth user with email:', formData.loginEmail);
      const userCredential = await createUserWithEmailAndPassword(auth, formData.loginEmail, formData.password);
      const newUid = userCredential.user.uid;
      console.log('Firebase Auth user created with UID:', newUid);

      const agencyId = crypto.randomUUID();
      
      const starterPlan = plans.find(p => p.id === 'STARTER');
      
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
        logoUrl: formData.logoUrl,
        documents: {
          cnpjCard: formData.cnpjCard,
          socialContract: formData.socialContract,
          responsibleDoc: formData.responsibleDoc,
          addressProof: formData.addressProof
        },
        status: 'PENDING',
        plan: 'STARTER',
        subscriptionStatus: 'TRIAL',
        maxEmployees: starterPlan?.maxEmployees || 50,
        maxCompanies: starterPlan?.maxCompanies || 10,
        createdAt: new Date().toISOString()
      };

      console.log('Generating agency document for ID:', agencyId);
      await setDocument('agencies', agencyId, { ...agencyData, id: agencyId });
      console.log('Agency document created successfully.');
      
      // Update user role to AGENCY and link to agencyId
      console.log('Generating user profile for UID:', newUid);
      await setDocument('users', newUid, { 
        id: newUid,
        role: 'AGENCY', 
        agencyId, 
        email: formData.loginEmail,
        fullName: formData.responsibleName,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      console.log('User profile created successfully.');
      
      toast.success('Cadastro enviado com sucesso! Você tem 3 meses de teste grátis.');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error: any) {
      console.error('CRITICAL: Error registering agency:', error);
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
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('Registration process execution finished.');
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
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} className="input-field pr-12" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <div className="relative">
                  <input required type={showConfirmPassword ? "text" : "password"} className="input-field pr-12" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Logo da Empresa (Opcional)</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group hover:border-blue-300 transition-all">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <Upload size={24} className="text-slate-300 group-hover:text-blue-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">
                    Arraste sua logo ou clique no botão abaixo.<br />
                    Formatos aceitos: PNG, JPG ou SVG.
                  </p>
                  <label className="inline-flex px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-all border border-slate-200 shadow-sm active:scale-95">
                    Selecionar Logo
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error('O arquivo é muito grande (máx 2MB)');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const img = new Image();
                            img.src = reader.result as string;
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              const MAX_SIZE = 400;
                              if (width > height) {
                                if (width > MAX_SIZE) {
                                  height *= MAX_SIZE / width;
                                  width = MAX_SIZE;
                                }
                              } else {
                                if (height > MAX_SIZE) {
                                  width *= MAX_SIZE / height;
                                  height = MAX_SIZE;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                              setFormData({...formData, logoUrl: compressedBase64});
                            };
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {formData.logoUrl && (
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, logoUrl: ''})}
                      className="ml-3 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors bg-white px-3 py-1 rounded-lg border border-rose-100 shadow-sm"
                    >
                      Remover
                    </button>
                  )}
                </div>
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
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <button 
                type="button"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mb-4 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Voltar ao Início
              </button>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Etapa {step} de 6</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stepTitles[step-1]}</h2>
            </div>
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 overflow-hidden">
              <img 
                src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
                alt="ProStaff Brasil" 
                className="w-full h-auto object-contain p-2"
                referrerPolicy="no-referrer"
              />
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

function RegistrationForm({ onComplete, agencies }: { onComplete: () => void, agencies: Agency[] }) {
  const [step, setStep] = useState<'INFO' | 'PHOTO' | 'DOCUMENT' | 'FACE_REG'>('INFO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    personalEmail: '',
    lgpdAuthorized: false,
    photo: null as string | null,
    document: null as File | null,
    eSocialBase64: '' as string,
    faceReference: null as string | null,
    category: 'DIARISTA' as 'DIARISTA' | 'CONTRATADO',
    profession: '',
  });

  const params = new URLSearchParams(window.location.search);
  const agencyId = params.get('agencyId');
  const currentAgency = agencies.find(a => a.id === agencyId);
  const agencyProfessions = Object.keys(currentAgency?.pricing?.professions || {});
  const baseProfessions = currentAgency?.segment || [];
  const defaultProfessions = ['Logística', 'Segurança', 'Limpeza', 'Eventos', 'Administração'];
  const professions = Array.from(new Set([...baseProfessions, ...agencyProfessions, ...defaultProfessions])).sort();
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
      toast("Não foi possível acessar a câmera.");
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
        if (step === 'PHOTO') {
          setFormData({ ...formData, photo: photoData });
        } else if (step === 'FACE_REG') {
          setFormData({ ...formData, faceReference: photoData });
        }
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
    
    if (isSubmitting) return;

    // Validações completas para todos os campos obrigatórios
    if (!formData.fullName.trim()) {
      toast.error("Por favor, preencha o seu nome completo.");
      return;
    }
    const names = formData.fullName.trim().split(' ').filter(Boolean);
    if (names.length < 2) {
      toast.error("Por favor, preencha o seu nome completo (Nome e Sobrenome).");
      return;
    }

    if (!formData.cpf.trim()) {
      toast.error("Por favor, preencha o seu CPF.");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Por favor, preencha o seu WhatsApp.");
      return;
    }

    if (!formData.birthDate.trim()) {
      toast.error("Por favor, preencha a sua data de nascimento.");
      return;
    }

    if (!formData.personalEmail.trim()) {
      toast.error("Por favor, preencha o seu e-mail.");
      return;
    }

    if (!formData.profession) {
      toast.error("Por favor, selecione a sua profissão.");
      return;
    }

    if (!formData.photo) {
      toast.error("Por favor, envie ou tire uma foto de perfil para o cadastro.");
      return;
    }

    if (!formData.document) {
      toast.error("Por favor, envie o seu documento (RG ou CNH).");
      return;
    }

    if (!formData.lgpdAuthorized) {
      toast.error("Você precisa autorizar o uso dos seus dados (LGPD) para continuar.");
      return;
    }

    setIsSubmitting(true);
    
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');

    const params = new URLSearchParams(window.location.search);
    const agencyId = params.get('agencyId');
    const urlCategory = params.get('category') as 'DIARISTA' | 'CONTRATADO' | null;

    const newEmployeeRegistration: any = {
      firstName,
      lastName,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      phone: formData.phone,
      personalEmail: formData.personalEmail,
      lgpdAuthorized: formData.lgpdAuthorized,
      status: 'PENDING',
      category: urlCategory || formData.category,
      profession: formData.profession || '',
      createdAt: new Date().toISOString()
    };
    
    if (formData.photo) newEmployeeRegistration.photoUrl = formData.photo;
    if (formData.document) newEmployeeRegistration.docUrl = formData.document.name;
    if (formData.eSocialBase64) newEmployeeRegistration.eSocialUrl = formData.eSocialBase64;
    if (formData.faceReference) newEmployeeRegistration.faceReferenceUrl = formData.faceReference;
    if (agencyId) newEmployeeRegistration.agencyId = agencyId;

    try {
      const docId = await createDocument('employeeRegistrations', newEmployeeRegistration);
      toast.success('Cadastro enviado com sucesso! Nossa equipe entrará em contato.');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (firebaseError: any) {
      console.error("Erro ao salvar cadastro no Firestore:", firebaseError);
      toast.error(`Falha ao salvar o cadastro: ${firebaseError?.message || firebaseError}`);
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
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>

          <div className="text-center mb-10 mt-4">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-200/50 overflow-hidden">
              <img 
                src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
                alt="ProStaff Brasil" 
                className="w-full h-auto object-contain p-2"
                referrerPolicy="no-referrer"
              />
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

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sua Profissão / Cargo</label>
              <select 
                required
                className="input-field"
                value={formData.profession}
                onChange={e => setFormData({...formData, profession: e.target.value})}
              >
                <option value="">Selecione sua profissão...</option>
                {professions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
                <option value="Outros">Outros</option>
              </select>
            </div>

            {!new URLSearchParams(window.location.search).get('category') && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria do Cadastro</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, category: 'DIARISTA'})}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all text-sm ${formData.category === 'DIARISTA' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                  >
                    Diarista
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, category: 'CONTRATADO'})}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all text-sm ${formData.category === 'CONTRATADO' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                  >
                    Contratado CLT
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Foto de Perfil (Selfie)</label>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full">OBRIGATÓRIO</span>
                </div>
                <div className="relative">
                  {formData.photo ? (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 shadow-sm">
                      <img src={formData.photo} alt="Selfie" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-emerald-500 text-white px-3 py-2 rounded-full text-[11px] font-bold shadow-lg">
                        <CheckCircle2 size={14} />
                        Foto Capturada ✓
                      </div>
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
                        className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group hover:scale-105"
                      >
                        <Camera className="text-slate-400 group-hover:text-blue-600 transition-colors" size={40} />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors text-center">📸 Tirar<br/>Selfie</span>
                      </button>
                      <label className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group hover:scale-105">
                        <Upload className="text-slate-400 group-hover:text-blue-600 transition-colors" size={40} />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors text-center">🖼️ Carregar<br/>Galeria</span>
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
                {!formData.photo && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-700 font-medium">
                      <p className="font-bold">A foto é obrigatória!</p>
                      <p className="text-[12px] text-blue-600 mt-1">Certifique-se que seu rosto está claro e bem iluminado.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Documento (RG ou CNH)</label>
                  <div className="relative">
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
                      className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${formData.document ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50'}`}
                    >
                      {formData.document ? (
                        <>
                          <CheckCircle2 size={32} />
                          <span className="text-sm font-bold">{formData.document.name}</span>
                        </>
                      ) : (
                        <>
                          <Database size={32} className="opacity-40" />
                          <span className="text-xs font-bold uppercase tracking-widest text-center">Selecionar Documento</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Documento eSocial (Opcional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      className="hidden" 
                      id="esocial-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({...formData, eSocialBase64: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="esocial-upload"
                      className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${formData.eSocialBase64 ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50'}`}
                    >
                      {formData.eSocialBase64 ? (
                        <>
                          <CheckCircle2 size={32} />
                          <span className="text-sm font-bold">eSocial Anexado</span>
                        </>
                      ) : (
                        <>
                          <FileText size={32} className="opacity-40" />
                          <span className="text-xs font-bold uppercase tracking-widest text-center">Anexar eSocial</span>
                        </>
                      )}
                    </label>
                  </div>
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
                disabled={isSubmitting}
                className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                    Finalizando cadastro...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Finalizar Cadastro
                  </>
                )}
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
    toast.success('Credenciais atualizadas com sucesso!');
  };

  const handleDeleteUser = (id: string, type: 'EMPLOYEE' | 'COMPANY') => {
    setDeleteTarget({ id, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    try {
      try {
        const q = query(collection(db, 'feedPosts'), where('creatorId', '==', id));
        const qs = await getDocs(q);
        await Promise.all(qs.docs.map(d => deleteDocument('feedPosts', d.id)));
      } catch (e) {
        console.error('Failed to cleanup feedposts for user', e);
      }
      
      await deleteDocument(type === 'EMPLOYEE' ? 'employees' : 'companyUsers', id);
      await deleteDocument('users', id);
      toast.success('Usuário excluído com sucesso!');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário.');
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
      toast.error('Erro ao alterar status do usuário.');
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
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [resetErrorMessage, setResetErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  
  const [orgInfo, setOrgInfo] = useState({
    logoUrl: agency?.logoUrl || '',
    name: agency?.name || '',
    email: agency?.email || user?.email || '',
    legalName: agency?.legalName || agency?.tradeName || '',
    addressLine1: agency?.address?.addressLine1 || agency?.address?.street || '',
    addressLine2: agency?.address?.addressLine2 || agency?.address?.complement || '',
    city: agency?.address?.city || '',
    state: agency?.address?.state || '',
    zipCode: agency?.address?.zipCode || '',
    country: agency?.address?.country || 'Brasil',
    phone: agency?.phone || '',
    taxId: agency?.taxId || agency?.cnpj || '',
    website: agency?.website || '',
    termsUrl: agency?.termsUrl || ''
  });

  useEffect(() => {
    if (role === 'AGENCY' && agency && !isEditing) {
      setOrgInfo({
        logoUrl: agency.logoUrl || '',
        name: agency.name || '',
        email: agency.email || user?.email || '',
        legalName: agency.legalName || agency.tradeName || '',
        addressLine1: agency.address?.addressLine1 || agency.address?.street || '',
        addressLine2: agency.address?.addressLine2 || agency.address?.complement || '',
        city: agency.address?.city || '',
        state: agency.address?.state || '',
        zipCode: agency.address?.zipCode || '',
        country: agency.address?.country || 'Brasil',
        phone: agency.phone || '',
        taxId: agency.taxId || agency.cnpj || '',
        website: agency.website || '',
        termsUrl: agency.termsUrl || ''
      });
    }
  }, [agency, role, user?.email, isEditing]);

  useEffect(() => {
    if (role === 'ADMIN') {
      const unsubscribe = onSnapshot(doc(db, 'settings', 'organization'), (snapshot) => {
        if (snapshot.exists() && !isEditing) {
          const data = snapshot.data();
          setOrgInfo(prev => ({ ...prev, ...data }));
        }
      });
      return () => unsubscribe();
    }
  }, [role, isEditing]);

  const handleSaveOrgInfo = async () => {
    if (role === 'AGENCY' && !agency) {
      toast.error('Erro: Dados da agência não encontrados. Tente sair e entrar novamente.');
      return;
    }

    setSaveStatus('SAVING');
    try {
      if (role === 'AGENCY' && agency) {
        console.log('Saving agency info for ID:', agency.id);
        await updateDocument('agencies', agency.id, {
          logoUrl: orgInfo.logoUrl,
          name: orgInfo.name,
          email: orgInfo.email,
          legalName: orgInfo.legalName,
          phone: orgInfo.phone,
          taxId: orgInfo.taxId,
          website: orgInfo.website,
          termsUrl: orgInfo.termsUrl,
          address: {
            ...agency.address,
            addressLine1: orgInfo.addressLine1,
            addressLine2: orgInfo.addressLine2,
            city: orgInfo.city,
            state: orgInfo.state,
            zipCode: orgInfo.zipCode,
            country: orgInfo.country
          }
        });
      } else if (role === 'ADMIN') {
        console.log('Saving admin org info');
        await setDocument('settings', 'organization', {
          ...orgInfo,
          updatedAt: new Date().toISOString()
        });
      }
      setSaveStatus('SUCCESS');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('IDLE'), 3000);
    } catch (err: any) {
      console.error('Error saving org info:', err);
      setSaveStatus('ERROR');
      let errorMessage = 'Erro ao salvar informações.';
      
      // Detailed error analysis
      const errorStr = err.message || String(err);
      if (errorStr.includes('quota')) {
        errorMessage = 'Cota do Firestore excedida. Tente novamente amanhã.';
      } else if (errorStr.includes('permission-denied')) {
        errorMessage = 'Sem permissão para salvar. Verifique se você é o dono desta agência.';
      } else if (errorStr.includes('too large') || errorStr.includes('1,048,576 bytes')) {
        errorMessage = 'A imagem do logotipo é muito grande, mesmo após compressão. Tente uma imagem bem menor.';
      } else {
        errorMessage = `Erro: ${errorStr}`;
      }
      toast(errorMessage);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast('O arquivo é muito grande (máx 2MB).');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions for logo
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setOrgInfo(prev => ({ ...prev, logoUrl: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendResetEmail = async () => {
    const email = employee?.personalEmail || companyUser?.email || user?.email;
    if (!email) {
      toast("E-mail não encontrado!");
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
      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-12">
            <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-zinc-950 p-2 shadow-xl">
              <div className="w-full h-full rounded-[1.5rem] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 overflow-hidden">
                {orgInfo.logoUrl ? (
                  <img src={orgInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-12 sm:pt-16 p-6 sm:p-12 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{displayName}</h2>
              <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] mt-1">{role === 'AGENCY' ? 'Administrador Agência' : role === 'COMPANY' ? 'Gestor Empresa' : 'Diarista Profissional'}</p>
            </div>
            <button 
              onClick={handleSendResetEmail}
              disabled={resetStatus === 'LOADING'}
              className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-50 shadow-lg"
            >
              {resetStatus === 'LOADING' ? 'Enviando...' : 'Redefinir Senha'}
            </button>
          </div>

          {resetStatus === 'SUCCESS' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              E-mail de redefinição enviado com sucesso para {employee?.personalEmail || companyUser?.email || user?.email}!
            </div>
          )}

          {resetStatus === 'ERROR' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
              {resetErrorMessage || 'Erro ao enviar e-mail de redefinição. Tente novamente mais tarde.'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail de Login</label>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 text-sm">
                {loginEmail}
              </div>
            </div>
            {personalEmail && (
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Pessoal</label>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {personalEmail}
                </div>
              </div>
            )}
          </div>

          {(role === 'ADMIN' || role === 'AGENCY') && (
            <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Informações da conta</h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {isEditing ? 'Cancelar' : 'Editar Informações'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Logotipo */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Logotipo da organização</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
                      {orgInfo.logoUrl ? (
                        <img src={orgInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={24} className="text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setOrgInfo(prev => ({ ...prev, logoUrl: '' }))}
                          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                          Excluir
                        </button>
                        <label className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                          Carregar
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={!isEditing} />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Tamanho máximo do arquivo: 2 MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nome da organização */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome da organização</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.name}
                      onChange={e => setOrgInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="StaffLink"
                    />
                  </div>

                  {/* Endereço de email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Endereço de email</label>
                    <input 
                      type="email"
                      disabled={!isEditing}
                      value={orgInfo.email}
                      onChange={e => setOrgInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="exemplo@email.com"
                    />
                  </div>

                  {/* Nome legal */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome legal</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.legalName}
                      onChange={e => setOrgInfo(prev => ({ ...prev, legalName: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="StaffLink LTDA"
                    />
                  </div>

                  {/* Endereço Linha 1 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Endereço Linha 1</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.addressLine1}
                      onChange={e => setOrgInfo(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="Ex. 123 Rua Principal"
                    />
                  </div>

                  {/* Linha de endereço 2 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Linha de endereço 2</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.addressLine2}
                      onChange={e => setOrgInfo(prev => ({ ...prev, addressLine2: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="Ex. Suíte 100"
                    />
                  </div>

                  {/* Cidade */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cidade</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.city}
                      onChange={e => setOrgInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="Ex. São Francisco"
                    />
                  </div>

                  {/* Estado/Província */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Estado/Província</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.state}
                      onChange={e => setOrgInfo(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="Ex. Califórnia"
                    />
                  </div>

                  {/* Código postal */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Código postal</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.zipCode}
                      onChange={e => setOrgInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="Ex. 94102"
                    />
                  </div>

                  {/* País */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">País</label>
                    <select 
                      disabled={!isEditing}
                      value={orgInfo.country}
                      onChange={e => setOrgInfo(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm appearance-none"
                    >
                      <option value="Brasil">Brasil</option>
                      <option value="EUA">EUA</option>
                      <option value="Portugal">Portugal</option>
                    </select>
                  </div>

                  {/* Telefone da empresa */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Telefone da empresa</label>
                    <div className="flex gap-2">
                      <div className="w-24 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl flex items-center gap-2">
                        <span className="text-sm dark:text-white">🇧🇷 +55</span>
                      </div>
                      <input 
                        type="text"
                        disabled={!isEditing}
                        value={orgInfo.phone}
                        onChange={e => setOrgInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                        placeholder="(27) 99204-9176"
                      />
                    </div>
                  </div>

                  {/* Número de identificação fiscal */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Número de identificação fiscal</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.taxId}
                      onChange={e => setOrgInfo(prev => ({ ...prev, taxId: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent rounded-2xl focus:bg-white focus:dark:bg-black focus:border-blue-600 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
                      placeholder="Ex. 1234567890"
                    />
                  </div>

                  {/* Site */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Site</label>
                    <input 
                      type="text"
                      disabled={!isEditing}
                      value={orgInfo.website}
                      onChange={e => setOrgInfo(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                      placeholder="Exemplo: https://www.9labs.com"
                    />
                  </div>
                </div>

                {/* URL dos termos de serviço */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">URL dos termos de serviço</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={orgInfo.termsUrl}
                    onChange={e => setOrgInfo(prev => ({ ...prev, termsUrl: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 text-sm"
                    placeholder="Exemplo: https://www.9labs.com/terms"
                  />
                </div>

                {isEditing && (
                  <div className="pt-4">
                    <button 
                      onClick={handleSaveOrgInfo}
                      disabled={saveStatus === 'SAVING'}
                      className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {saveStatus === 'SAVING' ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                )}

                {saveStatus === 'SUCCESS' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-medium text-center">
                    Informações salvas com sucesso!
                  </div>
                )}
              </div>
            </div>
          )}

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

function ServiceMonitoring({ assignments, companies, units, employees, clients }: { assignments: Assignment[], companies: Company[], units: Unit[], employees: Employee[], clients: Client[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const enrichedAssignments = assignments.map(assignment => {
    const employee = employees.find(e => e.id === assignment.employeeId);
    let companyName = 'N/A';
    let unitName = 'N/A';

    // Try to find by explicit IDs first
    const unit = assignment.unitId ? units.find(u => u.id === assignment.unitId) : units.find(u => u.clientId === assignment.clientId);
    const company = assignment.companyId ? companies.find(c => c.id === assignment.companyId) : (unit ? companies.find(c => c.id === unit.companyId) : companies.find(c => c.id === assignment.clientId));
    const client = clients.find(c => c.id === assignment.clientId);

    companyName = company?.name || client?.name || 'Empresa não identificada';
    unitName = unit?.name || 'Matriz';

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

function AgencyOnboarding({ user, agency, plans, onLogout }: { user: any, agency?: Agency, plans: Plan[], onLogout: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectPlan = async (planId: PlanType) => {
    if (!agency) return;
    setIsUpdating(true);
    try {
      await updateDocument('agencies', agency.id, { 
        plan: planId,
        updatedAt: new Date().toISOString()
      });
      toast.success('Plano selecionado com sucesso!');
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Erro ao selecionar plano.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!agency) return null;

  const hasSelectedPlan = !!agency.plan;

  if (!hasSelectedPlan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black py-20 px-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 bg-brand-50 dark:bg-blue-900/20 text-brand-500 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6"
            >
              <LayoutDashboard size={40} />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">Bem-vindo à StaffLink</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Você está quase lá! Como parte dos seus 30 dias de teste grátis, escolha o plano que melhor se adapta à sua operação após o período de experiência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.sort((a, b) => a.price - b.price).map((plan, index) => {
              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 transition-all flex flex-col hover:border-brand-200 dark:hover:border-blue-500/50 hover:shadow-xl group"
                >
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{plan.name}</h3>
                      <p className="text-3xl font-black text-brand-600 dark:text-blue-500">
                        {plan.price === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest ml-1">/mês</span>
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <CheckCircle2 size={16} className="text-brand-500 dark:text-blue-500 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isUpdating}
                    className="mt-10 py-5 bg-slate-950 dark:bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all hover:bg-brand-600 dark:hover:bg-blue-700 shadow-xl shadow-slate-900/10 dark:shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? 'Processando...' : `Selecionar ${plan.name}`}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center pt-8">
            <button onClick={onLogout} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-brand-50 dark:bg-blue-900/20 rounded-[32px] flex items-center justify-center text-brand-500 dark:text-blue-400 mx-auto">
          <CreditCard size={48} />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display text-center">Aguardando Pagamento</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Plano <strong>{plans.find(p => p.id === agency.plan)?.name}</strong> selecionado! <br />
            Para liberar seu acesso e iniciar o período de 30 dias de teste grátis, aguardamos a confirmação do pagamento inicial ou validação do administrador.
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3 text-left mt-6">
            <AlertCircle className="text-amber-600 dark:text-amber-400 mt-1 shrink-0" size={20} />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
              Dica: Entre em contato com nosso suporte para agilizar a liberação da sua conta.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            disabled
            className="w-full py-5 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-[24px] font-black text-xs uppercase tracking-widest cursor-not-allowed"
          >
            Pagar com PIX (Indisponível)
          </button>
          <button 
            onClick={onLogout}
            className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Sair da Conta
          </button>
        </div>
      </motion.div>
    </div>
  );
}
