import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigCard from '../src/components/ComponentesDasPaginas/Configurations/ConfigCard';

// Mock simple components to avoid complicated UI tree dependencies
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

    // Clica no botão de excluir
    const deleteButton = screen.getByTitle('Excluir');
    fireEvent.click(deleteButton);

    // Como count = 5 (> 0), deve abrir o AvisoExcluirModal e NÃO o ExcluirItemModal
    expect(screen.getByTestId('aviso-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('excluir-modal')).not.toBeInTheDocument();
  });

  it('opens ExcluirItemModal when count === 0 and delete is clicked', () => {
    render(
      <ConfigCard id={2} title="Turma B" count={0} tipoItem="turma" />
    );

    // Clica no botão de excluir
    const deleteButton = screen.getByTitle('Excluir');
    fireEvent.click(deleteButton);

    // Como count = 0, deve abrir o ExcluirItemModal normal
    expect(screen.getByTestId('excluir-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('aviso-modal')).not.toBeInTheDocument();
  });
});
