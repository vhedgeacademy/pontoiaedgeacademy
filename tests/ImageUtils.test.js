import { resolvePontoImage } from '@/utils/imageUtils';

describe('imageUtils - resolvePontoImage', () => {
  test('retorna null para valores nulos, vazios ou indefinidos', () => {
    expect(resolvePontoImage(null)).toBeNull();
    expect(resolvePontoImage(undefined)).toBeNull();
    expect(resolvePontoImage('')).toBeNull();
    expect(resolvePontoImage('   ')).toBeNull();
  });

  test('retorna data URI intacto', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA';
    expect(resolvePontoImage(dataUri)).toBe(dataUri);
  });

  test('retorna URLs absolutas intactas', () => {
    const httpUrl = 'http://example.com/ponto.jpg';
    const httpsUrl = 'https://example.com/ponto.png';
    expect(resolvePontoImage(httpUrl)).toBe(httpUrl);
    expect(resolvePontoImage(httpsUrl)).toBe(httpsUrl);
  });

  test('converte Base64 puro em data URI com mime-type adequado', () => {
    expect(resolvePontoImage('/9j/4AAQSkZJRgABAQ...')).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...');
    expect(resolvePontoImage('iVBORw0KGgo...')).toBe('data:image/png;base64,iVBORw0KGgo...');
    expect(resolvePontoImage('UklGR...')).toBe('data:image/webp;base64,UklGR...');
    expect(resolvePontoImage('GENERIC_BASE64_STRING')).toBe('data:image/jpeg;base64,GENERIC_BASE64_STRING');
  });

  test('resolve caminhos relativos com token quando fornecido', () => {
    const relPath = '/users/2/faces/1';
    const token = 'token123';
    expect(resolvePontoImage(relPath, token)).toContain('/users/2/faces/1?token=token123');
  });

  test('mantém caminho relativo sem token para assets locais', () => {
    expect(resolvePontoImage('/assets/logo.png')).toBe('/assets/logo.png');
  });
});
