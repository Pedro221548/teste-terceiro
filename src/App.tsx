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
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { UserRole, Employee, Client, Assignment, Feedback, ContactRequest, AccessPoint, CheckIn, Company, Unit, CompanyUser, PricingConfig, CompanyRequest, EmployeeRegistration } from './types';
import { MOCK_EMPLOYEES, MOCK_CLIENTS, MOCK_ASSIGNMENTS, MOCK_FEEDBACKS, MOCK_CONTACTS, MOCK_ACCESS_POINTS, MOCK_CHECKINS, DEFAULT_PRICING } from './constants';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40">
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

export default function App() {
  const [user, setUser] = useState<User | any | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
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
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [ratingLabel, setRatingLabel] = useState('Estrelas');
  const [impersonatedClientId, setImpersonatedClientId] = useState<string | null>(null);
  const [impersonatedEmployeeId, setImpersonatedEmployeeId] = useState<string | null>(null);

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

  const seedData = async () => {
    try {
      // 1. Create a fictitious company
      const companyId = await createDocument('companies', {
        name: "Restaurante Sabor Real",
        responsibleName: "Maria Oliveira",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 3333-4444",
        email: "contato@saborreal.com.br",
        address: "Rua das Flores, 123 - São Paulo, SP",
        createdAt: new Date().toISOString()
      });

      if (companyId) {
        // 2. Create a unit for this company
        const unitId = await createDocument('units', {
          companyId,
          name: "Unidade Centro",
          managerName: "Carlos Santos",
          location: "Centro, São Paulo",
          createdAt: new Date().toISOString()
        });

        if (unitId) {
          // 3. Create an access point for this unit
          await createDocument('accessPoints', {
            managerName: "Carlos Santos",
            location: "Unidade Centro - Restaurante Sabor Real",
            qrCodeValue: `UNIT_${unitId}`,
            createdAt: new Date().toISOString()
          });

          // 4. Create a Client entry for the staffing system
          const clientId = await createDocument('clients', {
            name: "Restaurante Sabor Real - Unidade Centro",
            managerName: "Carlos Santos",
            location: "Centro, São Paulo",
            activeScales: 0
          });
          if (clientId) {
            setImpersonatedClientId(clientId);
            await updateDocument('units', unitId, { clientId });
          }
        }
      }

      // 5. Create a fictitious employee
      const employeeId = await createDocument('employees', {
        firstName: "João",
        lastName: "Silva",
        cpf: "123.456.789-00",
        birthDate: "1990-05-15",
        phone: "(11) 98765-4321",
        rating: 5,
        status: "ACTIVE",
        complaints: 0,
        photoUrl: "https://picsum.photos/seed/joao/200",
        lastAssignmentDate: "",
        unavailableDates: []
      });

      if (employeeId) setImpersonatedEmployeeId(employeeId);

      alert("Dados fictícios cadastrados com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar dados fictícios:", error);
      alert("Erro ao cadastrar dados fictícios. Verifique o console.");
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    testConnection();
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      if (firebaseUser) {
        console.log('User is authenticated:', firebaseUser.uid);
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as UserRole;

        // Fetch or create user profile
        const userDoc = await getDocument<{ role: UserRole }>('users', firebaseUser.uid);
        if (userDoc) {
          setRole(userDoc.role);
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

    const unsubEmployees = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Employee>('employees', setEmployees) : () => {};
    const unsubClients = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Client>('clients', setClients) : () => {};
    
    // Role-based assignments subscription
    const assignmentConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', impersonatedEmployeeId || user.uid)] : 
                                 role === 'COMPANY' ? [where('clientId', '==', impersonatedClientId || user.uid)] : [];
    const unsubAssignments = subscribeToCollection<Assignment>('assignments', setAssignments, assignmentConstraints);
    
    const unsubFeedbacks = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<Feedback>('feedbacks', setFeedbacks) : () => {};
    
    // Only agency sees contacts
    const unsubContacts = role === 'AGENCY' ? subscribeToCollection<ContactRequest>('contacts', setContacts) : () => {};
    const unsubEmployeeRegistrations = role === 'AGENCY' ? subscribeToCollection<EmployeeRegistration>('employeeRegistrations', setEmployeeRegistrations) : () => {};
    
    const unsubAccessPoints = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<AccessPoint>('accessPoints', setAccessPoints) : () => {};
    
    // Role-based check-ins subscription
    const checkInConstraints = role === 'EMPLOYEE' ? [where('employeeId', '==', impersonatedEmployeeId || user.uid)] : [];
    const unsubCheckIns = subscribeToCollection<CheckIn>('checkIns', setCheckIns, checkInConstraints);

    const unsubCompanies = role === 'AGENCY' ? subscribeToCollection<Company>('companies', setCompanies) : () => {};
    const unsubUnits = role === 'AGENCY' ? subscribeToCollection<Unit>('units', setUnits) : () => {};
    const unsubCompanyUsers = role === 'AGENCY' ? subscribeToCollection<CompanyUser>('companyUsers', setCompanyUsers) : () => {};
    const unsubCompanyRequests = role === 'AGENCY' || role === 'COMPANY' ? subscribeToCollection<CompanyRequest>('companyRequests', setCompanyRequests) : () => {};

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
        isCustom: true
      });
      setRole('COMPANY');
      if (cUser.unitId) setImpersonatedClientId(units.find(u => u.id === cUser.unitId)?.clientId || null);
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

    // 3. Check for default Agency (Demo)
    if (emailInput === 'admin@stafflink.com' && passwordInput === 'admin123') {
      setUser({
        uid: 'agency-admin',
        email: 'admin@stafflink.com',
        displayName: 'Administrador StaffLink',
        isCustom: true
      });
      setRole('AGENCY');
      return;
    }

    // 4. Attempt Firebase Authentication
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
    if (roleParam === 'REGISTRATION') {
      setRole('REGISTRATION');
    }
  }, []);

  // Role Switcher for Demo
  const RoleSwitcher = () => {
    const impersonatedClient = clients.find(c => c.id === impersonatedClientId);
    const impersonatedEmployee = employees.find(e => e.id === impersonatedEmployeeId);

    return (
      <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-50">
        {(impersonatedClientId || impersonatedEmployeeId) && (
          <div className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-purple-100 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-4">
            {impersonatedClientId && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa: <span className="text-slate-900">{impersonatedClient?.name || 'Carregando...'}</span></p>
                <button onClick={() => setImpersonatedClientId(null)} className="text-slate-300 hover:text-rose-500 transition-colors ml-2">
                  <X size={12} />
                </button>
              </div>
            )}
            {impersonatedEmployeeId && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Func: <span className="text-slate-900">{impersonatedEmployee?.firstName}</span></p>
                <button onClick={() => setImpersonatedEmployeeId(null)} className="text-slate-300 hover:text-rose-500 transition-colors ml-2">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2 bg-white p-2 rounded-full shadow-2xl border border-gray-200">
          <button 
            onClick={() => {
              setRole('AGENCY');
              setActiveTab('dashboard');
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'AGENCY' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            Agência
          </button>
          <button 
            onClick={() => {
              setRole('COMPANY');
              setActiveTab('manager_dashboard');
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'COMPANY' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            Empresa
          </button>
          <button 
            onClick={() => {
              setRole('EMPLOYEE');
              setActiveTab('employee_schedule');
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'EMPLOYEE' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            Funcionário
          </button>
          <button 
            onClick={() => {
              setRole('REGISTRATION');
              setActiveTab('registration_form');
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role === 'REGISTRATION' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            Registro
          </button>
        </div>
      </div>
    );
  };

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
      <div className="min-h-screen flex bg-slate-50 overflow-hidden">
        {/* Left Side: Purpose/Branding - Website Style */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full -mr-64 -mt-64 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full -ml-64 -mb-64 blur-[120px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 transform -rotate-6">
                <Building2 size={32} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white">StaffLink</h1>
            </div>
            
            <div className="space-y-10 max-w-xl">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-6xl font-black text-white leading-[1.1] tracking-tight"
              >
                A revolução na <br />
                <span className="text-blue-500">Gestão de Diaristas.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-400 font-medium leading-relaxed"
              >
                O StaffLink é o ecossistema completo para agências que buscam excelência operacional, automação de escalas e controle total em tempo real.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
              >
                <img 
                  src="https://i.postimg.cc/DzDWGjNx/Chat-GPT-Image-30-de-mar-de-2026-02-01-43.png" 
                  alt="StaffLink Purpose" 
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-8 pt-10"
              >
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                    <Calendar size={24} />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-2">Escalas Inteligentes</h4>
                  <p className="text-slate-500 text-sm font-medium">Distribua sua equipe com precisão cirúrgica.</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                    <QrCode size={24} />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-2">Ponto Digital</h4>
                  <p className="text-slate-500 text-sm font-medium">Segurança e transparência via QR Code.</p>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span>© 2026 StaffLink</span>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Privacidade</span>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Termos</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white lg:bg-slate-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
              {/* Decorative background for the card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
              
              <div className="text-center mb-12 relative z-10">
                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner transform hover:rotate-12 transition-transform duration-500">
                  <Building2 size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Portal de Gestão</h3>
                <p className="text-slate-500 font-medium px-4">Faça login para acessar o sistema de gestão de diaristas.</p>
              </div>

              <form className="space-y-6 relative z-10" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuário ou E-mail</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="seu@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                    <button type="button" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">Esqueceu?</button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={14} />
                    {loginError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-[0.98] mt-4"
                >
                  Entrar no Sistema
                </button>

                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Acesso de Demonstração (Admin)</p>
                  <p className="text-[10px] font-bold text-slate-600">E-mail: <span className="text-blue-600">admin@stafflink.com</span></p>
                  <p className="text-[10px] font-bold text-slate-600">Senha: <span className="text-blue-600">admin123</span></p>
                </div>
              </form>

              <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-6 text-slate-400">Ou autentique com</span>
                </div>
              </div>

              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 text-slate-700 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98] shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Entrar com Google
              </button>

              <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Novo por aqui? <button className="text-blue-600 hover:text-blue-800 transition-colors ml-1">Solicite Acesso</button>
                </p>
              </div>
            </div>
            
            {/* Mobile Purpose Text */}
            <div className="lg:hidden mt-12 text-center px-6">
              <h4 className="text-xl font-black text-slate-900 mb-2">StaffLink</h4>
              <p className="text-slate-500 text-sm font-medium">Gestão inteligente para agências de diaristas.</p>
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
          <RoleSwitcher />
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
          <RoleSwitcher />
          <CompanyRegistrationForm 
            onComplete={() => setRole('COMPANY')} 
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
        <RoleSwitcher />
        
        <div className="flex">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full flex flex-col">
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Building2 size={22} />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white">StaffLink</h1>
                </div>
              </div>

              <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {role === 'AGENCY' && (
                  <>
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Principal</div>
                    <SidebarItem 
                      icon={<LayoutDashboard size={18} />} 
                      label="Dashboard" 
                      active={activeTab === 'dashboard'} 
                      onClick={() => setActiveTab('dashboard')} 
                    />
                    <SidebarItem 
                      icon={<Calendar size={18} />} 
                      label="Escala" 
                      active={activeTab === 'staffing'} 
                      onClick={() => setActiveTab('staffing')} 
                    />
                    <div className="px-4 py-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão</div>
                    <SidebarItem 
                      icon={<Building2 size={18} />} 
                      label="Empresas" 
                      active={activeTab === 'companies'} 
                      onClick={() => setActiveTab('companies')} 
                    />
                    <SidebarItem 
                      icon={<UserPlus size={18} />} 
                      label="Cadastros" 
                      active={activeTab === 'registrations'} 
                      onClick={() => setActiveTab('registrations')} 
                    />
                    <SidebarItem 
                      icon={<QrCode size={18} />} 
                      label="Controle de Acesso" 
                      active={activeTab === 'access_control'} 
                      onClick={() => setActiveTab('access_control')} 
                    />
                    <SidebarItem 
                      icon={<CreditCard size={18} />} 
                      label="Precificação" 
                      active={activeTab === 'pricing'} 
                      onClick={() => setActiveTab('pricing')} 
                    />
                    <SidebarItem 
                      icon={<MessageSquare size={18} />} 
                      label="Feedbacks" 
                      active={activeTab === 'feedbacks'} 
                      onClick={() => setActiveTab('feedbacks')} 
                    />
                    <SidebarItem 
                      icon={<Lock size={18} />} 
                      label="Gestão de Logins" 
                      active={activeTab === 'user_management'} 
                      onClick={() => setActiveTab('user_management')} 
                    />
                    <SidebarItem 
                      icon={<UserIcon size={18} />} 
                      label="Meu Perfil" 
                      active={activeTab === 'profile'} 
                      onClick={() => setActiveTab('profile')} 
                    />
                  </>
                )}
                {role === 'COMPANY' && (
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
                      active={activeTab === 'evaluate_team'} 
                      onClick={() => setActiveTab('evaluate_team')} 
                    />
                    <SidebarItem 
                      icon={<Users size={20} />} 
                      label="Diaristas" 
                      active={activeTab === 'company_diaristas'} 
                      onClick={() => setActiveTab('company_diaristas')} 
                    />
                    <SidebarItem 
                      icon={<UserIcon size={20} />} 
                      label="Meu Perfil" 
                      active={activeTab === 'profile'} 
                      onClick={() => setActiveTab('profile')} 
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
                      icon={<UserIcon size={20} />} 
                      label="Meu Perfil" 
                      active={activeTab === 'profile'} 
                      onClick={() => setActiveTab('profile')} 
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

              <div className="p-6 border-t border-slate-800">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full p-4 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group"
                >
                  <div className="group-hover:scale-110 transition-transform">
                    <LogOut size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50/30">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-6 flex items-center justify-between">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center gap-8 ml-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 tracking-tight leading-none">
                    {user.displayName || 'Usuário'}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-xl overflow-hidden ring-1 ring-slate-200 group cursor-pointer hover:scale-105 transition-all">
                  <img src={user.photoURL || "https://picsum.photos/seed/user/100"} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </header>

            <div className="p-10 max-w-7xl mx-auto">
              {role === 'EMPLOYEE' && (
                <div className="mb-8 p-6 bg-purple-50 border border-purple-100 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-purple-900 uppercase tracking-tight">Modo de Teste: Selecionar Perfil</h3>
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Escolha um funcionário cadastrado para simular o portal.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select 
                      value={impersonatedEmployeeId || ''} 
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setImpersonatedEmployeeId(val);
                        if (val) {
                          const emp = employees.find(e => e.id === val);
                          if (emp) alert(`Simulando como: ${emp.firstName}`);
                        }
                      }}
                      className="flex-1 sm:w-64 px-4 py-3 bg-white border-2 border-purple-100 rounded-xl text-xs font-bold text-slate-700 focus:border-purple-400 outline-none transition-all shadow-sm"
                    >
                      <option value="">Meu Perfil (Padrão)</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.status})</option>
                      ))}
                    </select>
                    {impersonatedEmployeeId && (
                      <button 
                        onClick={() => setImpersonatedEmployeeId(null)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Limpar Seleção"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {role === 'COMPANY' && (
                <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Modo de Teste: Selecionar Empresa</h3>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Escolha uma empresa cadastrada para simular o portal.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select 
                      value={impersonatedClientId || ''} 
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setImpersonatedClientId(val);
                        if (val) {
                          const client = clients.find(c => c.id === val);
                          if (client) alert(`Simulando como: ${client.name}`);
                        }
                      }}
                      className="flex-1 sm:w-64 px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-xs font-bold text-slate-700 focus:border-emerald-400 outline-none transition-all shadow-sm"
                    >
                      <option value="">Minha Empresa (Padrão)</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name} ({client.city})</option>
                      ))}
                    </select>
                    {impersonatedClientId && (
                      <button 
                        onClick={() => setImpersonatedClientId(null)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Limpar Seleção"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              )}

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
                      employee={role === 'EMPLOYEE' ? (impersonatedEmployeeId ? employees.find(e => e.id === impersonatedEmployeeId) : employees.find(e => e.loginEmail === user?.email)) : undefined}
                      companyUser={role === 'COMPANY' ? (impersonatedClientId ? companyUsers.find(cu => cu.companyId === impersonatedClientId) : companyUsers.find(cu => cu.email === user?.email)) : undefined}
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
                      onSeedData={seedData}
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
                      onImpersonate={setImpersonatedEmployeeId}
                      impersonatedId={impersonatedEmployeeId}
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
                      onImpersonate={setImpersonatedClientId}
                      impersonatedId={impersonatedClientId}
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
                      clientId={impersonatedClientId || user.uid} 
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'manager_feedback' && (
                  <div key="company-feedback">
                    <CompanyFeedbackForm 
                      clientId={impersonatedClientId || user.uid}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                    />
                  </div>
                )}
                {role === 'COMPANY' && activeTab === 'company_diaristas' && (
                  <div key="company-diaristas">
                    <CompanyDiaristas 
                      clientId={impersonatedClientId || user.uid}
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
                      clientId={impersonatedClientId || user.uid}
                      clients={clients}
                      assignments={assignments}
                      employees={employees}
                      feedbacks={feedbacks}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_schedule' && (
                  <div key="employee-schedule">
                    <EmployeeSchedule 
                      employeeId={impersonatedEmployeeId || user.uid} 
                      employees={employees}
                      assignments={assignments}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_profile' && (
                  <div key="employee-profile">
                    <EmployeeProfile 
                      employeeId={impersonatedEmployeeId || user.uid}
                      employees={employees}
                      assignments={assignments}
                    />
                  </div>
                )}
                {role === 'EMPLOYEE' && activeTab === 'employee_ponto' && (
                  <div key="employee-ponto">
                    <EmployeePonto 
                      employeeId={impersonatedEmployeeId || user.uid}
                      employees={employees}
                      accessPoints={accessPoints}
                      checkIns={checkIns}
                      assignments={assignments}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all group relative overflow-hidden ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
        />
      )}
    </button>
  );
}

function AgencyDashboard({ assignments, employees, contacts, employeeRegistrations, pricing, ratingLabel, onSeedData }: { assignments: Assignment[], employees: Employee[], contacts: ContactRequest[], employeeRegistrations: EmployeeRegistration[], pricing: PricingConfig, ratingLabel: string, onSeedData: () => void }) {
  const [selectedRegistration, setSelectedRegistration] = useState<EmployeeRegistration | null>(null);
  const [showProcessRegistrationModal, setShowProcessRegistrationModal] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayAssignments = assignments.filter(a => a.date === today);
  const totalValue = todayAssignments.reduce((acc, curr) => acc + curr.value, 0);
  const activeClients = new Set(todayAssignments.map(a => a.clientId)).size;
  const pendingContacts = contacts.filter(c => c.status === 'PENDING').length;

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = daysOfWeek[new Date().getDay()];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="flex flex-col gap-2 relative">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Visão Geral</h2>
        <p className="text-slate-500 font-medium">Acompanhe o desempenho da sua agência hoje.</p>
        
        <button 
          onClick={onSeedData}
          className="absolute top-0 right-0 px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} />
          Cadastrar Dados de Teste
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={<Users size={24} />} 
          label="Funcionários Escalados" 
          value={todayAssignments.length.toString()} 
          trend="+12% vs ontem"
          color="blue"
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Valor Agregado (Hoje)" 
          value={`R$ ${totalValue.toFixed(2)}`} 
          trend={`Média R$ ${(totalValue / (todayAssignments.length || 1)).toFixed(2)}/func`}
          color="emerald"
        />
        <StatCard 
          icon={<Building2 size={24} />} 
          label="Clientes Atendidos" 
          value={activeClients.toString()} 
          trend="2 novos contratos"
          color="purple"
        />
        <StatCard 
          icon={<Phone size={24} />} 
          label="Contatos Pendentes" 
          value={pendingContacts.toString()} 
          trend="Link Direto"
          alert={pendingContacts > 0}
          color="orange"
        />
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -mr-32 -mt-32 transition-all group-hover:scale-110"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 shadow-inner">
                {pricing.type === 'STARS' ? <Star size={32} className="fill-yellow-400" /> : <Calendar size={32} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Tabela de Preços {pricing.type === 'STARS' ? `por ${ratingLabel}` : 'por Dia da Semana'}
                </h3>
                <p className="text-sm text-slate-400 font-medium tracking-wide">Valores baseados na configuração atual.</p>
              </div>
            </div>
            {pricing.type === 'DAILY' && (
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                Hoje: {todayName}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {pricing.type === 'STARS' ? (
              Object.entries(pricing.stars || {}).map(([stars, p]) => (
                <div key={stars} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center gap-4 hover:bg-white hover:border-yellow-200 hover:shadow-xl hover:shadow-yellow-500/5 transition-all group/price">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < parseInt(stars) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">R$ {(p.employee + p.company).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Valor por diária</p>
                  </div>
                </div>
              ))
            ) : (
              ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => {
                const p = pricing.weekly?.[day] || { employee: 0, company: 0 };
                const isToday = day === todayName;
                return (
                  <div key={day} className={`p-8 rounded-[2rem] border flex flex-col items-center gap-4 transition-all group/price ${isToday ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>{day}</span>
                    <div className="text-center">
                      <p className={`text-2xl font-black tracking-tight ${isToday ? 'text-white' : 'text-slate-900'}`}>R$ {(p.employee + p.company).toFixed(2)}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isToday ? 'text-blue-200' : 'text-slate-400'}`}>Valor por diária</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
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
            {employeeRegistrations.filter(r => r.status === 'PENDING').map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-green-300 bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{r.firstName} {r.lastName}</p>
                    <p className="text-xs text-gray-500">{r.phone}</p>
                    <p className="text-[10px] text-green-600 font-bold">Nova Solicitação</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedRegistration(r);
                    setShowProcessRegistrationModal(true);
                  }}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
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
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 text-blue-600 border-blue-100',
    indigo: 'from-indigo-50 to-purple-50 text-indigo-600 border-indigo-100',
    emerald: 'from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100',
    orange: 'from-orange-50 to-amber-50 text-orange-600 border-orange-100',
    purple: 'from-purple-50 to-fuchsia-50 text-purple-600 border-purple-100',
    rose: 'from-rose-50 to-pink-50 text-rose-600 border-rose-100',
  };

  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden ${alert ? 'ring-4 ring-orange-50/50 border-orange-200' : ''}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 bg-gradient-to-br ${colorClasses[color]} rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {alert && (
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">Alerta</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h4 className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{value}</h4>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{trend}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeSchedule({ employeeId, employees, assignments }: { employeeId: string, employees: Employee[], assignments: Assignment[] }) {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'UNAVAILABILITY'>('SCHEDULE');
  const employee = employees.find(e => e.id === employeeId);
  
  if (!employee) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <UserIcon size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Perfil não encontrado</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Selecione um funcionário cadastrado no seletor de teste acima para visualizar a agenda.</p>
      </div>
    );
  }

  const myAssignments = assignments.filter(a => a.employeeId === employeeId);

  const toggleUnavailability = async (date: string) => {
    if (!employee) return;
    const current = employee.unavailableDates || [];
    const exists = current.includes(date);
    const newDates = exists ? current.filter(d => d !== date) : [...current, date];
    await updateDocument('employees', employee.id, { unavailableDates: newDates });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-gray-900">Agenda do Funcionário</h2>
        <p className="text-gray-500">Gerencie suas escalas e informe sua disponibilidade.</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('SCHEDULE')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SCHEDULE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Minhas Escalas
        </button>
        <button 
          onClick={() => setActiveTab('UNAVAILABILITY')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'UNAVAILABILITY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Indisponibilidade
        </button>
      </div>

      {activeTab === 'SCHEDULE' ? (
        <div className="grid grid-cols-1 gap-4">
          {myAssignments.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Você não tem escalas agendadas no momento.</p>
            </div>
          ) : (
            myAssignments.map(as => {
              const cli = MOCK_CLIENTS.find(c => c.id === as.clientId);
              return (
                <div key={as.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{cli?.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(as.date).toLocaleDateString('pt-BR')}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> 08:00 - 17:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">R$ {as.value.toFixed(2)}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">Confirmado</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Selecione os dias que você NÃO está disponível</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
            ))}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
              const isUnavailable = employee?.unavailableDates?.includes(dateStr);
              return (
                <button 
                  key={i}
                  onClick={() => toggleUnavailability(dateStr)}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isUnavailable 
                      ? 'bg-red-100 text-red-600 border-2 border-red-200' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
            <AlertCircle className="text-blue-600" size={24} />
            <p className="text-sm text-blue-800">
              Os dias marcados em <strong>vermelho</strong> indicam que você não poderá ser escalado pela agência.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
function EmployeeFeedbackView({ feedbacks, employees, clients }: { feedbacks: Feedback[], employees: Employee[], clients: Client[] }) {
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
                  <span>Avaliado por: {clients.find(c => c.id === f.managerId)?.managerName || 'Empresa Parceira'}</span>
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
    
    // Simulate email sending
    console.log(`Enviando e-mail para ${employee.personalEmail || 'N/A'}...`);
    console.log(`Credenciais: Usuário: ${username}, Senha: ${password}`);
    
    await updateDocument('employees', employee.id, { 
      username, 
      status: 'ACTIVE' 
    });

    // In a real app, you'd call a backend service here to send the actual email
    // and create the auth user.
    
    alert(`Usuário criado com sucesso! Credenciais enviadas para ${employee.personalEmail || employee.phone}.`);
    onComplete(username);
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
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, registration.personalEmail, password);
      const newUid = userCredential.user.uid;

      // 2. Create employee record
      await setDocument('employees', newUid, {
        firstName: registration.firstName,
        lastName: registration.lastName,
        cpf: registration.cpf,
        birthDate: registration.birthDate,
        phone: registration.phone,
        personalEmail: registration.personalEmail,
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
      await setDocument('users', newUid, { role: 'EMPLOYEE', email: registration.personalEmail });

      // 4. Mark registration as processed
      await updateDocument('employeeRegistrations', registration.id, { status: 'PROCESSED' });

      // 5. Simulate sending credentials
      console.log(`Enviando credenciais para ${registration.phone}...`);
      const message = `Olá ${registration.firstName}! Seu cadastro foi aprovado.\n\nUsuário: ${username}\nSenha: ${password}\n\nAcesse o sistema em: ${window.location.origin}`;
      const whatsappUrl = `https://wa.me/55${registration.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      alert(`Cadastro finalizado! Credenciais enviadas para ${registration.phone}.`);
      onComplete();
    } catch (error) {
      console.error('Error processing registration:', error);
      alert('Erro ao processar cadastro. Verifique se o e-mail já está em uso.');
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

function AgencyRegistrations({ employees, clients, ratingLabel, onImpersonate, impersonatedId }: { employees: Employee[], clients: Client[], ratingLabel: string, onImpersonate: (id: string | null) => void, impersonatedId: string | null }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPhone, setLinkPhone] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  const handleDeleteEmployee = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDocument('employees', deleteId);
      setDeleteId(null);
      setSelectedEmployee(null);
    }
  };

  const handleApprove = async (id: string) => {
    await updateDocument('employees', id, { status: 'ACTIVE' });
    setSelectedEmployee(null);
  };

  const sendInactivityWarning = (emp: Employee) => {
    const message = `Olá ${emp.firstName}, notamos que você está há mais de 30 dias sem realizar escalas. Informamos que seu cadastro poderá ser removido dos nossos registros em breve. Caso tenha interesse em continuar, entre em contato!`;
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
      className="space-y-10"
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Funcionários</h2>
          <p className="text-slate-500 font-medium">Cadastre novos talentos ou gerencie os atuais.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowLinkModal(true)}
            className="flex items-center gap-3 px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all active:scale-95"
          >
            <LinkIcon size={18} />
            Enviar Link
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <UserPlus size={18} />
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden relative"
          >
            {isCameraOpen && (
              <div className="absolute inset-0 z-50 bg-black flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="p-8 flex justify-center gap-6 bg-black/50 backdrop-blur-md">
                  <button onClick={stopCamera} className="p-5 bg-white/10 text-white rounded-full hover:bg-red-600 transition-all border border-white/20"><X size={24} /></button>
                  <button onClick={takePhoto} className="p-5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/50"><Camera size={24} /></button>
                </div>
              </div>
            )}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Editar Cadastro' : 'Cadastro Direto'}</h3>
                <p className="text-xs text-slate-400 font-medium">{isEditing ? 'Atualize os dados do profissional.' : 'Preencha os dados do novo talento.'}</p>
              </div>
              <button onClick={() => { setShowForm(false); setIsEditing(false); setSelectedEmployee(null); }} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sobrenome</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CPF</label>
                  <input 
                    required
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Data de Nascimento</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">E-mail Pessoal</label>
                <input 
                  required
                  type="email" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  value={formData.personalEmail}
                  onChange={e => setFormData({...formData, personalEmail: e.target.value})}
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                  required
                  type="checkbox" 
                  id="lgpd-agency"
                  className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  checked={formData.lgpdAuthorized}
                  onChange={e => setFormData({...formData, lgpdAuthorized: e.target.checked})}
                />
                <label htmlFor="lgpd-agency" className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  O colaborador autoriza o uso dos dados pessoais conforme a LGPD.
                </label>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Foto Profissional</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={startCamera}
                    className="p-8 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-all bg-slate-50/50 group"
                  >
                    <Camera size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Câmera</p>
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-400 hover:text-emerald-400 cursor-pointer transition-all bg-slate-50/50 group"
                  >
                    <Upload size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Galeria</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleGalleryUpload} 
                    />
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
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                {isEditing ? 'Salvar Alterações' : 'Finalizar Cadastro'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Inatividade</h3>
                <p className="text-xs text-slate-400 font-medium">+30 dias sem escalas</p>
              </div>
            </div>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
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

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-bold text-slate-900">Base de Funcionários</h3>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total: {employees.length}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionário</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nascimento</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          emp.firstName[0]
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">{emp.phone}</p>
                        {emp.personalEmail && <p className="text-[10px] text-blue-500 font-bold tracking-tight">{emp.personalEmail}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-500 font-mono tracking-tighter">{emp.cpf}</td>
                  <td className="p-6 text-xs text-slate-500 font-medium">{new Date(emp.birthDate).toLocaleDateString('pt-BR')}</td>
                  <td className="p-6">
                    <div className="flex gap-0.5 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      emp.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100/50' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {emp.status === 'ACTIVE' ? 'Ativo' : emp.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      {emp.status === 'PENDING' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmployeeToCreateUserFor(emp);
                            setShowCreateUserModal(true);
                          }}
                          className="text-[10px] bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                          Criar Usuário
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          onImpersonate(emp.id);
                          alert(`Agora visualizando como ${emp.firstName}`);
                        }}
                        className={`p-2.5 rounded-xl transition-all ${impersonatedId === emp.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-300 hover:text-purple-600 hover:bg-purple-50'}`}
                        title="Visualizar como este Funcionário"
                      >
                        <Scan size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(emp)}
                        className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar Cadastro"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="p-1 text-slate-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="relative h-40 bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-6 right-6 p-2.5 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-10 pb-10">
                <div className="relative -mt-16 mb-8 flex items-end gap-8">
                  <div className="w-40 h-40 rounded-[2rem] border-8 border-white bg-slate-100 overflow-hidden shadow-2xl">
                    <img src={selectedEmployee.photoUrl || `https://picsum.photos/seed/${selectedEmployee.id}/400`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="pb-4">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < selectedEmployee.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                        ))}
                      </div>
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">({selectedEmployee.rating}.0)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informações Gerais</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <CreditCard size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Documento</p>
                            <p className="text-sm font-mono font-bold text-slate-700">{selectedEmployee.cpf}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Nascimento</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(selectedEmployee.birthDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Phone size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</p>
                            <p className="text-sm font-bold text-slate-700">{selectedEmployee.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Status Operacional</h4>
                      <span className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest border shadow-sm ${
                        selectedEmployee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        selectedEmployee.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {selectedEmployee.status === 'ACTIVE' ? 'Ativo' : selectedEmployee.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Histórico & Feedback</h4>
                      <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full -mr-10 -mt-10 transition-all group-hover:scale-150"></div>
                        <div className="flex items-center gap-3 text-rose-600 mb-4">
                          <AlertCircle size={18} />
                          <span className="text-xs font-black uppercase tracking-wider">{selectedEmployee.complaints} Reclamações</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed italic font-medium">"Funcionário demonstrou bom desempenho nas últimas escalas, porém precisa melhorar a pontualidade."</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button 
                        onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                        className="w-full py-4 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-100/50"
                      >
                        <Trash2 size={18} />
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

function AgencyStaffing({ employees, assignments, clients, getScaleValue, companyRequests }: { employees: Employee[], assignments: Assignment[], clients: Client[], getScaleValue: (rating: number) => number, companyRequests: CompanyRequest[] }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [filterType, setFilterType] = useState<'RATING' | 'COMPLAINTS'>('RATING');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'STAFFING' | 'CONFIRMED' | 'REQUESTS'>('STAFFING');

  const sortedEmployees = [...employees].sort((a, b) => {
    if (filterType === 'RATING') return b.rating - a.rating;
    return a.complaints - b.complaints;
  });

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

    await createDocument('assignments', newAs);
    await updateDocument('employees', empId, { lastAssignmentDate: selectedDate });
    
    // WhatsApp Notification with confirmation link
    const appUrl = window.location.origin;
    const confirmationLink = `${appUrl}?role=EMPLOYEE&tab=employee_profile`;
    const message = `Olá ${emp.firstName}! Você foi escalado para atuar na unidade ${client.name}.\n\n📅 Data: ${new Date(selectedDate).toLocaleDateString('pt-BR')}\n⏰ Horário: 08:00\n📍 Localização: ${client.location || client.name}\n\n✅ Por favor, confirme sua presença clicando no link abaixo:\n${confirmationLink}\n\n⚠️ Lembre-se: Há um QR Code na parede da unidade para você bater o ponto usando o app. Boa escala!`;
    const whatsappUrl = `https://wa.me/55${emp.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    alert(`${emp.firstName} escalado com sucesso para o dia ${new Date(selectedDate).toLocaleDateString('pt-BR')}!`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Escala Inteligente</h2>
          <p className="text-slate-500 font-medium">Distribua sua equipe com base em performance e disponibilidade.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200">
          <button 
            onClick={() => setActiveSubTab('STAFFING')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'STAFFING' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Escalar
          </button>
          <button 
            onClick={() => setActiveSubTab('CONFIRMED')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'CONFIRMED' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Confirmados
          </button>
          <button 
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'REQUESTS' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Solicitações
          </button>
        </div>
      </div>

      {activeSubTab === 'STAFFING' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                Data da Escala
              </h3>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">2</div>
                Selecionar Parceiro
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {clients.map(cli => (
                  <button 
                    key={cli.id}
                    onClick={() => setSelectedClientId(cli.id)}
                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all border-2 ${
                      selectedClientId === cli.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1' 
                        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-blue-100'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-black text-sm uppercase tracking-tight">{cli.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedClientId === cli.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        Responsável: {cli.managerName}
                      </p>
                    </div>
                    {selectedClientId === cli.id && <CheckCircle size={20} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">3</div>
                Critério de Filtro
              </h3>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-[1.5rem]">
                <button 
                  onClick={() => setFilterType('RATING')}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === 'RATING' ? 'bg-white text-blue-600 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star size={18} className={filterType === 'RATING' ? 'fill-yellow-400 text-yellow-400' : ''} />
                  Estrelas
                </button>
                <button 
                  onClick={() => setFilterType('COMPLAINTS')}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === 'COMPLAINTS' ? 'bg-white text-blue-600 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <AlertCircle size={18} />
                  Queixas
                </button>
              </div>
            </div>
          </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm">4</div>
              Equipe Disponível
            </h3>
            <div className="px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {sortedEmployees.filter(e => !assignments.some(a => a.employeeId === e.id && a.date === selectedDate)).length} Disponíveis
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEmployees.map(emp => {
              const isAssigned = assignments.some(a => a.employeeId === emp.id && a.date === selectedDate);
              return (
                <div key={emp.id} className={`p-6 rounded-[2rem] border-2 transition-all relative group ${
                  isAssigned 
                    ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
                    : 'bg-white border-slate-50 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1'
                }`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                        <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{emp.firstName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={i < emp.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-400">({emp.rating}.0)</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">R$ {getScaleValue(emp.rating)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                      <span className={`text-xs font-bold ${isAssigned ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isAssigned ? 'Já escalado neste dia' : 'Disponível'}
                      </span>
                    </div>
                    {!isAssigned && (
                      <button 
                        onClick={() => handleStaff(emp.id)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                      >
                        Escalar
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
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Profissionais Confirmados</h3>
              <p className="text-slate-400 text-sm font-medium">Equipe que já confirmou presença para o dia selecionado.</p>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm outline-none focus:border-blue-600"
              />
              <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  {assignments.filter(a => a.confirmed && a.date === selectedDate).length} Confirmados
                </span>
              </div>
            </div>
          </div>

          {assignments.filter(a => a.confirmed && a.date === selectedDate).length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <CheckCircle size={40} />
              </div>
              <p className="text-slate-400 font-medium">Nenhuma confirmação para esta data ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.filter(a => a.confirmed && a.date === selectedDate).map(as => {
                const emp = employees.find(e => e.id === as.employeeId);
                const client = clients.find(c => c.id === as.clientId);
                if (!emp || !client) return null;
                return (
                  <div key={as.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                        <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{client.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Confirmado</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(as.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Solicitações das Empresas</h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Pedidos de profissionais para datas específicas</p>
            </div>
          </div>

          <div className="space-y-6">
            {companyRequests.map(req => {
              const client = clients.find(c => c.id === req.clientId);
              return (
                <div key={req.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-slate-100">
                      <Building2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{client?.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} /> {new Date(req.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Users size={12} /> {req.quantity} Profissionais
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex -space-x-3">
                      {req.employeeIds.map(empId => {
                        const emp = employees.find(e => e.id === empId);
                        return (
                          <div key={empId} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-slate-200" title={emp?.firstName}>
                            <img src={emp?.photoUrl || `https://picsum.photos/seed/${empId}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                        Atender Pedido
                      </button>
                      <button className="px-6 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95">
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
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Configurações de Preço</h2>
          <p className="text-slate-500 font-medium">Defina os valores das diárias e o sistema de classificação.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setLocalPricing({ ...localPricing, type: 'STARS' })}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localPricing.type === 'STARS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Por {localLabel}
            </button>
            <button 
              onClick={() => setLocalPricing({ ...localPricing, type: 'DAILY' })}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localPricing.type === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Por Dia
            </button>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <CheckCircle size={20} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              {localPricing.type === 'STARS' ? <Star size={24} /> : <Calendar size={24} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
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

        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sistema de Classificação</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome da Classificação</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="Ex: Estrelas, Nível, Categoria"
                  value={localLabel}
                  onChange={e => setLocalLabel(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">* Isso mudará como o sistema se refere à pontuação do funcionário.</p>
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 shrink-0" size={20} />
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Ao alterar o nome da classificação, todos os dashboards e relatórios serão atualizados automaticamente para refletir o novo termo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-2xl font-black mb-4 tracking-tight">Resumo de Ganhos</h3>
            <p className="text-blue-100 mb-8 font-medium leading-relaxed">
              O valor total cobrado do cliente é a soma do que o funcionário recebe e a taxa da empresa.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <span className="text-sm font-bold opacity-80">Média Funcionário</span>
                <span className="text-xl font-black">R$ 65,00</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <span className="text-sm font-bold opacity-80">Média Empresa</span>
                <span className="text-xl font-black">R$ 15,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AgencyCompanies({ companies, units, companyUsers, clients, onImpersonate, impersonatedId }: { companies: Company[], units: Unit[], companyUsers: CompanyUser[], clients: Client[], onImpersonate: (id: string | null) => void, impersonatedId: string | null }) {
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Parceiros</h2>
          <p className="text-slate-500 font-medium">Controle total sobre empresas, unidades e acessos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          Cadastrar Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {companies.map(company => (
          <div key={company.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 transition-all group-hover:scale-150"></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ: {company.cnpj || 'Não informado'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowUserModal(company.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="Criar Acesso"
                >
                  <UserPlus size={20} />
                </button>
                <button 
                  onClick={() => handleSendRegistrationLink(company)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  title="Enviar Link de Cadastro"
                >
                  <LinkIcon size={20} />
                </button>
                <button 
                  onClick={() => setShowUnitModal(company.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  title="Adicionar Unidade"
                >
                  <Plus size={20} />
                </button>
                <button 
                  onClick={() => setShowDeleteCompanyConfirm(company.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  title="Excluir Empresa"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável</p>
                <p className="text-sm font-bold text-slate-700">{company.responsibleName}</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</p>
                <p className="text-sm font-bold text-slate-700">{company.phone}</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unidades Operacionais</h4>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg">
                  {units.filter(u => u.companyId === company.id).length} Unidades
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {units.filter(u => u.companyId === company.id).map(unit => (
                  <div key={unit.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group/unit">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/unit:bg-blue-50 group-hover/unit:text-blue-600 transition-all">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{unit.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{unit.location}</p>
                        {unit.login && (
                          <p className="text-[10px] text-blue-500 font-bold mt-1">Login: {unit.login}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Gerente</p>
                        <p className="text-xs font-bold text-slate-600">{unit.managerName}</p>
                      </div>
                      {unit.clientId && (
                        <button 
                          onClick={() => {
                            onImpersonate(unit.clientId!);
                            alert(`Agora visualizando como ${unit.name}`);
                          }}
                          className={`p-2.5 rounded-xl transition-all ${impersonatedId === unit.clientId ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-300 hover:text-purple-600 hover:bg-purple-50'}`}
                          title="Visualizar como esta Unidade"
                        >
                          <Scan size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => setShowDeleteUnitConfirm(unit.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                        title="Excluir Unidade"
                      >
                        <Trash2 size={14} />
                      </button>
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
    return true;
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
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Unidade</label>
              <select 
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 appearance-none"
              >
                {clientUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Data Desejada</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantidade Total</label>
              <input 
                type="number" 
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Filtrar por Estrelas</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setMinRating(star === minRating ? 0 : star)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${minRating >= star ? 'bg-yellow-400 text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    <Star size={16} className={minRating >= star ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Solicitar Profissionais'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployees.map(emp => {
              const available = isEmployeeAvailable(emp.id, selectedDate);
              const isSelected = selectedEmployeeIds.includes(emp.id);
              return (
                <div 
                  key={emp.id} 
                  onClick={() => available && handleToggleEmployee(emp.id)}
                  className={`bg-white p-6 rounded-[2rem] border-2 transition-all group relative cursor-pointer ${
                    isSelected ? 'border-blue-600 shadow-xl shadow-blue-500/10' : 
                    available ? 'border-slate-100 hover:border-blue-200' : 'border-slate-100 opacity-60 grayscale'
                  }`}
                >
                  {!available && (
                    <div className="absolute top-4 right-4 bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest z-20">
                      Indisponível
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-lg z-20 shadow-lg">
                      <CheckCircle size={14} />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                      <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{emp.firstName}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-black text-slate-700">{emp.rating}.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                      {available ? 'Disponível' : 'Em outra unidade'}
                    </span>
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [evaluatingEmployee, setEvaluatingEmployee] = useState<Employee | null>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Avaliar Equipe</h2>
          <p className="text-slate-500 font-medium">Visualize e avalie os profissionais que atuam em suas unidades.</p>
        </div>
        <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Filtrar por Data</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-slate-700 outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl ${selectedDate === today ? 'bg-emerald-600' : 'bg-blue-600'} text-white flex items-center justify-center shadow-lg shadow-blue-100`}>
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedDate === today ? 'Equipe de Hoje' : `Equipe de ${new Date(selectedDate).toLocaleDateString('pt-BR')}`}
            </h3>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">
              {dateEmployees.length} Profissionais escalados
            </p>
          </div>
        </div>
        
        {dateEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dateEmployees.map(emp => {
              const assignment = dateAssignments.find(a => a.employeeId === emp.id);
              return (
                <div key={emp.id} className={`bg-white p-8 rounded-[2.5rem] border-2 ${selectedDate === today ? 'border-emerald-100' : 'border-blue-100'} shadow-xl shadow-blue-500/5 transition-all group relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${selectedDate === today ? 'bg-emerald-500/5' : 'bg-blue-500/5'} rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150`}></div>
                  <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                        <img src={emp.photoUrl || `https://picsum.photos/seed/${emp.id}/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      {assignment?.confirmed && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{emp.firstName} {emp.lastName}</h3>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${assignment?.confirmed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
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
            <p className="text-slate-400 font-medium italic">Nenhum profissional escalado para esta data.</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Star size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Histórico da Equipe</h3>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Profissionais que já atuaram com você</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workedEmployees.map(emp => {
          const empFeedbacks = feedbacks.filter(f => f.employeeId === emp.id && f.managerId === clientId);
          return (
            <div key={emp.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
              
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
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
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{emp.firstName} {emp.lastName}</h3>
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
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Nenhum profissional encontrado</h3>
            <p className="text-slate-500 font-medium">Os profissionais aparecerão aqui após trabalharem em suas unidades.</p>
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
              className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Avaliar Profissional</h3>
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

function AgencyAccessControl({ accessPoints, clients, units, companies }: { accessPoints: AccessPoint[], clients: Client[], units: Unit[], companies: Company[] }) {
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
      createdAt: new Date().toISOString().split('T')[0],
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
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Controle de Acesso</h2>
          <p className="text-slate-500 font-medium">Gere e gerencie QR Codes para as unidades atendidas.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
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
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nova Unidade</h3>
                  <p className="text-xs text-slate-400 font-medium">Gere um QR Code para controle de ponto.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Selecionar Unidade Cadastrada</label>
                    <select 
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-slate-700 appearance-none"
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
                      <p className="text-[10px] text-amber-600 font-bold mt-2 italic">
                        Todas as unidades cadastradas já possuem QR Code.
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={!selectedUnitId}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gerar QR Code
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...accessPoints].sort((a, b) => a.location.localeCompare(b.location)).map(ap => (
          <div key={ap.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
            
            <div className="flex flex-col items-center text-center space-y-6 flex-1 relative z-10">
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl group-hover:scale-105 transition-transform relative">
                <QRCodeSVG value={ap.qrCodeValue} size={180} />
                <div className="hidden">
                  <QRCodeCanvas id={`canvas-${ap.id}`} value={ap.qrCodeValue} size={512} />
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <h4 className="font-black text-xl text-slate-900 tracking-tight line-clamp-2 min-h-[3.5rem] flex items-center justify-center">{ap.location}</h4>
                <div className="flex items-center justify-center gap-2 text-slate-500 font-medium">
                  <Users size={14} className="text-blue-600" />
                  <span className="text-sm">Gestor: {ap.managerName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
                <Calendar size={12} />
                <span>Criado em {new Date(ap.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3 relative z-10">
              <button 
                onClick={() => downloadQRCode(ap.id, ap.location)}
                className="flex-1 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Download size={16} />
                Baixar
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(ap.id)}
                className="p-4 bg-red-50 text-red-600 rounded-[1.25rem] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                title="Excluir Empresa"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmployeeProfile({ employeeId, employees, assignments }: { employeeId: string, employees: Employee[], assignments: Assignment[] }) {
  const employee = employees.find(e => e.id === employeeId);
  const pendingAssignments = assignments.filter(a => a.employeeId === employeeId && a.status === 'SCHEDULED' && !a.confirmed);

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
    alert('Escala confirmada com sucesso!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Meu Perfil</h2>
        <p className="text-slate-500 font-medium">Gerencie suas informações e confirme suas escalas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-6">
            <div className="relative mx-auto w-40 h-40">
              <div className="w-full h-full rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={employee.photoUrl || `https://picsum.photos/seed/${employee.id}/400`} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white">
                <CheckCircle size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{employee.firstName} {employee.lastName}</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Funcionário Ativo</p>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < employee.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações de Contato</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</p>
                  <p className="text-sm font-bold text-slate-700">{employee.phone}</p>
                </div>
              </div>
              {employee.personalEmail && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Pessoal</p>
                    <p className="text-sm font-bold text-slate-700">{employee.personalEmail}</p>
                  </div>
                </div>
              )}
              {employee.username && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário da Plataforma</p>
                    <p className="text-sm font-bold text-slate-700">{employee.username}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento (CPF)</p>
                  <p className="text-sm font-bold text-slate-700">{employee.cpf}</p>
                </div>
              </div>
              {employee.docUrl && (
                <a 
                  href={employee.docUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-400 group-hover:text-blue-600 flex items-center justify-center shadow-sm">
                    <Eye size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Ver Comprovante</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {pendingAssignments.length > 0 && (
            <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Escalas Pendentes</h3>
                  <p className="text-blue-100 text-sm font-medium">Confirme sua presença para as próximas escalas.</p>
                </div>
              </div>
              <div className="space-y-4">
                {pendingAssignments.map(as => (
                  <div key={as.id} className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Data da Escala</p>
                      <p className="text-xl font-black">{new Date(as.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                    </div>
                    <button 
                      onClick={() => handleConfirm(as.id)}
                      className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                    >
                      Confirmar Presença
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Privacidade e Dados (LGPD)</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Lei Geral de Proteção de Dados</p>
              </div>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed font-medium">
                Em conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong>, informamos que seus dados pessoais (nome, CPF, foto e contato) são utilizados exclusivamente para as seguintes finalidades dentro da nossa plataforma:
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Identificação Profissional:</strong> Para que as empresas contratantes saibam quem irá realizar o serviço.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Controle de Ponto:</strong> Sua foto é utilizada no reconhecimento facial para garantir a autenticidade do registro de jornada.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Comunicação:</strong> Seu telefone é utilizado para envio de escalas e avisos importantes via WhatsApp.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span><strong>Segurança:</strong> Seus documentos são armazenados para fins de conformidade legal e verificação de antecedentes.</span>
                </li>
              </ul>
              <p className="text-slate-500 text-[10px] mt-8 italic font-medium">
                * Seus dados são armazenados em ambiente seguro e não são compartilhados com terceiros fora do ecossistema de contratação da plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
        const newCheckIn: Omit<CheckIn, 'id'> = {
          employeeId: employeeId,
          accessPointId: scannedPoint!.id,
          timestamp: new Date().toISOString(),
          photoUrl: photo,
        };
        await createDocument('checkIns', newCheckIn);

        // Update Assignment status
        const today = new Date().toISOString().split('T')[0];
        const assignment = assignments.find(a => 
          a.employeeId === employeeId && 
          a.clientId === scannedPoint!.clientId && 
          a.date === today &&
          a.status === 'SCHEDULED'
        );
        if (assignment) {
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
      className="max-w-xl mx-auto space-y-10"
    >
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Registro de Ponto</h2>
        <p className="text-slate-500 font-medium">Registre sua entrada ou saída na unidade com segurança.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        {step === 'INITIAL' && (
          <div className="flex flex-col items-center space-y-8">
            <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-inner">
              <Scan size={64} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pronto para começar?</h3>
              <p className="text-sm text-slate-500 font-medium">Escaneie o QR Code fixado na parede da unidade.</p>
            </div>
            <button 
              onClick={() => setStep('SCANNING')}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              Escanear QR Code
            </button>
          </div>
        )}

        {step === 'SCANNING' && (
          <div className="space-y-8">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-blue-600 shadow-2xl">
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
              <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 border-dashed rounded-xl" />
              </div>
            </div>
            <button 
              onClick={() => setStep('INITIAL')}
              className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
            >
              Cancelar Operação
            </button>
          </div>
        )}

        {step === 'PHOTO' && (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verificação Facial</h3>
              <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">{scannedPoint?.location}</p>
            </div>
            <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-black border-4 border-blue-600 shadow-2xl">
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
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              <Camera size={24} />
              Tirar Foto e Bater Ponto
            </button>
          </div>
        )}

        {step === 'VERIFYING' && (
          <div className="flex flex-col items-center space-y-8 py-12">
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <Camera size={40} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Validando Identidade</h3>
              <p className="text-sm text-slate-500 font-medium">Processando reconhecimento facial via IA...</p>
              <div className="mt-6 px-4 py-2 bg-slate-50 rounded-xl inline-block border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Protocolo: {API_KEY.substring(0, 8)}</p>
              </div>
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="flex flex-col items-center space-y-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-inner"
            >
              <CheckCircle size={64} />
            </motion.div>
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ponto Registrado!</h3>
              <p className="text-sm text-slate-500 font-medium">Seu registro foi processado e enviado com sucesso.</p>
              <div className="p-6 bg-slate-50 rounded-[2rem] text-left space-y-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                    <p className="text-sm font-bold text-slate-700">{scannedPoint?.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</p>
                    <p className="text-sm font-bold text-slate-700">{new Date().toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep('INITIAL')}
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl active:scale-95"
            >
              Concluir
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs">Últimos Registros</h3>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">Hoje</span>
        </div>
        <div className="space-y-4">
          {checkIns.slice().reverse().map(ci => {
            const ap = accessPoints.find(p => p.id === ci.accessPointId);
            return (
              <div key={ci.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                    <img src={ci.photoUrl} alt="Selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{ap?.location}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(ci.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} />
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

function CompanyDashboard({ clientId, clients, assignments, employees }: { clientId: string, clients: Client[], assignments: Assignment[], employees: Employee[] }) {
  const client = clients.find(c => c.id === clientId);

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
  const today = new Date().toISOString().split('T')[0];
  const todayStaff = myAssignments.filter(a => a.date === today);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Minhas Escalas</h2>
        <p className="text-slate-500 font-medium">Acompanhe os funcionários escalados para suas unidades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Equipe Hoje" 
          value={todayStaff.length.toString()} 
          color="blue"
        />
        <StatCard 
          icon={<Calendar className="text-indigo-600" />} 
          label="Total de Escalas" 
          value={myAssignments.length.toString()} 
          color="indigo"
        />
        <StatCard 
          icon={<Clock className="text-emerald-600" />} 
          label="Próxima Escala" 
          value={myAssignments.find(a => a.date > today)?.date ? new Date(myAssignments.find(a => a.date > today)!.date).toLocaleDateString('pt-BR') : 'Nenhuma'} 
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs">Histórico de Escalas</h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>Atualizado em tempo real</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Funcionário</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Data</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myAssignments.sort((a, b) => b.date.localeCompare(a.date)).map(as => {
                const emp = employees.find(e => e.id === as.employeeId);
                return (
                  <tr key={as.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                          {emp?.firstName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Profissional</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                        <Calendar size={14} className="text-blue-600" />
                        <span className="text-sm">{new Date(as.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] ${
                        as.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                        as.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          as.status === 'COMPLETED' ? 'bg-emerald-600' : 
                          as.status === 'SCHEDULED' ? 'bg-blue-600' :
                          'bg-slate-400'
                        }`} />
                        {as.status === 'COMPLETED' ? 'Concluído' : as.status === 'SCHEDULED' ? 'Agendado' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {myAssignments.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300">
                        <Calendar size={40} />
                      </div>
                      <p className="text-sm text-slate-400 font-medium italic">Nenhuma escala encontrada para suas unidades.</p>
                    </div>
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
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selecione a Escala</label>
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
                  {emp?.firstName} - {new Date(as.date).toLocaleDateString('pt-BR')}
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
        // Update existing company with user info if needed, or just create the company user
        await createDocument('companyUsers', {
          id: newUid,
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
                Autorizo o uso dos meus dados pessoais para fins de cadastro e escalas de trabalho, conforme as diretrizes da <span className="font-bold text-slate-700">LGPD (Lei Geral de Proteção de Dados)</span>.
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

  const handleDeleteUser = async (id: string, type: 'EMPLOYEE' | 'COMPANY') => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await deleteDocument(type === 'EMPLOYEE' ? 'employees' : 'companyUsers', id);
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao excluir usuário.');
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
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setFilter('EMPLOYEE')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'EMPLOYEE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Funcionários
          </button>
          <button 
            onClick={() => setFilter('COMPANY')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'COMPANY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
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

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Login</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filter === 'EMPLOYEE' ? (
              filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
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
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-500">{emp.loginEmail || 'Não definido'}</span>
                  </td>
                  <td className="px-8 py-6">
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
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    alert(`Senha redefinida com sucesso! Um link de confirmação foi enviado para ${resetEmail || employee?.personalEmail || companyUser?.email || user?.email}`);
    setIsResetting(false);
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
        
        <div className="pt-16 p-12 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{displayName}</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] mt-1">{role === 'AGENCY' ? 'Administrador Agência' : role === 'COMPANY' ? 'Gestor Empresa' : 'Diarista Profissional'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail de Login</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">
                {loginEmail}
              </div>
            </div>
            {personalEmail && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Pessoal</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">
                  {personalEmail}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-100">
            {!isResetting ? (
              <button 
                onClick={() => {
                  setIsResetting(true);
                  setResetEmail(personalEmail || loginEmail || '');
                }}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                <Lock size={18} />
                Redefinir Minha Senha
              </button>
            ) : (
              <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Alterar Senha</h4>
                  <button onClick={() => setIsResetting(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar E-mail para Link</label>
                    <input 
                      type="email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nova Senha</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar Senha</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleResetPassword}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Confirmar Nova Senha
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
