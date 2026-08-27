'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import FormInput from '@/components/ComponentesDasPaginas/AddUser/FormInput';
import FormSelect from '@/components/ComponentesDasPaginas/AddUser/FormSelect';
import { getApiBase } from '@/config/api';

const EditarPerfilModal = ({ isOpen, onClose, alunoInfo, onSaved }) => {
  const sp = alunoInfo?.rawUser?.student_profile || {};
  const userId = alunoInfo?.rawUser?.id;
  
  const [formData, setFormData] = useState({
    nomeCompleto: alunoInfo?.nome || '',
    semestre: sp.ano_ingresso?.toString() || '',
    semestreNumero: sp.semestre?.toString() || '',
    cargo: sp.cargo_id?.toString() || '',
    curso: sp.curso_id?.toString() || '',
    turma: sp.turma_id?.toString() || '',
    trilha: sp.trilha || '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen && alunoInfo) {
      const p = alunoInfo.rawUser?.student_profile || {};
      setFormData({
        nomeCompleto: alunoInfo.nome || '',
        semestre: p.ano_ingresso?.toString() || '',
        semestreNumero: p.semestre?.toString() || '',
        cargo: p.cargo_id?.toString() || '',
        curso: p.curso_id?.toString() || '',
        turma: p.turma_id?.toString() || '',
        trilha: p.trilha || '',
      });
      setErrorMsg('');
    }
  }, [isOpen, alunoInfo]);

  const semestreNumeroOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const cargoOptions = (alunoInfo?.rawCargos || []).map(c => ({
    value: c.id.toString(), label: c.name
  }));

  const cursoOptions = (alunoInfo?.rawCursos || []).map(c => ({
    value: c.id.toString(), label: c.name
  }));

  const turmaOptions = (alunoInfo?.rawTurmas || []).map(t => ({
    value: t.id.toString(), label: t.name
  }));

  const trilhas = [
    { value: 'Software', label: 'Desenvolvimento de Software' },
    { value: 'Automação', label: 'Automação Industrial' },
    { value: 'IA', label: 'Inteligência Artificial' },
    { value: 'Embarcados', label: 'Sistemas Embarcados' }
  ];

  const handleSave = async () => {
    if (!userId) {
      onClose();
      return;
    }

    setSaving(true);
    setErrorMsg('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const academicPayload = {
        turma_id: formData.turma ? parseInt(formData.turma) : null,
        cargo_id: formData.cargo ? parseInt(formData.cargo) : null,
        curso_id: formData.curso ? parseInt(formData.curso) : null,
        trilha: formData.trilha || null,
        ano_ingresso: formData.semestre ? parseInt(formData.semestre) : null,
        semestre: formData.semestreNumero ? parseInt(formData.semestreNumero) : null,
      };

      const academicRes = await fetch(`${getApiBase()}/users/${userId}/academic`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(academicPayload)
      });

      // 2. Atualizar nome se modificado
      if (formData.nomeCompleto && formData.nomeCompleto !== alunoInfo.nome) {
        await fetch(`${getApiBase()}/users/${userId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name: formData.nomeCompleto })
        });
      }

      if (academicRes.ok) {
        onSaved?.();
        onClose();
      } else {
        const err = await academicRes.json();
        setErrorMsg(err.detail || 'Erro ao salvar alterações.');
      }
    } catch (e) {
      console.error('Erro ao salvar:', e);
      setErrorMsg('Erro de conexão ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Overlay sombreado */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-500 z-10">
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4493AC]">Editar Perfil</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-4 sm:space-y-6">
            {/* Nome Completo */}
            <div className="grid w-full">
              <FormInput
              label="Nome Completo"
              value={formData.nomeCompleto}
              onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
              placeholder="Walber Luis Santos da Paixão"
            />
            </div>
            

            {/* Semestre de Entrada e Semestre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Semestre de Entrada"
                value={formData.semestre}
                onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                placeholder="2023"
              />
              
              <FormSelect
                label="Semestre"
                value={formData.semestreNumero}
                onChange={(e) => setFormData({ ...formData, semestreNumero: e.target.value })}
                options={semestreNumeroOptions}
                placeholder="01"
              />
            </div>

            {/* Cargo e Curso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                options={cargoOptions}
                placeholder="Aluno de Graduação III"
              />

              <FormSelect
                label="Curso"
                value={formData.curso}
                onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                options={cursoOptions}
                placeholder="Ciência da Computação"
              />
            </div>

            {/* Turma e trilha*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
              label="Turma"
              value={formData.turma}
              onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
              options={turmaOptions}
              placeholder="Selecione a turma"
            /> 

            <FormSelect
              label="Trilha"
              value={formData.trilha}
              onChange={(e) => setFormData({ ...formData, trilha: e.target.value })}
              options={trilhas}
              placeholder="Selecione a trilha"
              ></FormSelect>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Botão Salvar */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-12 py-3 border-2 border-gray-300 text-green-600 font-semibold rounded-lg hover:bg-[#243D6D] hover:text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilModal;