import { render, screen, fireEvent } from '@testing-library/react';
import {  describe, it, expect, beforeEach } from 'vitest';
import { LegalDisclaimerModal } from './LegalDisclaimerModal';

describe('LegalDisclaimerModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar o modal quando o consentimento não existe no localStorage', () => {
    render(<LegalDisclaimerModal />);
    
    // Assert modal está visível
    expect(screen.getByText(/Aviso Importante e Responsabilidade/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eu li e compreendo/i })).toBeInTheDocument();
  });

  it('não deve renderizar o modal se o consentimento já foi dado', () => {
    localStorage.setItem('disclaimer_accepted', 'true');
    const { container } = render(<LegalDisclaimerModal />);
    
    expect(container).toBeEmptyDOMElement();
  });

  it('deve fechar o modal e salvar no localStorage ao clicar em Eu li e compreendo', () => {
    render(<LegalDisclaimerModal />);
    
    const btn = screen.getByRole('button', { name: /Eu li e compreendo/i });
    
    // Act
    fireEvent.click(btn);

    // Assert
    expect(localStorage.getItem('disclaimer_accepted')).toBe('true');
    expect(screen.queryByText(/Aviso Importante e Responsabilidade/i)).not.toBeInTheDocument();
  });
});
