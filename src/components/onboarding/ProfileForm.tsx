import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ActivityLevel } from '../../types/profile';
import type { Profile } from '../../types/profile';

interface ProfileFormProps {
  initialValues?: Partial<Profile>;
  onSubmit: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  submitLabel?: string;
}

const activityLevels = [
  {
    value: ActivityLevel.Sedentary,
    icon: '🪑',
    title: 'Sedentário',
    description: 'Trabalho de escritório, sem exercício',
  },
  {
    value: ActivityLevel.LightlyActive,
    icon: '🚶',
    title: 'Levemente Ativo',
    description: 'Exercício leve 1–3x/semana',
  },
  {
    value: ActivityLevel.ModeratelyActive,
    icon: '🏃',
    title: 'Moderadamente Ativo',
    description: 'Exercício moderado 3–5x/semana',
  },
  {
    value: ActivityLevel.VeryActive,
    icon: '🏋️',
    title: 'Muito Ativo',
    description: 'Exercício intenso 6–7x/semana',
  },
  {
    value: ActivityLevel.ExtremelyActive,
    icon: '🔥',
    title: 'Extremamente Ativo',
    description: 'Atleta ou trabalho físico pesado',
  },
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = 'Salvar',
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate || '');
  const [sex, setSex] = useState<'M' | 'F' | undefined>(initialValues?.sex);
  const [heightCm, setHeightCm] = useState<string>(initialValues?.heightCm?.toString() || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(
    initialValues?.activityLevel
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 2) {
      newErrors.name = 'Nome deve ter no mínimo 2 caracteres.';
    }

    if (!birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória.';
    } else {
      const birth = new Date(birthDate);
      const now = new Date();
      if (birth > now) {
        newErrors.birthDate = 'Data de nascimento não pode ser no futuro.';
      } else {
        const age = now.getFullYear() - birth.getFullYear();
        if (age < 10 || age > 100) {
          newErrors.birthDate = 'A idade deve estar entre 10 e 100 anos.';
        }
      }
    }

    if (!sex) {
      newErrors.sex = 'Selecione seu sexo biológico.';
    }

    const height = parseFloat(heightCm);
    if (!heightCm || isNaN(height) || height < 100 || height > 250) {
      newErrors.heightCm = 'A altura deve estar entre 100 e 250 cm.';
    }

    if (!activityLevel) {
      newErrors.activityLevel = 'Selecione um nível de atividade.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        birthDate,
        sex: sex!,
        heightCm: parseFloat(heightCm),
        activityLevel: activityLevel!,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome ou Apelido"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Como quer ser chamado?"
      />

      <Input
        label="Data de Nascimento"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        error={errors.birthDate}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          Sexo Biológico
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSex('M')}
            className={twMerge(
              clsx(
                'py-3 border-2 rounded-xl text-center font-medium transition-all',
                sex === 'M'
                  ? 'border-primary bg-primary/10 text-primary dark:text-primary-dark'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/50'
              )
            )}
          >
            Masculino
          </button>
          <button
            type="button"
            onClick={() => setSex('F')}
            className={twMerge(
              clsx(
                'py-3 border-2 rounded-xl text-center font-medium transition-all',
                sex === 'F'
                  ? 'border-primary bg-primary/10 text-primary dark:text-primary-dark'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/50'
              )
            )}
          >
            Feminino
          </button>
        </div>
        {errors.sex && <p className="text-xs text-danger font-medium ml-1">{errors.sex}</p>}
      </div>

      <Input
        label="Altura"
        type="number"
        value={heightCm}
        onChange={(e) => setHeightCm(e.target.value)}
        error={errors.heightCm}
        placeholder="Ex: 175"
        suffix="cm"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          Nível de Atividade
        </label>
        <div className="space-y-2">
          {activityLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setActivityLevel(level.value)}
              className={twMerge(
                clsx(
                  'w-full flex items-center p-4 border-2 rounded-xl text-left transition-all',
                  activityLevel === level.value
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
                )
              )}
            >
              <div className="text-2xl mr-4">{level.icon}</div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {level.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {level.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        {errors.activityLevel && (
          <p className="text-xs text-danger font-medium ml-1">{errors.activityLevel}</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  );
};
