import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { JoinedEvaluation } from './LatestEvaluationCard';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ExportCSVButtonProps {
  evaluations: JoinedEvaluation[];
  clientName: string;
}

export function ExportCSVButton({ evaluations, clientName }: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!evaluations || evaluations.length === 0) {
      toast.error('Nenhuma avaliação encontrada.');
      return;
    }

    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const headers = [
        'Data',
        'Peso (kg)',
        'Gordura Navy (%)',
        'Gordura RFM (%)',
        'Massa Magra (kg)',
        'Cintura (cm)',
        'Pescoço (cm)',
        'Quadril (cm)',
        'Água Corporal (L)',
        'TMB (kcal)'
      ];

      const rows = evaluations.map(ev => {
        const { avaliacao, resultado } = ev;
        const calc = resultado?.calculos;
        
        return [
          format(avaliacao.data_avaliacao, 'dd/MM/yyyy', { locale: ptBR }),
          avaliacao.peso_kg?.toFixed(2) || '',
          calc?.bfNavy?.toFixed(2) || '',
          calc?.bfRfm?.toFixed(2) || '',
          calc?.lbmBoer?.toFixed(2) || '',
          avaliacao.medidas?.cintura?.toString() || '',
          avaliacao.medidas?.pescoco?.toString() || '',
          avaliacao.medidas?.quadril?.toString() || '',
          calc?.tbwWatson?.toFixed(2) || '',
          calc?.tdee?.toFixed(0) || ''
        ].map(val => `"${String(val).replace('.', ',')}"`);
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `Historico_${clientName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Planilha exportada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar planilha.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExportCSV}
      disabled={isExporting}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isExporting ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
      <span>{isExporting ? 'Processando Tabela...' : 'Exportar Tabela (CSV)'}</span>
    </button>
  );
}
