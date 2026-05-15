import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Play, ShieldCheck, Activity, Briefcase, Building2, Users, HelpCircle, ChevronDown, Phone, X, TrendingUp, Calendar, DollarSign, Layers, Layout, Moon, Sun } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Plan } from '../types';

interface LandingPageProps {
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  handleEmailLogin: (e: React.FormEvent) => void;
  loginError: string | null;
  isForgotPassword: boolean;
  setIsForgotPassword: (val: boolean) => void;
  resetEmail: string;
  setResetEmail: (val: string) => void;
  handleResetPassword: (e: React.FormEvent) => void;
  resetStatus: 'IDLE' | 'LOADING' | 'SUCCESS';
  plans: Plan[];
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onSelectPlan?: (plan: Plan) => void;
}

export function LandingPage({
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  handleEmailLogin,
  loginError,
  isForgotPassword,
  setIsForgotPassword,
  resetEmail,
  setResetEmail,
  handleResetPassword,
  resetStatus,
  plans,
  isDarkMode,
  setIsDarkMode,
  onSelectPlan
}: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`min-h-screen font-sans scroll-smooth transition-all duration-500 ${isDarkMode ? 'bg-black text-slate-100' : 'bg-[#F8F9FA] text-slate-900 selection:bg-brand-100 selection:text-brand-900'}`}>
      <style>{`
        /* Custom styles for component-specific dark mode */
        .landing-dark .bg-white { background-color: #000000 !important; }
        .landing-dark .bg-slate-50 { background-color: #000000 !important; }
        .landing-dark .bg-slate-100 { background-color: #0c0c0c !important; }
        .landing-dark .bg-brand-50\/30 { background-color: #000000 !important; }
        .landing-dark .bg-brand-50 { background-color: #0c0c0c !important; }
        .landing-dark .text-slate-900 { color: #f8fafc !important; }
        .landing-dark .text-slate-800 { color: #f1f5f9 !important; }
        .landing-dark .text-slate-700 { color: #e2e8f0 !important; }
        .landing-dark .text-slate-600 { color: #cbd5e1 !important; }
        .landing-dark .text-slate-500 { color: #94a3b8 !important; }
        .landing-dark .text-slate-400 { color: #64748b !important; }
        .landing-dark .border-slate-50 { border-color: #0c0c0c !important; }
        .landing-dark .border-slate-100 { border-color: #1e293b !important; }
        .landing-dark .border-slate-200 { border-color: #334155 !important; }
        .landing-dark header { background-color: rgba(0, 0, 0, 0.95) !important; border-bottom-color: #1e293b !important; }
        .landing-dark footer { border-top-color: #1e293b !important; background-color: #000000 !important; }
        .landing-dark .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5) !important; }
        .landing-dark .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7) !important; }
      `}</style>
      
      <div className={isDarkMode ? 'landing-dark' : ''}>
        <Toaster position="top-center" />
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-500 ${isDarkMode ? 'bg-black/90 border-slate-800' : 'bg-[#F8F9FA]/80 border-brand-100/50'}`}>
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)} translate="no">
              <img 
                src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
                alt="Logotipo ProStaff Brasil" 
                className={`w-[200px] h-[140px] object-contain transition-all duration-500 ${isDarkMode ? 'brightness-0 invert' : ''}`} 
              />
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#inicio" className={`font-medium text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-brand-400' : 'text-slate-600 hover:text-brand-600'}`}>Início</a>
              <a href="#planos" className={`font-medium text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-brand-400' : 'text-slate-600 hover:text-brand-600'}`}>Planos</a>
            </nav>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
                title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className={`font-medium text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-brand-400' : 'text-slate-600 hover:text-brand-600'}`}
              >
                Entrar
              </button>
              <a href="/?role=AGENCY_REGISTRATION" className="px-6 py-2.5 bg-brand-500 text-white rounded-lg font-bold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">Criar Conta</a>
            </div>
          </div>
        </header>

        <main className="pt-20">
          {/* Hero Section (Início) */}
          <section id="inicio" className={`min-h-[calc(100vh-5rem)] flex items-center relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950/50' : 'bg-brand-50/30'}`}>
            {/* Background Images & Effects */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(61,92,234,0.1),transparent_50%)]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(61,92,234,0.05),transparent_50%)]'}`} />
            <div 
              className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.05] sm:opacity-[0.12]'}`}
              style={{ 
                backgroundImage: 'url("https://i.imgur.com/lnpU0gB.jpeg")',
                backgroundSize: 'cover',
                backgroundPosition: '75% center',
                backgroundRepeat: 'no-repeat'
              }} 
            />
            {/* Mobile-specific soft fade for better text contrast */}
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent sm:hidden pointer-events-none transition-all duration-700 ${isDarkMode ? 'from-slate-950/60' : 'from-white/40'}`} />
            
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 relative z-10">
              <div className="flex-1 space-y-8 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className={`text-5xl md:text-7xl font-black leading-[1.1] tracking-tight font-display mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Gestão <br className="hidden lg:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-300 font-sans" translate="no">Inteligente</span> <br className="hidden lg:block" />
                    de Diaristas.
                  </h1>
                  <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-6" />
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-lg font-medium leading-relaxed max-w-xl transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Automatize sua agência com a plataforma líder em controle operacional e satisfação do cliente.
                </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-start"
              >
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <a href="/?role=AGENCY_REGISTRATION" className="px-8 py-4 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 w-full text-center">
                    Comece Gratuitamente
                  </a>
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest text-center">
                    3 Meses de Acesso Completo • 10 Empresas • 50 Diaristas
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex-1 relative"
            >
              {/* Dashboard Mockup - 100% Code Based (Fast Render) */}
              <div className={`relative rounded-[2rem] p-3 sm:p-4 shadow-2xl border transition-all duration-500 group overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-slate-100 border-slate-200'}`}>
                <div className={`absolute inset-0 opacity-50 bg-gradient-to-tr from-brand-50 to-transparent ${isDarkMode ? 'from-brand-500/10' : ''}`} />
                
                {/* Window Controls */}
                <div className="flex items-center gap-1.5 mb-4 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-400/50" />
                </div>

                <div className={`rounded-2xl shadow-sm border overflow-hidden flex h-full min-h-[400px] transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                  {/* Sidebar Mockup */}
                  <div className={`w-12 sm:w-16 flex flex-col items-center py-6 gap-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-900'}`}>
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white scale-75">
                      <Layout size={18} />
                    </div>
                    {[Layout, Users, Calendar, DollarSign, Activity, Layers].map((Icon, idx) => (
                      <div key={idx} className={`text-slate-500 hover:text-brand-400 transition-colors ${idx === 0 ? 'text-brand-400' : ''}`}>
                        <Icon size={18} />
                      </div>
                    ))}
                  </div>

                  {/* Main Content Mockup */}
                  <div className={`flex-1 p-6 space-y-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-4 w-32 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      <div className={`h-8 w-8 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Diaristas Ativos', value: '142', icon: Users, color: 'brand' },
                        { label: 'Contratos/Mês', value: 'R$ 42k', icon: DollarSign, color: 'blue' }
                      ].map((stat, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border shadow-sm space-y-2 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                          <div className="flex items-center justify-between">
                            <stat.icon size={14} className="text-slate-400" />
                            <TrendingUp size={12} className="text-brand-500" />
                          </div>
                          <div className="text-xl font-black tracking-tight">{stat.value}</div>
                          <div className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Mockup */}
                    <div className={`p-4 rounded-xl border shadow-sm h-32 relative flex flex-col justify-end gap-1 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <div className={`absolute top-4 left-4 h-3 w-20 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                      <div className="flex items-end gap-1.5 h-16">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                            className={`flex-1 transition-colors rounded-t-sm ${isDarkMode ? 'bg-brand-500/20 hover:bg-brand-500' : 'bg-brand-100 hover:bg-brand-500'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Activity List */}
                    <div className="space-y-3">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                          <div className="flex-1 space-y-1.5">
                            <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                            <div className={`h-2 w-2/3 rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500/10 blur-3xl" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/10 blur-3xl" />
              </div>

            </motion.div>
          </div>
        </section>

        {/* Platform Demonstration Section */}
        <section className={`py-12 border-y transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-[#F8F9FA] border-slate-100'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className={`px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block transition-colors ${isDarkMode ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-brand-50 border-brand-100 text-brand-600'}`}>
                Interface & Experiência
              </span>
              <h3 className={`text-3xl md:text-5xl font-black tracking-tight font-display transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Demonstração da Plataforma</h3>
              <p className={`font-medium mt-4 max-w-2xl mx-auto italic transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Visualize como a nossa tecnologia conecta agências, empresas e colaboradores em uma experiência integrada e fluida.
              </p>
            </div>

            <div className="space-y-32">
              {[
                {
                  title: "Dashboard de Gestão Operacional",
                  description: "Controle total da sua agência em um painel robusto. Gerencie faturamento, contratos, escalas e relatórios operacionais com precisão.",
                  image: "https://i.imgur.com/ptkQ4XA.png",
                  reverse: false,
                  color: "bg-blue-600"
                },
                {
                  title: "Perfil da Empresa Solicitante",
                  description: "Transparência total para o seu cliente. A empresa solicitante acompanha as escalas em tempo real, avalia a equipe e solicita novos profissionais com apenas dois cliques.",
                  image: "https://i.imgur.com/puLhTdk.png",
                  reverse: true,
                  color: "bg-brand-600"
                },
                {
                  title: "Perfil do Funcionário",
                  description: "O dia a dia do colaborador simplificado. Agenda de diárias, notificações de novas escalas e registro de ponto via QR Code com validação por foto.",
                  image: "https://i.imgur.com/mgjfmoo.png",
                  reverse: false,
                  color: "bg-amber-600"
                }
              ].map((profile, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: profile.reverse ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col ${profile.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
                >
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${profile.color} flex items-center justify-center text-white font-black text-xs shadow-lg`}>
                        0{i + 1}
                      </div>
                      <h4 className={`text-2xl md:text-3xl font-black tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{profile.title}</h4>
                    </div>
                    <p className={`text-lg font-medium leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {profile.description}
                    </p>
                    <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border-l-2 pl-4 py-1 transition-colors duration-500 ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                      Interface Web & Mobile • 100% Responsivo • Tempo Real
                    </div>
                  </div>
                  <div className="flex-1 relative group">
                    <div className={`absolute inset-0 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 ${isDarkMode ? 'bg-white/5' : 'bg-slate-900/5'}`} />
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`relative rounded-3xl overflow-hidden shadow-2xl border transition-colors duration-500 ${isDarkMode ? 'shadow-slate-950/50 border-slate-800 bg-slate-900' : 'shadow-slate-200 border-slate-200 bg-white'}`}
                    >
                      <img 
                        src={profile.image} 
                        alt={profile.title} 
                        className="w-full h-auto object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Login Modal */}
        <AnimatePresence>
          {showLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowLogin(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="max-w-xl w-full relative z-10"
              >
                <div className={`p-8 sm:p-12 rounded-[2rem] shadow-2xl border relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <button 
                    onClick={() => setShowLogin(false)}
                    className={`absolute top-6 right-6 p-2 rounded-full transition-all ${isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                  >
                    <X size={20} />
                  </button>

                  <div className="text-center mb-10">
                    <h3 className={`text-3xl font-black tracking-tight font-display mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Acesso Restrito</h3>
                    <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Insira suas credenciais para continuar.</p>
                  </div>

                  {isForgotPassword ? (
                    <form onSubmit={handleResetPassword} className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Recuperação</label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                            type="email" 
                            placeholder="seu@email.com"
                            className={`w-full pl-14 pr-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-100 focus:border-brand-500 focus:bg-white'}`}
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {resetStatus === 'SUCCESS' && (
                        <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl text-brand-600 text-sm font-bold flex items-center gap-3">
                          <CheckCircle2 size={18} />
                          E-mail enviado! Verifique sua caixa de entrada.
                        </div>
                      )}

                      <div className="space-y-4">
                        <button 
                          type="submit" 
                          disabled={resetStatus === 'LOADING'}
                          className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50"
                        >
                          {resetStatus === 'LOADING' ? 'Enviando...' : 'Enviar Link'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsForgotPassword(false)}
                          className={`w-full py-2 font-black uppercase tracking-widest text-[10px] transition-all ${isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          Voltar ao Login
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                            type="email" 
                            placeholder="admin@stafflink.com"
                            className={`w-full pl-14 pr-6 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-brand-500'}`}
                            value={emailInput}
                            onChange={(e) => emailInput===undefined ? undefined : setEmailInput(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                          <button 
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-[10px] font-black text-brand-500 uppercase tracking-widest hover:text-brand-600 transition-colors"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            className={`w-full pl-14 pr-12 py-4 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-brand-500'}`}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                          <AlertCircle size={18} />
                          {loginError}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 mt-4 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        Entrar na Plataforma
                        <ArrowRight size={18} />
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Section */}
        <section id="planos" className={`py-24 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className={`px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm mb-4 inline-block transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                Planos & Preços
              </span>
              <h2 className={`text-4xl font-black tracking-tight font-display transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A escala que você precisa.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.sort((a, b) => a.price - b.price).map((plan, index) => {
                const isPopular = plan.id === 'PROFESSIONAL';
                const isEnterprise = plan.id === 'ENTERPRISE';
                
                return (
                  <motion.div 
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl group ${
                      isPopular ? 'border-brand-500 shadow-xl shadow-brand-500/10 md:-translate-y-4 z-20' : (isDarkMode ? 'bg-slate-950 border-slate-800 z-10' : 'bg-white border-slate-200 z-10')
                    } ${isPopular && isDarkMode ? 'bg-slate-950/80 backdrop-blur-sm' : ''} ${isPopular && !isDarkMode ? 'bg-white' : ''}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20">
                        Recomendado
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 ${
                        isEnterprise ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600') :
                        isPopular ? (isDarkMode ? 'bg-brand-500/10 text-brand-400' : 'bg-brand-100 text-brand-500') :
                        (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                      }`}>
                        {isEnterprise ? <ShieldCheck size={28} /> : isPopular ? <Activity size={28} /> : <Briefcase size={28} />}
                      </div>
                      <h4 className={`font-black uppercase tracking-tight text-xl mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {plan.price === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.price === 0 ? '/período' : '/mês'}</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium leading-snug">
                          <div className={`mt-0.5 p-0.5 rounded-full ${isPopular ? 'text-brand-500' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>
                            <CheckCircle2 size={16} />
                          </div>
                          <span className={`transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className={`pt-6 border-t space-y-3 transition-colors ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diaristas</span>
                        <span className={`text-sm font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.maxEmployees === 9999 ? 'Ilimitado' : plan.maxEmployees}</span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas</span>
                        <span className={`text-sm font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.maxCompanies === 9999 ? 'Ilimitado' : plan.maxCompanies}</span>
                      </div>
                      <button 
                        onClick={() => onSelectPlan && onSelectPlan(plan)}
                        className={`w-full mt-4 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                          isPopular 
                            ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20' 
                            : (isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10')
                        }`}
                      >
                        Assinar Plano
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className={`py-24 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className={`text-3xl font-black tracking-tight font-display transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Como Funciona</h3>
              <p className={`font-medium mt-2 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Três passos simples para transformar sua agência</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: '01', title: 'Cadastre sua Agência', desc: 'Crie sua conta em minutos e configure seu perfil operacional.', icon: Building2 },
                { step: '02', title: 'Aloque Diaristas', desc: 'Gerencie escalas e atribua profissionais às demandas dos clientes.', icon: Users },
                { step: '03', title: 'Monitore em Tempo Real', desc: 'Acompanhe o status das diárias e receba feedbacks instantâneos.', icon: Activity }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center space-y-6 group"
                >
                  <div className="relative inline-block">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-brand-500 transition-all duration-500 ${isDarkMode ? 'bg-slate-900 group-hover:bg-brand-500/10 group-hover:scale-110' : 'bg-slate-50 group-hover:bg-brand-50 group-hover:scale-110'}`}>
                      <item.icon size={40} />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-4 transition-colors duration-500 ${isDarkMode ? 'bg-white text-slate-950 border-slate-950' : 'bg-slate-900 text-white border-white'}`}>
                      {item.step}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className={`text-lg font-black uppercase tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                    <p className={`text-sm font-medium leading-relaxed px-4 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`py-24 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/50 text-slate-500'}`}>
                <HelpCircle size={12} />
                Dúvidas Frequentes
              </div>
              <h3 className={`text-3xl font-black tracking-tight font-display transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>FAQ Rápido</h3>
            </div>

            <div className="space-y-4">
              {[
                { q: 'Posso trocar de plano depois?', a: 'Sim! Você pode fazer o upgrade ou downgrade do seu plano a qualquer momento diretamente pelo painel administrativo.' },
                { q: 'Como funciona o suporte técnico?', a: 'Oferecemos suporte via chat em tempo real e WhatsApp para todos os planos, com prioridade para os planos Professional e Enterprise.' },
                { q: 'Existe período de fidelidade?', a: 'Não. Nossos planos são mensais e você pode cancelar a qualquer momento sem multas ou taxas escondidas.' }
              ].map((faq, i) => (
                <div key={i} className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className={`w-full p-6 flex items-center justify-between text-left transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                  >
                    <span className={`font-black uppercase tracking-tight text-sm transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{faq.q}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-slate-400 transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className={`text-sm font-medium leading-relaxed border-t pt-4 transition-colors ${isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-500 border-slate-50'}`}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-12 border-t transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2" translate="no">
            <img 
              src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" 
              alt="Logotipo ProStaff Brasil" 
              className={`w-[100px] h-[60px] object-contain brightness-0 invert transition-opacity duration-500 ${isDarkMode ? 'opacity-80' : 'opacity-50'}`} 
            />
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>© 2026 ProStaff Brasil</span>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
          </div>
        </div>
      </footer>
      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/5511999999999?text=Olá,%20quero%20conhecer%20a%20plataforma"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl shadow-[#25D366]/30 hover:scale-110 active:scale-90 transition-all group"
      >
        <Phone size={24} className="group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  </div>
);
}
