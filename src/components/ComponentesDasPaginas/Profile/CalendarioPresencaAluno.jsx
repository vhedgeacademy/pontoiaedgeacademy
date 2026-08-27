'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, LogIn, LogOut, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { getApiBase } from '@/config/api';

// `toISOString()` devolve a data em UTC, e este calendário é de parede local.
// Em UTC−3 às 21:30 de 14/08 ele apontava 15/08: o calendário abria no dia
// seguinte e mostrava "nenhum registro", enquanto o card de horas logo acima
// (calculado no servidor) mostrava as horas do dia 14. Montar a partir dos
// componentes locais mantém os dois de acordo.
const toLocalDateString = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const CalendarioPresencaAluno = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()));

  const [dateRecord, setDateRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDateRecord = useCallback(async (dateStr) => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
      const res = await fetch(`${getApiBase()}/ponto/student/${userId}/date-record?date=${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDateRecord(data);
      } else {
        // Limpar é parte do tratamento de erro: sem isso os cards seguiam
        // mostrando os números da data anterior sob o cabeçalho da nova, e um
        // 401 ao navegar de 10/08 para 11/08 fazia o admin ler a frequência de
        // um dia como sendo a de outro.
        setDateRecord(null);
        const err = await res.json();
        setError(err.detail || 'Erro ao carregar dados do calendário.');
      }
    } catch (e) {
      console.error('Erro ao buscar registro de ponto:', e);
      setDateRecord(null);
      setError('Erro de conexão ao buscar dados.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedDate) {
      fetchDateRecord(selectedDate);
    }
  }, [selectedDate, fetchDateRecord]);

  const changeDateByDays = (days) => {
    // Interpretar como meia-noite local e serializar por toISOString (UTC) não
    // é ida e volta: em UTC+1/+2 o "próximo dia" devolvia a mesma string, o
    // React não re-renderizava e o botão virava no-op — e o "dia anterior"
    // pulava dois dias. `toLocalDateString` fecha o ciclo no mesmo fuso.
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(toLocalDateString(current));
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-[#243D6D] flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-[#4493AC]" />
            <span>Calendário de Presença</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Consulte a primeira entrada, última saída e total de horas por dia selecionado.
          </p>
        </div>

        {/* Seletor de Data */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 shadow-inner">
          <button
            onClick={() => changeDateByDays(-1)}
            title="Dia Anterior"
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#4493AC]"
          />

          <button
            onClick={() => changeDateByDays(1)}
            title="Próximo Dia"
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 font-medium">Carregando registros de ponto...</div>
      ) : (
        <div className="space-y-6">
          {/* Métricas do Dia Selecionado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primeira Entrada */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Primeira Entrada</p>
                <p className="text-2xl font-black text-emerald-950 mt-0.5">
                  {dateRecord?.primeira_entrada || '--:--'}
                </p>
              </div>
            </div>

            {/* Última Saída */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-amber-800 tracking-wider">Última Saída</p>
                <p className="text-2xl font-black text-amber-950 mt-0.5">
                  {dateRecord?.ultima_saida || '--:--'}
                </p>
              </div>
            </div>

            {/* Horas do Dia */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-blue-800 tracking-wider">Total do Dia</p>
                <p className="text-2xl font-black text-blue-950 mt-0.5">
                  {dateRecord?.total_dia || '00:00'}
                </p>
              </div>
            </div>

            {/* Total da Semana */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-indigo-800 tracking-wider">Acumulado na Semana</p>
                <p className="text-2xl font-black text-indigo-950 mt-0.5">
                  {dateRecord?.total_semana || '00:00'}
                </p>
              </div>
            </div>
          </div>

          {/* Histórico Detalhado do Dia */}
          <div className="mt-8 border border-gray-100 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700">
                Registros de {formatDisplayDate(selectedDate)}
              </h4>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600">
                {dateRecord?.events?.length || 0} registro{(dateRecord?.events?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {dateRecord?.events && dateRecord.events.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {dateRecord.events.map((ev, idx) => (
                  <div key={ev.id || idx} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${ev.event_type === 'Entrada' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-semibold text-gray-800">{ev.event_type}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="font-mono font-medium text-gray-700">{formatTime(ev.timestamp)}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{ev.camera_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                Nenhum registro de ponto registrado nesta data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioPresencaAluno;
