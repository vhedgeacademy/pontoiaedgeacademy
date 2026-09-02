'use client';

import React from 'react';
import EntradaItem from './EntradaItem';
import { LogOut } from 'lucide-react';

const UltimasSaidas = ({ saidas, onSelectPonto }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-[#E67E22] mb-6">Últimas Saídas</h3>
      
      {saidas && saidas.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm text-gray-500 pl-6">Aluno</span>
            <span className="text-sm text-gray-500 pr-10">Horário</span>
          </div>

          <div>
            {saidas.slice(0, 5).map((saida, index) => (
              <EntradaItem
                key={saida.id || index}
                nome={saida.nome}
                hora={saida.horario || saida.hora}
                foto={saida.foto_base64 || saida.imagem || saida.photo_url || saida.foto}
                camera={saida.camera_id}
                tipo="Saída"
                onClick={() => onSelectPonto && onSelectPonto(saida)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6">
          <div className="w-12 h-12 bg-[#FDEBD0] rounded-full flex items-center justify-center mb-3 text-[#E67E22]">
            <LogOut className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-gray-700">Sem registros de saída hoje</p>
          <p className="text-xs text-gray-400 mt-1 text-center max-w-sm">
            Nenhum aluno registrou saída nas últimas horas.
          </p>
        </div>
      )}
    </div>
  );
};

export default UltimasSaidas;
