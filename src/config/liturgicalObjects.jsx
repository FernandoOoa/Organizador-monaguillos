import React from 'react';

// Iconos personalizados para los objetos litúrgicos
export const liturgicalIcons = {
  cruz_alta: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M45,10 L55,10 L55,30 L75,30 L75,40 L55,40 L55,90 L45,90 L45,40 L25,40 L25,30 L45,30 Z"/>
    </svg>
  ),
  mitra: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 L25,45 L25,75 L75,75 L75,45 Z M30,70 L30,48 L45,60 L45,70 Z M70,70 L55,70 L55,60 L70,48 Z M50,18 L70,45 L50,55 L30,45 Z M40,75 L35,95 L45,95 Z M60,75 L55,95 L65,95 Z"/>
    </svg>
  ),
  baculo: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M45,90 L55,90 L55,35 C65,35 70,25 70,18 C70,10 60,5 50,5 C38,5 30,12 30,22 L40,22 C40,16 45,13 50,13 C55,13 60,16 60,18 C60,22 55,25 45,25 L45,90 Z"/>
    </svg>
  ),
  caliz: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,75 C65,75 75,65 75,50 L75,20 C75,14 64,10 50,10 C36,10 25,14 25,20 L25,50 C25,65 35,75 50,75 Z M30,50 L30,22 C30,20 39,15 50,15 C61,15 70,20 70,22 L70,50 C70,60 61,68 50,68 C39,68 30,60 30,50 Z M45,75 L40,85 C35,85 25,87 25,90 L75,90 C75,87 65,85 60,85 L55,75 L45,75 Z"/>
    </svg>
  ),
  copon: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 C40,10 30,12 30,15 L30,55 C30,65 39,72 50,72 C61,72 70,65 70,55 L70,15 C70,12 60,10 50,10 Z M35,18 C35,16 42,13 50,13 C58,13 65,16 65,18 L65,52 C65,58 58,63 50,63 C42,63 35,58 35,52 L35,18 Z M45,72 L40,82 C35,82 20,84 20,87 L80,87 C80,84 65,82 60,82 L55,72 Z"/>
    </svg>
  ),
  vinajeras: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M25,15 L20,30 L20,70 C20,78 27,85 35,85 L40,85 L40,15 Z M25,20 L35,20 L35,78 C33,78 25,75 25,70 Z M60,15 L60,85 L65,85 C73,85 80,78 80,70 L80,30 L75,15 Z M65,20 L75,20 L75,30 L75,70 C75,73 67,78 65,78 Z M45,15 L55,15 L55,85 L45,85 Z"/>
    </svg>
  ),
  aceites: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 C45,10 40,15 40,22 L40,30 L30,40 L30,80 C30,86 35,90 41,90 L59,90 C65,90 70,86 70,80 L70,40 L60,30 L60,22 C60,15 55,10 50,10 Z M45,22 C45,20 47,15 50,15 C53,15 55,20 55,22 L55,30 L45,30 L45,22 Z M35,42 L65,42 L65,80 C65,83 62,85 59,85 L41,85 C38,85 35,80 L35,42 Z M45,55 L55,55 L55,70 L45,70 Z"/>
    </svg>
  ),
  lavabo: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M20,60 C20,80 30,90 50,90 C70,90 80,80 80,60 L20,60 Z M25,65 L75,65 C75,75 68,85 50,85 C32,85 25,75 25,65 Z M30,15 L15,15 L15,25 C15,35 25,40 30,45 Z M70,15 L85,15 L85,25 C85,35 75,40 70,45 Z"/>
    </svg>
  ),
  platillo: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <circle cx="50" cy="50" r="40"/>
      <circle cx="50" cy="50" r="25" fill="#f8fafc" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  libro: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M20,10 L20,90 L80,90 C85,90 90,85 90,80 L90,20 C90,15 85,10 80,10 Z M25,15 L80,15 C82,15 85,17 85,20 L85,78 C80,78 75,75 75,70 L25,70 Z M25,75 L75,75 C75,80 78,85 80,85 C80,87 82,90 80,90 L25,90 Z M45,30 L55,30 L55,40 L65,40 L65,50 L55,50 L55,60 L45,60 L45,50 L35,50 L35,40 L45,40 Z"/>
    </svg>
  ),
  campana: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 C35,10 25,20 25,40 L25,70 C20,70 15,75 15,80 L85,80 C85,75 80,70 75,70 L75,40 C75,20 65,10 50,10 Z M30,40 C30,25 40,15 50,15 C60,15 70,25 70,40 L70,70 L30,70 Z M45,80 L40,85 C35,85 30,87 30,90 L70,90 C70,87 65,85 60,85 L55,80 L45,80 Z"/>
    </svg>
  ),
  evangelio: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M20,40 L20,90 L80,90 L80,40 L50,10 L20,40 Z M25,42 L48,20 L75,42 L75,85 L25,85 Z M45,40 L55,40 L55,50 L65,50 L65,60 L55,60 L55,70 L45,70 L45,60 L35,60 L35,50 L45,50 Z"/>
    </svg>
  ),
  incienso: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 L45,15 L55,15 Z M40,20 L35,25 L65,25 L60,20 Z M50,30 C35,30 25,40 25,60 L25,80 C25,85 35,90 50,90 C65,90 75,85 75,80 L75,60 C75,40 65,30 50,30 Z M30,60 C30,45 40,35 50,35 C60,35 70,45 70,60 L70,78 L30,78 Z M45,30 L35,15 L25,15 L35,30 Z M55,30 L65,15 L75,15 L65,30 Z M35,10 C40,10 42,15 40,20 Z M65,10 C60,10 58,15 60,20 Z"/>
    </svg>
  ),
  cirial: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 L40,10 L40,30 C30,30 25,35 25,45 C25,55 30,60 40,60 L40,90 L60,90 L60,60 C70,60 75,55 75,45 C75,35 70,30 60,30 L60,10 L50,10 Z M45,30 L55,30 L55,55 L45,55 L45,30 Z"/>
    </svg>
  ),
  isopo: (
    <svg viewBox="0 0 100 100" className="w-6 h-6 text-brand-700 flex-shrink-0" fill="currentColor">
      <path d="M50,10 C35,10 25,20 25,40 L25,50 C20,50 15,55 15,60 C15,65 20,70 25,70 L25,90 C25,95 35,100 50,100 C65,100 75,95 75,90 L75,70 C80,70 85,65 85,60 C85,55 80,50 75,50 L75,40 C75,20 65,10 50,10 Z M30,40 C30,25 40,15 50,15 C60,15 70,25 70,40 L70,50 C70,60 60,65 50,65 C40,65 30,60 30,50 Z"/>
    </svg>
  )
};

export const allObjects = [
  { id: 'CruzAlta', name: 'Cruz Alta', order: 10, rules: 'solo_grandes', checked: false, category: 'solemne', icon: liturgicalIcons.cruz_alta },
  { id: 'Mitra', name: 'Mitra (Obispo)', order: 15, rules: 'exclusivo_grande', checked: false, category: 'solemne', icon: liturgicalIcons.mitra },
  { id: 'Baculo', name: 'Báculo (Obispo)', order: 16, rules: 'exclusivo_grande', checked: false, category: 'solemne', icon: liturgicalIcons.baculo },
  { id: 'Caliz', name: 'Cáliz', order: 50, rules: 'neutral', checked: true, category: 'normal', icon: liturgicalIcons.caliz },
  { id: 'Copon', name: 'Copón', order: 51, rules: 'multiple', checked: true, category: 'normal', defaultQty: 1, icon: liturgicalIcons.copon },
  { id: 'Vinajeras', name: 'Vinajeras', order: 52, rules: 'vinajeras', checked: true, category: 'normal', icon: liturgicalIcons.vinajeras },
  { id: 'AceitesBautizo', name: 'Aceites para Bautizos', order: 53, rules: 'neutral', checked: false, category: 'normal', icon: liturgicalIcons.aceites },
  { id: 'LavaboCombo', name: 'Piscina, Manutergio, Jarra', order: 60, rules: 'combo_lavabo', checked: true, category: 'normal', icon: liturgicalIcons.lavabo },
  { id: 'Platillo', name: 'Platillo', order: 70, rules: 'multiple', checked: true, category: 'normal', defaultQty: 2, icon: liturgicalIcons.platillo },
  { id: 'Libro', name: 'Libro', order: 80, rules: 'solo_grandes', checked: true, category: 'normal', icon: liturgicalIcons.libro },
  { id: 'Campanada1', name: 'Campanada 1', order: 90, rules: 'campana', checked: true, category: 'normal', icon: liturgicalIcons.campana },
  { id: 'Campanada2y3', name: 'Campanadas 2 y 3', order: 91, rules: 'campana', checked: true, category: 'normal', icon: liturgicalIcons.campana },
  { id: 'Evangelio', name: 'Acompañantes Evangelio', order: 40, rules: 'evangelio', checked: true, category: 'normal', icon: liturgicalIcons.evangelio },
  { id: 'IncensarioNaveta', name: 'Incensario y Naveta', order: 20, rules: 'solo_grandes_combo', checked: false, category: 'solemne', icon: liturgicalIcons.incienso },
  { id: 'Ciriales', name: 'Ciriales 1 y 2', order: 30, rules: 'solo_grandes_doble', checked: false, category: 'solemne', icon: liturgicalIcons.cirial },
  { id: 'Isopo', name: 'Isopo y Asetre (Agua bendita)', order: 100, rules: 'neutral', checked: false, category: 'solemne', icon: liturgicalIcons.isopo }
];

export const emojiMap = {
  'Cruz Alta': '⛪',
  'Mitra': '👑',
  'Báculo': '🦯',
  'Cáliz': '🍷',
  'Copón': '🏆',
  'Vinajera': '🍶',
  'Vinajeras': '🍶',
  'Aceites': '🛢️',
  'Piscina': '🧼',
  'Manutergio': '💧',
  'Jarra': '🥛',
  'Platillo': '🪙',
  'Libro': '📖',
  'Campanada': '🔔',
  'Evangelio': '📖',
  'Incensario': '💨',
  'Naveta': '🏺',
  'Cirial': '🕯️',
  'Isopo': '💧'
};

export function getTaskEmoji(taskName) {
  for (const key in emojiMap) {
    if (taskName.includes(key)) {
      return emojiMap[key];
    }
  }
  return '📌';
}
