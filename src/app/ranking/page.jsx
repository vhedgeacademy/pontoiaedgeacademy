'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RankingCard from '@/components/ComponentesDasPaginas/Ranking/RankingCard';
import RankingPodium from '@/components/ComponentesDasPaginas/Ranking/RankingPodium';
import RankingTable from '@/components/ComponentesDasPaginas/Ranking/RankingTable';
import { getApiBase } from '@/config/api';

const RankingPage = () => {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [period, setPeriod] = useState('diario');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [rankingData, setRankingData] = useState([]);
  const [periodLabel, setPeriodLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRanking = useCallback(async (currentPeriod, currentDate) => {
    const token = localStorage.getItem('ponto_ai_token');
    if (!token) {
      routerRef.current.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${getApiBase()}/ponto/ranking?period=${currentPeriod}&date=${currentDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setRankingData(data.ranking || []);

        if (data.start_date && data.end_date) {
          if (currentPeriod === 'diario') {
            setPeriodLabel(`Dia ${data.date}`);
          } else if (currentPeriod === 'semanal') {
            setPeriodLabel(`Semana de ${data.start_date} a ${data.end_date}`);
          } else {
            setPeriodLabel(`Mês (${data.start_date} a ${data.end_date})`);
          }
        }
      } else if (res.status === 401 || res.status === 403) {
        routerRef.current.push('/login');
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking(period, selectedDate);
  }, [period, selectedDate, fetchRanking]);

  // Estudantes com horas trabalhadas para o podium
  const activeTop3 = rankingData.filter((item) => (item.total_seconds || 0) > 0).slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 min-h-screen overflow-y-auto bg-white ml-0 md:ml-20 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#4493AC]">
                Ranking de Horas
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Acompanhe o desempenho e a assiduidade dos alunos por período
              </p>
            </div>
          </div>

          <RankingCard
            period={period}
            setPeriod={setPeriod}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            periodLabel={periodLabel}
          >
            {/* Podium dos 3 primeiros com horas registradas */}
            {!loading && activeTop3.length > 0 && (
              <RankingPodium top3={activeTop3} />
            )}

            {/* Tabela completa com todos os alunos */}
            <RankingTable data={rankingData} loading={loading} />
          </RankingCard>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
