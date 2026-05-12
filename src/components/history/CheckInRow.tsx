import React, { useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Camera, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { CheckIn } from '../../types/checkin';
import { useProfile } from '../../hooks/useProfile';
import { calculateAllMetrics } from '../../lib/formulas';
import { db } from '../../db/database';
import { formatWeight } from '../../lib/units';

interface CheckInRowProps {
  checkin: CheckIn;
  onClick: (checkin: CheckIn) => void;
  onEdit: (checkin: CheckIn) => void;
  onDelete: (id: number) => void;
}

export const CheckInRow = React.memo<CheckInRowProps>(({
  checkin,
  onClick,
  onEdit,
  onDelete,
}) => {
  const { profile } = useProfile();
  const [hasPhotos, setHasPhotos] = useState(false);
  const [swipeX, setSwipeX] = useState(0);

  const metrics = profile ? calculateAllMetrics(checkin, profile) : null;

  useEffect(() => {
    if (checkin.id) {
      db.photos.where('checkinId').equals(checkin.id).count().then(count => {
        setHasPhotos(count > 0);
      });
    }
  }, [checkin.id]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      setSwipeX(-120);
    } else {
      setSwipeX(0);
    }
  };

  const dateObj = new Date(checkin.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-end items-stretch px-4 gap-2">
        <button
          onClick={() => {
            setSwipeX(0);
            onEdit(checkin);
          }}
          className="bg-primary text-white w-14 flex items-center justify-center transition-colors hover:bg-primary-dark"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setSwipeX(0);
            checkin.id && onDelete(checkin.id);
          }}
          className="bg-danger text-white w-14 flex items-center justify-center transition-colors hover:bg-danger-dark"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swipeX }}
        onClick={() => swipeX === 0 && onClick(checkin)}
        className="relative z-10 bg-white dark:bg-slate-900 px-4 py-4 flex items-center gap-4 cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center min-w-[3rem] border-r border-slate-100 dark:border-slate-800 pr-4">
          <span className="text-xs font-bold text-slate-400 uppercase">
            {month}
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">
            {day}
          </span>
        </div>

        <div className="flex-1 grid grid-cols-4 gap-2 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Peso</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {formatWeight(checkin.weightKg, 'kg')}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">%G</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {metrics?.bodyFatPct ? `${metrics.bodyFatPct.toFixed(1)}%` : '—'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">IMC</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {metrics?.bmi ? metrics.bmi.toFixed(1) : '—'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Cint.</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {checkin.waistCm ? `${checkin.waistCm.toFixed(1)}` : '—'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300 dark:text-slate-600">
          {hasPhotos && <Camera className="w-4 h-4 text-primary/50" />}
          <ChevronRight className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  );
});
