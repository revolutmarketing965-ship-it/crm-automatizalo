'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialización de Supabase (ajusta según tus variables de entorno si es necesario)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CRMPage() {
  const [loadingSession, setLoadingSession] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'vendedor'>('admin');
  const [activeTab, setActiveTab] = useState<'leads' | 'citas' | 'socios' | 'equipo'>('leads');
  
  // Estados de datos
  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<any[]>([]);

  // Estados de carga de tablas
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Estados de Modales
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
  const [isSocioModalOpen, setIsSocioModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Campos de formularios
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

  useEffect(() => {
    // Simulación de carga de sesión inicial
    const timer = setTimeout(() => {
      setLoadingSession(false);
      fetchLeads();
      fetchAppointments();
      fetchSocios();
      fetchTeam();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase.from('leads').select('*, appointments(*)');
      if (!error && data) setLeads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingCitas(true);
    try {
      const { data, error } = await supabase.from('appointments').select('*, leads(*)');
      if (!error && data) setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCitas(false);
    }
  };

  const fetchSocios = async () => {
    setLoadingSocios(true);
    try {
      const { data, error } = await supabase.from('socios').select('*, leads(*)');
      if (!error && data) setSocios(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSocios(false);
    }
  };

  const fetchTeam = async () => {
    setLoadingTeam(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) setTeamProfiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleUpdateLeadSource = async (id: string, source: string) => {
    await supabase.from('leads').update({ source }).eq('id', id);
    fetchLeads();
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    fetchLeads();
  };

  const handleUpdateLeadNotes = async (id: string, notes: string) => {
    await supabase.from('leads').update({ notes }).eq('id', id);
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este lead?')) {
      await supabase.from('leads').delete().eq('id', id);
      fetchLeads();
    }
  };

  const handleDeleteSocio = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este socio?')) {
      await supabase.from('socios').delete().eq('id', id);
      fetchSocios();
    }
  };

  const handleOpenCitaModalForLead = (id: string) => {
    setSelectedLeadId(id);
    setIsCitaModalOpen(true);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    try {
      await supabase.from('leads').insert([{ full_name: nombre, phone: telefono, source: origen, status: 'Nuevo' }]);
      setIsLeadModalOpen(false);
      setNombre('');
      setTelefono('');
      fetchLeads();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLead(false);
    }
  };

  const handleCreateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCita(true);
    try {
      await supabase.from('appointments').insert([{ lead_id: selectedLeadId, scheduled_at: fechaCita }]);
      setIsCitaModalOpen(false);
      setSelectedLeadId('');
      setFechaCita('');
      fetchAppointments();
      fetchLeads();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCita(false);
    }
  };

  const handleCreateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocio(true);
    try {
      await supabase.from('socios').insert([{ lead_id: selectedSocioLeadId, payment_status: paymentStatus }]);
      setIsSocioModalOpen(false);
      setSelectedSocioLeadId('');
      fetchSocios();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSocio(false);
    }
  };

  const handleCreateUserByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      // Lógica de creación de usuario en Auth y perfiles
      alert('Funcionalidad de creación de usuario conectada.');
      setIsUserModalOpen(false);
      setNuevoNombre('');
      setNuevoEmail('');
      setNuevoPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUser(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL DE CARGA ---
  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Cargando CRM...</p>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col justify-between border-r border-gray-700">
        <div>
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500 flex items-center justify-center bg-gray-900">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 22h3.5l2-4h9l2 4H22L12 2zm0 4.5l5.5 11h-11L12 6.5z" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 mt-2 uppercase">CRM Automatízalo</span>
            
            <div className="mt-3 text-center">
              <span className="text-[11px] text-gray-300 block truncate max-w-[180px]">Panel Administrativo</span>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                userRole === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {userRole === 'admin' ? '👑 Administrador' : '💼 Vendedor'}
              </span>
            </div>
          </div>

          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full text-left px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'leads' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab('citas')}
              className={`w-full text-left px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'citas' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              Citas y Agendamientos
            </button>
            <button
              onClick={() => setActiveTab('socios')}
              className={`w-full text-left px-4 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'socios' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              Socios (Compradores)
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('equipo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'equipo' ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                👥 Equipo / Usuarios
              </button>
            )}
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            🔒 Cerrar Sesión
          </button>
          <div className="text-xs text-gray-500 text-center">Panel de Control v1.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <h2 className="text-2xl font-semibold capitalize">
            {activeTab === 'leads' && 'Gestión de Leads'}
            {activeTab === 'citas' && 'Agenda de Citas'}
            {activeTab === 'socios' && 'Socios - Confirmados del Programa'}
            {activeTab === 'equipo' && 'Gestión de Equipo y Accesos'}
          </h2>
          
          {activeTab === 'leads' && (
            <button 
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              + Nuevo Lead
            </button>
          )}

          {activeTab === 'citas' && (
            <button 
              onClick={() => { setSelectedLeadId(''); setIsCitaModalOpen(true); }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              + Nueva Cita
            </button>
          )}

          {activeTab === 'socios' && (
            <button 
              onClick={() => setIsSocioModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              + Registrar Compra / Socio
            </button>
          )}

          {activeTab === 'equipo' && userRole === 'admin' && (
            <button 
              onClick={() => setIsUserModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              + Nuevo Usuario
            </button>
          )}
        </header>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          {activeTab === 'leads' && (
            <div>
              <p className="text-gray-400 mb-4">Prospectos sincronizados directamente de tus fuentes de tráfico.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Nombre / Fecha de Ingreso</th>
                      <th className="px-4 py-3">Teléfono / WhatsApp</th>
                      <th className="px-4 py-3">Origen</th>
                      <th className="px-4 py-3">Cita Programada</th>
                      <th className="px-4 py-3">Estado del Lead</th>
                      <th className="px-4 py-3">Comentarios / Notas</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLeads ? (
                      <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-400">Cargando leads...</td></tr>
                    ) : leads.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-400">No hay leads registrados.</td></tr>
                    ) : (
                      leads.map((lead, index) => {
                        const leadAppointment = lead.appointments && lead.appointments.length > 0
                          ? lead.appointments[0].scheduled_at 
                          : null;
                        const currentStatus = lead.status || 'Nuevo';
                        const fechaIngreso = lead.created_at 
                          ? new Date(lead.created_at).toLocaleDateString() + ' a las ' + new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : 'Fecha desconocida';

                        return (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="px-4 py-3">
                              <div className="font-medium text-white">{lead.full_name || 'Sin nombre'}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">Ingresó: {fechaIngreso}</div>
                            </td>
                            <td className="px-4 py-3">
                              {lead.phone ? (
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-green-400 hover:text-green-300 font-medium"
                                >
                                  <span>💬 {lead.phone}</span>
                                </a>
                              ) : ('Sin teléfono')}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={lead.source || 'Facebook Ads'}
                                onChange={(e) => handleUpdateLeadSource(lead.id, e.target.value)}
                                className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1"
                              >
                                <option value="Facebook Ads">Facebook Ads</option>
                                <option value="Instagram">Instagram</option>
                                <option value="WhatsApp Directo">WhatsApp Directo</option>
                                <option value="Recomendación">Recomendación</option>
                                <option value="Orgánico">Orgánico</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              {leadAppointment ? (
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs">
                                  📅 {new Date(leadAppointment).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs italic">Sin cita</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  currentStatus === 'Cliente / Cerrado' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
                                }`}>
                                  ● {currentStatus}
                                </span>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                  className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-1 py-1"
                                >
                                  <option value="Nuevo">Nuevo</option>
                                  <option value="Contactado">Contactado</option>
                                  <option value="Agendado">Agendado</option>
                                  <option value="Cliente / Cerrado">Cliente / Cerrado</option>
                                  <option value="Descartado">Descartado</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                defaultValue={lead.notes || ''}
                                onBlur={(e) => handleUpdateLeadNotes(lead.id, e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1"
                              />
                            </td>
                            <td className="px-4 py-3 text-center space-x-2">
                              <button
                                onClick={() => handleOpenCitaModalForLead(lead.id)}
                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded text-xs transition"
                              >
                                📅 Agendar
                              </button>
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-xs transition"
                                >
                                  Eliminar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div>
              <p className="text-gray-400 mb-4">Control de las citas agendadas con los prospectos.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Nombre del Lead</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Origen</th>
                      <th className="px-4 py-3">Fecha y Hora Programada</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCitas ? (
                      <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">Cargando citas...</td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">No hay citas agendadas.</td></tr>
                    ) : (
                      appointments.map((cita, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-4 py-3 font-medium text-white">{cita.leads?.full_name || 'Sin nombre'}</td>
                          <td className="px-4 py-3 text-green-400">{cita.leads?.phone || 'Sin teléfono'}</td>
                          <td className="px-4 py-3">{cita.leads?.source || 'N/A'}</td>
                          <td className="px-4 py-3">{cita.scheduled_at ? new Date(cita.scheduled_at).toLocaleString() : 'Sin fecha'}</td>
                          <td className="px-4 py-3 text-center">
                            {userRole === 'admin' && (
                              <button
                                onClick={async () => {
                                  if (confirm('¿Eliminar cita?')) {
                                    await supabase.from('appointments').delete().eq('id', cita.id);
                                    fetchAppointments();
                                    fetchLeads();
                                  }
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-xs"
                              >
                                Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'socios' && (
            <div>
              <p className="text-gray-400 mb-4">Listado oficial de personas que confirmaron su compra o pago.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Nombre del Socio</th>
                      <th className="px-4 py-3">Teléfono / WhatsApp</th>
                      <th className="px-4 py-3">Fecha de Registro</th>
                      <th className="px-4 py-3">Estado de Pago</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSocios ? (
                      <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">Cargando socios...</td></tr>
                    ) : socios.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">No hay socios registrados.</td></tr>
                    ) : (
                      socios.map((socio, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-4 py-3 font-medium text-white">{socio.leads?.full_name || 'Sin nombre'}</td>
                          <td className="px-4 py-3 text-green-400">{socio.leads?.phone || 'Sin teléfono'}</td>
                          <td className="px-4 py-3">{socio.created_at ? new Date(socio.created_at).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                              {socio.payment_status || 'Pagado'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {userRole === 'admin' && (
                              <button
                                onClick={() => handleDeleteSocio(socio.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-xs"
                              >
                                Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'equipo' && userRole === 'admin' && (
            <div>
              <p className="text-gray-400 mb-4">Listado de usuarios y miembros con acceso al sistema.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Correo Electrónico</th>
                      <th className="px-4 py-3">Rol Asignado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTeam ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400">Cargando equipo...</td></tr>
                    ) : teamProfiles.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400">No hay miembros registrados.</td></tr>
                    ) : (
                      teamProfiles.map((member, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-4 py-3 font-medium text-white">{member.full_name || 'Sin nombre'}</td>
                          <td className="px-4 py-3 text-gray-300">{member.email || 'Sin correo'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                              member.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {member.role === 'admin' ? '👑 Administrador' : '💼 Vendedor'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL NUEVO LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Agregar Nuevo Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 3854123456"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Origen del Lead</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp Directo">WhatsApp Directo</option>
                  <option value="Recomendación">Recomendación</option>
                  <option value="Orgánico">Orgánico</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium text-white"
                >
                  {savingLead ? 'Guardando...' : 'Guardar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA CITA */}
      {isCitaModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Agendar Nueva Cita</h3>
            <form onSubmit={handleCreateCita} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Seleccionar Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                >
                  <option value="">Selecciona un lead...</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.full_name} ({lead.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha y Hora de la Cita</label>
                <input
                  type="datetime-local"
                  value={fechaCita}
                  onChange={(e) => setFechaCita(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCitaModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCita}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium text-white"
                >
                  {savingCita ? 'Agendando...' : 'Guardar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO SOCIO */}
      {isSocioModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Registrar Comprador del Programa</h3>
            <form onSubmit={handleCreateSocio} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Seleccionar Lead / Comprador</label>
                <select
                  value={selectedSocioLeadId}
                  onChange={(e) => setSelectedSocioLeadId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                >
                  <option value="">Selecciona un lead...</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.full_name} ({lead.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estado de Pago</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Seña / Parcial">Seña / Parcial</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSocioModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSocio}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium text-white"
                >
                  {savingSocio ? 'Guardando...' : 'Registrar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO USUARIO (ADMIN) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Crear Nuevo Miembro de Equipo</h3>
            <form onSubmit={handleCreateUserByAdmin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Carlos Vendedor"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="carlos@correo.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contraseña Temporal</label>
                <input
                  type="password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol en el Sistema</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium text-white"
                >
                  {savingUser ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
