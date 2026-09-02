import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RankingPage from '@/app/ranking/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/ranking',
}));

jest.mock('@/components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

describe('Ranking Page Component', () => {
  const mockRankingData = {
    period: 'diario',
    period_label: 'Hoje (25/08/2026)',
    ranking: [
      {
        position: 1,
        id: 1,
        name: 'Carlos Silva',
        email: 'carlos@edge.ufal.br',
        profile_image: null,
        total_hours: '08:00',
        total_seconds: 28800,
      },
      {
        position: 2,
        id: 2,
        name: 'Ana Souza',
        email: 'ana@edge.ufal.br',
        profile_image: null,
        total_hours: '06:30',
        total_seconds: 23400,
      },
      {
        position: 3,
        id: 3,
        name: 'Bruno Lima',
        email: 'bruno@edge.ufal.br',
        profile_image: null,
        total_hours: '04:15',
        total_seconds: 15300,
      },
      {
        position: 4,
        id: 4,
        name: 'Daniela Castro',
        email: 'daniela@edge.ufal.br',
        profile_image: null,
        total_hours: '02:00',
        total_seconds: 7200,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => {
          if (k === 'ponto_ai_token') return 'mock-token';
          if (k === 'ponto_ai_user') return JSON.stringify({ id: 1, name: 'Carlos', admin: false });
          return null;
        }),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRankingData),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renderiza os botões de período (Diário, Semanal, Mensal) e título da página', async () => {
    render(<RankingPage />);

    expect(screen.getByText(/Ranking/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Diário/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Semanal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mensal/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('Carlos Silva').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Ana Souza').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Bruno Lima').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('permite alternar entre períodos e dispara nova requisição', async () => {
    render(<RankingPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=diario'),
        expect.any(Object)
      );
    });

    const semanalBtn = screen.getByRole('button', { name: /Semanal/i });
    fireEvent.click(semanalBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=semanal'),
        expect.any(Object)
      );
    });

    const mensalBtn = screen.getByRole('button', { name: /Mensal/i });
    fireEvent.click(mensalBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=mensal'),
        expect.any(Object)
      );
    });
  });

  test('exibe mensagem amigável quando não há registros no período', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ period: 'diario', ranking: [] }),
      })
    );

    render(<RankingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Sem registros de ponto para este período/i)).toBeInTheDocument();
    });
  });
});
