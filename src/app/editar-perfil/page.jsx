"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import UserAvatar from '@/components/UserAvatar';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Lock, CheckCircle2, AlertCircle, GraduationCap, Info } from 'lucide-react';
import { getApiBase } from '@/config/api';

const TRILHA_OPTIONS = [
  { value: 'Software', label: 'Desenvolvimento de Software' },
  { value: 'Automação', label: 'Automação Industrial' },
  { value: 'IA', label: 'Inteligência Artificial' },
  { value: 'Embarcados', label: 'Sistemas Embarcados' },
];

const SEMESTRE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}º Semestre`,
}));

const EditarPerfil = () => {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricula: '',
    turma: '',
    cargo: '',
    curso: '',
    trilha: '',
    anoIngresso: '',
    semestre: '',
    profileImage: null,
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const [turmaOptions, setTurmaOptions] = useState([]);
  const [cargoOptions, setCargoOptions] = useState([]);
  const [cursoOptions, setCursoOptions] = useState([]);

  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : null;

      if (!userStr || !token) {
        routerRef.current.push('/login');
        return;
      }

      const localUser = JSON.parse(userStr);
      setIsAdmin(localUser.admin === true);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Busca dados do usuário logado
        const userRes = await fetch(`${getApiBase()}/users/me`, { headers });

        if (userRes.ok) {
          const data = await userRes.json();
          const sp = data.student_profile || {};
          const isUserAdmin = data.admin === true;
          setIsAdmin(isUserAdmin);

          setFormData({
            name: data.name || '',
            email: data.email || '',
            matricula: sp.matricula || '',
            turma: sp.turma_id ? String(sp.turma_id) : '',
            cargo: sp.cargo_id ? String(sp.cargo_id) : '',
            curso: sp.curso_id ? String(sp.curso_id) : '',
            trilha: sp.trilha || '',
            anoIngresso: sp.ano_ingresso ? String(sp.ano_ingresso) : '',
            semestre: sp.semestre ? String(sp.semestre) : '',
            profileImage: data.profile_image || null,
            currentPassword: '',
            password: '',
            confirmPassword: '',
          });

          // Se for aluno, busca as opções auxiliares para os dropdowns
          if (!isUserAdmin) {
            try {
              const [turmasRes, cargosRes, cursosRes] = await Promise.all([
                fetch(`${getApiBase()}/turmas`, { headers }),
                fetch(`${getApiBase()}/cargos`, { headers }),
                fetch(`${getApiBase()}/cursos`, { headers }),
              ]);

              if (turmasRes.ok) {
                const turmasData = await turmasRes.json();
                setTurmaOptions(turmasData.map((t) => ({ value: String(t.id), label: t.name })));
              }
              if (cargosRes.ok) {
                const cargosData = await cargosRes.json();
                setCargoOptions(cargosData.map((c) => ({ value: String(c.id), label: c.name })));
              }
              if (cursosRes.ok) {
                const cursosData = await cursosRes.json();
                setCursoOptions(cursosData.map((c) => ({ value: String(c.id), label: c.name })));
              }
            } catch (auxErr) {
              console.error('Erro ao carregar opções auxiliares:', auxErr);
            }
          }
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Não foi possível carregar seus dados. Faça login novamente.',
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário', err);
        setStatusMessage({ type: 'error', text: 'Erro de conexão ao carregar seus dados.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'A imagem de perfil deve ter no máximo 1MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Verifica se o cadastro do estudante está incompleto
  const isProfileIncomplete =
    !isAdmin &&
    (!formData.matricula ||
      !formData.turma ||
      !formData.cargo ||
      !formData.trilha);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';

    if (!formData.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Nome é obrigatório.' });
      return;
    }

    if (!isAdmin) {
      const mat = formData.matricula.trim();
      if (!mat) {
        setStatusMessage({ type: 'error', text: 'Matrícula é obrigatória para estudantes.' });
        return;
      }
      if (!/^\d{7,20}$/.test(mat)) {
        setStatusMessage({
          type: 'error',
          text: 'A matrícula deve conter apenas números (entre 7 e 20 dígitos).',
        });
        return;
      }

      if (formData.anoIngresso && parseInt(formData.anoIngresso, 10) < 2000) {
        setStatusMessage({
          type: 'error',
          text: 'O ano de ingresso deve ser igual ou superior a 2000.',
        });
        return;
      }
    }

    if (formData.password || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setStatusMessage({ type: 'error', text: 'Informe sua senha atual para alterar a senha.' });
        return;
      }

      if (!formData.password) {
        setStatusMessage({ type: 'error', text: 'Informe a nova senha.' });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setStatusMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setStatusMessage({
          type: 'error',
          text: 'A nova senha deve ter no mínimo 8 caracteres, contendo pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial.',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Alteração de senha, se solicitada
      if (formData.password) {
        const passRes = await fetch(`${getApiBase()}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: formData.currentPassword,
            new_password: formData.password,
            confirm_password: formData.confirmPassword,
          }),
        });

        if (!passRes.ok) {
          const passErr = await passRes.json();
          setStatusMessage({
            type: 'error',
            text: passErr.detail || 'Senha atual incorreta ou inválida.',
          });
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Atualização dos dados do perfil via PUT /users/me
      const perfilPayload = {
        name: formData.name.trim(),
      };

      if (formData.profileImage) {
        perfilPayload.profile_image = formData.profileImage;
      }

      if (!isAdmin) {
        perfilPayload.matricula = formData.matricula.trim();
        perfilPayload.turma_id = formData.turma ? parseInt(formData.turma, 10) : null;
        perfilPayload.cargo_id = formData.cargo ? parseInt(formData.cargo, 10) : null;
        perfilPayload.curso_id = formData.curso ? parseInt(formData.curso, 10) : null;
        perfilPayload.trilha = formData.trilha || null;
        perfilPayload.ano_ingresso = formData.anoIngresso ? parseInt(formData.anoIngresso, 10) : null;
        perfilPayload.semestre = formData.semestre ? parseInt(formData.semestre, 10) : null;
      }

      const profileRes = await fetch(`${getApiBase()}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(perfilPayload),
      });

      if (profileRes.ok) {
        const updatedUser = await profileRes.json();

        const userStr = localStorage.getItem('ponto_ai_user');
        if (userStr) {
          const oldUser = JSON.parse(userStr);
          const newUser = {
            ...oldUser,
            name: updatedUser.name,
            profile_image: updatedUser.profile_image,
            student_profile: updatedUser.student_profile,
          };
          localStorage.setItem('ponto_ai_user', JSON.stringify(newUser));
        }

        setStatusMessage({
          type: 'success',
          text: 'Perfil e dados cadastrais atualizados com sucesso!',
        });
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('ponto_ai_profile_updated', { detail: updatedUser }));
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          password: '',
          confirmPassword: '',
        }));
      } else {
        const errorData = await profileRes.json();
        setStatusMessage({ type: 'error', text: errorData.detail || 'Erro ao atualizar perfil.' });
      }
    } catch (err) {
      console.error('Erro na submissão:', err);
      setStatusMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-0 md:ml-20 min-h-screen overflow-y-auto bg-gray-50 flex flex-col items-center pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4493AC]">
              Meu Perfil
            </h1>
            <span className="text-xs sm:text-sm font-semibold px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 self-start sm:self-auto shadow-xs">
              {isAdmin ? '🛡️ Administrador' : '🎓 Aluno / Estudante'}
            </span>
          </div>

          {/* Aviso de cadastro incompleto para Alunos */}
          {isProfileIncomplete && !isLoading && (
            <div className="p-4 sm:p-5 mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-3.5 animate-in fade-in duration-300">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-amber-900">
                  Complete seu cadastro de estudante!
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Preencha seus dados de <strong>Matrícula</strong>, <strong>Turma</strong>,{' '}
                  <strong>Cargo</strong> e <strong>Trilha</strong>. Essas informações são
                  essenciais para a validação no sistema e para que você consiga utilizar a
                  recuperação de senha (<strong>Esqueci a Senha</strong>) quando necessário.
                </p>
              </div>
            </div>
          )}

          {statusMessage && (
            <div
              className={`p-4 mb-6 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-sm ${
                statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8"
          >
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center pb-6 border-b border-gray-100">
              <div className="relative w-32 h-32 mb-4">
                <UserAvatar
                  src={formData.profileImage}
                  name={formData.name}
                  className="w-32 h-32 border-4 border-[#4493AC] shadow-md"
                  bgClassName="bg-gray-100 text-[#4493AC]"
                  textClassName="text-4xl font-bold"
                />
              </div>
              <label className="cursor-pointer bg-[#4493AC] text-white text-sm font-semibold py-2.5 px-6 rounded-full hover:bg-[#243D6D] transition-colors shadow-sm">
                Alterar Foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Formatos permitidos: JPG, PNG. Tamanho máximo: 1MB.
              </p>
            </div>

            {/* Seção 1: Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#4493AC]" />
                <span>Dados Pessoais</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Dados Acadêmicos (Apenas para Alunos) */}
            {!isAdmin && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#4493AC]" />
                    <span>Dados Acadêmicos e Vínculo</span>
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Mantenha suas informações acadêmicas sempre atualizadas para identificação no
                  ponto e recuperação de senha.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Matrícula */}
                  <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <span>Matrícula</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={formData.matricula}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          matricula: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm font-mono font-medium"
                      placeholder="Ex: 19111334"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3 shrink-0" />
                      Necessária para &quot;Esqueci a Senha&quot;.
                    </span>
                  </div>

                  {/* Turma */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Turma</label>
                    <select
                      value={formData.turma}
                      onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm bg-white"
                    >
                      <option value="">Selecione sua turma</option>
                      {turmaOptions.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cargo */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                    <select
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm bg-white"
                    >
                      <option value="">Selecione seu cargo</option>
                      {cargoOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Trilha */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Trilha</label>
                    <select
                      value={formData.trilha}
                      onChange={(e) => setFormData({ ...formData, trilha: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm bg-white"
                    >
                      <option value="">Selecione sua trilha</option>
                      {TRILHA_OPTIONS.map((tr) => (
                        <option key={tr.value} value={tr.value}>
                          {tr.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Curso */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Curso</label>
                    <select
                      value={formData.curso}
                      onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm bg-white"
                    >
                      <option value="">Selecione seu curso</option>
                      {cursoOptions.map((cur) => (
                        <option key={cur.value} value={cur.value}>
                          {cur.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ano de Ingresso */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">
                      Ano de Ingresso
                    </label>
                    <input
                      type="number"
                      min={2000}
                      value={formData.anoIngresso}
                      onChange={(e) => setFormData({ ...formData, anoIngresso: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                      placeholder="Ex: 2024"
                    />
                  </div>

                  {/* Semestre */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Semestre</label>
                    <select
                      value={formData.semestre}
                      onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm bg-white"
                    >
                      <option value="">Selecione o semestre</option>
                      {SEMESTRE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Seção 3: Segurança e Alteração de Senha */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#4493AC]" />
                <span>Segurança e Alteração de Senha</span>
              </h3>
              <p className="text-xs text-gray-500">
                Preencha os campos abaixo apenas se desejar modificar sua senha de acesso.
              </p>

              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Senha Atual</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">Nova Senha</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3.5 font-semibold rounded-2xl transition-all shadow-md text-sm ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-[#4493AC] text-white hover:bg-[#243D6D]'
                }`}
              >
                {isSubmitting ? 'Salvando alterações...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;

