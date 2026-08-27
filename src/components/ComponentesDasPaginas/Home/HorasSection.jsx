'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';
import { getApiBase } from '@/config/api';

const HorasSection = ({ userData }) => {
  const router = useRouter();
  // `useRouter()` não garante identidade estável entre renders. Enquanto
  // `handleAuthFailure` dependia do objeto, ele era recriado a cada render — e
  // com ele `fetchDashboard`, que é dependência do efeito de carga. Cada
  // resposta re-renderizava e disparava o efeito outra vez: 90 chamadas em 1,5s
  // numa tela que faz 2. O laço nunca deixava `loading` assentar, e era essa a
  // causa das falhas intermitentes desta suíte.
  const routerRef = useRef(router);
  routerRef.current = router;
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const [dashboard, setDashboard] = useState({
    horas_hoje: '00:00',
    horas_semana: '00:00',
    meta_semanal: '20:00',
    saldo_meta_semanal: '20:00',
    primeira_entrada_hoje: null,
    primeira_entrada_tipo: null,
    primeira_entrada_status: null,
    ultima_saida_hoje: null,
    ultima_saida_tipo: null,
    ultima_saida_status: null,
    status_jornada: 'Fora do Turno',
  });

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [historyData, setHistoryData] = useState({
    data: getTodayString(),
    horas_dia: '00:00',
    horas_semana: '00:00',
    registros: [],
    empty: true,
  });

  const apiBase = getApiBase();

  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem('ponto_ai_token');
    localStorage.removeItem('ponto_ai_user');
    if (routerRef.current?.push) {
      routerRef.current.push('/login');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setDashboardError(null);
      const token = localStorage.getItem('ponto_ai_token');
      if (!token) {
        handleAuthFailure();
        return;
      }

      const res = await fetch(`${apiBase}/ponto/student/me/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        handleAuthFailure();
        return;
      }

      if (!res.ok) {
        throw new Error(`Falha ao carregar dashboard (HTTP ${res.status})`);
      }

      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error('Erro ao buscar dashboard do aluno:', err);
      setDashboardError(err.message || 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, [apiBase, handleAuthFailure]);

  const fetchHistory = useCallback(
    async (date) => {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const token = localStorage.getItem('ponto_ai_token');
        if (!token) {
          handleAuthFailure();
          return;
        }

        const res = await fetch(`${apiBase}/ponto/student/me/history?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          handleAuthFailure();
          return;
        }

        if (!res.ok) {
          throw new Error(`Falha ao carregar histórico (HTTP ${res.status})`);
        }

        const data = await res.json();
        setHistoryData(data);
      } catch (err) {
        console.error('Erro ao buscar histórico por data:', err);
        setHistoryError(err.message || 'Erro ao consultar histórico.');
        setHistoryData({
          data: date,
          horas_dia: '00:00',
          horas_semana: '00:00',
          registros: [],
          empty: true,
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    [apiBase, handleAuthFailure]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (selectedDate) {
      fetchHistory(selectedDate);
    }
  }, [selectedDate, fetchHistory]);

  const handleHojeClick = () => {
    const today = getTodayString();
    if (selectedDate === today) {
      fetchDashboard();
      fetchHistory(today);
    } else {
      setSelectedDate(today);
    }
  };

  const isCumprindo = dashboard.status_jornada === 'Cumprindo Horas';
  const isEncerrada = dashboard.status_jornada === 'Jornada Encerrada';

  // Parser para porcentagem da meta
  const parseHoursToFloat = (hhmm) => {
    if (!hhmm) return 0;
    const parts = hhmm.split(':');
    return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60.0;
  };
  const weekHoursFloat = parseHoursToFloat(dashboard.horas_semana);
  const metaHoursFloat = parseHoursToFloat(dashboard.meta_semanal) || 20.0;
  const progressPercent = Math.min(100, Math.round((weekHoursFloat / metaHoursFloat) * 100));

  const currentDateDisplay = historyData.data || selectedDate;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {dashboardError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{dashboardError}</span>
        </div>
      )}

      {/* 1. Status de Jornada e Resumo de Hoje */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-sm border-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#243D6D]">
              Olá, {userData?.name || 'Estudante'}!
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Acompanhe seu registro de ponto e cumprimento de carga horária
            </p>
          </div>

          {/* Badge de Status de Jornada */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status:</span>
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-sm ${
                isCumprindo
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isEncerrada
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCumprindo
                    ? 'bg-emerald-500 animate-ping'
                    : isEncerrada
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
              />
              <span>{loading ? 'Carregando...' : dashboard.status_jornada}</span>
            </div>
          </div>
        </div>

        {/* Marcações de Hoje (Primeira Entrada e Última Saída) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start justify-between p-4 bg-[#F4F9FB] rounded-2xl border border-[#D4E8ED]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#4493AC] shadow-sm border border-[#D4E8ED]">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Primeira Entrada Hoje</p>
                <p className="text-xl font-bold text-gray-800">
                  {loading ? '...' : dashboard.primeira_entrada_hoje || 'Não registrada'}
                </p>
              </div>
            </div>
            {!loading && dashboard.primeira_entrada_hoje && (
              <div className="flex flex-col items-end gap-1.5">
                {dashboard.primeira_entrada_tipo && (
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                      dashboard.primeira_entrada_tipo.toLowerCase() === 'manual'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {dashboard.primeira_entrada_tipo.toLowerCase() === 'manual' ? 'Manual' : 'Automática com IA'}
                  </span>
                )}
                {dashboard.primeira_entrada_status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      dashboard.primeira_entrada_status.toLowerCase() === 'aprovado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : dashboard.primeira_entrada_status.toLowerCase() === 'pendente'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {dashboard.primeira_entrada_status.charAt(0).toUpperCase() + dashboard.primeira_entrada_status.slice(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between p-4 bg-[#FFF9F5] rounded-2xl border border-[#FFE0D0]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E67E22] shadow-sm border border-[#FFE0D0]">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Última Saída Hoje</p>
                <p className="text-xl font-bold text-gray-800">
                  {loading ? '...' : dashboard.ultima_saida_hoje || 'Não registrada'}
                </p>
              </div>
            </div>
            {!loading && dashboard.ultima_saida_hoje && (
              <div className="flex flex-col items-end gap-1.5">
                {dashboard.ultima_saida_tipo && (
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                      dashboard.ultima_saida_tipo.toLowerCase() === 'manual'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {dashboard.ultima_saida_tipo.toLowerCase() === 'manual' ? 'Manual' : 'Automática com IA'}
                  </span>
                )}
                {dashboard.ultima_saida_status && (
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      dashboard.ultima_saida_status.toLowerCase() === 'aprovado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : dashboard.ultima_saida_status.toLowerCase() === 'pendente'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {dashboard.ultima_saida_status.charAt(0).toUpperCase() + dashboard.ultima_saida_status.slice(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Cards de Horas (Hoje, Total Semanal, Saldo de Meta) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card Horas Hoje */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Horas Hoje</span>
            <div className="w-10 h-10 rounded-full bg-[#D4E8ED] flex items-center justify-center text-[#4493AC]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#243D6D]">
              {loading ? '...' : dashboard.horas_hoje}
            </p>
            <p className="text-xs text-gray-500 mt-2">Carga horária acumulada no dia</p>
          </div>
        </div>

        {/* Card Total Semanal com Progresso */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Semanal</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#243D6D]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#243D6D]">
                {loading ? '...' : dashboard.horas_semana}
              </p>
              <span className="text-xs font-semibold text-gray-400">Meta: {dashboard.meta_semanal}</span>
            </div>
            {/* Barra de progresso */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-[#4493AC] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{progressPercent}% da meta semanal atingida</p>
          </div>
        </div>

        {/* Card Saldo Restante */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-gray-200 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Restante</span>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#243D6D]">
              {loading ? '...' : dashboard.saldo_meta_semanal}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {dashboard.saldo_meta_semanal === '00:00'
                ? 'Meta semanal concluída.'
                : 'Faltam para completar a meta semanal'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Calendário Histórico Retroativo */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-sm border-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#243D6D] flex items-center gap-2">
              <CalendarIcon className="w-5 sm:w-6 h-5 sm:h-6 text-[#4493AC]" />
              Consulta Histórica de Ponto
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Consulte seu histórico de entradas, saídas e horas de qualquer data
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto flex-wrap">
            <input
              type="date"
              aria-label="Selecionar Data"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4493AC]"
            />
            <button
              onClick={handleHojeClick}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Hoje
            </button>
          </div>
        </div>

        {historyError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{historyError}</span>
          </div>
        )}

        {/* Resumo da Data Selecionada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase">Horas no Dia ({currentDateDisplay})</span>
              <p className="text-2xl font-bold text-[#243D6D]">
                {historyLoading ? '...' : historyData.horas_dia}
              </p>
            </div>
            <Clock className="w-8 h-8 text-[#4493AC] opacity-60" />
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase">Horas na Semana da Data</span>
              <p className="text-2xl font-bold text-[#243D6D]">
                {historyLoading ? '...' : historyData.horas_semana}
              </p>
            </div>
            <CalendarCheck className="w-8 h-8 text-[#4493AC] opacity-60" />
          </div>
        </div>

        {/* Lista de Registros ou Empty State */}
        <div className="mt-8">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
            Registros do Dia ({currentDateDisplay})
          </h4>

          {historyLoading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Carregando registros...</div>
          ) : historyData.registros && historyData.registros.length > 0 ? (
            <div className="space-y-3">
              {historyData.registros.map((reg, idx) => {
                const isEnt = reg.event_type === 'Entrada';
                return (
                  <div
                    key={reg.id || idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isEnt
                        ? 'bg-[#F4F9FB] border-[#D4E8ED]'
                        : 'bg-[#FFF9F5] border-[#FFE0D0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          isEnt ? 'bg-[#D4E8ED] text-[#4493AC]' : 'bg-[#FFE0D0] text-[#E67E22]'
                        }`}
                      >
                        {isEnt ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{reg.event_type}</p>
                        <p className="text-xs text-gray-500">{reg.camera_id || 'Câmera / Local'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm ${
                          isEnt ? 'bg-[#2C3E50]' : 'bg-[#C0392B]'
                        }`}
                      >
                        {reg.horario}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-gray-700">Nenhum registro encontrado nesta data</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Não constam pontos registradas para o dia {currentDateDisplay}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorasSection;
