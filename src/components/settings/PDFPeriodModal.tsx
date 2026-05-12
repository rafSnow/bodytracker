import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCheckins } from '../../hooks/useCheckins';
import { useProfile } from '../../hooks/useProfile';
import { useGoal } from '../../hooks/useGoal';
import { generateProgressReport } from '../../lib/exportPdf';
import { WeightChart } from '../charts/WeightChart';
import { BodyCompositionChart } from '../charts/BodyCompositionChart';
import { prepareChartData } from '../../hooks/useChartData';
import { FileText, Calendar, AlertCircle } from 'lucide-react';

interface PDFPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFPeriodModal: React.FC<PDFPeriodModalProps> = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const { checkins } = useCheckins();
  const { profile } = useProfile();
  const { goal } = useGoal();
  
  const weightChartRef = useRef<HTMLDivElement>(null);
  const compositionChartRef = useRef<HTMLDivElement>(null);

  const filteredCheckins = useMemo(() => {
    return checkins.filter(c => {
      const d = c.date.split('T')[0];
      return d >= startDate && d <= endDate;
    });
  }, [checkins, startDate, endDate]);

  const chartData = useMemo(() => {
    if (!profile || filteredCheckins.length === 0) return null;
    return prepareChartData(filteredCheckins, profile);
  }, [filteredCheckins, profile]);

  const handleGenerate = async () => {
    if (!profile || filteredCheckins.length === 0) return;
    
    setLoading(true);
    try {
      if (!weightChartRef.current || !compositionChartRef.current) {
        alert('Erro ao carregar elementos dos gráficos.');
        setLoading(false);
        return;
      }

      await generateProgressReport(
        filteredCheckins,
        profile,
        goal,
        {
          weight: weightChartRef.current,
          composition: compositionChartRef.current
        }
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Relatório PDF">
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
          <FileText className="text-blue-500 shrink-0" size={20} />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            O relatório inclui comparativo de métricas, gráficos de evolução e tabela de registros do período selecionado.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Inicial</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Final</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            A geração pode levar alguns segundos devido à captura dos gráficos.
          </p>
        </div>

        {/* Hidden charts for capturing */}
        <div className="fixed -left-[2000px] top-0 w-[800px]">
          {chartData && (
            <>
              <div ref={weightChartRef} className="bg-white p-4">
                <h3 className="text-center font-bold mb-4 text-black">Evolução do Peso</h3>
                <div className="h-[300px] w-full">
                  <WeightChart data={chartData.weightData} />
                </div>
              </div>
              <div ref={compositionChartRef} className="bg-white p-4">
                <h3 className="text-center font-bold mb-4 text-black">Composição Corporal</h3>
                <div className="h-[300px] w-full">
                  <BodyCompositionChart data={chartData.compositionData} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth isLoading={loading} disabled={!chartData} onClick={handleGenerate}>Gerar PDF</Button>
        </div>
      </div>
    </Modal>
  );
};
