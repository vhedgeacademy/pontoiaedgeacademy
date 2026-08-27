import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import EsqueciSenhaPage from '../src/app/esqueci-senha/page';

describe('EsqueciSenha Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders forgot password form with 4 fields', () => {
    render(<EsqueciSenhaPage />);

    expect(screen.getByText('Recuperação de Senha')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail institucional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^matrícula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nova senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar nova senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeInTheDocument();
  });

  it('submits forgot password successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ detail: 'Senha redefinida com sucesso.' }),
    });

    render(<EsqueciSenhaPage />);

    fireEvent.change(screen.getByPlaceholderText('seu.email@edge.ufal.br'), {
      target: { value: 'aluno@edge.ufal.br' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Matrícula/i), {
      target: { value: '2024123456' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mín. 8 caracteres/i), {
      target: { value: 'SenhaForte@123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirme a nova senha'), {
      target: { value: 'SenhaForte@123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/senha redefinida com sucesso/i)).toBeInTheDocument();
    });
  });
});
