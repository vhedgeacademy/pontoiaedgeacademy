'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@/config/api';

const EDGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@edge\.ufal\.br$/i;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

const INITIAL_FORM_DATA = {
  nomeCompleto: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const CriarContaModal = ({ isOpen, onClose, onUserCreated }) => {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData(INITIAL_FORM_DATA);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStatusMessage(null);

    const nome = formData.nomeCompleto.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!nome || !email || !password || !confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Todos os campos são obrigatórios.' });
      return;
    }

    if (!EDGE_EMAIL_REGEX.test(email)) {
      setStatusMessage({ type: 'error', text: 'O e-mail deve pertencer ao domínio @edge.ufal.br.' });
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setStatusMessage({
        type: 'error',
        text: 'A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'As senhas informadas não coincidem.' });
      return;
    }

    const payload = {
      name: nome,
      email: email.toLowerCase(),
      password: password,
      confirm_password: confirmPassword,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBase()}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('ponto_ai_token', data.access_token);
        }
        if (data.user) {
          localStorage.setItem('ponto_ai_user', JSON.stringify(data.user));
        }
        setStatusMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Redirecionando...',
        });
        setFormData(INITIAL_FORM_DATA);
        if (onUserCreated) {
          onUserCreated(data);
        }
        onClose();
        router.push('/');
      } else {
        const errorData = await response.json();
        let errorMessage = 'Erro ao criar conta.';

        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err) => {
              if (err.loc && err.loc.includes('email')) return 'O e-mail deve pertencer ao domínio @edge.ufal.br.';
              if (err.loc && err.loc.includes('password')) return 'A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.';
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
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4 sm:my-8 overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
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
          <div className="p-4 sm:p-8 space-y-4">
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

            {/* Nome Completo */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">Nome Completo</label>
              <input
                type="text"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                placeholder="Seu nome completo"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors text-sm"
              />
            </div>

            {/* E-mail Institucional */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">E-mail Institucional</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@edge.ufal.br"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors text-sm"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative flex items-center w-full border border-gray-300 rounded-xl focus-within:border-[#4493AC] focus-within:ring-1 focus-within:ring-[#4493AC] transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Crie sua senha de acesso"
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-transparent text-black text-sm focus:outline-none rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  className="absolute right-0 inset-y-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">Confirmar Senha</label>
              <div className="relative flex items-center w-full border border-gray-300 rounded-xl focus-within:border-[#4493AC] focus-within:ring-1 focus-within:ring-[#4493AC] transition-colors">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirme sua senha de acesso"
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-transparent text-black text-sm focus:outline-none rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Exibir confirmação de senha"}
                  className="absolute right-0 inset-y-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé / Ações */}
          <div className="px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-7 py-2.5 rounded-xl text-white font-semibold shadow-sm transition-all text-sm cursor-pointer ${
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
