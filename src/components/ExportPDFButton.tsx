import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { ReportPDFDocument } from './ReportPDFDocument';
import type { Cliente, Avaliacao, Resultados } from '../db/db';

interface ExportPDFButtonProps {
  cliente: Cliente;
  avaliacao?: Avaliacao;
  resultado?: Resultados;
  fileName?: string;
}

export function ExportPDFButton({ 
  cliente, 
  avaliacao, 
  resultado, 
  fileName = 'relatorio-avaliacao.pdf' 
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!avaliacao || !resultado) {
      alert('Dados da avaliação não encontrados para gerar o PDF.');
      return;
    }

    setIsExporting(true);
    
    try {
      // Gera o documento PDF premium em memória (blob)
      const doc = <ReportPDFDocument cliente={cliente} avaliacao={avaliacao} resultado={resultado} />;
      const asPdf = pdf(doc);
      asPdf.updateContainer(doc); // forca a criacao
      const blob = await asPdf.toBlob();
      
      // Cria URL local e dispara o download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpa a URL para liberar memoria
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error: any) {
      console.error('Erro ao gerar PDF Premium:', error);
      alert(`Ocorreu um erro ao gerar o PDF: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={isExporting}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <Download size={20} />
      )}
      <span>{isExporting ? 'Gerando Relatório Premium...' : 'Baixar Relatório (PDF)'}</span>
    </button>
  );
}
