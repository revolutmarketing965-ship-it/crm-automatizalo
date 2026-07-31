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

  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'dirige' | 'citas' | 'socios' | 'membresias' | 'equipo' | 'metricas' | 'mensajes' | 'superadmin' | 'configuracion'>('dirige');
  const [activeView, setActiveView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');
  const [activeSociosView, setActiveSociosView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');

  const [dirige, setDirige] = useState<any[]>([]);
  const [equipoCitas, setEquipoCitas] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [membresias, setMembresias] = useState<any[]>([]);
  const [perfilesEquipo, setPerfilesEquipo] = useState<any[]>([]);
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [nuevaEmpresaNombre, setNuevaEmpresaNombre] = useState('');
  const [adminEmpresaEmail, setAdminEmpresaEmail] = useState('');
  const [adminEmpresaPass, setAdminEmpresaPass] = useState('');
  const [adminEmpresaNombre, setAdminEmpresaNombre] = useState('');
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);

  // Campos dinámicos para edición de empresa
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

  const [empresaActualLogo, setEmpresaActualLogo] = useState('');
  const [nuevoLogoUrl, setNuevoLogoUrl] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);

  const statuses = [
    'NUEVO/ SIN CONTACTAR',
    'EN SEGUIMIENTO',
    'CITA AGENDA',
    'PERDIDO/ NO RESPONDE',
  ];

  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);
  const [loadingMembresias, setLoadingMembresias] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);
  const [isSocioModalOpen, setIsSocioModalOpen] = useState(false);
  const [isMembresiaModalOpen, setIsMembresiaModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [editingLead, setEditingLead] = useState<any>(null);
  const [editingCita, setEditingCita] = useState<any>(null);
  const [editingSocio, setEditingSocio] = useState<any>(null);
  const [editingMembresia, setEditingMembresia] = useState<any>(null);
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
  const [selectedMembresiaId, setSelectedMembresiaId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
  const [notasSocio, setNotasSocio] = useState('');
  const [savingSocio, setSavingSocio] = useState(false);

  const [nombreMembresia, setNombreMembresia] = useState('');
  const [seccionesMembresia, setSeccionesMembresia] = useState('');
  const [precioMembresia, setPrecioMembresia] = useState('');
  const [savingMembresia, setSavingMembresia] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('vendedor');
  const [savingUser, setSavingUser] = useState(false);

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Hola {nombre}, te recordamos que tienes una cita agendada con nosotros. ¡Te esperamos!'
  );
  const [savedTemplateMsg, setSavedTemplateMsg] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUserProfile(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUserProfile(data);
      if (data.role === 'superadmin') {
        setCurrentTab('superadmin');
        fetchEmpresas();
      } else if (data.empresa_id) {
        fetchEmpresaLogo(data.empresa_id);
      }
    }
    setAuthLoading(false);
  };

  const fetchEmpresaLogo = async (empresaId: string) => {
    const { data } = await supabase.from('empresas').select('logo_url').eq('id', empresaId).single();
    if (data && data.logo_url) {
      setEmpresaActualLogo(data.logo_url);
      setNuevoLogoUrl(data.logo_url);
    }
  };

  const fetchEmpresas = async () => {
    const { data } = await supabase.from('empresas').select('*');
    if (data) setEmpresas(data);
  };

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
    if (!userProfile?.empresa_id && userProfile?.role !== 'superadmin') return;
    setLoadingLeads(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (userProfile.role !== 'superadmin') {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setDirige(data);
    setLoadingLeads(false);
  };

  const fetchCitas = async () => {
    if (!userProfile?.empresa_id && userProfile?.role !== 'superadmin') return;
    setLoadingCitas(true);
    let query = supabase.from('appointments').select('*, leads(id, full_name, name, phone)');
    if (userProfile.role !== 'superadmin') {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setEquipoCitas(data);
    setLoadingCitas(false);
  };

  const fetchSocios = async () => {
    if (!userProfile?.empresa_id && userProfile?.role !== 'superadmin') return;
    setLoadingSocios(true);
    let query = supabase.from('socios').select('*, leads(id, full_name, name, phone), membresias(id, nombre, secciones, precio)');
    if (userProfile.role !== 'superadmin') {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setSocios(data);
    setLoadingSocios(false);
  };

  const fetchMembresias = async () => {
    if (!userProfile?.empresa_id && userProfile?.role !== 'superadmin') return;
    setLoadingMembresias(true);
    let query = supabase.from('membresias').select('*');
    if (userProfile.role !== 'superadmin') {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setMembresias(data);
    setLoadingMembresias(false);
  };

  const fetchTeam = async () => {
    if (!userProfile?.empresa_id && userProfile?.role !== 'superadmin') return;
    setLoadingTeam(true);
    let query = supabase.from('profiles').select('*');
    if (userProfile.role !== 'superadmin') {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setPerfilesEquipo(data);
    setLoadingTeam(false);
  };

  useEffect(() => {
    if (session && userProfile) {
      fetchDirige();
      fetchCitas();
      fetchSocios();
      fetchMembresias();
      fetchTeam();
    }
  }, [session, userProfile]);

  const handleUpdateLogoEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.empresa_id) return;
    setSavingLogo(true);
    const { error } = await supabase
      .from('empresas')
      .update({ logo_url: nuevoLogoUrl })
      .eq('id', userProfile.empresa_id);

    setSavingLogo(false);
    if (!error) {
      setEmpresaActualLogo(nuevoLogoUrl);
      alert('¡Logo actualizado con éxito en todo el CRM!');
    } else {
      alert('Error al actualizar el logo: ' + error.message);
    }
  };

  const handleCreateEmpresaMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmpresa(true);

    const { data: empData, error: empError } = await supabase
      .from('empresas')
      .insert([{ nombre: nuevaEmpresaNombre }])
      .select()
      .single();

    if (empError || !empData) {
      alert('Error al crear empresa: ' + (empError?.message || 'Desconocido'));
      setSavingEmpresa(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: adminEmpresaEmail,
      password: adminEmpresaPass,
      options: {
        data: {
          full_name: adminEmpresaNombre,
          role: 'administrador',
          empresa_id: empData.id
        }
      }
    });

    setSavingEmpresa(false);
    if (!signUpError) {
      alert('¡Negocio y Administrador creados con éxito!');
      setNuevaEmpresaNombre('');
      setAdminEmpresaEmail('');
      setAdminEmpresaPass('');
      setAdminEmpresaNombre('');
      fetchEmpresas();
    } else {
      alert('Empresa creada, pero error al crear usuario admin: ' + signUpError.message);
    }
  };

  const handleUpdateEmpresaMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpresa) return;
    setSavingEmpresa(true);

    const { error } = await supabase.from('empresas').update({
      nombre: editNombre,
      telefono: editTelefono,
      direccion: editDireccion,
      logo_url: editLogoUrl
    }).eq('id', editingEmpresa.id);

    setSavingEmpresa(false);
    if (!error) {
      alert('Negocio actualizado con éxito');
      setEditingEmpresa(null);
      fetchEmpresas();
    } else {
      alert('Error al actualizar negocio: ' + error.message);
    }
  };

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este negocio? Se borrarán sus datos asociados.')) return;
    const { error } = await supabase.from('empresas').delete().eq('id', id);
    if (!error) {
      fetchEmpresas();
      alert('Negocio eliminado con éxito');
    } else {
      alert('Error al eliminar negocio: ' + error.message);
    }
  };

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
    const empresaId = userProfile?.empresa_id;

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
        notes: notasLead || null,
        empresa_id: empresaId
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
    const empresaId = userProfile?.empresa_id;
    
    const formattedDate = fechaCita || new Date().toISOString().split('T')[0];
    const formattedTime = horaCita || '00:00';
    const isoScheduledAt = new Date(`${formattedDate}T${formattedTime}:00`).toISOString();

    const payload = {
      lead_id: selectedLeadId || editingCita?.lead_id,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
      scheduled_at: isoScheduledAt,
      notes: notasCita || null,
      empresa_id: empresaId
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
    const empresaId = userProfile?.empresa_id;
    const defaultMembresiaId = membresias.length > 0 ? membresias[0].id : null;
    const { error } = await supabase.from('socios').insert([{
      lead_id: leadId,
      membresia_id: defaultMembresiaId,
      payment_status: 'Pagado',
      notes: 'Convertido directamente desde CRM',
      empresa_id: empresaId
    }]);
    if (!error) {
      await supabase.from('leads').update({ status: 'CITA AGENDA' }).eq('id', leadId);
      fetchSocios();
      fetchDirige();
      alert('¡Cliente registrado con éxito en el CRM!');
    } else {
      alert('Error al registrar cliente: ' + error.message);
    }
  };

  const handleCreateOrUpdateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocio(true);
    const empresaId = userProfile?.empresa_id;

    const payload = {
      lead_id: selectedSocioLeadId || editingSocio?.lead_id,
      membresia_id: selectedMembresiaId || null,
      payment_status: paymentStatus,
      notes: notasSocio || null,
      empresa_id: empresaId
    };

    if (editingSocio) {
      const { error } = await supabase.from('socios').update(payload).eq('id', editingSocio.id);
      setSavingSocio(false);
      if (!error) {
        setEditingSocio(null);
        setSelectedSocioLeadId('');
        setSelectedMembresiaId('');
        setPaymentStatus('Pagado');
        setNotasSocio('');
        setIsSocioModalOpen(false);
        fetchSocios();
      } else {
        alert('Error al actualizar cliente: ' + error.message);
      }
    } else {
      if (!selectedSocioLeadId) {
        alert('Por favor selecciona un lead válido');
        setSavingSocio(false);
        return;
      }
      const { error } = await supabase.from('socios').insert([payload]);
      setSavingSocio(false);
      if (!error) {
        setSelectedSocioLeadId('');
        setSelectedMembresiaId('');
        setPaymentStatus('Pagado');
        setNotasSocio('');
        setIsSocioModalOpen(false);
        fetchSocios();
      } else {
        alert('Error al registrar cliente: ' + error.message);
      }
    }
  };

  const handleDeleteSocio = async (socioId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    const { error } = await supabase.from('socios').delete().eq('id', socioId);
    if (!error) fetchSocios();
    else alert('No se pudo eliminar el cliente.');
  };

  const handleCreateOrUpdateMembresia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMembresia(true);
    const empresaId = userProfile?.empresa_id;

    const payload = {
      nombre: nombreMembresia,
      secciones: seccionesMembresia || null,
      precio: precioMembresia ? parseFloat(precioMembresia) : 0,
      empresa_id: empresaId
    };

    if (editingMembresia) {
      const { error } = await supabase.from('membresias').update(payload).eq('id', editingMembresia.id);
      setSavingMembresia(false);
      if (!error) {
        setEditingMembresia(null);
        setNombreMembresia('');
        setSeccionesMembresia('');
        setPrecioMembresia('');
        setIsMembresiaModalOpen(false);
        fetchMembresias();
      } else {
        alert('Error al actualizar plan: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('membresias').insert([payload]);
      setSavingMembresia(false);
      if (!error) {
        setNombreMembresia('');
        setSeccionesMembresia('');
        setPrecioMembresia('');
        setIsMembresiaModalOpen(false);
        fetchMembresias();
      } else {
        alert('Error al crear plan: ' + error.message);
      }
    }
  };

  const handleDeleteMembresia = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return;
    const { error } = await supabase.from('membresias').delete().eq('id', id);
    if (!error) fetchMembresias();
    else alert('No se pudo eliminar el plan.');
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
    const empresaId = userProfile?.empresa_id;

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
        options: { 
          data: { 
            full_name: nuevoNombre, 
            role: nuevoRol,
            empresa_id: empresaId 
          } 
        }
      });
      setSavingUser(false);
      if (!error) {
        alert('Vendedor creado con éxito');
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

  const activeLogoSrc = empresaActualLogo || '/logo.png';

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm">Cargando CRM...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-gray-100 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-lg">
              <img src="/logo.png" alt="Automatízalo CRM" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">AUTOMATÍZALO CRM</h1>
              <p className="text-xs text-gray-400 mt-0.5">Inicia sesión en tu CRM</p>
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
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-300 focus:outline-none transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-sm">
              <img src={activeLogoSrc} alt="Logo CRM" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              {userProfile?.role === 'superadmin' ? 'PANEL MAESTRO (SUPERADMIN)' : 'AUTOMATÍZALO CRM'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {userProfile?.role !== 'superadmin' && (
            <button 
              onClick={() => setIsOnboardingOpen(true)}
              className="px-3 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center space-x-1"
            >
              <span>🚀 Guía</span>
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>

          <div className="relative w-80 bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-800">
            <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950 text-white">
              <div className="w-11 h-11 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow">
                <img src={activeLogoSrc} alt="Logo Sidebar" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight text-white">AUTOMATÍZALO</h2>
                <span className="text-[11px] text-blue-400 font-medium">
                  {userProfile?.role === 'superadmin' ? 'Super Admin Master' : 'CRM Comercial'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {userProfile?.role === 'superadmin' ? (
                <button onClick={() => { setCurrentTab('superadmin'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold transition text-left">
                  <span className="mr-3">🏢</span> Gestionar Negocios
                </button>
              ) : (
                <>
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
                    <span className="mr-3">👥</span> Clientes (Compradores)
                  </button>
                  <button onClick={() => { setCurrentTab('membresias'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                    <span className="mr-3">🏷️</span> Planes y Membresías
                  </button>
                  <button onClick={() => { setCurrentTab('metricas'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                    <span className="mr-3">📊</span> Métricas y Conversión
                  </button>
                  <button onClick={() => { setCurrentTab('mensajes'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                    <span className="mr-3">💬</span> Mensajes Automáticos
                  </button>
                  <button onClick={() => { setCurrentTab('equipo'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium transition text-left">
                    <span className="mr-3">⚙️</span> Vendedores / Equipo
                  </button>
                  <button onClick={() => { setCurrentTab('configuracion'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">🖼️</span> Configurar Logo / Marca
                  </button>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 text-xs text-gray-400 bg-slate-950 flex justify-between items-center">
              <span>Sesión activa</span>
              <button onClick={handleLogout} className="text-red-400 font-bold hover:underline">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 max-w-4xl mx-auto w-full">
        
        {/* PANEL CONFIGURACIÓN LOGO */}
        {userProfile?.role !== 'superadmin' && currentTab === 'configuracion' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Configuración de Identidad y Logo</h2>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
              <p className="text-xs text-gray-300">
                Cambia el enlace de tu logotipo corporativo para actualizarlo de forma dinámica en todo tu CRM.
              </p>
              
              <div className="flex items-center space-x-4 py-3">
                <div className="w-16 h-16 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-1 shadow-md">
                  <img src={activeLogoSrc} alt="Logo Actual" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Vista previa del logo actual</p>
                  <p className="text-[10px] text-gray-400">Se adapta de manera circular corporativa</p>
                </div>
              </div>

              <form onSubmit={handleUpdateLogoEmpresa} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">URL de la Imagen del Logo</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="https://ejemplo.com/tu-logo.png" 
                    value={nuevoLogoUrl} 
                    onChange={e => setNuevoLogoUrl(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={savingLogo} 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  {savingLogo ? 'Guardando Logo...' : 'Actualizar Logo en el CRM'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PANEL SUPERADMIN */}
        {userProfile?.role === 'superadmin' && (
          <div className="space-y-6">
            
            {/* FORMULARIO EDITAR O CREAR NEGOCIO */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>🏢</span> <span>{editingEmpresa ? 'Editar Negocio Dinámico' : 'Crear Nuevo Negocio'}</span>
              </h2>

              {editingEmpresa ? (
                <form onSubmit={handleUpdateEmpresaMaster} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Nombre del Negocio</label>
                    <input type="text" required value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Número de Teléfono (WhatsApp de contacto)</label>
                    <input type="text" placeholder="Ej. 5493854123456" value={editTelefono} onChange={e => setEditTelefono(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Dirección del Local</label>
                    <input type="text" placeholder="Ej. Av 25 de Mayo 705" value={editDireccion} onChange={e => setEditDireccion(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">URL del Logotipo</label>
                    <input type="url" placeholder="https://ejemplo.com/logo.png" value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button type="button" onClick={() => setEditingEmpresa(null)} className="flex-1 py-2.5 bg-slate-800 text-gray-300 rounded-xl text-xs font-bold">Cancelar</button>
                    <button type="submit" disabled={savingEmpresa} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition">
                      {savingEmpresa ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateEmpresaMaster} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Nombre del Negocio</label>
                    <input type="text" required placeholder="Ej. Gimnasio Titan / Mard's" value={nuevaEmpresaNombre} onChange={e => setNuevaEmpresaNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Nombre del Administrador</label>
                      <input type="text" required placeholder="Nombre del Dueño" value={adminEmpresaNombre} onChange={e => setAdminEmpresaNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Correo de Acceso Admin</label>
                      <input type="email" required placeholder="admin@negocio.com" value={adminEmpresaEmail} onChange={e => setAdminEmpresaEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Contraseña del Administrador</label>
                    <input type="password" required placeholder="••••••••" value={adminEmpresaPass} onChange={e => setAdminEmpresaPass(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  </div>
                  <button type="submit" disabled={savingEmpresa} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow">
                    {savingEmpresa ? 'Creando Empresa...' : 'Registrar Negocio y Cuenta Admin'}
                  </button>
                </form>
              )}
            </div>

            {/* LISTA DE NEGOCIOS REGISTRADOS */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white">Negocios Registrados ({empresas.length})</h3>
              <div className="space-y-3">
                {empresas.map((emp) => (
                  <div key={emp.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                          <img src={emp.logo_url || '/logo.png'} alt="Logo" className="w-full h-full object-contain rounded-full" />
                        </div>
                        <h4 className="font-bold text-white text-sm">{emp.nombre}</h4>
                      </div>
                      <p className="text-[11px] text-gray-400">📞 Tel: {emp.telefono || 'No configurado'} • 📍 Dir: {emp.direccion || 'No especificada'}</p>
                      <p className="text-[10px] text-gray-500 font-mono">ID: {emp.id}</p>
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto justify-end">
                      {emp.telefono && (
                        <a href={`https://wa.me/${emp.telefono}?text=Hola%20${encodeURIComponent(emp.nombre)}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">WhatsApp</a>
                      )}
                      <button onClick={() => { 
                        setEditingEmpresa(emp); 
                        setEditNombre(emp.nombre || ''); 
                        setEditTelefono(emp.telefono || ''); 
                        setEditDireccion(emp.direccion || ''); 
                        setEditLogoUrl(emp.logo_url || ''); 
                      }} className="px-2.5 py-1 bg-slate-800 text-gray-300 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700">Editar</button>
                      <button onClick={() => handleDeleteEmpresa(emp.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
