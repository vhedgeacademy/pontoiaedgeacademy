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

  test('abre modal de detalhes do ponto com foto e informações ao clicar em um registro', async () => {
    const mockAlunoInfo = {
      nome: 'João Silva',
      rawUser: { id: 10, profile_image: '/images/profile.jpg' }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        date: '2026-08-14',
        primeira_entrada: '08:30',
        ultima_saida: '17:30',
        total_dia: '09:00',
        total_semana: '36:00',
        events: [
          {
            id: 101,
            camera_id: 'Porta Academy',
            timestamp: '2026-08-14T08:30:00',
            event_type: 'Entrada',
            foto_base64: 'base64samplephoto'
          }
        ]
      }),
    });

    render(<CalendarioPresencaAluno userId={10} alunoInfo={mockAlunoInfo} />);

    await waitFor(() => {
      expect(screen.getByText('Porta Academy')).toBeInTheDocument();
    });

    // Clica no registro de ponto
    const registroRow = screen.getByTitle(/Clique para visualizar os detalhes e a foto do registro/i);
    fireEvent.click(registroRow);

    // Modal de detalhes deve ser exibido com os dados completos
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Detalhes do Registro')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByAltText(/Foto do Reconhecimento Facial/i)).toBeInTheDocument();
    });

    // Fecha o modal
    const closeBtn = screen.getByLabelText(/Fechar/i);
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('renderiza as imagens das entradas e saídas diretamente na lista de registros', async () => {
    const mockAlunoInfo = {
      nome: 'Victor Hugo',
      rawUser: { id: 2, profile_image: '/images/profile.jpg' }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        date: '2026-09-01',
        primeira_entrada: '08:00',
        ultima_saida: '12:00',
        total_dia: '04:00',
        total_semana: '20:00',
        events: [
          {
            id: 201,
            camera_id: 'Entrada Academy',
            timestamp: '2026-09-01T08:00:00',
            event_type: 'Entrada',
            foto_base64: 'BASE64_ENTRADA_DATA'
          },
          {
            id: 202,
            camera_id: 'Saída Academy',
            timestamp: '2026-09-01T12:00:00',
            event_type: 'Saída',
            imagem: 'BASE64_SAIDA_DATA'
          }
        ]
      }),
    });

    render(<CalendarioPresencaAluno userId={2} alunoInfo={mockAlunoInfo} />);

    await waitFor(() => {
      // Verifica badges e textos
      expect(screen.getByText('Entrada Academy')).toBeInTheDocument();
      expect(screen.getByText('Saída Academy')).toBeInTheDocument();
      expect(screen.getAllByText('Foto Facial').length).toBe(2);

      // Verifica que as miniaturas das fotos do ponto estão no documento com src Base64
      const imgEntrada = screen.getByAltText(/Foto do Ponto Entrada/i);
      const imgSaida = screen.getByAltText(/Foto do Ponto Saída/i);

      expect(imgEntrada).toBeInTheDocument();
      expect(imgEntrada.src).toContain('data:image/jpeg;base64,BASE64_ENTRADA_DATA');

      expect(imgSaida).toBeInTheDocument();
      expect(imgSaida.src).toContain('data:image/jpeg;base64,BASE64_SAIDA_DATA');
    });
  });
});
