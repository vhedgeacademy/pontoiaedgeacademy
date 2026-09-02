'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Calendar as CalendarIcon, UserCheck } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AlunoInfoCard from '@/components/ComponentesDasPaginas/Profile/AlunoInfoCard';
import CalendarioPresencaAluno from '@/components/ComponentesDasPaginas/Profile/CalendarioPresencaAluno';
import { getApiBase } from '@/config/api';

const TRILHAS = [
  { value: 'Software', label: 'Desenvolvimento de Software' },
  { value: 'Automação', label: 'Automação Industrial' },
  { value: 'IA', label: 'Inteligência Artificial' },
  { value: 'Embarcados', label: 'Sistemas Embarcados' }
];

const PerfilAlunoContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [alunoInfo, setAlunoInfo] = useState(null);
  const [hoursSummary, setHoursSummary] = useState({ horas_hoje: '00:00', horas_semana: '00:00' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    try {
      const [userRes, turmasRes, cargosRes, cursosRes, summaryRes] = await Promise.all([
        fetch(`${getApiBase()}/users/${id}`, { headers }),
        fetch(`${getApiBase()}/turmas`, { headers }),
        fetch(`${getApiBase()}/cargos`, { headers }),
        fetch(`${getApiBase()}/cursos`, { headers }),
        fetch(`${getApiBase()}/ponto/student/${id}/summary`, { headers })
      ]);

      if (userRes.ok) {
        const user = await userRes.json();
        const turmas = turmasRes.ok ? await turmasRes.json() : [];
        const cargos = cargosRes.ok ? await cargosRes.json() : [];
        const cursos = cursosRes.ok ? await cursosRes.json() : [];

        const sp = user.student_profile || {};
        const turmaName = turmas.find(t => t.id === sp.turma_id)?.name || 'Sem Turma';
        const cargoName = cargos.find(c => c.id === sp.cargo_id)?.name || 'Sem Cargo';
        const cursoName = cursos.find(c => c.id === sp.curso_id)?.name || 'Sem Curso';
        const trilhaLabel = TRILHAS.find(t => t.value === sp.trilha)?.label || sp.trilha || 'Sem Trilha';

        setAlunoInfo({
          nome: user.name,
          turma: turmaName,
          curso: cursoName,
          especializacao: trilhaLabel,
          nivel: cargoName,
          rawUser: user,
          rawTurmas: turmas,
          rawCargos: cargos,
          rawCursos: cursos
        });
      }

      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setHoursSummary({
          horas_hoje: sumData.horas_hoje || sumData.today_hours || '00:00',
          horas_semana: sumData.horas_semana || sumData.week_hours || '00:00'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">Carregando perfil...</div>
      </div>
    );
  }

  if (!alunoInfo) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-semibold text-gray-800 mb-4">Aluno não encontrado.</p>
        <button onClick={() => router.push('/search')} className="px-6 py-2 bg-[#4493AC] text-white rounded-lg">
          Voltar para a Busca
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-0 md:ml-20 min-h-screen overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => router.push('/search')}
              className="flex items-center gap-2 text-[#4493AC] hover:text-[#2c6577] font-semibold text-xs sm:text-sm transition-colors group self-start cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para Busca de Usuários</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#243D6D]">Perfil do Estudante</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF4F8] flex items-center justify-center text-[#4493AC] shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Horas Registradas Hoje</p>
                <p className="text-3xl font-black text-[#243D6D] mt-1">{hoursSummary.horas_hoje}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Horas na Semana Atual</p>
                <p className="text-3xl font-black text-[#243D6D] mt-1">{hoursSummary.horas_semana}</p>
              </div>
            </div>
          </div>

          <AlunoInfoCard alunoInfo={alunoInfo} onSaved={fetchData} />

          <CalendarioPresencaAluno userId={id} />
        </div>
      </div>
    </div>
  );
};

export default function PerfilAluno() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-800">Carregando...</p>
      </div>
    }>
      <PerfilAlunoContent />
    </Suspense>
  );
}

