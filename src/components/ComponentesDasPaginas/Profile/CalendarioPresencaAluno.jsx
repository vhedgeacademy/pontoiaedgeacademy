import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, LogIn, LogOut, ChevronLeft, ChevronRight, AlertCircle, Eye, Camera } from 'lucide-react';
import { getApiBase } from '@/config/api';
import { getTerminalImage } from '@/config/terminals';
import { resolvePontoImage } from '@/utils/imageUtils';
import PontoDetailModal from '@/components/ComponentesDasPaginas/Home/PontoDetailModal';

// Converte photo_url relativo em URL absoluta com token na query
const resolvePhotoUrl = (path, tk) => {
  if (!path) return null;
  const apiBase = getApiBase();
  return path.startsWith('/') ? `${apiBase}${path}?token=${tk}` : path;
};

// Serializa a data no fuso local (YYYY-MM-DD). Não usar `toISOString()`:
// ela devolve UTC e, perto da virada do dia, apontaria o dia errado —
// divergindo dos cards de horas calculados no servidor.
const toLocalDateString = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const CalendarioPresencaAluno = ({ userId, alunoInfo }) => {
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()));

  const [dateRecord, setDateRecord] = useState(null);
  const [selectedPonto, setSelectedPonto] = useState(null);
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
        // Limpa o registro anterior: sem isso os cards continuariam mostrando
        // os números da data antiga sob o cabeçalho da nova.
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
    // Lê meia-noite local e serializa com `toLocalDateString` para a ida e
    // volta ficar no mesmo fuso; passar por UTC deslocaria o dia em alguns
    // fusos e quebraria a navegação de +1/-1.
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

  const handleSelectEvent = (ev) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    const profileImg = alunoInfo?.rawUser?.profile_image || alunoInfo?.foto || null;
    const photoUrl = resolvePhotoUrl(profileImg, token);
    const pontoImage = ev.foto_base64 || ev.imagem || ev.foto || ev.image_base64 || null;

    setSelectedPonto({
      id: ev.id,
      user_id: userId,
      nome: alunoInfo?.nome || alunoInfo?.name || 'Aluno',
      photo_url: photoUrl,
      foto_base64: pontoImage,
      imagem: pontoImage,
      camera_id: ev.camera_id,
      horario: formatTime(ev.timestamp),
      hora: formatTime(ev.timestamp),
      data: formatDisplayDate(selectedDate),
      event_type: ev.event_type,
      origem: ev.origem || 'pipeline',
    });
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';

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
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 cursor-pointer"
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
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 cursor-pointer"
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

          {/* Histórico Detalhado do Dia com Fotos de Entradas e Saídas */}
          <div className="mt-8 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
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
                {dateRecord.events.map((ev, idx) => {
                  const isEntrada = ev.event_type === 'Entrada';
                  const rawPontoImage = ev.foto_base64 || ev.imagem || ev.foto || ev.image_base64 || null;
                  const pontoImage = resolvePontoImage(rawPontoImage, token);
                  const userProfileImage = resolvePhotoUrl(alunoInfo?.rawUser?.profile_image || alunoInfo?.foto || null, token);
                  const terminalImage = getTerminalImage(ev.camera_id);
                  const displayImage = pontoImage || userProfileImage || terminalImage;
                  const hasDatabasePhoto = Boolean(pontoImage);
                  const hasUserPhoto = Boolean(userProfileImage);

                  return (
                    <div
                      key={ev.id || idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectEvent(ev)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectEvent(ev);
                        }
                      }}
                      className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group focus:outline-none focus:bg-slate-100/80"
                      title="Clique para visualizar os detalhes e a foto do registro"
                    >
                      {/* Miniatura da Imagem e Informações do Registro */}
                      <div className="flex items-center gap-4 min-w-0 pr-2">
                        {/* Imagem do Ponto / Aluno / Terminal */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={hasDatabasePhoto ? `Foto do Ponto ${ev.event_type}` : hasUserPhoto ? `Foto de ${alunoInfo?.nome || 'Aluno'}` : `Terminal ${ev.camera_id}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <Camera className="w-6 h-6" />
                            </div>
                          )}
                          <span
                            className={`absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                              isEntrada ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                        </div>

                        {/* Detalhes do Evento */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isEntrada
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ev.event_type}
                            </span>
                            {hasDatabasePhoto ? (
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md hidden xs:inline-flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>Foto Facial</span>
                              </span>
                            ) : hasUserPhoto ? (
                              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md hidden xs:inline-flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>Biometria</span>
                              </span>
                            ) : terminalImage ? (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hidden xs:inline-flex">
                                Terminal
                              </span>
                            ) : null}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 mt-1 truncate">
                            {ev.camera_id || 'Terminal Facial'}
                          </span>
                        </div>
                      </div>

                      {/* Horário e Botão de Ver Detalhes */}
                      <div className="flex items-center gap-3 sm:gap-6 text-sm text-gray-500 shrink-0">
                        <span className="font-mono font-bold text-gray-900 text-base sm:text-lg">
                          {formatTime(ev.timestamp)}
                        </span>
                        <div className="text-gray-400 group-hover:text-[#4493AC] transition-colors p-2 bg-gray-50 group-hover:bg-blue-50 rounded-xl">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                Nenhum registro de ponto registrado nesta data.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Ponto / Foto Facial */}
      {selectedPonto && (
        <PontoDetailModal
          ponto={selectedPonto}
          onClose={() => setSelectedPonto(null)}
        />
      )}
    </div>
  );
};

export default CalendarioPresencaAluno;
