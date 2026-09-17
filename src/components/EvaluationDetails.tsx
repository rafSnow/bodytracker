import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ClipboardList, Target, AlertCircle, Flame, Share2, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvaluationDetailsProps {
  avaliacaoId: string;
}

export function EvaluationDetails({ avaliacaoId }: EvaluationDetailsProps) {
  const avaliacao = useLiveQuery(() => db.avaliacoes.get(avaliacaoId), [avaliacaoId]);
  const resultado = useLiveQuery(() => db.resultados.where('avaliacao_id').equals(avaliacaoId).first(), [avaliacaoId]);
  const cliente = useLiveQuery(() => avaliacao ? db.clientes.get(avaliacao.cliente_id) : undefined, [avaliacao]);

  if (avaliacao === undefined || resultado === undefined || (avaliacao && cliente === undefined)) {
    return <div className="p-4 text-center text-slate-500">Carregando detalhes...</div>;
  }

  if (!avaliacao || !resultado || !cliente) {
    return <div className="p-4 text-center text-rose-500">Avaliação não encontrada.</div>;
  }

  const { calculos } = resultado;

  const handleWhatsAppShare = async () => {
    const dataFormatada = format(avaliacao.data_avaliacao, "dd 'de' MMMM", { locale: ptBR });
    
    let mensagem = `*Resumo da Avaliação Física* 📊\n*Cliente:* ${cliente.nome}\n*Data:* ${dataFormatada}\n\n*Composição Corporal:*\n• BF (US Navy): ${calculos.bfNavy?.toFixed(1)}%\n• Massa Magra: ${calculos.lbmBoer?.toFixed(1)} kg\n• Peso Atual: ${avaliacao.peso_kg} kg\n`;

    if (calculos.ibw) {
      mensagem += `• Peso Ideal (Devine): ${calculos.ibw.devine.toFixed(1)} kg\n`;
    }

    mensagem += `\n*Índices de Risco:*\n• IMC: ${calculos.imc?.toFixed(1)}\n• Relação Cintura-Quadril: ${calculos.rcq?.toFixed(2)}\n`;

    if (calculos.bai) {
      mensagem += `• BAI (Adiposidade): ${calculos.bai.toFixed(1)}\n• BRI (Redondeza): ${calculos.bri?.toFixed(1)}\n• Índice Conicidade: ${calculos.ci?.toFixed(2)}\n`;
    }

    if (calculos.bmrKatch && calculos.tdee) {
      mensagem += `\n*Gasto Energético:*\n• Basal (TMB): ${calculos.bmrKatch?.toFixed(0)} kcal\n• Diário (TDEE): ${calculos.tdee?.toFixed(0)} kcal\n`;
    }

    if (calculos.macros && avaliacao.objetivo) {
      const metasMap = {
        emagrecimento: 'Emagrecimento',
        manutencao: 'Manutenção',
        hipertrofia: 'Hipertrofia'
      };
      const objNome = metasMap[avaliacao.objetivo as keyof typeof metasMap] || avaliacao.objetivo;
      mensagem += `\n*Plano Nutricional (${objNome}):*\n• Meta Diária: ${calculos.macros.targetCalories} kcal\n• Proteínas: ${calculos.macros.grams.protein}g (${calculos.macros.macros.protein}%)\n• Carboidratos: ${calculos.macros.grams.carbs}g (${calculos.macros.macros.carbs}%)\n• Gorduras: ${calculos.macros.grams.fat}g (${calculos.macros.macros.fat}%)\n`;
    }

    mensagem += `\n_Relatório gerado via BioStats_ 💪`;

    const shareData = {
      title: 'Resumo da Avaliação Física',
      text: mensagem,
    };

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('Share API cancelada ou falhou', err);
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <button 
        data-html2canvas-ignore="true"
        onClick={handleWhatsAppShare}
        className="w-full flex items-center justify-center gap-2 h-14 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-2xl shadow-sm transition-colors mb-4"
      >
        <Share2 size={20} />
        Compartilhar no WhatsApp
      </button>

      {/* Metas Nutricionais e Gasto (Nova Fase 6) */}
      {(calculos.bmrKatch && calculos.tdee) ? (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-4 bg-orange-50 border-b border-orange-100">
            <Flame size={20} className="text-orange-500" />
            <h3 className="font-semibold text-slate-800">Metabolismo e Metas</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <RiskCard title="Metabolismo Basal" value={`${calculos.bmrKatch.toFixed(0)}`} label="kcal / dia" />
            <RiskCard title="Gasto Diário (TDEE)" value={`${calculos.tdee.toFixed(0)}`} label="kcal / dia" />
          </div>
          
          {calculos.macros && (
            <div className="px-4 pb-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-600">Meta: <span className="text-indigo-600 font-bold capitalize">{avaliacao.objetivo}</span></span>
                  <span className="text-lg font-bold text-slate-800">{calculos.macros.targetCalories} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <MacroBar label="Proteínas" grams={calculos.macros.grams.protein} pct={calculos.macros.macros.protein} color="bg-blue-500" />
                  <MacroBar label="Carboidratos" grams={calculos.macros.grams.carbs} pct={calculos.macros.macros.carbs} color="bg-amber-500" />
                  <MacroBar label="Gorduras" grams={calculos.macros.grams.fat} pct={calculos.macros.macros.fat} color="bg-rose-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Peso Ideal IBW (Nova Fase 6) */}
      {calculos.ibw && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border-b border-emerald-100">
            <Scale size={20} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Peso Ideal (IBW)</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <MethodologyRow 
              name="Fórmula de Devine" 
              desc="Padrão clínico mais utilizado (1974)" 
              value={`${calculos.ibw.devine} kg`} 
              highlight={true}
            />
            <div className="w-full h-px bg-slate-100"></div>
            <MethodologyRow name="Fórmula de Robinson" desc="Revisão (1983)" value={`${calculos.ibw.robinson} kg`} />
            <div className="w-full h-px bg-slate-100"></div>
            <MethodologyRow name="Fórmula de Miller" desc="Revisão (1983)" value={`${calculos.ibw.miller} kg`} />
            <div className="w-full h-px bg-slate-100"></div>
            <MethodologyRow name="Fórmula de Hamwi" desc="Base clássica (1964)" value={`${calculos.ibw.hamwi} kg`} />
          </div>
        </div>
      )}

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
            value={`${calculos.bfNavy?.toFixed(1) || 0}%`} 
            highlight={true}
          />
          <div className="w-full h-px bg-slate-100"></div>
          <MethodologyRow 
            name="Relative Fat Mass (RFM)" 
            desc="Equação recente altura/cintura" 
            value={`${calculos.bfRfm?.toFixed(1) || 0}%`} 
          />
          <div className="w-full h-px bg-slate-100"></div>
          <MethodologyRow 
            name="Fórmula Deurenberg" 
            desc="Estimativa baseada no IMC e Idade" 
            value={`${calculos.bfDeurenberg?.toFixed(1) || 0}%`} 
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
          <RiskCard title="IMC" value={calculos.imc?.toFixed(1) || '0'} label={getImcLabel(calculos.imc || 0)} />
          <RiskCard title="RCQ" value={calculos.rcq?.toFixed(2) || '0'} label="Cintura/Quadril" />
          <RiskCard title="RCEst" value={calculos.rcEst?.toFixed(2) || '0'} label="Cintura/Estatura" />
          <RiskCard title="Massa Magra" value={`${calculos.lbmBoer?.toFixed(1) || 0} kg`} label="Fórmula Boer" />
          {calculos.bai && <RiskCard title="BAI" value={calculos.bai.toFixed(1)} label="Adiposidade" />}
          {calculos.bri && <RiskCard title="BRI" value={calculos.bri.toFixed(1)} label="Redondeza Corp." />}
          {calculos.ci && <RiskCard title="CI" value={calculos.ci.toFixed(2)} label="Índice Conicidade" />}
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

function MacroBar({ label, grams, pct, color }: { label: string, grams: number, pct: number, color: string }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-500">{grams}g <span className="opacity-60">({pct}%)</span></span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
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
