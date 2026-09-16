import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Cliente } from '../db/db';
import { Users, Plus, ChevronRight, Search, Trash2 } from 'lucide-react';
import { calculateIdade } from '../utils/dateUtils';
import { useState } from 'react';

interface ClientListProps {
  profissionalId: string;
  onAddClient: () => void;
  onSelectClient: (cliente: Cliente) => void;
}

export function ClientList({ profissionalId, onAddClient, onSelectClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const clientes = useLiveQuery(
    () => db.clientes.where('profissional_id').equals(profissionalId).reverse().sortBy('criado_em'),
    [profissionalId]
  );

  const handleDeleteClient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar
    if (window.confirm('Excluir este paciente? Todo o histórico será perdido.')) {
      try {
        const avaliacoes = await db.avaliacoes.where('cliente_id').equals(id).toArray();
        const avIds = avaliacoes.map(a => a.id);
        
        await db.transaction('rw', db.clientes, db.avaliacoes, db.resultados, async () => {
          if (avIds.length > 0) {
            await db.resultados.where('avaliacao_id').anyOf(avIds).delete();
            await db.avaliacoes.bulkDelete(avIds);
          }
          await db.clientes.delete(id);
        });
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
      }
    }
  };

  const filteredClientes = clientes?.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header Fixo */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 pt-6 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Meus Pacientes</h1>
          </div>
          <button 
            onClick={onAddClient}
            className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-900 active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="p-4 pb-20 flex flex-col gap-3">
        {!clientes ? (
          <div className="text-center text-slate-500 py-10">Carregando...</div>
        ) : filteredClientes?.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Users size={32} />
            </div>
            <p className="text-slate-500 text-sm">Nenhum paciente encontrado.</p>
          </div>
        ) : (
          filteredClientes?.map((cliente) => (
            <div 
              key={cliente.id}
              onClick={() => onSelectClient(cliente)}
              className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 cursor-pointer active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 font-bold text-lg rounded-full flex items-center justify-center">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">{cliente.nome}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {cliente.sexo === 'M' ? 'Masculino' : 'Feminino'} • {calculateIdade(cliente.data_nascimento)} anos
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDeleteClient(cliente.id, e)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                  aria-label="Excluir cliente"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
