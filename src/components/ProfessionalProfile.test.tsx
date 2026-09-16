import { render, screen,  waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProfessionalProfile } from './ProfessionalProfile';
import { db } from '../db/db';

// Mock do banco de dados (Dexie)
vi.mock('../db/db', () => ({
  db: {
    profissionais: {
      add: vi.fn().mockResolvedValue('fake-uuid'),
    }
  }
}));

describe('ProfessionalProfile Component', () => {
  const mockOnRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('deve renderizar o formulário se não houver ID no localStorage', () => {
    render(<ProfessionalProfile onRegister={mockOnRegister} />);
    expect(screen.getByText(/Bem-vindo ao BioStats/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seu Nome Completo/i)).toBeInTheDocument();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('deve chamar onRegister automaticamente se houver ID no localStorage', () => {
    localStorage.setItem('profissional_id', '123-id');
    render(<ProfessionalProfile onRegister={mockOnRegister} />);
    
    expect(mockOnRegister).toHaveBeenCalledWith('123-id');
  });

  it('deve permitir preencher o formulário, salvar no Dexie e chamar onRegister', async () => {
    render(<ProfessionalProfile onRegister={mockOnRegister} />);
    
    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(/Seu Nome Completo/i);
    const regInput = screen.getByLabelText(/Registro Profissional/i);
    const submitBtn = screen.getByRole('button', { name: /Criar Perfil e Começar/i });

    // Botão deve estar desabilitado no início
    expect(submitBtn).toBeDisabled();

    // Act (Simula a digitação)
    await user.type(nameInput, 'Dr. Roberto');
    await user.type(regInput, 'CRN 123');

    // Botão habilitado após preencher o nome
    expect(submitBtn).not.toBeDisabled();

    // Act (Submete)
    await user.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(db.profissionais.add).toHaveBeenCalledTimes(1);
      expect(db.profissionais.add).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Dr. Roberto',
        registro_profissional: 'CRN 123'
      }));
      expect(mockOnRegister).toHaveBeenCalled();
      expect(localStorage.getItem('profissional_id')).not.toBeNull();
    });
  });
});
