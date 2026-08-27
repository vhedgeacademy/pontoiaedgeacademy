'use client';

import React from 'react';
import { Clock, Award } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const RankingTable = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
        <div className="w-12 h-12 border-4 border-[#4493AC] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#4493AC] font-medium">Carregando classificação...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
        <div className="w-16 h-16 bg-[#D4E8ED] rounded-full flex items-center justify-center mb-4 text-[#4493AC]">
          <Award className="w-8 h-8" />
        </div>
        <p className="text-xl font-semibold text-gray-700">Sem registros de ponto para este período</p>
        <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
          Nenhum aluno registrou horas trabalhadas no intervalo selecionado.
        </p>
      </div>
    );
  }

  const maxSeconds = Math.max(...data.map(d => d.total_seconds || 0), 1);

  return (
    <div className="w-full overflow-hidden bg-white rounded-3xl border border-gray-200 shadow-sm mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-6 text-center w-14 sm:w-16">Posição</th>
              <th className="py-3 px-3 sm:px-6">Estudante</th>
              <th className="py-3 px-3 sm:px-6 hidden sm:table-cell">Progresso Relativo</th>
              <th className="py-3 px-3 sm:px-6 text-center">Horas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((student, index) => {
              const percentage =
                maxSeconds > 0
                  ? Math.min(100, Math.round(((student.total_seconds || 0) / maxSeconds) * 100))
                  : 0;

              return (
                <tr
                  key={student.user_id || student.id || student.name || index}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-extrabold shadow-xs ${
                        student.position === 1
                          ? 'bg-amber-400 text-white'
                          : student.position === 2
                          ? 'bg-slate-300 text-slate-800'
                          : student.position === 3
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {student.position}º
                    </span>
                  </td>

                  <td className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <UserAvatar
                        src={student.profile_image}
                        name={student.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 border border-gray-200"
                        textClassName="text-xs sm:text-sm font-bold text-[#4493AC]"
                        bgClassName="bg-[#D4E8ED]"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
                          {student.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-gray-500 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 sm:py-4 px-3 sm:px-6 hidden sm:table-cell">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#7DD3C0] to-[#4493AC] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#EAF4F7] text-[#4493AC] font-bold text-xs sm:text-sm whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{student.total_hours}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;
