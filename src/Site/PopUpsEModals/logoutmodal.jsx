'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
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
        {/* Faixa superior colorida */}
        <div className="h-2 bg-gradient-to-r from-[#4493AC] to-[#243D6D]" />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-[#EAF4F8] flex items-center justify-center mb-5">
            <LogOut className="w-8 h-8 text-[#4493AC]" />
          </div>

          <h2 className="text-2xl font-bold text-[#243D6D] mb-2">Sair da conta</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Tem certeza que deseja encerrar sua sessão?<br />
            Você precisará fazer login novamente para acessar o sistema.
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
              className="flex-1 py-3 rounded-xl bg-[#243D6D] text-white font-semibold
                         hover:bg-[#1a2e55] transition-colors text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;