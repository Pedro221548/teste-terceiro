import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Play, ShieldCheck, Activity, Briefcase, Building2, Users, HelpCircle, ChevronDown, Phone, X, TrendingUp, Calendar, DollarSign, Layers, Layout } from 'lucide-react';
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
  plans
}: LandingPageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans scroll-smooth">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-brand-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)} translate="no">
            <img src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" alt="Logotipo ProStaff Brasil" className="w-[200px] h-[140px] object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Início</a>
            <a href="#planos" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Planos</a>
          </nav>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowLogin(true)}
              className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors"
            >
              Entrar
            </button>
            <a href="/?role=AGENCY_REGISTRATION" className="px-6 py-2.5 bg-brand-500 text-white rounded-lg font-bold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">Criar Conta</a>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section (Início) */}
        <section id="inicio" className="min-h-[calc(100vh-5rem)] flex items-center bg-brand-50/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,92,234,0.05),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight font-display mb-6">
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
                className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl"
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
                <button onClick={() => setShowDemoModal(true)} className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all border border-slate-200 w-full sm:w-auto flex items-center justify-center gap-2 h-[52px]">
                  <Play size={16} className="text-brand-500" />
                  Ver Demonstração
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex-1 relative"
            >
              {/* Dashboard Mockup - 100% Code Based (Fast Render) */}
              <div className="relative rounded-[2rem] bg-slate-100 p-3 sm:p-4 shadow-2xl border border-slate-200 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-50 to-transparent opacity-50" />
                
                {/* Window Controls */}
                <div className="flex items-center gap-1.5 mb-4 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-400/50" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-full min-h-[400px]">
                  {/* Sidebar Mockup */}
                  <div className="w-12 sm:w-16 bg-slate-900 flex flex-col items-center py-6 gap-6">
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
                  <div className="flex-1 p-6 space-y-6 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 w-32 bg-slate-200 rounded-full" />
                      <div className="h-8 w-8 bg-slate-200 rounded-full" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Diaristas Ativos', value: '142', icon: Users, color: 'brand' },
                        { label: 'Contratos/Mês', value: 'R$ 42k', icon: DollarSign, color: 'blue' }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <stat.icon size={14} className="text-slate-400" />
                            <TrendingUp size={12} className="text-brand-500" />
                          </div>
                          <div className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Mockup */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-32 relative flex flex-col justify-end gap-1">
                      <div className="absolute top-4 left-4 h-3 w-20 bg-slate-100 rounded-full" />
                      <div className="flex items-end gap-1.5 h-16">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                            className="flex-1 bg-brand-100 hover:bg-brand-500 transition-colors rounded-t-sm"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Activity List */}
                    <div className="space-y-3">
                      {[1, 2].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 w-full bg-slate-100 rounded-full" />
                            <div className="h-2 w-2/3 bg-slate-50 rounded-full" />
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
        <section className="py-24 bg-[#F8F9FA] border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="px-4 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4 inline-block">
                Interface & Experiência
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display">Demonstração da Plataforma</h3>
              <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto italic">
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
                      <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{profile.title}</h4>
                    </div>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                      {profile.description}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-100 pl-4 py-1">
                      Interface Web & Mobile • 100% Responsivo • Tempo Real
                    </div>
                  </div>
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-slate-900/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-200 bg-white"
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
                <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                  <button 
                    onClick={() => setShowLogin(false)}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>

                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-2">Acesso Restrito</h3>
                    <p className="text-slate-500 font-medium">Insira suas credenciais para continuar.</p>
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
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
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
                          className="w-full py-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all"
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
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
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
                            className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
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
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 mt-4"
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
        <section id="planos" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm mb-4 inline-block">
                Planos & Preços
              </span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight font-display">A escala que você precisa.</h2>
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
                    className={`relative flex flex-col bg-white p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl group ${
                      isPopular ? 'border-brand-500 shadow-xl shadow-brand-500/10 md:-translate-y-4 z-20' : 'border-slate-200 z-10'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20">
                        Recomendado
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 ${
                        isEnterprise ? 'bg-purple-100 text-purple-600' :
                        isPopular ? 'bg-brand-100 text-brand-500' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {isEnterprise ? <ShieldCheck size={28} /> : isPopular ? <Activity size={28} /> : <Briefcase size={28} />}
                      </div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-2">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                          {plan.price === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.price === 0 ? '/período' : '/mês'}</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-snug">
                          <div className={`mt-0.5 p-0.5 rounded-full ${isPopular ? 'text-brand-500' : 'text-slate-400'}`}>
                            <CheckCircle2 size={16} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diaristas</span>
                        <span className="text-sm font-black text-slate-900">{plan.maxEmployees === 9999 ? 'Ilimitado' : plan.maxEmployees}</span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas</span>
                        <span className="text-sm font-black text-slate-900">{plan.maxCompanies === 9999 ? 'Ilimitado' : plan.maxCompanies}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight font-display">Como Funciona</h3>
              <p className="text-slate-500 font-medium mt-2">Três passos simples para transformar sua agência</p>
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
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center space-y-6 group"
                >
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-brand-500 group-hover:bg-brand-50 group-hover:scale-110 transition-all duration-500">
                      <item.icon size={40} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white">
                      {item.step}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-200/50 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                <HelpCircle size={12} />
                Dúvidas Frequentes
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight font-display">FAQ Rápido</h3>
            </div>

            <div className="space-y-4">
              {[
                { q: 'Posso trocar de plano depois?', a: 'Sim! Você pode fazer o upgrade ou downgrade do seu plano a qualquer momento diretamente pelo painel administrativo.' },
                { q: 'Como funciona o suporte técnico?', a: 'Oferecemos suporte via chat em tempo real e WhatsApp para todos os planos, com prioridade para os planos Professional e Enterprise.' },
                { q: 'Existe período de fidelidade?', a: 'Não. Nossos planos são mensais e você pode cancelar a qualquer momento sem multas ou taxas escondidas.' }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{faq.q}</span>
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
                        <p className="text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
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
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2" translate="no">
            <img src="https://i.ibb.co/xtTR9t20/Logotipo-Pro-Staff-Brasil-corporativo-removebg-preview.png" alt="Logotipo ProStaff Brasil" className="h-8 w-auto brightness-0 invert opacity-50" />
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

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm text-slate-900 rounded-full hover:bg-white transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              <div className="aspect-video bg-slate-100 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Play size={48} className="opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">Vídeo de Demonstração</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
