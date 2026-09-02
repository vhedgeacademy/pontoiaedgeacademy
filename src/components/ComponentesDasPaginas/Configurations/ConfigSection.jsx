'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ConfigCard from './ConfigCard';
import { AdicionarItemModal } from '@/Site/PopUpsEModals/Configmodals';
import { getApiBase } from '@/config/api';

const ConfigSection = ({ title, endpoint, tipoItem = 'item', refreshKey, onUpdate }) => {
  const [items, setItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${getApiBase()}/${endpoint}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.map(item => ({ id: item.id, title: item.name, count: item.student_count || 0 })));
      }
    } catch (e) {
      console.error(`Erro ao buscar ${endpoint}:`, e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (endpoint) fetchItems();
  }, [endpoint, refreshKey]);


  const getEmptyMessage = () => {
    switch (title.toLowerCase()) {
      case 'turmas':
        return 'Nenhuma turma cadastrada';
      case 'cargos':
        return 'Nenhum cargo cadastrado';
      case 'cursos':
        return 'Nenhum curso cadastrado';
      default:
        return 'Nenhum item cadastrado';
    }
  };

  const handleAddItem = async (nome) => {
    try {
      const res = await fetch(`${getApiBase()}/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: nome })
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems([...items, { id: newItem.id, title: newItem.name, count: 0 }]);
        onUpdate?.();
      }
    } catch (e) {
      console.error(`Erro ao criar em ${endpoint}:`, e);
    }
  };

  const handleRenameItem = async (index, id, novoNome, studentIds) => {
    try {
      let renameOk = true;
      let syncOk = true;

      if (novoNome) {
        const resRename = await fetch(`${getApiBase()}/${endpoint}/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ name: novoNome })
        });
        renameOk = resRename.ok;
      }

      if (studentIds !== undefined && studentIds !== null) {
        const sanitizedIds = studentIds.map(Number).filter(n => !isNaN(n));
        const resSync = await fetch(`${getApiBase()}/${endpoint}/${id}/students`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ student_ids: sanitizedIds })
        });
        syncOk = resSync.ok;
      }

      if (!renameOk || !syncOk) {
        console.error(`Erro: Alguma das requisições de atualização falhou em ${endpoint}`);
        throw new Error(`Falha ao salvar atualizações em ${endpoint}`);
      }

      // Refaz o fetch completo: os contadores de alunos só ficam corretos vindo do backend.
      await fetchItems();
      onUpdate?.();
    } catch (e) {
      console.error(`Erro ao atualizar em ${endpoint}:`, e);
      throw e;
    }
  };

  const handleRemoveItem = async (index, id) => {
    try {
      const res = await fetch(`${getApiBase()}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
        onUpdate?.();
      }
    } catch (e) {
      console.error(`Erro ao deletar em ${endpoint}:`, e);
    }
  };


  return (
    <>
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>

        {/* Botão Adicionar */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 mb-3 hover:border-gray-400 hover:bg-gray-100 transition-colors flex items-center justify-center bg-transparent"
        >
          <Plus className="w-6 h-6 text-gray-400" />
        </button>

        {/* Lista de Cards ou Estado Vazio */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">Carregando...</div>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <ConfigCard
                key={item.id || index}
                id={item.id}
                title={item.title}
                count={item.count}
                tipoItem={tipoItem}
                onEdit={(novoNome, studentIds) => handleRenameItem(index, item.id, novoNome, studentIds)}
                onDelete={() => handleRemoveItem(index, item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-gray-400">
            <p className="text-sm font-medium">{getEmptyMessage()}</p>
          </div>
        )}
      </div>

      {/* Modal Adicionar */}
      <AdicionarItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddItem}
        tipoItem={tipoItem}
      />
    </>
  );
};

export default ConfigSection;