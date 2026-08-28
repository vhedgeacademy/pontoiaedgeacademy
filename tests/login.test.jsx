import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Página de Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/turmas') || urlStr.endsWith('/cargos') || urlStr.endsWith('/cursos')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  it('deve renderizar o título, campos de email e senha, link de esqueci a senha e criar conta', () => {
    render(<LoginPage />);

    // Verifica Título
    const titleElement = screen.getByText(/Ponto AI/i);
    expect(titleElement).toBeInTheDocument();

    // Verifica Input de Email pelo placeholder
    const emailInput = screen.getByPlaceholderText(/email/i);
    expect(emailInput).toBeInTheDocument();

    // Verifica Input de Senha
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();

    // Verifica Link "Esqueci a senha"
    const forgotPasswordLink = screen.getByText(/Esqueci a senha/i);
    expect(forgotPasswordLink).toBeInTheDocument();

    // Verifica Seção "Ainda não tem uma conta? Criar conta"
    expect(screen.getByText(/Ainda não tem uma conta\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar conta/i })).toBeInTheDocument();
  });

  it('deve abrir o modal de Criar Conta ao clicar no botão correspondente', () => {
    render(<LoginPage />);

    const createAccountButton = screen.getByRole('button', { name: /Criar conta/i });
    fireEvent.click(createAccountButton);

    expect(screen.getByText('Preencha seus dados para criar sua conta de estudante no Ponto AI')).toBeInTheDocument();
  });

  it('deve redirecionar administrador para a Home (/) apos login com sucesso', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'admin-token',
        user: { id: 1, name: 'Admin', email: 'admin@edge.ufal.br', admin: true, has_logged_in: true, must_change_password: false }
      })
    });

    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button', { name: /entrar|login|submit/i });

    fireEvent.change(emailInput, { target: { value: 'admin@edge.ufal.br' } });
    fireEvent.change(passwordInput, { target: { value: 'admin!@#' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('deve redirecionar aluno para a Home (/) apos login com sucesso', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'student-token',
        user: { id: 2, name: 'Aluno', email: 'aluno@edge.ufal.br', admin: false, has_logged_in: true, must_change_password: false }
      })
    });

    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button', { name: /entrar|login|submit/i });

    fireEvent.change(emailInput, { target: { value: 'aluno@edge.ufal.br' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
