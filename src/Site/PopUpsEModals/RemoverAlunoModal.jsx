'use client';

import React from 'react';
import { UserX } from 'lucide-react';

const RemoverAlunoModal = ({ isOpen, onClose, onConfirm, nomeAluno, titulo = 'Remover Aluno', tipoUsuario = 'aluno' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Faixa superior vermelha */}
        <div className="h-2 bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <UserX className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">{titulo}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Tem certeza que deseja remover{' '}
            <span className="font-semibold text-gray-700">{nomeAluno}</span>?
          </p>
          <p className="text-gray-400 text-xs mb-8">
            Ao confirmar, o {tipoUsuario} será desligado do sistema e seus dados desativados.
          </p>

          {/* Botões */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold
                         hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold
                         hover:bg-red-600 transition-colors text-sm"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoverAlunoModal;