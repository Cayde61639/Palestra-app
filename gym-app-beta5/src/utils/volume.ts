import { Exercise, ExerciseSet, UserProfile, WeightMode } from '../types';
import { findExerciseDefinitionFast } from './ranking';

/**
 * Riferimenti scientifici per la percentuale del peso corporeo sollevata (% BW)
 * Fonti: ExRx.net ("Calculating Actual Resistance"), Contreras et al. ("The Biomechanics of the Push-up")
 */
export const SCIENTIFIC_BODYWEIGHT_PERCENTAGES: Record<string, number> = {
  // Trazioni alla sbarra (pull-up / chin-up): 90%
  'trazioni': 90,
  'pull-up': 90,
  'pull-ups': 90,
  'chin-up': 90,
  'chin-ups': 90,
  // Dip alle parallele: 95%
  'dip': 95,
  'dips': 95,
  'parallele': 95,
  // Piegamenti standard a terra: 65%
  'piegamenti': 65,
  'push-up': 65,
  'push-ups': 65,
  'pushup': 65,
  // Piegamenti in ginocchio: 50%
  'ginocchia': 50,
  'ginocchio': 50,
  'knee push-up': 50,
  // Piegamenti mani su rialzo (incline): 45%
  'incline push-up': 45,
  'mani su rialzo': 45,
  'incline': 45,
  // Piegamenti piedi elevati (decline): 72%
  'decline push-up': 72,
  'piedi elevati': 72,
  'piedi su rialzo': 72,
  'decline': 72,
  // Dip su panca tra due panche: 55%
  'bench dip': 55,
  'dips su panca': 55,
};

/**
 * Ricerca la percentuale di peso corporeo sollevata per un dato esercizio.
 * Controlla proprietà diretta, catalogo precalcolato e matching semantico.
 * Restituisce undefined se l'esercizio non è a corpo libero calcolabile (es. Plank o Addominali a terra).
 */
export function getExerciseBodyweightPercentage(
  exerciseOrDef?: {
    bodyweightPercentage?: number;
    name?: string;
    italianName?: string;
    id?: string;
    weightMode?: WeightMode;
    equipment?: string;
  } | null
): number | undefined {
  if (!exerciseOrDef) return undefined;

  // 1. Se già definito esplicitamente sull'oggetto
  if (typeof exerciseOrDef.bodyweightPercentage === 'number' && exerciseOrDef.bodyweightPercentage > 0) {
    return exerciseOrDef.bodyweightPercentage;
  }

  const queryName = exerciseOrDef.name || exerciseOrDef.italianName || exerciseOrDef.id || '';
  if (queryName) {
    // 2. Lookup nel catalogo precalcolato
    const def = findExerciseDefinitionFast(queryName);
    if (def && typeof def.bodyweightPercentage === 'number' && def.bodyweightPercentage > 0) {
      return def.bodyweightPercentage;
    }

    const norm = queryName.toLowerCase().trim();

    // Esclusioni tassative: Plank e addominali a corpo libero non hanno % per tonnellaggio
    if (
      norm.includes('plank') ||
      norm.includes('crunch') ||
      norm.includes('leg raise') ||
      norm.includes('addominal') ||
      norm.includes('russian twist') ||
      norm.includes('rollout')
    ) {
      return undefined;
    }

    // Corrispondenze scientifiche
    if (norm.includes('ginocchi')) return 50;
    if (norm.includes('piedi elevat') || norm.includes('decline push')) return 72;
    if (norm.includes('mani su rialzo') || (norm.includes('incline') && norm.includes('push'))) return 45;
    if (norm.includes('trazion') || norm.includes('pull-up') || norm.includes('chin-up')) return 90;
    if (norm.includes('dip') && (norm.includes('parallel') || norm.includes('chest') || !norm.includes('panca'))) return 95;
    if (norm.includes('bench dip') || norm.includes('dips su panca')) return 55;
    if (norm.includes('piegament') || norm.includes('push-up') || norm.includes('pushup')) return 65;
  }

  // 3. Fallback per esercizi marcati come 'bodyweight' senza configurazione specifica
  if (exerciseOrDef.weightMode === 'bodyweight' || exerciseOrDef.equipment === 'bodyweight') {
    return 65; // Valore di default ragionevole per appoggio su mani/piedi
  }

  return undefined;
}

/**
 * Calcola il CARICO EFFETTIVO per QUALSIASI esercizio:
 *
 * a) Esercizi con carico esterno, modalità "Totale" (es. bilanciere, macchine):
 *    caricoEffettivo = peso inserito
 *
 * b) Esercizi con carico esterno, modalità "Per Lato" (es. manubri):
 *    caricoEffettivo = peso inserito × 2
 *
 * c) Esercizi a corpo libero:
 *    caricoEffettivo = (peso corporeo utente × bodyweightPercentage / 100) + eventuale peso esterno (zavorra)
 *
 * Ritorna `null` se il carico non è calcolabile (es. corpo libero privo di % e senza peso inserito, come il Plank).
 */
export function getEffectiveWeight(
  exercise: {
    weightMode?: WeightMode;
    equipment?: string;
    bodyweightPercentage?: number;
    name?: string;
    italianName?: string;
    id?: string;
  },
  rawWeight: number,
  profile: UserProfile
): number | null {
  const isPerSide = exercise.weightMode === 'per_side';
  const bwPercentage = getExerciseBodyweightPercentage(exercise);

  // Caso C: Corpo Libero (percentuale di peso corporeo sollevata attiva)
  if (bwPercentage !== undefined && bwPercentage > 0) {
    const userWeight = profile.bodyWeightKg > 0 ? profile.bodyWeightKg : 75;
    const bodyContribution = (userWeight * bwPercentage) / 100;
    const ballast = Number.isFinite(rawWeight) && rawWeight > 0 ? (isPerSide ? rawWeight * 2 : rawWeight) : 0;
    return Math.round((bodyContribution + ballast) * 10) / 10;
  }

  // Caso B: Per Lato (manubri singoli: raddoppia per il carico effettivo totale sollevato dalla catena)
  if (isPerSide) {
    if (Number.isFinite(rawWeight) && rawWeight > 0) {
      return Math.round(rawWeight * 2 * 10) / 10;
    }
    return null;
  }

  // Caso A: Totale con carico esterno
  if (Number.isFinite(rawWeight) && rawWeight > 0) {
    return Math.round(rawWeight * 10) / 10;
  }

  // Se nessun peso inserito e nessuna percentuale valida, non è calcolabile (es. Plank a corpo libero)
  return null;
}

/**
 * Risultato completo e pronto per il rendering del volume
 */
export interface VolumeResult {
  value: number | null; // Tonnellaggio totale o numero serie efficaci, null se non calcolabile
  formatted: string; // "1,250", "4" o "—"
  fullFormatted: string; // "1,250 kg", "4 serie" o "—"
  label: string; // "Tonnellaggio" o "Serie Efficaci"
  unit: string; // "kg" / "lb" oppure "serie"
  isTonnage: boolean;
  effectiveSetsCount: number;
}

/**
 * Calcola il volume di un singolo esercizio rispettando l'impostazione `profile.volumeMetric`.
 */
export function calculateExerciseVolume(
  exercise: Exercise,
  profile: UserProfile,
  onlyCompleted = false
): VolumeResult {
  const metric = profile.volumeMetric || 'tonnage';
  const isTonnage = metric === 'tonnage';

  // Solo serie da lavoro (esclude sempre il riscaldamento)
  const workingSets = (exercise.sets || []).filter((s) => {
    if (s.setType === 'warmup') return false;
    if (onlyCompleted && !s.completed) return false;
    return true;
  });

  const effectiveSetsCount = workingSets.length;

  if (!isTonnage) {
    return {
      value: effectiveSetsCount,
      formatted: `${effectiveSetsCount}`,
      fullFormatted: `${effectiveSetsCount} ${effectiveSetsCount === 1 ? 'serie' : 'serie'}`,
      label: 'Serie Efficaci',
      unit: 'serie',
      isTonnage: false,
      effectiveSetsCount,
    };
  }

  // Metrica Tonnellaggio
  let sumTonnage = 0;
  let hasCalculableSet = false;

  for (const s of workingSets) {
    const effWeight = getEffectiveWeight(exercise, s.weight, profile);
    if (effWeight !== null && effWeight > 0 && s.reps > 0) {
      sumTonnage += effWeight * s.reps;
      hasCalculableSet = true;
    }
  }

  if (!hasCalculableSet) {
    return {
      value: null,
      formatted: '—',
      fullFormatted: '—',
      label: 'Tonnellaggio',
      unit: profile.unit,
      isTonnage: true,
      effectiveSetsCount,
    };
  }

  const rounded = Math.round(sumTonnage);
  return {
    value: rounded,
    formatted: rounded.toLocaleString(),
    fullFormatted: `${rounded.toLocaleString()} ${profile.unit}`,
    label: 'Tonnellaggio',
    unit: profile.unit,
    isTonnage: true,
    effectiveSetsCount,
  };
}

/**
 * Calcola il volume aggregato per una lista di esercizi (es. giornata, muscolo o scheda intera).
 */
export function calculateVolume(
  exercises: Exercise[],
  profile: UserProfile,
  onlyCompleted = false
): VolumeResult {
  const metric = profile.volumeMetric || 'tonnage';
  const isTonnage = metric === 'tonnage';

  let totalEffectiveSets = 0;
  let totalTonnage = 0;
  let hasAnyCalculableTonnage = false;

  for (const ex of exercises) {
    if (ex.category === 'warmup') continue;
    const res = calculateExerciseVolume(ex, profile, onlyCompleted);
    totalEffectiveSets += res.effectiveSetsCount;
    if (res.value !== null) {
      totalTonnage += res.value;
      hasAnyCalculableTonnage = true;
    }
  }

  if (!isTonnage) {
    return {
      value: totalEffectiveSets,
      formatted: `${totalEffectiveSets}`,
      fullFormatted: `${totalEffectiveSets} ${totalEffectiveSets === 1 ? 'serie' : 'serie'}`,
      label: 'Serie Efficaci',
      unit: 'serie',
      isTonnage: false,
      effectiveSetsCount: totalEffectiveSets,
    };
  }

  if (!hasAnyCalculableTonnage) {
    return {
      value: null,
      formatted: '—',
      fullFormatted: '—',
      label: 'Tonnellaggio',
      unit: profile.unit,
      isTonnage: true,
      effectiveSetsCount: totalEffectiveSets,
    };
  }

  const rounded = Math.round(totalTonnage);
  return {
    value: rounded,
    formatted: rounded.toLocaleString(),
    fullFormatted: `${rounded.toLocaleString()} ${profile.unit}`,
    label: 'Tonnellaggio',
    unit: profile.unit,
    isTonnage: true,
    effectiveSetsCount: totalEffectiveSets,
  };
}

/**
 * Formatta un valore di volume per la visualizzazione immediata
 */
export function formatVolumeDisplay(
  value: number | null,
  profile: UserProfile
): string {
  if (value === null) return '—';
  if ((profile.volumeMetric || 'tonnage') === 'effective_sets') {
    return `${value} serie`;
  }
  return `${value.toLocaleString()} ${profile.unit}`;
}
