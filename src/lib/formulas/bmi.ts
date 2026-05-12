export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; bmiCategory: string } {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let bmiCategory = '';

  if (bmi < 18.5) {
    bmiCategory = 'Abaixo do peso';
  } else if (bmi < 25) {
    bmiCategory = 'Peso normal';
  } else if (bmi < 30) {
    bmiCategory = 'Sobrepeso';
  } else if (bmi < 35) {
    bmiCategory = 'Obesidade Grau I';
  } else if (bmi < 40) {
    bmiCategory = 'Obesidade Grau II';
  } else {
    bmiCategory = 'Obesidade Grau III';
  }

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCategory,
  };
}
