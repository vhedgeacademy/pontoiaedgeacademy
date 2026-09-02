'use client';

import React, { useState } from 'react';
import { Trash2, X, Pencil, Plus } from 'lucide-react';
import { getApiBase } from '@/config/api';

// ─── Modal de EXCLUIR ─────────────────────────────────────────────────────────
export const AvisoExcluirModal = ({ isOpen, onClose, nomeItem, tipoItem = 'item' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-5">
            <Trash2 className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Não é possível excluir</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            A(o) {tipoItem} <span className="font-semibold text-gray-700">"{nomeItem}"</span> possui alunos vinculados.
            <br /><br />
            É preciso retirar todos os alunos para deletar.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExcluirItemModal = ({ isOpen, onClose, onConfirm, nomeItem, tipoItem = 'item' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-8 flex flex-col items-center text-center">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Excluir {tipoItem}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Tem certeza que deseja excluir{' '}
            <span className="font-semibold text-gray-700">"{nomeItem}"</span>?
            <br />
            Esta ação não poderá ser desfeita.
          </p>

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
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de EDITAR (Gerenciador de Alunos) ─────────────────────────────────────────────────────────
export const EditarItemModal = ({ isOpen, onClose, onConfirm, nomeAtual, tipoItem = 'item', entityId }) => {
  const [novoNome, setNovoNome] = useState(nomeAtual ?? '');
  const [alunosGlobais, setAlunosGlobais] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [vinculadosIds, setVinculadosIds] = useState([]);

  React.useEffect(() => {
    if (isOpen && entityId) {
      setNovoNome(nomeAtual ?? '');
      setSearchTerm('');
      setErrorMsg('');
      
      const fetchAlunos = async () => {
        try {
          const token = localStorage.getItem('ponto_ai_token');
          const res = await fetch(`${getApiBase()}/users/students`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setAlunosGlobais(data);

            const initiallyVinculados = data
              .filter(a => Number(a.student_profile?.[`${tipoItem}_id`]) === Number(entityId))
              .map(a => Number(a.id));
            setVinculadosIds(initiallyVinculados);
          }
        } catch (e) {
          console.error("Erro ao buscar alunos globais", e);
        }
      };
      
      fetchAlunos();
    }
  }, [isOpen, entityId, nomeAtual, tipoItem]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (novoNome.trim()) {
      setSaving(true);
      setErrorMsg('');
      try {
        await onConfirm?.(novoNome.trim(), vinculadosIds.map(Number));
        onClose();
      } catch (err) {
        console.error("Erro ao salvar alterações:", err);
        setErrorMsg('Erro ao salvar alterações da entidade.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAdd = (alunoId) => {
    const numId = Number(alunoId);
    if (!vinculadosIds.includes(numId)) {
      setVinculadosIds([...vinculadosIds, numId]);
    }
  };

  const handleRemove = (alunoId) => {
    const numId = Number(alunoId);
    setVinculadosIds(vinculadosIds.filter(id => id !== numId));
  };

  const vinculados = alunosGlobais.filter(a => vinculadosIds.includes(Number(a.id)));

  // Disponíveis para vincular: alunos sem entidade deste tipo, ou que pertenciam
  // a esta entidade e foram desvinculados no modal (podem ser readicionados).
  // Alunos vinculados a OUTRA entidade do mesmo tipo ficam de fora de propósito.
  const disponiveis = alunosGlobais.filter(a => {
    if (vinculadosIds.includes(Number(a.id))) return false;
    if (Number(a.student_profile?.[`${tipoItem}_id`]) === Number(entityId)) return true;
    return a.student_profile?.[`${tipoItem}_id`] === null || a.student_profile?.[`${tipoItem}_id`] === undefined;
  });

  const disponiveisFiltrados = disponiveis.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="h-2 bg-gradient-to-r from-[#4493AC] to-[#243D6D] shrink-0" />

        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAF4F8] flex items-center justify-center">
                <Pencil className="w-5 h-5 text-[#4493AC]" />
              </div>
              <h2 className="text-xl font-bold text-[#243D6D]">Editar {tipoItem}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Campo Renomear */}
          <div className="mb-4 shrink-0">
            <label className="text-sm text-gray-500 mb-1 block">Nome do {tipoItem}</label>
            <input
              type="text"
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4493AC] transition-colors text-gray-800"
            />
          </div>

          {errorMsg && (
            <div className="p-3 mb-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200 shrink-0">
              {errorMsg}
            </div>
          )}

          {/* Listas de Alunos */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
            
            {/* Vinculados */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Alunos Vinculados ({vinculados.length})</h3>
              <div className="space-y-2">
                {vinculados.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum aluno vinculado.</p>
                ) : (
                  vinculados.map(aluno => (
                    <div key={aluno.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700 font-medium truncate pr-2">{aluno.name}</span>
                      <button onClick={() => handleRemove(aluno.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Adicionar (Pesquisa) */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Vincular Aluno</h3>
              <input
                type="text"
                placeholder="Pesquisar alunos sem vínculo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4493AC] text-sm"
              />
              <div className="space-y-2 overflow-y-auto max-h-40">
                {disponiveisFiltrados.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum aluno disponível encontrado.</p>
                ) : (
                  disponiveisFiltrados.map(aluno => (
                    <div key={aluno.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-[#4493AC] transition-colors">
                      <span className="text-sm text-gray-700 font-medium truncate pr-2">{aluno.name}</span>
                      <button onClick={() => handleAdd(aluno.id)} className="text-[#4493AC] hover:text-[#2a5b6b] p-1 hover:bg-blue-50 rounded transition-colors shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="flex gap-3 shrink-0">
            <button onClick={onClose} disabled={saving} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={handleConfirm} disabled={!novoNome.trim() || saving} className="flex-1 py-3 rounded-xl bg-[#4493AC] text-white font-semibold hover:bg-[#357a96] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de ADICIONAR ──────────────────────────────────────────────────────
export const AdicionarItemModal = ({ isOpen, onClose, onConfirm, tipoItem = 'item' }) => {
  const [nome, setNome] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (nome.trim()) {
      onConfirm(nome.trim());
      setNome('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#4493AC] to-[#243D6D]" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAF4F8] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#4493AC]" />
              </div>
              <h2 className="text-xl font-bold text-[#243D6D]">Adicionar {tipoItem}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Campo */}
          <div className="mb-6">
            <label className="text-sm text-gray-500 mb-2 block">Nome do(a) {tipoItem}</label>
            <input
              type="text"
              value={nome}
              placeholder={`Ex: Novo(a) ${tipoItem}`}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none
                         focus:border-[#4493AC] transition-colors text-gray-800"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold
                         hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!nome.trim()}
              className="flex-1 py-3 rounded-xl bg-[#4493AC] text-white font-semibold
                         hover:bg-[#357a96] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
