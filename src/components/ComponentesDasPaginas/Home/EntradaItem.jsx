'use client';

import React from 'react';
import UserAvatar from '@/components/UserAvatar';

const EntradaItem = ({ nome, hora, foto, tipo, camera, onClick }) => {
  const isSaida = tipo === 'Saída';

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-3.5 sm:px-6 py-3 sm:py-4 mb-3 transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-md active:scale-[0.99]' : ''
      } ${isSaida ? 'bg-[#FBE8E8]' : 'bg-[#D4E8ED]'}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
        <UserAvatar
          src={foto}
          name={nome}
          className="w-9 h-9 sm:w-10 sm:h-10 shadow-sm"
          bgClassName="bg-white text-gray-700"
          textClassName="font-bold text-xs sm:text-sm"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none">{nome}</span>
          {camera && <span className="text-[11px] sm:text-xs text-gray-500 truncate">{camera}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`px-3 sm:px-4 py-1 sm:py-1.5 text-white rounded-full text-xs sm:text-sm font-medium shadow-sm whitespace-nowrap ${
            isSaida ? 'bg-[#C0392B]' : 'bg-[#2C3E50]'
          }`}
        >
          {hora}
        </span>
      </div>
    </div>
  );
};

export default EntradaItem;