'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CRMPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentTab, setCurrentTab] = useState<'dirige' | 'citas' | 'socios' | 'equipo' | 'metricas' | 'mensajes'>('dirige');
  const [activeView, setActiveView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');

  const [dirige, setDirige] = useState<any[]>([]);
  const [equipoCitas, setEquipoCitas] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [perfilesEquipo, setPerfilesEquipo] = useState<any[]>([]);

  const statuses = [
    'NUEVO/ SIN CONTACTAR',
    'EN SEGUIMIENTO',
    'CITA AGENDA',
    'PERDIDO/ NO RESPONDE',
  ];

  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
  const [isSocioModalOpen, setIsSocioModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [editingLead, setEditingLead] = useState<any>(null);
  const [editingCita, setEditingCita] = useState<any>(null);
  const [editingSocio, setEditingSocio] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [currentNoteTarget, setCurrentNoteTarget] = useState<{ type: 'lead' | 'cita' | 'socio', id: string, name: string, notes: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [origen, setOrigen] = useState('Facebook Ads');
  const [leadStatus, setLeadStatus] = useState('NUEVO/ SIN CONTACTAR');
  const [notasLead, setNotasLead] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [notasCita, setNotasCita] = useState('');
  const [savingCita, setSavingCita] = useState(false);

  const [selectedSocioLeadId, setSelectedSocioLeadId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
  const [notasSocio, setNotasSocio] = useState('');
  const [savingSocio, setSavingSocio] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('vendedor');
  const [savingUser, setSavingUser] = useState(false);

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Hola {nombre}, te recordamos que tienes una cita agendada en nuestro gimnasio. ¡Te esperamos!'
  );
  const [savedTemplateMsg, setSavedTemplateMsg] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError('Credenciales inválidas o error al iniciar sesión.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchDirige = async () => {
    setLoadingLeads(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setDirige(data);
    setLoadingLeads(false);
  };

  const fetchCitas = async () => {
    setLoadingCitas(true);
    const { data } = await supabase.from('appointments').select('*, leads(id, full_name, name, phone)');
    if (data) setEquipoCitas(data);
    setLoadingCitas(false);
  };

  const fetchSocios = async () => {
    setLoadingSocios(true);
    const { data } = await supabase.from('socios').select('*, leads(id, full_name, name, phone)');
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
    if (session) {
      fetchDirige();
      fetchCitas();
      fetchSocios();
      fetchTeam();
    }
  }, [session]);

  const handleUpdateLeadStatusInline = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (!error) {
      fetchDirige();
    } else {
      alert('Error al actualizar estado: ' + error.message);
    }
  };

  const handleCreateOrUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);

    if (editingLead) {
      const { error } = await supabase.from('leads').update({
        full_name: nombre,
        phone: telefono,
        email: correo || null,
        origin,
        status: leadStatus,
        notes: notasLead || null
      }).eq('id', editingLead.id);

      setSavingLead(false);
      if (!error) {
        setEditingLead(null);
        setNombre('');
        setTelefono('');
        setCorreo('');
        setNotasLead('');
        setOrigen('Facebook Ads');
        setLeadStatus('NUEVO/ SIN CONTACTAR');
        setIsLeadModalOpen(false);
        fetchDirige();
      } else {
        alert('Error al actualizar lead: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('leads').insert([{ 
        full_name: nombre, 
        phone: telefono, 
        email: correo || null, 
        origin,
        status: leadStatus,
        notes: notasLead || null
      }]);
      setSavingLead(false);
      if (!error) {
        setNombre('');
        setTelefono('');
        setCorreo('');
        setNotasLead('');
        setOrigen('Facebook Ads');
        setLeadStatus('NUEVO/ SIN CONTACTAR');
        setIsLeadModalOpen(false);
        fetchDirige();
      } else {
        alert('Error al guardar el lead: ' + error.message);
      }
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) fetchDirige();
    else alert('Error al eliminar lead: ' + error.message);
  };

  const handleCreateOrUpdateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId && !editingCita) {
      alert('Por favor selecciona un lead válido');
      return;
    }
    setSavingCita(true);
    
    const formattedDate = fechaCita || new Date().toISOString().split('T')[0];
    const formattedTime = horaCita || '00:00';
    const isoScheduledAt = new Date(`${formattedDate}T${formattedTime}:00`).toISOString();

    const payload = {
      lead_id: selectedLeadId || editingCita?.lead_id,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
      scheduled_at: isoScheduledAt,
      notes: notasCita || null
    };

    if (editingCita) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', editingCita.id);
      setSavingCita(false);
      if (!error) {
        setEditingCita(null);
        setFechaCita('');
        setHoraCita('');
        setNotasCita('');
        setSelectedLeadId('');
        setIsCitaModalOpen(false);
        fetchCitas();
      } else {
        alert('Error al actualizar cita: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('appointments').insert([payload]);
      setSavingCita(false);
      if (!error) {
        setFechaCita('');
        setHoraCita('');
        setSelectedLeadId('');
        setNotasCita('');
        setIsCitaModalOpen(false);
        fetchCitas();
        alert('Cita agendada con éxito');
      } else {
        alert('Error al agendar cita: ' + error.message);
      }
    }
  };

  const handleDeleteCita = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) fetchCitas();
    else alert('Error al eliminar cita: ' + error.message);
  };

  const handleConvertLeadToSocio = async (leadId: string) => {
    if (!leadId) return;
    const { error } = await supabase.from('socios').insert([{
      lead_id: leadId,
      payment_status: 'Pagado',
      notes: 'Convertido directamente desde Citas/Leads'
    }]);
    if (!error) {
      // Opcional: actualizar el estado del lead a CITA AGENDA o cerrar ciclo
      await supabase.from('leads').update({ status: 'CITA AGENDA' }).eq('id', leadId);
      fetchSocios();
      fetchDirige();
      alert('¡Socio registrado con éxito!');
    } else {
      alert('Error al registrar socio: ' + error.message);
    }
  };

  const handleCreateOrUpdateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocio(true);

    if (editingSocio) {
      const { error } = await supabase.from('socios').update({
        payment_status: paymentStatus,
        notes: notasSocio || null
      }).eq('id', editingSocio.id);

      setSavingSocio(false);
      if (!error) {
        setEditingSocio(null);
        setSelectedSocioLeadId('');
        setPaymentStatus('Pagado');
        setNotasSocio('');
        setIsSocioModalOpen(false);
        fetchSocios();
      } else {
        alert('Error al actualizar socio: ' + error.message);
      }
    } else {
      if (!selectedSocioLeadId) {
        alert('Por favor selecciona un lead válido');
        setSavingSocio(false);
        return;
      }
      const { error } = await supabase.from('socios').insert([{ 
        lead_id: selectedSocioLeadId, 
        payment_status: paymentStatus,
        notes: notasSocio || null
      }]);
      setSavingSocio(false);
      if (!error) {
        setSelectedSocioLeadId('');
        setPaymentStatus('Pagado');
        setNotasSocio('');
        setIsSocioModalOpen(false);
        fetchSocios();
      } else {
        alert('Error al registrar socio: ' + error.message);
      }
    }
  };

  const handleDeleteSocio = async (socioId: string) => {
    if (!confirm('¿Estás seguro de eliminar este socio?')) return;
    const { error } = await supabase.from('socios').delete().eq('id', socioId);
    if (!error) fetchSocios();
    else alert('No se pudo eliminar el socio.');
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNoteTarget) return;
    setSavingNote(true);

    const tableName = 
      currentNoteTarget.type === 'lead' ? 'leads' :
      currentNoteTarget.type === 'cita' ? 'appointments' : 'socios';

    const { error } = await supabase
      .from(tableName)
      .update({ notes: currentNoteTarget.notes })
      .eq('id', currentNoteTarget.id);

    setSavingNote(false);
    if (!error) {
      setCurrentNoteTarget(null);
      if (currentNoteTarget.type === 'lead') fetchDirige();
      if (currentNoteTarget.type === 'cita') fetchCitas();
      if (currentNoteTarget.type === 'socio') fetchSocios();
      alert('Nota actualizada con éxito');
    } else {
      alert('Error al guardar la nota: ' + error.message);
    }
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);

    if (editingUser) {
      const { error } = await supabase.from('profiles').update({
        full_name: nuevoNombre,
        role: nuevoRol
      }).eq('id', editingUser.id);
      setSavingUser(false);
      if (!error) {
        alert('Usuario actualizado con éxito');
        setEditingUser(null);
        setNuevoNombre('');
        setNuevoEmail('');
        setNuevoPassword('');
        setNuevoRol('vendedor');
        setIsUserModalOpen(false);
        fetchTeam();
      } else {
        alert('Error al actualizar usuario: ' + error.message);
      }
    } else {
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
        setNuevoRol('vendedor');
        setIsUserModalOpen(false);
        fetchTeam();
      } else {
        alert('Error al crear usuario: ' + error.message);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) fetchTeam();
    else alert('No se pudo eliminar el registro de perfil.');
  };

  const getWhatsAppLink = (phone: string, leadName: string) => {
    const customizedMessage = whatsappTemplate.replace(/{nombre}/g, leadName || 'Cliente');
    return `https://wa.me/${phone}?text=${encodeURIComponent(customizedMessage)}`;
  };

  const totalLeadsCount = dirige.length;
  const totalCitasCount = equipoCitas.length;
  const totalSociosCount = socios.length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((totalSociosCount / totalLeadsCount) * 100) : 0;
  const failureRate = 100 - conversionRate;

  // Estadísticas para gráfica de barras de estados
  const statusCounts = statuses.map((st) => {
    const count = dirige.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === st).length;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    return { status: st, count, percentage };
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm">Cargando aplicación...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-gray-100 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-2xl">
              A
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">CRM AUTOMATIZALO GYM</h1>
              <p className="text-xs text-gray-400 mt-0.5">Inicia sesión para continuar</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg active:scale-95"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-gray-100 font-sans pb-16 md:pb-0">
      
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
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow">
              A
            </div>
            <span className="font-bold text-base tracking-tight text-white">CRM GYM</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center space-x-1"
          >
            <span>🚀 Onboarding</span>
          </button>
          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
          >
            Salir
          </button>
        </div>
      </header>

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
              <button onClick={() => { setCurrentTab('metricas'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">📊</span> Métricas y Aciertos
              </button>
              <button onClick={() => { setCurrentTab('mensajes'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">💬</span> Mensajes Automáticos
              </button>
              <button onClick={() => { setCurrentTab('equipo'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                <span className="mr-3">⚙️</span> Equipo / Usuarios
              </button>
            </div>

            <div className="p-4 border-t border-slate-800 text-xs text-gray-400 bg-slate-950 flex justify-between items-center">
              <span>Sesión activa</span>
              <button onClick={handleLogout} className="text-red-400 font-bold hover:underline">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}

      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm" onClick={() => setIsOnboardingOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-5 text-gray-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>🚀</span> <span>Guía y Novedades</span>
              </h3>
              <button onClick={() => setIsOnboardingOpen(false)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            
            <div className="space-y-4 text-xs md:text-sm text-gray-300 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-sm">1. Volver Socio desde Citas</h4>
                <p>Ahora puedes convertir directamente una cita o lead en socio activo con el botón verde correspondiente.</p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 text-sm">2. Gráfica de Estados</h4>
                <p>Visualiza el rendimiento de tus prospectos en la pestaña Métricas a través de la nueva gráfica de barras.</p>
              </div>
            </div>

            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
            >
              ¡Entendido, Continuar!
            </button>
          </div>
        </div>
      )}

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

      <main className="flex-1 overflow-y-auto pb-24 p-4 max-w-4xl mx-auto w-full">
        
        {currentTab === 'dirige' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Gestión de Leads ({dirige.length})</h2>
              <button 
                onClick={() => { 
                  setEditingLead(null); 
                  setNombre(''); 
                  setTelefono(''); 
                  setCorreo(''); 
                  setOrigen('Facebook Ads'); 
                  setLeadStatus('NUEVO/ SIN CONTACTAR'); 
                  setNotasLead(''); 
                  setIsLeadModalOpen(true); 
                }} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                + Nuevo Lead
              </button>
            </div>

            {loadingLeads ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando prospectos...</p>
            ) : dirige.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay leads registrados.</p>
            ) : activeView === 'lista' ? (
              <div className="space-y-2">
                {dirige.map((l) => {
                  const currentLeadStatus = l.status || 'NUEVO/ SIN CONTACTAR';
                  const statusBgColor = 
                    currentLeadStatus === 'NUEVO/ SIN CONTACTAR' ? 'bg-blue-950/80 border-blue-700 text-blue-300' :
                    currentLeadStatus === 'EN SEGUIMIENTO' ? 'bg-amber-950/80 border-amber-700 text-amber-300' :
                    currentLeadStatus === 'CITA AGENDA' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-red-950/80 border-red-700 text-red-300';

                  return (
                    <div key={l.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-2">
                      <div className="flex-1 space-y-1.5 w-full">
                        <div className="flex items-center space-x-2">
                          <select
                            value={currentLeadStatus}
                            onChange={(e) => handleUpdateLeadStatusInline(l.id, e.target.value)}
                            className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer uppercase ${statusBgColor}`}
                          >
                            {statuses.map((st) => (
                              <option key={st} value={st} className="bg-slate-950 text-white">{st}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => setCurrentNoteTarget({ type: 'lead', id: l.id, name: l.full_name || l.name, notes: l.notes || '' })}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded text-[10px] font-bold"
                          >
                            📝 {l.notes ? 'Ver Nota' : '+ Nota'}
                          </button>
                        </div>

                        <h4 className="font-bold text-white text-sm">{l.full_name || l.name}</h4>
                        <p className="text-xs text-gray-400">{l.phone} {l.email ? `• ${l.email}` : ''} • <span className="text-blue-400">{l.origin}</span></p>
                        {l.notes && <p className="text-[11px] text-amber-300/90 italic bg-slate-950 p-1.5 rounded border border-slate-800">Nota: {l.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                        <button 
                          onClick={() => handleConvertLeadToSocio(l.id)}
                          className="px-3 py-1.5 bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition"
                        >
                          ✨ Socio
                        </button>
                        <button 
                          onClick={() => { setSelectedLeadId(l.id); setIsCitaModalOpen(true); }}
                          className="px-3 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                        >
                          📅 Agendar
                        </button>
                        <a href={getWhatsAppLink(l.phone, l.full_name || l.name)} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">
                          WhatsApp
                        </a>
                        <button 
                          onClick={() => {
                            setEditingLead(l);
                            setNombre(l.full_name || l.name || '');
                            setTelefono(l.phone || '');
                            setCorreo(l.email || '');
                            setOrigen(l.origin || 'Facebook Ads');
                            setLeadStatus(l.status || 'NUEVO/ SIN CONTACTAR');
                            setNotasLead(l.notes || '');
                            setIsLeadModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(l.id)}
                          className="px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeView === 'tarjetas' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dirige.map((l) => {
                  const currentLeadStatus = l.status || 'NUEVO/ SIN CONTACTAR';
                  const statusBgColor = 
                    currentLeadStatus === 'NUEVO/ SIN CONTACTAR' ? 'bg-blue-950/80 border-blue-700 text-blue-300' :
                    currentLeadStatus === 'EN SEGUIMIENTO' ? 'bg-amber-950/80 border-amber-700 text-amber-300' :
                    currentLeadStatus === 'CITA AGENDA' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-red-950/80 border-red-700 text-red-300';

                  return (
                    <div key={l.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <select
                          value={currentLeadStatus}
                          onChange={(e) => handleUpdateLeadStatusInline(l.id, e.target.value)}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer uppercase ${statusBgColor}`}
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st} className="bg-slate-950 text-white">{st}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => setCurrentNoteTarget({ type: 'lead', id: l.id, name: l.full_name || l.name, notes: l.notes || '' })}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded text-[10px] font-bold"
                        >
                          📝 {l.notes ? 'Ver Nota' : '+ Nota'}
                        </button>
                      </div>

                      <h4 className="font-bold text-white text-sm">{l.full_name || l.name}</h4>
                      <p className="text-xs text-gray-400">📞 {l.phone}</p>
                      {l.email && <p className="text-xs text-gray-400">✉️ {l.email}</p>}
                      {l.notes && <p className="text-[11px] text-amber-300/90 italic bg-slate-950 p-1.5 rounded border border-slate-800">Nota: {l.notes}</p>}
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <a href={getWhatsAppLink(l.phone, l.full_name || l.name)} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold text-center">
                          WhatsApp
                        </a>
                        <button 
                          onClick={() => handleConvertLeadToSocio(l.id)}
                          className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                        >
                          Socio
                        </button>
                        <button 
                          onClick={() => { setSelectedLeadId(l.id); setIsCitaModalOpen(true); }}
                          className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                        >
                          Agendar
                        </button>
                        <button 
                          onClick={() => {
                            setEditingLead(l);
                            setNombre(l.full_name || l.name || '');
                            setTelefono(l.phone || '');
                            setCorreo(l.email || '');
                            setOrigen(l.origin || 'Facebook Ads');
                            setLeadStatus(l.status || 'NUEVO/ SIN CONTACTAR');
                            setNotasLead(l.notes || '');
                            setIsLeadModalOpen(true);
                          }}
                          className="px-2 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(l.id)}
                          className="px-2 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* VISTA KANBAN */
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {statuses.map((status) => {
                  const statusLeads = dirige.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === status);
                  return (
                    <div key={status} className="w-72 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col max-h-[70vh]">
                      <h3 className="font-bold text-xs text-gray-300 mb-3 uppercase flex justify-between">
                        <span>{status}</span>
                        <span className="bg-slate-800 text-blue-400 px-1.5 rounded-full">{statusLeads.length}</span>
                      </h3>
                      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                        {statusLeads.map((lead) => (
                          <div key={lead.id} className="bg-slate-950 p-3 rounded-lg shadow-sm border border-slate-800 space-y-1">
                            <p className="font-bold text-xs text-white">{lead.full_name || lead.name}</p>
                            <p className="text-[11px] text-gray-400">{lead.phone}</p>
                            <div className="flex justify-between items-center pt-1">
                              <a href={getWhatsAppLink(lead.phone, lead.full_name || lead.name)} target="_blank" rel="noreferrer" className="text-green-400 text-[10px] font-bold underline">WhatsApp</a>
                              <button onClick={() => { setSelectedLeadId(lead.id); setIsCitaModalOpen(true); }} className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded font-bold">
                                Agendar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === 'citas' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Citas Programadas</h2>
              <button 
                onClick={() => { 
                  setEditingCita(null); 
                  setSelectedLeadId(''); 
                  setFechaCita(''); 
                  setHoraCita(''); 
                  setNotasCita(''); 
                  setIsCitaModalOpen(true); 
                }} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                + Agendar Cita
              </button>
            </div>
            {loadingCitas ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando citas...</p>
            ) : equipoCitas.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay citas registradas.</p>
            ) : (
              <div className="space-y-2">
                {equipoCitas.map((c) => {
                  const leadObj = c.leads;
                  const leadName = leadObj?.full_name || leadObj?.name || 'Cliente';
                  const leadPhone = leadObj?.phone || '';
                  const leadId = leadObj?.id || c.lead_id;

                  return (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{leadName}</h4>
                          <button 
                            onClick={() => setCurrentNoteTarget({ type: 'cita', id: c.id, name: leadName, notes: c.notes || '' })}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded text-[10px] font-bold"
                          >
                            📝 {c.notes ? 'Ver Nota' : '+ Nota'}
                          </button>
                        </div>
                        <p className="text-xs text-amber-400 mt-0.5">📅 Fecha: {c.appointment_date} {c.appointment_time ? `• ⏰ ${c.appointment_time}` : ''}</p>
                        {c.notes && <p className="text-[11px] text-amber-300/90 italic mt-1 bg-slate-950 p-1.5 rounded border border-slate-800">Nota: {c.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => handleConvertLeadToSocio(leadId)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                        >
                          ✨ Volver Socio
                        </button>
                        {leadPhone && (
                          <a href={getWhatsAppLink(leadPhone, leadName)} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">
                            WhatsApp
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            setEditingCita(c);
                            setSelectedLeadId(c.lead_id || '');
                            setFechaCita(c.appointment_date || '');
                            setHoraCita(c.appointment_time || '');
                            setNotasCita(c.notes || '');
                            setIsCitaModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteCita(c.id)}
                          className="px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === 'socios' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Socios Activos</h2>
              <button 
                onClick={() => { 
                  setEditingSocio(null); 
                  setSelectedSocioLeadId(''); 
                  setPaymentStatus('Pagado'); 
                  setNotasSocio(''); 
                  setIsSocioModalOpen(true); 
                }} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                + Nuevo Socio
              </button>
            </div>
            {loadingSocios ? (
              <p className="text-center text-gray-500 py-10 text-xs">Cargando socios...</p>
            ) : socios.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-xs">No hay socios registrados.</p>
            ) : (
              <div className="space-y-2">
                {socios.map((s) => {
                  const statusColor = 
                    s.payment_status === 'Pagado' ? 'text-green-400' :
                    s.payment_status === 'Pendiente' ? 'text-red-400' : 'text-orange-400';
                  
                  return (
                    <div key={s.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{s.leads?.full_name || s.leads?.name || 'Socio'}</h4>
                          <button 
                            onClick={() => setCurrentNoteTarget({ type: 'socio', id: s.id, name: s.leads?.full_name || 'Socio', notes: s.notes || '' })}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded text-[10px] font-bold"
                          >
                            📝 {s.notes ? 'Ver Nota' : '+ Nota'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Estado: <span className={`font-bold ${statusColor}`}>{s.payment_status}</span></p>
                        {s.notes && <p className="text-[11px] text-amber-300/90 italic mt-1 bg-slate-950 p-1.5 rounded border border-slate-800">Nota: {s.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setEditingSocio(s);
                            setSelectedSocioLeadId(s.lead_id || '');
                            setPaymentStatus(s.payment_status || 'Pagado');
                            setNotasSocio(s.notes || '');
                            setIsSocioModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteSocio(s.id)}
                          className="px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === 'metricas' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white mb-2">Métricas de Conversión y Rendimiento</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-lg">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Porcentaje de Aciertos (Cierres)</h3>
                <div className="w-28 h-28 rounded-full border-4 border-green-500 flex items-center justify-center bg-green-950/20 shadow-inner">
                  <span className="text-2xl font-black text-green-400">{conversionRate}%</span>
                </div>
                <p className="text-xs text-gray-400">{socios.length} socios de {dirige.length} leads totales</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-lg">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Porcentaje de Desaciertos / Pendientes</h3>
                <div className="w-28 h-28 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-950/20 shadow-inner">
                  <span className="text-2xl font-black text-red-400">{failureRate}%</span>
                </div>
                <p className="text-xs text-gray-400">Prospectos sin concretar membresía</p>
              </div>
            </div>

            {/* GRÁFICA DE BARRAS DE ESTADOS DE LEADS */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
              <h3 className="font-bold text-sm text-white">Gráfica de Estados de Leads</h3>
              <div className="space-y-3">
                {statusCounts.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span className="font-bold">{item.status}</span>
                      <span className="font-mono">{item.count} leads ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-white text-sm">Resumen General</h4>
              <div className="flex justify-between text-xs text-gray-300 border-b border-slate-800 py-1.5">
                <span>Total Leads Registrados:</span>
                <span className="font-bold text-blue-400">{totalLeadsCount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-300 border-b border-slate-800 py-1.5">
                <span>Total Citas Agendadas:</span>
                <span className="font-bold text-amber-400">{totalCitasCount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-300 py-1.5">
                <span>Total Socios Cerrados:</span>
                <span className="font-bold text-green-400">{totalSociosCount}</span>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'mensajes' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Plantilla de WhatsApp Automática</h2>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
              <p className="text-xs text-gray-300">
                Personaliza el mensaje que se enviará a tus leads. Usa la etiqueta <code className="bg-slate-950 text-blue-400 px-1.5 py-0.5 rounded font-mono">&#123;nombre&#125;</code> para insertar automáticamente el nombre del cliente.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Mensaje de Plantilla</label>
                <textarea
                  rows={4}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              {savedTemplateMsg && (
                <div className="p-2 bg-green-950/40 border border-green-800 text-green-300 text-xs rounded-xl text-center">
                  ¡Plantilla actualizada correctamente!
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setSavedTemplateMsg(true);
                  setTimeout(() => setSavedTemplateMsg(false), 3000);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Guardar Plantilla
              </button>
            </div>
          </div>
        )}

        {currentTab === 'equipo' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Gestión de Equipo</h2>
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setNuevoNombre('');
                  setNuevoEmail('');
                  setNuevoPassword('');
                  setNuevoRol('vendedor');
                  setIsUserModalOpen(true);
                }} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
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
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingUser(p);
                          setNuevoNombre(p.full_name || '');
                          setNuevoRol(p.role || 'vendedor');
                          setIsUserModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 text-gray-300 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 transition"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(p.id)}
                        className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <button 
        onClick={() => { 
          setEditingLead(null); 
          setNombre(''); 
          setTelefono(''); 
          setCorreo(''); 
          setOrigen('Facebook Ads'); 
          setLeadStatus('NUEVO/ SIN CONTACTAR'); 
          setNotasLead(''); 
          setIsLeadModalOpen(true); 
        }} 
        className="fixed right-5 bottom-20 md:bottom-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg z-30 transition transform active:scale-95"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* MODAL NOTAS */}
      {currentNoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setCurrentNoteTarget(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Notas de Cliente: {currentNoteTarget.name}</h3>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Apunta detalles clave sobre este cliente</label>
                <textarea
                  rows={4}
                  value={currentNoteTarget.notes}
                  onChange={e => setCurrentNoteTarget({ ...currentNoteTarget, notes: e.target.value })}
                  placeholder="Ej. Prefiere entrenar por la mañana..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setCurrentNoteTarget(null)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingNote} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingNote ? 'Guardando...' : 'Guardar Nota'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsLeadModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingLead ? 'Editar Prospecto' : 'Nuevo Prospecto'}</h3>
            <form onSubmit={handleCreateOrUpdateLead} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nombre</label>
                <input type="text" required placeholder="Ej. Juan Pérez" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Teléfono</label>
                <input type="text" required placeholder="Ej. 5493854123456" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Correo electrónico (Opcional)</label>
                <input type="email" placeholder="correo@ejemplo.com" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Origen</label>
                <input type="text" value={origen} onChange={e => setOrigen(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Estado del Lead</label>
                <select value={leadStatus} onChange={e => setLeadStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                  {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Notas iniciales (Opcional)</label>
                <input type="text" placeholder="Ej. Quiere empezar el lunes" value={notasLead} onChange={e => setNotasLead(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsLeadModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingLead} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingLead ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CITA */}
      {isCitaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsCitaModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingCita ? 'Editar Cita' : 'Agendar Cita'}</h3>
            <form onSubmit={handleCreateOrUpdateCita} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Seleccionar Lead</label>
                <select required disabled={!!editingCita} value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white disabled:opacity-50">
                  <option value="">Selecciona un Lead</option>
                  {dirige.map(l => <option key={l.id} value={l.id}>{l.full_name || l.name} ({l.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Fecha de Cita</label>
                <input type="date" required value={fechaCita} onChange={e => setFechaCita(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Hora de Cita</label>
                <input type="time" required value={horaCita} onChange={e => setHoraCita(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Notas de Cita (Opcional)</label>
                <input type="text" placeholder="Ej. Viene con un amigo" value={notasCita} onChange={e => setNotasCita(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsCitaModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingCita} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingCita ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SOCIO */}
      {isSocioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsSocioModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingSocio ? 'Editar Socio' : 'Nuevo Socio'}</h3>
            <form onSubmit={handleCreateOrUpdateSocio} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Seleccionar Lead</label>
                <select required disabled={!!editingSocio} value={selectedSocioLeadId} onChange={e => setSelectedSocioLeadId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white disabled:opacity-50">
                  <option value="">Selecciona un Lead</option>
                  {dirige.map(l => <option key={l.id} value={l.id}>{l.full_name || l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Estado de Pago</label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pago Parcial">Pago Parcial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Notas de Socio (Opcional)</label>
                <input type="text" placeholder="Ej. Pagó en efectivo plan anual" value={notasSocio} onChange={e => setNotasSocio(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsSocioModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingSocio} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingSocio ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL USUARIO / EQUIPO */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingUser ? 'Editar Miembro de Equipo' : 'Crear Usuario / Vendedor'}</h3>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nombre Completo</label>
                <input type="text" required placeholder="Nombre Completo" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              </div>
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Correo electrónico</label>
                    <input type="email" required placeholder="correo@ejemplo.com" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Contraseña</label>
                    <input type="password" required placeholder="Contraseña" value={nuevoPassword} onChange={e => setNuevoPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Rol</label>
                <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                  <option value="vendedor">Vendedor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" disabled={savingUser} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">{savingUser ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <button onClick={() => setCurrentTab('metricas')} className={`flex flex-col items-center flex-1 py-1 ${currentTab === 'metricas' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
          <span className="text-[10px]">Métricas</span>
        </button>
      </nav>

    </div>
  );
}
