'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import FormInput from '@/components/ComponentesDasPaginas/AddUser/FormInput';
import FormSelect from '@/components/ComponentesDasPaginas/AddUser/FormSelect';
import ToggleSwitch from '@/components/ComponentesDasPaginas/AddUser/ToggleSwitch';
import { getApiBase } from '@/config/api';

const TRILHA_OPTIONS = [
  { value: 'Software', label: 'Desenvolvimento de Software' },
  { value: 'Automação', label: 'Automação Industrial' },
  { value: 'IA', label: 'Inteligência Artificial' },
  { value: 'Embarcados', label: 'Sistemas Embarcados' },
];

const SEMESTRE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const INITIAL_FORM_DATA = {
  nomeCompleto: '',
  email: '',
  isAdmin: false,
  matricula: '',
  anoIngresso: '',
  semestreNumero: '',
  turma: '',
  cargo: '',
  curso: '',
  trilha: '',
};

const CadastrarUsuarioModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [turmaOptions, setTurmaOptions] = useState([]);
  const [cargoOptions, setCargoOptions] = useState([]);
  const [cursoOptions, setCursoOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      try {
        const [turmasRes, cargosRes, cursosRes] = await Promise.all([
          fetch(`${getApiBase()}/turmas`, { headers }),
          fetch(`${getApiBase()}/cargos`, { headers }),
          fetch(`${getApiBase()}/cursos`, { headers }),
        ]);

        if (turmasRes.ok) {
          const data = await turmasRes.json();
          setTurmaOptions(data.map((item) => ({ value: item.id.toString(), label: item.name })));
        }
        if (cargosRes.ok) {
          const data = await cargosRes.json();
          setCargoOptions(data.map((item) => ({ value: item.id.toString(), label: item.name })));
        }
        if (cursosRes.ok) {
          const data = await cursosRes.json();
          setCursoOptions(data.map((item) => ({ value: item.id.toString(), label: item.name })));
        }
      } catch (error) {
        console.error('Erro ao buscar dados auxiliares:', error);
      }
    };

    fetchOptions();
    setStatusMessage(null);
    setFormData(INITIAL_FORM_DATA);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setStatusMessage(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Sessão expirada ou não autenticado como Administrador.' });
      return;
    }

    if (!formData.nomeCompleto || !formData.email) {
      setStatusMessage({ type: 'error', text: 'Nome e e-mail são obrigatórios.' });
      return;
    }

    const payload = {
      name: formData.nomeCompleto,
      email: formData.email,
      admin: formData.isAdmin,
    };

    if (!formData.isAdmin) {
      if (!formData.matricula || formData.matricula.length < 7 || formData.matricula.length > 20 || !/^\d+$/.test(formData.matricula)) {
        setStatusMessage({ type: 'error', text: 'A matrícula deve conter entre 7 e 20 dígitos numéricos.' });
        return;
      }
      if (formData.anoIngresso && parseInt(formData.anoIngresso, 10) < 2000) {
        setStatusMessage({ type: 'error', text: 'O ano de ingresso deve ser igual ou superior a 2000.' });
        return;
      }
      payload.student_profile = {
        matricula: formData.matricula,
        ano_ingresso: formData.anoIngresso ? parseInt(formData.anoIngresso, 10) : null,
        semestre: formData.semestreNumero ? parseInt(formData.semestreNumero, 10) : null,
        turma_id: formData.turma ? parseInt(formData.turma, 10) : null,
        cargo_id: formData.cargo ? parseInt(formData.cargo, 10) : null,
        curso_id: formData.curso ? parseInt(formData.curso, 10) : null,
        trilha: formData.trilha || null,
      };
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBase()}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setStatusMessage({
          type: 'success',
          text: 'Usuário registrado com sucesso! A senha inicial padrão é "sejabemvindo".',
        });
        setFormData(INITIAL_FORM_DATA);
        if (onUserCreated) {
          onUserCreated(createdUser);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        const errorData = await response.json();
        let errorMessage = 'Erro ao registrar usuário.';

        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err) => {
              if (err.loc && err.loc.includes('email')) return 'O e-mail deve pertencer ao domínio @edge.ufal.br.';
              if (err.loc && err.loc.includes('ano_ingresso')) return 'O ano de ingresso deve ser igual ou superior a 2000.';
              return err.msg;
            })
            .join(' ');
        }

        setStatusMessage({ type: 'error', text: errorMessage });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-4 sm:my-8 overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Faixa superior */}
        <div className="h-2 bg-gradient-to-r from-[#4493AC] to-[#243D6D]" />

        {/* Cabeçalho */}
        <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EAF4F8] flex items-center justify-center text-[#4493AC] shrink-0">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#243D6D]">Cadastrar Usuário</h2>
              <p className="text-xs text-gray-500">Preencha os dados cadastrais para adicionar um novo usuário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-4 sm:p-8 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto space-y-5 sm:space-y-6">
          {statusMessage && (
            <div
              className={`p-4 rounded-xl font-medium text-sm border ${
                statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Dados Gerais */}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 sm:col-span-5">
              <FormInput
                label="Nome Completo"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>

            <div className="col-span-12 sm:col-span-5">
              <FormInput
                label="E-mail Institucional"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@edge.ufal.br"
              />
            </div>

            <div className="col-span-12 sm:col-span-2">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">É Admin?</label>
                <div className="flex items-center h-[42px]">
                  <ToggleSwitch
                    checked={formData.isAdmin}
                    onChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção Aluno */}
          {!formData.isAdmin && (
            <div className="pt-6 border-t border-gray-100 space-y-5">
              <h3 className="text-lg font-bold text-[#4493AC]">Perfil do Estudante</h3>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 sm:col-span-6">
                  <FormInput
                    label="Matrícula"
                    maxLength="20"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value.replace(/\D/g, '') })}
                    placeholder="Matrícula"
                  />
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <FormInput
                    label="Ano de Ingresso"
                    type="number"
                    min="2000"
                    value={formData.anoIngresso}
                    onChange={(e) => setFormData({ ...formData, anoIngresso: e.target.value })}
                    placeholder="Ex: 2024"
                  />
                </div>

                <div className="col-span-12 sm:col-span-3">
                  <FormSelect
                    label="Semestre"
                    value={formData.semestreNumero}
                    onChange={(e) => setFormData({ ...formData, semestreNumero: e.target.value })}
                    options={SEMESTRE_OPTIONS}
                    placeholder="--"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <FormSelect
                  label="Turma"
                  value={formData.turma}
                  onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                  options={turmaOptions}
                  placeholder="--"
                />

                <FormSelect
                  label="Cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  options={cargoOptions}
                  placeholder="Selecione o cargo"
                />

                <FormSelect
                  label="Curso"
                  value={formData.curso}
                  onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                  options={cursoOptions}
                  placeholder="Selecione o curso"
                />

                <FormSelect
                  label="Trilha"
                  value={formData.trilha}
                  onChange={(e) => setFormData({ ...formData, trilha: e.target.value })}
                  options={TRILHA_OPTIONS}
                  placeholder="Selecione a trilha"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé / Ações */}
        <div className="px-8 py-5 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-2.5 rounded-xl text-white font-semibold shadow-sm transition-all text-sm ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#4493AC] hover:bg-[#243D6D]'
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadastrarUsuarioModal;
