import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SearchPage from '@/app/search/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/search',
}));

describe('SearchPage — Busca de Usuários com Filtros e Seções', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'Carlos Admin Ativo',
      email: 'carlos@edge.ufal.br',
      admin: true,
      is_active: true,
      profile_image: null,
    },
    {
      id: 2,
      name: 'Bruna Admin Inativa',
      email: 'bruna@edge.ufal.br',
      admin: true,
      is_active: false,
      profile_image: null,
    },
    {
      id: 3,
      name: 'Alice Aluna Ativa',
      email: 'alice@edge.ufal.br',
      admin: false,
      is_active: true,
      profile_image: null,
      student_profile: { turma_id: 1, trilha: 'Software', cargo_id: 1 },
    },
    {
      id: 4,
      name: 'Diego Aluno Inativo',
      email: 'diego@edge.ufal.br',
      admin: false,
      is_active: false,
      profile_image: null,
      student_profile: { turma_id: 1, trilha: 'Software', cargo_id: 1 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.includes('/turmas')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Turma 2026.1' }] });
      }
      if (url.includes('/cargos')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 1, name: 'Bolsista' }] });
      }
      if (url.includes('/users')) {
        return Promise.resolve({ ok: true, json: async () => mockUsers });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => (k === 'ponto_ai_user' ? JSON.stringify({ admin: true }) : 'fake-token')),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renderiza título "Buscar Usuário" e seções distintas para Administradores e Alunos', async () => {
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Admin Ativo')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /buscar usuário/i })).toBeInTheDocument();
    expect(screen.getByText(/administradores/i)).toBeInTheDocument();
    expect(screen.getByText(/alunos/i)).toBeInTheDocument();

    expect(screen.getByText('Carlos Admin Ativo')).toBeInTheDocument();
    expect(screen.getByText('Bruna Admin Inativa')).toBeInTheDocument();
    expect(screen.getByText('Alice Aluna Ativa')).toBeInTheDocument();
    expect(screen.getByText('Diego Aluno Inativo')).toBeInTheDocument();
  });

  test('filtra por Usuários Ativos e Usuários Desativados', async () => {
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Admin Ativo')).toBeInTheDocument();
    });

    // Clicar em filtros para abrir o painel se necessário ou usar chips de status
    const btnFiltros = screen.getByRole('button', { name: /filtros/i });
    fireEvent.click(btnFiltros);

    // Clicar no filtro "Usuários Ativos"
    const chipAtivos = screen.getByRole('button', { name: /usuários ativos|ativos/i });
    fireEvent.click(chipAtivos);

    expect(screen.getByText('Carlos Admin Ativo')).toBeInTheDocument();
    expect(screen.getByText('Alice Aluna Ativa')).toBeInTheDocument();
    expect(screen.queryByText('Bruna Admin Inativa')).not.toBeInTheDocument();
    expect(screen.queryByText('Diego Aluno Inativo')).not.toBeInTheDocument();

    // Clicar no filtro "Usuários Desativados"
    const chipDesativados = screen.getByRole('button', { name: /usuários desativados|desativados/i });
    fireEvent.click(chipDesativados);

    expect(screen.queryByText('Carlos Admin Ativo')).not.toBeInTheDocument();
    expect(screen.queryByText('Alice Aluna Ativa')).not.toBeInTheDocument();
    expect(screen.getByText('Bruna Admin Inativa')).toBeInTheDocument();
    expect(screen.getByText('Diego Aluno Inativo')).toBeInTheDocument();
  });

  test('redireciona para perfil-aluno e perfil-administrador adequadamente ao clicar nos cards', async () => {
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Admin Ativo')).toBeInTheDocument();
    });

    // Clicar no card de admin
    fireEvent.click(screen.getByText('Carlos Admin Ativo'));
    expect(mockPush).toHaveBeenCalledWith('/perfil-administrador?id=1');

    // Clicar no card de aluno
    fireEvent.click(screen.getByText('Alice Aluna Ativa'));
    expect(mockPush).toHaveBeenCalledWith('/perfil-aluno?id=3');
  });
});
