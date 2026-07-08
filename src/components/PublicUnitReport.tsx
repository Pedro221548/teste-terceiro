import React, { useEffect, useState } from 'react';
import { getDocument, getCollection } from '../services/firebaseService';
import { Unit, Company, Employee, Assignment } from '../types';
import { MapPin, Building2, Users, Clock, AlertCircle } from 'lucide-react';


export function PublicUnitReport({ unitId }: { unitId: string }) {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const unitData = await getDocument<Unit>('units', unitId);
        if (!unitData) {
          setError('Unidade não encontrada.');
          setLoading(false);
          return;
        }
        setUnit(unitData);

        const companyData = await getDocument<Company>('companies', unitData.companyId);
        if (companyData) setCompany(companyData);

        // Fetch assignments for this unit
        const allAssignments = await getCollection<Assignment>('assignments');
        const unitAssignments = allAssignments.filter(a => a.unitId === unitId && a.status !== 'CANCELLED');
        
        // Fetch employees
        const allEmployees = await getCollection<Employee>('employees');
        const assignedEmployeeIds = Array.from(new Set(unitAssignments.map(a => a.employeeId)));
        const unitEmployees = allEmployees.filter(e => assignedEmployeeIds.includes(e.id));
        
        setAssignments(unitAssignments);
        setEmployees(unitEmployees);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados da unidade. Verifique se o link está correto.');
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [unitId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-red-100 dark:border-red-900/30 text-center max-w-md w-full shadow-2xl">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">Erro</h2>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAssignments = assignments.filter(a => a.date === today);
  const futureAssignments = assignments.filter(a => a.date >= today);
  
  const todayEmployeeIds = Array.from(new Set(todayAssignments.map(a => a.employeeId)));
  const todayEmployees = employees.filter(e => todayEmployeeIds.includes(e.id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{unit.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <Building2 size={16} className="text-slate-400" />
                  {company?.name || 'Empresa Desconhecida'}
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="text-sm font-medium text-slate-500">
                  {unit.location}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Data</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Colaboradores Agendados (Hoje)</h2>
          </div>

          {todayEmployees.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
              <p className="text-sm text-slate-500 font-medium">Nenhum colaborador agendado para hoje.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayEmployees.map(emp => {
                const assignment = todayAssignments.find(a => a.employeeId === emp.id);
                return (
                  <div key={emp.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} alt={emp.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xl">
                          {emp.firstName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-base font-bold text-slate-900 dark:text-white truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">CPF: {emp.cpf}</p>
                      {emp.docUrl && (
                        <a href={emp.docUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                          Ver Documento
                        </a>
                      )}
                      
                      <div className="flex items-center gap-1.5 mt-3">
                        <Clock size={12} className={
                          assignment?.status === 'IN_PROGRESS' ? 'text-amber-500' : 
                          assignment?.status === 'COMPLETED' ? 'text-emerald-500' : 'text-blue-500'
                        } />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          assignment?.status === 'IN_PROGRESS' ? 'text-amber-600 dark:text-amber-400' : 
                          assignment?.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {assignment?.status === 'IN_PROGRESS' ? 'Em andamento' : 
                           assignment?.status === 'COMPLETED' ? 'Concluído' : 'Agendado'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
