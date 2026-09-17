import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientFormProps {
  profissionalId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ profissionalId, onSuccess, onCancel }: ClientFormProps) {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [altura, setAltura] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dataNascimento || !altura) return;

    setIsSubmitting(true);
    try {
      await db.clientes.add({
        id: uuidv4(),
        profissional_id: profissionalId,
        nome: nome.trim(),
        data_nascimento: new Date(dataNascimento),
        sexo,
        altura_cm: parseFloat(altura.replace(',', '.')),
        criado_em: new Date(),
      });
      toast.success('Paciente cadastrado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 pb-24 bg-slate-50">
      <div className="flex items-center mb-6 gap-3">
        <button 
          onClick={onCancel}
          className="p-3 bg-white border border-slate-200 rounded-full text-slate-600 active:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">Novo Cliente</h1>
      </div>

      <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="font-medium text-slate-800">Dados Pessoais</h2>
            <p className="text-sm text-slate-500">Informações base para os cálculos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="nome" className="text-sm font-medium text-slate-700 ml-1">Nome Completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              required
              className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="nascimento" className="text-sm font-medium text-slate-700 ml-1">Data de Nascimento</label>
            <input
              id="nascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
              className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="sexo" className="text-sm font-medium text-slate-700 ml-1">Sexo Biológico</label>
              <select
                id="sexo"
                value={sexo}
                onChange={(e) => setSexo(e.target.value as 'M' | 'F')}
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 appearance-none"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="altura" className="text-sm font-medium text-slate-700 ml-1">Altura (cm)</label>
              <input
                id="altura"
                type="text"
                inputMode="decimal"
                pattern="[0-9.,]*"
                value={altura}
                onChange={(e) => setAltura(e.target.value.replace(',', '.'))}
                placeholder="Ex: 175"
                required
                className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 mt-4 font-medium text-white bg-emerald-600 rounded-2xl shadow-sm hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Cadastrar Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
}
