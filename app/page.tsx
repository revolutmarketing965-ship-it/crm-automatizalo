'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CRMPage() {
  const [currentTab, setCurrentTab] = useState<'dirige' | 'citas' | 'socios' | 'equipo'>('dirige');
  const [activeView, setActiveView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');

  // Estados de la base de datos
  const [dirige, setDirige] = useState<any[]>([]);
  const [equipoCitas, setEquipoCitas] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [perfilesEquipo, setPerfilesEquipo] = useState<any[]>([]);

  // Estados de carga
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Modales y Menús
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false); // Menú de Onboarding
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
  const [isSocioModalOpen, setIsSocioModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Campos para formularios
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [origen, setOrigen] = useState('Facebook Ads');
  const [savingLead, setSavingLead] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [savingCita, setSavingCita] = useState(false);

  const [selectedSocioLeadId, setSelectedSocioLeadId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
  const [savingSocio, setSavingSocio] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('vendedor');
  const [savingUser, setSavingUser] = useState(false);

  // Cargar datos
  const fetchDirige = async () => {
    setLoadingLeads(true);
    const { data } = await supabase.from('leads').select('*');
    if (data) setDirige(data);
    setLoadingLeads(false);
  };

  const fetchCitas = async () => {
    setLoadingCitas(true);
    const { data } = await supabase.from('appointments').select('*, leads(name, phone)');
    if (data) setEquipoCitas(data);
    setLoadingCitas(false);
  };

  const fetchSocios = async () => {
    setLoadingSocios(true);
    const { data } = await supabase.from('socios').select('*, leads(name, phone)');
    if (data) setSocios(data);
    setLoadingSocios(false);
  };

  const fetchTeam = async () => {
    setLoadingTeam(true);
    const { data } = await supabase.from('profiles').select('*');
    if (data) setPerfilesEquipo(data);
    setLoadingTeam(false);
  };

  useEffect(() => {
    fetchDirige();
    fetchCitas();
    fetchSocios();
    fetchTeam();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    const { error } = await supabase.from('leads').insert([{ name: nombre, phone: telefono, origin }]);
    setSavingLead(false);
    if (!error) {
      setNombre('');
      setTelefono('');
      setIsLeadModalOpen(false);
      fetchDirige();
    }
  };

  const handleCreateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCita(true);
    const { error } = await supabase.from('appointments').insert([{ lead_id: selectedLeadId, appointment_date: fechaCita }]);
    setSavingCita(false);
    if (!error) {
      setFechaCita('');
      setIsCitaModalOpen(false);
      fetchCitas();
    }
  };

  const handleCreateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocio(true);
    const { error } = await supabase.from('socios').insert([{ lead_id: selectedSocioLeadId, payment_status: paymentStatus }]);
    setSavingSocio(false);
    if (!error) {
      setIsSocioModalOpen(false);
      fetchSocios();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    const { error } = await supabase.auth.signUp({
      email: nuevoEmail,
      password: nuevoPassword,
      options: { data: { full_name: nuevoNombre, role: nuevoRol } }
    });
    setSavingUser(false);
    if (!error) {
      alert('Usuario creado con éxito');
      setNuevoNombre('');
      setNuevoEmail('');
      setNuevoPassword('');
      setIsUserModalOpen(false);
      fetchTeam();
    } else {
      alert('Error al crear usuario: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-gray-100 font-sans pb-16 md:pb-0">
      
      {/* 1. BARRA SUPERIOR (ESTILO AZUL OSCURO) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-300 focus:outline-none transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg tracking-tight text-white">CRM GYM</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botón Onboarding */}
          <button 
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center space-x-1"
          >
            <span>🚀 Onboarding</span>
          </button>
        </div>
      </header>

      {/* 2. MENÚ DESPLEGABLE LATERAL (DRAWER) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
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
              <button onClick={() => { setIsOnboardingOpen(true); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">🚀</span> Guía de Onboarding
              </button>
              <button onClick={() => { setCurrentTab('dirige'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">🎯</span> Dirige (Leads)
              </button>
              <button onClick={() => { setCurrentTab('citas'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">📅</span> Citas y Agendamientos
              </button>
              <button onClick={() => { setCurrentTab('socios'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">👥</span> Socios (Compradores)
              </button>
              <button onClick={() => { setCurrentTab('equipo'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">⚙️</span> Equipo / Usuarios
              </button>
            </div>

            <div className="p-4 border-t border-slate-800 text-xs text-gray-400 bg-slate-950">
              Sesión activa como Administrador
            </div>
          </div>
        </div>
      )}

      {/* 3. MENÚ DE ONBOARDING MODAL */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={() => setIsOnboardingOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-5 text-gray-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>🚀</span> <span>Onboarding & Primeros Pasos</span>
              </h3>
              <button onClick={() => setIsOnboardingOpen(false)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            
            <div className="space-y-4 text-xs md:text-sm text-gray-300 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-sm">1. Gestión de Prospectos (Dirige)</h4>
                <p>Aquí ingresan de forma automática o manual tus clientes potenciales de campañas. Usa el botón flotante (+) para registrar uno nuevo.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-sm">2. Vistas Adaptables</h4>
                <p>En la parte superior puedes alternar entre **Lista**, **Tarjetas** o **Columnas** para organizar la vista según tu comodidad en el celular o PC.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-sm">3. Citas y Agendamientos</h4>
                <p>Controla las visitas coordinadas con tus prospectos para asegurar cierres en la recepción del gimnasio.</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-sm">4. Gestión de Usuarios y Equipo</h4>
                <p>Crea cuentas independientes para tus recepcionistas desde la pestaña "Equipo / Usuarios" manteniendo todo sincronizado.</p>
              </div>
            </div>

            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
            >
              ¡Entendido, Comenzar!
            </button>
          </div>
        </div>
      )}

      {/* 4. SELECTOR DE VISTAS (SOLO EN SECCIÓN DIRIGE) */}
      {currentTab === 'dirige' && (
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

      {/* 5. CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 max-w-4xl mx-auto w-full">
        
        {/* SECCIÓN 1: DIRIGE (LEADS) */}
        {currentTab === 'dirige' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Gestión de Leads ({dirige.length})</h2>
              <button onClick={() => setIsLeadModalOpen(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow">
                + Nuevo Lead
              </button>
            </div>

            {loadingLeads ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando prospectos...</p>
            ) : dirige.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay leads registrados.</p>
            ) : activeView === 'lista' ? (
              <div className="space-y-2">
                {dirige.map((l) => (
                  <div key={l.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center shadow-sm">
                    <div>
                      <h4 className="font-bold text-white text-sm">{l.name}</h4>
                      <p className="text-xs text-gray-400">{l.phone} • <span className="text-blue-400">{l.origin}</span></p>
                    </div>
                    <a href={`https://wa.me/${l.phone}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">
                      WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            ) : activeView === 'tarjetas' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dirige.map((l) => (
                  <div key={l.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 shadow-sm">
                    <h4 className="font-bold text-white text-sm">{l.name}</h4>
                    <p className="text-xs text-gray-400">📞 {l.phone}</p>
                    <a href={`https://wa.me/${l.phone}`} target="_blank" rel="noreferrer" className="block text-center w-full py-2 bg-green-600 text-white rounded-lg text-xs font-bold">
                      Contactar por WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center text-gray-400 text-xs">
                Vista de Columnas activa ({dirige.length} prospectos totales)
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 2: CITAS Y AGENDAMIENTOS */}
        {currentTab === 'citas' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Citas Programadas</h2>
              <button onClick={() => setIsCitaModalOpen(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow">
                + Agendar Cita
              </button>
            </div>
            {loadingCitas ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando citas...</p>
            ) : equipoCitas.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay citas registradas.</p>
            ) : (
              <div className="space-y-2">
                {equipoCitas.map((c) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.leads?.name || 'Cliente'}</h4>
                      <p className="text-xs text-amber-400">📅 Fecha: {c.appointment_date}</p>
                    </div>
                    <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-700 px-2 py-1 rounded-lg">Agendado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 3: SOCIOS (COMPRADORES) */}
        {currentTab === 'socios' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Socios Activos</h2>
              <button onClick={() => setIsSocioModalOpen(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow">
                + Nuevo Socio
              </button>
            </div>
            {loadingSocios ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando socios...</p>
            ) : socios.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay socios registrados.</p>
            ) : (
              <div className="space-y-2">
                {socios.map((s) => (
                  <div key={s.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.leads?.name || 'Socio'}</h4>
                      <p className="text-xs text-gray-400">Estado: <span className="text-green-400 font-bold">{s.payment_status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 4: EQUIPO / USUARIOS */}
        {currentTab === 'equipo' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Gestión de Equipo</h2>
              <button onClick={() => setIsUserModalOpen(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow">
                + Crear Usuario
              </button>
            </div>
            {loadingTeam ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando equipo...</p>
            ) : perfilesEquipo.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay usuarios registrados.</p>
            ) : (
              <div className="space-y-2">
                {perfilesEquipo.map((p) => (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.full_name || 'Usuario'}</h4>
                      <p className="text-xs text-gray-400">Rol: <span className="text-blue-400 font-bold uppercase">{p.role || 'Vendedor'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 6. BOTÓN FLOTANTE RÁPIDO (+) */}
      <button 
        onClick={() => setIsLeadModalOpen(true)} 
        className="fixed right-5 bottom-20 md:bottom-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg z-30 transition transform active:scale-95"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* MODALES DE CREACIÓN */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsLeadModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Prospecto</h3>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <input type="text" required placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="text" required placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsLeadModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingLead} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingLead ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCitaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsCitaModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Agendar Cita</h3>
            <form onSubmit={handleCreateCita} className="space-y-3">
              <select required value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="">Selecciona un Lead</option>
                {dirige.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <input type="date" required value={fechaCita} onChange={e => setFechaCita(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsCitaModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingCita} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingCita ? 'Agendando...' : 'Agendar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSocioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsSocioModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Socio</h3>
            <form onSubmit={handleCreateSocio} className="space-y-3">
              <select required value={selectedSocioLeadId} onChange={e => setSelectedSocioLeadId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="">Selecciona un Lead</option>
                {dirige.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsSocioModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingSocio} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingSocio ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Crear Usuario / Vendedor</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input type="text" required placeholder="Nombre Completo" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="email" required placeholder="Correo electrónico" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="password" required placeholder="Contraseña" value={nuevoPassword} onChange={e => setNuevoPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="vendedor">Vendedor</option>
                <option value="administrador">Administrador</option>
              </select>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingUser} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingUser ? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BARRA DE NAVEGACIÓN INFERIOR (TIPO APP MÓVIL) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 z-20 shadow-lg">
        <button onClick={() => setCurrentTab('dirige')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'dirige' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Dirige</span>
        </button>
        <button onClick={() => setCurrentTab('citas')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'citas' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Citas</span>
        </button>
        <button onClick={() => setCurrentTab('socios')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'socios' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Socios</span>
        </button>
        <button onClick={() => setCurrentTab('equipo')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'equipo' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Equipo</span>
        </button>
      </nav>

    </div>
  );
}
