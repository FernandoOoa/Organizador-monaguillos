import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { allObjects, getDefaultSkillsForSize, getAllowedObjectsForSize } from '../../config/liturgicalObjects';
import { useToast } from '../ui/ToastContext';

export default function VirtualMemberModal({
  isOpen,
  onClose,
  onAddVirtual
}) {
  const [virtualName, setVirtualName] = useState('');
  const [virtualSize, setVirtualSize] = useState('chico');
  const [virtualSkills, setVirtualSkills] = useState(getDefaultSkillsForSize('chico'));
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSizeChange = (newSize) => {
    setVirtualSize(newSize);
    setVirtualSkills(getDefaultSkillsForSize(newSize));
  };

  const handleToggleSkill = (skillId) => {
    if (virtualSkills.includes(skillId)) {
      setVirtualSkills(prev => prev.filter(s => s !== skillId));
    } else {
      setVirtualSkills(prev => [...prev, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!virtualName.trim()) return;

    setLoading(true);
    try {
      await onAddVirtual(virtualName.trim(), virtualSize, virtualSkills);
      addToast(`Monaguillo virtual "${virtualName.trim()}" agregado`, 'success');
      setVirtualName('');
      setVirtualSize('chico');
      setVirtualSkills(getDefaultSkillsForSize('chico'));
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const allowedObjects = getAllowedObjectsForSize(virtualSize);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Monaguillo Virtual"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nombre / Apodo
          </label>
          <input
            type="text"
            required
            value={virtualName}
            onChange={(e) => setVirtualName(e.target.value)}
            placeholder="Ej. Juanito Pérez"
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-brand-700 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tamaño de Túnica
          </label>
          <select
            value={virtualSize}
            onChange={(e) => handleSizeChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-brand-700 focus:border-transparent outline-none bg-white"
          >
            <option value="chico">Chico</option>
            <option value="grande">Grande</option>
            <option value="grande_incienso">Grande / Incienso (Experto)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Habilidades que posee ({allowedObjects.length} disponibles)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {allowedObjects.map(obj => {
              const isChecked = virtualSkills.includes(obj.id);
              return (
                <label
                  key={obj.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked ? 'border-brand-700 bg-brand-50/20 font-bold text-brand-800' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSkill(obj.id)}
                    className="w-3.5 h-3.5 rounded text-brand-700 focus:ring-brand-700"
                  />
                  <span className="truncate">{obj.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="accent"
            loading={loading}
          >
            Guardar Virtual
          </Button>
        </div>
      </form>
    </Modal>
  );
}
