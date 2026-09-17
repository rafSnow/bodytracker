import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Cliente } from '../db/db';
import { LatestEvaluationCard, type JoinedEvaluation } from './LatestEvaluationCard';
import { EvolutionCharts } from './EvolutionCharts';
import { PhotoComparison } from './PhotoComparison';
import { EvaluationDetails } from './EvaluationDetails';
import { ExportPDFButton } from './ExportPDFButton';
import { ArrowLeft, Plus, History } from 'lucide-react';

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

  const handleDeleteEval = async (avId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação? Esta ação é irreversível.')) {
      try {
        await db.transaction('rw', db.avaliacoes, db.resultados, async () => {
          await db.resultados.where('avaliacao_id').equals(avId).delete();
          await db.avaliacoes.delete(avId);
        });
        if (selectedAvaliacaoId === avId) {
          setSelectedAvaliacaoId(null);
        }
      } catch (err) {
        console.error('Erro ao excluir avaliação:', err);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full pb-20">
      {/* Header Fixo */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 truncate px-2">{cliente.nome}</h2>
          <div className="w-10"></div> {/* Spacer para centralizar o título */}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6" id="client-report-content">
        {joinedEvaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-3xl text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <History size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhuma avaliação</h3>
            <p className="text-slate-500 text-sm mb-6">Comece registrando a primeira avaliação deste cliente para acompanhar sua evolução.</p>
            <button
              onClick={onNewEvaluation}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-2xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Plus size={20} />
              Nova Avaliação
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Visão Geral</h3>
              <button
                onClick={onNewEvaluation}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Plus size={16} />
                Nova Avaliação
              </button>
            </div>

            <LatestEvaluationCard evaluations={joinedEvaluations} />
            <EvolutionCharts evaluations={joinedEvaluations} />
            <PhotoComparison clienteId={cliente.id} selectedAvaliacaoId={selectedAvaliacaoId} />

            {/* Seletor de Avaliação Específica */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Detalhes por Avaliação</h3>
                {selectedAvaliacaoId && (
                  <button 
                    onClick={() => handleDeleteEval(selectedAvaliacaoId)}
                    className="text-xs font-medium text-rose-500 hover:text-rose-700 px-2 py-1 bg-rose-50 rounded-lg"
                  >
                    Excluir Atual
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {avaliacoes?.map((av, idx) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvaliacaoId(av.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedAvaliacaoId === av.id 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {idx === 0 ? 'Última (Atual)' : new Date(av.data_avaliacao).toLocaleDateString('pt-BR')}
                  </button>
                ))}
              </div>

              {selectedAvaliacaoId && <EvaluationDetails avaliacaoId={selectedAvaliacaoId} />}
            </div>

            {/* Área de Exportação */}
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-slate-800">Exportar Relatório</h3>
              <p className="text-sm text-slate-500">Gere um documento PDF contendo todo o histórico e os gráficos detalhados para entregar ao cliente.</p>
              <ExportPDFButton elementId="client-report-content" fileName={`relatorio-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
