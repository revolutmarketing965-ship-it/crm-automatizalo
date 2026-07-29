'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabase';
import { useRouter } from 'next/navigation';

export default function CRMHome() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads'); // leads, citas, ventas, equipo
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        router.push('/login');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Cargando CRM...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar de navegación */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 mb-8">CRM Automatízalo</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'leads' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Leads y Clientes
            </button>
            <button
              onClick={() => setActiveTab('citas')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'citas' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Citas
            </button>
            <button
              onClick={() => setActiveTab('ventas')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'ventas' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Ventas
            </button>
            <button
              onClick={() => setActiveTab('equipo')}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'equipo' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Equipo / Roles
            </button>
          </nav>
        </div>
        <div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 text-center"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 capitalize">{activeTab}</h2>
          <span className="text-sm text-gray-500">Conectado: {session.user.email}</span>
        </header>

        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'leads' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Gestión de Leads y Prospectos</h3>
              <p className="text-gray-600">Aquí puedes visualizar y registrar los datos de tus clientes y prospectos conectados a Supabase.</p>
            </div>
          )}
          {activeTab === 'citas' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Agenda de Citas</h3>
              <p className="text-gray-600">Control de reuniones y llamadas programadas.</p>
            </div>
          )}
          {activeTab === 'ventas' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Registro de Ventas</h3>
              <p className="text-gray-600">Seguimiento de conversiones y transacciones comerciales.</p>
            </div>
          )}
          {activeTab === 'equipo' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Gestión de Equipo y Accesos</h3>
              <p className="text-gray-600">Administración de usuarios internos y permisos del sistema.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
