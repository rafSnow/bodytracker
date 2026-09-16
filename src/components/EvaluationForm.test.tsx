import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EvaluationForm } from './EvaluationForm';
import { db } from '../db/db';

// Mock DB interactions
vi.mock('../db/db', () => ({
  db: {
    clientes: {
      get: vi.fn(),
    },
    avaliacoes: { add: vi.fn() },
    resultados: { add: vi.fn() },
    transaction: vi.fn(async (_mode, _t1, _t2, cb) => {
      await cb();
    }),
  },
}));

describe('EvaluationForm Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const fakeCliente = {
    id: 'cliente-1',
    nome: 'Maria da Silva',
    data_nascimento: new Date('1990-01-01'), // 36 anos em 2026
    sexo: 'F',
    altura_cm: 165,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (db.clientes.get as any).mockResolvedValue(fakeCliente);
  });

  it('deve carregar e renderizar os dados do cliente', async () => {
    render(<EvaluationForm clienteId="cliente-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    // Aguarda o useEffect resolver
    expect(await screen.findByText('Maria da Silva')).toBeInTheDocument();
  });

  it('deve desabilitar o botão de envio se campos obrigatórios faltarem', async () => {
    render(<EvaluationForm clienteId="cliente-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    await screen.findByText('Maria da Silva');
    const submitBtn = screen.getByRole('button', { name: /Calcular Resultados/i });
    expect(submitBtn).toBeDisabled();
  });

  it('deve permitir a digitação de medidas e chamar a transação ao salvar', async () => {
    render(<EvaluationForm clienteId="cliente-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    await screen.findByText('Maria da Silva');
    const user = userEvent.setup();

    // Act - Preenche os campos obrigatórios (Peso e Cintura) com workaround para inputs sem htmlFor
    const pesoInput = screen.getByText(/Peso \(kg\)/i).parentElement?.querySelector('input') as HTMLInputElement;
    const cinturaInput = screen.getByText(/Cintura/i).parentElement?.querySelector('input') as HTMLInputElement;
    const pescocoInput = screen.getByText(/Pescoço/i).parentElement?.querySelector('input') as HTMLInputElement;
    
    await user.type(pesoInput, '65.5');
    await user.type(cinturaInput, '70');
    await user.type(pescocoInput, '34');

    const submitBtn = screen.getByRole('button', { name: /Calcular Resultados/i });
    expect(submitBtn).not.toBeDisabled();

    // Act - Submit
    await user.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(db.transaction).toHaveBeenCalled();
      expect(db.avaliacoes.add).toHaveBeenCalledWith(expect.objectContaining({
        peso_kg: 65.5,
        cliente_id: 'cliente-1',
        medidas: expect.objectContaining({
          cintura: 70,
          pescoco: 34
        })
      }));
      expect(db.resultados.add).toHaveBeenCalledWith(expect.objectContaining({
        calculos: expect.objectContaining({
          imc: expect.any(Number),
          bfNavy: expect.any(Number)
        })
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
