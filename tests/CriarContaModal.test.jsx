import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CriarContaModal from '@/Site/PopUpsEModals/CriarContaModal';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const setupMocks = () => {
  global.fetch = jest.fn().mockImplementation((url, options = {}) => {
    const urlStr = String(url);
    if (urlStr.endsWith('/auth/register') && options.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          access_token: 'jwt-token-register',
          token_type: 'bearer',
          user: { id: 101, email: 'novo.aluno@edge.ufal.br', name: 'Novo Aluno Edge', admin: false },
        }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  });
};

describe('CriarContaModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnUserCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza apenas os campos Nome Completo, E-mail Institucional, Senha e Confirmar Senha', async () => {
    setupMocks();
    await act(async () => {
      render(
        <CriarContaModal
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      );
    });

    expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@edge.ufal.br')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Crie sua senha de acesso')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirme sua senha de acesso')).toBeInTheDocument();

    // Garante que campos academicos e extras NAO existem
    expect(screen.queryByPlaceholderText(/Sua matrícula/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Dados Acadêmicos')).not.toBeInTheDocument();
    expect(screen.queryByText('Ano de Ingresso')).not.toBeInTheDocument();
    expect(screen.queryByText('Semestre')).not.toBeInTheDocument();
    expect(screen.queryByText('Trilha')).not.toBeInTheDocument();
    expect(screen.queryByText(/É Admin/i)).not.toBeInTheDocument();
  });

  it('valida que o e-mail deve pertencer ao domínio @edge.ufal.br', async () => {
    setupMocks();
    await act(async () => {
      render(
        <CriarContaModal
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
      target: { value: 'Aluno Teste' },
    });
    fireEvent.change(screen.getByPlaceholderText('usuario@edge.ufal.br'), {
      target: { value: 'aluno@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Crie sua senha de acesso'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha de acesso'), {
      target: { value: 'Password123!' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    });

    expect(
      screen.getByText('O e-mail deve pertencer ao domínio @edge.ufal.br.')
    ).toBeInTheDocument();
  });

  it('valida que as senhas devem coincidir', async () => {
    setupMocks();
    await act(async () => {
      render(
        <CriarContaModal
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
      target: { value: 'Aluno Teste' },
    });
    fireEvent.change(screen.getByPlaceholderText('usuario@edge.ufal.br'), {
      target: { value: 'aluno@edge.ufal.br' },
    });
    fireEvent.change(screen.getByPlaceholderText('Crie sua senha de acesso'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha de acesso'), {
      target: { value: 'DifferentPassword123!' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    });

    expect(
      screen.getByText('As senhas informadas não coincidem.')
    ).toBeInTheDocument();
  });

  it('submete com sucesso os dados, salva token/usuario no localStorage e redireciona direto para a home', async () => {
    setupMocks();
    await act(async () => {
      render(
        <CriarContaModal
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
      target: { value: 'Novo Aluno Edge' },
    });
    fireEvent.change(screen.getByPlaceholderText('usuario@edge.ufal.br'), {
      target: { value: 'novo.aluno@edge.ufal.br' },
    });
    fireEvent.change(screen.getByPlaceholderText('Crie sua senha de acesso'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha de acesso'), {
      target: { value: 'Password123!' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    });

    await waitFor(() => {
      expect(localStorage.getItem('ponto_ai_token')).toBe('jwt-token-register');
      expect(localStorage.getItem('ponto_ai_user')).toContain('novo.aluno@edge.ufal.br');
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
