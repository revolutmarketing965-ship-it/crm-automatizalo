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
  
  const [nuevaEmpresaNombre, setNuevaEmpresaNombre] = useState('');
  const [adminEmpresaEmail, setAdminEmpresaEmail] = useState('');
  const [adminEmpresaPass, setAdminEmpresaPass] = useState('');
  const [adminEmpresaNombre, setAdminEmpresaNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevoLogoUrl, setNuevoLogoUrl] = useState('');
  const [savingEmpresa, setSavingEmpresa] = useState(false);

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

  // -------------------------------------------------------------
  // CONSULTAS CON FILTRADO SECUENCIAL Y AISLAMIENTO DE EMPRESA
  // -------------------------------------------------------------
  const fetchDirige = useCallback(async (profile = userProfile) => {
    if (!profile) return;
    setLoadingLeads(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    
    if (profile.role !== 'superadmin') {
      if (!profile.empresa_id) {
        setDirige([]);
        setLoadingLeads(false);
        return;
      }
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
      if (!profile.empresa_id) {
        setEquipoCitas([]);
        setLoadingCitas(false);
        return;
      }
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
      if (!profile.empresa_id) {
        setSocios([]);
        setLoadingSocios(false);
        return;
      }
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
      if (!profile.empresa_id) {
        setMembresias([]);
        setLoadingMembresias(false);
        return;
      }
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
      if (!profile.empresa_id) {
        setPerfilesEquipo([]);
        setLoadingTeam(false);
        return;
      }
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
    if (savedGlobal) {
      setEmpresaActualLogo(savedGlobal);
      return;
    }
    const { data } = await supabase.from('empresas').select('logo_url').eq('id', empresaId).single();
    if (data && data.logo_url) {
      setEmpresaActualLogo(data.logo_url);
    }
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

      // Disparar las descargas pasando la instancia 'data' obtenida
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
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setAuthLoading(false);
      }
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
          alert('¡Logo global actualizado para toda la aplicación!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEmpresaMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmpresa(true);

    const { data: empData, error: empError } = await supabase
      .from('empresas')
      .insert([{ 
        nombre: nuevaEmpresaNombre, 
        telefono: nuevoTelefono, 
        direccion: nuevaDireccion, 
        logo_url: nuevoLogoUrl || globalLogo || '/logo.png' 
      }])
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
      setNuevoTelefono('');
      setNuevaDireccion('');
      setNuevoLogoUrl('');
      fetchEmpresas();
      fetchAllLeadsForSuperadmin();
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
      fetchAllLeadsForSuperadmin();
    } else {
      alert('Error al actualizar negocio: ' + error.message);
    }
  };

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este negocio? Se borrarán sus datos asociados.')) return;
    const { error } = await supabase.from('empresas').delete().eq('id', id);
    if (!error) {
      fetchEmpresas();
      fetchAllLeadsForSuperadmin();
      alert('Negocio eliminado con éxito');
    } else {
      alert('Error al eliminar negocio: ' + error.message);
    }
  };

  const handleUpdateLeadStatusInline = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (!error) {
      fetchDirige();
      if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin();
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
        name: nombre,
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
        if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin();
      } else {
        alert('Error al actualizar lead: ' + error.message);
      }
    } else {
      const payload: any = { 
        full_name: nombre, 
        name: nombre,
        phone: telefono, 
        email: correo || null, 
        origin,
        status: leadStatus,
        notes: notasLead || null
      };
      
      // Inyección obligatoria de empresa_id
      if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
        payload.empresa_id = userProfile.empresa_id;
      }

      const { error } = await supabase.from('leads').insert([payload]);
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
        if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin();
      } else {
        alert('Error al guardar el lead: ' + error.message);
      }
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) {
      fetchDirige();
      if (userProfile?.role === 'superadmin') fetchAllLeadsForSuperadmin();
    } else {
      alert('Error al eliminar lead: ' + error.message);
    }
  };

  const handleCreateOrUpdateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLeadId = selectedLeadId || editingCita?.lead_id;
    if (!targetLeadId) {
      alert('Por favor selecciona un lead válido');
      return;
    }
    setSavingCita(true);
    
    const formattedDate = fechaCita || new Date().toISOString().split('T')[0];
    const formattedTime = horaCita || '00:00';
    const isoScheduledAt = new Date(`${formattedDate}T${formattedTime}:00`).toISOString();

    const payload: any = {
      lead_id: targetLeadId,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
      scheduled_at: isoScheduledAt,
      notes: notasCita || null,
    };
    
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      payload.empresa_id = userProfile.empresa_id;
    }

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
    const empresaId = userProfile?.empresa_id || null;
    const defaultMembresiaId = membresias.length > 0 ? membresias[0].id : null;
    
    const payload: any = {
      lead_id: leadId,
      membresia_id: defaultMembresiaId,
      payment_status: 'Pagado',
      notes: 'Convertido directamente desde CRM'
    };
    if (empresaId) payload.empresa_id = empresaId;

    const { error } = await supabase.from('socios').insert([payload]);
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

    const payload: any = {
      lead_id: selectedSocioLeadId || editingSocio?.lead_id,
      membresia_id: selectedMembresiaId || null,
      payment_status: paymentStatus,
      notes: notasSocio || null,
    };
    
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      payload.empresa_id = userProfile.empresa_id;
    }

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

    const payload: any = {
      nombre: nombreMembresia,
      secciones: seccionesMembresia || null,
      precio: precioMembresia ? parseFloat(precioMembresia) : 0,
    };
    
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      payload.empresa_id = userProfile.empresa_id;
    }

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
            empresa_id: userProfile?.empresa_id || null 
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
                <>
                  <button onClick={() => { setCurrentTab('superadmin'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">🏢</span> Gestionar Negocios
                  </button>
                  <button onClick={() => { setCurrentTab('superadminLeads'); setIsSidebarOpen(false); fetchAllLeadsForSuperadmin(); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">🎯</span> Leads de todos los Negocios
                  </button>
                  <button onClick={() => { setCurrentTab('configGlobal'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">⚙️</span> Configuración Global
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setCurrentTab('dirige'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">🎯</span> Leads
                  </button>
                  <button onClick={() => { setCurrentTab('citas'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">📅</span> Citas Agendadas
                  </button>
                  <button onClick={() => { setCurrentTab('socios'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">👥</span> Clientes / Socios
                  </button>
                  <button onClick={() => { setCurrentTab('membresias'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">💳</span> Planes / Membresías
                  </button>
                  <button onClick={() => { setCurrentTab('equipo'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-bold transition text-left">
                    <span className="mr-3">👨‍💼</span> Vendedores / Equipo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL Y PESTAÑAS */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {currentTab === 'dirige' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Gestión de Leads</h2>
              <button
                onClick={() => {
                  setEditingLead(null);
                  setNombre('');
                  setTelefono('');
                  setCorreo('');
                  setNotasLead('');
                  setIsLeadModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                + Nuevo Lead
              </button>
            </div>

            {loadingLeads ? (
              <p className="text-xs text-gray-400">Cargando leads del negocio...</p>
            ) : dirige.length === 0 ? (
              <p className="text-xs text-gray-400">No hay leads registrados en este negocio.</p>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-slate-950 text-gray-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {dirige.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3 font-medium text-white">{lead.full_name || lead.name}</td>
                        <td className="p-3">{lead.phone}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-[10px]">
                            {lead.status || 'NUEVO'}
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-400 hover:underline"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentTab === 'superadmin' && userProfile?.role === 'superadmin' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Panel Master - Negocios Registrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {empresas.map((emp) => (
                <div key={emp.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
                  <h3 className="font-bold text-white text-base">{emp.nombre}</h3>
                  <p className="text-xs text-gray-400">Teléfono: {emp.telefono || 'N/A'}</p>
                  <p className="text-xs text-gray-400">Dirección: {emp.direccion || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL CREAR / EDITAR LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingLead ? 'Editar Lead' : 'Nuevo Lead'}
            </h3>
            <form onSubmit={handleCreateOrUpdateLead} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  {savingLead ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
