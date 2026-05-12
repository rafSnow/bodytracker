import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../../hooks/useProfile';
import { MeasurementInput } from './MeasurementInput';
import { PhotoUpload } from './PhotoUpload';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CheckIn } from '../../types/checkin';
import { Photo } from '../../types/photo';

interface CheckInFormProps {
  initialValues?: Partial<CheckIn>;
  onSubmit: (
    data: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>, 
    photos: { front?: File; side?: File; back?: File }
  ) => void;
  isLoading?: boolean;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const { profile } = useProfile();

  const toLocalISO = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    date: toLocalISO(initialValues?.date),
    weightKg: initialValues?.weightKg?.toString() || '',
    waistCm: initialValues?.waistCm?.toString() || '',
    neckCm: initialValues?.neckCm?.toString() || '',
    hipCm: initialValues?.hipCm?.toString() || '',
    forearmCm: initialValues?.forearmCm?.toString() || '',
    wristCm: initialValues?.wristCm?.toString() || '',
    thighCm: initialValues?.thighCm?.toString() || '',
    calfCm: initialValues?.calfCm?.toString() || '',
    notes: initialValues?.notes || '',
  });

  const [photos, setPhotos] = useState<{
    front?: File;
    side?: File;
    back?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sections, setSections] = useState({
    essential: true,
    additional: !!(
      initialValues?.forearmCm || 
      initialValues?.wristCm || 
      initialValues?.thighCm || 
      initialValues?.calfCm
    ),
    photos: true,
  });

  const isFemale = profile?.sex === 'F';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Data inválida';
      } else if (selectedDate > new Date()) {
        newErrors.date = 'A data não pode ser futura';
      }
    }

    // RN01: Peso 20-300kg
    const weight = parseFloat(formData.weightKg);
    if (!formData.weightKg || isNaN(weight) || weight < 20 || weight > 300) {
      newErrors.weightKg = 'Peso deve estar entre 20 e 300 kg';
    }

    // RN02: Medidas 1-300cm
    const checkMeasure = (val: string, field: string) => {
      if (val) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 1 || num > 300) {
          newErrors[field] = 'Medida deve estar entre 1 e 300 cm';
        }
      }
    };

    checkMeasure(formData.waistCm, 'waistCm');
    checkMeasure(formData.neckCm, 'neckCm');
    checkMeasure(formData.hipCm, 'hipCm');
    checkMeasure(formData.forearmCm, 'forearmCm');
    checkMeasure(formData.wristCm, 'wristCm');
    checkMeasure(formData.thighCm, 'thighCm');
    checkMeasure(formData.calfCm, 'calfCm');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (angle: Photo['angle'], file: File | undefined) => {
    setPhotos(prev => ({ ...prev, [angle]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      onSubmit({
        date: new Date(formData.date).toISOString(),
        weightKg: parseFloat(formData.weightKg),
        waistCm: formData.waistCm ? parseFloat(formData.waistCm) : undefined,
        neckCm: formData.neckCm ? parseFloat(formData.neckCm) : undefined,
        hipCm: formData.hipCm ? parseFloat(formData.hipCm) : undefined,
        forearmCm: formData.forearmCm ? parseFloat(formData.forearmCm) : undefined,
        wristCm: formData.wristCm ? parseFloat(formData.wristCm) : undefined,
        thighCm: formData.thighCm ? parseFloat(formData.thighCm) : undefined,
        calfCm: formData.calfCm ? parseFloat(formData.calfCm) : undefined,
        notes: formData.notes,
      }, photos);
    }
  };

  const hasNavy = formData.waistCm && formData.neckCm && (!isFemale || formData.hipCm);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Indicador Visual */}
      <Card className={hasNavy ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}>
        <div className="flex items-start gap-3">
          {hasNavy ? (
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-semibold ${hasNavy ? 'text-success' : 'text-warning'}`}>
              {hasNavy ? '✓ % Gordura disponível' : '✗ Faltam dados para % gordura'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {hasNavy 
                ? 'Com as medidas informadas, calcularemos sua composição corporal completa.'
                : `Faltam: cintura, pescoço${isFemale ? ' e quadril' : ''} para o Navy Method.`}
            </p>
          </div>
        </div>
      </Card>

      {/* Seção 1: Obrigatório */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Obrigatório</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.date ? 'border-danger' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all`}
            />
            {errors.date && <p className="text-xs text-danger font-medium ml-1 mt-1">{errors.date}</p>}
          </div>
          <MeasurementInput
            label="Peso"
            suffix="kg"
            required
            value={formData.weightKg}
            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
            error={errors.weightKg}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Seção 2: Medidas Essenciais */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSections({ ...sections, essential: !sections.essential })}
          className="flex items-center justify-between w-full px-1"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Medidas Essenciais</h3>
          {sections.essential ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        <AnimatePresence>
          {sections.essential && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <MeasurementInput
                  label="Cintura"
                  suffix="cm"
                  hint="Medir na menor circunferência, acima do umbigo"
                  value={formData.waistCm}
                  onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
                  error={errors.waistCm}
                  placeholder="0.0"
                />
                <MeasurementInput
                  label="Pescoço"
                  suffix="cm"
                  hint="Medir logo abaixo da laringe"
                  value={formData.neckCm}
                  onChange={(e) => setFormData({ ...formData, neckCm: e.target.value })}
                  error={errors.neckCm}
                  placeholder="0.0"
                />
                {isFemale && (
                  <MeasurementInput
                    label="Quadril"
                    suffix="cm"
                    hint="Maior protuberância dos glúteos"
                    value={formData.hipCm}
                    onChange={(e) => setFormData({ ...formData, hipCm: e.target.value })}
                    error={errors.hipCm}
                    placeholder="0.0"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Seção 3: Medidas Adicionais */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSections({ ...sections, additional: !sections.additional })}
          className="flex items-center justify-between w-full px-1"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Medidas Adicionais</h3>
          {sections.additional ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        <AnimatePresence>
          {sections.additional && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <MeasurementInput
                  label="Antebraço"
                  suffix="cm"
                  value={formData.forearmCm}
                  onChange={(e) => setFormData({ ...formData, forearmCm: e.target.value })}
                  error={errors.forearmCm}
                  placeholder="0.0"
                />
                <MeasurementInput
                  label="Punho"
                  suffix="cm"
                  value={formData.wristCm}
                  onChange={(e) => setFormData({ ...formData, wristCm: e.target.value })}
                  error={errors.wristCm}
                  placeholder="0.0"
                />
                <MeasurementInput
                  label="Coxa"
                  suffix="cm"
                  value={formData.thighCm}
                  onChange={(e) => setFormData({ ...formData, thighCm: e.target.value })}
                  error={errors.thighCm}
                  placeholder="0.0"
                />
                <MeasurementInput
                  label="Panturrilha"
                  suffix="cm"
                  value={formData.calfCm}
                  onChange={(e) => setFormData({ ...formData, calfCm: e.target.value })}
                  error={errors.calfCm}
                  placeholder="0.0"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Seção 4: Fotos */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSections({ ...sections, photos: !sections.photos })}
          className="flex items-center justify-between w-full px-1"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Fotos (opcional)</h3>
          {sections.photos ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        <AnimatePresence>
          {sections.photos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              <PhotoUpload photos={photos} onChange={handlePhotoChange} />
              <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                Adicione fotos para acompanhar sua evolução visual. As imagens serão comprimidas e salvas apenas no seu dispositivo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Seção 5: Observações */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Observações</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Como você está se sentindo hoje? Hidratação, sono, etc."
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full py-4 text-lg"
        isLoading={isLoading}
      >
        Salvar Registro
      </Button>
    </form>
  );
};
