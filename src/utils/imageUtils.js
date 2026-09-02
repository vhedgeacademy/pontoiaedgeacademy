import { getApiBase } from '@/config/api';

/**
 * Normaliza e formata qualquer string de imagem proveniente da tabela `pontos`
 * ou do cadastro de usuários (Base64 puro, data URI, URLs absolutas ou relativas).
 *
 * @param {string|null|undefined} rawImage
 * @param {string} [token='']
 * @returns {string|null}
 */
export const resolvePontoImage = (rawImage, token = '') => {
  if (!rawImage || typeof rawImage !== 'string') return null;
  const trimmed = rawImage.trim();
  if (!trimmed) return null;

  // Data URI completo (ex: data:image/jpeg;base64,...)
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // URL absoluta (http:// ou https://)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Identificação de cabeçalhos Base64 conhecidos (JPEG começa com /9j/)
  if (trimmed.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  if (trimmed.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${trimmed}`;
  }
  if (trimmed.startsWith('UklGR')) {
    return `data:image/webp;base64,${trimmed}`;
  }

  // Caminho relativo estático ou da API (ex: /uploads/... ou /terminals/...)
  if (trimmed.startsWith('/')) {
    if (token) {
      const base = getApiBase();
      return `${base}${trimmed}?token=${token}`;
    }
    return trimmed;
  }

  // Fallback padrão para strings Base64
  return `data:image/jpeg;base64,${trimmed}`;
};

export default resolvePontoImage;
