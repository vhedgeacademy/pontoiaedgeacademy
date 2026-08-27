import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CalendarioPresencaAluno from '@/components/ComponentesDasPaginas/Profile/CalendarioPresencaAluno';

describe('CalendarioPresencaAluno component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    const store = { ponto_ai_token: 'fake-token' };
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn((k) => store[k] || null) },
      writable: true,
    });
  });

  test('renderiza métricas de primeira entrada, última saída, total do dia e semana', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        date: '2026-08-14',
        primeira_entrada: '08:30',
        ultima_saida: '17:30',
        total_dia: '09:00',
        total_semana: '36:00',
        events: [
          { id: 1, camera_id: 'cam_01', timestamp: '2026-08-14T08:30:00', event_type: 'Entrada' },
          { id: 2, camera_id: 'cam_02', timestamp: '2026-08-14T17:30:00', event_type: 'Saída' }
        ]
      }),
    });

    render(<CalendarioPresencaAluno userId={10} />);

    await waitFor(() => {
      expect(screen.getAllByText('08:30')[0]).toBeInTheDocument();
      expect(screen.getAllByText('17:30')[0]).toBeInTheDocument();
      expect(screen.getByText('09:00')).toBeInTheDocument();
      expect(screen.getByText('36:00')).toBeInTheDocument();
    });
  });


  test('renderiza estado vazio quando não há registros', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        date: '2026-08-14',
        primeira_entrada: null,
        ultima_saida: null,
        total_dia: '00:00',
        total_semana: '00:00',
        events: []
      }),
    });

    render(<CalendarioPresencaAluno userId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum registro de ponto registrado nesta data/i)).toBeInTheDocument();
    });
  });
});
