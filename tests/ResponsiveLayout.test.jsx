import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

describe('Responsive Navigation & Mobile Drawer (Sidebar)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const studentUser = { id: 10, name: 'Aluno Mobile', email: 'aluno.mobile@edge.ufal.br', admin: false };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((k) => (k === 'ponto_ai_user' ? JSON.stringify(studentUser) : null)),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renderiza o header mobile com botão hamburguer e logotipo', async () => {
    await act(async () => {
      render(<Sidebar />);
    });

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    expect(menuButton).toBeInTheDocument();

    expect(screen.getAllByAltText('Logo Edge').length).toBeGreaterThanOrEqual(1);
  });

  test('abre e fecha o drawer lateral mobile ao clicar no menu hamburguer e no botão fechar/backdrop', async () => {
    await act(async () => {
      render(<Sidebar />);
    });

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });

    await act(async () => {
      fireEvent.click(menuButton);
    });

    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeButton).toBeInTheDocument();
    expect(screen.getAllByText('aluno.mobile@edge.ufal.br').length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByRole('button', { name: /fechar menu/i })).not.toBeInTheDocument();
  });

  test('navega e fecha o drawer ao clicar em um link do menu mobile', async () => {
    await act(async () => {
      render(<Sidebar />);
    });

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // O link aparece duplicado (sidebar desktop + drawer); o último é o do drawer
    const recIdButtons = screen.getAllByRole('button', { name: /reconhecimento id/i });
    expect(recIdButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(recIdButtons[recIdButtons.length - 1]);
    });

    expect(mockPush).toHaveBeenCalledWith('/reconhecimento-id');
  });
});
