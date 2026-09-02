import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditarPerfilModal from '@/Site/PopUpsEModals/EditarPerfilModal';
import { EditarItemModal } from '@/Site/PopUpsEModals/Configmodals';

describe('EditarPerfilModal - Sem duplicacao de cursos e selects', () => {
  const mockAlunoInfo = {
    nome: 'Diogo Talys Amorim',
    rawUser: {
      id: 4,
      student_profile: {
        ano_ingresso: 2022,
        semestre: 8,
        cargo_id: 1,
        curso_id: 1,
        turma_id: 3,
        trilha: 'Software',
      },
    },
    rawCargos: [{ id: 1, name: 'Trainee 1' }],
    rawCursos: [
      { id: 1, name: 'Ciência da Computação' },
      { id: 2, name: 'Engenharia da Computação' },
    ],
    rawTurmas: [{ id: 3, name: 'Turma 3' }],
  };

  test('renderiza os cursos corretamente sem duplicar Ciencia da Computacao', () => {
    render(
      <EditarPerfilModal
        isOpen={true}
        onClose={jest.fn()}
        alunoInfo={mockAlunoInfo}
        onSaved={jest.fn()}
      />
    );

    // O select de Curso deve ter placeholder 'Selecione o curso' e as duas opcoes de cursos
    const cursoSelect = screen.getByDisplayValue('Ciência da Computação');
    expect(cursoSelect).toBeInTheDocument();

    const options = cursoSelect.querySelectorAll('option');
    const optionTexts = Array.from(options).map(o => o.textContent);

    expect(optionTexts).toEqual([
      'Selecione o curso',
      'Ciência da Computação',
      'Engenharia da Computação',
    ]);
  });
});

describe('EditarItemModal - Associacao e salvamento de alunos nas configuracoes', () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [
          { id: 1, name: 'Victor Hugo Silva Ângelo', student_profile: { turma_id: 3 } },
          { id: 2, name: 'Diogo Talys Amorim', student_profile: { turma_id: 3 } },
          { id: 3, name: 'Matheus Ryan Nascimento', student_profile: { turma_id: 3 } },
          { id: 4, name: 'José Matheus Santana Alves', student_profile: { turma_id: 3 } },
          { id: 5, name: 'Ruan Tenório de Melo', student_profile: { turma_id: null } },
        ],
      })
    );
  });

  test('permite vincular aluno sem vinculo e salvar associacao na turma', async () => {
    render(
      <EditarItemModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        nomeAtual="Turma 3"
        tipoItem="turma"
        entityId={3}
      />
    );

    // Aguarda carregar os alunos
    await waitFor(() => {
      expect(screen.getByText('Alunos Vinculados (4)')).toBeInTheDocument();
      expect(screen.getByText('Ruan Tenório de Melo')).toBeInTheDocument();
    });

    // Clica no botao '+' para vincular Ruan Tenório de Melo
    const addButtons = screen.getAllByRole('button');
    const plusButton = addButtons.find(b => b.querySelector('svg.lucide-plus'));
    expect(plusButton).toBeDefined();
    fireEvent.click(plusButton);

    // Agora o total de vinculados deve ser 5
    expect(screen.getByText('Alunos Vinculados (5)')).toBeInTheDocument();

    // Clica em Salvar Alteracoes
    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Turma 3', [1, 2, 3, 4, 5]);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});