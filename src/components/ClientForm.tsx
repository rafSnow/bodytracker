import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { ArrowLeft } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-[#F2F2F7]">
      {/* HIG Header */}
      <div className="sticky top-0 z-10 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={onCancel}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 text-indigo-600 active:opacity-70 transition-opacity"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[17px] font-semibold text-slate-900">Novo Paciente</h1>
          <div className="w-11"></div>
        </div>
      </div>

      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div>
            <h2 className="text-[13px] font-medium text-slate-500 uppercase tracking-wider ml-4 mb-2">Dados Pessoais</h2>
            <div className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-slate-200/60 divide-y divide-slate-100">
              <div className="flex items-center min-h-[44px] px-4 py-2">
                <label htmlFor="nome" className="text-[17px] text-slate-900 w-1/3 shrink-0">Nome</label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome Completo"
                  required
                  className="flex-1 w-full text-[17px] text-slate-900 text-right bg-transparent outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center min-h-[44px] px-4 py-2">
                <label htmlFor="nascimento" className="text-[17px] text-slate-900 w-1/3 shrink-0">Nascimento</label>
                <input
                  id="nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  required
                  className="flex-1 w-full text-[17px] text-slate-900 text-right bg-transparent outline-none appearance-none"
                />
              </div>

              <div className="flex items-center min-h-[44px] px-4 py-2">
                <label htmlFor="sexo" className="text-[17px] text-slate-900 w-1/3 shrink-0">Sexo</label>
                <select
                  id="sexo"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value as 'M' | 'F')}
                  className="flex-1 w-full text-[17px] text-slate-900 text-right bg-transparent outline-none appearance-none pr-0"
                  dir="rtl"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div className="flex items-center min-h-[44px] px-4 py-2">
                <label htmlFor="altura" className="text-[17px] text-slate-900 w-1/3 shrink-0">Altura</label>
                <div className="flex-1 flex items-center justify-end gap-1">
                  <input
                    id="altura"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.,]*"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value.replace(',', '.'))}
                    placeholder="175"
                    required
                    className="w-16 text-[17px] text-slate-900 text-right bg-transparent outline-none placeholder:text-slate-400"
                  />
                  <span className="text-[17px] text-slate-400">cm</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex items-center justify-center w-full h-14 bg-indigo-600 text-white font-semibold text-[17px] rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
          </button>
        </form>
      </div>
    </div>
  );
}
