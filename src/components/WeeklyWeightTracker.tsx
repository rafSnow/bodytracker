import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db, type Cliente } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeeklyWeightTrackerProps {
  cliente: Cliente;
}

export function WeeklyWeightTracker({ cliente }: WeeklyWeightTrackerProps) {
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().substring(0, 10));

  const pesagens = useLiveQuery(
    () => db.pesagens.where('cliente_id').equals(cliente.id).sortBy('data'),
    [cliente.id]
  );

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    // Replace comma with dot for parsing
    const parsedWeight = parseFloat(newWeight.replace(',', '.'));
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      toast.error('Insira um peso válido.');
      return;
    }

    try {
      // Create local date to avoid timezone offset shifts (from YYYY-MM-DD string)
      const [year, month, day] = newDate.split('-').map(Number);
      const dataObj = new Date(year, month - 1, day);

      await db.pesagens.add({
        id: uuidv4(),
        cliente_id: cliente.id,
        data: dataObj,
        peso_kg: parsedWeight
      });
      setNewWeight('');
      toast.success('Peso diário registrado!');
    } catch (err) {
      toast.error('Erro ao salvar peso.');
    }
  };

  const handleDelete = async (id: string) => {
    await db.pesagens.delete(id);
    toast.success('Pesagem removida.');
  };

  // Group weights by week
  const weeklyData = useMemo(() => {
    if (!pesagens || pesagens.length === 0) return [];

    const groups: { [key: string]: { start: Date, end: Date, weights: number[], avg: number } } = {};

    pesagens.forEach(p => {
      // Use Monday as start of week for Brazil standards, but Date-fns defaults to Sunday if weekStartsOn: 0
      const weekStart = startOfWeek(p.data, { weekStartsOn: 1 });
      const key = weekStart.toISOString();

      if (!groups[key]) {
        groups[key] = {
          start: weekStart,
          end: endOfWeek(p.data, { weekStartsOn: 1 }),
          weights: [],
          avg: 0
        };
      }
      groups[key].weights.push(p.peso_kg);
    });

    // Calculate averages and sort descending (latest week first)
    const sortedWeeks = Object.values(groups).sort((a, b) => b.start.getTime() - a.start.getTime());
    sortedWeeks.forEach(w => {
      w.avg = w.weights.reduce((acc, curr) => acc + curr, 0) / w.weights.length;
    });

    return sortedWeeks;
  }, [pesagens]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 overflow-hidden flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-indigo-50 rounded-xl">
          <Scale className="text-indigo-600" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Pesagens Diárias & Média Semanal</h2>
          <p className="text-sm text-slate-500 leading-snug">
            Só foca na média! O peso oscila todos os dias devido a líquidos e treinos. 
            A média semanal é o único número confiável.
          </p>
        </div>
      </div>

      <form onSubmit={handleAddWeight} className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex gap-3 w-full">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Data</label>
            <input 
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-[10px] text-[15px] focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Peso (kg)</label>
            <input 
              type="text"
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              placeholder="Ex: 72,5"
              className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-[10px] text-[15px] focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              required
            />
          </div>
        </div>
        <button type="submit" className="w-full sm:w-auto h-12 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-[15px] font-semibold rounded-[10px] transition-colors shadow-sm shrink-0">
          Salvar
        </button>
      </form>

      {weeklyData.length > 0 ? (
        <div className="flex flex-col gap-3">
          {weeklyData.map((week, index) => {
            const prevWeek = weeklyData[index + 1];
            let diff = 0;
            if (prevWeek) {
              diff = week.avg - prevWeek.avg;
            }

            return (
              <div key={week.start.toISOString()} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {format(week.start, "dd MMM", { locale: ptBR })} a {format(week.end, "dd MMM", { locale: ptBR })}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{week.avg.toFixed(1)}</span>
                    <span className="text-sm text-slate-500 font-medium">kg</span>
                  </div>
                  <span className="text-[12px] font-medium text-slate-500 mt-1">
                    {week.weights.length} {week.weights.length === 1 ? 'pesagem nesta semana' : 'pesagens nesta semana'}
                  </span>
                </div>
                
                {prevWeek && (
                  <div className={`flex flex-col items-end px-3 py-2.5 rounded-xl border ${
                    diff > 0.1 ? 'bg-red-50 border-red-100 text-red-600' : 
                    diff < -0.1 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                    'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1 font-bold text-[15px]">
                      {diff > 0.1 ? <TrendingUp size={16} strokeWidth={2.5} /> : diff < -0.1 ? <TrendingDown size={16} strokeWidth={2.5} /> : <Minus size={16} strokeWidth={2.5} />}
                      <span>{Math.abs(diff).toFixed(1)} kg</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">vs Sem. Ant.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-[15px] font-medium text-slate-500 max-w-xs mx-auto">
            Adicione sua primeira pesagem diária para começar a calcular a média semanal.
          </p>
        </div>
      )}

      {pesagens && pesagens.length > 0 && (
        <div className="mt-2 border-t border-slate-100 pt-4">
          <details className="group">
            <summary className="text-[13px] font-bold text-indigo-600 cursor-pointer list-none flex items-center gap-1 hover:text-indigo-700 select-none">
              <span className="group-open:hidden text-indigo-500">+ Mostrar histórico de registros</span>
              <span className="hidden group-open:inline text-indigo-500">- Ocultar histórico</span>
            </summary>
            <div className="mt-4 flex flex-col gap-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {[...pesagens].reverse().map(p => (
                <div key={p.id} className="flex justify-between items-center text-[13px] py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 font-medium">{format(p.data, "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700">{p.peso_kg.toFixed(1)} kg</span>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="text-red-400 hover:text-red-600 font-medium transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
