import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Cliente } from '../db/db';
import { LatestEvaluationCard, type JoinedEvaluation } from './LatestEvaluationCard';
import { EvolutionCharts } from './EvolutionCharts';
import { PhotoComparison } from './PhotoComparison';
import { EvaluationDetails } from './EvaluationDetails';
import { ExportPDFButton } from './ExportPDFButton';
import { ArrowLeft, Plus, History } from 'lucide-react';
import { ActionSheet } from './ActionSheet';
import toast from 'react-hot-toast';

interface ClientDashboardProps {
  cliente: Cliente;
  onBack: () => void;
  onNewEvaluation: () => void;
}

export function ClientDashboard({ cliente, onBack, onNewEvaluation }: ClientDashboardProps) {
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<string | null>(null);

  // Busca as últimas 15 avaliações do cliente para evitar processamento massivo (Performance)
  const avaliacoes = useLiveQuery(
    async () => {
      return await db.avaliacoes
        .where('cliente_id')
        .equals(cliente.id)
        .reverse()
        .limit(15) // Limita a 15 gráficos
        .sortBy('data_avaliacao');
    },
    [cliente.id]
  );

  // Busca os resultados correspondentes
  const avaliacoesIds = avaliacoes?.map(a => a.id) || [];
  const resultados = useLiveQuery(
    () => db.resultados.where('avaliacao_id').anyOf(avaliacoesIds).toArray(),
    [avaliacoesIds.length > 0 ? avaliacoesIds.join(',') : ''] // Simple trick to re-trigger when ids change
  );

  const joinedEvaluations: JoinedEvaluation[] = useMemo(() => {
    if (!avaliacoes) return [];
    return avaliacoes.map(av => ({
      avaliacao: av,
      resultado: resultados?.find(r => r.avaliacao_id === av.id)
    }));
  }, [avaliacoes, resultados]);

  // Se não houver avaliações, seleciona a primeira automaticamente quando ela chegar
  useMemo(() => {
    if (avaliacoes && avaliacoes.length > 0 && !selectedAvaliacaoId) {
      setSelectedAvaliacaoId(avaliacoes[0].id);
    }
  }, [avaliacoes, selectedAvaliacaoId]);

  const [evalToDelete, setEvalToDelete] = useState<string | null>(null);

  const confirmDeleteEval = async () => {
    if (!evalToDelete) return;
    try {
      await db.transaction('rw', db.avaliacoes, db.resultados, async () => {
        await db.resultados.where('avaliacao_id').equals(evalToDelete).delete();
        await db.avaliacoes.delete(evalToDelete);
      });
      if (selectedAvaliacaoId === evalToDelete) {
        setSelectedAvaliacaoId(null);
      }
      toast.success('Avaliação excluída');
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err);
      toast.error('Erro ao excluir avaliação');
    } finally {
      setEvalToDelete(null);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F2F2F7] pb-24">
      {/* iOS Header Fixo */}
      <div className="sticky top-0 z-30 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-slate-200/50 pt-12 pb-3 flex flex-col px-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 transition-colors flex items-center gap-1">
            <ArrowLeft size={24} />
            <span className="text-[17px]">Voltar</span>
          </button>
          <div className="w-10"></div> {/* Spacer para centralizar o título */}
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight px-2 mt-2 truncate">{cliente.nome}</h2>
      </div>

      <div className="p-4 flex flex-col gap-6" id="client-report-content">
        {joinedEvaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/60 rounded-[10px] shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <History size={32} />
            </div>
            <h3 className="text-[17px] font-semibold text-slate-900 mb-2">Nenhuma avaliação</h3>
            <p className="text-slate-500 text-[14px] leading-snug mb-6">Comece registrando a primeira avaliação deste cliente para acompanhar sua evolução.</p>
            <button
              onClick={onNewEvaluation}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all text-[17px]"
            >
              <Plus size={20} />
              Nova Avaliação
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between px-1">
              <h3 className="text-2xl font-bold text-slate-900">Visão Geral</h3>
              <button 
                onClick={onNewEvaluation}
                className="flex items-center justify-center w-8 h-8 text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>

            <LatestEvaluationCard evaluations={joinedEvaluations} />
            <EvolutionCharts evaluations={joinedEvaluations} />
            <PhotoComparison clienteId={cliente.id} selectedAvaliacaoId={selectedAvaliacaoId} />

            {/* Seletor de Avaliação Específica */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-2xl font-bold text-slate-900">Detalhes por Avaliação</h3>
                {selectedAvaliacaoId && (
                  <button 
                    onClick={() => setEvalToDelete(selectedAvaliacaoId)}
                    className="text-[14px] font-medium text-red-500 hover:text-red-700 active:opacity-70 transition-opacity"
                  >
                    Excluir Atual
                  </button>
                )}
              </div>
              
              <div className="flex overflow-x-auto pb-2 gap-2 snap-x hide-scrollbar px-1">
                {avaliacoes?.map((av, idx) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvaliacaoId(av.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[15px] font-medium transition-colors border ${
                      selectedAvaliacaoId === av.id 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50'
                    }`}
                  >
                    {idx === 0 ? 'Última (Atual)' : new Date(av.data_avaliacao).toLocaleDateString()}
                  </button>
                ))}
              </div>

              {selectedAvaliacaoId && <EvaluationDetails avaliacaoId={selectedAvaliacaoId} />}
            </div>

            {/* Área de Exportação */}
            {(() => {
              const selectedJoined = joinedEvaluations.find(j => j.avaliacao.id === selectedAvaliacaoId);
              return (
                <div data-html2canvas-ignore="true" className="mt-8 bg-white rounded-[10px] shadow-sm border border-slate-200/60 p-4 flex flex-col gap-3">
                  <h3 className="text-[17px] font-semibold text-slate-900">Exportar Relatório</h3>
                  <p className="text-[14px] text-slate-500 leading-snug">Gere um documento PDF contendo todo o histórico e os gráficos detalhados para entregar ao cliente.</p>
                  <ExportPDFButton 
                    cliente={cliente}
                    avaliacao={selectedJoined?.avaliacao}
                    resultado={selectedJoined?.resultado}
                    fileName={`relatorio-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`} 
                  />
                </div>
              );
            })()}
          </>
        )}
      </div>

      <ActionSheet 
        isOpen={!!evalToDelete}
        onClose={() => setEvalToDelete(null)}
        onConfirm={confirmDeleteEval}
        title="Excluir Avaliação"
        description="Esta ação é irreversível e os dados desta avaliação serão permanentemente apagados."
        confirmText="Excluir Avaliação"
      />
    </div>
  );
}
