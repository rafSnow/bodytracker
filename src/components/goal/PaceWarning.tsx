import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PaceWarningProps {
  isRateSafe: boolean;
  rateWarning: string | null;
  onAdjustDeadline?: () => void;
}

export const PaceWarning: React.FC<PaceWarningProps> = ({
  isRateSafe,
  rateWarning,
  onAdjustDeadline
}) => {
  if (isRateSafe || !rateWarning) return null;

  return (
    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 mb-6">
      <div className="flex gap-3">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg h-fit">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-1">Ritmo Agressivo</h4>
          <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
            {rateWarning} 
            <br />
            Este ritmo está acima do recomendado pela ciência (0,5–1% do peso/semana segundo Helms et al., 2014). Ritmos elevados aumentam o risco de perda de massa muscular.
          </p>
          {onAdjustDeadline && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-50"
              onClick={onAdjustDeadline}
            >
              <Calendar size={14} className="mr-2" />
              Ajustar prazo sugerido
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
