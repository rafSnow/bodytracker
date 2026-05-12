import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Photo } from '../../types/photo';

interface PhotoUploadProps {
  photos: {
    front?: File | Blob | string;
    side?: File | Blob | string;
    back?: File | Blob | string;
  };
  onChange: (angle: Photo['angle'], file: File | undefined) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, onChange }) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (angle: Photo['angle'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(angle, file);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  const renderPhotoSlot = (angle: Photo['angle'], label: string, ref: React.RefObject<HTMLInputElement | null>) => {
    const photo = photos[angle];
    const previewUrl = photo 
      ? (typeof photo === 'string' ? photo : URL.createObjectURL(photo as Blob)) 
      : null;

    return (
      <div className="flex flex-col items-center gap-2">
        <div 
          onClick={() => !photo && ref.current?.click()}
          className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
            photo 
              ? 'border-primary bg-slate-100 dark:bg-slate-800' 
              : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 cursor-pointer'
          }`}
        >
          {previewUrl ? (
            <>
              <img 
                src={previewUrl} 
                alt={label} 
                className="w-full h-full object-cover"
                onLoad={() => typeof photo !== 'string' && URL.revokeObjectURL(previewUrl)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(angle, undefined);
                }}
                className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-full shadow-lg hover:bg-danger/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
              <input
                type="file"
                ref={ref}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(angle, e)}
              />
            </>
          )}
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {renderPhotoSlot('front', 'Frente', frontInputRef)}
      {renderPhotoSlot('side', 'Perfil', sideInputRef)}
      {renderPhotoSlot('back', 'Costas', backInputRef)}
    </div>
  );
};
