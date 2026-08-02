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
  
  // Estados para el registro de nuevos negocios (sin conflicto de logos)
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

  // Función limpia para registrar negocio enviando un logo_url por defecto
  const handleCrearNegocio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Insertar empresa con un logo por defecto seguro (/logo.png)
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert([
          {
            nombre: nuevaEmpresaNombre,
            telefono: nuevoTelefono,
            direccion: nuevaDireccion || 'Dirección Principal',
            logo_url: '/logo.png' // <-- Asignación limpia sin Base64 conflictivo
          }
        ])
        .select()
        .single();

      if (empresaError) throw empresaError;

      alert('¡Negocio creado exitosamente!');
      setNuevaEmpresaNombre('');
      setNuevoTelefono('');
      setNuevaDireccion('');
      // Aquí puedes recargar tu lista de empresas si lo requieres
    } catch (error: any) {
      alert('Error al crear negocio: ' + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navegación rápida de pestañas principales */}
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

        {/* Renderizado de Componentes Modulares */}
        {userProfile?.role !== 'superadmin' && currentTab === 'dirige' && (
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

        {userProfile?.role !== 'superadmin' && currentTab === 'citas' && (
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

        {userProfile?.role !== 'superadmin' && currentTab === 'socios' && (
          <SociosTab 
            socios={socios}
            loadingSocios={loadingSocios}
            onOpenNote={setCurrentNoteTarget}
            onEditSocio={(s: any) => { setEditingSocio(s); setNombreSocio(s.full_name || s.name || ''); setTelefonoSocio(s.phone || ''); setCorreoSocio(s.email || ''); setNotasSocio(s.notes || ''); setIsSocioModalOpen(true); }}
            onDeleteSocio={handleDeleteSocio}
            getWhatsAppLink={getWhatsAppLink}
          />
        )}

      </div>
    </main>
  );
}
