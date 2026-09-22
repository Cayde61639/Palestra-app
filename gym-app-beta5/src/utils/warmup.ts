import { WeightMode } from '../types';

/**
 * Calcola il carico progressivo a rampa per una serie di riscaldamento
 * basandosi sul carico di lavoro più pesante impostato per l'esercizio.
 *
 * @param maxWorkingWeight - Il carico più pesante tra le serie da lavoro (working sets)
 * @param warmupIndex - Indice della serie di riscaldamento (0 per la prima, 1 per la seconda, etc.)
 * @param totalWarmupsTarget - Numero totale stimato di serie di riscaldamento
 * @param weightMode - 'total' (bilanciere/macchina) vs 'per_side' (manubri)
 * @param equipment - Attrezzatura (barbell, dumbbell, machine, cable, bodyweight)
 */
export function calculateWarmupRampWeight(
  maxWorkingWeight: number,
  warmupIndex: number,
  totalWarmupsTarget: number,
  weightMode: WeightMode = 'total',
  equipment?: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'
): number {
  // Se non c'è ancora un carico di lavoro impostato (es. 0 kg), suggerisci il carico base dell'attrezzo
  if (maxWorkingWeight <= 0) {
    if (equipment === 'barbell') return 20; // Bilanciere olimpico standard vuoto (20kg)
    if (weightMode === 'per_side') return 6; // Manubri leggeri da riscaldamento
    return 15;
  }

  // Schema a rampa progressiva in base a quante serie di riscaldamento si vogliono fare:
  // - 1 serie: ~50%
  // - 2 serie: 50% -> 75%
  // - 3 serie: 40% -> 60% -> 80%
  // - 4+ serie: 40% -> 55% -> 70% -> 85%
  let pct = 0.5;
  if (totalWarmupsTarget <= 1) {
    pct = 0.50;
  } else if (totalWarmupsTarget === 2) {
    pct = warmupIndex === 0 ? 0.50 : 0.75;
  } else if (totalWarmupsTarget === 3) {
    if (warmupIndex === 0) pct = 0.40;
    else if (warmupIndex === 1) pct = 0.60;
    else pct = 0.80;
  } else {
    // 4 o più serie
    if (warmupIndex === 0) pct = 0.40;
    else if (warmupIndex === 1) pct = 0.55;
    else if (warmupIndex === 2) pct = 0.70;
    else if (warmupIndex === 3) pct = 0.82;
    else pct = Math.min(0.90, 0.82 + (warmupIndex - 3) * 0.04);
  }

  const rawWeight = maxWorkingWeight * pct;

  if (weightMode === 'per_side') {
    // Manubri: arrotondamento a multipli di 2 kg (o 1 kg se piccolo)
    const step = 2;
    const rounded = Math.round(rawWeight / step) * step;
    return Math.max(2, rounded);
  } else {
    // Bilanciere o Macchinari totali: arrotondamento a multipli realistici di 2.5 kg
    const step = 2.5;
    const minWeight = equipment === 'barbell' ? 20 : 5;
    const rounded = Math.round(rawWeight / step) * step;
    return Math.max(minWeight, rounded);
  }
}

/**
 * Calcola le ripetizioni suggerite per una serie di riscaldamento a rampa:
 * - Le prime serie più leggere hanno reps più alte per attivare la vascolarizzazione
 * - Le serie più pesanti di avvicinamento scalano le reps per non accumulare affaticamento lattacido
 */
export function calculateWarmupRampReps(
  baseWorkingReps: number,
  warmupIndex: number
): number {
  const base = baseWorkingReps > 0 ? baseWorkingReps : 10;
  if (warmupIndex === 0) {
    // Prima serie: 10-12 ripetizioni per attivazione
    return Math.min(15, Math.max(10, base));
  }
  if (warmupIndex === 1) {
    // Seconda serie: 6-8 ripetizioni
    return Math.max(6, Math.round(base * 0.75));
  }
  if (warmupIndex === 2) {
    // Terza serie di avvicinamento: 4-5 ripetizioni
    return Math.max(3, Math.round(base * 0.50));
  }
  // Quarta o successive: 2-3 ripetizioni di pura attivazione neurale
  return Math.max(2, Math.round(base * 0.35));
}
