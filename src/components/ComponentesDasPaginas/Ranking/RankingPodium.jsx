'use client';

import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const RankingPodium = ({ top3 = [] }) => {
  if (!top3 || top3.length === 0) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const renderCard = (student, rank) => {
    if (!student) return null;

    let rankLabel = '';
    let badgeColor = '';
    let borderColor = '';
    let icon = null;
    let heightClass = '';

    if (rank === 1) {
      rankLabel = '1º Lugar';
      badgeColor = 'bg-amber-400 text-amber-950 font-bold';
      borderColor = 'border-amber-400 shadow-amber-100';
      icon = <Trophy className="w-6 h-6 text-amber-500" />;
      heightClass = 'order-1 md:order-2 md:-mt-4';
    } else if (rank === 2) {
      rankLabel = '2º Lugar';
      badgeColor = 'bg-slate-300 text-slate-800 font-bold';
      borderColor = 'border-slate-300 shadow-slate-100';
      icon = <Medal className="w-6 h-6 text-slate-400" />;
      heightClass = 'order-2 md:order-1';
    } else {
      rankLabel = '3º Lugar';
      badgeColor = 'bg-amber-700 text-amber-100 font-bold';
      borderColor = 'border-amber-600 shadow-amber-50';
      icon = <Award className="w-6 h-6 text-amber-700" />;
      heightClass = 'order-3 md:order-3';
    }

    return (
      <div
        key={student.id}
        className={`flex-1 min-w-[240px] max-w-sm bg-white rounded-3xl p-6 border-2 ${borderColor} shadow-lg flex flex-col items-center text-center transition-transform hover:-translate-y-1 ${heightClass}`}
      >
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className={`px-3 py-1 text-xs rounded-full ${badgeColor}`}>
            {rankLabel}
          </span>
        </div>

        <div className="relative mb-3">
          <UserAvatar
            src={student.profile_image}
            name={student.name}
            className={`w-20 h-20 border-4 ${
              rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-slate-300' : 'border-amber-600'
            }`}
            bgClassName={`bg-gray-100 ${
              rank === 1 ? 'text-amber-600' : rank === 2 ? 'text-slate-600' : 'text-amber-800'
            }`}
            textClassName="text-2xl font-bold"
          />
        </div>

        <h3 className="font-bold text-gray-800 text-lg line-clamp-1 mb-1" title={student.name}>
          {student.name}
        </h3>
        <p className="text-xs text-gray-500 truncate max-w-[200px] mb-4">
          {student.email}
        </p>

        <div className="mt-auto w-full bg-[#EAF4F7] rounded-2xl py-2 px-4 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-600 font-medium">Tempo:</span>
          <span className="text-lg font-bold text-[#4493AC]">{student.total_hours} h</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 my-6 w-full">
      {second && renderCard(second, 2)}
      {first && renderCard(first, 1)}
      {third && renderCard(third, 3)}
    </div>
  );
};

export default RankingPodium;
