import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from '@/components/ComponentesDasPaginas/Home/Header';
import ManualPontoAdminModal from '@/components/ComponentesDasPaginas/Home/ManualPontoAdminModal';

describe('Componentes de Validação e Header Administrativo', () => {
  test('Header renderiza contagem de pessoas presentes', () => {
    render(<Header presenceCount={5} />);
    expect(screen.getByText('5 pessoas no Academy')).toBeInTheDocument();
  });

  test('Modal de Moderação exibe informações e permite alternar status', async () => {
    const onStatusChange = jest.fn();
    const onClose = jest.fn();
    const item = {
      id: 1,
      user_id: 10,
      user_name: 'Maria Pendente',
      user_email: 'maria@edge.ufal.br',
      event_type: 'Entrada',
      created_at: '2026-08-25T08:15:00',
      image_base64: 'IMG_B64_1',
      status: 'pendente',
    };

    render(
      <ManualPontoAdminModal
        item={item}
        onClose={onClose}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByText('Maria Pendente')).toBeInTheDocument();
    expect(screen.getByText('maria@edge.ufal.br')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aprovar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reprovar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pendente/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /aprovar/i }));
    expect(onStatusChange).toHaveBeenCalledWith(1, 'aprovado');
  });
});
