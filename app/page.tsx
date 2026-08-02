'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LeadsTab from './components/LeadsTab';
import CitasTab from './components/CitasTab';
import SociosTab from './components/SociosTab';

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
  
  // Estados para creación de negocios (sin conflictos de logos)
  const [nuevaEmpresaNombre, setNuevaEmpresaNombre] = useState('');
  const [adminEmpresaEmail, setAdminEmpresaEmail] = useState('');
  const [adminEmpresaPass, setAdminEmpresaPass] = useState('');
  const [adminEmpresaNombre, setAdminEmpresaNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');

  // Estados de carga y modales de soporte
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);
  
  const [, setSelectedLeadId] = useState(null);
  const [, setIsCitaModalOpen] = useState(false);
  const [, setEditingLead] = useState(null);
  const [, setNombre] = useState('');
  const [, setTelefono] = useState('');
  const [, setCorreo] = useState('');
  const [, setOrigen] = useState('');
  const [, setLeadStatus] = useState('');
  const [, setNotasLead] = useState('');
  const [, setIsLeadModalOpen] = useState(false);

  const [, setEditingCita] = useState(null);
  const [, setFechaCita] = useState('');
  const [, setObservacionesCita] = useState('');
  const [, setIsEditCitaModalOpen] = useState(false);

  const [, setEditingSocio] = useState(null);
  const [, setNombreSocio] = useState('');
  const [, setTelefonoSocio] = useState('');
  const [, setCorreoSocio] = useState('');
  const [, setNotasSocio] = useState('');
  const [, setIsSocioModalOpen] = useState(false);

  const [, setCurrentNoteTarget] = useState(null);

  const statuses = ['NUEVO/ SIN CONTACTAR', 'EN SEGUIMIENTO', 'CITA AGENDA', 'DESCARTADO'];

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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
      if (data?.role === 'superadmin') {
        setCurrentTab('superadmin');
        fetchAllSuperadminData();
      } else {
        fetchAllAppData(data?.empresa_id);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAllAppData = async (empresaId: string) => {
    if (!empresaId) return;
    setLoadingLeads(true);
    setLoadingCitas(true);
    setLoadingSocios(true);

    try {
      const [leadsRes, citasRes, sociosRes] = await Promise.all([
        supabase.from('leads').select('*').eq('empresa_id', empresaId),
        supabase.from('citas').select('*').eq('empresa_id', empresaId),
        supabase.from('socios').select('*').eq('empresa_id', empresaId)
      ]);

      if (leadsRes.data) setDirige(leadsRes.data);
      if (citasRes.data) setEquipoCitas(citasRes.data);
      if (sociosRes.data) setSocios(sociosRes.data);
    } catch (error) {
      console.error('Error cargando datos de la empresa:', error);
    } finally {
      setLoadingLeads(false);
      setLoadingCitas(false);
      setLoadingSocios(false);
    }
  };

  const fetchAllSuperadminData = async () => {
    try {
      const [empRes, leadsRes] = await Promise.all([
        supabase.from('empresas').select('*'),
        supabase.from('leads').select('*')
      ]);
      if (empRes.data) setEmpresas(empRes.data);
      if (leadsRes.data) setAllLeadsSuperadmin(leadsRes.data);
    } catch (error) {
      console.error('Error cargando datos de superadmin:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
    } catch (error: any) {
      setLoginError(error.message || 'Error al iniciar sesión');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const message = encodeURIComponent(`Hola ${name || ''}, nos ponemos en contacto desde Automatízalo CRM.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const handleUpdateLeadStatusInline = async (id: any, newStatus: string) => {
    setDirige(dirige.map(l => l.id === id ? { ...l, status: newStatus } : l));
    await supabase.from('leads').update({ status: newStatus }).eq('id', id);
  };

  const handleUpdateAsistencia = async (id: any, newAsistio: string) => {
    setEquipoCitas(equipoCitas.map(c => c.id === id ? { ...c, asistio: newAsistio } : c));
    await supabase.from('citas').update({ asistio: newAsistio }).eq('id', id);
  };

  const handleDeleteLead = async (id: any) => {
    if (confirm('¿Estás seguro de eliminar este lead?')) {
      setDirige(dirige.filter(l => l.id !== id));
      await supabase.from('leads').delete().eq('id', id);
    }
  };

  const handleDeleteCita = async (id: any) => {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      setEquipoCitas(equipoCitas.filter(c => c.id !== id));
      await supabase.from('citas').delete().eq('id', id);
    }
  };

  const handleDeleteSocio = async (id: any) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      setSocios(socios.filter(s => s.id !== id));
      await supabase.from('socios').delete().eq('id', id);
    }
  };

  const handleConvertLeadToSocio = async (leadId: any) => {
    alert(`Convertir lead ${leadId} a cliente activo.`);
  };

  // Función limpia para crear negocio sin conflicto de logos gigantes
  const handleCrearNegocio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert([
          {
            nombre: nuevaEmpresaNombre,
            telefono: nuevoTelefono,
            direccion: nuevaDireccion || 'Dirección Principal',
            logo_url: '/logo.png' // URL limpia por defecto
          }
        ])
        .select()
        .single();

      if (empresaError) throw empresaError;

      alert('¡Negocio creado exitosamente!');
      setNuevaEmpresaNombre('');
      setNuevoTelefono('');
      setNuevaDireccion('');
      fetchAllSuperadminData();
    } catch (error: any) {
      alert('Error al crear negocio: ' + error.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-sm font-medium animate-pulse">Cargando Automatízalo CRM...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-xl">
          <h2 className="text-xl font-black text-white text-center">AUTOMATÍZALO CRM</h2>
          {loginError && <p className="text-xs text-red-400 bg-red-950/50 p-3 rounded-lg border border-red-800">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-600"
                required 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Contraseña</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-600"
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/40">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Barra superior con opciones de sesión */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-lg">
              {userProfile?.role === 'superadmin' ? 'PANEL MAESTRO (SUPERADMIN)' : 'CRM ACTIVO'}
            </span>
          </div>
          <button onClick={handleLogout} className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-xl text-xs font-bold hover:bg-red-600/30">
            Salir
          </button>
        </div>

        {/* Panel para Superadmin */}
        {userProfile?.role === 'superadmin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Crear Nuevo Negocio (Local)</h3>
              <form onSubmit={handleCrearNegocio} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Nombre del Negocio" 
                  value={nuevaEmpresaNombre} 
                  onChange={(e) => setNuevaEmpresaNombre(e.target.value)} 
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Teléfono" 
                  value={nuevoTelefono} 
                  onChange={(e) => setNuevoTelefono(e.target.value)} 
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Dirección del Local" 
                  value={nuevaDireccion} 
                  onChange={(e) => setNuevaDireccion(e.target.value)} 
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none sm:col-span-2"
                />
                <button type="submit" className="sm:col-span-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                  Registrar Negocio
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Negocios Registrados ({empresas.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {empresas.map((emp) => (
                  <div key={emp.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{emp.nombre}</h4>
                    <p className="text-xs text-gray-400">📞 {emp.telefono || 'Sin teléfono'} • 📍 {emp.direccion || 'Sin dirección'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel para usuarios normales (Modularizado) */}
        {userProfile?.role !== 'superadmin' && (
          <>
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
              <button 
                onClick={() => setCurrentTab('dirige')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentTab === 'dirige' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400'}`}
              >
                Leads / Prospectos
              </button>
              <button 
                onClick={() => setCurrentTab('citas')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentTab === 'citas' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400'}`}
              >
                Citas Agendadas
              </button>
              <button 
                onClick={() => setCurrentTab('socios')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentTab === 'socios' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400'}`}
              >
                Clientes / Socios
              </button>
            </div>

            {currentTab === 'dirige' && (
              <LeadsTab 
                dirige={dirige}
                loadingLeads={loadingLeads}
                activeView={activeView}
                statuses={statuses}
                onUpdateStatus={handleUpdateLeadStatusInline}
                onOpenNote={setCurrentNoteTarget}
                onConvertSocio={handleConvertLeadToSocio}
                onAgendar={(leadId: any) => { setSelectedLeadId(leadId); setIsCitaModalOpen(true); }}
                onEditLead={(l: any) => { setEditingLead(l); setNombre(l.full_name || l.name || ''); setTelefono(l.phone || ''); setCorreo(l.email || ''); setOrigen(l.origin || 'Facebook Ads'); setLeadStatus(l.status || 'NUEVO/ SIN CONTACTAR'); setNotasLead(l.notes || ''); setIsLeadModalOpen(true); }}
                onDeleteLead={handleDeleteLead}
                getWhatsAppLink={getWhatsAppLink}
              />
            )}

            {currentTab === 'citas' && (
              <CitasTab 
                citas={equipoCitas}
                loadingCitas={loadingCitas}
                onUpdateAsistencia={handleUpdateAsistencia}
                onOpenNote={setCurrentNoteTarget}
                onEditCita={(c: any) => { setEditingCita(c); setFechaCita(c.fecha_cita || c.fecha || ''); setObservacionesCita(c.observaciones || ''); setIsEditCitaModalOpen(true); }}
                onDeleteCita={handleDeleteCita}
                getWhatsAppLink={getWhatsAppLink}
              />
            )}

            {currentTab === 'socios' && (
              <SociosTab 
                socios={socios}
                loadingSocios={loadingSocios}
                onOpenNote={setCurrentNoteTarget}
                onEditSocio={(s: any) => { setEditingSocio(s); setNombreSocio(s.full_name || s.name || ''); setTelefonoSocio(s.phone || ''); setCorreoSocio(s.email || ''); setNotasSocio(s.notes || ''); setIsSocioModalOpen(true); }}
                onDeleteSocio={handleDeleteSocio}
                getWhatsAppLink={getWhatsAppLink}
              />
            )}
          </>
        )}

      </div>
    </main>
  );
}
