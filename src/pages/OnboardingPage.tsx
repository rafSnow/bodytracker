import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { useProfile } from '../hooks/useProfile';
import { useAppContext } from '../context/AppContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveProfile } = useProfile();
  const { showToast } = useAppContext();

  const handleComplete = async (data: any) => {
    try {
      await saveProfile(data);
      showToast('Bem-vindo ao Body Tracker!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      showToast('Ocorreu um erro ao salvar seu perfil. Tente novamente.', 'danger');
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col justify-center">
      <OnboardingFlow onComplete={handleComplete} />
    </div>
  );
};
