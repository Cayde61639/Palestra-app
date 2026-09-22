import { Exercise, WorkoutSortCriterion } from '../types';

export interface SortOptionConfig {
  id: WorkoutSortCriterion;
  label: string;
  description: string;
  badge: string;
  noticeText: string;
}

export const SORT_OPTIONS: SortOptionConfig[] = [
  {
    id: 'biomechanic',
    label: 'Priorità biomeccanica',
    description: 'Muscoli grandi e multiarticolari prima',
    badge: 'Consigliato',
    noticeText: 'Scheda riorganizzata per priorità biomeccanica',
  },
  {
    id: 'muscle_group',
    label: 'Gruppo muscolare',
    description: 'Esercizi raggruppati per singolo distretto',
    badge: 'Compatto',
    noticeText: 'Scheda riorganizzata per gruppo muscolare',
  },
  {
    id: 'push_pull_legs',
    label: 'Push / Pull / Legs',
    description: 'Sequenza Spinta → Trazione → Gambe & Core',
    badge: 'PPL',
    noticeText: 'Scheda riorganizzata per schema Push / Pull / Legs',
  },
  {
    id: 'heavy_to_light',
    label: 'Carico decrescente',
    description: 'Esercizi con carico più pesante a inizio seduta',
    badge: 'Max Kg',
    noticeText: 'Scheda riorganizzata per carico decrescente',
  },
  {
    id: 'alphabetical',
    label: 'Ordine alfabetico',
    description: 'Ordinamento alfabetico da A a Z per nome',
    badge: 'A → Z',
    noticeText: 'Scheda riorganizzata in ordine alfabetico',
  },
];

/**
 * Normalizza qualsiasi stringa di gruppo muscolare (inclusi muscoli non predefiniti,
 * custom inseriti manualmente, sinonimi o in italiano/inglese) e ne ricava
 * priorità biomeccaniche e di raggruppamento.
 */
export function getMuscleCategorization(rawMuscle: string = '') {
  const clean = String(rawMuscle).trim().toLowerCase();

  // 1. Quads / Catena anteriore cosce
  if (
    clean === 'quads' ||
    clean.includes('quad') ||
    clean.includes('cosce') ||
    clean.includes('femur')
  ) {
    return {
      canonical: 'quads',
      biomechanicPriority: 1,
      groupPriority: 6,
      pplPriority: 6,
    };
  }

  // 2. Glutes / Bacino
  if (
    clean === 'glutes' ||
    clean.includes('glut') ||
    clean.includes('chiapp') ||
    clean.includes('anca')
  ) {
    return {
      canonical: 'glutes',
      biomechanicPriority: 2,
      groupPriority: 8,
      pplPriority: 8,
    };
  }

  // 3. Hamstrings / Femorali
  if (
    clean === 'hamstrings' ||
    clean.includes('hamstring') ||
    clean.includes('femor') ||
    clean.includes('ischio')
  ) {
    return {
      canonical: 'hamstrings',
      biomechanicPriority: 3,
      groupPriority: 7,
      pplPriority: 7,
    };
  }

  // 4. Polpacci / Calves
  if (
    clean === 'calves' ||
    clean.includes('calf') ||
    clean.includes('polpacc') ||
    clean.includes('soleo') ||
    clean.includes('gastrocnem')
  ) {
    return {
      canonical: 'calves',
      biomechanicPriority: 9,
      groupPriority: 9,
      pplPriority: 9,
    };
  }

  // Altri muscoli gambe (Adduttori, Abduttori, Tibiali, ecc.)
  if (
    clean.includes('addutt') ||
    clean.includes('abdutt') ||
    clean.includes('tibia') ||
    clean.includes('gamb') ||
    clean.includes('leg')
  ) {
    return {
      canonical: clean,
      biomechanicPriority: 3.5,
      groupPriority: 9.5,
      pplPriority: 9.5,
    };
  }

  // 5. Chest / Petto
  if (
    clean === 'chest' ||
    clean.includes('pett') ||
    clean.includes('pect')
  ) {
    return {
      canonical: 'chest',
      biomechanicPriority: 4,
      groupPriority: 1,
      pplPriority: 1,
    };
  }

  // 6. Back / Dorso / Dorsali
  if (
    clean === 'back' ||
    clean.includes('dors') ||
    clean.includes('lat') ||
    clean.includes('schiena')
  ) {
    return {
      canonical: 'back',
      biomechanicPriority: 5,
      groupPriority: 2,
      pplPriority: 4,
    };
  }

  // Trapezi, Romboidi, Lombari
  if (
    clean.includes('trap') ||
    clean.includes('romboid') ||
    clean.includes('lombar') ||
    clean.includes('erector')
  ) {
    return {
      canonical: clean,
      biomechanicPriority: 5.5,
      groupPriority: 2.5,
      pplPriority: 4.5,
    };
  }

  // 7. Shoulders / Spalle / Deltoidi
  if (
    clean === 'shoulders' ||
    clean.includes('spall') ||
    clean.includes('delt') ||
    clean.includes('cuffia')
  ) {
    return {
      canonical: 'shoulders',
      biomechanicPriority: 6,
      groupPriority: 3,
      pplPriority: 2,
    };
  }

  // 8. Triceps / Tricipiti
  if (clean === 'triceps' || clean.includes('tricip')) {
    return {
      canonical: 'triceps',
      biomechanicPriority: 7,
      groupPriority: 5,
      pplPriority: 3,
    };
  }

  // 9. Biceps / Bicipiti
  if (clean === 'biceps' || clean.includes('bicip')) {
    return {
      canonical: 'biceps',
      biomechanicPriority: 8,
      groupPriority: 4,
      pplPriority: 5,
    };
  }

  // Avambracci / Forearms / Polsi
  if (
    clean.includes('avambracc') ||
    clean.includes('forearm') ||
    clean.includes('polso') ||
    clean.includes('grip') ||
    clean.includes('bracc')
  ) {
    return {
      canonical: clean,
      biomechanicPriority: 8.5,
      groupPriority: 5.5,
      pplPriority: 5.5,
    };
  }

  // 10. Abs / Addome / Core
  if (
    clean === 'abs' ||
    clean.includes('addom') ||
    clean.includes('core') ||
    clean.includes('obliq')
  ) {
    return {
      canonical: 'abs',
      biomechanicPriority: 10,
      groupPriority: 10,
      pplPriority: 10.5,
    };
  }

  // 11. Gruppi non esistenti o custom generici (Collo, Cardio, Mobilità, Altro...)
  return {
    canonical: clean || 'altro',
    biomechanicPriority: 12,
    groupPriority: 20,
    pplPriority: 12,
  };
}

/**
 * Calcola il carico massimo effettivo impostato tra le serie di un esercizio
 */
export function getExerciseMaxWeight(ex: Exercise): number {
  if (!ex.sets || ex.sets.length === 0) return 0;
  const weights = ex.sets.map((s) =>
    ex.weightMode === 'per_side' ? (s.weight || 0) * 2 + 20 : s.weight || 0
  );
  return Math.max(...weights, 0);
}

/**
 * Esegue l'ordinamento degli esercizi in base al criterio selezionato dall'utente,
 * supportando sia i distretti muscolari standard che qualsiasi gruppo muscolare
 * custom o non pre-esistente nell'applicazione.
 */
export function sortExercisesByCriterion(
  exercises: Exercise[],
  criterion: WorkoutSortCriterion
): Exercise[] {
  const list = [...exercises];

  switch (criterion) {
    case 'biomechanic': {
      return list.sort((a, b) => {
        const cA = getMuscleCategorization(a.targetMuscle);
        const cB = getMuscleCategorization(b.targetMuscle);
        if (cA.biomechanicPriority !== cB.biomechanicPriority) {
          return cA.biomechanicPriority - cB.biomechanicPriority;
        }
        // Se hanno la stessa priorità o sono gruppi custom, raggruppa per nome muscolo
        const muscleCompare = (a.targetMuscle || '').localeCompare(b.targetMuscle || '', 'it', {
          sensitivity: 'base',
        });
        if (muscleCompare !== 0) return muscleCompare;
        return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
      });
    }

    case 'muscle_group': {
      return list.sort((a, b) => {
        const cA = getMuscleCategorization(a.targetMuscle);
        const cB = getMuscleCategorization(b.targetMuscle);
        if (cA.groupPriority !== cB.groupPriority) {
          return cA.groupPriority - cB.groupPriority;
        }
        // Raggruppa rigorosamente gli esercizi dello stesso gruppo custom
        const muscleCompare = (a.targetMuscle || '').localeCompare(b.targetMuscle || '', 'it', {
          sensitivity: 'base',
        });
        if (muscleCompare !== 0) return muscleCompare;
        return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
      });
    }

    case 'push_pull_legs': {
      return list.sort((a, b) => {
        const cA = getMuscleCategorization(a.targetMuscle);
        const cB = getMuscleCategorization(b.targetMuscle);
        if (cA.pplPriority !== cB.pplPriority) {
          return cA.pplPriority - cB.pplPriority;
        }
        const muscleCompare = (a.targetMuscle || '').localeCompare(b.targetMuscle || '', 'it', {
          sensitivity: 'base',
        });
        if (muscleCompare !== 0) return muscleCompare;
        return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
      });
    }

    case 'heavy_to_light': {
      return list.sort((a, b) => {
        const wA = getExerciseMaxWeight(a);
        const wB = getExerciseMaxWeight(b);
        if (wB !== wA) return wB - wA; // Peso decrescente (più pesante prima)
        const muscleCompare = (a.targetMuscle || '').localeCompare(b.targetMuscle || '', 'it', {
          sensitivity: 'base',
        });
        if (muscleCompare !== 0) return muscleCompare;
        return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
      });
    }

    case 'alphabetical': {
      return list.sort((a, b) =>
        a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
      );
    }

    default:
      return list;
  }
}
