'use client';

import React from 'react';
import EntradaItem from './EntradaItem';
import { Clock } from 'lucide-react';

const UltimasEntradas = ({ entradas, onSelectPonto }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-[#7DD3C0] mb-6">Últimas Entradas</h3>
      
      {entradas && entradas.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm text-gray-500 pl-6">Aluno</span>
            <span className="text-sm text-gray-500 pr-10">Horário</span>
          </div>

          <div>
            {entradas.slice(0, 5).map((entrada, index) => (
              <EntradaItem
                key={entrada.id || index}
                nome={entrada.nome}
                hora={entrada.horario || entrada.hora}
                foto={entrada.foto_base64 || entrada.imagem || entrada.photo_url || entrada.foto}
                camera={entrada.camera_id}
                tipo="Entrada"
                onClick={() => onSelectPonto && onSelectPonto(entrada)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6">
          <div className="w-12 h-12 bg-[#D4E8ED] rounded-full flex items-center justify-center mb-3 text-[#4493AC]">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-gray-700">Sem registros de ponto hoje</p>
          <p className="text-xs text-gray-400 mt-1 text-center max-w-sm">
            Nenhum aluno registrou entrada nas últimas horas.
          </p>
        </div>
      )}
    </div>
  );
};

export default UltimasEntradas;