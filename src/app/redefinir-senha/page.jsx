"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/config/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const isFirstAccess = searchParams.get('first_access') === 'true';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isFirstAccess && !tokenFromUrl) {
      const storedToken = localStorage.getItem('ponto_ai_token');
      if (!storedToken) {
        setIsError(true);
        setMessage('Token de redefinição não encontrado. Solicite um novo link ou faça login.');
      }
    }
  }, [isFirstAccess, tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('As senhas não coincidem.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setIsError(true);
      setMessage('A senha deve ter pelo menos 8 caracteres, contendo pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setIsError(false);
    
    try {
      let response;
      if (isFirstAccess) {
        const token = localStorage.getItem('ponto_ai_token');
        if (!token) {
          throw new Error('Sessão não encontrada. Por favor, faça login novamente.');
        }

        response = await fetch(`${getApiBase()}/auth/first-access-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            new_password: newPassword, 
            confirm_password: confirmPassword 
          })
        });
      } else {
        response = await fetch(`${getApiBase()}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            token: tokenFromUrl, 
            new_password: newPassword 
          })
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Falha ao redefinir a senha.');
      }
      
      setIsSuccess(true);
      setMessage(isFirstAccess 
        ? 'Senha cadastrada com sucesso! Redirecionando para o sistema...' 
        : 'Sua senha foi redefinida com sucesso!'
      );

      // Primeiro acesso: persiste o novo token e marca o usuário local como já
      // logado, para o fluxo de troca obrigatória de senha não disparar de novo.
      if (isFirstAccess) {
        if (data.access_token) {
          localStorage.setItem('ponto_ai_token', data.access_token);
        }
        if (data.user) {
          localStorage.setItem('ponto_ai_user', JSON.stringify(data.user));
        } else {
          const storedUser = localStorage.getItem('ponto_ai_user');
          if (storedUser) {
            try {
              const userObj = JSON.parse(storedUser);
              userObj.must_change_password = false;
              userObj.has_logged_in = true;
              localStorage.setItem('ponto_ai_user', JSON.stringify(userObj));
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
      
      setTimeout(() => {
        if (isFirstAccess) {
          router.push('/');
        } else {
          router.push('/login');
        }
      }, 1500);
      
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Falha ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canShowForm = isFirstAccess || tokenFromUrl || localStorage.getItem('ponto_ai_token');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-50 text-[#4493AC] rounded-full">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <img src="/assets/logo-edge.png" alt="Logo Edge" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-bold text-[#4493AC]">
              Ponto AI Edge Academy
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {isFirstAccess ? 'Primeiro Acesso - Cadastrar Nova Senha' : 'Definir Nova Senha'}
          </p>
          {isFirstAccess && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
              Por segurança, é obrigatório alterar sua senha inicial antes de acessar o sistema.
            </p>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 border rounded-lg flex items-start ${isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            {isError ? (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <p className={`text-sm ${isError ? 'text-red-700' : 'text-green-700'}`}>{message}</p>
          </div>
        )}

        {!isSuccess && canShowForm && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-black" htmlFor="newPassword">
                Nova senha
              </label>
              <div className="relative w-full">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 8 caract. (letras, núm, símb)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full h-[42px] pl-3 pr-10 bg-white border border-gray-300 rounded-[5px] text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar nova senha" : "Exibir nova senha"}
                  className="absolute right-0 inset-y-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black" htmlFor="confirmPassword">
                Confirmar nova senha
              </label>
              <div className="relative w-full">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-[42px] pl-3 pr-10 bg-white border border-gray-300 rounded-[5px] text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Exibir confirmação de senha"}
                  className="absolute right-0 inset-y-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#4493AC] text-white font-semibold rounded-lg hover:bg-[#243D6D] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4493AC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        )}

        {(!canShowForm || isSuccess) && (
          <div className="text-center pt-4">
            <Link href="/login" className="inline-block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              Voltar para o Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
