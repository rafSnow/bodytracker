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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md p-6 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <User size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-2">
          Bem-vindo ao BioStats
        </h1>
        <p className="text-center text-slate-500 mb-8 text-sm">
          Crie seu perfil profissional para começar a gerenciar as avaliações dos seus clientes de forma 100% offline.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="nome" className="text-sm font-medium text-slate-700 ml-1">
              Seu Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Dra. Ana Silva"
              required
              className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="registro" className="text-sm font-medium text-slate-700 ml-1">
              Registro Profissional (Opcional)
            </label>
            <div className="relative">
              <input
                id="registro"
                type="text"
                value={registro}
                onChange={(e) => setRegistro(e.target.value)}
                placeholder="Ex: CRN 12345"
                className="w-full h-14 pl-4 pr-11 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <BadgeCheck className="absolute right-4 top-4 text-slate-400" size={20} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !nome.trim()}
            className="w-full h-14 mt-4 font-medium text-white bg-blue-600 rounded-2xl shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Salvando...' : 'Criar Perfil e Começar'}
          </button>
        </form>
      </div>
    </div>
  );
}
