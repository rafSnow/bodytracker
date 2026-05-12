import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ActivityLevel } from '../../types/profile';
import type { Profile } from '../../types/profile';

interface OnboardingFlowProps {
  onComplete: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const activityLevels = [
  { value: ActivityLevel.Sedentary, icon: '🪑', title: 'Sedentário', description: 'Trabalho de escritório, sem exercício' },
  { value: ActivityLevel.LightlyActive, icon: '🚶', title: 'Levemente Ativo', description: 'Exercício leve 1–3x/semana' },
  { value: ActivityLevel.ModeratelyActive, icon: '🏃', title: 'Moderadamente Ativo', description: 'Exercício moderado 3–5x/semana' },
  { value: ActivityLevel.VeryActive, icon: '🏋️', title: 'Muito Ativo', description: 'Exercício intenso 6–7x/semana' },
  { value: ActivityLevel.ExtremelyActive, icon: '🔥', title: 'Extremamente Ativo', description: 'Atleta ou trabalho físico pesado' },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<'M' | 'F' | undefined>();
  const [heightCm, setHeightCm] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (validateStep(step)) {
      setDirection(1);
      setStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!name || name.trim().length < 2) newErrors.name = 'Nome deve ter no mínimo 2 caracteres.';
      if (!birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória.';
      else {
        const birth = new Date(birthDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (birth > now) newErrors.birthDate = 'Data de nascimento não pode ser no futuro.';
        else {
          let age = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
          }
          if (age < 10 || age > 100) newErrors.birthDate = 'A idade deve estar entre 10 e 100 anos.';
        }
      }
    } else if (currentStep === 2) {
      if (!sex) newErrors.sex = 'Selecione seu sexo biológico.';
      const height = parseFloat(heightCm);
      if (!heightCm || isNaN(height) || height < 100 || height > 250) {
        newErrors.heightCm = 'A altura deve estar entre 100 e 250 cm.';
      }
    } else if (currentStep === 3) {
      if (!activityLevel) newErrors.activityLevel = 'Selecione um nível de atividade.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setStep(1); // Back to first error
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onComplete({
        name: name.trim(),
        birthDate,
        sex: sex!,
        heightCm: parseFloat(heightCm),
        activityLevel: activityLevel!,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto bg-surface dark:bg-surface-dark px-4 py-8 safe-top safe-bottom">
      {/* Progress Indicator */}
      <div className="flex justify-center space-x-2 mb-8 sticky top-0 bg-surface dark:bg-surface-dark py-2 z-20">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={twMerge(
              clsx(
                'h-2 w-8 rounded-full transition-colors duration-300',
                step >= i ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
              )
            )}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Step 1: Boas-vindas + Nome + Data */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo! 👋</h2>
                  <p className="text-slate-500 dark:text-slate-400">Vamos personalizar sua experiência.</p>
                </div>
                <Input
                  label="Como quer ser chamado?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  placeholder="Seu nome ou apelido"
                  autoFocus
                />
                <Input
                  label="Qual sua data de nascimento?"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  error={errors.birthDate}
                />
              </div>
            )}

            {/* Step 2: Sexo + Altura */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Características Físicas</h2>
                  <p className="text-slate-500 dark:text-slate-400">Esses dados são usados para cálculos científicos.</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Sexo Biológico</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSex('M')}
                      className={clsx(
                        'py-4 border-2 rounded-xl text-center font-medium transition-all',
                        sex === 'M' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      )}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setSex('F')}
                      className={clsx(
                        'py-4 border-2 rounded-xl text-center font-medium transition-all',
                        sex === 'F' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      )}
                    >
                      Feminino
                    </button>
                  </div>
                  {errors.sex && <p className="text-xs text-danger font-medium ml-1">{errors.sex}</p>}
                </div>
                <Input
                  label="Qual sua altura?"
                  type="number"
                  inputMode="decimal"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  error={errors.heightCm}
                  placeholder="Ex: 175"
                  suffix="cm"
                />
              </div>
            )}

            {/* Step 3: Nível de Atividade */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sua Rotina</h2>
                  <p className="text-slate-500 dark:text-slate-400">Isso nos ajuda a calcular seu gasto energético.</p>
                </div>
                <div className="space-y-3 pb-4">
                  {activityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setActivityLevel(level.value)}
                      className={clsx(
                        'w-full flex items-center p-4 border-2 rounded-xl text-left transition-all',
                        activityLevel === level.value
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-slate-200 dark:border-slate-800'
                      )}
                    >
                      <div className="text-3xl mr-4">{level.icon}</div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{level.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{level.description}</p>
                      </div>
                    </button>
                  ))}
                  {errors.activityLevel && <p className="text-xs text-danger font-medium ml-1">{errors.activityLevel}</p>}
                </div>
              </div>
            )}

            {/* Step 4: Resumo */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tudo Certo! 🎉</h2>
                  <p className="text-slate-500 dark:text-slate-400">Aqui está o resumo do seu perfil.</p>
                </div>
                <div className="bg-card dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500">Nome</span>
                    <span className="font-medium text-slate-900 dark:text-white">{name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500">Nascimento</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(birthDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500">Sexo</span>
                    <span className="font-medium text-slate-900 dark:text-white">{sex === 'M' ? 'Masculino' : 'Feminino'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-slate-500">Altura</span>
                    <span className="font-medium text-slate-900 dark:text-white">{heightCm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atividade</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {activityLevels.find(l => l.value === activityLevel)?.title}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 flex justify-between items-center z-30 safe-bottom">
        {step > 1 ? (
          <Button variant="ghost" onClick={prevStep} type="button">
            Voltar
          </Button>
        ) : (
          <div /> // Spacer
        )}

        {step < 4 ? (
          <Button onClick={nextStep} type="button">
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isSubmitting} type="button">
            Começar
          </Button>
        )}
      </div>
    </div>
  );
};
