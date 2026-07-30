import React from 'react';
import { Sparkles, BookOpen, Crown, Layers, Droplets } from 'lucide-react';
import { allObjects } from '../../config/liturgicalObjects';
import Button from '../ui/Button';

export default function LiturgyConfig({
  objectsConfig,
  presentKids,
  errorMsg,
  onObjectCheck,
  onObjectQtyChange,
  onMoveKid,
  onRemoveKid,
  onGenerateAssignments,
  onApplyPreset
}) {
  const normalObjects = allObjects.filter(o => o.category === 'normal');
  const solemneObjects = allObjects.filter(o => o.category === 'solemne');

  const presets = [
    {
      name: 'Misa Normal',
      icon: BookOpen,
      ids: ['Caliz', 'Copon', 'Vinajeras', 'LavaboCombo', 'Campanada1', 'Campanada2y3', 'Evangelio', 'Platillo', 'Libro']
    },
    {
      name: 'Misa Solemne',
      icon: Layers,
      ids: ['Caliz', 'Copon', 'Vinajeras', 'LavaboCombo', 'Campanada1', 'Campanada2y3', 'Evangelio', 'Platillo', 'Libro', 'CruzAlta', 'Ciriales', 'IncensarioNaveta']
    },
    {
      name: 'Misa con Obispo',
      icon: Crown,
      ids: ['Caliz', 'Copon', 'Vinajeras', 'LavaboCombo', 'Campanada1', 'Campanada2y3', 'Evangelio', 'Platillo', 'Libro', 'CruzAlta', 'Ciriales', 'IncensarioNaveta', 'Mitra', 'Baculo']
    },
    {
      name: 'Misa Bautizo',
      icon: Droplets,
      ids: ['Caliz', 'Copon', 'Vinajeras', 'LavaboCombo', 'Campanada1', 'Campanada2y3', 'Evangelio', 'Platillo', 'Libro', 'CruzAlta', 'Ciriales', 'IncensarioNaveta', 'AceitesBautizo']
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-700" /> Configuración de la Liturgia y Asignación
        </h3>
      </div>

      {/* Presets Rápidos */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Plantillas Rápidas (Presets)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {presets.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onApplyPreset(preset.ids)}
                className="flex items-center gap-2 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-brand-50 hover:border-brand-300 text-slate-700 hover:text-brand-800 transition-all text-xs font-bold text-left cursor-pointer"
              >
                <Icon className="w-4 h-4 text-brand-700 flex-shrink-0" />
                <span className="truncate">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categoría: Uso Normal */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider border-b border-slate-100 pb-1">
          Uso Normal / Misa Dominical
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {normalObjects.map(obj => {
            const config = objectsConfig[obj.id] || { checked: obj.checked, qty: obj.defaultQty || 1 };
            const isSelected = config.checked;

            return (
              <div
                key={obj.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isSelected ? 'border-l-4 border-l-brand-600 border-slate-200 bg-brand-50/10 shadow-xs' : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onObjectCheck(obj.id)}
                  className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700 cursor-pointer"
                />
                <div className="p-1.5 bg-slate-100 rounded-xl">{obj.icon}</div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-700 text-xs block truncate">{obj.name}</span>
                  {obj.rules === 'multiple' && isSelected && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-400 font-bold">Cant:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={config.qty}
                        onChange={(e) => onObjectQtyChange(obj.id, e.target.value)}
                        className="w-12 text-xs font-bold border border-slate-300 rounded-lg px-1.5 py-0.5 text-center focus:ring-brand-700 focus:border-brand-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categoría: Uso Solemne */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider border-b border-slate-100 pb-1">
          Uso Solemne / Pontifical
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {solemneObjects.map(obj => {
            const config = objectsConfig[obj.id] || { checked: obj.checked, qty: obj.defaultQty || 1 };
            const isSelected = config.checked;

            return (
              <div
                key={obj.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isSelected ? 'border-l-4 border-l-amber-500 border-slate-200 bg-amber-50/20 shadow-xs' : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onObjectCheck(obj.id)}
                  className="w-4 h-4 rounded text-brand-700 border-slate-300 focus:ring-brand-700 cursor-pointer"
                />
                <div className="p-1.5 bg-slate-100 rounded-xl">{obj.icon}</div>
                <span className="font-semibold text-slate-700 text-xs flex-1 truncate">{obj.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista ordenada de Presentes (Orden de Llegada) */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>Asistencia (Orden de Llegada: {presentKids.length})</span>
          <span className="text-[10px] text-slate-400 font-normal">Añade en la barra lateral</span>
        </h4>
        
        {presentKids.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center">Selecciona monaguillos en la lista lateral para agregarlos en orden de llegada...</p>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {presentKids.map((k, index) => (
              <div key={k.id} className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold shadow-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 text-[10px] font-bold w-4 text-center">{index + 1}.</span>
                  <span className="text-slate-700 truncate">{k.name}</span>
                  <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    {k.size === 'grande_incienso' ? 'Grande/Inc.' : k.size}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onMoveKid(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Subir orden de llegada"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveKid(index, 1)}
                    disabled={index === presentKids.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Bajar orden de llegada"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveKid(k)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Quitar de la lista"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Botón de Sorteo */}
      <Button
        variant="accent"
        size="lg"
        onClick={onGenerateAssignments}
        icon={Sparkles}
        className="w-full py-3.5"
      >
        Generar y Guardar Asignación en la Nube
      </Button>
    </div>
  );
}
