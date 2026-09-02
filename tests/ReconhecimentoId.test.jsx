import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import ReconhecimentoIdPage from '@/app/reconhecimento-id/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/reconhecimento-id',
}));

describe('Página de Reconhecimento ID (/reconhecimento-id)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const studentUser = { id: 1, name: 'Aluno Edge', email: 'aluno@edge.ufal.br', admin: false };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => {
          if (k === 'ponto_ai_user') return JSON.stringify(studentUser);
          if (k === 'ponto_ai_token') return 'fake-token';
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    global.fetch = jest.fn((url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/recognition/cameras')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ cameras: ['Entrada Principal', 'Laboratório Edge'] }),
        });
      }
      if (urlStr.includes('/users/me/recognition-ids')) {
        if (options && options.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ recognition_ids: { 'Entrada Principal': '133', 'Laboratório Edge': '181' } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ 'Entrada Principal': '133' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  test('renderiza as câmeras disponíveis e carrega os IDs vinculados', async () => {
    await act(async () => {
      render(<ReconhecimentoIdPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Entrada Principal')).toBeInTheDocument();
      expect(screen.getByText('Laboratório Edge')).toBeInTheDocument();
    });

    const entradaInput = screen.getByLabelText(/Entrada Principal/i);
    expect(entradaInput).toHaveValue('133');
  });

  test('permite preencher IDs e salvar alterações', async () => {
    await act(async () => {
      render(<ReconhecimentoIdPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Entrada Principal')).toBeInTheDocument();
    });

    const labInput = screen.getByLabelText(/Laboratório Edge/i);
    fireEvent.change(labInput, { target: { value: '181' } });
    expect(labInput).toHaveValue('181');

    const saveBtn = screen.getByRole('button', { name: /Salvar/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me/recognition-ids'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"Laboratório Edge":"181"'),
        })
      );
    });
  });

  test('filtra caracteres não numéricos digitados nos campos de ID', async () => {
    await act(async () => {
      render(<ReconhecimentoIdPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Entrada Principal')).toBeInTheDocument();
    });

    const labInput = screen.getByLabelText(/Laboratório Edge/i);
    fireEvent.change(labInput, { target: { value: 'abc-123.xyz45' } });
    expect(labInput).toHaveValue('12345');
  });

  test('renderiza fotos dos terminais configurados e permite abrir modal de visualizacao ampliada', async () => {
    global.fetch = jest.fn((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/recognition/cameras')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            cameras: [
              'Saída Academy',
              'Entrada Academy',
              'Saída Pista de Atletismo',
              'Entrada Pista de Atletismo',
              'Porta Academy',
              'Camera Sem Foto',
            ],
          }),
        });
      }
      if (urlStr.includes('/users/me/recognition-ids')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            'Saída Academy': '101',
            'Porta Academy': '105',
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    await act(async () => {
      render(<ReconhecimentoIdPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Saída Academy')).toBeInTheDocument();
      expect(screen.getByText('Entrada Academy')).toBeInTheDocument();
      expect(screen.getByText('Saída Pista de Atletismo')).toBeInTheDocument();
      expect(screen.getByText('Entrada Pista de Atletismo')).toBeInTheDocument();
      expect(screen.getByText('Porta Academy')).toBeInTheDocument();
      expect(screen.getByText('Camera Sem Foto')).toBeInTheDocument();
    });

    // Verifica que as tags de imagem com alt ou src adequados existem
    const saidaAcademyImg = screen.getByAltText(/Terminal Saída Academy/i);
    expect(saidaAcademyImg).toBeInTheDocument();
    expect(saidaAcademyImg.src).toContain('saida-academy.jpg');

    const portaAcademyImg = screen.getByAltText(/Terminal Porta Academy/i);
    expect(portaAcademyImg).toBeInTheDocument();
    expect(portaAcademyImg.src).toContain('porta-academy.jpg');

    // Ao clicar na imagem do terminal, deve abrir modal de visualizacao ampliada
    await act(async () => {
      fireEvent.click(saidaAcademyImg);
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Visualização do Terminal/i)).toBeInTheDocument();
    });

    // Fechar modal
    const closeBtn = screen.getByLabelText(/Fechar visualização/i);
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
