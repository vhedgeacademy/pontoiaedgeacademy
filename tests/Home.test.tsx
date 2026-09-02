import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';

// usePathname fixo: um pathname mutável dispara loop infinito no guard de autenticação
const mockRouter = { push: jest.fn() };
jest.mock('next/navigation', () => ({
  useRouter() {
    return mockRouter;
  },
  usePathname() {
    return '/';
  }
}));

describe('Página Inicial do PontoAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('Deve buscar e renderizar a home do Admin com feeds de Ultimas Entradas e Saidas, sem renderizar HorasSection de aluno', async () => {
    const store = {
      'ponto_ai_token': 'fake-admin-token',
      'ponto_ai_user': JSON.stringify({ id: 1, admin: true, name: 'Admin User' })
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => store[key] || null),
        removeItem: jest.fn(),
      },
      writable: true
    });

    global.fetch.mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : (url?.url || String(url));
      if (urlStr.includes('/ponto/presence/today')) {
        return Promise.resolve({ ok: true, json: async () => ({ count: 5 }) });
      }
      if (urlStr.includes('/ponto/ultimas-entradas')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, nome: 'João', horario: '14:00' }]
        });
      }
      if (urlStr.includes('/ponto/feed/latest')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ saidas: [{ id: 2, nome: 'Maria', horario: '17:00' }] })
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Últimas Entradas')).toBeInTheDocument();
      expect(screen.getByText('Últimas Saídas')).toBeInTheDocument();
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Acompanhe seu registro de ponto/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Primeira Entrada Hoje/i)).not.toBeInTheDocument();
  });

  test('Deve renderizar a home do Aluno com HorasSection e sem feeds do Admin', async () => {
    const store = {
      'ponto_ai_token': 'fake-student-token',
      'ponto_ai_user': JSON.stringify({ id: 2, admin: false, name: 'Aluno User' })
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => store[key] || null),
        removeItem: jest.fn(),
      },
      writable: true
    });

    global.fetch.mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : (url?.url || String(url));
      if (urlStr.includes('/ponto/student/me/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            horas_hoje: '04:00',
            horas_semana: '16:00',
            meta_semanal: '20:00',
            saldo_meta_semanal: '04:00',
            primeira_entrada_hoje: '08:00',
            primeira_entrada_tipo: 'automática com ia',
            primeira_entrada_status: 'aprovado',
            status_jornada: 'Em Andamento'
          })
        });
      }
      if (urlStr.includes('/ponto/student/me/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: '2026-08-26',
            horas_dia: '04:00',
            horas_semana: '16:00',
            registros: [],
            empty: true
          })
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Olá, Aluno User!')).toBeInTheDocument();
      expect(screen.getByText('Primeira Entrada Hoje')).toBeInTheDocument();
    });

    expect(screen.queryByText('Últimas Entradas')).not.toBeInTheDocument();
    expect(screen.queryByText('Últimas Saídas')).not.toBeInTheDocument();
  });
});