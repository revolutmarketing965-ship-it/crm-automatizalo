export default function LeadsTab({
  dirige,
  loadingLeads,
  activeView,
  statuses,
  onUpdateStatus,
  onOpenNote,
  onConvertSocio,
  onAgendar,
  onEditLead,
  onDeleteLead,
  getWhatsAppLink
}) {
  if (loadingLeads) {
    return <p className="text-center text-gray-500 py-10 text-xs">Cargando prospectos...</p>;
  }

  if (dirige.length === 0) {
    return <p className="text-center text-gray-500 py-10 text-xs">No hay leads registrados.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-white">Gestión de Leads ({dirige.length})</h2>
      </div>

      {activeView === 'lista' && (
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
                      onChange={(e) => onUpdateStatus(l.id, e.target.value)} 
                      className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer uppercase ${statusBgColor}`}
                    >
                      {statuses.map((st) => <option key={st} value={st} className="bg-slate-950 text-white">{st}</option>)}
                    </select>
                    <button onClick={() => onOpenNote({ type: 'lead', id: l.id, name: l.full_name || l.name, notes: l.notes || '' })} className="px-2 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 rounded text-[10px] font-bold">
                      📝 {l.notes ? 'Ver Nota' : '+ Nota'}
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-sm">{l.full_name || l.name}</h4>
                  <p className="text-xs text-gray-400">{l.phone} {l.email ? `• ${l.email}` : ''} • <span className="text-blue-400">{l.origin}</span></p>
                  {l.notes && <p className="text-[11px] text-amber-300/90 italic bg-slate-950 p-1.5 rounded border border-slate-800">Nota: {l.notes}</p>}
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  <button onClick={() => onConvertSocio(l.id)} className="px-3 py-1.5 bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 rounded-lg text-xs font-bold">✨ Cliente</button>
                  <button onClick={() => onAgendar(l.id)} className="px-3 py-1.5 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg text-xs font-bold">📅 Agendar</button>
                  <a href={getWhatsAppLink(l.phone, l.full_name || l.name)} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700/50 rounded-lg text-xs font-bold">WhatsApp</a>
                  <button onClick={() => onEditLead(l)} className="px-2.5 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-xs font-bold">Editar</button>
                  <button onClick={() => onDeleteLead(l.id)} className="px-2.5 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs font-bold">Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
