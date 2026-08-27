import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GaleriaAluno from '@/components/ComponentesDasPaginas/Profile/GaleriaAluno';

describe('GaleriaAluno — cadastro de face', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    const store = { ponto_ai_token: 'fake-token' };
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn((k) => store[k] || null) },
      writable: true,
    });
  });

  test('galeria vazia mostra o botão Cadastrar Face', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, images: [] }),
    });

    render(<GaleriaAluno userId={42} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cadastrar face/i })).toBeInTheDocument();
    });
  });

  test('com imagens renderiza as fotos e o botão Substituir Fotos', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 2,
        images: ['/users/42/faces/0.jpg', '/users/42/faces/1.jpg'],
      }),
    });

    render(<GaleriaAluno userId={42} />);

    await waitFor(() => {
      const imgs = screen.getAllByRole('img');
      expect(imgs.length).toBe(2);
      expect(screen.getByRole('button', { name: /substituir fotos/i })).toBeInTheDocument();
    });
  });
});
