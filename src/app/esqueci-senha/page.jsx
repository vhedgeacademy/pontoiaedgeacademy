"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { getApiBase } from '@/config/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('As senhas não coincidem.');
      setIsSubmitting(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setIsError(true);
      setMessage('A senha deve ter pelo menos 8 caracteres, incluindo 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`${getApiBase()}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          matricula, 
          new_password: newPassword, 
          confirm_password: confirmPassword 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Falha ao processar a solicitação.');
      }
      
      setMessage(data.detail || 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.');
      setEmail('');
      setMatricula('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Falha ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-50 text-[#4493AC] rounded-full">
              <KeyRound className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <img src="/assets/logo-edge.png" alt="Logo Edge" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-bold text-[#4493AC]">
              Ponto AI Edge Academy
            </h1>
          </div>
          <p className="text-sm text-gray-500">Recuperação de Senha</p>
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

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-black" htmlFor="email">
              E-mail Institucional
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@edge.ufal.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[42px] px-3 bg-white border border-gray-300 rounded-[5px] text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-black" htmlFor="matricula">
              Matrícula
            </label>
            <input
              id="matricula"
              type="text"
              placeholder="Matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              className="w-full h-[42px] px-3 bg-white border border-gray-300 rounded-[5px] text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors"
            />
            <p className="text-xs text-gray-400">
              Estudantes informam sua matrícula. Administradores usam a chave do sistema.
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-black" htmlFor="newPassword">
              Nova Senha
            </label>
            <div className="relative flex items-center w-full h-[42px] bg-white border border-gray-300 rounded-[5px] focus-within:border-[#4493AC] focus-within:ring-1 focus-within:ring-[#4493AC] transition-colors">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Mín. 8 caracteres (A-Z, a-z, 0-9, @$!%*?&)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex-1 h-full pl-3 bg-transparent text-black focus:outline-none rounded-[5px]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-black" htmlFor="confirmPassword">
              Confirmar Nova Senha
            </label>
            <div className="relative flex items-center w-full h-[42px] bg-white border border-gray-300 rounded-[5px] focus-within:border-[#4493AC] focus-within:ring-1 focus-within:ring-[#4493AC] transition-colors">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="flex-1 h-full pl-3 bg-transparent text-black focus:outline-none rounded-[5px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-center pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#4493AC] text-white font-semibold rounded-lg hover:bg-[#243D6D] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4493AC] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </div>
          
          <div className="text-center pt-2">
            <Link href="/login" className="text-sm text-[#4493AC] hover:text-[#243D6D] font-medium transition-colors">
              Voltar para o Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
