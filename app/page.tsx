'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase con las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'leads' | 'stats'>('leads');
  const [selectedStatus, setSelectedStatus] = useState('NUEVO/ SIN CONTACTAR');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados del formulario para nuevo lead
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoOrigen, setNuevoOrigen] = useState('');

  // Cargar leads desde Supabase
  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('leads').select('*');
    if (error) {
      console.error('Error al cargar leads:', error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Función para registrar un nuevo lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('leads').insert([
      {
        name: nuevoNombre,
        phone: nuevoTelefono,
        origin: nuevoOrigen,
        status: selectedStatus,
      },
    ]);

    if (!error) {
      setNuevoNombre('');
      setNuevoTelefono('');
      setNuevoOrigen('');
      setIsModalOpen(false);
      fetchLeads();
    } else {
      alert('Hubo un error al guardar el lead');
    }
  };

  // Filtrar leads según la pestaña superior seleccionada
  const filteredLeads = leads.filter(
    (lead) => (lead.status || 'NUEVO/ SIN CONTACTAR') === selectedStatus
  );

  const statuses = [
    'NUEVO/ SIN CONTACTAR',
    'EN SEGUIMIENTO',
    'CITA AGENDA',
    'PERDIDO/ NO RESPONDE',
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 font-sans select-none pb-16 md:pb-0">
      
      {/* 1. BARRA SUPERIOR (HEADER) */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-700 focus:outline-none"
          >
            {/* Icono Menú Hamburguesa */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg tracking-tight text-gray-900">CRM GYM</span>
        </div>

        <div className="flex items-center space-x-4 text-gray-600">
          <button onClick={fetchLeads} className="hover:text-black transition">
            {/* Icono Recargar */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. MENÚ LATERAL DESPLEGABLE (DRAWER) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fondo oscuro transparente */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Panel del menú */}
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-blue-600 text-white">
              <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shadow">
                A
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight">CRM AUTOMATIZALO</h2>
                <span className="text-xs text-blue-100">Panel Administrativo</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <span className="mr-3 text-gray-400">ℹ️</span> About
              </a>
              <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <span className="mr-3 text-gray-400">💬</span> Feedback
              </a>
              <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <span className="mr-3 text-gray-400">🔗</span> Share
              </a>
              <hr className="my-2 border-gray-100" />
              <a href="#" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                <span className="mr-3 text-gray-400">📱</span> App Gallery
              </a>
            </div>

            <div className="p-4 border-t border-gray-100 text-xs text-gray-500 bg-gray-50">
              Sesión activa como Administrador
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pb-20">
        {currentTab === 'leads' ? (
          <div>
            {/* Pestañas de Estados Horizontales con Contadores */}
            <div className="bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm">
              <div className="flex px-2 space-x-2 py-2">
                {statuses.map((status) => {
                  const count = leads.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status).length;
                  const isSelected = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <span>{status}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listado de Leads */}
            <div className="p-4 space-y-3 max-w-2xl mx-auto w-full">
              {loading ? (
                <div className="text-center py-20 text-gray-400 text-sm">Cargando prospectos...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 p-6 mt-4 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium">No hay leads en este estado</p>
                  <p className="text-gray-400 text-xs mt-1">Pulsa el botón de abajo a la derecha para agregar uno.</p>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{lead.name || 'Sin Nombre'}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{lead.phone || 'Sin Teléfono'} • <span className="text-blue-600 font-medium">{lead.origin || 'Directo'}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`https://wa.me/${lead.phone}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-xs font-bold"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* SECCIÓN DE ESTADÍSTICAS */
          <div className="p-4 max-w-2xl mx-auto w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Estadísticas Generales</h2>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Total de Prospectos</span>
                <span className="text-lg font-bold text-blue-600">{leads.length}</span>
              </div>
              <div className="space-y-2 pt-2">
                {statuses.map((status) => {
                  const count = leads.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status).length;
                  return (
                    <div key={status} className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">{status}</span>
                      <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. BOTÓN FLOTANTE DE ACCIÓN RÁPIDA (+) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-5 bottom-20 md:bottom-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 z-30"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 5. MODAL PARA CREAR NUEVO LEAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nuevo Prospecto</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Lead</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="Ej. 5493854123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Origen</label>
                <input
                  type="text"
                  value={nuevoOrigen}
                  onChange={(e) => setNuevoOrigen(e.target.value)}
                  placeholder="Ej. Instagram Ads"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BARRA DE NAVEGACIÓN INFERIOR MÓVIL (TIPO APP) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-20 shadow-lg">
        <button
          onClick={() => setCurrentTab('leads')}
          className={`flex flex-col items-center flex-1 py-1 transition ${currentTab === 'leads' ? 'text-blue-600 font-bold' : 'text-gray-400 font-medium'}`}
        >
          {/* Icono Lista */}
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-[10px]">CRM GYM</span>
        </button>

        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center flex-1 py-1 transition ${currentTab === 'stats' ? 'text-blue-600 font-bold' : 'text-gray-400 font-medium'}`}
        >
          {/* Icono Estadísticas */}
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px]">Statistics</span>
        </button>
      </nav>

    </div>
  );
}
