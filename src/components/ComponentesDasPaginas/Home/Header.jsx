'use client';

import React, { useState, useEffect } from 'react';
import UserAvatar from '@/components/UserAvatar';

const Header = ({ presenceCount, title }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('ponto_ai_user');
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const displayTitle =
    title ||
    (presenceCount !== null && presenceCount !== undefined
      ? `${presenceCount} ${presenceCount === 1 ? 'pessoa' : 'pessoas'} no Academy`
      : userData
      ? `Olá, ${userData.name ? userData.name.split(' ')[0] : 'Usuário'}`
      : 'Home');

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#4493AC] tracking-tight">
          {displayTitle}
        </h1>
        {presenceCount !== null && presenceCount !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Em tempo real
          </span>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-3 md:gap-4 self-end md:self-auto">
        <div className="flex flex-col items-end">
          <span className="text-base md:text-lg font-semibold text-gray-800">{userData?.name || 'Carregando...'}</span>
          <span className="text-xs md:text-sm text-gray-500">{userData?.admin ? 'Administrador' : 'Estudante'}</span>
        </div>
        <UserAvatar
          src={userData?.profile_image}
          name={userData?.name}
          className="w-12 h-12 md:w-14 md:h-14 shadow-sm border border-gray-200"
          bgClassName="bg-gray-200 text-gray-600"
          textClassName="font-bold text-xl md:text-2xl"
        />
      </div>
    </div>
  );
};

export default Header;