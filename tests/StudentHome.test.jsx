import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HorasSection from '@/components/ComponentesDasPaginas/Home/HorasSection';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Student Home View (HorasSection)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const store = {
      ponto_ai_token: 'fake-student-token',
      ponto_ai_user: JSON.stringify({ admin: false, name: 'Lucas Aluno' }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => store[key] || null),
        removeItem: jest.fn((key) => delete store[key]),
      },
      writable: true,
    });

    global.fetch = jest.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/ponto/student/me/dashboard')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            horas_hoje: '04:15',
            horas_semana: '16:00',
            meta_semanal: '20:00',
            saldo_meta_semanal: '04:00',
            primeira_entrada_hoje: '08:00',
            primeira_entrada_tipo: 'automática com ia',
            primeira_entrada_status: 'aprovado',
            ultima_saida_hoje: '12:15',
            ultima_saida_tipo: 'manual',
            ultima_saida_status: 'pendente',
            status_jornada: 'Cumprindo Horas',
          }),
        });
      }
      if (urlStr.includes('/ponto/student/me/history')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: '2026-08-14',
            horas_dia: '04:15',
            horas_semana: '16:00',
            registros: [
              { id: 1, event_type: 'Entrada', horario: '08:00', camera_id: 'Cam_Entrada' },
              { id: 2, event_type: 'Saída', horario: '12:15', camera_id: 'Cam_Saida' },
            ],
            empty: false,
          }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    });
  });

  test('renderiza métricas de horas, tipo e status de entrada e saída', async () => {
    render(<HorasSection userData={{ name: 'Lucas Aluno' }} />);

    await waitFor(() => {
      expect(screen.getByText('Olá, Lucas Aluno!')).toBeInTheDocument();
      expect(screen.getByText('Cumprindo Horas')).toBeInTheDocument();
      expect(screen.getAllByText('08:00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('12:15').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Automática com IA')).toBeInTheDocument();
      expect(screen.getByText('Manual')).toBeInTheDocument();
      expect(screen.getByText('Aprovado')).toBeInTheDocument();
      expect(screen.getByText('Pendente')).toBeInTheDocument();
    });
  });

  test('renderiza histórico de registros e busca nova data pelo input de data', async () => {
    render(<HorasSection userData={{ name: 'Lucas Aluno' }} />);

    await waitFor(() => {
      expect(screen.getByText('Consulta Histórica de Ponto')).toBeInTheDocument();
      expect(screen.getByText('Cam_Entrada')).toBeInTheDocument();
      expect(screen.getByText('Cam_Saida')).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText('Selecionar Data');
    fireEvent.change(dateInput, { target: { value: '2026-08-10' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ponto/student/me/history?date=2026-08-10'),
        expect.any(Object)
      );
    });
  });

  test('renderiza empty state quando não há registros na data', async () => {
    global.fetch.mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/ponto/student/me/dashboard')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            horas_hoje: '00:00',
            horas_semana: '00:00',
            meta_semanal: '20:00',
            saldo_meta_semanal: '20:00',
            primeira_entrada_hoje: null,
            primeira_entrada_tipo: null,
            primeira_entrada_status: null,
            ultima_saida_hoje: null,
            ultima_saida_tipo: null,
            ultima_saida_status: null,
            status_jornada: 'Fora do Turno',
          }),
        });
      }
      if (urlStr.includes('/ponto/student/me/history')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: '2026-08-01',
            horas_dia: '00:00',
            horas_semana: '00:00',
            registros: [],
            empty: true,
          }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    });

    render(<HorasSection userData={{ name: 'Lucas Aluno' }} />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum registro encontrado nesta data')).toBeInTheDocument();
    });
  });

  test('redireciona para /login e limpa localStorage no 401', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token inválido' }),
      })
    );

    render(<HorasSection userData={{ name: 'Lucas Aluno' }} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('ponto_ai_token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('ponto_ai_user');
    });
  });
});
