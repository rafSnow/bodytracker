import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, Weight, FileText, Edit2, Trash2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckIn } from '../../types/checkin';
import { Photo } from '../../types/photo';
import { useProfile } from '../../hooks/useProfile';
import { usePhotos } from '../../hooks/usePhotos';
import { calculateAllMetrics } from '../../lib/formulas';

interface CheckInDetailProps {
  checkin: CheckIn;
  onEdit: (checkin: CheckIn) => void;
  onDelete: (id: number) => void;
}

export const CheckInDetail: React.FC<CheckInDetailProps> = ({
  checkin,
  onEdit,
  onDelete,
}) => {
  const { profile } = useProfile();
  const { getPhotosByCheckinId } = usePhotos();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  const isFemale = profile?.sex === 'F';

  useEffect(() => {
    if (checkin.id) {
      getPhotosByCheckinId(checkin.id).then(setPhotos);
    }
  }, [checkin.id]);

  const metrics = useMemo(() => {
    if (!profile) return null;
    return calculateAllMetrics(checkin, profile);
  }, [checkin, profile]);

  const dateFormatted = new Date(checkin.date).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const measurements = [
    { label: 'Cintura', value: checkin.waistCm, unit: 'cm' },
    { label: 'Pescoço', value: checkin.neckCm, unit: 'cm' },
    ...(isFemale ? [{ label: 'Quadril', value: checkin.hipCm, unit: 'cm' }] : []),
    { label: 'Antebraço', value: checkin.forearmCm, unit: 'cm' },
    { label: 'Punho', value: checkin.wristCm, unit: 'cm' },
    { label: 'Coxa', value: checkin.thighCm, unit: 'cm' },
    { label: 'Panturrilha', value: checkin.calfCm, unit: 'cm' },
  ].filter((m) => m.value !== undefined);

  const getBMIVariant = (category: string | null) => {
    if (category === 'Peso normal') return 'success';
    if (category === 'Abaixo do peso' || category === 'Sobrepeso') return 'warning';
    return 'danger';
  };

  const getBFVariant = (category: string | null) => {
    if (category === 'Atlético' || category === 'Fitness') return 'success';
    if (category === 'Aceitável') return 'warning';
    return 'danger';
  };

  const getRiskVariant = (risk: string | null) => {
    if (risk === 'Baixo' || risk === 'Saudável') return 'success';
    if (risk === 'Moderado' || risk === 'Risco aumentado' || risk === 'Abaixo do esperado') return 'warning';
    return 'danger';
  };

  const angleLabels: Record<Photo['angle'], string> = {
    front: 'Frente',
    side: 'Perfil',
    back: 'Costas',
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Data do Registro</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{dateFormatted}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(checkin)}
            className="w-10 h-10 p-0 rounded-full bg-white dark:bg-slate-900 shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkin.id && onDelete(checkin.id)}
            className="w-10 h-10 p-0 rounded-full bg-white dark:bg-slate-900 shadow-sm text-danger"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Fotos Section */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Fotos de Progresso</h3>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer group"
              >
                <img 
                  src={URL.createObjectURL(photo.blob)} 
                  alt={photo.angle} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
                <div className="absolute bottom-1 left-1 right-1">
                  <Badge variant="primary" className="w-full justify-center text-[8px] py-0.5 px-1 bg-black/40 border-none backdrop-blur-sm">
                    {angleLabels[photo.angle]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Métricas Principais */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Composição Corporal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">IMC</p>
                {metrics?.bmiCategory && (
                  <Badge variant={getBMIVariant(metrics.bmiCategory)}>
                    {metrics.bmiCategory}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics?.bmi?.toFixed(1) || '—'}
              </p>
              <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-[10px] text-slate-500 leading-tight border border-slate-100 dark:border-slate-800">
                <Info className="w-3 h-3 shrink-0" />
                <p>O IMC é uma referência geral. Analise-o junto ao % de gordura e medidas.</p>
              </div>
            </Card>

            <Card className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">% Gordura (Navy)</p>
                {metrics?.bodyFatCategory && (
                  <Badge variant={getBFVariant(metrics.bodyFatCategory)}>
                    {metrics.bodyFatCategory}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics?.bodyFatPct ? `${metrics.bodyFatPct.toFixed(1)}%` : '—'}
              </p>
              {metrics?.fatMassKg !== null && metrics?.fatMassKg !== undefined && (
                <div className="flex justify-between text-[10px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                   <div>
                     <p className="text-slate-400 uppercase font-bold">Massa Gorda</p>
                     <p className="text-slate-900 dark:text-white font-bold">{metrics.fatMassKg.toFixed(1)}kg</p>
                   </div>
                   <div className="text-right">
                     <p className="text-slate-400 uppercase font-bold">Massa Magra</p>
                     <p className="text-primary font-bold">{metrics.leanMassKg?.toFixed(1)}kg</p>
                   </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Metabolismo */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Metabolismo Estimado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">TDEE (Manutenção)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.tdee || '—'}</span>
                <span className="text-sm text-slate-500">kcal/dia</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Estimativa de gasto total diário para manter o peso atual.</p>
            </Card>
            
            <Card className="p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Sugestão de Metas</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Déficit</span>
                  <span className="text-xs font-bold text-danger">{metrics?.tdeeDeficit?.low} - {metrics?.tdeeDeficit?.high} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Superávit</span>
                  <span className="text-xs font-bold text-success">{metrics?.tdeeSurplus?.low} - {metrics?.tdeeSurplus?.high} kcal</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Índices e Saúde */}
        {(metrics?.whr || metrics?.whtr) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Saúde e Risco</h3>
            <div className="grid grid-cols-2 gap-4">
              {metrics.whr && (
                <Card className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ICQ (C/Q)</p>
                    <Badge variant={getRiskVariant(metrics.whrRisk)} className="text-[8px] px-1.5">
                      {metrics.whrRisk}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.whr.toFixed(2)}</p>
                </Card>
              )}
              {metrics.whtr && (
                <Card className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ICA (C/A)</p>
                    <Badge variant={getRiskVariant(metrics.whtrCategory)} className="text-[8px] px-1.5">
                      {metrics.whtrCategory}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.whtr.toFixed(2)}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Dados Brutos */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Medições</h3>
          <Card className="flex items-center gap-4 p-4 border-primary/20 bg-primary/5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Weight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Peso Atualizado</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {checkin.weightKg.toFixed(2)} <span className="text-sm font-normal text-slate-500">kg</span>
              </p>
            </div>
          </Card>

          {measurements.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {measurements.map((m) => (
                <Card key={m.label} className="p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{m.label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {m.value?.toFixed(1)} <span className="text-xs font-normal text-slate-500">{m.unit}</span>
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {checkin.notes && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Observações</h3>
            <Card className="p-4 flex gap-3">
              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                "{checkin.notes}"
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Viewer */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-safe-top right-4 p-2 text-white/70 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
            
            <img
              src={URL.createObjectURL(selectedPhoto.blob)}
              alt={selectedPhoto.angle}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
            />
            
            <div className="mt-6 text-center text-white">
              <Badge variant="primary" className="mb-2">
                {angleLabels[selectedPhoto.angle]}
              </Badge>
              <p className="text-lg font-medium">{dateFormatted}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
