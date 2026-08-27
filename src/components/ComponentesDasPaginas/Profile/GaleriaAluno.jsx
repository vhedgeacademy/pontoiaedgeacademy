'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ImageOff, Camera, RefreshCw } from 'lucide-react';
import CadastroFaceModal from '@/Site/PopUpsEModals/CadastroFaceModal';
import { getApiBase } from '@/config/api';


const GaleriaAluno = ({ userId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // 'append' | 'replace' | null
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('ponto_ai_token'));
  }, []);

  const fetchFaces = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const res = await fetch(`${getApiBase()}/users/${userId}/faces`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (e) {
      console.error('Erro ao buscar galeria de faces:', e);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchFaces();
  }, [fetchFaces]);

  const handleSuccess = () => {
    setModalMode(null);
    setLoading(true);
    fetchFaces();
  };

  // <img> não envia header Authorization: autentica via query token (mesmo padrão do MJPEG).
  const srcFor = (path) => `${getApiBase()}${path}?token=${token}`;

  return (
    <div className="border border-black bg-transparent rounded-3xl p-6">
      <h3 className="text-2xl font-thin text-[#2C3E50] text-center mb-9 font-['Inter']">
        Galeria do Aluno
      </h3>

      {images.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
            {images.map((path) => (
              <div
                key={path}
                className="aspect-square bg-gray-200 rounded-2xl overflow-hidden"
              >
                <img
                  src={srcFor(path)}
                  alt="Face cadastrada"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => setModalMode('replace')}
              className="flex items-center gap-2 px-8 py-3 bg-[#4493AC] text-white rounded-lg hover:bg-[#357a90] transition-colors font-[Inter]"
            >
              <RefreshCw className="w-5 h-5" />
              Substituir Fotos
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 max-w-md mx-auto">
          <div className="w-12 h-12 bg-[#D4E8ED] rounded-full flex items-center justify-center mb-3 text-[#4493AC]">
            <ImageOff className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-gray-700">Galeria vazia</p>
          <p className="text-xs text-gray-400 mt-1 text-center mb-6">
            Nenhuma foto cadastrada para o reconhecimento facial deste aluno.
          </p>
          <button
            onClick={() => setModalMode('replace')}
            className="flex items-center gap-2 px-8 py-3 bg-[#4493AC] text-white rounded-lg hover:bg-[#357a90] transition-colors font-[Inter]"
          >
            <Camera className="w-5 h-5" />
            Cadastrar Face
          </button>
        </div>
      )}

      {modalMode && (
        <CadastroFaceModal
          userId={userId}
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default GaleriaAluno;
