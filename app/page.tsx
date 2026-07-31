'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'leads' | 'stats'>('leads');
  const [activeView, setActiveView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');
  const [selectedStatus, setSelectedStatus] = useState('NUEVO/ SIN CONTACTAR');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales y menús
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null); // Para ver/editar detalles o agendar

  // Campos para nuevo lead
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoOrigen, setNuevoOrigen] = useState('');
  const [fechaCita, setFechaCita] = useState('');

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
      { name: nuevoNombre, phone: nuevoTelefono, origin: nuevoOrigen, status: selectedStatus, appointment_date: fechaCita || null }
    ]);

    if (!error) {
      setNuevoNombre('');
      setNuevoTelefono('');
      setNuevoOrigen('');
      setFechaCita('');
      setIsModalOpen(false);
      fetchLeads();
    }
  };

  // Actualizar estado o fecha de cita de un lead existente
  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (!error) {
      fetchLeads();
      setSelectedLead(null);
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
    <div className="flex flex-col h-screen bg-slate-950 text-gray-100 font-sans pb-16 md:pb-0">
      
      {/* 1. BARRA SUPERIOR (ESTILO AZUL OSCURO) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-300 focus:outline-none transition"
          >
            {/* Ícono Menú Hamburguesa Dinámico */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg tracking-tight text-white">CRM GYM</span>
        </div>
        <button onClick={fetchLeads} className="text-gray-400 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {/* 2. MENÚ DESPLEGABLE LATERAL (DRAWER DINÁMICO) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 transition-opacity backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div className="relative w-80 bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-800">
            <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-blue-900 text-white">
              <div className="w-10 h-10 bg-white text-blue-900 rounded-full flex items-center justify-center font-bold text-lg shadow">
                A
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight">CRM AUTOMATIZALO</h2>
                <span className="text-xs text-blue-300">Panel Administrativo</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              <a href="#" className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition">
                <span className="mr-3">ℹ️</span> About
              </a>
              <a href="#" className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition">
                <span className="mr-3">💬</span> Feedback
              </a>
              <a href="#" className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition">
                <span className="mr-3">🔗</span> Share
              </a>
              <hr className="my-2 border-slate-800" />
              <a href="#" className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition">
                <span className="mr-3">📱</span> App Gallery
              </a>
            </div>

            <div className="p-4 border-t border-slate-800 text-xs text-gray-400 bg-slate-950">
              Sesión activa como Administrador
            </div>
          </div>
        </div>
      )}

      {/* 3. SELECTOR DE LAS 3 VISTAS */}
      {currentTab === 'leads' && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-center space-x-2 sticky top-[53px] z-10 shadow-sm">
          <button
            onClick={() => setActiveView('lista')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeView === 'lista' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
          >
            📋 Lista
          </button>
          <button
            onClick={() => setActiveView('tarjetas')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeView === 'tarjetas' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
          >
            📇 Tarjetas
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeView === 'kanban' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
          >
            📊 Columnas
          </button>
        </div>
      )}

      {/* 4. CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pb-20">
        {currentTab === 'leads' ? (
          <div>
            {/* Filtro horizontal de estados */}
            {activeView !== 'kanban' && (
              <div className="bg-slate-900 border-b border-slate-800 overflow-x-auto whitespace-nowrap px-2 py-2 shadow-sm">
                <div className="flex space-x-2">
                  {statuses.map((status) => {
                    const count = leads.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status).length;
                    const isSelected = selectedStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-2 ${
                          isSelected ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        <span>{status}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VISTA 1: LISTA COMPACTA */}
            {activeView === 'lista' && (
              <div className="p-4 space-y-2 max-w-2xl mx-auto w-full">
                {filteredLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-600 transition"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                      <p className="text-xs text-gray-400">{lead.phone} • <span className="text-blue-400">{lead.origin || 'Directo'}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`https://wa.me/${lead.phone}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold hover:bg-green-900 transition"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA 2: TARJETAS */}
            {activeView === 'tarjetas' && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto w-full">
                {filteredLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm space-y-3 cursor-pointer hover:border-blue-600 transition"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                      <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50">{lead.origin || 'Directo'}</span>
                    </div>
                    <p className="text-xs text-gray-400">📞 {lead.phone}</p>
                    {lead.appointment_date && (
                      <p className="text-xs text-amber-400 font-medium">📅 Cita: {lead.appointment_date}</p>
                    )}
                    <a 
                      href={`https://wa.me/${lead.phone}`} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block text-center w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow transition"
                    >
                      Contactar por WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA 3: KANBAN / COLUMNAS */}
            {activeView === 'kanban' && (
              <div className="p-4 flex space-x-4 overflow-x-auto">
                {statuses.map((status) => {
                  const statusLeads = leads.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status);
                  return (
                    <div key={status} className="w-72 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col max-h-[75vh]">
                      <h3 className="font-bold text-xs text-gray-300 mb-3 uppercase flex justify-between">
                        <span>{status}</span>
                        <span className="bg-slate-800 text-blue-400 px-1.5 rounded-full">{statusLeads.length}</span>
                      </h3>
                      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                        {statusLeads.map((lead) => (
                          <div 
                            key={lead.id} 
                            onClick={() => setSelectedLead(lead)}
                            className="bg-slate-950 p-3 rounded-lg shadow-sm border border-slate-800 cursor-pointer hover:border-blue-500 transition"
                          >
                            <p className="font-bold text-xs text-white">{lead.name}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{lead.phone}</p>
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
          /* ESTADÍSTICAS */
          <div className="p-4 max-w-2xl mx-auto w-full">
            <h2 className="text-lg font-bold text-white mb-4">Estadísticas Generales</h2>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm space-y-3">
              <div className="flex justify-between text-sm font-medium pb-2 border-b border-slate-800">
                <span className="text-gray-300">Total Leads</span>
                <span className="font-bold text-blue-400">{leads.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. MODAL PARA VER / EDITAR / AGENDAR CITA DE UN LEAD */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setSelectedLead(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Detalles del Prospecto</h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="text-sm font-bold text-white">{selectedLead.name}</p>
              <p className="text-xs text-gray-400">📞 {selectedLead.phone}</p>
              <p className="text-xs text-gray-400">🌐 Origen: {selectedLead.origin || 'Directo'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Mover a Estado:</label>
              <select
                value={selectedLead.status || 'NUEVO/ SIN CONTACTAR'}
                onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-2">
              <a
                href={`https://wa.me/${selectedLead.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold text-center transition shadow"
              >
                Abrir WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg text-xs font-bold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. BOTÓN FLOTANTE (+) */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="fixed right-5 bottom-20 md:bottom-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg z-30 transition transform active:scale-95"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 7. MODAL PARA CREAR NUEVO LEAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10">
            <h3 className="text-lg font-bold text-white mb-4">Nuevo Prospecto</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="Ej. 5493854123456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Origen</label>
                <input
                  type="text"
                  value={nuevoOrigen}
                  onChange={(e) => setNuevoOrigen(e.target.value)}
                  placeholder="Ej. Instagram Ads"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Fecha de Cita (Opcional)</label>
                <input
                  type="date"
                  value={fechaCita}
                  onChange={(e) => setFechaCita(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs font-bold transition"
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

      {/* 8. BARRA DE NAVEGACIÓN INFERIOR MÓVIL */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 z-20 shadow-lg">
        <button onClick={() => setCurrentTab('leads')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'leads' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">CRM GYM</span>
        </button>
        <button onClick={() => setCurrentTab('stats')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'stats' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Statistics</span>
        </button>
      </nav>

    </div>
  );
}
