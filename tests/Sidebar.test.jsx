import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

describe('Sidebar Component Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => [] }));
  });

  test('renderiza opções de administrador e oculta Reconhecimento ID quando o usuário é admin', async () => {
    const adminUser = { id: 1, name: 'Admin Edge', email: 'admin@edge.ufal.br', admin: true };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => {
          if (k === 'ponto_ai_user') return JSON.stringify(adminUser);
          if (k === 'ponto_ai_token') return 'fake-token';
          return null;
        }),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    await act(async () => {
      render(<Sidebar />);
    });

    expect(screen.getAllByText('Ponto AI').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Ponto AI Edge Academy')).not.toBeInTheDocument();
    expect(screen.getAllByAltText('Logo Edge').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Buscar Usuário')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Usuários')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Sair da Conta')).toBeInTheDocument();

    // Guarda de regressão do layout: espaçamento compacto e sem scroll horizontal
    const navContainer = screen.getByText('Início').closest('div.flex-1');
    expect(navContainer).toHaveClass('space-y-2');
    expect(navContainer).toHaveClass('overflow-x-hidden');

    // Reconhecimento ID é exclusivo de aluno; os demais são páginas removidas que não podem reaparecer
    expect(screen.queryByText('Folha de Ponto')).not.toBeInTheDocument();
    expect(screen.queryByText('Bater Ponto')).not.toBeInTheDocument();
    expect(screen.queryByText('Cadastro Facial')).not.toBeInTheDocument();
    expect(screen.queryByText('Validação de Ponto')).not.toBeInTheDocument();
    expect(screen.queryByText('Reconhecimento ID')).not.toBeInTheDocument();
  });

  test('renderiza opções de aluno (Reconhecimento ID, Ranking) e oculta links administrativos quando o usuário é aluno', async () => {
    const studentUser = { id: 2, name: 'Aluno Edge', email: 'aluno@edge.ufal.br', admin: false };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => (k === 'ponto_ai_user' ? JSON.stringify(studentUser) : null)),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    await act(async () => {
      render(<Sidebar />);
    });

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Reconhecimento ID')).toBeInTheDocument();
    expect(screen.getByText('Sair da Conta')).toBeInTheDocument();

    // Links administrativos ficam ocultos para aluno; os demais são páginas removidas que não podem reaparecer
    expect(screen.queryByText('Folha de Ponto')).not.toBeInTheDocument();
    expect(screen.queryByText('Bater Ponto')).not.toBeInTheDocument();
    expect(screen.queryByText('Cadastro Facial')).not.toBeInTheDocument();
    expect(screen.queryByText('Buscar Usuário')).not.toBeInTheDocument();
    expect(screen.queryByText('Validação de Ponto')).not.toBeInTheDocument();
    expect(screen.queryByText('Gerenciar Usuários')).not.toBeInTheDocument();
    expect(screen.queryByText('Configurações')).not.toBeInTheDocument();
  });
});
