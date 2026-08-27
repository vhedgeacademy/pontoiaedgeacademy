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

class MockEventSource {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onerror = null;
    this.close = jest.fn();
  }
}

describe('Home — logout forçado quando o token é rejeitado (401)', () => {
  let removeItem;

  beforeEach(() => {
    jest.clearAllMocks();
    global.EventSource = MockEventSource;

    removeItem = jest.fn();
    const store = {
      ponto_ai_token: 'token-velho-invalido',
      ponto_ai_user: JSON.stringify({ admin: true, name: 'Admin User' }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => store[key] || null),
        removeItem,
      },
      writable: true,
    });

    // Backend reiniciado / token expirado: toda chamada autenticada devolve 401
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Could not validate credentials' }),
    });
  });

  test('limpa a sessão e redireciona para /login', async () => {
    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(removeItem).toHaveBeenCalledWith('ponto_ai_token');
      expect(removeItem).toHaveBeenCalledWith('ponto_ai_user');
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });
});
