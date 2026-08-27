import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import Home from '@/app/page';

const mockRouter = { push: jest.fn() };
jest.mock('next/navigation', () => ({
  useRouter() {
    return mockRouter;
  },
  usePathname() {
    return '/';
  },
}));

jest.mock('@/components/Sidebar', () => function Sidebar() {
  return <div data-testid="sidebar" />;
});

class MockEventSource {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onerror = null;
    this.close = jest.fn();
    MockEventSource.instances.push(this);
  }
}

const entradasCalls = () =>
  global.fetch.mock.calls.filter(([url]) =>
    String(url).includes('/ponto/ultimas-entradas'),
  ).length;

describe('Home — atualização de Últimas Entradas após reconhecimento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.instances = [];
    global.EventSource = MockEventSource;

    const store = {
      ponto_ai_token: 'fake-token',
      ponto_ai_user: JSON.stringify({ admin: true, name: 'Admin User' }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn((key) => store[key] || null) },
      writable: true,
    });

    global.fetch = jest.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/ponto/ultimas-entradas')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, nome: 'João', horario: '14:00', photo_url: '/users/6/faces/0.jpg' },
          ],
        });
      }
      if (urlStr.includes('/ponto/feed/latest')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ saidas: [] }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  test('refaz o fetch de últimas entradas quando chega um evento de recognition', async () => {
    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(entradasCalls()).toBe(1);
      expect(MockEventSource.instances.length).toBeGreaterThan(0);
    });

    const es = MockEventSource.instances[MockEventSource.instances.length - 1];
    await act(async () => {
      es.onmessage({
        data: JSON.stringify({ type: 'recognition', nome: 'Ryan Barbalho', score: 0.9 }),
      });
    });

    await waitFor(() => {
      expect(entradasCalls()).toBe(2);
    });
  });

  test('resolve photo_url relativo para URL absoluta do backend com token', async () => {
    const { findByAltText } = await act(async () => render(<Home />));

    const img = await findByAltText('João');
    // photo_url relativo iria pro Next (3000) e daria 404; deve apontar pro
    // backend com o token de query (rota de imagem autentica por ?token=).
    expect(img.src).toMatch(/http:\/\/localhost:8000\/users\/6\/faces\/0\.jpg\?token=/);
  });
});
