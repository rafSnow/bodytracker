import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Camera, ChevronLeft, ChevronRight, SplitSquareHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoComparisonProps {
  clienteId: string;
  selectedAvaliacaoId: string | null;
}

export function PhotoComparison({ clienteId, selectedAvaliacaoId }: PhotoComparisonProps) {
  const [view, setView] = useState<'frente' | 'lado' | 'costas'>('frente');
  const [sliderPos, setSliderPos] = useState(50);

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

  const temDuasFotos = dadosVisualizacao.primeira.foto && dadosVisualizacao.selecionada.foto && (dadosVisualizacao.primeira.avaliacao.id !== dadosVisualizacao.selecionada.avaliacao.id);

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Camera size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-800 dark:text-white">Evolução Visual</h3>
        </div>
        {temDuasFotos && (
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <SplitSquareHorizontal size={14} />
            Deslize para comparar
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-center gap-2 mb-6">
          <TabButton active={view === 'frente'} onClick={() => setView('frente')} label="Frente" />
          <TabButton active={view === 'lado'} onClick={() => setView('lado')} label="Perfil" />
          <TabButton active={view === 'costas'} onClick={() => setView('costas')} label="Costas" />
        </div>

        {temDuasFotos ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between px-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">1ª Avaliação</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {format(dadosVisualizacao.primeira.avaliacao.data_avaliacao, "dd/MM/yy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Atual</span>
                <span className="text-[11px] text-indigo-500 dark:text-indigo-500">
                  {format(dadosVisualizacao.selecionada.avaliacao.data_avaliacao, "dd/MM/yy", { locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 select-none touch-pan-y">
              {/* Foto 1 (Base - Antes) */}
              <img 
                src={dadosVisualizacao.primeira.foto} 
                alt="Antes" 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              
              {/* Foto 2 (Overlay - Depois) */}
              <div 
                className="absolute inset-0 z-10 overflow-hidden bg-slate-900"
                style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
              >
                <img 
                  src={dadosVisualizacao.selecionada.foto} 
                  alt="Depois" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </div>

              {/* Input invisível para controle */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0"
              />

              {/* Slider Handle (Visual) */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <ChevronLeft size={14} className="-mr-1" />
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                {dadosVisualizacao.selecionada.foto ? 'Foto Atual' : 'Primeira Foto'}
             </span>
             <div className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                <img 
                  src={dadosVisualizacao.selecionada.foto || dadosVisualizacao.primeira.foto} 
                  alt="Foto" 
                  className="w-full h-full object-cover" 
                />
             </div>
          </div>
        )}
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
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
