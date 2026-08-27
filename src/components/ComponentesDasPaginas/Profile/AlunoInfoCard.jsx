'use client';

import React, { useState } from 'react';
import { Edit2, BookOpen, Brain, GraduationCap, Download } from 'lucide-react';
import EditarPerfilModal from '@/Site/PopUpsEModals/EditarPerfilModal';
import ExportarBancoHorasModal from '@/Site/PopUpsEModals/ExportarBancoHorasModal';
import UserAvatar from '@/components/UserAvatar';

const AlunoInfoCard = ({ alunoInfo, onSaved }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Foto do perfil (protegida contra exclusão) */}
          <div className="relative shrink-0">
            <UserAvatar
              src={alunoInfo?.rawUser?.profile_image}
              name={alunoInfo?.nome}
              className="w-40 h-40 border-4 border-slate-100 shadow-inner"
              bgClassName="bg-slate-700 text-white"
              textClassName="font-bold text-6xl"
            />
            <button 
              onClick={() => setIsModalOpen(true)}
              title="Editar Informações Cadastrais"
              className="absolute bottom-2 right-2 w-10 h-10 bg-[#4493AC] hover:bg-[#357a96] rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Informações */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-[#243D6D]">{alunoInfo.nome}</h2>
                <span className="px-4 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  {alunoInfo.turma}
                </span>
              </div>

              {/* Botões de Ação: Exportar Banco de Horas e Editar */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#243D6D] hover:bg-[#1a2c4e] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Banco de Horas</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#4493AC] hover:bg-[#357a96] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar Informações</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-600 shrink-0" />
                <span className="text-gray-700">{alunoInfo.curso}</span>
              </div>

              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-gray-600 shrink-0" />
                <span className="text-gray-700">{alunoInfo.especializacao}</span>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-gray-600 shrink-0" />
                <span className="text-gray-700">{alunoInfo.nivel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Editar Perfil */}
      <EditarPerfilModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alunoInfo={alunoInfo}
        onSaved={onSaved}
      />

      {/* Modal de Exportação do Banco de Horas */}
      <ExportarBancoHorasModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        userId={alunoInfo?.rawUser?.id}
        alunoNome={alunoInfo?.nome}
      />
    </>
  );
};

export default AlunoInfoCard;