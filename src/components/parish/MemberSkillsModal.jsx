import React from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { allObjects, getTaskEmoji } from '../../config/liturgicalObjects';
import { Award, Shield, User, CheckCircle2 } from 'lucide-react';

export default function MemberSkillsModal({
  isOpen,
  onClose,
  monaguillo
}) {
  if (!monaguillo) return null;

  const name = monaguillo.liturgicalName || monaguillo.name || monaguillo.displayName || 'Monaguillo';
  const size = monaguillo.size || 'chico';
  const skills = monaguillo.skills || [];

  // Obtener los objetos completos correspondientes a los IDs en skills
  const registeredSkills = allObjects.filter(obj => skills.includes(obj.id));
  const normalSkills = registeredSkills.filter(obj => obj.category === 'normal');
  const solemneSkills = registeredSkills.filter(obj => obj.category === 'solemne');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Litúrgica del Monaguillo"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Encabezado del Perfil */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          {monaguillo.photoURL ? (
            <img src={monaguillo.photoURL} alt={name} className="w-12 h-12 rounded-full border-2 border-brand-500 shadow-xs" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg border-2 border-brand-300">
              👤
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-800 text-base truncate">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={size === 'grande_incienso' ? 'incienso' : size === 'grande' ? 'grande' : 'chico'}>
                {size === 'grande_incienso' ? 'Grande / Incienso' : size === 'grande' ? 'Niño Grande' : 'Niño Chico'}
              </Badge>
              {monaguillo.isVirtual && (
                <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Virtual
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Habilidades que posee */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <Award className="w-4 h-4 text-brand-700" />
            Habilidades Registradas ({registeredSkills.length})
          </h5>

          {registeredSkills.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-xs text-slate-400 italic">Este monaguillo no ha registrado habilidades aún en su perfil.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {/* Uso Normal */}
              {normalSkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Servicios Normales ({normalSkills.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {normalSkills.map(obj => (
                      <div key={obj.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                        <span>{getTaskEmoji(obj.name)}</span>
                        <span className="truncate">{obj.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uso Solemne */}
              {solemneSkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Servicios Solemnes ({solemneSkills.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {solemneSkills.map(obj => (
                      <div key={obj.id} className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/50 border border-amber-100 text-xs font-semibold text-amber-950">
                        <span>{getTaskEmoji(obj.name)}</span>
                        <span className="truncate">{obj.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
