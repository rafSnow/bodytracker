import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Cliente } from '../db/db';
import { ChevronRight, Plus, Search, Trash2, Users } from 'lucide-react';
import { calculateIdade } from '../utils/dateUtils';
import { useState } from 'react';
import { ActionSheet } from './ActionSheet';
import toast from 'react-hot-toast';

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

  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const avaliacoes = await db.avaliacoes.where('cliente_id').equals(clientToDelete).toArray();
      const avIds = avaliacoes.map(a => a.id);
      
      await db.transaction('rw', db.clientes, db.avaliacoes, db.resultados, async () => {
        if (avIds.length > 0) {
          await db.resultados.where('avaliacao_id').anyOf(avIds).delete();
          await db.avaliacoes.bulkDelete(avIds);
        }
        await db.clientes.delete(clientToDelete);
      });
      toast.success('Paciente excluído');
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      toast.error('Erro ao excluir paciente');
    } finally {
      setClientToDelete(null);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar
    setClientToDelete(id);
  };

  const filteredClientes = clientes?.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#F2F2F7] min-h-screen">
      {/* iOS Header Fixo */}
      <div className="sticky top-0 z-30 bg-[#F2F2F7]/80 backdrop-blur-xl pt-12 pb-4 px-4 flex flex-col gap-4 border-b border-slate-200/50">
        <div className="flex items-end justify-between">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
          <button 
            onClick={onAddClient}
            className="w-8 h-8 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Barra de Busca iOS Style */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border-none rounded-xl leading-5 bg-slate-200/60 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-[17px]"
          />
        </div>
      </div>

      {/* Lista iOS Style (Inset Grouped) */}
      <div className="px-4 pt-4 pb-24">
        {!clientes ? (
          <div className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-slate-200/60 divide-y divide-slate-100 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 pl-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-slate-200 rounded-full" />
                  <div className="flex flex-col gap-2.5 mt-0.5">
                    <div className="w-32 h-3.5 bg-slate-200 rounded-full" />
                    <div className="w-20 h-2.5 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="w-6 h-6 bg-slate-100 rounded-full mr-1" />
              </div>
            ))}
          </div>
        ) : filteredClientes?.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-3">
            <Users size={48} className="text-slate-300 mb-2" />
            <p className="text-slate-500 text-[17px]">Nenhum paciente.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-slate-200/60 divide-y divide-slate-100">
            {filteredClientes?.map((cliente) => (
              <div 
                key={cliente.id}
                onClick={() => onSelectClient(cliente)}
                className="flex items-center justify-between p-3 pl-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold text-lg rounded-full flex items-center justify-center shadow-inner">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-[17px] leading-tight">{cliente.nome}</span>
                    <span className="text-[14px] text-slate-500 mt-0.5">
                      {cliente.sexo === 'M' ? 'Masc' : 'Fem'} • {calculateIdade(cliente.data_nascimento)} anos
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => handleDeleteClick(cliente.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 active:bg-red-50 rounded-full transition-colors"
                    aria-label="Excluir cliente"
                  >
                    <Trash2 size={20} />
                  </button>
                  <ChevronRight size={22} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ActionSheet 
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={confirmDeleteClient}
        title="Excluir Paciente"
        description="Todo o histórico será permanentemente apagado. Esta ação não pode ser desfeita."
        confirmText="Excluir Paciente"
      />
    </div>
  );
}
