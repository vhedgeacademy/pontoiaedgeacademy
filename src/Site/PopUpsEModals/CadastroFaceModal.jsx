'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { getApiBase } from '@/config/api';

const NUM_FRAMES = 10;
const FRAME_INTERVAL_MS = 250;

const CadastroFaceModal = ({ userId, mode = 'replace', onClose, onSuccess }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | capturing | uploading | error
  const [error, setError] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        setError('Não foi possível acessar a webcam. Verifique as permissões.');
        setStatus('error');
      }
    };
    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = () =>
    new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    });

  const handleCapture = async () => {
    setStatus('capturing');
    const blobs = [];
    for (let i = 0; i < NUM_FRAMES; i++) {
      // eslint-disable-next-line no-await-in-loop
      const blob = await captureFrame();
      if (blob) blobs.push(blob);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, FRAME_INTERVAL_MS));
    }

    setStatus('uploading');
    try {
      const token = localStorage.getItem('ponto_ai_token');
      const form = new FormData();
      blobs.forEach((b, i) => form.append('files', b, `${i}.jpg`));
      form.append('mode', mode);
      const res = await fetch(`${getApiBase()}/users/${userId}/faces`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error(`upload falhou (${res.status})`);
      stopCamera();
      onSuccess?.();
    } catch (e) {
      setError(e.message || 'Falha no upload das imagens.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  const busy = status === 'capturing' || status === 'uploading';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#243D6D]">
            {mode === 'replace' ? 'Substituir Fotos' : 'Cadastrar Face'}
          </h3>
          <button onClick={handleClose} disabled={busy} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        {error && <p className="text-sm text-[#E83535] mb-3">{error}</p>}

        <button
          onClick={handleCapture}
          disabled={busy || status === 'error'}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#4493AC] text-white rounded-lg hover:bg-[#357a90] transition-colors disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          {status === 'capturing'
            ? 'Capturando...'
            : status === 'uploading'
            ? 'Enviando...'
            : 'Cadastrar'}
        </button>
      </div>
    </div>
  );
};

export default CadastroFaceModal;
