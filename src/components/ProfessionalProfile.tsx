import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { User, BadgeCheck } from 'lucide-react';

interface ProfessionalProfileProps {
  onRegister: (id: string) => void;
}

export function ProfessionalProfile({ onRegister }: ProfessionalProfileProps) {
  const [nome, setNome] = useState('');
  const [registro, setRegistro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check local storage for existing session
    const savedId = localStorage.getItem('profissional_id');
    if (savedId) {
      onRegister(savedId);
    }
  }, [onRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsSubmitting(true);
    try {
      const novoProfissional = {
        id: uuidv4(),
        nome: nome.trim(),
        registro_profissional: registro.trim(),
        criado_em: new Date(),
      };

      await db.profissionais.add(novoProfissional);
      localStorage.setItem('profissional_id', novoProfissional.id);
      onRegister(novoProfissional.id);
    } catch (error) {
      console.error('Erro ao registrar profissional:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-[#F2F2F7]">
      <div className="w-full max-w-md p-6 bg-white border border-slate-200/60 rounded-[10px] shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full shadow-inner">
            <User size={36} strokeWidth={2} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2 tracking-tight">
          BioStats
        </h1>
        <p className="text-center text-slate-500 mb-8 text-[15px] leading-snug">
          Crie seu perfil profissional para começar a gerenciar seus pacientes. Funciona 100% offline.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="text-[13px] font-medium text-slate-500 ml-1 uppercase tracking-wider">
              Seu Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Dra. Ana Silva"
              required
              className="w-full h-12 px-4 bg-slate-100/80 border-none rounded-[8px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[17px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="registro" className="text-[13px] font-medium text-slate-500 ml-1 uppercase tracking-wider">
              Registro Profissional
            </label>
            <div className="relative">
              <input
                id="registro"
                type="text"
                value={registro}
                onChange={(e) => setRegistro(e.target.value)}
                placeholder="Ex: CRN 12345 (Opcional)"
                className="w-full h-12 pl-4 pr-11 bg-slate-100/80 border-none rounded-[8px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[17px]"
              />
              <BadgeCheck className="absolute right-4 top-3.5 text-slate-400" size={20} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !nome.trim()}
            className="w-full h-[50px] mt-4 font-semibold text-white bg-indigo-600 rounded-[10px] shadow-sm hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 text-[17px]"
          >
            {isSubmitting ? 'Salvando...' : 'Acessar BioStats'}
          </button>
        </form>
      </div>
    </div>
  );
}
