import { allObjects } from '../config/liturgicalObjects';

export function assignLiturgicalTasks(inputKids, selectedIds, qtys) {
  if (inputKids.length === 0) {
    return { assignedKids: [], warningChicos: false, error: 'Por favor, registra al menos un monaguillo antes de asignar.' };
  }

  // Clonar los niños para no mutar el estado original de React
  const kids = inputKids.map(k => ({
    ...k,
    tasks: [],
    lastAssigned: 0,
    locked: false,
    hasProcesion: false,
    hasOfertorioPesado: false,
    hasCampana: false,
    preassignedTasks: k.preassignedTasks || []
  }));

  let assignOrder = 0;
  let warningChicos = false;

  // Helper to pick the most suitable kid
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

  // Inicializar monaguillos con sus pre-asignaciones fijas
  kids.forEach(k => {
    k.preassignedTasks.forEach(tId => {
      if (tId === 'CruzAlta') { k.tasks.push('Cruz Alta'); k.hasProcesion = true; }
      else if (tId === 'Mitra') { k.tasks.push('Mitra'); k.locked = true; k.hasProcesion = true; }
      else if (tId === 'Baculo') { k.tasks.push('Báculo'); k.locked = true; k.hasProcesion = true; }
      else if (tId === 'Caliz') { k.tasks.push('Cáliz'); }
      else if (tId === 'Copon') { k.tasks.push('Copón'); }
      else if (tId === 'Vinajeras') { k.tasks.push('Vinajeras (Agua y Vino)'); }
      else if (tId === 'AceitesBautizo') { k.tasks.push('Aceites para Bautizos'); }
      else if (tId === 'LavaboCombo') { k.tasks.push('Piscina, Manutergio y Jarra'); }
      else if (tId === 'Platillo') { k.tasks.push('Platillo'); }
      else if (tId === 'Libro') { k.tasks.push('Libro'); }
      else if (tId === 'Campanada1') { k.tasks.push('Campanada 1'); k.hasCampana = true; }
      else if (tId === 'Campanada2y3') { k.tasks.push('Campanadas 2 y 3'); k.hasCampana = true; }
      else if (tId === 'Evangelio') { k.tasks.push('Evangelio'); }
      else if (tId === 'IncensarioNaveta') { k.tasks.push('Incensario'); k.locked = true; k.hasProcesion = true; }
      else if (tId === 'Ciriales') { k.tasks.push('Cirial 1'); k.locked = true; k.hasProcesion = true; }
      else if (tId === 'Isopo') { k.tasks.push('Isopo y Asetre (Agua bendita)'); }
    });
  });

  // VALIDACIÓN ESPECIAL: Mínimo 3 monaguillos para Mitra y Báculo
  const hasMitra = selectedIds.includes('Mitra');
  const hasBaculo = selectedIds.includes('Baculo');
  if ((hasMitra || hasBaculo) && kids.length < 3) {
    return { assignedKids: [], warningChicos: false, error: 'La Mitra y el Báculo solo se pueden usar si hay mínimo 3 monaguillos registrados.' };
  }

  const preassignedMitra = kids.some(k => k.preassignedTasks.includes('Mitra'));
  const preassignedBaculo = kids.some(k => k.preassignedTasks.includes('Baculo'));

  if ((hasMitra && !preassignedMitra) || (hasBaculo && !preassignedBaculo)) {
    const totalGrandes = kids.filter(k => k.size === 'grande' || k.size === 'grande_incienso').length;
    const totalNecesarios = (hasMitra && !preassignedMitra ? 1 : 0) + (hasBaculo && !preassignedBaculo ? 1 : 0);
    if (totalGrandes < totalNecesarios) {
      return { assignedKids: [], warningChicos: false, error: 'No hay suficientes monaguillos Grandes registrados para cargar la Mitra y/o el Báculo.' };
    }
  }

  let activeTasks = allObjects.filter(o => selectedIds.includes(o.id)).sort((a, b) => a.order - b.order);

  const hasCiriales = activeTasks.some(t => t.id === 'Ciriales');
  const hasEvangelio = activeTasks.some(t => t.id === 'Evangelio');
  const hasIncensario = activeTasks.some(t => t.id === 'IncensarioNaveta');

  const evangelioSuffix = (hasCiriales && hasEvangelio) ? ' / Evangelio' : '';
  if (hasCiriales) {
    activeTasks = activeTasks.filter(t => t.id !== 'Evangelio');
  }

  // --- PRE-PROCESAMIENTO EXCLUSIVO: MITRA ---
  if (hasMitra) {
    if (!preassignedMitra) {
      let grandesDisp = kids.filter(k => (k.size === 'grande' || k.size === 'grande_incienso') && !k.locked);
      let kid = getFairKid(grandesDisp);
      if (kid) {
        kid.tasks.push('Mitra');
        kid.locked = true;
        kid.hasProcesion = true;
      }
    }
    activeTasks = activeTasks.filter(t => t.id !== 'Mitra');
  }

  // --- PRE-PROCESAMIENTO EXCLUSIVO: BÁCULO ---
  if (hasBaculo) {
    if (!preassignedBaculo) {
      let grandesDisp = kids.filter(k => (k.size === 'grande' || k.size === 'grande_incienso') && !k.locked);
      let kid = getFairKid(grandesDisp);
      if (kid) {
        kid.tasks.push('Báculo');
        kid.locked = true;
        kid.hasProcesion = true;
      }
    }
    activeTasks = activeTasks.filter(t => t.id !== 'Baculo');
  }

  // --- PRE-PROCESAMIENTO EXCLUSIVO: INCENSARIO Y NAVETA ---
  if (hasIncensario) {
    let incKid = kids.find(k => k.preassignedTasks.includes('IncensarioNaveta'));
    let navKid = null;

    if (!incKid) {
      let disponiblesParaIncensario = kids.filter(k => !k.locked);
      let expertos = disponiblesParaIncensario.filter(k => k.size === 'grande_incienso');
      let grandes = disponiblesParaIncensario.filter(k => k.size === 'grande');
      incKid = getFairKid(expertos.length > 0 ? expertos : (grandes.length > 0 ? grandes : disponiblesParaIncensario));

      if (incKid) {
        incKid.tasks.push('Incensario');
        incKid.locked = true;
        incKid.hasProcesion = true;
        if (incKid.size === 'chico') warningChicos = true;
      }
    }

    if (incKid) {
      let disponiblesParaNaveta = kids.filter(k => !k.locked && k !== incKid);
      navKid = getFairKid(disponiblesParaNaveta);
      if (navKid) {
        navKid.tasks.push('Naveta');
        navKid.hasProcesion = true;
        navKid.hasOfertorioPesado = true;
      }
    }
    activeTasks = activeTasks.filter(t => t.id !== 'IncensarioNaveta');
  }

  // --- PRE-PROCESAMIENTO: CIRIALES EXCLUSIVOS ---
  if (hasCiriales && kids.length >= 6) {
    const numPreassignedCiriales = kids.filter(k => k.preassignedTasks.includes('Ciriales')).length;
    if (numPreassignedCiriales < 2) {
      let largeKids = kids.filter(k => (k.size === 'grande' || k.size === 'grande_incienso') && !k.locked);
      if (largeKids.length < (2 - numPreassignedCiriales)) largeKids = kids.filter(k => !k.locked);
      
      if (numPreassignedCiriales === 1) {
        const c2 = largeKids[largeKids.length - 1];
        if (c2) {
          c2.tasks.push('Cirial 2' + evangelioSuffix); c2.locked = true; c2.hasProcesion = true;
          if (c2.size === 'chico') warningChicos = true;
        }
      } else {
        const c1 = largeKids[largeKids.length - 1];
        const c2 = largeKids[largeKids.length - 2];
        if (c1) {
          c1.tasks.push('Cirial 1' + evangelioSuffix); c1.locked = true; c1.hasProcesion = true;
          if (c1.size === 'chico') warningChicos = true;
        }
        if (c2) {
          c2.tasks.push('Cirial 2' + evangelioSuffix); c2.locked = true; c2.hasProcesion = true;
          if (c2.size === 'chico') warningChicos = true;
        }
      }
    }
    activeTasks = activeTasks.filter(t => t.id !== 'Ciriales');
  }

  // --- REPARTO GENERAL DE TAREAS ---
  const disponibles = kids.filter(k => !k.locked);
  const grandes = disponibles.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
  const chicos = disponibles.filter(k => k.size === 'chico');
  const todos = [...disponibles];

  activeTasks.forEach(task => {
    if (task.rules === 'multiple') {
      const maxQty = todos.length;
      let qty = parseInt(qtys[task.id]) || 1;
      
      const preassignedQty = kids.filter(k => k.preassignedTasks.includes(task.id)).length;
      let remainingQty = qty - preassignedQty;
      if (remainingQty < 0) remainingQty = 0;
      if (remainingQty > maxQty) remainingQty = maxQty;
      
      let candidatos = todos.filter(k => !k.preassignedTasks.includes(task.id));
      for (let i = 0; i < remainingQty; i++) {
        const grandesSin = candidatos.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
        const kid = grandesSin.length > 0 ? getFairKid(grandesSin) : getFairKid(candidatos);
        if (kid) {
          kid.tasks.push(qty > 1 ? `${task.name} ${preassignedQty + i + 1}` : task.name);
          candidatos = candidatos.filter(k => k !== kid);
        }
      }
    }
    else if (task.rules === 'solo_grandes') {
      const preassignedSelf = kids.some(k => k.preassignedTasks.includes(task.id));
      if (!preassignedSelf) {
        let pool = todos;
        if (task.id === 'CruzAlta') {
          pool = todos.filter(k => !k.hasProcesion);
        }
        let poolGrandes = pool.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
        let kid = getFairKid(poolGrandes.length > 0 ? poolGrandes : pool);

        if (!kid && task.id === 'CruzAlta') {
          kid = getFairKid(grandes.length > 0 ? grandes : todos);
        }
        if (kid) {
          kid.tasks.push(task.name);
          if (task.id === 'CruzAlta') kid.hasProcesion = true;
          if (kid.size === 'chico') warningChicos = true;
        }
      }
    }
    else if (task.rules === 'solo_grandes_doble') {
      const numPreassignedCiriales = kids.filter(k => k.preassignedTasks.includes('Ciriales')).length;
      if (numPreassignedCiriales < 2) {
        let pool = todos.filter(k => !k.hasProcesion);
        let grandesDisp = pool.filter(k => k.size === 'grande' || k.size === 'grande_incienso');

        if (numPreassignedCiriales === 0) {
          const c1 = getFairKid(grandesDisp.length > 0 ? grandesDisp : pool) || getFairKid(todos);
          if (c1) {
            c1.tasks.push('Cirial 1' + evangelioSuffix);
            c1.hasProcesion = true;
            if (c1.size === 'chico') warningChicos = true;
          }

          let poolC2 = pool.filter(k => k !== c1);
          let grandesC2 = poolC2.filter(k => k.size === 'grande' || k.size === 'grande_incienso');
          let c2 = getFairKid(grandesC2.length > 0 ? grandesC2 : poolC2) || getFairKid(todos.filter(k => k !== c1));

          if (c2) {
            c2.tasks.push('Cirial 2' + evangelioSuffix);
            c2.hasProcesion = true;
            if (c2.size === 'chico') warningChicos = true;
          }
        } else if (numPreassignedCiriales === 1) {
          let c2 = getFairKid(grandesDisp.length > 0 ? grandesDisp : pool) || getFairKid(todos);
          if (c2) {
            c2.tasks.push('Cirial 2' + evangelioSuffix);
            c2.hasProcesion = true;
            if (c2.size === 'chico') warningChicos = true;
          }
        }
      }
    }
    else if (task.rules === 'evangelio') {
      const numPreassignedEv = kids.filter(k => k.preassignedTasks.includes('Evangelio')).length;
      if (numPreassignedEv < 2) {
        const gSorted = [...grandes].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));
        const cSorted = [...chicos].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));
        const tSorted = [...todos].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));

        if (numPreassignedEv === 1) {
          let kid = gSorted.length > 0 ? gSorted[0] : (cSorted.length > 0 ? cSorted[0] : tSorted[0]);
          if (kid) {
            kid.tasks.push('Evangelio 2');
            kid.lastAssigned = ++assignOrder;
          }
        } else {
          if (gSorted.length >= 2) {
            gSorted[0].tasks.push('Evangelio 1'); gSorted[0].lastAssigned = ++assignOrder;
            gSorted[1].tasks.push('Evangelio 2'); gSorted[1].lastAssigned = ++assignOrder;
          } else if (cSorted.length >= 2) {
            cSorted[0].tasks.push('Evangelio 1'); cSorted[0].lastAssigned = ++assignOrder;
            cSorted[1].tasks.push('Evangelio 2'); cSorted[1].lastAssigned = ++assignOrder;
          } else if (tSorted.length >= 2) {
            tSorted[0].tasks.push('Evangelio 1'); tSorted[0].lastAssigned = ++assignOrder;
            tSorted[1].tasks.push('Evangelio 2'); tSorted[1].lastAssigned = ++assignOrder;
          } else if (tSorted.length === 1) {
            tSorted[0].tasks.push('Evangelio'); tSorted[0].lastAssigned = ++assignOrder;
          }
        }
      }
    }
    else if (task.rules === 'campana') {
      const preassignedSelf = kids.some(k => k.preassignedTasks.includes(task.id));
      if (!preassignedSelf) {
        let pool = todos.filter(k => !k.hasCampana);
        let kid = getFairKid(pool.length > 0 ? pool : todos);
        if (kid) {
          kid.tasks.push(task.name);
          kid.hasCampana = true;
        }
      }
    }
    else if (task.rules === 'vinajeras') {
      const preassignedVin = kids.some(k => k.preassignedTasks.includes('Vinajeras'));
      if (!preassignedVin) {
        let pool = todos.filter(k => !k.hasOfertorioPesado);
        if (pool.length === 0) pool = todos;

        let tSorted = [...pool].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));

        if (tSorted.length >= 2) {
          tSorted[0].tasks.push('Vinajera (Agua)'); tSorted[0].lastAssigned = ++assignOrder;
          tSorted[1].tasks.push('Vinajera (Vino)'); tSorted[1].lastAssigned = ++assignOrder;
        } else if (tSorted.length === 1) {
          tSorted[0].tasks.push('Vinajeras (Agua y Vino)'); tSorted[0].lastAssigned = ++assignOrder;
        }
      }
    }
    else if (task.rules === 'combo_lavabo') {
      const preassignedLav = kids.some(k => k.preassignedTasks.includes('LavaboCombo'));
      if (!preassignedLav) {
        let pool = todos;
        let tSorted = [...(pool.length > 0 ? pool : todos)].sort((a, b) => a.tasks.length - b.tasks.length || (a.lastAssigned || 0) - (b.lastAssigned || 0));

        if (tSorted.length === 1) {
          tSorted[0].tasks.push('Piscina, Manutergio y Jarra'); tSorted[0].lastAssigned = ++assignOrder;
        } else if (tSorted.length === 2) {
          tSorted[0].tasks.push('Piscina y Manutergio'); tSorted[0].lastAssigned = ++assignOrder;
          tSorted[1].tasks.push('Jarra'); tSorted[1].lastAssigned = ++assignOrder;
        } else if (tSorted.length >= 3) {
          tSorted[0].tasks.push('Piscina'); tSorted[0].lastAssigned = ++assignOrder;
          tSorted[1].tasks.push('Manutergio'); tSorted[1].lastAssigned = ++assignOrder;
          tSorted[2].tasks.push('Jarra'); tSorted[2].lastAssigned = ++assignOrder;
        }
      }
    }
    else if (task.id === 'Caliz' || task.id === 'Copon' || task.id === 'AceitesBautizo') {
      const preassignedSelf = kids.some(k => k.preassignedTasks.includes(task.id));
      if (!preassignedSelf) {
        let pool = todos.filter(k => !k.hasOfertorioPesado);
        let kid = getFairKid(pool.length > 0 ? pool : todos);
        if (kid) {
          kid.tasks.push(task.name);
        }
      }
    }
    else {
      const preassignedSelf = kids.some(k => k.preassignedTasks.includes(task.id));
      if (!preassignedSelf) {
        let kid = getFairKid(todos);
        if (kid) kid.tasks.push(task.name);
      }
    }
  });

  return { assignedKids: kids, warningChicos, error: null };
}
