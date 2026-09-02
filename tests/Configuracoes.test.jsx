import React from 'react';
import { render, screen } from '@testing-library/react';
import Configuracoes from '@/app/configuracoes/page';
import * as ConfigModals from '@/Site/PopUpsEModals/Configmodals';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/configuracoes',
}));

jest.mock('@/components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('@/components/ComponentesDasPaginas/Configurations/ConfigSection', () => {
  return function MockConfigSection({ title }) {
    return <div data-testid={`config-section-${title.toLowerCase()}`}>{title}</div>;
  };
});

jest.mock('@/hooks/useAdminGuard', () => ({
  useAdminGuard: jest.fn(),
}));

describe('Configuracoes Page - Remocao de Associar Alunos sem Turma', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ count: 5 }),
      })
    );
  });

  test('renderiza a pagina de configuracoes sem o botao de associar alunos sem turma', () => {
    render(<Configuracoes />);

    expect(screen.getByRole('heading', { name: /configurações/i })).toBeInTheDocument();

    expect(screen.getByTestId('config-section-turmas')).toBeInTheDocument();
    expect(screen.getByTestId('config-section-cargos')).toBeInTheDocument();
    expect(screen.getByTestId('config-section-cursos')).toBeInTheDocument();

    expect(screen.queryByText(/associar alunos sem turma/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pendente/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /associar alunos/i })).not.toBeInTheDocument();
  });

  test('garante que AssociarAlunoModal nao e mais exportado por Configmodals', () => {
    expect(ConfigModals.AssociarAlunoModal).toBeUndefined();
  });
});
