import React from 'react';
import { render, screen } from '@testing-library/react';
import EntradaItem from '../src/components/ComponentesDasPaginas/Home/EntradaItem';

describe('EntradaItem — avatar real', () => {
  test('Renderiza <img> quando a prop foto está presente', () => {
    render(<EntradaItem nome="João" hora="09:00" foto="/uploads/foto.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/foto.jpg');
  });

  test('Não renderiza <img> quando não há foto (usa o ícone User)', () => {
    render(<EntradaItem nome="João" hora="09:00" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
