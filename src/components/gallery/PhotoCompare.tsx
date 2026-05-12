import React, { useState, useMemo } from 'react';
import { X, Scale, Target, Activity } from 'lucide-react';
import { Photo } from '../../types/photo';
import { CheckIn } from '../../types/checkin';
import { useProfile } from '../../hooks/useProfile';
import { calculateAllMetrics } from '../../lib/formulas';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';

interface PhotoCompareProps {
  checkins: CheckIn[];
  photos: Photo[];
  onClose: () => void;
}

export const PhotoCompare: React.FC<PhotoCompareProps> = ({ checkins, photos, onClose }) => {
  const { profile } = useProfile();
  
  // Datas que possuem pelo menos uma foto
  const datesWithPhotos = useMemo(() => {
    const dates = new Set(photos.map(p => p.takenAt.split('T')[0]));
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [photos]);

  const [dateBefore, setDateBefore] = useState(datesWithPhotos[datesWithPhotos.length - 1] || '');
  const [dateAfter, setDateAfter] = useState(datesWithPhotos[0] || '');
  const [selectedAngle, setSelectedAngle] = useState<Photo['angle']>('front');

  const getPhoto = (date: string, angle: Photo['angle']) => {
    return photos.find(p => p.takenAt.startsWith(date) && p.angle === angle);
  };

  const getMetrics = (date: string) => {
    const checkin = checkins.find(c => c.date.startsWith(date));
    if (!checkin || !profile) return null;
    return calculateAllMetrics(checkin, profile);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }).format(new Date(dateStr));
  };

  const photoBefore = getPhoto(dateBefore, selectedAngle);
  const photoAfter = getPhoto(dateAfter, selectedAngle);
  const metricsBefore = getMetrics(dateBefore);
  const metricsAfter = getMetrics(dateAfter);
  const checkinBefore = checkins.find(c => c.date.startsWith(dateBefore));
  const checkinAfter = checkins.find(c => c.date.startsWith(dateAfter));

  const renderMetric = (label: string, value: string | number | undefined, icon: React.ReactNode) => (
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
      {icon}
      <span>{label}: <strong>{value || '--'}</strong></span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comparar Evolução</h2>
        <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-safe-bottom">
        {/* Seletores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Antes</label>
            <Select
              value={dateBefore}
              onChange={(e) => setDateBefore(e.target.value)}
              options={datesWithPhotos.map(d => ({ label: formatDate(d), value: d }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Depois</label>
            <Select
              value={dateAfter}
              onChange={(e) => setDateAfter(e.target.value)}
              options={datesWithPhotos.map(d => ({ label: formatDate(d), value: d }))}
            />
          </div>
        </div>

        {/* Filtro de Ângulo */}
        <div className="flex justify-center gap-2">
          {(['front', 'side', 'back'] as const).map(angle => (
            <button
              key={angle}
              onClick={() => setSelectedAngle(angle)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                selectedAngle === angle
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {angle === 'front' ? 'Frente' : angle === 'side' ? 'Perfil' : 'Costas'}
            </button>
          ))}
        </div>

        {/* Comparação Side-by-Side */}
        <div className="grid grid-cols-2 gap-2">
          {/* Antes */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm">
              {photoBefore ? (
                <img
                  src={URL.createObjectURL(photoBefore.blob)}
                  alt="Antes"
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-4">
                  Nenhuma foto deste ângulo
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <Badge variant="primary" className="text-[10px] bg-black/50 border-none backdrop-blur-md">
                  {formatDate(dateBefore)}
                </Badge>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl space-y-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
              {renderMetric('Peso', checkinBefore?.weightKg ? `${checkinBefore.weightKg}kg` : undefined, <Scale className="w-3 h-3" />)}
              {renderMetric('Gordura', metricsBefore?.bodyFatPct ? `${metricsBefore.bodyFatPct}%` : undefined, <Target className="w-3 h-3" />)}
              {renderMetric('Cintura', checkinBefore?.waistCm ? `${checkinBefore.waistCm}cm` : undefined, <Activity className="w-3 h-3" />)}
            </div>
          </div>

          {/* Depois */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm">
              {photoAfter ? (
                <img
                  src={URL.createObjectURL(photoAfter.blob)}
                  alt="Depois"
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-4">
                  Nenhuma foto deste ângulo
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <Badge variant="primary" className="text-[10px] bg-black/50 border-none backdrop-blur-md">
                  {formatDate(dateAfter)}
                </Badge>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl space-y-1.5 shadow-sm border border-slate-100 dark:border-slate-800">
              {renderMetric('Peso', checkinAfter?.weightKg ? `${checkinAfter.weightKg}kg` : undefined, <Scale className="w-3 h-3" />)}
              {renderMetric('Gordura', metricsAfter?.bodyFatPct ? `${metricsAfter.bodyFatPct}%` : undefined, <Target className="w-3 h-3" />)}
              {renderMetric('Cintura', checkinAfter?.waistCm ? `${checkinAfter.waistCm}cm` : undefined, <Activity className="w-3 h-3" />)}
            </div>
          </div>
        </div>

        {/* Resumo da Mudança (Opcional) */}
        {metricsBefore && metricsAfter && checkinBefore && checkinAfter && (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Resumo do Período</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-1">Peso</p>
                <p className={`text-sm font-bold ${(checkinAfter.weightKg - checkinBefore.weightKg) <= 0 ? 'text-success' : 'text-danger'}`}>
                  {(checkinAfter.weightKg - checkinBefore.weightKg).toFixed(1)}kg
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-1">Gordura</p>
                <p className={`text-sm font-bold ${(metricsAfter.bodyFatPct! - metricsBefore.bodyFatPct!) <= 0 ? 'text-success' : 'text-danger'}`}>
                  {(metricsAfter.bodyFatPct! - metricsBefore.bodyFatPct!).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-1">Cintura</p>
                <p className={`text-sm font-bold ${(checkinAfter.waistCm! - checkinBefore.waistCm!) <= 0 ? 'text-success' : 'text-danger'}`}>
                  {(checkinAfter.waistCm! - checkinBefore.waistCm!).toFixed(1)}cm
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
