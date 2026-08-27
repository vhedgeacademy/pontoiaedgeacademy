/**
 * Configuração centralizada de acesso ao backend.
 *
 * O valor é lido em tempo de chamada (e não em uma constante de módulo) para
 * que cada ambiente — desenvolvimento, homologação, produção — defina o seu
 * `API_KEY` sem que o bundle carregue uma URL fixa. O fallback
 * mantém o comportamento local padrão (docker compose expõe o backend em 8000).
 */
export const getApiBase = () => {
  const url = process.env.API_KEY || 'http://localhost:8000';
  return url.replace(/\/+$/, '');
};

export default getApiBase;
