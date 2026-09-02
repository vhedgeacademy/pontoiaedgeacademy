import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CadastrarUsuarioModal from '@/Site/PopUpsEModals/CadastrarUsuarioModal';

const setupMocks = () => {
  const store = {
    ponto_ai_token: 'fake-token',
    ponto_ai_user: JSON.stringify({ admin: true, name: 'Admin User' }),
  };
  Object.defineProperty(window, 'localStorage', {
    value: { getItem: jest.fn((key) => store[key] || null) },
    writable: true,
  });

  global.fetch = jest.fn().mockImplementation((url, options = {}) => {
    const urlStr = String(url);
    if (urlStr.endsWith('/users/') && options.method === 'POST') {
      return Promise.resolve({ ok: true, json: async () => ({ id: 99, email: 'novo@edge.ufal.br' }) });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  });
};

describe('CadastrarUsuarioModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnUserCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration modal form correctly when open', async () => {
    setupMocks();
    await act(async () => {
      render(
        <CadastrarUsuarioModal
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      );
    });

    expect(screen.getByText('Cadastrar Usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@edge.ufal.br')).toBeInTheDocument();
    expect(screen.getByText('Registrar Usuário')).toBeInTheDocument();
  });

  it('registers a student user successfully from modal', async () => {
    setupMocks();
    await act(async () => {
      render(
        <CadastrarUsuarioModal
          isOpen={true}
          onClose={mockOnClose}
          onUserCreated={mockOnUserCreated}
        />
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Nome do usuário'), {
      target: { value: 'Aluno Novo' },
    });
    fireEvent.change(screen.getByPlaceholderText('usuario@edge.ufal.br'), {
      target: { value: 'novo@edge.ufal.br' },
    });
    fireEvent.change(screen.getByPlaceholderText('Matrícula'), {
      target: { value: '1234567' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Registrar Usuário'));
    });

    await waitFor(() => {
      expect(screen.getByText(/registrado com sucesso/i)).toBeInTheDocument();
    });
  });
});
