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

  test('retorna fallback http://localhost:8000 quando nenhuma variável está definida', () => {
    delete process.env.API_KEY;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_KEY;
    expect(getApiBase()).toBe('http://localhost:8000');
  });

  test('retorna URL customizada configurada em NEXT_PUBLIC_API_URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://ponto-ai-edge.duckdns.org';
    expect(getApiBase()).toBe('https://ponto-ai-edge.duckdns.org');
  });

  test('retorna URL customizada configurada em API_KEY como fallback de compatibilidade', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.API_KEY = 'https://api.pontoai.example.com';
    expect(getApiBase()).toBe('https://api.pontoai.example.com');
  });

  test('sanitiza e remove barras finais (trailing slashes) da URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://ponto-ai-edge.duckdns.org/';
    expect(getApiBase()).toBe('https://ponto-ai-edge.duckdns.org');

    process.env.NEXT_PUBLIC_API_URL = 'https://ponto-ai-edge.duckdns.org///';
    expect(getApiBase()).toBe('https://ponto-ai-edge.duckdns.org');
  });
});
