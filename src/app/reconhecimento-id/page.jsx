'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  ScanFace,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ZoomIn,
  X,
  Check,
} from 'lucide-react';
import { getApiBase } from '@/config/api';
import { getTerminalImage } from '@/config/terminals';

export { getTerminalImage };

export default function ReconhecimentoIdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [recognitionIds, setRecognitionIds] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

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
        const camRes = await fetch(`${apiBase}/recognition/cameras`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let camList = [];
        if (camRes.ok) {
          const camData = await camRes.json();
          camList = camData.cameras || [];
          setCameras(camList);
        }

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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-[#4493AC] rounded-2xl">
              <ScanFace className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#243D6D]">
                Reconhecimento ID
              </h1>
              <p className="text-sm text-gray-500">
                Configure seu identificador numérico cadastrado em cada terminal facial da instituição. Clique na foto para ampliar.
              </p>
            </div>
          </div>

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
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cameras.map((cameraName) => {
                    const imageSrc = getTerminalImage(cameraName);
                    const isConfigured = Boolean(recognitionIds[cameraName]);

                    return (
                      <div
                        key={cameraName}
                        className="bg-slate-50/70 border border-gray-200/80 rounded-3xl p-4 md:p-5 flex flex-col justify-between hover:border-[#4493AC]/40 hover:shadow-md transition-all group"
                      >
                        {/* Terminal Photo */}
                        <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-gray-200/70 group/img">
                          {imageSrc ? (
                            <div
                              onClick={() => setSelectedPreviewImage({ src: imageSrc, name: cameraName })}
                              className="w-full h-full cursor-pointer relative"
                              title={`Clique para ampliar a foto do terminal ${cameraName}`}
                            >
                              <img
                                src={imageSrc}
                                alt={`Terminal ${cameraName}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[1px]">
                                <ZoomIn className="w-4 h-4" />
                                <span>Ampliar foto</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/60 border border-dashed border-slate-200">
                              <ScanFace className="w-10 h-10 text-slate-300 mb-1" />
                              <span className="text-xs font-medium">Terminal Facial</span>
                            </div>
                          )}
                        </div>

                        {/* Title and Badge */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <label
                              htmlFor={`cam-${cameraName}`}
                              className="block text-sm md:text-base font-bold text-[#243D6D] truncate"
                              title={cameraName}
                            >
                              {cameraName}
                            </label>
                            {isConfigured ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                <Check className="w-3 h-3" /> ID: {recognitionIds[cameraName]}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                Pendente
                              </span>
                            )}
                          </div>

                          {/* ID Input */}
                          <div className="relative">
                            <input
                              id={`cam-${cameraName}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={recognitionIds[cameraName] || ''}
                              onChange={(e) => handleIdChange(cameraName, e.target.value)}
                              placeholder="Ex: 133"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4493AC]/30 focus:border-[#4493AC] transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400">
                            Identificador cadastrado no dispositivo físico.
                          </p>
                        </div>
                      </div>
                    );
                  })}
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

      {/* Image Preview Modal */}
      {selectedPreviewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl animate-in zoom-in-95 border border-gray-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100/70 text-[#4493AC] rounded-xl">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#243D6D]">
                    Visualização do Terminal
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedPreviewImage.name}
                  </p>
                </div>
              </div>
              <button
                aria-label="Fechar visualização"
                onClick={() => setSelectedPreviewImage(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-slate-950 flex items-center justify-center p-2">
              <img
                src={selectedPreviewImage.src}
                alt={`Terminal ${selectedPreviewImage.name}`}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Dispositivo físico instalado no local: <strong>{selectedPreviewImage.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

