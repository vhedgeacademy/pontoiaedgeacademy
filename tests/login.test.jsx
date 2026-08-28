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

  it('deve redirecionar aluno para a Home (/) apos login com sucesso quando must_change_password for false', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'student-token',
        user: { id: 2, name: 'Aluno', email: 'aluno@edge.ufal.br', admin: false, has_logged_in: false, must_change_password: false }
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

  it('deve redirecionar para /redefinir-senha quando must_change_password for true', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'temp-token',
        user: { id: 3, name: 'Aluno Temp', email: 'temp@edge.ufal.br', admin: false, has_logged_in: false, must_change_password: true }
      })
    });

    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button', { name: /entrar|login|submit/i });

    fireEvent.change(emailInput, { target: { value: 'temp@edge.ufal.br' } });
    fireEvent.change(passwordInput, { target: { value: 'sejabemvindo' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/redefinir-senha?first_access=true');
    });
  });

  it('deve auto-autenticar e redirecionar para a home ao cadastrar novo usuario pelo modal', async () => {
    global.fetch.mockImplementation((url, options = {}) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/auth/register') && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            access_token: 'jwt-auto-login-token',
            token_type: 'bearer',
            user: { id: 10, email: 'novoaluno@edge.ufal.br', name: 'Novo Aluno', admin: false, must_change_password: false, has_logged_in: true }
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<LoginPage />);
    const createAccountButton = screen.getByRole('button', { name: /Criar conta/i });
    fireEvent.click(createAccountButton);

    expect(screen.getByText('Preencha seus dados para criar sua conta de estudante no Ponto AI')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
      target: { value: 'Novo Aluno' },
    });
    fireEvent.change(screen.getByPlaceholderText('usuario@edge.ufal.br'), {
      target: { value: 'novoaluno@edge.ufal.br' },
    });
    fireEvent.change(screen.getByPlaceholderText('Crie sua senha de acesso'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirme sua senha de acesso'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
