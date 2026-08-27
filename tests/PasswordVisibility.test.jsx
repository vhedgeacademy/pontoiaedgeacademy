import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import RedefinirSenha from '@/app/redefinir-senha/page';
import EsqueciSenha from '@/app/esqueci-senha/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({
    get: (key) => (key === 'token' ? 'token-teste' : null),
  }),
}));

describe('Supressão de Duplicidade de Ícone de Revelar Senha', () => {
  test('o arquivo globals.css contém a regra para desativar o botão nativo ::-ms-reveal do navegador', () => {
    const cssPath = path.join(process.cwd(), 'src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toMatch(/::-ms-reveal/);
    expect(cssContent).toMatch(/display:\s*none/);
  });

  test('a tela de redefinição de senha possui alternância de visualização customizada controlada pelo React', () => {
    render(<RedefinirSenha />);

    const newPassInput = screen.getByLabelText('Nova senha');
    const confirmPassInput = screen.getByLabelText('Confirmar nova senha');

    expect(newPassInput).toHaveAttribute('type', 'password');
    expect(confirmPassInput).toHaveAttribute('type', 'password');

    // Encontra os botões de alternar senha dentro dos containers de input
    const toggleButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    expect(toggleButtons.length).toBe(2);

    // Clica no primeiro botão e alterna para type="text"
    fireEvent.click(toggleButtons[0]);
    expect(newPassInput).toHaveAttribute('type', 'text');
    expect(confirmPassInput).toHaveAttribute('type', 'password');
  });

  test('a tela de esqueci-senha possui alternância de visualização customizada controlada pelo React', () => {
    render(<EsqueciSenha />);

    const newPassInput = screen.getByLabelText('Nova Senha');
    const confirmPassInput = screen.getByLabelText('Confirmar Nova Senha');

    expect(newPassInput).toHaveAttribute('type', 'password');
    expect(confirmPassInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    expect(toggleButtons.length).toBe(2);

    fireEvent.click(toggleButtons[0]);
    expect(newPassInput).toHaveAttribute('type', 'text');
  });
});
