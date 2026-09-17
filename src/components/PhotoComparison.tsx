import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Camera, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoComparisonProps {
  clienteId: string;
  selectedAvaliacaoId: string | null;
}

export function PhotoComparison({ clienteId, selectedAvaliacaoId }: PhotoComparisonProps) {
  const [view, setView] = useState<'frente' | 'lado' | 'costas'>('frente');

  // Buscar todas as avaliações deste cliente para saber qual é a primeira
  const avaliacoes = useLiveQuery(
    () => db.avaliacoes.where('cliente_id').equals(clienteId).sortBy('data_avaliacao'),
    [clienteId]
  );

  const fotos = useLiveQuery(
    () => db.fotos.where('cliente_id').equals(clienteId).toArray(),
    [clienteId]
  );

  const dadosVisualizacao = useMemo(() => {
    if (!avaliacoes || avaliacoes.length === 0 || !fotos || !selectedAvaliacaoId) {
      return null;
    }

    const primeiraAv = avaliacoes[0];
    const selecionadaAv = avaliacoes.find(a => a.id === selectedAvaliacaoId) || primeiraAv;

    const primeiraFoto = fotos.find(f => f.avaliacao_id === primeiraAv.id && f.tipo === view);
    const selecionadaFoto = fotos.find(f => f.avaliacao_id === selecionadaAv.id && f.tipo === view);

    return {
      primeira: {
        avaliacao: primeiraAv,
        foto: primeiraFoto?.foto_base64
      },
      selecionada: {
        avaliacao: selecionadaAv,
        foto: selecionadaFoto?.foto_base64
      }
    };
  }, [avaliacoes, fotos, selectedAvaliacaoId, view]);

  if (!dadosVisualizacao) return null;

  const temFoto = dadosVisualizacao.primeira.foto || dadosVisualizacao.selecionada.foto;
  
  if (!temFoto) return null;

  return (
    <div className="mt-6 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-100">
        <Camera size={20} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Evolução Visual</h3>
      </div>
      
      <div className="p-4">
        <div className="flex justify-center gap-2 mb-6">
          <TabButton active={view === 'frente'} onClick={() => setView('frente')} label="Frente" />
          <TabButton active={view === 'lado'} onClick={() => setView('lado')} label="Perfil" />
          <TabButton active={view === 'costas'} onClick={() => setView('costas')} label="Costas" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              1ª Avaliação
            </span>
            <span className="text-xs text-slate-400 text-center -mt-1">
              {format(dadosVisualizacao.primeira.avaliacao.data_avaliacao, "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 px-4 text-center">
              {dadosVisualizacao.primeira.foto ? (
                <img src={dadosVisualizacao.primeira.foto} alt="Antes" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={24} className="text-slate-300 mb-2" />
                  <span className="text-[13px] font-medium text-slate-400 leading-snug">Câmera tímida? 📸<br/>Sem foto registrada.</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center px-1">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <RefreshCw size={16} className="text-indigo-500" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider text-center">
              Avaliação Atual
            </span>
            <span className="text-xs text-indigo-400 text-center -mt-1">
              {format(dadosVisualizacao.selecionada.avaliacao.data_avaliacao, "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 px-4 text-center">
              {dadosVisualizacao.selecionada.foto ? (
                <img src={dadosVisualizacao.selecionada.foto} alt="Depois" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={24} className="text-slate-300 mb-2" />
                  <span className="text-[13px] font-medium text-slate-400 leading-snug">Nenhuma foto salva nesta sessão.</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 min-h-[44px] min-w-[80px] rounded-full text-sm font-medium transition-colors ${
        active 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
