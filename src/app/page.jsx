'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/ComponentesDasPaginas/Home/Header';
import HorasSection from '@/components/ComponentesDasPaginas/Home/HorasSection';
import UltimasEntradas from '@/components/ComponentesDasPaginas/Home/UltimasEntradas';
import UltimasSaidas from '@/components/ComponentesDasPaginas/Home/UltimasSaidas';
import PontoDetailModal from '@/components/ComponentesDasPaginas/Home/PontoDetailModal';
import { AlertCircle } from 'lucide-react';
import { getApiBase } from '@/config/api';

const MonitoramentoAoVivo = () => {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [userData, setUserData] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [presenceCount, setPresenceCount] = useState(null);
  const [ultimasEntradas, setUltimasEntradas] = useState([]);
  const [ultimasSaidas, setUltimasSaidas] = useState([]);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [isIncompleteProfile, setIsIncompleteProfile] = useState(false);

  const apiBase = getApiBase();
  const sseDebounceTimer = useRef(null);
  const isRefreshingRef = useRef(false);

  const checkProfileCompleteness = useCallback(async () => {
    const token = localStorage.getItem('ponto_ai_token');
    const userStr = localStorage.getItem('ponto_ai_user');
    if (!token || !userStr) return;

    try {
      const parsed = JSON.parse(userStr);
      if (parsed.admin) {
        setIsIncompleteProfile(false);
        return;
      }

      const res = await fetch(`${apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const sp = data.student_profile;
        if (!sp || !sp.matricula || !sp.turma_id || !sp.cargo_id || !sp.trilha) {
          setIsIncompleteProfile(true);
        } else {
          setIsIncompleteProfile(false);
        }
      }
    } catch (e) {
      console.error('Erro ao verificar completude do perfil:', e);
    }
  }, [apiBase]);

  // Token rejeitado pelo backend: limpa a sessão e volta pro login
  const forceLogout = useCallback(() => {
    localStorage.removeItem('ponto_ai_token');
    localStorage.removeItem('ponto_ai_user');
    if (routerRef.current?.push) {
      routerRef.current.push('/login');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  // fetch autenticado: 401 derruba a sessão
  const authFetch = useCallback(
    async (url, options) => {
      try {
        const res = await fetch(url, options);
        if (res.status === 401) {
          forceLogout();
          return null;
        }
        return res;
      } catch (err) {
        console.error(`Erro na requisição para ${url}:`, err);
        return null;
      }
    },
    [forceLogout]
  );

  // Converte photo_url relativo em URL absoluta com token na query (<img> não envia header Authorization)
  const resolvePhotoUrl = useCallback(
    (path, tk) => (path && path.startsWith('/') ? `${apiBase}${path}?token=${tk}` : path),
    [apiBase]
  );

  // Recarrega feeds e contagem de presença (Admin)
  const refreshAdminFeeds = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const token = localStorage.getItem('ponto_ai_token');
      if (!token) return;

      const resPresence = await authFetch(`${apiBase}/ponto/presence/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resPresence === null) return;
      if (resPresence.ok) {
        const dataPresence = await resPresence.json();
        if (dataPresence?.count !== undefined) {
          setPresenceCount(dataPresence.count);
        }
      }

      const resPonto = await authFetch(`${apiBase}/ponto/ultimas-entradas?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resPonto === null) return;
      if (resPonto.ok) {
        const dataPonto = await resPonto.json();
        if (Array.isArray(dataPonto)) {
          setUltimasEntradas(
            dataPonto.map((e) => ({ ...e, photo_url: resolvePhotoUrl(e.photo_url, token) }))
          );
        }
      }

      const resFeed = await authFetch(`${apiBase}/ponto/feed/latest?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resFeed === null) return;
      if (resFeed.ok) {
        const dataFeed = await resFeed.json();
        if (dataFeed?.saidas) {
          setUltimasSaidas(
            dataFeed.saidas.map((s) => ({ ...s, photo_url: resolvePhotoUrl(s.photo_url, token) }))
          );
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar feeds do admin:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [apiBase, authFetch, resolvePhotoUrl]);

  const scheduleDebouncedRefresh = useCallback(() => {
    if (sseDebounceTimer.current) {
      clearTimeout(sseDebounceTimer.current);
    }
    sseDebounceTimer.current = setTimeout(() => {
      refreshAdminFeeds();
    }, 200);
  }, [refreshAdminFeeds]);

  useEffect(() => {
    const token = localStorage.getItem('ponto_ai_token');
    const userStr = localStorage.getItem('ponto_ai_user');

    if (!token || !userStr) {
      forceLogout();
      return;
    }

    try {
      const parsed = JSON.parse(userStr);
      setUserData(parsed);
      setIsAuthReady(true);
      if (parsed.admin) {
        refreshAdminFeeds();
      } else {
        checkProfileCompleteness();
      }
    } catch (e) {
      console.error('Erro ao processar usuário local:', e);
      forceLogout();
    }

    window.addEventListener('storage', checkProfileCompleteness);
    window.addEventListener('ponto_ai_profile_updated', checkProfileCompleteness);

    return () => {
      window.removeEventListener('storage', checkProfileCompleteness);
      window.removeEventListener('ponto_ai_profile_updated', checkProfileCompleteness);
    };
  }, [forceLogout, refreshAdminFeeds, checkProfileCompleteness]);

  // Escuta os eventos de reconhecimento via SSE
  useEffect(() => {
    const token = localStorage.getItem('ponto_ai_token');
    const userStr = localStorage.getItem('ponto_ai_user');
    if (!token) return;

    let isAdmin = false;
    if (userStr) {
      try {
        isAdmin = JSON.parse(userStr).admin;
      } catch (e) {}
    }
    if (!isAdmin) return;

    let es;
    let cancelled = false;
    let reconnectTimer;

    const connect = () => {
      if (cancelled) return;
      if (typeof EventSource === 'undefined') return;
      es = new EventSource(`${apiBase}/simulation/stream?token=${token}`);
      es.onmessage = (msg) => {
        try {
          const ev = JSON.parse(msg.data);
          if (
            ev.type === 'recognition' ||
            ev.type === 'ponto_registrado'
          ) {
            scheduleDebouncedRefresh();
          }
          if (ev.type === 'end') es.close();
        } catch (e) {}
      };
      es.onerror = () => {
        if (es) es.close();
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (sseDebounceTimer.current) clearTimeout(sseDebounceTimer.current);
      if (es) es.close();
    };
  }, [apiBase, scheduleDebouncedRefresh]);

  if (!isAuthReady || !userData) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <Sidebar />
        <div className="ml-0 md:ml-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4493AC] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500 font-medium">Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-0 md:ml-20 min-h-screen overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          <Header presenceCount={userData?.admin ? presenceCount : null} />

          {userData?.admin ? (
            <>
              <div className="flex flex-col gap-6 md:gap-8 mb-8">
                <div className="w-full bg-white rounded-3xl border-2 border-gray-300 p-4 sm:p-6 shadow-sm">
                  <UltimasEntradas
                    entradas={ultimasEntradas}
                    onSelectPonto={(ponto) => setSelectedPonto(ponto)}
                  />
                </div>

                <div className="w-full bg-white rounded-3xl border-2 border-gray-300 p-4 sm:p-6 shadow-sm">
                  <UltimasSaidas
                    saidas={ultimasSaidas}
                    onSelectPonto={(ponto) => setSelectedPonto(ponto)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {isIncompleteProfile && (
                <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-100/90 text-amber-700 rounded-2xl shrink-0 mt-0.5 sm:mt-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-amber-900">
                        Seu cadastro de estudante está incompleto!
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                        Preencha seus dados de <strong>Matrícula</strong>, <strong>Turma</strong>,{' '}
                        <strong>Cargo</strong> e <strong>Trilha</strong>. Essas informações são
                        essenciais para a validação no sistema e para que você consiga utilizar a
                        recuperação de senha (<strong>Esqueci a Senha</strong>).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/editar-perfil')}
                    className="px-5 py-2.5 bg-[#4493AC] hover:bg-[#243D6D] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    Completar Cadastro
                  </button>
                </div>
              )}
              <HorasSection userData={userData} />
            </>
          )}

          {selectedPonto && (
            <PontoDetailModal ponto={selectedPonto} onClose={() => setSelectedPonto(null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoramentoAoVivo;
