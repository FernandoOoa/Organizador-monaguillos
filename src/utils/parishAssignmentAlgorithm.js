import { allObjects } from '../config/liturgicalObjects';

export function assignParishTasks(inputKids, selectedIds, qtys) {
  if (inputKids.length === 0) {
    return { assignedKids: [], warnings: [], error: 'Por favor, selecciona al menos un monaguillo presente.' };
  }

  // Clonar monaguillos
  const kids = inputKids.map(k => ({
    ...k,
    tasks: [], // Almacenará objetos: { name: string, warningNoSkill: boolean }
    lastAssigned: 0,
    locked: false,
    hasProcesion: false,
    hasOfertorioPesado: false,
    hasCampana: false,
    skills: k.skills || []
  }));

  let assignOrder = 0;
  const warnings = []; // Listado de advertencias de asignación forzada sin habilidad

  // Helper para elegir al monaguillo más justo
  function getFairKid(array) {
    if (array.length === 0) return null;
    array.sort((a, b) => {
      if (a.tasks.length !== b.tasks.length) return a.tasks.length - b.tasks.length;
      return (a.lastAssigned || 0) - (b.lastAssigned || 0);
    });
    const chosen = array[0];
    chosen.lastAssigned = ++assignOrder;
    return chosen;
  }

  // Identificar tareas seleccionadas
  let activeTasks = allObjects.filter(o => selectedIds.includes(o.id)).sort((a, b) => a.order - b.order);

  const hasCiriales = activeTasks.some(t => t.id === 'Ciriales');
  const hasEvangelio = activeTasks.some(t => t.id === 'Evangelio');
  const hasIncensario = activeTasks.some(t => t.id === 'IncensarioNaveta');
  const hasMitra = activeTasks.some(t => t.id === 'Mitra');
  const hasBaculo = activeTasks.some(t => t.id === 'Baculo');

  const evangelioSuffix = (hasCiriales && hasEvangelio) ? ' / Evangelio' : '';
  if (hasCiriales) {
    activeTasks = activeTasks.filter(t => t.id !== 'Evangelio');
  }

  // Función para obtener monaguillos que saben hacer una tarea (tienen el skill)
  function getKidsWithSkill(pool, taskId) {
    return pool.filter(k => k.skills.includes(taskId));
  }

  // Función para asignar una tarea a un monaguillo, verificando si tiene la habilidad
  function assignTaskToKid(kid, taskName, taskId) {
    const hasSkill = kid.skills.includes(taskId);
    kid.tasks.push({
      name: taskName,
      warningNoSkill: !hasSkill
    });
    if (!hasSkill) {
      warnings.push({
        kidName: kid.originalName,
        taskName: taskName
      });
    }
  }

  // --- 1. MITRA (Obispo) ---
  if (hasMitra) {
    let pool = kids.filter(k => (k.size === 'grande' || k.size === 'grande_incienso') && !k.locked);
    if (pool.length === 0) pool = kids.filter(k => !k.locked);

    let candidates = getKidsWithSkill(pool, 'Mitra');
    let chosen = getFairKid(candidates.length > 0 ? candidates : pool);

    if (chosen) {
      assignTaskToKid(chosen, 'Mitra', 'Mitra');
      chosen.locked = true;
      chosen.hasProcesion = true;
    }
    activeTasks = activeTasks.filter(t => t.id !== 'Mitra');
  }

  // --- 2. BÁCULO (Obispo) ---
  if (hasBaculo) {
    let pool = kids.filter(k => (k.size === 'grande' || k.size === 'grande_incienso') && !k.locked);
    if (pool.length === 0) pool = kids.filter(k => !k.locked);

    let candidates = getKidsWithSkill(pool, 'Baculo');
    let chosen = getFairKid(candidates.length > 0 ? candidates : pool);

    if (chosen) {
      assignTaskToKid(chosen, 'Báculo', 'Baculo');
      chosen.locked = true;
      chosen.hasProcesion = true;
    }
    activeTasks = activeTasks.filter(t => t.id !== 'Baculo');
  }

  // --- 3. INCENSARIO Y NAVETA ---
  if (hasIncensario) {
    // Buscar incensario
    let poolInc = kids.filter(k => !k.locked);
    let candidatesInc = getKidsWithSkill(poolInc, 'IncensarioNaveta');
    
    // Priorizar expertos/grandes para incensario
    let poolIncGrandes = poolInc.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
    let candidatesIncGrandes = getKidsWithSkill(poolIncGrandes, 'IncensarioNaveta');

    let incKid = getFairKid(
      candidatesIncGrandes.length > 0 ? candidatesIncGrandes :
      candidatesInc.length > 0 ? candidatesInc :
      poolIncGrandes.length > 0 ? poolIncGrandes : poolInc
    );

    if (incKid) {
      assignTaskToKid(incKid, 'Incensario', 'IncensarioNaveta');
      incKid.locked = true;
      incKid.hasProcesion = true;
    }

    // Buscar naveta
    let poolNav = kids.filter(k => !k.locked && k !== incKid);
    let candidatesNav = getKidsWithSkill(poolNav, 'IncensarioNaveta');
    let navKid = getFairKid(candidatesNav.length > 0 ? candidatesNav : poolNav);

    if (navKid) {
      assignTaskToKid(navKid, 'Naveta', 'IncensarioNaveta');
      navKid.hasProcesion = true;
      navKid.hasOfertorioPesado = true;
    }

    activeTasks = activeTasks.filter(t => t.id !== 'IncensarioNaveta');
  }

  // --- 4. CIRIALES ---
  if (hasCiriales && kids.length >= 6) {
    let pool = kids.filter(k => (k.size === 'grande' || k.size === 'grande_incienso') && !k.locked);
    if (pool.length < 2) pool = kids.filter(k => !k.locked);

    let candidates = getKidsWithSkill(pool, 'Ciriales');
    let poolFinal = candidates.length >= 2 ? candidates : pool;

    const c1 = getFairKid(poolFinal);
    const c2 = getFairKid(poolFinal.filter(k => k !== c1));

    if (c1) {
      assignTaskToKid(c1, 'Cirial 1' + evangelioSuffix, 'Ciriales');
      c1.locked = true;
      c1.hasProcesion = true;
    }
    if (c2) {
      assignTaskToKid(c2, 'Cirial 2' + evangelioSuffix, 'Ciriales');
      c2.locked = true;
      c2.hasProcesion = true;
    }

    activeTasks = activeTasks.filter(t => t.id !== 'Ciriales');
  }

  // --- 5. REPARTO GENERAL ---
  const disponibles = kids.filter(k => !k.locked);
  const grandes = disponibles.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
  const chicos = disponibles.filter(k => k.size === 'chico');
  const todos = [...disponibles];

  activeTasks.forEach(task => {
    
    // Tareas Múltiples (Copón, Platillo)
    if (task.rules === 'multiple') {
      let qty = parseInt(qtys[task.id]) || 1;
      let candidatosConSkill = getKidsWithSkill(todos, task.id);
      let candidatosFallbacks = todos.filter(k => !k.skills.includes(task.id));
      
      for (let i = 0; i < qty; i++) {
        let chosen = null;
        if (candidatosConSkill.length > 0) {
          chosen = getFairKid(candidatosConSkill);
          if (chosen) {
            candidatosConSkill = candidatosConSkill.filter(k => k !== chosen);
            candidatosFallbacks = candidatosFallbacks.filter(k => k !== chosen);
          }
        } else if (candidatosFallbacks.length > 0) {
          chosen = getFairKid(candidatosFallbacks);
          if (chosen) {
            candidatosFallbacks = candidatosFallbacks.filter(k => k !== chosen);
          }
        }

        if (chosen) {
          assignTaskToKid(chosen, qty > 1 ? `${task.name} ${i + 1}` : task.name, task.id);
        }
      }
    }
    
    // Tareas Solo Grandes (Cruz Alta, Libro)
    else if (task.rules === 'solo_grandes') {
      let pool = todos;
      if (task.id === 'CruzAlta') {
        pool = todos.filter(k => !k.hasProcesion);
        if (pool.length === 0) pool = todos;
      }
      
      let poolGrandes = pool.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
      let candidates = getKidsWithSkill(poolGrandes.length > 0 ? poolGrandes : pool, task.id);
      
      let chosen = getFairKid(
        candidates.length > 0 ? candidates : 
        poolGrandes.length > 0 ? poolGrandes : pool
      );

      if (chosen) {
        assignTaskToKid(chosen, task.name, task.id);
        if (task.id === 'CruzAlta') chosen.hasProcesion = true;
      }
    }
    
    // Ciriales Dobles Generales (Si no hay 6 niños)
    else if (task.rules === 'solo_grandes_doble') {
      let pool = todos.filter(k => !k.hasProcesion);
      if (pool.length === 0) pool = todos;

      let candidates = getKidsWithSkill(pool, 'Ciriales');
      let poolFinal = candidates.length >= 2 ? candidates : pool;

      const c1 = getFairKid(poolFinal);
      const c2 = getFairKid(poolFinal.filter(k => k !== c1));

      if (c1) {
        assignTaskToKid(c1, 'Cirial 1' + evangelioSuffix, 'Ciriales');
        c1.hasProcesion = true;
      }
      if (c2) {
        assignTaskToKid(c2, 'Cirial 2' + evangelioSuffix, 'Ciriales');
        c2.hasProcesion = true;
      }
    }
    
    // Evangelio Acompañantes
    else if (task.rules === 'evangelio') {
      let candidates = getKidsWithSkill(todos, 'Evangelio');
      let pool = candidates.length >= 2 ? candidates : todos;

      // Ordenar por menor cantidad de tareas para balancear
      const sorted = [...pool].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));

      if (sorted.length >= 2) {
        assignTaskToKid(sorted[0], 'Evangelio 1', 'Evangelio');
        sorted[0].lastAssigned = ++assignOrder;
        assignTaskToKid(sorted[1], 'Evangelio 2', 'Evangelio');
        sorted[1].lastAssigned = ++assignOrder;
      } else if (sorted.length === 1) {
        assignTaskToKid(sorted[0], 'Evangelio', 'Evangelio');
        sorted[0].lastAssigned = ++assignOrder;
      }
    }
    
    // Campanas
    else if (task.rules === 'campana') {
      let pool = todos.filter(k => !k.hasCampana);
      if (pool.length === 0) pool = todos;

      let candidates = getKidsWithSkill(pool, task.id);
      let chosen = getFairKid(candidates.length > 0 ? candidates : pool);

      if (chosen) {
        assignTaskToKid(chosen, task.name, task.id);
        chosen.hasCampana = true;
      }
    }
    
    // Vinajeras
    else if (task.rules === 'vinajeras') {
      let pool = todos.filter(k => !k.hasOfertorioPesado);
      if (pool.length === 0) pool = todos;

      let candidates = getKidsWithSkill(pool, 'Vinajeras');
      let poolFinal = candidates.length > 0 ? candidates : pool;
      
      const sorted = [...poolFinal].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));

      if (sorted.length >= 2) {
        assignTaskToKid(sorted[0], 'Vinajera (Agua)', 'Vinajeras');
        sorted[0].lastAssigned = ++assignOrder;
        assignTaskToKid(sorted[1], 'Vinajera (Vino)', 'Vinajeras');
        sorted[1].lastAssigned = ++assignOrder;
      } else if (sorted.length === 1) {
        assignTaskToKid(sorted[0], 'Vinajeras (Agua y Vino)', 'Vinajeras');
        sorted[0].lastAssigned = ++assignOrder;
      }
    }
    
    // Combo Lavabo (Piscina, Manutergio, Jarra)
    else if (task.rules === 'combo_lavabo') {
      let candidates = getKidsWithSkill(todos, 'LavaboCombo');
      let pool = candidates.length > 0 ? candidates : todos;

      const sorted = [...pool].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));

      if (sorted.length === 1) {
        assignTaskToKid(sorted[0], 'Piscina, Manutergio y Jarra', 'LavaboCombo');
        sorted[0].lastAssigned = ++assignOrder;
      } else if (sorted.length === 2) {
        assignTaskToKid(sorted[0], 'Piscina y Manutergio', 'LavaboCombo');
        sorted[0].lastAssigned = ++assignOrder;
        assignTaskToKid(sorted[1], 'Jarra', 'LavaboCombo');
        sorted[1].lastAssigned = ++assignOrder;
      } else if (sorted.length >= 3) {
        assignTaskToKid(sorted[0], 'Piscina', 'LavaboCombo');
        sorted[0].lastAssigned = ++assignOrder;
        assignTaskToKid(sorted[1], 'Manutergio', 'LavaboCombo');
        sorted[1].lastAssigned = ++assignOrder;
        assignTaskToKid(sorted[2], 'Jarra', 'LavaboCombo');
        sorted[2].lastAssigned = ++assignOrder;
      }
    }
    
    // Otros objetos (Cáliz, Aceites, Isopo)
    else {
      let pool = todos;
      if (task.id === 'Caliz' || task.id === 'AceitesBautizo') {
        pool = todos.filter(k => !k.hasOfertorioPesado);
        if (pool.length === 0) pool = todos;
      }

      let candidates = getKidsWithSkill(pool, task.id);
      let chosen = getFairKid(candidates.length > 0 ? candidates : pool);

      if (chosen) {
        assignTaskToKid(chosen, task.name, task.id);
      }
    }
  });

  return { assignedKids: kids, warnings, error: null };
}
