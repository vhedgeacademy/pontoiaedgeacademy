'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Table, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { getApiBase } from '@/config/api';

const getCurrentYearMonth = (offsetMonths = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const ExportarBancoHorasModal = ({ isOpen, onClose, userId, alunoNome }) => {
  const [startMonth, setStartMonth] = useState(() => getCurrentYearMonth(-1));
  const [endMonth, setEndMonth] = useState(() => getCurrentYearMonth(0));
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleExport = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');

    if (!startMonth || !endMonth) {
      setError('Por favor, preencha o mês inicial e o mês final.');
      return;
    }

    if (startMonth > endMonth) {
      setError('O mês inicial não pode ser posterior ao mês final.');
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
      const response = await fetch(`${getApiBase()}/ponto/student/${userId}/export-timesheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_month: startMonth,
          end_month: endMonth,
          format: format,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Falha ao exportar relatório.';
        try {
          const errData = await response.json();
          if (errData?.detail) errorMsg = errData.detail;
        } catch (e) {}
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `relatorio_horas_${userId}_${startMonth}_${endMonth}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Relatório gerado e baixado com sucesso!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Erro na exportação:', err);
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
        {/* Cabeçalho */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4F8] flex items-center justify-center text-[#4493AC]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-xl font-bold text-[#243D6D]">
                Exportar Banco de Horas
              </h3>
              <p className="text-xs text-gray-500">{alunoNome || 'Estudante'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar modal"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleExport} className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Seletores de Mês Inicial e Final */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_month" className="block text-xs font-bold uppercase text-gray-600 tracking-wider mb-2">
                Mês Inicial
              </label>
              <input
                id="start_month"
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#4493AC] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="end_month" className="block text-xs font-bold uppercase text-gray-600 tracking-wider mb-2">
                Mês Final
              </label>
              <input
                id="end_month"
                type="month"
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#4493AC] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Seleção do Formato */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 tracking-wider mb-3">
              Formato do Arquivo
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                  format === 'pdf'
                    ? 'border-[#4493AC] bg-[#F4F9FB] shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    format === 'pdf' ? 'bg-[#4493AC] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">PDF</p>
                  <p className="text-xs text-gray-500">Documento Oficial</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                  format === 'csv'
                    ? 'border-[#4493AC] bg-[#F4F9FB] shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    format === 'csv' ? 'bg-[#4493AC] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">CSV</p>
                  <p className="text-xs text-gray-500">Planilha Excel</p>
                </div>
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#4493AC] hover:bg-[#357a96] text-white font-semibold shadow-md transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Relatório</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportarBancoHorasModal;
