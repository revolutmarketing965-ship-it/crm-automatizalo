'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [currentTab, setCurrentTab] = useState<'dirige' | 'citas' | 'socios' | 'membresias' | 'equipo' | 'metricas' | 'mensajes' | 'superadmin' | 'configGlobal' | 'superadminLeads'>('dirige');
  const [activeView, setActiveView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');
  const [activeSociosView, setActiveSociosView] = useState<'lista' | 'tarjetas' | 'kanban'>('lista');

  const [dirige, setDirige] = useState<any[]>([]);
  const [equipoCitas, setEquipoCitas] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [membresias, setMembresias] = useState<any[]>([]);
  const [perfilesEquipo, setPerfilesEquipo] = useState<any[]>([]);
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [allLeadsSuperadmin, setAllLeadsSuperadmin] = useState<any[]>([]);
  const [selectedEmpresaLeadsId, setSelectedEmpresaLeadsId] = useState<string>('todos');
  
  // Superadmin - Crear Empresa
  const [nuevaEmpresaNombre, setNuevaEmpresaNombre] = useState('');
  const [adminEmpresaEmail, setAdminEmpresaEmail] = useState('');
  const [adminEmpresaPass, setAdminEmpresaPass] = useState('');
  const [adminEmpresaNombre, setAdminEmpresaNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevoLogoUrl, setNuevoLogoUrl] = useState('');
  const [savingEmpresa, setSavingEmpresa] = useState(false);

  // Superadmin - Editar Empresa
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

  const [empresaActualLogo, setEmpresaActualLogo] = useState('');
  const [globalLogo, setGlobalLogo] = useState('');

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

  // Form Lead
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [origen, setOrigen] = useState('Facebook Ads');
  const [leadStatus, setLeadStatus] = useState('NUEVO/ SIN CONTACTAR');
  const [notasLead, setNotasLead] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  // Form Cita
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [notasCita, setNotasCita] = useState('');
  const [savingCita, setSavingCita] = useState(false);

  // Form Socio
  const [selectedSocioLeadId, setSelectedSocioLeadId] = useState('');
  const [selectedMembresiaId, setSelectedMembresiaId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
  const [notasSocio, setNotasSocio] = useState('');
  const [savingSocio, setSavingSocio] = useState(false);

  // Form Membresia
  const [nombreMembresia, setNombreMembresia] = useState('');
  const [seccionesMembresia, setSeccionesMembresia] = useState('');
  const [precioMembresia, setPrecioMembresia] = useState('');
  const [savingMembresia, setSavingMembresia] = useState(false);

  // Form Equipo
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('vendedor');
  const [savingUser, setSavingUser] = useState(false);

  // WhatsApp
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Hola {nombre}, te recordamos que tienes una cita agendada con nosotros. ¡Te esperamos!'
  );
  const [savedTemplateMsg, setSavedTemplateMsg] = useState(false);

  // FETCH DATA CON FILTRADO SECUENCIAL E INYECCIÓN DE PERFIL
  const fetchDirige = useCallback(async (profile = userProfile) => {
    if (!profile) return;
    setLoadingLeads(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (profile.role !== 'superadmin') {
      if (!profile.empresa_id) { setDirige([]); setLoadingLeads(false); return; }
      query = query.eq('empresa_id', profile.empresa_id);
    }
    const { data, error } = await query;
    if (!error && data) setDirige(data);
    setLoadingLeads(false);
  }, [userProfile]);

  const fetchCitas = useCallback(async (profile = userProfile) => {
    if (!profile) return;
    setLoadingCitas(true);
    let query = supabase.from('appointments').select('*, leads(id, full_name, name, phone)');
    if (profile.role !== 'superadmin') {
      if (!profile.empresa_id) { setEquipoCitas([]); setLoadingCitas(false); return; }
      query = query.eq('empresa_id', profile.empresa_id);
    }
    const { data, error } = await query;
    if (!error && data) setEquipoCitas(data);
    setLoadingCitas(false);
  }, [userProfile]);

  const fetchSocios = useCallback(async (profile = userProfile) => {
    if (!profile) return;
    setLoadingSocios(true);
    let query = supabase.from('socios').select('*, leads(id, full_name, name, phone), membresias(id, nombre, secciones, precio)');
    if (profile.role !== 'superadmin') {
      if (!profile.empresa_id) { setSocios([]); setLoadingSocios(false); return; }
      query = query.eq('empresa_id', profile.empresa_id);
    }
    const { data, error } = await query;
    if (!error && data) setSocios(data);
    setLoadingSocios(false);
  }, [userProfile]);

  const fetchMembresias = useCallback(async (profile = userProfile) => {
    if (!profile) return;
    setLoadingMembresias(true);
    let query = supabase.from('membresias').select('*');
    if (profile.role !== 'superadmin') {
      if (!profile.empresa_id) { setMembresias([]); setLoadingMembresias(false); return; }
      query = query.eq('empresa_id', profile.empresa_id);
    }
    const { data, error } = await query;
    if (!error && data) setMembresias(data);
    setLoadingMembresias(false);
  }, [userProfile]);

  const fetchTeam = useCallback(async (profile = userProfile) => {
    if (!profile) return;
    setLoadingTeam(true);
    let query = supabase.from('profiles').select('*');
    if (profile.role !== 'superadmin') {
      if (!profile.empresa_id) { setPerfilesEquipo([]); setLoadingTeam(false); return; }
      query = query.eq('empresa_id', profile.empresa_id);
    }
    const { data, error } = await query;
    if (!error && data) setPerfilesEquipo(data);
    setLoadingTeam(false);
  }, [userProfile]);

  const fetchEmpresas = async () => {
    const { data } = await supabase.from('empresas').select('*');
    if (data) setEmpresas(data);
  };

  const fetchAllLeadsForSuperadmin = async () => {
    const { data } = await supabase.from('leads').select('*, empresas(nombre)');
    if (data) setAllLeadsSuperadmin(data);
  };

  const fetchGlobalLogo = async () => {
    const savedGlobal = localStorage.getItem('global_app_logo');
    if (savedGlobal) setGlobalLogo(savedGlobal);
  };

  const fetchEmpresaLogo = async (empresaId: string) => {
    const savedGlobal = localStorage.getItem('global_app_logo');
    if (savedGlobal) { setEmpresaActualLogo(savedGlobal); return; }
    const { data } = await supabase.from('empresas').select('logo_url').eq('id', empresaId).single();
    if (data && data.logo_url) setEmpresaActualLogo(data.logo_url);
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUserProfile(data);
      if (data.role === 'superadmin') {
        setCurrentTab('superadmin');
        fetchEmpresas();
        fetchGlobalLogo();
        fetchAllLeadsForSuperadmin();
      } else {
        setCurrentTab('dirige');
        if (data.empresa_id) fetchEmpresaLogo(data.empresa_id);
      }
      fetchDirige(data);
      fetchCitas(data);
      fetchSocios(data);
      fetchMembresias(data);
      fetchTeam(data);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else { setUserProfile(null); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError('Credenciales inválidas o error al iniciar sesión.');
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'nuevo' | 'edit' | 'global') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (targetField === 'nuevo') setNuevoLogoUrl(base64String);
        if (targetField === 'edit') setEditLogoUrl(base64String);
        if (targetField === 'global') {
          setGlobalLogo(base64String);
          localStorage.setItem('global_app_logo', base64String);
          alert('¡Logo global actualizado!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // SUPERADMIN HANDLERS
  const handleCreateEmpresaMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmpresa(true);
    const { data: empData, error: empError } = await supabase
      .from('empresas')
      .insert([{ nombre: nuevaEmpresaNombre, telefono: nuevoTelefono, direccion: nuevaDireccion, logo_url: nuevoLogoUrl || globalLogo || '/logo.png' }])
      .select().single();

    if (empError || !empData) {
      alert('Error al crear empresa: ' + (empError?.message || 'Desconocido'));
      setSavingEmpresa(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: adminEmpresaEmail,
      password: adminEmpresaPass,
      options: { data: { full_name: adminEmpresaNombre, role: 'administrador', empresa_id: empData.id } }
    });

    setSavingEmpresa(false);
    if (!signUpError) {
      alert('¡Negocio y Administrador creados con éxito!');
      setNuevaEmpresaNombre(''); setAdminEmpresaEmail(''); setAdminEmpresaPass('');
      setAdminEmpresaNombre(''); setNuevoTelefono(''); setNuevaDireccion(''); setNuevoLogoUrl('');
      fetchEmpresas(); fetchAllLeadsForSuperadmin();
    } else alert('Empresa creada, pero error en usuario admin: ' + signUpError.message);
  };

  const handleUpdateEmpresaMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpresa) return;
    setSavingEmpresa(true);
    const { error } = await supabase.from('empresas').update({
      nombre: editNombre, telefono: editTelefono, direccion: editDireccion, logo_url: editLogoUrl
    }).eq('id', editingEmpresa.id);
    setSavingEmpresa(false);
    if (!error) {
      alert('Negocio actualizado'); setEditingEmpresa(null); fetchEmpresas(); fetchAllLeadsForSuperadmin();
    } else alert('Error: ' + error.message);
  };

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm('¿Eliminar este negocio y sus datos asociados?')) return;
    const { error } = await supabase.from('empresas').delete().eq('id', id);
    if (!error) { fetchEmpresas(); fetchAllLeadsForSuperadmin(); alert('Negocio eliminado'); }
    else alert('Error: ' + error.message);
  };

  // LEADS HANDLERS
  const handleUpdateLeadStatusInline = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (!error) { fetchDirige(); if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin(); }
    else alert('Error: ' + error.message);
  };

  const handleCreateOrUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    if (editingLead) {
      const { error } = await supabase.from('leads').update({
        full_name: nombre, name: nombre, phone: telefono, email: correo || null, origin, status: leadStatus, notes: notasLead || null
      }).eq('id', editingLead.id);
      setSavingLead(false);
      if (!error) {
        setEditingLead(null); setNombre(''); setTelefono(''); setCorreo(''); setNotasLead('');
        setOrigen('Facebook Ads'); setLeadStatus('NUEVO/ SIN CONTACTAR'); setIsLeadModalOpen(false);
        fetchDirige(); if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin();
      } else alert('Error: ' + error.message);
    } else {
      const payload: any = { full_name: nombre, name: nombre, phone: telefono, email: correo || null, origin, status: leadStatus, notes: notasLead || null };
      if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) payload.empresa_id = userProfile.empresa_id;
      const { error } = await supabase.from('leads').insert([payload]);
      setSavingLead(false);
      if (!error) {
        setNombre(''); setTelefono(''); setCorreo(''); setNotasLead(''); setOrigen('Facebook Ads');
        setLeadStatus('NUEVO/ SIN CONTACTAR'); setIsLeadModalOpen(false); fetchDirige();
        if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin();
      } else alert('Error: ' + error.message);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('¿Eliminar este lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) { fetchDirige(); if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin(); }
    else alert('Error: ' + error.message);
  };

  // CITAS HANDLERS
  const handleCreateOrUpdateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLeadId = selectedLeadId || editingCita?.lead_id;
    if (!targetLeadId) { alert('Selecciona un lead válido'); return; }
    setSavingCita(true);
    const formattedDate = fechaCita || new Date().toISOString().split('T')[0];
    const formattedTime = horaCita || '00:00';
    const isoScheduledAt = new Date(`${formattedDate}T${formattedTime}:00`).toISOString();

    const payload: any = { lead_id: targetLeadId, appointment_date: formattedDate, appointment_time: formattedTime, scheduled_at: isoScheduledAt, notes: notasCita || null };
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) payload.empresa_id = userProfile.empresa_id;

    if (editingCita) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', editingCita.id);
      setSavingCita(false);
      if (!error) { setEditingCita(null); setFechaCita(''); setHoraCita(''); setNotasCita(''); setSelectedLeadId(''); setIsCitaModalOpen(false); fetchCitas(); }
      else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('appointments').insert([payload]);
      setSavingCita(false);
      if (!error) { setFechaCita(''); setHoraCita(''); setSelectedLeadId(''); setNotasCita(''); setIsCitaModalOpen(false); fetchCitas(); alert('Cita agendada'); }
      else alert('Error: ' + error.message);
    }
  };

  const handleDeleteCita = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) fetchCitas();
    else alert('Error: ' + error.message);
  };

  // SOCIOS HANDLERS
  const handleConvertLeadToSocio = async (leadId: string) => {
    if (!leadId) return;
    const empresaId = userProfile?.empresa_id || null;
    const defaultMembresiaId = membresias.length > 0 ? membresias[0].id : null;
    const payload: any = { lead_id: leadId, membresia_id: defaultMembresiaId, payment_status: 'Pagado', notes: 'Convertido desde CRM' };
    if (empresaId) payload.empresa_id = empresaId;

    const { error } = await supabase.from('socios').insert([payload]);
    if (!error) {
      await supabase.from('leads').update({ status: 'CITA AGENDA' }).eq('id', leadId);
      fetchSocios(); fetchDirige(); alert('¡Cliente registrado!');
    } else alert('Error: ' + error.message);
  };

  const handleCreateOrUpdateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocio(true);
    const payload: any = {
      lead_id: selectedSocioLeadId || editingSocio?.lead_id,
      membresia_id: selectedMembresiaId || null,
      payment_status: paymentStatus,
      notes: notasSocio || null,
    };
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) payload.empresa_id = userProfile.empresa_id;

    if (editingSocio) {
      const { error } = await supabase.from('socios').update(payload).eq('id', editingSocio.id);
      setSavingSocio(false);
      if (!error) { setEditingSocio(null); setSelectedSocioLeadId(''); setSelectedMembresiaId(''); setPaymentStatus('Pagado'); setNotasSocio(''); setIsSocioModalOpen(false); fetchSocios(); }
      else alert('Error: ' + error.message);
    } else {
      if (!selectedSocioLeadId) { alert('Selecciona un lead válido'); setSavingSocio(false); return; }
      const { error } = await supabase.from('socios').insert([payload]);
      setSavingSocio(false);
      if (!error) { setSelectedSocioLeadId(''); setSelectedMembresiaId(''); setPaymentStatus('Pagado'); setNotasSocio(''); setIsSocioModalOpen(false); fetchSocios(); }
      else alert('Error: ' + error.message);
    }
  };

  const handleDeleteSocio = async (socioId: string) => {
    if (!confirm('¿Eliminar cliente?')) return;
    const { error } = await supabase.from('socios').delete().eq('id', socioId);
    if (!error) fetchSocios();
    else alert('Error al eliminar cliente');
  };

  // MEMBRESÍAS HANDLERS
  const handleCreateOrUpdateMembresia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMembresia(true);
    const payload: any = { nombre: nombreMembresia, secciones: seccionesMembresia || null, precio: precioMembresia ? parseFloat(precioMembresia) : 0 };
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) payload.empresa_id = userProfile.empresa_id;

    if (editingMembresia) {
      const { error } = await supabase.from('membresias').update(payload).eq('id', editingMembresia.id);
      setSavingMembresia(false);
      if (!error) { setEditingMembresia(null); setNombreMembresia(''); setSeccionesMembresia(''); setPrecioMembresia(''); setIsMembresiaModalOpen(false); fetchMembresias(); }
      else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('membresias').insert([payload]);
      setSavingMembresia(false);
      if (!error) { setNombreMembresia(''); setSeccionesMembresia(''); setPrecioMembresia(''); setIsMembresiaModalOpen(false); fetchMembresias(); }
      else alert('Error: ' + error.message);
    }
  };

  const handleDeleteMembresia = async (id: string) => {
    if (!confirm('¿Eliminar plan?')) return;
    const { error } = await supabase.from('membresias').delete().eq('id', id);
    if (!error) fetchMembresias();
    else alert('Error al eliminar plan');
  };

  // NOTAS HANDLER
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNoteTarget) return;
    setSavingNote(true);
    const tableName = currentNoteTarget.type === 'lead' ? 'leads' : currentNoteTarget.type === 'cita' ? 'appointments' : 'socios';
    const { error } = await supabase.from(tableName).update({ notes: currentNoteTarget.notes }).eq('id', currentNoteTarget.id);
    setSavingNote(false);
    if (!error) {
      setCurrentNoteTarget(null);
      if (currentNoteTarget.type === 'lead') fetchDirige();
      if (currentNoteTarget.type === 'cita') fetchCitas();
      if (currentNoteTarget.type === 'socio') fetchSocios();
      alert('Nota guardada');
    } else alert('Error: ' + error.message);
  };

  // EQUIPO HANDLERS
  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    if (editingUser) {
      const { error } = await supabase.from('profiles').update({ full_name: nuevoNombre, role: nuevoRol }).eq('id', editingUser.id);
      setSavingUser(false);
      if (!error) {
        alert('Usuario actualizado'); setEditingUser(null); setNuevoNombre(''); setNuevoEmail(''); setNuevoPassword(''); setNuevoRol('vendedor'); setIsUserModalOpen(false); fetchTeam();
      } else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: nuevoEmail, password: nuevoPassword, options: { data: { full_name: nuevoNombre, role: nuevoRol, empresa_id: userProfile?.empresa_id || null } }
      });
      setSavingUser(false);
      if (!error) {
        alert('Vendedor creado con éxito'); setNuevoNombre(''); setNuevoEmail(''); setNuevoPassword(''); setNuevoRol('vendedor'); setIsUserModalOpen(false); fetchTeam();
      } else alert('Error: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Eliminar usuario?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) fetchTeam();
    else alert('Error al eliminar');
  };

  const activeLogoSrc = globalLogo || empresaActualLogo || '/logo.png';

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm font-medium animate-pulse">Cargando CRM y validando credenciales...</p>
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
            {loginError && <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl text-center">{loginError}</div>}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Correo electrónico</label>
              <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Contraseña</label>
              <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg active:scale-95">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }
