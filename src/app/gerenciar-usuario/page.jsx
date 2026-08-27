'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  Shield,
  GraduationCap,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UserAvatar from '@/components/UserAvatar';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import CadastrarUsuarioModal from '@/Site/PopUpsEModals/CadastrarUsuarioModal';
import RemoverAlunoModal from '@/Site/PopUpsEModals/RemoverAlunoModal';
import { getApiBase } from '@/config/api';

const TRILHAS_MAP = {
  Software: 'Desenvolvimento de Software',
  Automação: 'Automação Industrial',
  IA: 'Inteligência Artificial',
  Embarcados: 'Sistemas Embarcados',
};

const GerenciarUsuariosPage = () => {
  useAdminGuard();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'inactive'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'student'
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchUsers = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      const [usersRes, turmasRes, cargosRes, cursosRes] = await Promise.all([
        fetch(`${getApiBase()}/users`, { headers }),
        fetch(`${getApiBase()}/turmas`, { headers }),
        fetch(`${getApiBase()}/cargos`, { headers }),
        fetch(`${getApiBase()}/cursos`, { headers }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
      if (turmasRes.ok) setTurmas(await turmasRes.json());
      if (cargosRes.ok) setCargos(await cargosRes.json());
      if (cursosRes.ok) setCursos(await cursosRes.json());
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      showNotification('error', 'Falha ao carregar usuários do sistema.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Alternar status de atividade (Ativar / Desativar)
  const handleToggleStatus = async (user) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    const newStatus = !user.is_active;

    try {
      const response = await fetch(`${getApiBase()}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (response.ok) {
        showNotification(
          'success',
          `Usuário "${user.name}" foi ${newStatus ? 'reativado' : 'desativado'} com sucesso.`
        );
        fetchUsers();
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.detail || 'Erro ao atualizar status do usuário.');
      }
    } catch (err) {
      showNotification('error', 'Erro de conexão com o servidor.');
    }
  };

  // Abrir modal de exclusão
  const handleOpenDeleteModal = (user) => {
    if (user.is_active !== false) {
      showNotification(
        'error',
        'Apenas usuários desativados podem ser excluídos. Desative o usuário primeiro.'
      );
      return;
    }
    if (user.first_login_at !== null && user.first_login_at !== undefined) {
      showNotification(
        'error',
        'Não é permitida a exclusão de usuários que já realizaram login no sistema. Utilize a opção de desativar.'
      );
      return;
    }
    setSelectedUserForDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
    try {
      const response = await fetch(`${getApiBase()}/users/${selectedUserForDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showNotification('success', `Usuário "${selectedUserForDelete.name}" foi excluído com sucesso.`);
        setIsDeleteModalOpen(false);
        setSelectedUserForDelete(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.detail || 'Erro ao excluir usuário.');
      }
    } catch (err) {
      showNotification('error', 'Erro de conexão ao excluir usuário.');
    }
  };

  // Contadores
  const activeCount = users.filter((u) => u.is_active !== false).length;
  const inactiveCount = users.filter((u) => u.is_active === false).length;

  // Filtragem dos usuários exibidos
  const filteredUsers = users.filter((u) => {
    const isUserActive = u.is_active !== false;
    const matchesTab = activeTab === 'active' ? isUserActive : !isUserActive;

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && u.admin) ||
      (roleFilter === 'student' && !u.admin);

    const term = searchTerm.toLowerCase();
    const matricula = u.student_profile?.matricula || '';
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      matricula.toLowerCase().includes(term);

    return matchesTab && matchesRole && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-20 min-h-screen overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF4F8] flex items-center justify-center text-[#4493AC]">
                  <Users className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#243D6D]">Gerenciar Usuários</h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Controle de acesso, cadastro, status e gerenciamento de permissões do sistema.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#4493AC] hover:bg-[#243D6D] text-white font-semibold rounded-2xl shadow-sm transition-all text-xs sm:text-sm w-full sm:w-auto cursor-pointer"
            >
              <UserPlus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span>Adicionar Usuário</span>
            </button>
          </div>

          {/* Notificação Flutuante / Inline */}
          {notification && (
            <div
              className={`p-4 rounded-2xl border font-medium text-sm transition-all flex items-center gap-3 ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
          )}

          {/* Abas e Filtros */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              {/* Abas: Ativos vs Desativados */}
              <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'active'
                      ? 'bg-white text-[#4493AC] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Usuários Ativos</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                    {activeCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('inactive')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'inactive'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Usuários Desativados</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                    {inactiveCount}
                  </span>
                </button>
              </div>

              {/* Filtro por Perfil */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      roleFilter === 'all'
                        ? 'bg-[#4493AC] text-white border-[#4493AC]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#4493AC]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      roleFilter === 'admin'
                        ? 'bg-[#4493AC] text-white border-[#4493AC]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#4493AC]'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setRoleFilter('student')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      roleFilter === 'student'
                        ? 'bg-[#4493AC] text-white border-[#4493AC]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#4493AC]'
                    }`}
                  >
                    Alunos
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de Busca */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou matrícula…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4493AC]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Listagem de Usuários */}
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <p className="text-gray-500 font-medium">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 space-y-3">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Nenhum usuário encontrado</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Não foram encontrados usuários com os critérios selecionados nesta visualização.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => {
                const sp = user.student_profile || {};
                const turmaName = turmas.find((t) => t.id === sp.turma_id)?.name;
                const cargoName = cargos.find((c) => c.id === sp.cargo_id)?.name;
                const trilhaLabel = TRILHAS_MAP[sp.trilha] || sp.trilha;

                const hasLogged = user.first_login_at !== null && user.first_login_at !== undefined;
                const canDelete = !hasLogged;

                return (
                  <div
                    key={user.id}
                    className={`bg-white rounded-3xl p-6 shadow-sm border transition-all flex flex-col justify-between ${
                      user.is_active === false
                        ? 'border-gray-200 opacity-80 bg-gray-50/50'
                        : 'border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Topo do Card: Avatar, Nome, Badges */}
                      <div className="flex items-start gap-4 mb-4">
                        <UserAvatar
                          src={user.profile_image}
                          name={user.name}
                          className="w-14 h-14 rounded-2xl shadow-sm"
                          bgClassName="bg-gradient-to-br from-slate-700 to-slate-900 text-white"
                          textClassName="font-bold text-xl"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-[#243D6D] truncate">{user.name}</h3>
                          <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {user.admin ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#243D6D] border border-blue-100 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-100 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                Aluno
                              </span>
                            )}

                            {user.is_active !== false ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                Ativo
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                Desativado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informações Complementares */}
                      {!user.admin && (
                        <div className="bg-gray-50 p-3.5 rounded-2xl space-y-1.5 mb-4 text-xs text-gray-600 border border-gray-100">
                          {sp.matricula && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Matrícula:</span>
                              <span className="font-semibold text-gray-800">{sp.matricula}</span>
                            </div>
                          )}
                          {turmaName && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Turma:</span>
                              <span className="font-semibold text-gray-800">{turmaName}</span>
                            </div>
                          )}
                          {cargoName && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Cargo:</span>
                              <span className="font-semibold text-gray-800">{cargoName}</span>
                            </div>
                          )}
                          {trilhaLabel && (
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-medium">Trilha:</span>
                              <span className="font-semibold text-gray-800">{trilhaLabel}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status de Primeiro Acesso */}
                      <div className="flex items-center gap-1.5 text-xs mb-4 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {hasLogged ? (
                          <span className="text-green-600 font-medium">Primeiro acesso realizado</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Primeiro acesso pendente</span>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      {/* Botão Ativar / Desativar */}
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                          user.is_active !== false
                            ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                            : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {user.is_active !== false ? 'Desativar' : 'Reativar'}
                      </button>

                      {/* Botão Excluir só aparece para usuários desativados */}
                      {user.is_active === false && (
                        canDelete ? (
                          <button
                            data-testid={`delete-user-${user.id}`}
                            onClick={() => handleOpenDeleteModal(user)}
                            title="Excluir permanentemente (usuário desativado sem primeiro login)"
                            className="py-2 px-3 rounded-xl text-xs font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        ) : (
                          <button
                            data-testid={`delete-user-${user.id}`}
                            disabled
                            title="Exclusão proibida: usuário já realizou login no sistema."
                            className="py-2 px-3 rounded-xl text-xs font-medium border border-gray-200 text-gray-300 bg-gray-100 cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastrar Usuário */}
      <CadastrarUsuarioModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserCreated={() => fetchUsers()}
      />

      {/* Modal de Excluir Usuário */}
      <RemoverAlunoModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        nomeAluno={selectedUserForDelete?.name}
        titulo="Excluir Usuário"
        tipoUsuario={selectedUserForDelete?.admin ? 'administrador' : 'aluno'}
      />
    </div>
  );
};

export default GerenciarUsuariosPage;
