import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { CheckInForm } from '../components/checkin/CheckInForm';
import { useCheckins } from '../hooks/useCheckins';
import { usePhotos } from '../hooks/usePhotos';
import { useAppContext } from '../context/AppContext';
import { CheckIn } from '../types/checkin';
import { Photo } from '../types/photo';

export const NewCheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const { addCheckin, getLatestCheckin } = useCheckins();
  const { addPhoto } = usePhotos();
  const { showToast } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<CheckIn> | null>(null);

  useEffect(() => {
    const loadLatest = async () => {
      const latest = await getLatestCheckin();
      if (latest) {
        // Pre-fill measurements but NOT date or weight
        const { id, date, weightKg, createdAt, updatedAt, notes, ...measurements } = latest;
        setPrefillData(measurements);
      } else {
        setPrefillData({});
      }
    };
    loadLatest();
  }, [getLatestCheckin]);

  const handleSubmit = async (
    data: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>,
    photos: { front?: File; side?: File; back?: File }
  ) => {
    setLoading(true);
    try {
      const checkinId = await addCheckin(data);
      
      // Salvar fotos se houver
      const photoPromises = Object.entries(photos).map(([angle, file]) => {
        if (file) {
          return addPhoto(checkinId, file, angle as Photo['angle']);
        }
        return Promise.resolve();
      });
      
      await Promise.all(photoPromises);

      // Feedback háptico
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      showToast('Registro salvo com sucesso!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Failed to save check-in', error);
      showToast('Erro ao salvar registro.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!prefillData) {
    return (
      <MainLayout title="Novo registro" showBottomNav={false} showFAB={false}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-primary font-bold">Preparando formulário...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Novo registro"
      showBottomNav={false}
      showFAB={false}
      headerLeftAction={
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      }
    >
      <div className="max-w-md mx-auto py-6">
        <CheckInForm 
          onSubmit={handleSubmit} 
          isLoading={loading} 
          initialValues={prefillData}
        />
      </div>
    </MainLayout>
  );
};
