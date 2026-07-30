import React from 'react';
import { CheckCircle2, Copy, MessageSquare, Printer, AlertTriangle } from 'lucide-react';
import { getTaskEmoji } from '../../config/liturgicalObjects';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToast } from '../ui/ToastContext';

export default function AssignmentsView({
  parish,
  currentUserId
}) {
  const { addToast } = useToast();

  const handleShare = (action) => {
    if (!parish?.latestAssignments) return;

    if (action === 'print') {
      window.print();
      return;
    }

    let text = `⛪ *Organización de Monaguillos: ${parish.name}* ⛪\n_Asignación de tareas para la Santa Misa_\n\n`;

    parish.latestAssignments.forEach((k, i) => {
      let sizeLabel = k.size === 'grande_incienso' ? 'Grande/Incienso' : (k.size === 'grande' ? 'Grande' : 'Chico');
      text += `👤 *${i + 1}. ${k.name}* (${sizeLabel}):\n`;
      if (k.tasks && k.tasks.length > 0) {
        k.tasks.forEach(t => {
          const isObj = typeof t === 'object';
          const tName = isObj ? t.name : t;
          const warningSymbol = (isObj && t.warningNoSkill) ? ' (⚠️ No capacitado)' : '';
          const emoji = getTaskEmoji(tName);
          text += `  ${emoji} ${tName}${warningSymbol}\n`;
        });
      } else {
        text += `  💤 Sin tareas asignadas\n`;
      }
      text += `\n`;
    });

    if (parish.latestAssignmentsAuthor) {
      text += `_Generado por ${parish.latestAssignmentsAuthor} el ${new Date(parish.latestAssignmentsDate).toLocaleString()}_\n`;
    }

    if (action === 'copy') {
      navigator.clipboard.writeText(text);
      addToast('Asignación copiada al portapapeles', 'success');
    } else if (action === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3 print:border-b-2 print:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 print:text-xl print:font-extrabold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 print:hidden" /> Roles Litúrgicos Vigentes
          </h3>
          {parish?.latestAssignmentsDate && (
            <p className="text-[10px] text-slate-400 font-medium print:text-slate-600 print:text-xs">
              Generado {parish.latestAssignmentsAuthor ? `por ${parish.latestAssignmentsAuthor}` : ''} el {new Date(parish.latestAssignmentsDate).toLocaleString()}
            </p>
          )}
        </div>

        {parish?.latestAssignments && (
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleShare('copy')}
              icon={Copy}
            >
              Copiar
            </Button>
            <Button
              variant="whatsapp"
              size="sm"
              onClick={() => handleShare('whatsapp')}
              icon={MessageSquare}
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('print')}
              icon={Printer}
            >
              Imprimir Sacristía
            </Button>
          </div>
        )}
      </div>

      {!parish?.latestAssignments || parish.latestAssignments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 italic text-sm">Aún no se han generado asignaciones para la parroquia.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
          {parish.latestAssignments.map((k, index) => {
            const isCurrentUserCard = k.monaguilloId === currentUserId;

            return (
              <div
                key={index}
                className={`border rounded-2xl overflow-hidden shadow-xs relative transition-all print:border-slate-300 print:shadow-none ${
                  isCurrentUserCard ? 'ring-2 ring-brand-700 bg-brand-50/5' : 'border-slate-100 bg-white'
                }`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 print:hidden ${
                  isCurrentUserCard ? 'bg-brand-700' : 'bg-slate-200'
                }`}></div>
                <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 print:bg-slate-100">
                  <span className="font-bold text-slate-800 text-xs truncate">
                    {index + 1}. {k.name} {isCurrentUserCard && '⭐'}
                  </span>
                  <Badge variant={k.size === 'grande_incienso' ? 'incienso' : k.size === 'grande' ? 'grande' : 'chico'}>
                    {k.size === 'grande_incienso' ? 'Grande/Inc.' : k.size === 'grande' ? 'Grande' : 'Chico'}
                  </Badge>
                </div>
                <div className="p-3">
                  {k.tasks.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic">Sin tareas asignadas</div>
                  ) : (
                    <ul className="space-y-1">
                      {k.tasks.map((task, tIdx) => {
                        const isObj = typeof task === 'object';
                        const taskName = isObj ? task.name : task;
                        const isWarning = isObj ? task.warningNoSkill : false;

                        return (
                          <li
                            key={tIdx}
                            className={`text-xs font-semibold flex items-center justify-between p-1 rounded-lg ${
                              isWarning ? 'bg-amber-50 text-amber-900 border border-amber-200 px-2 print:bg-transparent print:border-none' : 'text-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{getTaskEmoji(taskName)}</span>
                              <span>{taskName}</span>
                            </span>
                            {isWarning && (
                              <span className="text-[8px] font-extrabold text-amber-700 bg-amber-100 px-1 rounded print:hidden" title="Habilidad no registrada en su perfil">
                                ⚠️ Ver
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Listado de Advertencias de Asignación Forzada */}
      {parish?.latestAssignmentsWarnings && parish.latestAssignmentsWarnings.length > 0 && (
        <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 print:hidden">
          <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> Monaguillos asignados sin habilidad registrada (Supervisar)
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950 font-semibold">
            {parish.latestAssignmentsWarnings.map((w, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-amber-100 shadow-xs">
                <span className="text-[9px] font-extrabold bg-amber-200 text-amber-800 px-2 py-1 rounded-md flex-shrink-0">
                  ⚠️ {w.taskName}
                </span>
                <span>Asignado a: <strong className="font-bold text-slate-800">{w.kidName}</strong></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
