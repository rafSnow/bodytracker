import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CheckIn } from '../types/checkin';
import { Profile } from '../types/profile';
import { Goal } from '../types/goal';
import { calculateAllMetrics } from './formulas';

export async function generateProgressReport(
  checkins: CheckIn[],
  profile: Profile,
  goal: Goal | null,
  chartElements: { weight: HTMLElement; composition: HTMLElement }
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // --- Page 1: Header & Metrics ---
  pdf.setFontSize(22);
  pdf.setTextColor(79, 70, 229); // indigo-600
  pdf.text('Relatório de Progresso', margin, 25);
  
  pdf.setFontSize(12);
  pdf.setTextColor(100);
  pdf.text(`Usuário: ${profile.name}`, margin, 35);
  
  const startDate = new Date(checkins[checkins.length - 1].date).toLocaleDateString('pt-BR');
  const endDate = new Date(checkins[0].date).toLocaleDateString('pt-BR');
  pdf.text(`Período: ${startDate} a ${endDate}`, margin, 42);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, 49);

  // Initial vs Current Metrics
  const first = checkins[checkins.length - 1];
  const last = checkins[0];
  const firstMetrics = calculateAllMetrics(first, profile);
  const lastMetrics = calculateAllMetrics(last, profile);

  pdf.setFontSize(16);
  pdf.setTextColor(0);
  pdf.text('Comparativo: Início vs. Atual', margin, 65);

  const drawMetricRow = (label: string, startVal: string, endVal: string, y: number) => {
    pdf.setFontSize(12);
    pdf.text(label, margin, y);
    pdf.text(startVal, margin + 60, y);
    pdf.text(endVal, margin + 120, y);
  };

  pdf.setFont('helvetica', 'bold');
  drawMetricRow('Métrica', 'Início', 'Atual', 75);
  pdf.setFont('helvetica', 'normal');
  pdf.line(margin, 77, pageWidth - margin, 77);

  drawMetricRow('Peso (kg)', first.weightKg.toString(), last.weightKg.toString(), 85);
  drawMetricRow('IMC', firstMetrics.bmi?.toString() || '-', lastMetrics.bmi?.toString() || '-', 95);
  drawMetricRow('% Gordura', firstMetrics.bodyFatPct?.toString() || '-', lastMetrics.bodyFatPct?.toString() || '-', 105);
  drawMetricRow('Cintura (cm)', first.waistCm?.toString() || '-', last.waistCm?.toString() || '-', 115);
  
  if (profile.sex === 'F') {
    drawMetricRow('Quadril (cm)', first.hipCm?.toString() || '-', last.hipCm?.toString() || '-', 125);
  }

  // Goal Info
  if (goal) {
    pdf.setFontSize(16);
    pdf.text('Meta Ativa', margin, 145);
    pdf.setFontSize(12);
    pdf.text(`Peso Alvo: ${goal.targetWeightKg} kg`, margin, 155);
    if (goal.targetDate) {
      pdf.text(`Data Alvo: ${new Date(goal.targetDate).toLocaleDateString('pt-BR')}`, margin, 162);
    }
    const diff = last.weightKg - goal.targetWeightKg;
    pdf.text(`Restante: ${Math.abs(diff).toFixed(1)} kg para ${diff > 0 ? 'perder' : 'ganhar'}`, margin, 169);
  }

  // --- Page 2: Charts ---
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text('Evolução Gráfica', margin, 20);

  const captureChart = async (el: HTMLElement, y: number) => {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
    return imgHeight;
  };

  pdf.setFontSize(14);
  pdf.text('Histórico de Peso', margin, 35);
  const weightHeight = await captureChart(chartElements.weight, 40);

  pdf.text('Composição Corporal', margin, 50 + weightHeight);
  await captureChart(chartElements.composition, 55 + weightHeight);

  // --- Page 3: Check-ins Table ---
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text('Histórico de Registros', margin, 20);

  let y = 35;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data', margin, y);
  pdf.text('Peso', margin + 30, y);
  pdf.text('Cintura', margin + 50, y);
  pdf.text('% Gord', margin + 75, y);
  pdf.text('IMC', margin + 100, y);
  pdf.text('Notas', margin + 125, y);
  pdf.setFont('helvetica', 'normal');
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);
  y += 10;

  for (const checkin of checkins) {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }
    const m = calculateAllMetrics(checkin, profile);
    pdf.text(new Date(checkin.date).toLocaleDateString('pt-BR'), margin, y);
    pdf.text(`${checkin.weightKg}kg`, margin + 30, y);
    pdf.text(checkin.waistCm ? `${checkin.waistCm}cm` : '-', margin + 50, y);
    pdf.text(m.bodyFatPct ? `${m.bodyFatPct}%` : '-', margin + 75, y);
    pdf.text(m.bmi?.toString() || '-', margin + 100, y);
    
    const notes = checkin.notes || '';
    const truncatedNotes = notes.length > 30 ? notes.substring(0, 27) + '...' : notes;
    pdf.text(truncatedNotes, margin + 125, y);
    
    y += 7;
  }

  // Download
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    window.open(url);
  } else {
    pdf.save(`body-tracker-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
