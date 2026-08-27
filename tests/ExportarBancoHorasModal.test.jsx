import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportarBancoHorasModal from '@/Site/PopUpsEModals/ExportarBancoHorasModal';
import AlunoInfoCard from '@/components/ComponentesDasPaginas/Profile/AlunoInfoCard';

describe('ExportarBancoHorasModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const store = {
      ponto_ai_token: 'fake-admin-token',
      ponto_ai_user: JSON.stringify({ admin: true, name: 'Admin' }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => store[key] || null),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('não renderiza nada quando isOpen é false', () => {
    const { container } = render(
      <ExportarBancoHorasModal isOpen={false} onClose={jest.fn()} userId={2} alunoNome="Lucas Silva" />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renderiza formulário com campos de mês e formato quando aberto', () => {
    render(
      <ExportarBancoHorasModal isOpen={true} onClose={jest.fn()} userId={2} alunoNome="Lucas Silva" />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Exportar Banco de Horas')).toBeInTheDocument();
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getByLabelText('Mês Inicial')).toBeInTheDocument();
    expect(screen.getByLabelText('Mês Final')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  test('fecha o modal ao clicar no botão Cancelar ou pressionar Escape', () => {
    const onClose = jest.fn();
    render(
      <ExportarBancoHorasModal isOpen={true} onClose={onClose} userId={2} alunoNome="Lucas Silva" />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('valida se mês inicial é posterior ao mês final', async () => {
    render(
      <ExportarBancoHorasModal isOpen={true} onClose={jest.fn()} userId={2} alunoNome="Lucas Silva" />
    );

    const startInput = screen.getByLabelText('Mês Inicial');
    const endInput = screen.getByLabelText('Mês Final');

    fireEvent.change(startInput, { target: { value: '2026-08' } });
    fireEvent.change(endInput, { target: { value: '2026-05' } });

    fireEvent.click(screen.getByRole('button', { name: /baixar relatório/i }));

    expect(
      await screen.findByText('O mês inicial não pode ser posterior ao mês final.')
    ).toBeInTheDocument();
  });

  test('executa exportação e aciona download com sucesso', async () => {
    const mockBlob = new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-disposition' ? 'attachment; filename="relatorio.pdf"' : null),
      },
      blob: async () => mockBlob,
    });

    render(
      <ExportarBancoHorasModal isOpen={true} onClose={jest.fn()} userId={2} alunoNome="Lucas Silva" />
    );

    const startInput = screen.getByLabelText('Mês Inicial');
    const endInput = screen.getByLabelText('Mês Final');

    fireEvent.change(startInput, { target: { value: '2026-01' } });
    fireEvent.change(endInput, { target: { value: '2026-05' } });

    fireEvent.click(screen.getByText('PDF'));
    fireEvent.click(screen.getByRole('button', { name: /baixar relatório/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ponto/student/2/export-timesheet'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            start_month: '2026-01',
            end_month: '2026-05',
            format: 'pdf',
          }),
        })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    expect(await screen.findByText('Relatório gerado e baixado com sucesso!')).toBeInTheDocument();
  });

  test('exibe mensagem de erro quando backend retorna falha', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Intervalo de datas inválido.' }),
    });

    render(
      <ExportarBancoHorasModal isOpen={true} onClose={jest.fn()} userId={2} alunoNome="Lucas Silva" />
    );

    fireEvent.click(screen.getByRole('button', { name: /baixar relatório/i }));

    expect(await screen.findByText('Intervalo de datas inválido.')).toBeInTheDocument();
  });

  test('AlunoInfoCard renderiza botão de exportar e abre o modal ao clicar', () => {
    const mockAlunoInfo = {
      nome: 'Carlos Aluno',
      turma: 'Turma 2026.1',
      horasSemanais: '20 horas semanais',
      curso: 'Engenharia',
      especializacao: 'Software',
      nivel: 'Júnior',
      rawUser: { id: 5, profile_image: null },
    };

    render(<AlunoInfoCard alunoInfo={mockAlunoInfo} onSaved={jest.fn()} />);

    const exportBtn = screen.getByRole('button', { name: /exportar banco de horas/i });
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Carlos Aluno').length).toBeGreaterThanOrEqual(1);
  });
});
