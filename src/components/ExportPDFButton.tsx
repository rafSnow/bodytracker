import { useState } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Loader2 } from 'lucide-react';

interface ExportPDFButtonProps {
  elementId: string;
  fileName?: string;
}

export function ExportPDFButton({ elementId, fileName = 'relatorio-avaliacao.pdf' }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Elemento alvo para PDF não encontrado');
      return;
    }

    setIsExporting(true);
    
    try {
      const pixelRatio = 2;
      
      // html-to-image resolve o problema do CSS "oklch" nativamente pois usa o renderizador do browser
      const imgData = await toJpeg(element, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: pixelRatio,
        filter: (node: HTMLElement) => {
          // Ignorar elementos com a tag de ignore do html2canvas/html-to-image
          if (node?.getAttribute && node.getAttribute('data-html2canvas-ignore') === 'true') {
            return false;
          }
          return true;
        }
      });
      
      const canvasWidth = element.scrollWidth * pixelRatio;
      const canvasHeight = element.scrollHeight * pixelRatio;
      
      // Criar PDF (A4 - retrato, usando jsPDF)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Adicionar primeira página
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      addLegalFooter(pdf, pdfWidth, pdfHeight);
      heightLeft -= pdfHeight;
      
      // Criar novas páginas se o conteúdo ultrapassar 1 página
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Move the image up to slice it
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        addLegalFooter(pdf, pdfWidth, pdfHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(fileName);
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Ocorreu um erro ao gerar o PDF: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const addLegalFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    const disclaimerText = "Este documento gera estimativas de composição corporal baseadas em equações antropométricas validadas na literatura científica. Os resultados não representam diagnóstico médico e não substituem exames clínicos ou de imagem.";
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150); // Cinza claro
    
    // Adiciona o texto no rodapé (com margem de 10mm das laterais e 10mm do fim)
    const margin = 10;
    const yPos = pageHeight - 10;
    
    // O recurso text do jsPDF com maxWidth faz quebra de linha automática
    doc.text(disclaimerText, pageWidth / 2, yPos, { 
      maxWidth: pageWidth - (margin * 2), 
      align: 'center' 
    });
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
      <span>{isExporting ? 'Gerando Relatório...' : 'Baixar Relatório (PDF)'}</span>
    </button>
  );
}
