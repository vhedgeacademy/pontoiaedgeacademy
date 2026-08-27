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

  test('retorna fallback http://localhost:8000 quando API_KEY não está definida', () => {
    delete process.env.API_KEY;
    expect(getApiBase()).toBe('http://localhost:8000');
  });

  test('retorna URL customizada configurada em API_KEY', () => {
    process.env.API_KEY = 'https://api.pontoai.example.com';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');
  });

  test('sanitiza e remove barras finais (trailing slashes) da URL', () => {
    process.env.API_KEY = 'https://api.pontoai.example.com/';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');

    process.env.API_KEY = 'https://api.pontoai.example.com///';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');
  });
});
