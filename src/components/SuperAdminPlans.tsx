import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Edit2, X } from 'lucide-react';
import { updateDocument } from '../services/firebaseService';
import { Plan } from '../types';

export function SuperAdminPlans({ plans }: { plans: Plan[] }) {
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
      alert('Plano atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Erro ao atualizar plano.');
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
              <h3 className="text-2xl font-black text-slate-950 tracking-tighter mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-950 tracking-tighter">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                </span>
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/mês</span>
              </div>
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
                    value={editingPlan.price}
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
                      value={editingPlan.maxEmployees}
                      onChange={e => setEditingPlan({ ...editingPlan, maxEmployees: parseInt(e.target.value) })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-950 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max. Empresas</label>
                    <input
                      required
                      type="number"
                      value={editingPlan.maxCompanies}
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
