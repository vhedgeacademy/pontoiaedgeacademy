import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditarPerfil from '@/app/editar-perfil/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/editar-perfil',
}));


describe('EditarPerfil component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    const userObj = { id: 5, name: 'Aluno Teste', email: 'aluno@edge.ufal.br' };
    const store = {
      ponto_ai_token: 'fake-token',
      ponto_ai_user: JSON.stringify(userObj)
    };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => store[k] || null),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renderiza formulário e dados do usuário', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/turmas') || url.includes('/cargos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 5,
          name: 'Aluno Teste',
          email: 'aluno@edge.ufal.br',
          student_profile: {
            matricula: '20240001',
            turma_id: 1,
            cargo_id: 2,
            trilha: 'Software'
          }
        }),
      });
    });


    render(<EditarPerfil />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Aluno Teste')).toBeInTheDocument();
      expect(screen.getByDisplayValue('aluno@edge.ufal.br')).toBeInTheDocument();
      expect(screen.getByText('20240001')).toBeInTheDocument();
    });
  });
});
