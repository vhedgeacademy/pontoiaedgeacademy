import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PerfilAdministrador from '@/app/perfil-administrador/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key) => (key === 'id' ? '99' : null),
  }),
  usePathname: () => '/perfil-administrador',
}));

describe('PerfilAdministrador Page', () => {
  const mockAdminData = {
    id: 99,
    name: 'Administrador Chefe',
    email: 'chefe@edge.ufal.br',
    admin: true,
    is_active: true,
    profile_image: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: async () => ({ detail: 'Usuário desativado com sucesso' }) });
      }
      return Promise.resolve({ ok: true, json: async () => mockAdminData });
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => (k === 'ponto_ai_user' ? JSON.stringify({ admin: true }) : 'fake-token')),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renderiza os dados do administrador e oculta ações de remoção', async () => {
    render(<PerfilAdministrador />);

    await waitFor(() => {
      expect(screen.getByText('Administrador Chefe')).toBeInTheDocument();
    });

    expect(screen.getAllByText('chefe@edge.ufal.br')[0]).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remover/i })).not.toBeInTheDocument();

    // NÃO deve renderizar seções exclusivas de aluno como Calendário de Presença ou Banco de Horas
    expect(screen.queryByText(/calendário de presença/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/exportar banco de horas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/galeria do aluno/i)).not.toBeInTheDocument();
  });
});
