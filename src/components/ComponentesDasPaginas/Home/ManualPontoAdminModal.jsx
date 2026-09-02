'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Clock, Calendar, Camera, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

const ManualPontoAdminModal = ({ item, onClose, onStatusChange, loadingAction }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!item) return null;

  const isEntrada = item.event_type === 'Entrada';
  const fotoExibicao = item.image_base64
    ? item.image_base64.startsWith('data:')
      ? item.image_base64
      : `data:image/jpeg;base64,${item.image_base64}`
    : null;

  const fotoPerfil = item.user_profile_image;

  const dataFormatada = item.created_at
    ? new Date(item.created_at).toLocaleDateString('pt-BR')
    : 'Hoje';

  const horarioFormatado = item.created_at
    ? new Date(item.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                isEntrada
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {item.event_type || 'Ponto Manual'}
            </span>
            <h3 id="manual-modal-title" className="text-lg font-bold text-gray-800">
              Validação de Ponto Manual
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Dados do usuário */}
          <div className="flex items-center gap-4 p-4 bg-[#F4F9FB] rounded-2xl border border-[#D4E8ED]">
            <UserAvatar
              src={fotoPerfil}
              name={item.user_name}
              className="w-14 h-14 border-2 border-white shadow-xs"
              bgClassName="bg-[#D4E8ED] text-[#4493AC]"
              textClassName="font-bold text-xl"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {item.user_name || 'Aluno'}
              </h4>
              <p className="text-xs text-gray-500 truncate">{item.user_email || 'Email não informado'}</p>
              {item.user_matricula && (
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Matrícula: {item.user_matricula}
                </p>
              )}
            </div>
          </div>

          {/* Grade de detalhes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Clock className="w-5 h-5 text-[#4493AC] shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Horário da Foto</p>
                <p className="text-sm font-semibold text-gray-800">{horarioFormatado}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Calendar className="w-5 h-5 text-[#4493AC] shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Data do Envio</p>
                <p className="text-sm font-semibold text-gray-800">{dataFormatada}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
              <Camera className="w-5 h-5 text-[#4493AC] shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Status Atual</p>
                  <p className="text-sm font-bold capitalize text-gray-800">{item.status}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    item.status === 'aprovado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'reprovado' || item.status === 'recusado'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          {/* Foto do terminal Intelbras enviada pelo aluno */}
          {fotoExibicao && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Foto do Dispositivo Intelbras Enviada pelo Aluno
              </p>
              <div className="w-full h-64 bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                <img
                  src={fotoExibicao}
                  alt="Terminal Intelbras"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com botões de transição de status */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {/* Botão Reprovar */}
            <button
              onClick={() => onStatusChange(item.id, 'reprovado')}
              disabled={loadingAction || item.status === 'reprovado'}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Reprovar
            </button>

            {/* Botão Pendente */}
            <button
              onClick={() => onStatusChange(item.id, 'pendente')}
              disabled={loadingAction || item.status === 'pendente'}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4" />
              Pendente
            </button>

            {/* Botão Aprovar */}
            <button
              onClick={() => onStatusChange(item.id, 'aprovado')}
              disabled={loadingAction || item.status === 'aprovado'}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPontoAdminModal;
