import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CriarContaModal from '@/Site/PopUpsEModals/CriarContaModal';

const setupMocks = () => {
  global.fetch = jest.fn().mockImplementation((url, options = {}) => {
    const urlStr = String(url);
    if (urlStr.endsWith('/users/') && options.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 101, email: 'novo.aluno@edge.ufal.br', admin: false }),
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
  });

  it('renderiza o formulário de cadastro de estudante sem campos de administrador, turma, cargo e curso', async () => {
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
    expect(screen.getByPlaceholderText('Sua matrícula (somente números)')).toBeInTheDocument();
    expect(screen.getByText('Dados Acadêmicos')).toBeInTheDocument();
    expect(screen.getByText('Selecione a trilha')).toBeInTheDocument();

    // Garante que NÃO existe campo ou toggle de Administrador
    expect(screen.queryByText(/É Admin/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/É Admin/i)).not.toBeInTheDocument();

    // Garante que NÃO existem campos de Turma, Cargo e Curso (restritos ao Administrador)
    expect(screen.queryByText('Turma')).not.toBeInTheDocument();
    expect(screen.queryByText('Selecione a turma')).not.toBeInTheDocument();
    expect(screen.queryByText('Cargo')).not.toBeInTheDocument();
    expect(screen.queryByText('Selecione o cargo')).not.toBeInTheDocument();
    expect(screen.queryByText('Curso')).not.toBeInTheDocument();
    expect(screen.queryByText('Selecione o curso')).not.toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText('Sua matrícula (somente números)'), {
      target: { value: '1234567' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    });

    expect(
      screen.getByText('O e-mail deve pertencer ao domínio @edge.ufal.br.')
    ).toBeInTheDocument();
  });

  it('valida tamanho e formato da matrícula', async () => {
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
    fireEvent.change(screen.getByPlaceholderText('Sua matrícula (somente números)'), {
      target: { value: '12345' }, // Menos de 7 dígitos
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    });

    expect(
      screen.getByText('A matrícula deve conter entre 7 e 20 dígitos numéricos.')
    ).toBeInTheDocument();
  });

  it('submete com sucesso a criação de conta do estudante com dados válidos', async () => {
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
    fireEvent.change(screen.getByPlaceholderText('Sua matrícula (somente números)'), {
      target: { value: '2024123456' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Conta criada com sucesso!/i)
      ).toBeInTheDocument();
      expect(mockOnUserCreated).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'novo.aluno@edge.ufal.br' })
      );
    });
  });
});
