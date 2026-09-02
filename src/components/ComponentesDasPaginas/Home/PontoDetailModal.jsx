'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Clock, Calendar, Camera, User } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const PontoDetailModal = ({ ponto, onClose }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!ponto) return null;

  const isEntrada = ponto.event_type === 'Entrada';

  // Foto do Facedoor / Snapshot do Terminal Facial capturada durante o match
  const fotoFacedoor =
    ponto.foto_base64
      ? ponto.foto_base64.startsWith('data:')
        ? ponto.foto_base64
        : `data:image/jpeg;base64,${ponto.foto_base64}`
      : null;

  // Foto de perfil exclusiva para o Avatar do usuário
  const fotoPerfil = ponto.photo_url || ponto.foto || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                isEntrada
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {ponto.event_type || 'Ponto'}
            </span>
            <h3 id="modal-title" className="text-lg font-bold text-gray-800">Detalhes do Registro</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Dados do usuário */}
          <div className="flex items-center gap-4 p-4 bg-[#F4F9FB] rounded-2xl border border-[#D4E8ED]">
            <UserAvatar
              src={fotoPerfil}
              name={ponto.nome}
              className="w-16 h-16 border-2 border-white shadow"
              bgClassName="bg-[#D4E8ED] text-[#4493AC]"
              textClassName="font-bold text-2xl"
            />
            <div>
              <h4 className="text-lg font-bold text-gray-900">{ponto.nome || 'Aluno'}</h4>
              <p className="text-xs text-gray-500">ID Usuário: {ponto.user_id || 'N/A'}</p>
            </div>
          </div>

          {/* Grade de detalhes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Clock className="w-5 h-5 text-[#4493AC]" />
              <div>
                <p className="text-xs text-gray-400">Horário</p>
                <p className="text-sm font-semibold text-gray-800">{ponto.horario || ponto.hora || '--:--'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Calendar className="w-5 h-5 text-[#4493AC]" />
              <div>
                <p className="text-xs text-gray-400">Data</p>
                <p className="text-sm font-semibold text-gray-800">{ponto.data || 'Hoje'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
              <Camera className="w-5 h-5 text-[#4493AC]" />
              <div>
                <p className="text-xs text-gray-400">Câmera / Local</p>
                <p className="text-sm font-semibold text-gray-800">{ponto.camera_id || 'Ponto Manual / Webcam'}</p>
              </div>
            </div>
          </div>

          {/* Prévia da foto do Facedoor / Terminal Facial */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Foto do Reconhecimento / Registro
            </p>
            {fotoFacedoor ? (
              <div className="w-full h-56 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                <img
                  src={fotoFacedoor}
                  alt="Foto do Reconhecimento Facial (Facedoor)"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
                <Camera className="w-6 h-6 text-gray-300" />
                <span className="text-xs font-medium text-gray-500">
                  Nenhuma captura facial transmitida pelo terminal
                </span>
                <span className="text-[11px] text-gray-400">
                  O ponto foi autenticado via ID no terminal facial.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#4493AC] hover:bg-[#36798e] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PontoDetailModal;
