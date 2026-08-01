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
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!data) {
      const defaultProfile = { id: userId, full_name: 'Administrador', role: 'superadmin' };
      await supabase.from('profiles').upsert([defaultProfile]);
      data = defaultProfile;
    }
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
    setAuthLoading(false);
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
    if (data && data.logo_url) setEmpresaActualLogo(data.logo_url);
  };

  const fetchEmpresas = async () => {
    const { data } = await supabase.from('empresas').select('*');
    if (data) setEmpresas(data);
  };

  const fetchAllLeadsForSuperadmin = async () => {
    const { data } = await supabase.from('leads').select('*, empresas(nombre)');
    if (data) setAllLeadsSuperadmin(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setLoginError('Credenciales inválidas o error al iniciar sesión.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchDirige = async () => {
    setLoadingLeads(true);
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setDirige(data);
    setLoadingLeads(false);
  };

  const fetchCitas = async () => {
    setLoadingCitas(true);
    let query = supabase.from('appointments').select('*, leads(id, full_name, name, phone)');
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setEquipoCitas(data);
    setLoadingCitas(false);
  };

  const fetchSocios = async () => {
    setLoadingSocios(true);
    let query = supabase.from('socios').select('*, leads(id, full_name, name, phone), membresias(id, nombre, secciones, precio)');
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setSocios(data);
    setLoadingSocios(false);
  };

  const fetchMembresias = async () => {
    setLoadingMembresias(true);
    let query = supabase.from('membresias').select('*');
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setMembresias(data);
    setLoadingMembresias(false);
  };

  const fetchTeam = async () => {
    setLoadingTeam(true);
    let query = supabase.from('profiles').select('*');
    if (userProfile?.role !== 'superadmin' && userProfile?.empresa_id) {
      query = query.eq('empresa_id', userProfile.empresa_id);
    }
    const { data } = await query;
    if (data) setPerfilesEquipo(data);
    setLoadingTeam(false);
  };

  useEffect(() => {
    if (session && userProfile && userProfile.role !== 'superadmin') {
      fetchDirige();
      fetchCitas();
      fetchSocios();
      fetchMembresias();
      fetchTeam();
    }
  }, [session, userProfile]);

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
      .insert([{ nombre: nuevaEmpresaNombre, telefono: nuevoTelefono, direccion: nuevaDireccion, logo_url: nuevoLogoUrl || globalLogo || '/logo.png' }])
      .select()
      .single();

    if (empError || !empData) {
      alert('Error al crear empresa: ' + (empError?.message || 'Desconocido'));
      setSavingEmpresa(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: adminEmpresaEmail, password: adminEmpresaPass });
    if (!signUpError && signUpData.user) {
      await supabase.from('profiles').upsert([{ id: signUpData.user.id, full_name: adminEmpresaNombre, role: 'admin', empresa_id: empData.id }]);
    }
    setSavingEmpresa(false);
    if (!signUpError) {
      alert('¡Negocio y Administrador creados con éxito!');
      setNuevaEmpresaNombre(''); setAdminEmpresaEmail(''); setAdminEmpresaPass(''); setAdminEmpresaNombre('');
      setNuevoTelefono(''); setNuevaDireccion(''); setNuevoLogoUrl('');
      fetchEmpresas(); fetchAllLeadsForSuperadmin();
    } else {
      alert('Error al crear usuario admin: ' + signUpError.message);
    }
  };

  const handleUpdateEmpresaMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpresa) return;
    setSavingEmpresa(true);
    const { error } = await supabase.from('empresas').update({ nombre: editNombre, telefono: editTelefono, direccion: editDireccion, logo_url: editLogoUrl }).eq('id', editingEmpresa.id);
    setSavingEmpresa(false);
    if (!error) {
      alert('Negocio actualizado con éxito');
      setEditingEmpresa(null);
      fetchEmpresas(); fetchAllLeadsForSuperadmin();
    } else {
      alert('Error al actualizar negocio: ' + error.message);
    }
  };

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este negocio?')) return;
    const { error } = await supabase.from('empresas').delete().eq('id', id);
    if (!error) { fetchEmpresas(); fetchAllLeadsForSuperadmin(); alert('Negocio eliminado'); }
  };

  const handleUpdateLeadStatusInline = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (!error) { fetchDirige(); fetchAllLeadsForSuperadmin(); }
  };

  const handleCreateOrUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    const empresaId = userProfile?.empresa_id || null;

    if (editingLead) {
      const { error } = await supabase.from('leads').update({
        full_name: nombre, name: nombre, phone: telefono, email: correo || null, origin, status: leadStatus, notes: notasLead || null
      }).eq('id', editingLead.id);
      setSavingLead(false);
      if (!error) {
        setEditingLead(null); setNombre(''); setTelefono(''); setCorreo(''); setNotasLead('');
        setIsLeadModalOpen(false); fetchDirige();
      } else alert('Error al actualizar lead: ' + error.message);
    } else {
      const payload: any = { full_name: nombre, name: nombre, phone: telefono, email: correo || null, origin, status: leadStatus, notes: notasLead || null };
      if (empresaId) payload.empresa_id = empresaId;
      const { error } = await supabase.from('leads').insert([payload]);
      setSavingLead(false);
      if (!error) {
        setNombre(''); setTelefono(''); setCorreo(''); setNotasLead('');
        setIsLeadModalOpen(false); fetchDirige();
      } else alert('Error al guardar lead: ' + error.message);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) fetchDirige();
  };

  const handleCreateOrUpdateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLeadId = selectedLeadId || editingCita?.lead_id;
    if (!targetLeadId) { alert('Selecciona un lead válido'); return; }
    setSavingCita(true);
    const empresaId = userProfile?.empresa_id || null;
    const formattedDate = fechaCita || new Date().toISOString().split('T')[0];
    const formattedTime = horaCita || '00:00';
    const payload: any = {
      lead_id: targetLeadId, appointment_date: formattedDate, appointment_time: formattedTime,
      scheduled_at: new Date(`${formattedDate}T${formattedTime}:00`).toISOString(), notes: notasCita || null
    };
    if (empresaId) payload.empresa_id = empresaId;

    if (editingCita) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', editingCita.id);
      setSavingCita(false);
      if (!error) { setEditingCita(null); setIsCitaModalOpen(false); fetchCitas(); } else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('appointments').insert([payload]);
      setSavingCita(false);
      if (!error) { setIsCitaModalOpen(false); fetchCitas(); } else alert('Error: ' + error.message);
    }
  };

  const handleDeleteCita = async (id: string) => {
    if (!confirm('¿Eliminar cita?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) fetchCitas();
  };

  const handleConvertLeadToSocio = async (leadId: string) => {
    if (!leadId) return;
    const empresaId = userProfile?.empresa_id || null;
    const defaultMembresiaId = membresias[0]?.id || null;
    const payload: any = { lead_id: leadId, membresia_id: defaultMembresiaId, payment_status: 'Pagado', notes: 'Convertido desde CRM' };
    if (empresaId) payload.empresa_id = empresaId;

    const { error } = await supabase.from('socios').insert([payload]);
    if (!error) {
      await supabase.from('leads').update({ status: 'CITA AGENDA' }).eq('id', leadId);
      fetchSocios(); fetchDirige(); alert('¡Cliente registrado con éxito!');
    } else alert('Error: ' + error.message);
  };

  const handleCreateOrUpdateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocio(true);
    const empresaId = userProfile?.empresa_id || null;
    const payload: any = { lead_id: selectedSocioLeadId || editingSocio?.lead_id, membresia_id: selectedMembresiaId || null, payment_status: paymentStatus, notes: notasSocio || null };
    if (empresaId) payload.empresa_id = empresaId;

    if (editingSocio) {
      const { error } = await supabase.from('socios').update(payload).eq('id', editingSocio.id);
      setSavingSocio(false);
      if (!error) { setEditingSocio(null); setIsSocioModalOpen(false); fetchSocios(); } else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('socios').insert([payload]);
      setSavingSocio(false);
      if (!error) { setIsSocioModalOpen(false); fetchSocios(); } else alert('Error: ' + error.message);
    }
  };

  const handleDeleteSocio = async (id: string) => {
    if (!confirm('¿Eliminar cliente?')) return;
    const { error } = await supabase.from('socios').delete().eq('id', id);
    if (!error) fetchSocios();
  };

  const handleCreateOrUpdateMembresia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMembresia(true);
    const empresaId = userProfile?.empresa_id || null;
    const payload: any = { nombre: nombreMembresia, secciones: seccionesMembresia || null, precio: precioMembresia ? parseFloat(precioMembresia) : 0 };
    if (empresaId) payload.empresa_id = empresaId;

    if (editingMembresia) {
      const { error } = await supabase.from('membresias').update(payload).eq('id', editingMembresia.id);
      setSavingMembresia(false);
      if (!error) { setEditingMembresia(null); setIsMembresiaModalOpen(false); fetchMembresias(); } else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('membresias').insert([payload]);
      setSavingMembresia(false);
      if (!error) { setIsMembresiaModalOpen(false); fetchMembresias(); } else alert('Error: ' + error.message);
    }
  };

  const handleDeleteMembresia = async (id: string) => {
    if (!confirm('¿Eliminar plan?')) return;
    const { error } = await supabase.from('membresias').delete().eq('id', id);
    if (!error) fetchMembresias();
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNoteTarget) return;
    setSavingNote(true);
    const table = currentNoteTarget.type === 'lead' ? 'leads' : currentNoteTarget.type === 'cita' ? 'appointments' : 'socios';
    const { error } = await supabase.from(table).update({ notes: currentNoteTarget.notes }).eq('id', currentNoteTarget.id);
    setSavingNote(false);
    if (!error) {
      setCurrentNoteTarget(null);
      if (table === 'leads') fetchDirige();
      if (table === 'appointments') fetchCitas();
      if (table === 'socios') fetchSocios();
      alert('Nota guardada');
    } else alert('Error: ' + error.message);
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    const empresaId = userProfile?.empresa_id || null;

    if (editingUser) {
      const { error } = await supabase.from('profiles').update({ full_name: nuevoNombre, role: nuevoRol }).eq('id', editingUser.id);
      setSavingUser(false);
      if (!error) { setEditingUser(null); setIsUserModalOpen(false); fetchTeam(); alert('Usuario actualizado'); } else alert('Error: ' + error.message);
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: nuevoEmail, password: nuevoPassword });
      if (!signUpError && signUpData.user) {
        await supabase.from('profiles').upsert([{ id: signUpData.user.id, full_name: nuevoNombre, role: nuevoRol, empresa_id: empresaId }]);
      }
      setSavingUser(false);
      if (!signUpError) { setIsUserModalOpen(false); fetchTeam(); alert('Vendedor creado'); } else alert('Error: ' + signUpError.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Eliminar usuario?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) fetchTeam();
  };

  const getWhatsAppLink = (phone: string, leadName: string) => {
    const msg = whatsappTemplate.replace(/{nombre}/g, leadName || 'Cliente');
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const totalLeadsCount = dirige.length;
  const totalSociosCount = socios.length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((totalSociosCount / totalLeadsCount) * 100) : 0;
  const failureRate = 100 - conversionRate;

  const statusCounts = statuses.map((st) => {
    const count = dirige.filter((l) => (l.status || 'NUEVO/ SIN CONTACTAR') === st).length;
    const percentage = totalLeadsCount > 0 ? Math.round((count / totalLeadsCount) * 100) : 0;
    return { status: st, count, percentage };
  });

  const activeLogoSrc = globalLogo || empresaActualLogo || '/logo.png';

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-white"><p className="text-sm">Cargando...</p></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-gray-100 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-lg">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <h1 className="text-lg font-bold text-white">AUTOMATÍZALO CRM</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl text-center">{loginError}</div>}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Correo electrónico</label>
              <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Contraseña</label>
              <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-gray-100 font-sans pb-16 md:pb-0">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
              <img src={activeLogoSrc} alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-bold text-sm text-white">{userProfile?.role === 'superadmin' ? 'PANEL MAESTRO (SUPERADMIN)' : 'AUTOMATÍZALO CRM'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {userProfile?.role !== 'superadmin' && (
            <button onClick={() => setIsOnboardingOpen(true)} className="px-3 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white">🚀 Guía</button>
          )}
          <button onClick={handleLogout} className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white">Salir</button>
        </div>
      </header>

      {/* SIDEBAR */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-80 bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-800">
            <div className="p-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950 text-white">
              <div className="w-11 h-11 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                <img src={activeLogoSrc} alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">AUTOMATÍZALO</h2>
                <span className="text-[11px] text-blue-400">{userProfile?.role === 'superadmin' ? 'Super Admin Master' : 'CRM Comercial'}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {userProfile?.role === 'superadmin' ? (
                <>
                  <button onClick={() => { setCurrentTab('superadmin'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold text-left">🏢 Gestionar Negocios</button>
                  <button onClick={() => { setCurrentTab('superadminLeads'); setIsSidebarOpen(false); fetchAllLeadsForSuperadmin(); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold text-left">🎯 Leads de todos los Negocios</button>
                  <button onClick={() => { setCurrentTab('configGlobal'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-blue-400 hover:bg-slate-800 text-sm font-bold text-left">⚙️ Configuración Global (Logo)</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setIsOnboardingOpen(true); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">🚀 Guía de Onboarding</button>
                  <button onClick={() => { setCurrentTab('dirige'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">🎯 Dirige (Leads)</button>
                  <button onClick={() => { setCurrentTab('citas'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">📅 Citas y Agendamientos</button>
                  <button onClick={() => { setCurrentTab('socios'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">👥 Clientes (Compradores)</button>
                  <button onClick={() => { setCurrentTab('membresias'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">🏷️ Planes y Membresías</button>
                  <button onClick={() => { setCurrentTab('metricas'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">📊 Métricas y Conversión</button>
                  <button onClick={() => { setCurrentTab('mensajes'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">💬 Mensajes Automáticos</button>
                  <button onClick={() => { setCurrentTab('equipo'); setIsSidebarOpen(false); }} className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 text-sm font-medium text-left">⚙️ Vendedores / Equipo</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {currentTab === 'dirige' && userProfile?.role !== 'superadmin' && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-center space-x-2 sticky top-[53px] z-10 shadow-sm">
          <button onClick={() => setActiveView('lista')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeView === 'lista' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>📋 Lista</button>
          <button onClick={() => setActiveView('tarjetas')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeView === 'tarjetas' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>📇 Tarjetas</button>
          <button onClick={() => setActiveView('kanban')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeView === 'kanban' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>📊 Columnas</button>
        </div>
      )}

      {currentTab === 'socios' && userProfile?.role !== 'superadmin' && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-center space-x-2 sticky top-[53px] z-10 shadow-sm">
          <button onClick={() => setActiveSociosView('lista')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeSociosView === 'lista' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>📋 Lista</button>
          <button onClick={() => setActiveSociosView('tarjetas')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeSociosView === 'tarjetas' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>📇 Tarjetas</button>
          <button onClick={() => setActiveSociosView('kanban')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeSociosView === 'kanban' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'}`}>📊 Columnas</button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL COMPLETO Y EXTENDIDO */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 max-w-5xl mx-auto w-full">
        {userProfile?.role === 'superadmin' && currentTab === 'superadminLeads' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h2 className="text-base font-bold text-white">Monitoreo de Leads por Negocio</h2>
              <select value={selectedEmpresaLeadsId} onChange={(e) => setSelectedEmpresaLeadsId(e.target.value)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                <option value="todos">Todos los Negocios</option>
                {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {statuses.map(st => {
                const list = allLeadsSuperadmin.filter(l => (selectedEmpresaLeadsId === 'todos' || l.empresa_id === selectedEmpresaLeadsId) && (l.status || 'NUEVO/ SIN CONTACTAR') === st);
                return (
                  <div key={st} className="bg-slate-900 border border-slate-800 p-3 rounded-xl h-[65vh] overflow-y-auto">
                    <h3 className="text-xs font-bold text-blue-400 uppercase mb-2">{st} ({list.length})</h3>
                    {list.map(l => (
                      <div key={l.id} className="bg-slate-950 p-2.5 rounded-lg mb-2 text-xs border border-slate-800 space-y-1">
                        <p className="font-bold text-white">{l.full_name || l.name}</p>
                        <p className="text-gray-400">📞 {l.phone}</p>
                        <span className="text-[9px] bg-blue-900/40 text-blue-300 px-1 rounded">{l.empresas?.nombre}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {userProfile?.role === 'superadmin' && currentTab === 'configGlobal' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Configuración Global de Logo</h2>
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'global')} className="w-full text-xs text-gray-300 file:bg-blue-600 file:text-white file:border-0 file:py-1.5 file:px-3 file:rounded-lg cursor-pointer" />
          </div>
        )}

        {userProfile?.role === 'superadmin' && currentTab === 'superadmin' && (
          <div className="space-y-6">
            {editingEmpresa ? (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 border-blue-500/50">
                <h2 className="text-lg font-bold text-white">Editar Negocio: {editingEmpresa.nombre}</h2>
                <form onSubmit={handleUpdateEmpresaMaster} className="space-y-3">
                  <input type="text" required value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <input type="text" placeholder="Teléfono" value={editTelefono} onChange={e => setEditTelefono(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <input type="text" placeholder="Dirección" value={editDireccion} onChange={e => setEditDireccion(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} className="w-full text-xs text-gray-300 file:bg-blue-600 file:text-white file:border-0 file:py-1.5 file:px-3 file:rounded-lg cursor-pointer" />
                  <div className="flex space-x-2 pt-2">
                    <button type="button" onClick={() => setEditingEmpresa(null)} className="flex-1 py-2 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Cancelar</button>
                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white">🏢 Crear Nuevo Negocio</h2>
                <form onSubmit={handleCreateEmpresaMaster} className="space-y-3">
                  <input type="text" required placeholder="Nombre del Negocio" value={nuevaEmpresaNombre} onChange={e => setNuevaEmpresaNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <input type="text" required placeholder="Nombre del Administrador" value={adminEmpresaNombre} onChange={e => setAdminEmpresaNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <input type="email" required placeholder="Correo Admin" value={adminEmpresaEmail} onChange={e => setAdminEmpresaEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <input type="password" required placeholder="Contraseña Admin" value={adminEmpresaPass} onChange={e => setAdminEmpresaPass(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                  <button type="submit" disabled={savingEmpresa} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold">{savingEmpresa ? 'Creando...' : 'Registrar Negocio y Admin'}</button>
                </form>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white">Negocios Registrados ({empresas.length})</h3>
              {empresas.map((emp) => (
                <div key={emp.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">{emp.nombre}</h4>
                    <p className="text-xs text-gray-400">📞 {emp.telefono || 'Sin tel'} • 📍 {emp.direccion || 'Sin dir'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingEmpresa(emp); setEditNombre(emp.nombre || ''); setEditTelefono(emp.telefono || ''); setEditDireccion(emp.direccion || ''); setEditLogoUrl(emp.logo_url || ''); }} className="px-2.5 py-1 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Editar</button>
                    <button onClick={() => handleDeleteEmpresa(emp.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {userProfile?.role !== 'superadmin' && currentTab === 'dirige' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Gestión de Leads ({dirige.length})</h2>
              <button onClick={() => { setEditingLead(null); setNombre(''); setTelefono(''); setCorreo(''); setIsLeadModalOpen(true); }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Nuevo Lead</button>
            </div>
            {dirige.length === 0 ? <p className="text-center text-gray-500 py-10 text-xs">No hay leads registrados.</p> : activeView === 'lista' ? (
              <div className="space-y-2">
                {dirige.map(l => (
                  <div key={l.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{l.full_name || l.name}</h4>
                      <p className="text-xs text-gray-400">📞 {l.phone} • Estado: <span className="text-blue-400">{l.status}</span></p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleConvertLeadToSocio(l.id)} className="px-2.5 py-1 bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-bold">Cliente</button>
                      <button onClick={() => { setSelectedLeadId(l.id); setIsCitaModalOpen(true); }} className="px-2.5 py-1 bg-blue-600/30 text-blue-400 rounded-lg text-xs font-bold">Agendar</button>
                      <a href={getWhatsAppLink(l.phone, l.full_name || l.name)} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-green-900/40 text-green-400 rounded-lg text-xs font-bold">WhatsApp</a>
                      <button onClick={() => handleDeleteLead(l.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeView === 'tarjetas' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dirige.map(l => (
                  <div key={l.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{l.full_name || l.name}</h4>
                    <p className="text-xs text-gray-400">📞 {l.phone}</p>
                    <p className="text-xs text-blue-400">Estado: {l.status}</p>
                    <div className="flex space-x-2 pt-1">
                      <button onClick={() => handleConvertLeadToSocio(l.id)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Cliente</button>
                      <button onClick={() => handleDeleteLead(l.id)} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {statuses.map(status => {
                  const statusLeads = dirige.filter(l => (l.status || 'NUEVO/ SIN CONTACTAR') === status);
                  return (
                    <div key={status} className="w-72 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col max-h-[65vh]">
                      <h3 className="font-bold text-xs text-gray-300 mb-3 uppercase flex justify-between"><span>{status}</span><span className="bg-slate-800 text-blue-400 px-1.5 rounded-full">{statusLeads.length}</span></h3>
                      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                        {statusLeads.map(lead => (
                          <div key={lead.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                            <p className="font-bold text-xs text-white">{lead.full_name || lead.name}</p>
                            <p className="text-[11px] text-gray-400">{lead.phone}</p>
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

        {userProfile?.role !== 'superadmin' && currentTab === 'citas' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Citas Programadas ({equipoCitas.length})</h2>
              <button onClick={() => setIsCitaModalOpen(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Agendar Cita</button>
            </div>
            {equipoCitas.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{c.leads?.full_name || c.leads?.name || 'Cliente'}</h4>
                  <p className="text-xs text-amber-400">📅 {c.appointment_date} a las {c.appointment_time}</p>
                </div>
                <button onClick={() => handleDeleteCita(c.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
              </div>
            ))}
          </div>
        )}

        {userProfile?.role !== 'superadmin' && currentTab === 'socios' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Clientes Activos ({socios.length})</h2>
              <button onClick={() => setIsSocioModalOpen(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Nuevo Cliente</button>
            </div>
            {socios.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{s.leads?.full_name || s.leads?.name}</h4>
                  <p className="text-xs text-green-400">Pago: {s.payment_status}</p>
                </div>
                <button onClick={() => handleDeleteSocio(s.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
              </div>
            ))}
          </div>
        )}

        {userProfile?.role !== 'superadmin' && currentTab === 'membresias' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Planes y Membresías ({membresias.length})</h2>
              <button onClick={() => setIsMembresiaModalOpen(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Nuevo Plan</button>
            </div>
            {membresias.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">{m.nombre}</h4>
                  <p className="text-xs text-gray-400">Precio: ${m.precio}</p>
                </div>
                <button onClick={() => handleDeleteMembresia(m.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
              </div>
            ))}
          </div>
        )}

        {userProfile?.role !== 'superadmin' && currentTab === 'metricas' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Métricas de Conversión</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-6 rounded-2xl text-center border border-slate-800">
                <p className="text-xs text-gray-400 mb-1">Aciertos (Cierres)</p>
                <p className="text-2xl font-black text-green-400">{conversionRate}%</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl text-center border border-slate-800">
                <p className="text-xs text-gray-400 mb-1">Desaciertos / Pendientes</p>
                <p className="text-2xl font-black text-red-400">{failureRate}%</p>
              </div>
            </div>
          </div>
        )}

        {userProfile?.role !== 'superadmin' && currentTab === 'mensajes' && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white">Plantilla WhatsApp</h2>
            <textarea rows={4} value={whatsappTemplate} onChange={e => setWhatsappTemplate(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white" />
            <button onClick={() => alert('Plantilla guardada')} className="py-2 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold">Guardar</button>
          </div>
        )}

        {userProfile?.role !== 'superadmin' && currentTab === 'equipo' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-white">Equipo de Vendedores</h2>
              <button onClick={() => setIsUserModalOpen(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Crear Vendedor</button>
            </div>
            {perfilesEquipo.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center">
                <h4 className="font-bold text-white text-sm">{p.full_name} ({p.role})</h4>
                <button onClick={() => handleDeleteUser(p.id)} className="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODALES COMPLETOS */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setIsLeadModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Prospecto</h3>
            <form onSubmit={handleCreateOrUpdateLead} className="space-y-3">
              <input type="text" required placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="text" required placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {isCitaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setIsCitaModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Agendar Cita</h3>
            <form onSubmit={handleCreateOrUpdateCita} className="space-y-3">
              <select required value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="">Selecciona un Lead</option>
                {dirige.map(l => <option key={l.id} value={l.id}>{l.full_name || l.name}</option>)}
              </select>
              <input type="date" required value={fechaCita} onChange={e => setFechaCita(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="time" required value={horaCita} onChange={e => setHoraCita(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar Cita</button>
            </form>
          </div>
        </div>
      )}

      {isSocioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setIsSocioModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Cliente</h3>
            <form onSubmit={handleCreateOrUpdateSocio} className="space-y-3">
              <select required value={selectedSocioLeadId} onChange={e => setSelectedSocioLeadId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="">Selecciona un Lead</option>
                {dirige.map(l => <option key={l.id} value={l.id}>{l.full_name || l.name}</option>)}
              </select>
              <select required value={selectedMembresiaId} onChange={e => setSelectedMembresiaId(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                <option value="">Selecciona un Plan</option>
                {membresias.map(m => <option key={m.id} value={m.id}>{m.nombre} (${m.precio})</option>)}
              </select>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar Cliente</button>
            </form>
          </div>
        </div>
      )}

      {isMembresiaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setIsMembresiaModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Plan</h3>
            <form onSubmit={handleCreateOrUpdateMembresia} className="space-y-3">
              <input type="text" required placeholder="Nombre del Plan" value={nombreMembresia} onChange={e => setNombreMembresia(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="number" required placeholder="Precio" value={precioMembresia} onChange={e => setPrecioMembresia(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar Plan</button>
            </form>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-70" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 z-10 space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Vendedor</h3>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-3">
              <input type="text" required placeholder="Nombre" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="email" required placeholder="Correo" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <input type="password" required placeholder="Contraseña" value={nuevoPassword} onChange={e => setNuevoPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar Vendedor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
