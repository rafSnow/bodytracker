import Papa from 'papaparse';
import { CheckIn } from '../types/checkin';
import { Profile } from '../types/profile';
import { calculateAllMetrics } from './formulas';

export async function exportAllCheckinsToCSV(
  checkins: CheckIn[],
  profile: Profile
): Promise<void> {
  const data = checkins.map((checkin) => {
    const metrics = calculateAllMetrics(checkin, profile);
    
    return {
      'Data': new Date(checkin.date).toLocaleString('pt-BR'),
      'Peso(kg)': checkin.weightKg,
      'Cintura(cm)': checkin.waistCm ?? '',
      'Pescoço(cm)': checkin.neckCm ?? '',
      'Quadril(cm)': checkin.hipCm ?? '',
      'IMC': metrics.bmi ?? '',
      '%Gordura': metrics.bodyFatPct ?? '',
      'MassaMagra(kg)': metrics.leanMassKg ?? '',
      'MassaGorda(kg)': metrics.fatMassKg ?? '',
      'TMB(kcal)': metrics.bmr ?? '',
      'TDEE(kcal)': metrics.tdee ?? '',
      'ICQ': metrics.whr ?? '',
      'ICA': metrics.whtr ?? '',
      'Notas': checkin.notes ?? ''
    };
  });

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `body-tracker-export-${new Date().toISOString().split('T')[0]}.csv`);
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(url);
  } else {
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
