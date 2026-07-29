'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import { useRouter } from 'next/navigation';

export default function CRMHome() {
  const [activeTab, setActiveTab] = useState('leads');
  const router = useRouter();
  
  // Estado para la sesión y usuario conectado
  const [loadingSession, setLoadingSession] = useState(true);
  const [userRole, setUserRole] = useState('vendedor');
  const [userEmail, setUserEmail] = useState('');

  // Estados para Leads
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [origen, setOrigen] = useState('Facebook Ads');
  const [savingLead, setSavingLead] = useState(false);

  // Estados para Citas
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [savingCita, setSavingCita] = useState(false);

  // Estados para Socios
  const [socios, setSocios] = useState<any[]>([]);
  const [loadingSocios, setLoadingSocios] = useState(true);
  const [isSocioModalOpen, setIsSocioModalOpen] = useState(false);
  const [selectedSocioLeadId, setSelectedSocioLeadId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
  const [savingSocio, setSavingSocio] = useState(false);

  // Estados para Equipo / Usuarios (Solo Admins)
  const [teamProfiles, setTeamProfiles] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoRol, setNuevoRol] = useState('vendedor');
  const [savingUser, setSavingUser] = useState(false);

  async function checkUserAndFetchData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const user = session.user;
      setUserEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.role) {
        setUserRole(profile.role);
      }

      setLoadingSession(false);
      
      // Cargar datos iniciales
      fetchLeads();
      fetchAppointments();
      fetchSocios();
      fetchTeam();
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      router.push('/login');
    }
  }

  async function fetchLeads() {
    try {
      setLoadingLeads(true);
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          appointments (
            id,
            scheduled_at,
            status
          )
        `);
      if (error) console.error('Error al cargar leads:', error.message);
      else setLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function fetchAppointments() {
    try {
      setLoadingCitas(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (
            id,
            full_name,
            phone,
            source,
            notes
          )
        `);
      if (error) console.error('Error al cargar citas:', error.message);
      else setAppointments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingCitas(false);
    }
  }

  async function fetchSocios() {
    try {
      setLoadingSocios(true);
      const { data, error } = await supabase
        .from('socios')
        .select(`
          *,
          leads (
            id,
            full_name,
            phone,
            source,
            notes
          )
        `);
      if (error) console.error('Error al cargar socios:', error.message);
      else setSocios(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingSocios(false);
    }
  }

  async function fetchTeam() {
    try {
      setLoadingTeam(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) console.error('Error al cargar equipo:', error.message);
      else setTeamProfiles(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingTeam(false);
    }
  }

  useEffect(() => {
    checkUserAndFetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;

    setSavingLead(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('leads').insert([
        { 
          full_name: nombre, 
          phone: telefono, 
          source: origen, 
          status: 'Nuevo',
          user_id: user?.id
        }
      ]);
      if (error) throw error;

      setNombre('');
      setTelefono('');
      setOrigen('Facebook Ads');
      setIsLeadModalOpen(false);
      fetchLeads();
    } catch (error: any) {
      alert('Error al guardar el lead: ' + (error.message || 'Desconocido'));
    } finally {
      setSavingLead(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar leads.');
      return;
    }
    if (!confirm('¿Estás seguro de que deseas eliminar este lead?')) return;

    try {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
      fetchLeads();
      fetchAppointments();
      fetchSocios();
    } catch (error: any) {
      alert('Error al eliminar el lead: ' + error.message);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
    } catch (error: any) {
      alert('Error al actualizar estado: ' + error.message);
    }
  };

  const handleUpdateLeadSource = async (leadId: string, newSource: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ source: newSource })
        .eq('id', leadId);

      if (error) throw error;
      setLeads(leads.map(lead => lead.id === leadId ? { ...lead, source: newSource } : lead));
      fetchAppointments();
      fetchSocios();
    } catch (error: any) {
      alert('Error al actualizar origen: ' + error.message);
    }
  };

  const handleUpdateLeadNotes = async (leadId: string, newNotes: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes: newNotes })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(leads.map(lead => lead.id === leadId ? { ...lead, notes: newNotes } : lead));
      setAppointments(appointments.map(app => app.leads?.id === leadId ? { ...app, leads: { ...app.leads, notes: newNotes } } : app));
      setSocios(socios.map(soc => soc.leads?.id === leadId ? { ...soc, leads: { ...soc.leads, notes: newNotes } } : soc));
    } catch (error: any) {
      alert('Error al guardar comentario: ' + error.message);
    }
  };

  const handleOpenCitaModalForLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsCitaModalOpen(true);
  };

  const handleCreateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !fechaCita.trim()) return;

    setSavingCita(true);
    try {
      const { error } = await supabase.from('appointments').insert([
        { 
          lead_id: selectedLeadId,
          scheduled_at: fechaCita, 
          status: 'Agendada' 
        }
      ]);
      if (error) throw error;

      await supabase.from('leads').update({ status: 'Agendado' }).eq('id', selectedLeadId);

      setSelectedLeadId('');
      setFechaCita('');
      setIsCitaModalOpen(false);
      fetchAppointments();
      fetchLeads();
      setActiveTab('citas');
    } catch (error: any) {
      alert('Error al agendar la cita: ' + (error.message || 'Desconocido'));
    } finally {
      setSavingCita(false);
    }
  };

  const handleCreateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocioLeadId) return;

    setSavingSocio(true);
    try {
      const { error } = await supabase.from('socios').insert([
        { 
          lead_id: selectedSocioLeadId,
          payment_status: paymentStatus
        }
      ]);
      if (error) throw error;

      await supabase.from('leads').update({ status: 'Cliente / Cerrado' }).eq('id', selectedSocioLeadId);

      setSelectedSocioLeadId('');
      setPaymentStatus('Pagado');
      setIsSocioModalOpen(false);
      fetchSocios();
      fetchLeads();
    } catch (error: any) {
      alert('Error al registrar socio: ' + (error.message || 'Desconocido'));
    } finally {
      setSavingSocio(false);
    }
  };

  const handleUpdatePaymentStatus = async (socioId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('socios')
        .update({ payment_status: nuevoEstado })
        .eq('id', socioId);

      if (error) throw error;
      setSocios(socios.map(s => s.id === socioId ? { ...s, payment_status: nuevoEstado } : s));
    } catch (error: any) {
      alert('Error al actualizar estado de pago: ' + error.message);
    }
  };

  const handleDeleteSocio = async (socioId: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar socios.');
      return;
    }
    if (!confirm('¿Estás seguro de que deseas eliminar este socio?')) return;

    try {
      const { error } = await supabase.from('socios').delete().eq('id', socioId);
      if (error) throw error;
      fetchSocios();
    } catch (error: any) {
      alert('Error al eliminar socio: ' + error.message);
    }
  };

  const handleCreateUserByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEmail.trim() || !nuevoPassword.trim()) return;

    setSavingUser(true);
    try {
      const { error } = await supabase.rpc('create_user_by_admin', {
        email_input: nuevoEmail,
        password_input: nuevoPassword,
        full_name_input: nuevoNombre || 'Nuevo Usuario',
        role_input: nuevoRol
      });

      if (error) throw error;

      alert('¡Usuario creado con éxito!');
      setNuevoEmail('');
      setNuevoPassword('');
      setNuevoNombre('');
      setNuevoRol('vendedor');
      setIsUserModalOpen(false);
      fetchTeam();
    } catch (error: any) {
      alert('Error al crear usuario: ' + (error.message || 'Desconocido'));
    } finally {
      setSavingUser(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Nuevo':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'Contactado':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Agendado':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Cliente / Cerrado':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Descartado':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">Cargando CRM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col justify-between border-r border-gray-700">
        <div>
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500/50 shadow-lg flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-blue-950 relative">
              <svg className="w-12 h-12 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h3.5l2-4h9l2 4H22L12 2zm0 4.5l5.5 11h-11L12 6.5z" />
                <circle cx="18" cy="6" r="1" fill="#60a5fa" />
                <circle cx="20" cy="9" r="0.7" fill="#93c5fd" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 mt-2 uppercase">automatízalo.space</span>
            
            <div className="mt-3 text-center">
              <span className="text-[11px] text-gray-300 block truncate max-w-[180px]">{userEmail}</span>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                userRole === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            🔒 Cerrar Sesión
          </button>
          <div className="text-xs text-gray-500 text-center">Panel de Control v1.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
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
              <p className="text-gray-400 mb-4">Prospectos sincronizados directamente desde tu base de datos en Supabase.</p>
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
                          ? new Date(lead.created_at).toLocaleDateString() + ' a las ' + new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(lead.full_name || '')},%20te%20escribo%20desde%20Automatízalo.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-2.5 py-1 rounded-md transition font-medium"
                                >
                                  <span>💬 {lead.phone}</span>
                                </a>
                              ) : (
                                'Sin teléfono'
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={lead.source || 'Facebook Ads'}
                                onChange={(e) => handleUpdateLeadSource(lead.id, e.target.value)}
                                className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
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
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-md text-xs font-medium inline-block">
                                  📅 {new Date(leadAppointment).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs italic">Sin cita</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeStyle(currentStatus)}`}>
                                  ● {currentStatus}
                                </span>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                  className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
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
                                className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-red-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-center space-x-2">
                              <button
                                onClick={() => handleOpenCitaModalForLead(lead.id)}
                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded text-xs transition font-medium cursor-pointer"
                              >
                                📅 Agendar
                              </button>
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-xs transition font-medium cursor-pointer"
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
              <p className="text-gray-400 mb-4">Control de las citas agendadas sincronizadas con Supabase.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Nombre del Lead</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Origen</th>
                      <th className="px-4 py-3">Fecha y Hora Programada</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Comentarios / Notas</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCitas ? (
                      <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-400">Cargando citas...</td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-400">No hay citas agendadas todavía.</td></tr>
                    ) : (
                      appointments.map((cita, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-4 py-3 font-medium text-white">
                            {cita.leads?.full_name || 'Sin nombre asignado'}
                          </td>
                          <td className="px-4 py-3">
                            {cita.leads?.phone ? (
                              <a
                                href={`https://wa.me/${cita.leads.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(cita.leads.full_name || '')},%20te%20contacto%20por%20tu%20cita%20agendada.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 font-medium inline-flex items-center space-x-1"
                              >
                                <span>💬 {cita.leads.phone}</span>
                              </a>
                            ) : (
                              'Sin teléfono'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={cita.leads?.source || 'Facebook Ads'}
                              onChange={(e) => {
                                if (cita.leads?.id) {
                                  handleUpdateLeadSource(cita.leads.id, e.target.value);
                                }
                              }}
                              className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
                            >
                              <option value="Facebook Ads">Facebook Ads</option>
                              <option value="Instagram">Instagram</option>
                              <option value="WhatsApp Directo">WhatsApp Directo</option>
                              <option value="Recomendación">Recomendación</option>
                              <option value="Orgánico">Orgánico</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {cita.scheduled_at ? new Date(cita.scheduled_at).toLocaleString() : 'Sin fecha'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded text-xs font-semibold">Agendada</span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              defaultValue={cita.leads?.notes || ''}
                              onBlur={(e) => {
                                if (cita.leads?.id) {
                                  handleUpdateLeadNotes(cita.leads.id, e.target.value);
                                }
                              }}
                              placeholder="Escribe un comentario..."
                              className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-red-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {userRole === 'admin' && (
                              <button
                                onClick={() => {
                                  if (confirm('¿Eliminar cita?')) {
                                    supabase.from('appointments').delete().eq('id', cita.id).then(() => {
                                      fetchAppointments();
                                      fetchLeads();
                                    });
                                  }
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-xs transition font-medium cursor-pointer"
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
              <p className="text-gray-400 mb-4">Listado oficial de personas que confirmaron y compraron el programa.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Nombre del Socio</th>
                      <th className="px-4 py-3">Teléfono / WhatsApp</th>
                      <th className="px-4 py-3">Fecha de Registro</th>
                      <th className="px-4 py-3">Estado de Pago</th>
                      <th className="px-4 py-3">Comentarios / Notas</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSocios ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">Cargando socios...</td></tr>
                    ) : socios.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">No hay socios confirmados todavía.</td></tr>
                    ) : (
                      socios.map((socio, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-4 py-3 font-medium text-white">{socio.leads?.full_name || 'Sin nombre'}</td>
                          <td className="px-4 py-3">
                            {socio.leads?.phone ? (
                              <a
                                href={`https://wa.me/${socio.leads.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(socio.leads.full_name || '')},%20bienvenido%20al%20programa.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 font-medium inline-flex items-center space-x-1"
                              >
                                <span>💬 {socio.leads.phone}</span>
                              </a>
                            ) : (
                              'Sin teléfono'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {socio.created_at ? new Date(socio.created_at).toLocaleDateString() : 'Sin fecha'}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={socio.payment_status || 'Pagado'}
                              onChange={(e) => handleUpdatePaymentStatus(socio.id, e.target.value)}
                              className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
                            >
                              <option value="Pagado">Pagado</option>
                              <option value="Seña / Parcial">Seña / Parcial</option>
                              <option value="Pendiente">Pendiente</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              defaultValue={socio.leads?.notes || ''}
                              onBlur={(e) => {
                                if (socio.leads?.id) {
                                  handleUpdateLeadNotes(socio.leads.id, e.target.value);
                                }
                              }}
                              placeholder="Escribe un comentario..."
                              className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-red-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {userRole === 'admin' && (
                              <button
                                onClick={() => handleDeleteSocio(socio.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-xs transition font-medium cursor-pointer"
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
              <p className="text-gray-400 mb-4">Listado de usuarios y miembros con acceso al CRM.</p>
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
                      <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-400">No hay usuarios registrados.</td></tr>
                    ) : (
                      teamProfiles.map((member, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-4 py-3 font-medium text-white">{member.full_name || 'Sin nombre'}</td>
                          <td className="px-4 py-3 text-gray-300">{member.email || 'Sin correo'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                              member.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Agregar Nuevo Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Origen del Lead</label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Agendar Nueva Cita</h3>
            <form onSubmit={handleCreateCita} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Seleccionar Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCitaModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCita}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Registrar Comprador del Programa</h3>
            <form onSubmit={handleCreateSocio} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Seleccionar Lead / Cliente</label>
                <select
                  value={selectedSocioLeadId}
                  onChange={(e) => setSelectedSocioLeadId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSocio}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Crear Nuevo Miembro de Equipo</h3>
            <form onSubmit={handleCreateUserByAdmin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Carlos Vendedor"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
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
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol en el Sistema</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
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
