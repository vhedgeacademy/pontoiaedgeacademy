'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Shield, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UserAvatar from '@/components/UserAvatar';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { getApiBase } from '@/config/api';

const PerfilAdministradorContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      const response = await fetch(`${getApiBase()}/users/${id}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      } else {
        setAdminData(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do administrador:', error);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);


  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">Carregando perfil...</div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl font-semibold text-gray-800 mb-4">Administrador não encontrado.</p>
        <button
          onClick={() => router.push('/search')}
          className="px-6 py-2.5 bg-[#4493AC] text-white rounded-xl font-medium hover:bg-[#3b8096] transition-colors"
        >
          Voltar para a Busca
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-0 md:ml-20 min-h-screen overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => router.push('/search')}
              className="flex items-center gap-2 text-[#4493AC] hover:text-[#2c6577] font-semibold text-xs sm:text-sm transition-colors group self-start cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para Busca de Usuários</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#243D6D]">Perfil do Administrador</h1>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="relative shrink-0">
                <UserAvatar
                  src={adminData.profile_image}
                  name={adminData.name}
                  className="w-36 h-36 border-4 border-slate-100 shadow-md"
                  bgClassName="bg-slate-700 text-white"
                  textClassName="font-bold text-5xl"
                />
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#243D6D]">{adminData.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{adminData.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-blue-50 text-[#243D6D] rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100">
                      <Shield className="w-3.5 h-3.5" />
                      Administrador
                    </span>

                    {adminData.is_active !== false ? (
                      <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ativo
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-gray-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Desativado
                      </span>
                    )}
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <User className="w-5 h-5 text-[#4493AC] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">Tipo de Conta</p>
                      <p className="text-sm font-semibold text-gray-800">Administrador do Sistema</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <Mail className="w-5 h-5 text-[#4493AC] shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">E-mail Cadastrado</p>
                      <p className="text-sm font-semibold text-gray-800">{adminData.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PerfilAdministradorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-xl font-semibold text-gray-800">Carregando...</p>
        </div>
      }
    >
      <PerfilAdministradorContent />
    </Suspense>
  );
}
