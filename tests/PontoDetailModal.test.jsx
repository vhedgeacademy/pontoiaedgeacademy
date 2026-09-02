import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PontoDetailModal from '@/components/ComponentesDasPaginas/Home/PontoDetailModal';

describe('PontoDetailModal - Exibição de foto do Facedoor vs Perfil', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('prioriza foto do Facedoor (foto_base64) na seção de reconhecimento mesmo tendo foto de perfil', () => {
    const ponto = {
      id: 1,
      user_id: 2,
      nome: 'Victor Hugo Silva Ângelo',
      camera_id: 'Saída Pista de Atletismo',
      event_type: 'Saída',
      horario: '17:46',
      data: '2026-09-01',
      photo_url: 'https://example.com/profile_image.jpg',
      foto_base64: 'BASE64_FACEDOOR_SNAPSHOT_DATA',
    };

    render(<PontoDetailModal ponto={ponto} onClose={mockOnClose} />);

    // Verifica textos do modal
    expect(screen.getByText('Victor Hugo Silva Ângelo')).toBeInTheDocument();
    expect(screen.getAllByText('Saída Pista de Atletismo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('17:46')).toBeInTheDocument();
    expect(screen.getByText('2026-09-01')).toBeInTheDocument();

    // A imagem do reconhecimento facial deve vir estritamente do Facedoor (data:image/jpeg;base64)
    const recImg = screen.getByAltText(/Foto do Reconhecimento Facial/i);
    expect(recImg).toBeInTheDocument();
    expect(recImg.src).toContain('data:image/jpeg;base64,BASE64_FACEDOOR_SNAPSHOT_DATA');
    expect(recImg.src).not.toContain('https://example.com/profile_image.jpg');

    // O avatar deve exibir a foto de perfil
    const avatarImg = screen.getByAltText('Victor Hugo Silva Ângelo');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg.src).toContain('https://example.com/profile_image.jpg');
  });

  test('exibe imagem do terminal físico quando foto_base64 e fotoPerfil forem nulos e o terminal for reconhecido', () => {
    const ponto = {
      id: 2,
      user_id: 3,
      nome: 'Aluno Sem Captura',
      camera_id: 'Entrada Academy',
      event_type: 'Entrada',
      horario: '08:00',
      data: '2026-09-01',
      photo_url: null,
      foto_base64: null,
    };

    render(<PontoDetailModal ponto={ponto} onClose={mockOnClose} />);

    // Deve renderizar a foto do terminal físico correspondente
    const terminalImg = screen.getByAltText(/Terminal Facial Entrada Academy/i);
    expect(terminalImg).toBeInTheDocument();
    expect(terminalImg.src).toContain('entrada-academy.jpg');
    expect(screen.getByText('Terminal Autenticado')).toBeInTheDocument();
  });

  test('exibe foto facial do perfil do aluno quando foto_base64 for nulo e photo_url estiver presente', () => {
    const ponto = {
      id: 2,
      user_id: 3,
      nome: 'Aluno Com Perfil',
      camera_id: 'Entrada Academy',
      event_type: 'Entrada',
      horario: '08:00',
      data: '2026-09-01',
      photo_url: 'https://example.com/profile_only.jpg',
      foto_base64: null,
    };

    render(<PontoDetailModal ponto={ponto} onClose={mockOnClose} />);

    expect(screen.getByText(/Foto do Aluno \(Identificação Biométrica\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Biometria Cadastrada/i)).toBeInTheDocument();
  });

  test('exibe aviso de ausência de imagem quando foto_base64 for nulo e o terminal for desconhecido', () => {
    const ponto = {
      id: 3,
      user_id: 4,
      nome: 'Aluno Sem Terminal',
      camera_id: 'Camera Desconhecida Sem Foto',
      event_type: 'Entrada',
      horario: '09:00',
      data: '2026-09-01',
      foto_base64: null,
    };

    render(<PontoDetailModal ponto={ponto} onClose={mockOnClose} />);

    expect(screen.getByText(/Nenhuma imagem disponível para este terminal/i)).toBeInTheDocument();
  });

  test('fecha o modal ao pressionar tecla Escape ou clicar no botão fechar', () => {
    const ponto = {
      id: 1,
      user_id: 2,
      nome: 'Victor Hugo',
      camera_id: 'Porta Academy',
      event_type: 'Entrada',
      horario: '10:00',
      data: '2026-09-01',
    };

    render(<PontoDetailModal ponto={ponto} onClose={mockOnClose} />);

    // Tecla Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Botão Fechar no rodapé
    const closeButtons = screen.getAllByRole('button', { name: /Fechar/i });
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});