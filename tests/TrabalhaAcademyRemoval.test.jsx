import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlunoInfoCard from '../src/components/ComponentesDasPaginas/Profile/AlunoInfoCard';
import CadastrarUsuarioModal from '../src/Site/PopUpsEModals/CadastrarUsuarioModal';
import EditarPerfilModal from '../src/Site/PopUpsEModals/EditarPerfilModal';

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    })
  );
});

describe('Remoção do campo Trabalha Academy / Sem Academy', () => {
  test('AlunoInfoCard não renderiza Sem Academy nem 20 horas semanais', () => {
    const mockAlunoInfo = {
      nome: 'Victor Hugo Silva Ângelo',
      turma: 'Turma 3',
      curso: 'Ciência da Computação',
      especializacao: 'Inteligência Artificial',
      nivel: 'Graduação 1',
      horasSemanais: 'Sem Academy',
      rawUser: { id: 2, name: 'Victor Hugo', profile_image: null }
    };

    render(<AlunoInfoCard alunoInfo={mockAlunoInfo} onSaved={jest.fn()} />);

    expect(screen.queryByText('Sem Academy')).not.toBeInTheDocument();
    expect(screen.queryByText('20 horas semanais')).not.toBeInTheDocument();
    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument();
  });

  test('CadastrarUsuarioModal não exibe toggle de Trabalha Academy', () => {
    render(
      <CadastrarUsuarioModal
        isOpen={true}
        onClose={jest.fn()}
        onUserCreated={jest.fn()}
      />
    );

    expect(screen.queryByText(/Trabalha Academy/i)).not.toBeInTheDocument();
  });

  test('EditarPerfilModal não exibe toggle de Trabalha no Academy', () => {
    const mockAlunoInfo = {
      nome: 'Victor Hugo',
      turma: 'Turma 3',
      curso: 'Ciência da Computação',
      especializacao: 'IA',
      nivel: 'Graduação 1',
      rawUser: { id: 2, name: 'Victor Hugo', student_profile: { matricula: '1234567' } },
      rawTurmas: [],
      rawCargos: [],
      rawCursos: []
    };

    render(
      <EditarPerfilModal
        isOpen={true}
        onClose={jest.fn()}
        alunoInfo={mockAlunoInfo}
        onSaved={jest.fn()}
      />
    );

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/Trabalha no Academy/i)).not.toBeInTheDocument();
  });
});
