'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ScanFace, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getApiBase } from '@/config/api';

export default function ReconhecimentoIdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [recognitionIds, setRecognitionIds] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const apiBase = getApiBase();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ponto_ai_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Carrega as câmeras
        const camRes = await fetch(`${apiBase}/recognition/cameras`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let camList = [];
        if (camRes.ok) {
          const camData = await camRes.json();
          camList = camData.cameras || [];
          setCameras(camList);
        }

        // 2. Carrega os IDs já vinculados
        const idsRes = await fetch(`${apiBase}/users/me/recognition-ids`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (idsRes.ok) {
          const idsData = await idsRes.json();
          const initialMap = {};
          camList.forEach((cam) => {
            initialMap[cam] = idsData[cam] || (idsData.recognition_ids && idsData.recognition_ids[cam]) || '';
          });
          setRecognitionIds(initialMap);
        }
      } catch (err) {
        setErrorMessage('Erro ao carregar dados das câmeras.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleIdChange = (cameraName, value) => {
    // Permite apenas dígitos numéricos
    const numericValue = value.replace(/\D/g, '');
    setRecognitionIds((prev) => ({
      ...prev,
      [cameraName]: numericValue,
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const token = localStorage.getItem('ponto_ai_token');
    try {
      const res = await fetch(`${apiBase}/users/me/recognition-ids`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recognition_ids: recognitionIds }),
      });

      if (res.ok) {
        setSuccessMessage('IDs de reconhecimento facial salvos com sucesso!');
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.detail || 'Não foi possível salvar os IDs.');
      }
    } catch (err) {
      setErrorMessage('Erro de conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 md:ml-20 p-4 md:p-8 pt-20 md:pt-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-[#4493AC] rounded-2xl">
              <ScanFace className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#243D6D]">
                Reconhecimento ID
              </h1>
              <p className="text-sm text-gray-500">
                Configure seu identificador numérico de usuário para cada terminal facial da instituição.
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#4493AC]" />
                <span className="text-sm">Carregando terminais configurados...</span>
              </div>
            ) : cameras.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ScanFace className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-gray-700">Nenhum terminal facial ativo encontrado.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Entre em contato com a administração caso as câmeras já devam estar disponíveis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cameras.map((cameraName) => (
                    <div key={cameraName} className="space-y-2">
                      <label
                        htmlFor={`cam-${cameraName}`}
                        className="block text-sm font-bold text-gray-700"
                      >
                        {cameraName}
                      </label>
                      <div className="relative">
                        <input
                          id={`cam-${cameraName}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={recognitionIds[cameraName] || ''}
                          onChange={(e) => handleIdChange(cameraName, e.target.value)}
                          placeholder="Ex: 133"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/30 focus:border-[#4493AC] transition-all"
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        Identificador numérico cadastrado no terminal para {cameraName}.
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#4493AC] hover:bg-[#387c92] text-white font-bold rounded-2xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
