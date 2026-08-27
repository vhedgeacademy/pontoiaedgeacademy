"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiBase } from '@/config/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('E-mail ou senha incorretos.');
      }
      
      const data = await response.json();
      
      // Salva o token JWT e dados do usuário localmente
      localStorage.setItem('ponto_ai_token', data.access_token);
      localStorage.setItem('ponto_ai_user', JSON.stringify(data.user));
      
      // Redirecionamento condicional de primeiro acesso / troca obrigatória de senha
      if (data.user && (data.user.must_change_password || !data.user.has_logged_in)) {
        router.push('/redefinir-senha?first_access=true');
        return;
      }

      router.push('/');
    } catch (error) {
      setErrorMessage(error.message || 'Falha ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 sm:p-6">
      
      <div className="w-full max-w-md p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#4493AC] mb-2">
            Ponto AI
          </h1>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-black" htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[42px] px-3 bg-white border border-gray-300 rounded-[5px] text-black focus:outline-none focus:border-[#4493AC] focus:ring-1 focus:ring-[#4493AC] transition-colors"
            />
          </div>
          
          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-black" htmlFor="password">
                Senha de acesso
              </label>
              <Link href="/esqueci-senha" className="text-sm text-[#4493AC] hover:text-[#243D6D] transition-colors">
                Esqueci a senha
              </Link>
            </div>
            <div className="relative flex items-center w-full h-[42px] bg-white border border-gray-300 rounded-[5px] focus-within:border-[#4493AC] focus-within:ring-1 focus-within:ring-[#4493AC] transition-colors">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 h-full pl-3 bg-transparent text-black focus:outline-none rounded-[5px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#4493AC] text-white font-semibold rounded-lg hover:bg-[#243D6D] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4493AC] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
