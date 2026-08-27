'use client';

import React, { useState } from 'react';
import { Calendar, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const RankingCard = ({
  children,
  period,
  setPeriod,
  selectedDate,
  setSelectedDate,
  periodLabel,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleStepDate = (days) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="border-2 border-gray-300 rounded-3xl p-4 sm:p-6 md:p-8 bg-white shadow-sm">
      {/* Barra de Controles e Filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        {/* Seletor de Período (Abas) */}
        <div className="flex items-center bg-[#EAF4F7] p-1.5 rounded-2xl gap-1 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setPeriod('diario')}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center ${
              period === 'diario'
                ? 'bg-[#4493AC] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-transparent'
            }`}
          >
            Diário
          </button>
          <button
            onClick={() => setPeriod('semanal')}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center ${
              period === 'semanal'
                ? 'bg-[#4493AC] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-transparent'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('mensal')}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center ${
              period === 'mensal'
                ? 'bg-[#4493AC] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-transparent'
            }`}
          >
            Mensal
          </button>
        </div>

        {/* Controles de Data e Navegação */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5 gap-2 flex-1 sm:flex-initial min-w-[150px]">
            <Calendar className="w-4 h-4 text-[#4493AC] shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStepDate(period === 'mensal' ? -30 : period === 'semanal' ? -7 : -1)}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 cursor-pointer"
              title="Período Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={() => handleStepDate(period === 'mensal' ? 30 : period === 'semanal' ? 7 : 1)}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 cursor-pointer"
              title="Próximo Período"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Botão de Ajuda com Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-9 h-9 bg-[#D4E8ED] rounded-full flex items-center justify-center hover:bg-[#c4dde3] transition-colors"
              aria-label="Informações sobre o ranking"
            >
              <HelpCircle className="w-5 h-5 text-[#4493AC]" />
            </button>

            {showTooltip && (
              <div className="absolute top-12 right-0 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-20 animate-in fade-in zoom-in duration-150">
                <h4 className="font-semibold text-gray-800 mb-1 text-sm">Ranking de Presença e Horas</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  O ranking consolida as horas trabalhadas pelos alunos de acordo com o intervalo selecionado:
                  dia específico, semana (domingo a sábado) ou mês. O topo da tabela destaca os 3 primeiros colocados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {periodLabel && (
        <div className="mb-4 inline-block px-4 py-1.5 rounded-xl bg-[#F0F8FA] border border-[#D4E8ED] text-xs font-medium text-[#4493AC]">
          Exibindo: <span className="font-bold">{periodLabel}</span>
        </div>
      )}

      {children}
    </div>
  );
};

export default RankingCard;
