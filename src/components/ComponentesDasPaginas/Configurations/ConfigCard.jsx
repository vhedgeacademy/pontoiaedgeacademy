'use client';

import React, { useState } from 'react';
import { Users, Edit2, Trash2 } from 'lucide-react';
import { ExcluirItemModal, EditarItemModal, AvisoExcluirModal } from '@/Site/PopUpsEModals/Configmodals';

const ConfigCard = ({ id, title, count, tipoItem = 'item', onEdit, onDelete }) => {
  const [excluirOpen, setExcluirOpen] = useState(false);
  const [avisoOpen, setAvisoOpen] = useState(false);
  const [editarOpen,  setEditarOpen]  = useState(false);

  const handleConfirmDelete = () => {
    onDelete?.();
    setExcluirOpen(false);
  };

  const handleConfirmEdit = (novoNome, vinculadosIds) => {
    onEdit?.(novoNome, vinculadosIds);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-md transition-shadow flex items-center justify-between gap-3">
        {/* Esquerda: Nome (truncado), Lápis, Lixeira */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800" title={title}>
            {title.length > 16 ? title.slice(0, 16) + '...' : title}
          </h3>
          <button
            onClick={() => setEditarOpen(true)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Gerenciar alunos e editar"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => {
              if (count > 0) {
                setAvisoOpen(true);
              } else {
                setExcluirOpen(true);
              }
            }}
            className="p-1 hover:bg-red-50 rounded-md transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Direita: Quantidade de alunos */}
        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">{count}</span>
        </div>
      </div>

      {/* Modal aviso excluir */}
      <AvisoExcluirModal
        isOpen={avisoOpen}
        onClose={() => setAvisoOpen(false)}
        nomeItem={title}
        tipoItem={tipoItem}
      />

      {/* Modal excluir */}
      <ExcluirItemModal
        isOpen={excluirOpen}
        onClose={() => setExcluirOpen(false)}
        onConfirm={handleConfirmDelete}
        nomeItem={title}
        tipoItem={tipoItem}
      />

      {/* Modal editar */}
      <EditarItemModal
        isOpen={editarOpen}
        onClose={() => setEditarOpen(false)}
        onConfirm={handleConfirmEdit}
        nomeAtual={title}
        tipoItem={tipoItem}
        entityId={id}
      />
    </>
  );
};

export default ConfigCard;