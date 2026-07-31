'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'leads' | 'stats'>('leads');
  
  // Estado para controlar las 3 vistas diferentes de los leads
  const [activeView, setActiveView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');
  
  const [selectedStatus, setSelectedStatus] = useState('NUEVO/ SIN CONTACTAR');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoOrigen, setNuevoOrigen] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('leads').select('*');
    if (!error) setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('leads').insert([
      { name: nuevoNombre, phone: nuevoTelefono, origin: nuevoOrigen, status: selectedStatus }
    ]);

    if (!error) {
      setNuevoNombre('');
      setNuevoTelefono('');
      setNuevoOrigen('');
      setIsModalOpen(false);
      fetchLeads();
    }
  };

  const statuses = [
    'NUEVO/ SIN CONTACTAR',
    'EN SEGUIMIENTO',
    'CITA AGENDA',
    'PERDIDO/ NO RESPONDE',
  ];

  const filteredLeads = leads.filter(
    (lead) => (lead.status || 'NUEVO/ SIN CONTACTAR') === selectedStatus
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 font-sans pb-16 md:pb-0">
      
      {/* 1. BARRA SUPERIOR */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg tracking-tight text-gray-900">CRM GYM</span>
        </div>
        <button onClick={fetchLeads} className="text-gray-600 hover:text-black">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {/* 2. SELECTOR DE LAS 3 VISTAS EN LA PARTE SUPERIOR */}
      {currentTab === 'leads' && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-center space-x-2 sticky top-[53px] z-10 shadow-sm">
          <button
            onClick={() => setActiveView('lista')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeView === 'lista' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📋 Lista Compacta
          </button>
          <button
            onClick={() => setActiveView('tarjetas')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeView === 'tarjetas' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📇 Tarjetas
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeView === 'kanban' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📊 Columnas
          </button>
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL SEGÚN LA VISTA SELECCIONADA */}
      <main className="flex-1 overflow-y-auto pb-20">
        {currentTab === 'leads' ? (
          <div>
            {/* Filtro horizontal de estados (solo visible en vistas Lista y Tarjetas) */}
            {activeView !== 'kanban' && (
              <div className="bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap px-2 py-2 shadow-sm">
                <div className="flex space-x-2">
                  {statuses.map((status) => {
                    const count = leads.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status).length;
                    const isSelected = selectedStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-2 ${
                          isSelected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span>{status}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- VISTA 1: LISTA COMPACTA --- */}
            {activeView === 'lista' && (
              <div className="p-4 space-y-2 max-w-2xl mx-auto w-full">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{lead.name}</h4>
                      <p className="text-xs text-gray-500">{lead.phone} • <span className="text-blue-600">{lead.origin}</span></p>
                    </div>
                    <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold">
                      WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* --- VISTA 2: TARJETAS --- */}
            {activeView === 'tarjetas' && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto w-full">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-sm">{lead.name}</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{lead.origin || 'Directo'}</span>
                    </div>
                    <p className="text-xs text-gray-500">📞 {lead.phone}</p>
                    <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer" className="block text-center w-full py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow">
                      Contactar por WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* --- VISTA 3: COLUMNAS / KANBAN RÁPIDO --- */}
            {activeView === 'kanban' && (
              <div className="p-4 flex space-x-4 overflow-x-auto">
                {statuses.map((status) => {
                  const statusLeads = leads.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status);
                  return (
                    <div key={status} className="w-72 flex-shrink-0 bg-gray-200 rounded-xl p-3 flex flex-col max-h-[75vh]">
                      <h3 className="font-bold text-xs text-gray-700 mb-3 uppercase flex justify-between">
                        <span>{status}</span>
                        <span className="bg-gray-300 text-gray-800 px-1.5 rounded-full">{statusLeads.length}</span>
                      </h3>
                      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                        {statusLeads.map((lead) => (
                          <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <p className="font-bold text-xs text-gray-900">{lead.name}</p>
                            <p className="text-[11px] text-gray-500 mt-1">{lead.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ) : (
          /* VISTA ESTADÍSTICAS */
          <div className="p-4 max-w-2xl mx-auto w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Estadísticas Generales</h2>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between text-sm font-medium pb-2 border-b">
                <span>Total Leads</span>
                <span className="font-bold text-blue-600">{leads.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. BOTÓN FLOTANTE */}
      <button onClick={() => setIsModalOpen(true)} className="fixed right-5 bottom-20 md:bottom-6 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg z-30">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 5. NAVEGACIÓN INFERIOR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-20 shadow-lg">
        <button onClick={() => setCurrentTab('leads')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'leads' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">CRM GYM</span>
        </button>
        <button onClick={() => setCurrentTab('stats')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'stats' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Statistics</span>
        </button>
      </nav>

    </div>
  );
}
