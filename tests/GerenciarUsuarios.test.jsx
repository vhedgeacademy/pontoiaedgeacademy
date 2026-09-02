import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import GerenciarUsuariosPage from '@/app/gerenciar-usuario/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/gerenciar-usuario',
}));

describe('GerenciarUsuariosPage — Listagem, Modal e Regras de Deleção', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'Admin Ativo com Login',
      email: 'admin.ativo@edge.ufal.br',
      admin: true,
      is_active: true,
      has_logged_in: true,
      first_login_at: '2026-01-10T10:00:00Z',
      profile_image: null,
    },
    {
      id: 2,
      name: 'Aluno Ativo Sem Login',
      email: 'aluno.semlogin@edge.ufal.br',
      admin: false,
      is_active: true,
      has_logged_in: false,
      first_login_at: null,
      profile_image: null,
      student_profile: { matricula: '1234567', turma_id: 1, trilha: 'Software', cargo_id: 1 },
    },
    {
      id: 3,
      name: 'Aluno Desativado Com Login',
      email: 'aluno.desativado@edge.ufal.br',
      admin: false,
      is_active: false,
      has_logged_in: true,
      first_login_at: '2026-02-01T15:00:00Z',
      profile_image: null,
      student_profile: { matricula: '7654321', turma_id: 1, trilha: 'IA', cargo_id: 1 },
    },
    {
      id: 4,
      name: 'Aluno Desativado Sem Login',
      email: 'aluno.desativadosemlogin@edge.ufal.br',
      admin: false,
      is_active: false,
      has_logged_in: false,
      first_login_at: null,
      profile_image: null,
      student_profile: { matricula: '9998887', turma_id: 1, trilha: 'Software', cargo_id: 1 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url, options = {}) => {
      const urlStr = String(url);
      if (urlStr.includes('/turmas')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Turma 2026.1' }] });
      }
      if (urlStr.includes('/cargos')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Bolsista' }] });
      }
      if (urlStr.includes('/cursos')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Engenharia' }] });
      }
      if (urlStr.includes('/users') && options.method === 'POST') {
        return Promise.resolve({ ok: true, json: async () => ({ id: 99, email: 'novo@edge.ufal.br' }) });
      }
      if (urlStr.includes('/users') && options.method === 'PUT') {
        return Promise.resolve({ ok: true, json: async () => ({ id: 2, is_active: false }) });
      }
      if (urlStr.includes('/users') && options.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: async () => ({ detail: 'Usuário excluído com sucesso' }) });
      }
      if (urlStr.includes('/users')) {
        return Promise.resolve({ ok: true, json: async () => mockUsers });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => (k === 'ponto_ai_user' ? JSON.stringify({ admin: true, name: 'Admin Edge' }) : 'fake-token')),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renderiza título "Gerenciar Usuários" e listagem de usuários ativos e desativados', async () => {
    await act(async () => {
      render(<GerenciarUsuariosPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Admin Ativo com Login')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /gerenciar usuários/i })).toBeInTheDocument();
    expect(screen.getByText('Aluno Ativo Sem Login')).toBeInTheDocument();
  });

  test('abre o modal de adicionar usuário ao clicar no botão "Adicionar Usuário"', async () => {
    await act(async () => {
      render(<GerenciarUsuariosPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Admin Ativo com Login')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /adicionar usuário|cadastrar usuário/i });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByPlaceholderText('Nome do usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@edge.ufal.br')).toBeInTheDocument();
  });

  test('não exibe botão de deletar para usuários ativos e permite exclusão apenas para desativados com first_login_at nulo', async () => {
    await act(async () => {
      render(<GerenciarUsuariosPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Aluno Ativo Sem Login')).toBeInTheDocument();
    });

    // A listagem abre na aba de ativos, onde não há botão de deletar
    expect(screen.queryByTestId('delete-user-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-user-2')).not.toBeInTheDocument();

    const inactiveTabBtn = screen.getByRole('button', { name: /usuários desativados/i });
    await act(async () => {
      fireEvent.click(inactiveTabBtn);
    });

    // Usuário desativado com first_login_at == null (id: 4) tem botão de deletar habilitado
    const deleteBtnUser4 = screen.getByTestId('delete-user-4');
    expect(deleteBtnUser4).toBeEnabled();

    // Usuário desativado com first_login_at != null (id: 3) tem botão de deletar desabilitado
    const deleteBtnUser3 = screen.getByTestId('delete-user-3');
    expect(deleteBtnUser3).toBeDisabled();
  });

  test('alterna entre abas de ativos e desativados e busca por nome', async () => {
    await act(async () => {
      render(<GerenciarUsuariosPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Admin Ativo com Login')).toBeInTheDocument();
    });

    const inactiveTabBtn = screen.getByRole('button', { name: /usuários desativados/i });
    await act(async () => {
      fireEvent.click(inactiveTabBtn);
    });

    expect(screen.getByText('Aluno Desativado Com Login')).toBeInTheDocument();
    expect(screen.queryByText('Aluno Ativo Sem Login')).not.toBeInTheDocument();
  });
});
