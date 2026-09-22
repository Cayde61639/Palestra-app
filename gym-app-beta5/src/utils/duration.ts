import { Exercise, WorkoutDay } from '../types';

/**
 * Tempo di lavoro stimato per ogni serie in secondi (tempo di esecuzione medio).
 */
export const ESTIMATED_WORK_SECONDS_PER_SET = 40;
export const ESTIMATED_WARMUP_SECONDS_PER_SET = 30;

/**
 * Calcola i secondi totali stimati per un singolo esercizio:
 * Supporta sia esercizi di riscaldamento generico che serie di riscaldamento dentro esercizi normali.
 */
export function calculateExerciseDurationSeconds(exercise: Exercise): number {
  const sets = exercise.sets ?? [];
  const setsCount = sets.length;
  if (setsCount <= 0) return 0;

  // 1. Esercizio di riscaldamento generico / mobilità
  if (exercise.category === 'warmup') {
    const workSeconds = setsCount * ESTIMATED_WARMUP_SECONDS_PER_SET;
    const restSeconds = Math.max(0, setsCount - 1) * (exercise.restTimeSeconds ?? 0);
    return workSeconds + restSeconds;
  }

  // 2. Esercizio normale con eventuali serie di riscaldamento
  const warmupSets = sets.filter((s) => s.setType === 'warmup');
  const workingSets = sets.filter((s) => s.setType !== 'warmup');

  // Tempo per serie di riscaldamento (lavoro più leggero + recupero breve)
  const warmupWork = warmupSets.length * ESTIMATED_WARMUP_SECONDS_PER_SET;
  const warmupRest =
    warmupSets.length > 0 ? warmupSets.length * (exercise.warmupRestTimeSeconds ?? 30) : 0;

  // Tempo per serie di lavoro effettive
  const workingWork = workingSets.length * ESTIMATED_WORK_SECONDS_PER_SET;
  const workingRest = Math.max(0, workingSets.length - 1) * (exercise.restTimeSeconds ?? 90);

  return warmupWork + warmupRest + workingWork + workingRest;
}

/**
 * Calcola la durata totale stimata di un giorno in minuti (arrotondata al minuto più vicino).
 */
export function calculateDayDurationMinutes(day: WorkoutDay | Exercise[]): number {
  const exercises = Array.isArray(day) ? day : (day.exercises ?? []);
  if (!exercises.length) return 0;

  const totalSeconds = exercises.reduce((acc, ex) => {
    return acc + calculateExerciseDurationSeconds(ex);
  }, 0);

  return Math.round(totalSeconds / 60);
}

/**
 * Formatta la durata stimata di un giorno in una stringa leggibile:
 * - "~0 min" se vuoto
 * - "~45 min" se inferiore a un'ora
 * - "~1h" o "~1h 15min" se supera i 60 minuti
 */
export function formatDayDuration(day: WorkoutDay | Exercise[]): string {
  const minutes = calculateDayDurationMinutes(day);
  if (minutes <= 0) return '~0 min';

  if (minutes < 60) {
    return `~${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (remainingMins === 0) {
    return `~${hours}h`;
  }

  return `~${hours}h ${remainingMins}min`;
}
