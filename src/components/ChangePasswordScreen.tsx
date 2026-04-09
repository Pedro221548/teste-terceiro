import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle } from 'lucide-react';
import { updatePassword } from 'firebase/auth';
import { updateDocument } from '../services/firebaseService';

export function ChangePasswordScreen({ user, onComplete, handleLogout }: { user: any, onComplete: () => void, handleLogout: () => void }) {
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
