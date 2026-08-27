"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import UserAvatar from '@/components/UserAvatar';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User as UserIcon, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiBase } from '@/config/api';

const EditarPerfil = () => {
  const router = useRouter();
  // `useRouter()` não garante identidade estável entre renders. Com o objeto na
  // lista de dependências, o efeito refaz o fetch a cada render e cada resposta
  // dispara outro render — laço de refetch. Ver HorasSection.jsx.
  const routerRef = useRef(router);
  routerRef.current = router;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricula: '',
    turma: '',
    cargo: '',
    trilha: '',
    profileImage: null,
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_user') : null;
      const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : null;
      
      if (!userStr || !token) {
        routerRef.current.push('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      setUserId(user.id);
      
      try {
        // `GET /users/me`, e não `/users/{id}` + `/turmas` + `/cargos`: os três
        // exigem admin, então para o aluno — o dono desta página — devolviam 403
        // e o formulário nunca populava. O /me já traz turma e cargo resolvidos.
        const userRes = await fetch(`${getApiBase()}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
          const data = await userRes.json();
          const sp = data.student_profile || {};

          setFormData({
            name: data.name || '',
            email: data.email || '',
            matricula: sp.matricula || '',
            turma: sp.turma_name || 'Sem Turma',
            cargo: sp.cargo_name || 'Sem Cargo',
            trilha: sp.trilha || 'Geral',
            profileImage: data.profile_image || null,
            currentPassword: '',
            password: '',
            confirmPassword: ''
          });
        } else {
          // Sem este ramo o erro era invisível: a página renderizava campos
          // vazios e o usuário só descobria ao tentar salvar.
          setStatusMessage({
            type: 'error',
            text: 'Não foi possível carregar seus dados. Faça login novamente.'
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário", err);
        setStatusMessage({ type: 'error', text: 'Erro de conexão ao carregar seus dados.' });
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
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : '';

    if (!formData.name.trim()) {
      setStatusMessage({ type: 'error', text: 'Nome é obrigatório.' });
      return;
    }

    // Validação de alteração de senha
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
          text: 'A nova senha deve ter no mínimo 8 caracteres, contendo pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial.'
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Se informou nova senha, altera via /auth/change-password
      if (formData.password) {
        const passRes = await fetch(`${getApiBase()}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            current_password: formData.currentPassword,
            new_password: formData.password,
            confirm_password: formData.confirmPassword
          })
        });

        if (!passRes.ok) {
          const passErr = await passRes.json();
          setStatusMessage({ type: 'error', text: passErr.detail || 'Senha atual incorreta ou inválida.' });
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Atualizar perfil via /users/me
      //
      // `profile_image` só entra quando há foto. Enviá-lo sempre significava
      // mandar `null` quando o estado não carregou — e o backend trata null
      // como "remover", então salvar o nome apagava o avatar do usuário.
      const perfilPayload = { name: formData.name.trim() };
      if (formData.profileImage) {
        perfilPayload.profile_image = formData.profileImage;
      }

      const profileRes = await fetch(`${getApiBase()}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(perfilPayload)
      });

      if (profileRes.ok) {
        const updatedUser = await profileRes.json();
        
        // Atualizar localStorage
        const userStr = localStorage.getItem('ponto_ai_user');
        if (userStr) {
          const oldUser = JSON.parse(userStr);
          const newUser = {
            ...oldUser,
            name: updatedUser.name,
            profile_image: updatedUser.profile_image
          };
          localStorage.setItem('ponto_ai_user', JSON.stringify(newUser));
        }
        
        setStatusMessage({ type: 'success', text: 'Perfil e dados cadastrais atualizados com sucesso!' });
        window.dispatchEvent(new Event('storage'));
        setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4493AC] mb-6 sm:mb-8">Meu Perfil</h1>

          {statusMessage && (
            <div className={`p-4 mb-6 rounded-2xl font-medium text-sm flex items-center gap-3 shadow-sm ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {statusMessage.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 text-red-500" /> : <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
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
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              </label>
              <p className="text-xs text-gray-400 mt-2">Formatos permitidos: JPG, PNG. Tamanho máximo: 1MB.</p>
            </div>

            {/* Informações Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#4493AC]" />
                <span>Dados Pessoais</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">E-mail Institucional</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {formData.matricula && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Matrícula</p>
                    <p className="text-sm font-bold text-gray-800">{formData.matricula}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Turma</p>
                    <p className="text-sm font-bold text-gray-800">{formData.turma}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Cargo / Trilha</p>
                    <p className="text-sm font-bold text-gray-800">{formData.cargo} • {formData.trilha}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Segurança e Alteração de Senha */}
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
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
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
                    <label className="text-sm font-semibold text-gray-700 mb-1">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/40 text-gray-800 text-sm"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3.5 font-semibold rounded-2xl transition-all shadow-md text-sm ${isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#4493AC] text-white hover:bg-[#243D6D]'}`}
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

