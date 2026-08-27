/**
 * Configuração centralizada de acesso ao backend.
 *
 * O valor é lido em tempo de chamada (e não em uma constante de módulo) para
 * que cada ambiente — desenvolvimento, homologação, produção — defina o seu
 * `NEXT_PUBLIC_API_URL` sem que o bundle carregue uma URL fixa. O fallback
 * mantém o comportamento local padrão (docker compose expõe o backend em 8000).
 */
export const getApiBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return url.replace(/\/+$/, '');
};

export default getApiBase;
