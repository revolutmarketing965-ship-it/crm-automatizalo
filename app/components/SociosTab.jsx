export default function SociosTab({
  socios,
  loadingSocios,
  onOpenNote,
  onEditSocio,
  onDeleteSocio,
  getWhatsAppLink
}) {
  if (loadingSocios) {
    return <p className="text-center text-gray-500 py-10 text-xs">Cargando clientes activos...</p>;
  }

  if (!socios || socios.length === 0) {
    return <p className="text-center text-gray-500 py-10 text-xs">No hay clientes registrados.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-white">Gestión de Clientes / Socios ({socios.length})</h2>
      </div>

      <div className="space-y-2">
        {socios.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-2">
            <div className="flex-1 space-y-1.5 w-full">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black px-2 py-1 rounded-lg border bg-emerald-950/80 border-emerald-700 text-emerald-300 uppercase">
                  ✨ CLIENTE ACTIVO
                </span>
                <button onClick={() => onOpenNote({ type: 'socio', id: s.id, name: s.full_name || s.name, notes: s.notes || '' })} className="px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 rounded text-[10px] font-bold">
                  📝 {s.notes ? 'Ver Nota' : '+ Nota'}
                </button>
              </div>
              <h4 className="font-bold text-white text-sm">{s.full_name || s.name}</h4>
              <p className="text-xs text-gray-400">{s.phone} {s.email ? `• ${s.email}` : ''} • <span className="text-emerald-400">Membresía Activa</span></p>
              {s.notes && <p className="text-[11px] text-amber-300/90 italic bg-slate-950 p-1.5 rounded border border-slate-800">Nota: {s.notes}</p>}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
              {s.phone && (
                <a href={getWhatsAppLink(s.phone, s.full_name || s.name)} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">WhatsApp</a>
              )}
              <button onClick={() => onEditSocio(s)} className="px-2.5 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Editar</button>
              <button onClick={() => onDeleteSocio(s.id)} className="px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-lg text-xs font-bold">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
