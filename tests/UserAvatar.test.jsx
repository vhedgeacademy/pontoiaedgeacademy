import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserAvatar from '../src/components/UserAvatar';

describe('UserAvatar Component', () => {
  test('renderiza elemento img quando src valido e fornecido', () => {
    render(<UserAvatar src="https://example.com/photo.jpg" name="Victor Hugo" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Victor Hugo');
  });

  test('renderiza inicial do nome quando src e nulo ou vazio', () => {
    render(<UserAvatar src={null} name="Victor Hugo" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
  });

  test('renderiza fallback com inicial do nome quando imagem dispara evento onError', () => {
    render(<UserAvatar src="https://example.com/broken-image.jpg" name="Carlos Eduardo" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  test('renderiza letra padrao U quando nome nao for fornecido e nao houver imagem', () => {
    render(<UserAvatar src="" name="" />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  test('aplica classes customizadas corretamente', () => {
    const { container } = render(
      <UserAvatar
        src=""
        name="Ana Clara"
        className="w-12 h-12 border-2 border-white"
        bgClassName="bg-purple-100 text-purple-700"
      />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass('w-12');
    expect(badge).toHaveClass('h-12');
    expect(badge).toHaveClass('bg-purple-100');
    expect(badge).toHaveClass('text-purple-700');
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
