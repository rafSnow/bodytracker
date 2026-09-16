import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ClipboardList, Target, AlertCircle } from 'lucide-react';

interface EvaluationDetailsProps {
  avaliacaoId: string;
}

export function EvaluationDetails({ avaliacaoId }: EvaluationDetailsProps) {
  const avaliacao = useLiveQuery(() => db.avaliacoes.get(avaliacaoId), [avaliacaoId]);
  const resultado = useLiveQuery(() => db.resultados.where('avaliacao_id').equals(avaliacaoId).first(), [avaliacaoId]);

  if (avaliacao === undefined || resultado === undefined) {
    return <div className="p-4 text-center text-slate-500">Carregando detalhes...</div>;
  }

  if (!avaliacao || !resultado) {
    return <div className="p-4 text-center text-rose-500">Avaliação não encontrada.</div>;
  }

  const { calculos } = resultado;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Comparativo de Metodologias BF% */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-100">
          <Target size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800">Composição Corporal (Gordura)</h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <MethodologyRow 
            name="Método US Navy" 
            desc="Baseado em circunferências (Padrão ouro prático)" 
            value={`${calculos.bfNavy.toFixed(1)}%`} 
            highlight={true}
          />
          <div className="w-full h-px bg-slate-100"></div>
          <MethodologyRow 
            name="Relative Fat Mass (RFM)" 
            desc="Equação recente altura/cintura" 
            value={`${calculos.bfRfm.toFixed(1)}%`} 
          />
          <div className="w-full h-px bg-slate-100"></div>
          <MethodologyRow 
            name="Fórmula Deurenberg" 
            desc="Estimativa baseada no IMC e Idade" 
            value={`${calculos.bfDeurenberg.toFixed(1)}%`} 
          />
        </div>
      </div>

      {/* Índices de Risco */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-100">
          <AlertCircle size={20} className="text-orange-500" />
          <h3 className="font-semibold text-slate-800">Índices de Risco à Saúde</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <RiskCard title="IMC" value={calculos.imc.toFixed(1)} label={getImcLabel(calculos.imc)} />
          <RiskCard title="RCQ" value={calculos.rcq.toFixed(2)} label="Cintura/Quadril" />
          <RiskCard title="RCEst" value={calculos.rcEst.toFixed(2)} label="Cintura/Estatura" />
          <RiskCard title="Massa Magra" value={`${calculos.lbmBoer.toFixed(1)} kg`} label="Fórmula Boer" />
        </div>
      </div>

      {/* Medidas Brutas */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-100">
          <ClipboardList size={20} className="text-slate-600" />
          <h3 className="font-semibold text-slate-800">Medidas Registradas</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
          <MeasureRow label="Peso" value={`${avaliacao.peso_kg} kg`} />
          <MeasureRow label="Pescoço" value={`${avaliacao.medidas.pescoco || '--'} cm`} />
          <MeasureRow label="Cintura" value={`${avaliacao.medidas.cintura || '--'} cm`} />
          <MeasureRow label="Quadril" value={`${avaliacao.medidas.quadril || '--'} cm`} />
          <MeasureRow label="Abdômen" value={`${avaliacao.medidas.abdomen || '--'} cm`} />
          <MeasureRow label="Braço" value={`${avaliacao.medidas.braco || '--'} cm`} />
          <MeasureRow label="Coxa" value={`${avaliacao.medidas.coxa || '--'} cm`} />
          <MeasureRow label="Panturrilha" value={`${avaliacao.medidas.panturrilha || '--'} cm`} />
        </div>
      </div>
    </div>
  );
}

function MethodologyRow({ name, desc, value, highlight = false }: { name: string, desc: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className={`font-medium ${highlight ? 'text-indigo-700' : 'text-slate-700'}`}>{name}</span>
        <span className="text-xs text-slate-400">{desc}</span>
      </div>
      <div className={`text-lg font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  );
}

function RiskCard({ title, value, label }: { title: string, value: string, label: string }) {
  return (
    <div className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <span className="text-xs font-medium text-slate-500 mb-1">{title}</span>
      <span className="text-xl font-bold text-slate-800">{value}</span>
      <span className="text-xs text-slate-400 mt-1">{label}</span>
    </div>
  );
}

function MeasureRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function getImcLabel(imc: number): string {
  if (imc < 18.5) return 'Baixo peso';
  if (imc < 25) return 'Eutrofia (Normal)';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade I';
  if (imc < 40) return 'Obesidade II';
  return 'Obesidade III';
}
