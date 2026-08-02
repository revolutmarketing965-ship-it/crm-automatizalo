export default function CitasTab({
  citas,
  loadingCitas,
  onUpdateAsistencia,
  onOpenNote,
  onEditCita,
  onDeleteCita,
  getWhatsAppLink
}) {
  if (loadingCitas) {
    return <p className="text-center text-gray-500 py-10 text-xs">Cargando citas...</p>;
  }

  if (!citas || citas.length === 0) {
    return <p className="text-center text-gray-500 py-10 text-xs">No hay citas agendadas.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-white">Gestión de Citas ({citas.length})</h2>
      </div>

      <div className="space-y-2">
        {citas.map((c) => {
          const asistencia = c.asistio || 'aun no';
          const asistenciaColor = 
            asistencia === 'Si' ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' :
            asistencia === 'No' ? 'bg-red-950/80 border-red-700 text-red-300' : 'bg-amber-950/80 border-amber-700 text-amber-300';

          return (
            <div key={c.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-2">
              <div className="flex-1 space-y-1.5 w-full">
                <div className="flex items-center space-x-2">
                  <select 
                    value={asistencia} 
                    onChange={(e) => onUpdateAsistencia(c.id, e.target.value)} 
                    className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer uppercase ${asistenciaColor}`}
                  >
                    <option value="aun no" className="bg-slate-950 text-white">Aún no</option>
                    <option value="Si" className="bg-slate-950 text-white">Asistió (Sí)</option>
                    <option value="No" className="bg-slate-950 text-white">No Asistió</option>
                  </select>
                  <button onClick={() => onOpenNote({ type: 'cita', id: c.id, name: c.nombre_lead || c.nombre || 'Cita', notes: c.observaciones || '' })} className="px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 rounded text-[10px] font-bold">
                    📝 {c.observaciones ? 'Ver Observación' : '+ Obs'}
                  </button>
                </div>
                <h4 className="font-bold text-white text-sm">{c.nombre_lead || c.nombre || 'Sin nombre'}</h4>
                <p className="text-xs text-gray-400">📅 Fecha de Cita: <span className="text-blue-400 font-semibold">{c.fecha_cita || c.fecha}</span> {c.telefono ? `• ${c.telefono}` : ''}</p>
                {c.observaciones && <p className="text-[11px] text-amber-300/90 italic bg-slate-950 p-1.5 rounded border border-slate-800">Obs: {c.observaciones}</p>}
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                {c.telefono && (
                  <a href={getWhatsAppLink(c.telefono, c.nombre_lead || c.nombre || '')} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">WhatsApp</a>
                )}
                <button onClick={() => onEditCita(c)} className="px-2.5 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Editar</button>
                <button onClick={() => onDeleteCita(c.id)} className="px-2.5 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
