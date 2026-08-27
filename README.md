# Módulo: Frontend

O módulo Frontend é a aplicação web que fornece a interface de usuário (UI) e o painel administrativo do sistema Ponto-AI. Desenvolvido sobre Next.js e React com arquitetura App Router, o painel disponibiliza dashboards operacionais para gestores, monitoramento de presença em tempo real, gestão de usuários, cadastro biométrico facial assistido, relatórios analíticos de banco de horas e áreas dedicadas para alunos acompanharem seu cumprimento de frequência.

## Linguagens e Tecnologias

- JavaScript e JSX
- React 18
- Next.js 14 (App Router e componentes cliente/servidor)
- Tailwind CSS (Estilização utilitária e design responsivo)
- Lucide React (Ícones vetoriais modernos)
- Jest e React Testing Library (Framework e suíte de testes unitários e de integração de componentes)
- ESLint e PostCSS (Padronização e processamento de estilos)
- npm (Gerenciador de pacotes e scripts do ecossistema Node.js)

## Arquitetura

O frontend é modular e segue a estrutura de pastas padronizada do Next.js:

- `src/app/`: Rotas e páginas da aplicação (App Router):
  - `login/`: Autenticação e acesso ao sistema.
  - `page.jsx` (Home): Dashboard principal com visão administrativa (fluxo de entradas/saídas ao vivo, métricas de frequência, monitoramento) ou visão do aluno (saldo de horas, espelho semanal e mensal).
  - `gerenciar-usuario/`: Gestão e listagem de usuários, filtros por perfil, modal de cadastro e edição.
  - `perfil-aluno/`: Visualização detalhada do histórico de frequência do aluno, calendário mensal de presenças e galeria biométrica.
  - `perfil-administrador/`: Dados da conta administrativa e alteração de senha.
  - `biometria/`: Fluxo de captura de fotos faciais via webcam do dispositivo para cadastro biométrico.
  - `bater-ponto/`: Tela de registro manual de ponto com validação biométrica e prova de vida.
  - `validacao-ponto/`: Fila administrativa para aprovação de solicitações manuais de ponto em tempo real.
  - `ranking/`: Tabela e pódio de cumprimento de horas da turma e do período.
  - `configuracoes/`: Parametrizações do sistema (limites de horas, turmas e cursos).
  - `esqueci-senha/` e `redefinir-senha/`: Fluxo de recuperação de credenciais.
- `src/components/`: Componentes visuais reutilizáveis:
  - `Sidebar.jsx`: Menu lateral de navegação com controle de permissões por perfil (Admin vs Aluno) e design responsivo.
  - `UserAvatar.jsx`: Componente de avatar com suporte a imagem biométrica e fallback para iniciais do usuário.
  - `ComponentesDasPaginas/`: Componentes específicos organizados por domínio (Home, Profile, Ranking, Configurations, PopUpsEModals).
- `src/Site/PopUpsEModals/`: Modais globais de interação:
  - `CadastrarUsuarioModal.jsx`: Modal de criação de usuários com validação de campos.
  - `CadastroFaceModal.jsx`: Modal de cadastro de fotos faciais pelo perfil.
  - `ExportarBancoHorasModal.jsx`: Modal de exportação de relatório analítico de folha de ponto em formato Excel (XLSX).
- `src/config/`: Mapeamento de endpoints e URLs base de integração com a API (`api.js`).
- `src/hooks/`: Custom hooks utilitários, como `useAdminGuard.js` para proteção de rotas restritas.
- `tests/`: Suíte completa de testes automatizados com cobertura de renderização, navegação, modais e interação com a API.
- `public/`: Ativos estáticos, logotipos institucionais e favicon.

## Execução

O módulo web deve ser executado no ambiente Linux (WSL) utilizando o gerenciador `npm`.

### 1. Configuração do Ambiente (.env)

Crie o arquivo `.env` no diretório `frontend/` a partir do modelo `.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

Configurações obrigatórias:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 2. Instalação de Dependências

Para instalar os pacotes do projeto:

```bash
cd frontend/
npm install
```

---

### 3. Execução em Modo de Desenvolvimento

Para iniciar o servidor de desenvolvimento com hot-reload ativo:

```bash
cd frontend/
npm run dev
```

Acesse a interface no navegador em: `http://localhost:3000`

---

### 4. Execução de Testes Automatizados (TDD)

Execute a suíte de testes com o Jest:

```bash
cd frontend/
npm test
```

Para rodar os testes sem modo interativo (watch desativado):
```bash
npm test -- --watchAll=false
```

---

### 5. Geração de Build de Produção

Para compilar e otimizar os artefatos estáticos e de servidor para deploy:

```bash
cd frontend/
npm run build
npm run start
```
