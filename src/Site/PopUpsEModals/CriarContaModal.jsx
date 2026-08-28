'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import FormInput from '@/components/ComponentesDasPaginas/AddUser/FormInput';
import FormSelect from '@/components/ComponentesDasPaginas/AddUser/FormSelect';
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

const EDGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@edge\.ufal\.br$/i;

const INITIAL_FORM_DATA = {
  nomeCompleto: '',
  email: '',
  matricula: '',
  anoIngresso: '',
  semestreNumero: '',
  trilha: '',
};

const CriarContaModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setFormData(INITIAL_FORM_DATA);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStatusMessage(null);

    const nome = formData.nomeCompleto.trim();
    const email = formData.email.trim();
    const matricula = formData.matricula.trim();

    if (!nome || !email) {
      setStatusMessage({ type: 'error', text: 'Nome e e-mail institucional são obrigatórios.' });
      return;
    }

    if (!EDGE_EMAIL_REGEX.test(email)) {
      setStatusMessage({ type: 'error', text: 'O e-mail deve pertencer ao domínio @edge.ufal.br.' });
      return;
    }

    if (!matricula || matricula.length < 7 || matricula.length > 20 || !/^\d+$/.test(matricula)) {
      setStatusMessage({ type: 'error', text: 'A matrícula deve conter entre 7 e 20 dígitos numéricos.' });
      return;
    }

    if (formData.anoIngresso && parseInt(formData.anoIngresso, 10) < 2000) {
      setStatusMessage({ type: 'error', text: 'O ano de ingresso deve ser igual ou superior a 2000.' });
      return;
    }

    const payload = {
      name: nome,
      email: email.toLowerCase(),
      admin: false,
      student_profile: {
        matricula: matricula,
        ano_ingresso: formData.anoIngresso ? parseInt(formData.anoIngresso, 10) : null,
        semestre: formData.semestreNumero ? parseInt(formData.semestreNumero, 10) : null,
        turma_id: null,
        cargo_id: null,
        curso_id: null,
        trilha: formData.trilha || null,
      },
    };

    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${getApiBase()}/users/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setStatusMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Sua senha inicial padrão é "sejabemvindo". Faça login para continuar.',
        });
        setFormData(INITIAL_FORM_DATA);
        if (onUserCreated) {
          onUserCreated(createdUser);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        let errorMessage = 'Erro ao criar conta de estudante.';

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
              <h2 className="text-xl sm:text-2xl font-bold text-[#243D6D]">Criar Conta</h2>
              <p className="text-xs text-gray-500">Preencha seus dados para criar sua conta de estudante no Ponto AI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit}>
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

            {/* Dados Pessoais */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6">
                <FormInput
                  label="Nome Completo"
                  value={formData.nomeCompleto}
                  onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <FormInput
                  label="E-mail Institucional (@edge.ufal.br)"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@edge.ufal.br"
                  required
                />
              </div>
            </div>

            {/* Seção Dados do Estudante */}
            <div className="pt-5 border-t border-gray-100 space-y-5">
              <h3 className="text-lg font-bold text-[#4493AC]">Dados Acadêmicos</h3>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 sm:col-span-6">
                  <FormInput
                    label="Matrícula"
                    maxLength="20"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value.replace(/\D/g, '') })}
                    placeholder="Sua matrícula (somente números)"
                    required
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

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 sm:col-span-6">
                  <FormSelect
                    label="Trilha"
                    value={formData.trilha}
                    onChange={(e) => setFormData({ ...formData, trilha: e.target.value })}
                    options={TRILHA_OPTIONS}
                    placeholder="Selecione a trilha"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé / Ações */}
          <div className="px-8 py-5 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-2.5 rounded-xl text-white font-semibold shadow-sm transition-all text-sm cursor-pointer ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#4493AC] hover:bg-[#243D6D]'
              }`}
            >
              {isSubmitting ? 'Criando Conta...' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarContaModal;
