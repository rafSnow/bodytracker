import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { Photo } from '../../types/photo';
import { Badge } from '../ui/Badge';

interface PhotoGridProps {
  groupedPhotos: { date: string; photos: Photo[] }[];
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ groupedPhotos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const angleLabels: Record<Photo['angle'], string> = {
    front: 'Frente',
    side: 'Perfil',
    back: 'Costas',
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-8 pb-20">
      {groupedPhotos.map((group) => (
        <div key={group.date} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {formatDate(group.date)}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {group.photos.map((photo) => (
              <motion.div
                key={photo.id}
                layoutId={`photo-${photo.id}`}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group"
              >
                <img
                  src={URL.createObjectURL(photo.blob)}
                  alt={angleLabels[photo.angle]}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="primary" className="text-[10px] py-0.5 px-2 bg-black/50 border-none backdrop-blur-md">
                    {angleLabels[photo.angle]}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Visualizador Full-screen */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-safe-top right-4 p-2 text-white/70 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.img
              layoutId={`photo-${selectedPhoto.id}`}
              src={URL.createObjectURL(selectedPhoto.blob)}
              alt={angleLabels[selectedPhoto.angle]}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
            />
            
            <div className="mt-6 text-center text-white">
              <Badge variant="primary" className="mb-2">
                {angleLabels[selectedPhoto.angle]}
              </Badge>
              <p className="text-lg font-medium">{formatDate(selectedPhoto.takenAt)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
