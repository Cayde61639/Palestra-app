import { Exercise, MuscleZone, WorkoutDay } from '../types';
import { getMuscleCategorization } from './sorting';

export const CANONICAL_MUSCLE_NAMES: Record<string, string> = {
  chest: 'Petto',
  back: 'Dorso',
  shoulders: 'Spalle',
  triceps: 'Tricipiti',
  biceps: 'Bicipiti',
  quads: 'Quadricipiti',
  hamstrings: 'Femorali',
  glutes: 'Glutei',
  calves: 'Polpacci',
  abs: 'Addome',
};

/**
 * Mappa di affinità biomeccanica tra muscolo primario e muscoli secondari/sinergici plausibili.
 * Muscoli non inclusi in questa mappa per un dato primario sono anatomicamente illogici.
 */
export const SECONDARY_MUSCLE_AFFINITY: Record<string, MuscleZone[]> = {
  chest: ['shoulders', 'triceps'],
  back: ['biceps', 'shoulders'],
  shoulders: ['chest', 'triceps', 'back'],
  biceps: ['back', 'shoulders'],
  triceps: ['chest', 'shoulders'],
  quads: ['glutes', 'hamstrings', 'calves'],
  hamstrings: ['glutes', 'quads', 'calves', 'back'],
  glutes: ['hamstrings', 'quads', 'back'],
  calves: ['hamstrings'],
};

/**
 * Normalizza il muscolo principale scelto tramite getMuscleCategorization
 * e restituisce l'elenco dei muscoli secondari plausibili.
 * Restituisce null se tutti i muscoli sono permessi (es. Addome o muscoli custom non riconosciuti).
 */
export function getPlausibleSecondaryMuscles(primaryMuscle: string): MuscleZone[] | null {
  if (!primaryMuscle) return null;
  const { canonical } = getMuscleCategorization(primaryMuscle);

  // Addome (abs): nessun secondario obbligato o ristretto
  if (canonical === 'abs') {
    return null;
  }

  // Muscoli con affinità biomeccanica definita
  if (canonical in SECONDARY_MUSCLE_AFFINITY) {
    return SECONDARY_MUSCLE_AFFINITY[canonical];
  }

  // Categorie custom o fallback "unknown": nessuna restrizione per non bloccare casi legittimi
  return null;
}

/**
 * Formatta un elenco di nomi muscolari con virgole e la congiunzione finale "&"
 * Es: ["Petto", "Spalle", "Tricipiti"] -> "Petto, Spalle & Tricipiti"
 */
function formatMuscleList(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  const allExceptLast = names.slice(0, -1).join(', ');
  const last = names[names.length - 1];
  return `${allExceptLast} & ${last}`;
}

/**
 * Genera automaticamente il nome descrittivo del giorno in base agli esercizi presenti.
 * Formato: "Giorno {lettera} - {Categoria PPL} ({Muscolo1, Muscolo2 & Muscolo3})"
 * Se il giorno è vuoto, restituisce semplicemente "Giorno {lettera}".
 */
export function generateDayName(exercises: Exercise[], dayLetter: string = 'A'): string {
  if (!exercises || exercises.length === 0) {
    return `Giorno ${dayLetter}`;
  }

  const muscleMap = new Map<
    string,
    {
      canonical: string;
      displayName: string;
      primaryCount: number;
      secondaryCount: number;
      biomechanicPriority: number;
      pplPriority: number;
    }
  >();

  let pushCount = 0;
  let pullCount = 0;
  let legsCoreCount = 0;

  for (const ex of exercises) {
    // 1. Target primario
    const cat = getMuscleCategorization(ex.targetMuscle);
    const canonical = cat.canonical;
    const displayName =
      CANONICAL_MUSCLE_NAMES[canonical] ||
      (canonical.charAt(0).toUpperCase() + canonical.slice(1));

    if (!muscleMap.has(canonical)) {
      muscleMap.set(canonical, {
        canonical,
        displayName,
        primaryCount: 0,
        secondaryCount: 0,
        biomechanicPriority: cat.biomechanicPriority,
        pplPriority: cat.pplPriority,
      });
    }
    const stat = muscleMap.get(canonical)!;
    stat.primaryCount += 1;

    // 2. Classificazione PPL tramite pplPriority di getMuscleCategorization
    // Push (chest, shoulders, triceps): pplPriority <= 3.5
    // Pull (back, lats, traps, biceps, forearms): pplPriority 4..5.5
    // Legs & Core (quads, hamstrings, glutes, calves, abs): pplPriority 6..11
    if (cat.pplPriority <= 3.5) {
      pushCount += 1;
    } else if (cat.pplPriority >= 4 && cat.pplPriority <= 5.5) {
      pullCount += 1;
    } else if (cat.pplPriority >= 6 && cat.pplPriority <= 11) {
      legsCoreCount += 1;
    }

    // 3. Muscoli secondari / sinergici
    if (ex.secondaryMuscles && Array.isArray(ex.secondaryMuscles)) {
      for (const sec of ex.secondaryMuscles) {
        const secCat = getMuscleCategorization(sec);
        const secCanon = secCat.canonical;
        if (!muscleMap.has(secCanon)) {
          const secDisplayName =
            CANONICAL_MUSCLE_NAMES[secCanon] ||
            (secCanon.charAt(0).toUpperCase() + secCanon.slice(1));
          muscleMap.set(secCanon, {
            canonical: secCanon,
            displayName: secDisplayName,
            primaryCount: 0,
            secondaryCount: 0,
            biomechanicPriority: secCat.biomechanicPriority,
            pplPriority: secCat.pplPriority,
          });
        }
        muscleMap.get(secCanon)!.secondaryCount += 1;
      }
    }
  }

  // Determinazione prefisso PPL dominante coerente con SORT_OPTIONS
  const total = exercises.length;
  let categoryPrefix = '';
  const maxCount = Math.max(pushCount, pullCount, legsCoreCount);
  const dominantThreshold = total * 0.5;

  if (
    pushCount === maxCount &&
    pushCount >= dominantThreshold &&
    pushCount > pullCount &&
    pushCount > legsCoreCount
  ) {
    categoryPrefix = 'Spinta';
  } else if (
    pullCount === maxCount &&
    pullCount >= dominantThreshold &&
    pullCount > pushCount &&
    pullCount > legsCoreCount
  ) {
    categoryPrefix = 'Trazione';
  } else if (
    legsCoreCount === maxCount &&
    legsCoreCount >= dominantThreshold &&
    legsCoreCount > pushCount &&
    legsCoreCount > pullCount
  ) {
    categoryPrefix = 'Gambe & Core';
  } else {
    // Giorno misto senza categoria dominante
    categoryPrefix = 'Full Body';
  }

  // Ordinamento dei muscoli:
  // 1. Chi ha più esercizi come target primario
  // 2. Chi ha punteggio totale più alto (inclusi secondari)
  // 3. Priorità biomeccanica (muscoli grandi/multiarticolari prima)
  const sortedMuscles = Array.from(muscleMap.values()).sort((a, b) => {
    if (b.primaryCount !== a.primaryCount) {
      return b.primaryCount - a.primaryCount;
    }
    const scoreA = a.primaryCount * 3 + a.secondaryCount;
    const scoreB = b.primaryCount * 3 + b.secondaryCount;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return a.biomechanicPriority - b.biomechanicPriority;
  });

  const primaryOnly = sortedMuscles.filter((m) => m.primaryCount > 0);
  const candidates = primaryOnly.length > 0 ? primaryOnly : sortedMuscles;
  const topMuscles = candidates.slice(0, 4).map((m) => m.displayName);

  const muscleString = formatMuscleList(topMuscles);

  if (!muscleString) {
    return `Giorno ${dayLetter}${categoryPrefix ? ` - ${categoryPrefix}` : ''}`;
  }

  return `Giorno ${dayLetter} - ${categoryPrefix} (${muscleString})`;
}

/**
 * Estrae i muscoli focus canonici per le pillole informative del carrello
 */
export function getFocusMusclesFromExercises(exercises: Exercise[]): MuscleZone[] {
  if (!exercises || exercises.length === 0) return [];
  const seen = new Set<string>();
  const result: MuscleZone[] = [];

  // Priorità ai target primari
  for (const ex of exercises) {
    const cat = getMuscleCategorization(ex.targetMuscle);
    if (!seen.has(cat.canonical)) {
      seen.add(cat.canonical);
      result.push(cat.canonical as MuscleZone);
    }
  }

  // Aggiungi eventuali secondari fino a un massimo di 4
  for (const ex of exercises) {
    if (ex.secondaryMuscles) {
      for (const sec of ex.secondaryMuscles) {
        const cat = getMuscleCategorization(sec);
        if (!seen.has(cat.canonical) && result.length < 4) {
          seen.add(cat.canonical);
          result.push(cat.canonical as MuscleZone);
        }
      }
    }
  }

  return result;
}

/**
 * Sincronizza i metadati di un WorkoutDay (nome automatico se non custom, e muscoli focus).
 * Rispetta rigorosamente isNameCustom se l'utente ha rinominato manualmente il giorno.
 */
export function syncDayMetadata(day: WorkoutDay, dayIndex: number): WorkoutDay {
  const dayLetter = String.fromCharCode(65 + dayIndex);
  const focusMuscles = getFocusMusclesFromExercises(day.exercises);

  if (day.isNameCustom) {
    return {
      ...day,
      focusMuscles,
    };
  }

  return {
    ...day,
    name: generateDayName(day.exercises, dayLetter),
    focusMuscles,
  };
}
