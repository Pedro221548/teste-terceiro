import React, { useState } from 'react';
import { Building2, Link, MapPin, Users, ChevronDown, ChevronUp, Clock, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Unit, Company, Employee, Assignment } from '../types';
import { setDocument, updateDocument, deleteDocument } from '../services/firebaseService';
import toast from 'react-hot-toast';

export function AgencyUnits({ 
  units, 
  companies, 
  employees, 
  assignments, 
  agencyId 
}: { 
  units: Unit[], 
  companies: Company[], 
  employees: Employee[], 
  assignments: Assignment[], 
  agencyId: string | null 
}) {
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitData, setUnitData] = useState({
    companyId: '',
    name: '',
    managerName: '',
    location: '',
  });

  // Filter units belonging to this agency
  const agencyUnits = units.filter(u => u.agencyId === agencyId);

  // Today's date string
  const today = new Date().toISOString().split('T')[0];

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitData({
        companyId: unit.companyId,
        name: unit.name,
        managerName: unit.managerName,
        location: unit.location,
      });
    } else {
      setEditingUnit(null);
      setUnitData({
        companyId: '',
        name: '',
        managerName: '',
        location: '',
      });
    }
    setShowUnitModal(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId || !unitData.companyId) return;

    try {
      if (editingUnit) {
        await updateDocument('units', editingUnit.id, unitData);
        toast.success('Unidade atualizada com sucesso!');
      } else {
        const id = crypto.randomUUID();
        await setDocument('units', id, {
          ...unitData,
          id,
          agencyId,
          createdAt: new Date().toISOString()
        });
        toast.success('Unidade criada com sucesso!');
      }
      setShowUnitModal(false);
    } catch (error) {
      toast.error('Erro ao salvar unidade.');
      console.error(error);
    }
  };

  const handleCopyLink = (unitId: string) => {
    const link = `${window.location.origin}?unit-report=${unitId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link público copiado com sucesso!');
  };

  const handleDeleteUnit = async (unit: Unit) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade ${unit.name}?`)) {
      try {
        await deleteDocument('units', unit.id);
        toast.success('Unidade excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir unidade.');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Unidades (Independente)</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Gerencie todas as unidades e visualize os colaboradores</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} /> Nova Unidade
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {agencyUnits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center">
            <MapPin size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Nenhuma unidade</h3>
            <p className="text-sm text-slate-500 mt-2">Nenhuma unidade cadastrada. Clique em "Nova Unidade" para começar.</p>
          </div>
        ) : (
          agencyUnits.map(unit => {
            const company = companies.find(c => c.id === unit.companyId);
            
            // Determine employees working here today or generally assigned
            const unitAssignments = assignments.filter(a => 
              a.agencyId === agencyId && 
              (a.unitId === unit.id || a.clientId === unit.clientId) &&
              a.status !== 'CANCELLED'
            );

            // Let's focus on Today's assignments or all active ones
            const todayAssignments = unitAssignments.filter(a => a.date === today);
            const futureAssignments = unitAssignments.filter(a => a.date >= today);

            // Get unique employees for today
            const todayEmployeeIds = Array.from(new Set(todayAssignments.map(a => a.employeeId)));
            const todayEmployees = employees.filter(e => todayEmployeeIds.includes(e.id));

            // Get unique employees for all future/present assignments
            const activeEmployeeIds = Array.from(new Set(futureAssignments.map(a => a.employeeId)));
            const activeEmployees = employees.filter(e => activeEmployeeIds.includes(e.id));

            const isExpanded = expandedUnit === unit.id;

            return (
              <div key={unit.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">{unit.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{company?.name || 'Empresa Desconhecida'}</span>
                        <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-medium text-slate-500">{unit.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hoje</p>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                        <Users size={14} />
                        <span className="font-black">{todayEmployees.length}</span>
                      </div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total (Ativos)</p>
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                        <Users size={14} />
                        <span className="font-black">{activeEmployees.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopyLink(unit.id); }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                        title="Copiar Link Público"
                      >
                        <Link size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(unit); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                        title="Editar Unidade"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        title="Excluir Unidade"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-4">Colaboradores Escalonados (Hoje)</h4>
                    
                    {todayEmployees.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Nenhum colaborador trabalhando nesta unidade hoje.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todayEmployees.map(emp => {
                          const assignment = todayAssignments.find(a => a.employeeId === emp.id);
                          return (
                            <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                                {emp.photoUrl ? (
                                  <img src={emp.photoUrl} alt={emp.firstName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                    {emp.firstName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{emp.firstName} {emp.lastName}</p>
                                <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <Clock size={10} />
                                  {assignment?.status === 'IN_PROGRESS' ? (
                                    <span className="text-amber-500">Em andamento</span>
                                  ) : assignment?.status === 'COMPLETED' ? (
                                    <span className="text-emerald-500">Concluído</span>
                                  ) : (
                                    <span className="text-blue-500">Agendado</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeEmployees.length > todayEmployees.length && (
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 border-dashed">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-4">Outros Colaboradores (Agendados p/ Futuro)</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeEmployees.filter(e => !todayEmployeeIds.includes(e.id)).map(emp => (
                            <div key={emp.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                                {emp.photoUrl && <img src={emp.photoUrl} alt={emp.firstName} className="w-full h-full object-cover" />}
                              </div>
                              {emp.firstName} {emp.lastName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showUnitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
                </h3>
              </div>
              <button 
                onClick={() => setShowUnitModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Empresa</label>
                <select
                  required
                  value={unitData.companyId}
                  onChange={e => setUnitData(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                >
                  <option value="">Selecione a empresa...</option>
                  {companies.filter(c => c.agencyId === agencyId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Nome da Unidade</label>
                <input
                  type="text"
                  required
                  value={unitData.name}
                  onChange={e => setUnitData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="Ex: Filial Centro"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Nome do Gerente</label>
                <input
                  type="text"
                  required
                  value={unitData.managerName}
                  onChange={e => setUnitData(prev => ({ ...prev, managerName: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Localização</label>
                <input
                  type="text"
                  required
                  value={unitData.location}
                  onChange={e => setUnitData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="Endereço da unidade"
                />
              </div>

              <div className="flex gap-4 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUnitModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
