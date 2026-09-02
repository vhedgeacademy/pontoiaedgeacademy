'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Trophy, 
  ScanFace, 
  Search, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import LogoutModal from '@/Site/PopUpsEModals/logoutmodal';
import UserAvatar from '@/components/UserAvatar';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogout = () => {
    setLogoutOpen(false);
    setMobileMenuOpen(false);
    localStorage.removeItem('ponto_ai_token');
    localStorage.removeItem('ponto_ai_user');
    router.push('/login');
  };

  const navigateTo = (path) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('ponto_ai_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        setIsAdmin(user.admin === true);
      } catch (e) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Cabeçalho superior mobile (visível apenas em telas menores que md) */}
      {/* ========================================================================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-gray-700 hover:text-[#4493AC] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <img src="/assets/logo-edge.png" alt="Logo Edge" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm text-[#243D6D] tracking-tight">Ponto AI</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/editar-perfil')}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Meu Perfil"
          >
            <UserAvatar
              src={userData?.profile_image}
              name={userData?.name}
              className="w-8 h-8 border border-gray-300"
              bgClassName="bg-gray-200 text-gray-600"
              textClassName="font-bold text-xs"
            />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. Drawer mobile (visível quando mobileMenuOpen for true) */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Painel do Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header do Drawer */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/assets/logo-edge.png" alt="Logo Edge" className="w-8 h-8 object-contain" />
                <span className="font-bold text-sm text-[#243D6D]">Ponto AI Edge</span>
              </div>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Perfil do Usuário */}
            <button
              onClick={() => navigateTo('/editar-perfil')}
              className="p-4 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left w-full"
            >
              <UserAvatar
                src={userData?.profile_image}
                name={userData?.name}
                className="w-10 h-10 border border-gray-300"
                bgClassName="bg-gray-200 text-gray-600"
                textClassName="font-bold text-sm"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-sm text-gray-800 truncate">
                  {userData?.name || 'Carregando...'}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {userData?.email || ''}
                </span>
              </div>
            </button>

            {/* Links de Navegação Mobile */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <button
                onClick={() => navigateTo('/')}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  pathname === '/'
                    ? 'bg-blue-50 text-[#4493AC]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#4493AC]'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Início</span>
              </button>

              <button
                onClick={() => navigateTo('/ranking')}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  pathname === '/ranking'
                    ? 'bg-blue-50 text-[#4493AC]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#4493AC]'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>Ranking</span>
              </button>

              {/* Links específicos de Aluno */}
              {!isAdmin && (
                <button
                  onClick={() => navigateTo('/reconhecimento-id')}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pathname === '/reconhecimento-id'
                      ? 'bg-blue-50 text-[#4493AC]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#4493AC]'
                  }`}
                >
                  <ScanFace className="w-5 h-5" />
                  <span>Reconhecimento ID</span>
                </button>
              )}

              {/* Links específicos de Administrador */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigateTo('/search')}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      pathname === '/search'
                        ? 'bg-blue-50 text-[#4493AC]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#4493AC]'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    <span>Buscar Usuário</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/gerenciar-usuario')}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      pathname === '/gerenciar-usuario'
                        ? 'bg-blue-50 text-[#4493AC]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#4493AC]'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Gerenciar Usuários</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/configuracoes')}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      pathname === '/configuracoes'
                        ? 'bg-blue-50 text-[#4493AC]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#4493AC]'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Configurações</span>
                  </button>
                </>
              )}
            </div>

            {/* Rodapé com Botão Sair */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => setLogoutOpen(true)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Sidebar desktop (visível apenas em telas md ou maiores) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-20 hover:w-64 bg-white border-r border-gray-200 z-50 flex-col justify-between py-6 px-3 transition-all duration-300 group shadow-sm hover:shadow-xl">
        {/* Topo / Logo */}
        <div 
          className="flex items-center w-full px-2 py-2 cursor-pointer select-none rounded-2xl hover:bg-gray-50 transition-colors" 
          onClick={() => router.push('/')}
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img src="/assets/logo-edge.png" alt="Logo Edge" className="w-8 h-8 object-contain" />
          </div>
          <div className="ml-3 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
            <span className="font-bold text-base text-[#243D6D] tracking-tight leading-tight">
              Ponto AI
            </span>
          </div>
        </div>

        {/* Navegação Principal */}
        <div className="flex-1 flex flex-col space-y-2 items-start w-full my-6 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button 
            onClick={() => router.push('/')} 
            className={`flex items-center w-full px-2 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
              pathname === '/' 
                ? 'bg-blue-50 text-[#4493AC]' 
                : 'text-gray-600 hover:text-[#4493AC] hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Início
            </span>
          </button>

          {/* Ranking visível para todos os usuários autenticados */}
          <button 
            onClick={() => router.push('/ranking')} 
            className={`flex items-center w-full px-2 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
              pathname === '/ranking' 
                ? 'bg-blue-50 text-[#4493AC]' 
                : 'text-gray-600 hover:text-[#4493AC] hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Ranking
            </span>
          </button>

          {/* Links específicos para Alunos */}
          {!isAdmin && (
            <button
              onClick={() => router.push('/reconhecimento-id')}
              className={`flex items-center w-full px-2 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                pathname === '/reconhecimento-id' 
                  ? 'bg-blue-50 text-[#4493AC]' 
                  : 'text-gray-600 hover:text-[#4493AC] hover:bg-gray-50'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <ScanFace className="w-6 h-6" />
              </div>
              <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Reconhecimento ID
              </span>
            </button>
          )}

          {/* Links específicos para Administradores */}
          {isAdmin && (
            <>
              <button 
                onClick={() => router.push('/search')} 
                className={`flex items-center w-full px-2 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                  pathname === '/search' 
                    ? 'bg-blue-50 text-[#4493AC]' 
                    : 'text-gray-600 hover:text-[#4493AC] hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <Search className="w-6 h-6" />
                </div>
                <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Buscar Usuário
                </span>
              </button>

              <button 
                onClick={() => router.push('/gerenciar-usuario')} 
                className={`flex items-center w-full px-2 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                  pathname === '/gerenciar-usuario' 
                    ? 'bg-blue-50 text-[#4493AC]' 
                    : 'text-gray-600 hover:text-[#4493AC] hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Gerenciar Usuários
                </span>
              </button>

              <button 
                onClick={() => router.push('/configuracoes')} 
                className={`flex items-center w-full px-2 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                  pathname === '/configuracoes' 
                    ? 'bg-blue-50 text-[#4493AC]' 
                    : 'text-gray-600 hover:text-[#4493AC] hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Configurações
                </span>
              </button>
            </>
          )}
        </div>

        {/* Rodapé / Perfil e Sair */}
        <div className="flex flex-col space-y-1.5 w-full border-t border-gray-100 pt-4">
          <button 
            onClick={() => router.push('/editar-perfil')} 
            className="flex items-center w-full px-2 py-2 text-gray-700 hover:text-[#4493AC] hover:bg-gray-50 rounded-2xl transition-colors whitespace-nowrap"
            title="Meu Perfil"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <UserAvatar
                src={userData?.profile_image}
                name={userData?.name}
                className="w-9 h-9 border border-gray-300"
                bgClassName="bg-gray-200 text-gray-600"
                textClassName="font-bold text-xs"
              />
            </div>
            <div className="ml-3 flex flex-col items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden text-left">
              <span className="font-semibold text-sm text-gray-800 truncate max-w-[140px]">
                {userData?.name || 'Carregando...'}
              </span>
              <span className="text-xs text-gray-400 truncate max-w-[140px]">
                {userData?.email || ''}
              </span>
            </div>
          </button>

          <button 
            onClick={() => setLogoutOpen(true)} 
            className="flex items-center w-full px-2 py-2.5 text-red-600 hover:bg-red-50 rounded-2xl font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="ml-3 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Sair da Conta
            </span>
          </button>
        </div>
      </aside>

      <LogoutModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} />
    </>
  );
};

export default Sidebar;