import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from '@/components/ComponentesDasPaginas/Home/Header';

describe('Componentes do Header Administrativo', () => {
  test('Header renderiza contagem de pessoas presentes', () => {
    render(<Header presenceCount={5} />);
    expect(screen.getByText('5 pessoas no Academy')).toBeInTheDocument();
  });
});
