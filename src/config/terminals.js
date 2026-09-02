/**
 * Normaliza o nome da camera configurada no .env (NAMES_IPS) e retorna a foto correspondente.
 */
export function getTerminalImage(cameraName) {
  if (!cameraName) return null;

  const normalized = cameraName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const knownTerminals = {
    'saida-academy': '/assets/terminals/saida-academy.jpg',
    'entrada-academy': '/assets/terminals/entrada-academy.jpg',
    'saida-pista-de-atletismo': '/assets/terminals/saida-pista-de-atletismo.jpg',
    'entrada-pista-de-atletismo': '/assets/terminals/entrada-pista-de-atletismo.jpg',
    'porta-academy': '/assets/terminals/porta-academy.jpg',
  };

  return knownTerminals[normalized] || null;
}

export default getTerminalImage;