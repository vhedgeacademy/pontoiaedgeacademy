import { getApiBase } from '../src/config/api';

describe('API Configuration (getApiBase)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('retorna fallback http://localhost:8000 quando NEXT_PUBLIC_API_URL não está definida', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBase()).toBe('http://localhost:8000');
  });

  test('retorna URL customizada configurada em NEXT_PUBLIC_API_URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.pontoai.example.com';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');
  });

  test('sanitiza e remove barras finais (trailing slashes) da URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.pontoai.example.com/';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');

    process.env.NEXT_PUBLIC_API_URL = 'https://api.pontoai.example.com///';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');
  });
});
