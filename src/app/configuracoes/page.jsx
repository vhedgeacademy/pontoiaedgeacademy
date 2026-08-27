'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ConfigSection from '@/components/ComponentesDasPaginas/Configurations/ConfigSection';
import { useAdminGuard } from '@/hooks/useAdminGuard';

const Configuracoes = () => {
  useAdminGuard();
  
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-0 md:ml-20 min-h-screen bg-white pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#4493AC]">Configurações</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
            {/* Coluna 1: Turmas */}
            <div className="w-full">
              <ConfigSection 
                title="Turmas" 
                endpoint="turmas"
                tipoItem="turma" 
                refreshKey={refreshKey}
                onUpdate={handleRefresh}
              />
            </div>

            {/* Coluna 2: Cargos */}
            <div className="w-full">
              <ConfigSection 
                title="Cargos" 
                endpoint="cargos"
                tipoItem="cargo" 
                refreshKey={refreshKey}
                onUpdate={handleRefresh}
              />
            </div>

            {/* Coluna 3: Cursos */}
            <div className="w-full md:col-span-2 lg:col-span-1">
              <ConfigSection 
                title="Cursos" 
                endpoint="cursos"
                tipoItem="curso" 
                refreshKey={refreshKey}
                onUpdate={handleRefresh}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;

