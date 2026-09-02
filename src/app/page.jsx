'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/ComponentesDasPaginas/Home/Header';
import HorasSection from '@/components/ComponentesDasPaginas/Home/HorasSection';
import UltimasEntradas from '@/components/ComponentesDasPaginas/Home/UltimasEntradas';
import UltimasSaidas from '@/components/ComponentesDasPaginas/Home/UltimasSaidas';
import PontoDetailModal from '@/components/ComponentesDasPaginas/Home/PontoDetailModal';
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

  const apiBase = getApiBase();
  const sseDebounceTimer = useRef(null);
  const isRefreshingRef = useRef(false);

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
      }
    } catch (e) {
      console.error('Erro ao processar usuário local:', e);
      forceLogout();
    }
  }, [forceLogout, refreshAdminFeeds]);

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
            <HorasSection userData={userData} />
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
