import React from 'react';
import { Photo } from '../../types/photo';

interface AngleFilterProps {
  selectedAngle: Photo['angle'] | 'all';
  onAngleChange: (angle: Photo['angle'] | 'all') => void;
}

export const AngleFilter: React.FC<AngleFilterProps> = ({ selectedAngle, onAngleChange }) => {
  const options: { label: string; value: Photo['angle'] | 'all' }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Frente', value: 'front' },
    { label: 'Perfil', value: 'side' },
    { label: 'Costas', value: 'back' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onAngleChange(option.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            selectedAngle === option.value
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
