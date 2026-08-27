'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, UserX, Shield, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UserAvatar from '@/components/UserAvatar';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { getApiBase } from '@/config/api';

const TRILHAS = [
  { value: 'Software', label: 'Desenvolvimento de Software' },
  { value: 'Automação', label: 'Automação Industrial' },
  { value: 'IA', label: 'Inteligência Artificial' },
  { value: 'Embarcados', label: 'Sistemas Embarcados' }
];

// ─── chip de filtro ────────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
      active
        ? 'bg-[#4493AC] text-white border-[#4493AC] shadow-sm'
        : 'bg-white text-gray-600 border-gray-300 hover:border-[#4493AC] hover:text-[#4493AC]'
    }`}
  >
    {label}
  </button>
);

// ─── card do administrador ───────────────────────────────────────────────────────
const AdminCard = ({ admin }) => {
  const router = useRouter();
  const isInactive = admin.is_active === false;

  return (
    <div
      onClick={() => router.push(`/perfil-administrador?id=${admin.id}`)}
      className={`rounded-2xl p-5 flex flex-col items-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer group relative ${
        isInactive
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600/50 opacity-80'
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 shadow-md'
      }`}
    >
      {isInactive && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-950/80 text-red-300 text-[10px] font-bold rounded-full border border-red-500/40 uppercase tracking-wider">
          Desativado
        </span>
      )}

      <UserAvatar
        src={admin.profile_image}
        name={admin.name}
        className={`w-20 h-20 mb-3 shadow-lg border-2 ${
          isInactive ? 'border-red-400/40 grayscale' : 'border-blue-400/40'
        }`}
        bgClassName={isInactive ? 'bg-gray-700 text-white' : 'bg-slate-700 text-white'}
        textClassName="font-bold text-3xl"
      />

      <p className="text-white font-semibold text-center text-sm mb-1">{admin.name}</p>
      <p className="text-slate-400 text-xs text-center mb-2 truncate max-w-full">{admin.email}</p>

      <div className="flex items-center justify-center gap-1 w-full mt-auto pt-2 border-t border-slate-700/50">
        <Shield className="w-3.5 h-3.5 text-[#7DD3C0]" />
        <span className="text-xs font-semibold text-[#7DD3C0]">Administrador</span>
      </div>
    </div>
  );
};

// ─── card do aluno ─────────────────────────────────────────────────────────────
const AlunoCard = ({ aluno, turmas, cargos }) => {
  const router = useRouter();
  const isInactive = aluno.is_active === false;
  const cargoName = cargos.find(c => c.id === aluno.student_profile?.cargo_id)?.name || 'Sem cargo';
  const turmaName = turmas.find(t => t.id === aluno.student_profile?.turma_id)?.name || 'Sem turma';
  const trilhaLabel = TRILHAS.find(t => t.value === aluno.student_profile?.trilha)?.label || aluno.student_profile?.trilha || 'Sem trilha';

  return (
    <div
      onClick={() => router.push(`/perfil-aluno?id=${aluno.id}`)}
      className={`rounded-2xl p-5 flex flex-col items-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer group relative ${
        isInactive
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600/50 opacity-80'
          : 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/60 shadow-md'
      }`}
    >
      {isInactive && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-950/80 text-red-300 text-[10px] font-bold rounded-full border border-red-500/40 uppercase tracking-wider">
          Desativado
        </span>
      )}

      <UserAvatar
        src={aluno.profile_image}
        name={aluno.name}
        className={`w-20 h-20 mb-3 shadow-lg border-2 ${
          isInactive ? 'border-red-400/40 grayscale' : 'border-white/20'
        }`}
        bgClassName={isInactive ? 'bg-gray-700 text-white' : 'bg-slate-600 text-white'}
        textClassName="font-bold text-3xl"
      />

      <p className="text-white font-semibold text-center text-sm mb-1">{aluno.name}</p>
      <p className="text-slate-300 text-xs text-center mb-2">{turmaName}</p>

      <div className="flex flex-col gap-1 w-full mt-auto pt-2 border-t border-slate-600/50">
        <span className="text-xs text-center text-[#7DD3C0] truncate">{trilhaLabel}</span>
        <span className="text-xs text-center text-slate-400 truncate">{cargoName}</span>
      </div>
    </div>
  );
};

// ─── página principal ──────────────────────────────────────────────────────────
const SearchPage = () => {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [turmaAtiva, setTurmaAtiva] = useState(''); // ID da turma
  const [trilhaAtiva, setTrilhaAtiva] = useState('');
  const [cargoAtivo, setCargoAtivo] = useState(''); // ID do cargo
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        const [turmasRes, cargosRes, usersRes] = await Promise.all([
          fetch(`${getApiBase()}/turmas`, { headers }),
          fetch(`${getApiBase()}/cargos`, { headers }),
          fetch(`${getApiBase()}/users`, { headers })
        ]);

        if (turmasRes.ok) {
          const data = await turmasRes.json();
          setTurmas(data);
        }
        if (cargosRes.ok) {
          const data = await cargosRes.json();
          setCargos(data);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalFiltrosAtivos = [
    statusFilter !== 'all' ? statusFilter : '',
    turmaAtiva,
    trilhaAtiva,
    cargoAtivo
  ].filter(Boolean).length;

  const limparFiltros = () => {
    setStatusFilter('all');
    setTurmaAtiva('');
    setTrilhaAtiva('');
    setCargoAtivo('');
    setSearchTerm('');
  };

  // Filtragem geral
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term));

    const isUserActive = u.is_active !== false;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isUserActive) ||
      (statusFilter === 'inactive' && !isUserActive);

    const matchTurma = !turmaAtiva || u.student_profile?.turma_id === turmaAtiva;
    const matchTrilha = !trilhaAtiva || u.student_profile?.trilha === trilhaAtiva;
    const matchCargo = !cargoAtivo || u.student_profile?.cargo_id === cargoAtivo;

    return matchSearch && matchStatus && matchTurma && matchTrilha && matchCargo;
  });

  // Ordenação: Usuários ativos primeiro, inativos depois; em caso de empate, alfabeticamente por nome
  const sortUsers = (list) => {
    return [...list].sort((a, b) => {
      const aActive = a.is_active !== false;
      const bActive = b.is_active !== false;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const adminList = sortUsers(filteredUsers.filter(u => u.admin === true));
  const studentList = sortUsers(filteredUsers.filter(u => u.admin === false));

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-0 md:ml-20 min-h-screen overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">

          {/* ── cabeçalho ── */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#4493AC]">Buscar Usuário</h1>
          </div>

          {/* ── barra de pesquisa + botão filtros ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail do usuário…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 rounded-full border border-gray-300
                           focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 bg-white shadow-sm text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all font-medium text-xs sm:text-sm shadow-sm cursor-pointer
                  ${showFilters ? 'bg-[#4493AC] text-white border-[#4493AC]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#4493AC]'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
                {totalFiltrosAtivos > 0 && (
                  <span className={`ml-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
                    ${showFilters ? 'bg-white text-[#4493AC]' : 'bg-[#4493AC] text-white'}`}>
                    {totalFiltrosAtivos}
                  </span>
                )}
              </button>

              {totalFiltrosAtivos > 0 && (
                <button
                  onClick={limparFiltros}
                  className="text-xs sm:text-sm text-gray-500 hover:text-red-500 transition-colors underline whitespace-nowrap px-2"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* ── painel de filtros (expansível) ── */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 space-y-5">
              {/* Status do Usuário */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status do Usuário</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Todos"
                    active={statusFilter === 'all'}
                    onClick={() => setStatusFilter('all')}
                  />
                  <FilterChip
                    label="Usuários Ativos"
                    active={statusFilter === 'active'}
                    onClick={() => setStatusFilter(v => v === 'active' ? 'all' : 'active')}
                  />
                  <FilterChip
                    label="Usuários Desativados"
                    active={statusFilter === 'inactive'}
                    onClick={() => setStatusFilter(v => v === 'inactive' ? 'all' : 'inactive')}
                  />
                </div>
              </div>

              {/* Turma */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Turma (Alunos)</p>
                <div className="flex flex-wrap gap-2">
                  {turmas.map(t => (
                    <FilterChip
                      key={t.id}
                      label={t.name}
                      active={turmaAtiva === t.id}
                      onClick={() => setTurmaAtiva(v => v === t.id ? '' : t.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Trilha */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trilha (Alunos)</p>
                <div className="flex flex-wrap gap-2">
                  {TRILHAS.map(t => (
                    <FilterChip
                      key={t.value}
                      label={t.label}
                      active={trilhaAtiva === t.value}
                      onClick={() => setTrilhaAtiva(v => v === t.value ? '' : t.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Cargo */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cargo (Alunos)</p>
                <div className="flex flex-wrap gap-2">
                  {cargos.map(c => (
                    <FilterChip
                      key={c.id}
                      label={c.name}
                      active={cargoAtivo === c.id}
                      onClick={() => setCargoAtivo(v => v === c.id ? '' : c.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── contador de resultados ── */}
          <p className="text-sm text-gray-500 mb-6">
            {filteredUsers.length === users.length
              ? `${users.length} usuários cadastrados`
              : `${filteredUsers.length} resultado${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`}
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-3xl p-8 shadow-sm">
              <p className="text-xl font-semibold text-gray-800">Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-3xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-[#D4E8ED] rounded-full flex items-center justify-center mb-4 text-[#4493AC]">
                <UserX className="w-8 h-8" />
              </div>
              <p className="text-xl font-semibold text-gray-800">Não existem usuários cadastrados</p>
              <p className="text-sm text-gray-500 mt-1 mb-6 text-center max-w-md">
                Cadastre novos usuários no sistema para que eles possam ser gerenciados e autenticados no sistema.
              </p>
              <button
                onClick={() => router.push('/gerenciar-usuario')}
                className="px-6 py-2.5 bg-[#4493AC] text-white rounded-full font-semibold shadow-sm hover:bg-[#3b8096] transition-colors"
              >
                Cadastrar Usuário
              </button>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-10">
              {/* ── SEÇÃO: ADMINISTRADORES ── */}
              {adminList.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-[#243D6D]" />
                    <h2 className="text-2xl font-bold text-[#243D6D]">
                      Administradores ({adminList.length})
                    </h2>
                  </div>
                  <div className="border border-slate-200 bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {adminList.map(admin => (
                        <AdminCard key={admin.id} admin={admin} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SEÇÃO: ALUNOS ── */}
              {studentList.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#4493AC] text-white flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                    <h2 className="text-2xl font-bold text-[#243D6D]">
                      Alunos ({studentList.length})
                    </h2>
                  </div>
                  <div className="border border-slate-200 bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {studentList.map(aluno => (
                        <AlunoCard
                          key={aluno.id}
                          aluno={aluno}
                          turmas={turmas}
                          cargos={cargos}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Search className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum usuário encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou o termo de busca</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchPage;
