import React, { useState, useEffect } from 'react';
import { Camera, Scale } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { AngleFilter } from '../components/gallery/AngleFilter';
import { PhotoGrid } from '../components/gallery/PhotoGrid';
import { PhotoCompare } from '../components/gallery/PhotoCompare';
import { usePhotos } from '../hooks/usePhotos';
import { useCheckins } from '../hooks/useCheckins';
import { Photo } from '../types/photo';

export const GalleryPage: React.FC = () => {
  const { getAllPhotosGroupedByDate } = usePhotos();
  const { checkins } = useCheckins();
  const [allGroups, setAllGroups] = useState<{ date: string; photos: Photo[] }[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<Photo['angle'] | 'all'>('all');
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      const groups = await getAllPhotosGroupedByDate();
      setAllGroups(groups);
      setLoading(false);
    };
    loadPhotos();
  }, []);

  const filteredGroups = allGroups.map(group => ({
    ...group,
    photos: selectedAngle === 'all' 
      ? group.photos 
      : group.photos.filter(p => p.angle === selectedAngle)
  })).filter(group => group.photos.length > 0);

  const allPhotos = allGroups.flatMap(g => g.photos);
  const hasPhotos = allPhotos.length > 0;

  return (
    <MainLayout
      title="Galeria"
      headerRightAction={
        hasPhotos && (
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Comparar</span>
          </button>
        )
      }
    >
      <div className="space-y-6">
        {hasPhotos ? (
          <>
            <AngleFilter selectedAngle={selectedAngle} onAngleChange={setSelectedAngle} />
            <PhotoGrid groupedPhotos={filteredGroups} />
          </>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Camera className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sua galeria está vazia</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px]">
              Adicione fotos nos seus registros para acompanhar sua evolução visual.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
             <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
             <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
             </div>
          </div>
        )}
      </div>

      {showCompare && (
        <PhotoCompare
          checkins={checkins}
          photos={allPhotos}
          onClose={() => setShowCompare(false)}
        />
      )}
    </MainLayout>
  );
};
