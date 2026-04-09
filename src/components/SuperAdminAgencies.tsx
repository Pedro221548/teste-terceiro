import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Building2, MapPin, User as UserIcon, CreditCard, FileText, ExternalLink, Phone, Plus, ShieldCheck, Unlock, Mail, Eye, Link as LinkIcon } from 'lucide-react';
import { updateDocument, setDocument } from '../services/firebaseService';
import { Agency, Company, Employee, Plan } from '../types';

export function SuperAdminAgencies({ agencies, companies, employees, usersList, onManageAgency, plans }: { agencies: Agency[], companies: Company[], employees: Employee[], usersList: any[], onManageAgency: (id: string) => void, plans: Plan[] }) {
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
        plan: 'STARTER',
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
                            setSelectedAgency({ ...selectedAgency, plan: plan.id });
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">{agency.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      agency.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-600' :
                      agency.plan === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {agency.plan || 'STARTER'}
                    </span>
                  </div>
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
