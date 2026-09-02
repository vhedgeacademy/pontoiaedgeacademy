import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigCard from '../src/components/ComponentesDasPaginas/Configurations/ConfigCard';

// Mocka os modais para isolar o ConfigCard da árvore de UI real
jest.mock('@/Site/PopUpsEModals/Configmodals', () => ({
  AvisoExcluirModal: ({ isOpen, nomeItem }) => (
    isOpen ? <div data-testid="aviso-modal">Aviso: Não pode excluir {nomeItem} porque tem alunos</div> : null
  ),
  ExcluirItemModal: ({ isOpen, nomeItem }) => (
    isOpen ? <div data-testid="excluir-modal">Excluir {nomeItem}</div> : null
  ),
  EditarItemModal: () => null,
}));

describe('ConfigCard component', () => {
  it('opens AvisoExcluirModal when count > 0 and delete is clicked', () => {
    render(
      <ConfigCard id={1} title="Turma A" count={5} tipoItem="turma" />
    );

    const deleteButton = screen.getByTitle('Excluir');
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('aviso-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('excluir-modal')).not.toBeInTheDocument();
  });

  it('opens ExcluirItemModal when count === 0 and delete is clicked', () => {
    render(
      <ConfigCard id={2} title="Turma B" count={0} tipoItem="turma" />
    );

    const deleteButton = screen.getByTitle('Excluir');
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('excluir-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('aviso-modal')).not.toBeInTheDocument();
  });
});
