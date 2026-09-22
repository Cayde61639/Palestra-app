import confetti from 'canvas-confetti';
import { MuscleZone, RankLevel, UserProfile, WeightMode, WorkoutRoutine } from '../types';
import { EXERCISE_DATASET } from '../data/exerciseDataset';
import { getEffectiveWeight } from './volume';

/**
 * Calcolo del Rank e Metriche di Forza
 *
 * MODELLO BIOMECCANICO DI FORZA RELATIVA (ALLOMETRIC SCALING):
 * In letteratura scientifica sportiva (Jaric 2002, Siff 2000, Markovic & Jaric 2004),
 * la forza muscolare non scala linearmente con la massa corporea (massa proporzionale al volume L^3,
 * mentre l'area di sezione trasversa fisiologica del muscolo PCSA scala come L^2).
 * Pertanto la relazione geometrica universale è allometrica: Forza proporzionale a Massa^(2/3) ≈ Massa^0.67.
 *
 * SCALING DELL'ALTEZZA E BRACCIO DI LEVA:
 * Atleti più alti affrontano bracci di leva articolari più lunghi (coppia resistente = F * braccio)
 * e un ROM (range di movimento) maggiore. L'esponente di correzione allometrico (Altezza / 175)^0.35
 * normalizza equamente questo svantaggio meccanico senza penalizzare in modo discontinuo.
 *
 * PROGRESSIONE NON LINEARE (CURVA DI RESISTENZA AD ESPONENZIALE CRESCENTE):
 * Raggiungere l'Oro richiede un adattamento sostanziale; Platino e Diamante richiedono carichi
 * d'élite con rendimenti decrescenti (diminishing returns). Le soglie dei rank superiori sono
 * espanse con fattori esponenziali non lineari (1.08x per Silver, 1.20x per Gold, 1.35x per Platinum,
 * 1.55x per Diamond) e pesate sull'esperienza dell'atleta (UserProfile.experienceLevel).
 * Inoltre, per sbloccare i rank d'élite su un gruppo muscolare, è richiesta consistenza di volume.
 */

export interface RankConfig {
  level: RankLevel;
  label: string;
  colorHex: string;
  bgBadge: string;
  textColor: string;
  borderGlow: string;
  dotColor: string;
  pingColor: string;
}

export const RANK_METADATA: Record<RankLevel, RankConfig> = {
  bronze: {
    level: 'bronze',
    label: 'Bronzo',
    colorHex: '#92400e', // Marrone bronzo caldo
    bgBadge: 'bg-amber-950/80 border-amber-800 text-amber-300',
    textColor: 'text-amber-400',
    borderGlow: 'border-amber-600/70 shadow-[0_0_15px_rgba(180,83,9,0.4)]',
    dotColor: 'bg-amber-600',
    pingColor: 'bg-amber-500',
  },
  silver: {
    level: 'silver',
    label: 'Argento',
    colorHex: '#e2e8f0', // Bianco argentato metallico
    bgBadge: 'bg-slate-800 border-slate-400 text-slate-100',
    textColor: 'text-slate-200',
    borderGlow: 'border-slate-300 shadow-[0_0_18px_rgba(226,232,240,0.5)]',
    dotColor: 'bg-slate-300',
    pingColor: 'bg-slate-200',
  },
  gold: {
    level: 'gold',
    label: 'Oro',
    colorHex: '#eab308', // Oro lucido
    bgBadge: 'bg-yellow-950/80 border-yellow-500 text-yellow-300',
    textColor: 'text-yellow-400',
    borderGlow: 'border-yellow-400 shadow-[0_0_24px_rgba(234,179,8,0.6)]',
    dotColor: 'bg-yellow-400',
    pingColor: 'bg-yellow-300',
  },
  platinum: {
    level: 'platinum',
    label: 'Platino',
    colorHex: '#a5b4fc', // Platino etereo shimmer
    bgBadge: 'bg-indigo-950/80 border-indigo-300 text-indigo-100',
    textColor: 'text-indigo-200',
    borderGlow: 'border-indigo-300 shadow-[0_0_28px_rgba(165,180,252,0.7)] animate-pulse',
    dotColor: 'bg-indigo-400',
    pingColor: 'bg-indigo-300',
  },
  diamond: {
    level: 'diamond',
    label: 'Diamante',
    colorHex: '#38bdf8', // Azzurro diamante radiante
    bgBadge: 'bg-sky-950/90 border-sky-400 text-sky-200',
    textColor: 'text-sky-300',
    borderGlow: 'border-sky-300 shadow-[0_0_34px_rgba(56,189,248,0.85)] ring-1 ring-sky-300 animate-pulse',
    dotColor: 'bg-sky-400',
    pingColor: 'bg-sky-300',
  },
};

/**
 * Formula Epley per 1RM stimato: 1RM = Peso * (1 + Reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Calcola il fattore di normalizzazione allometrica (Forza Relativa)
 * Si ispira ai modelli allometrici di Jaric / Siff per eliminare le distorsioni lineari
 */
export function calculateAllometricRatio(profile: UserProfile): number {
  if (profile.rankingMode !== 'relative' || profile.bodyWeightKg <= 0) {
    return 1.0;
  }

  const weightKg = Math.max(40, Math.min(160, profile.bodyWeightKg));
  const heightCm = profile.heightCm && profile.heightCm >= 100 ? profile.heightCm : 175;

  // Esponente allometrico per area trasversa muscolare (2/3 ≈ 0.67)
  const massRatio = Math.pow(weightKg / 75, 0.67);

  // Esponente di leva meccanica per l'altezza (0.35)
  const heightRatio = Math.pow(heightCm / 175, 0.35);

  // Rapporto allometrico combinato e continuo
  const rawRatio = massRatio * heightRatio;

  // Bounded clamping per massima stabilità
  return Math.max(0.55, Math.min(1.7, Math.round(rawRatio * 1000) / 1000));
}

// Mappa indicizzata precalcolata O(1) per ID e nomi esatti
const exerciseExactMap = new Map<string, typeof EXERCISE_DATASET[0]>();
// Cache di lookup dinamica per query testuali frequenti O(1)
const exerciseLookupCache = new Map<string, typeof EXERCISE_DATASET[0] | null>();

function initExerciseIndex() {
  if (exerciseExactMap.size > 0) return;
  for (const def of EXERCISE_DATASET) {
    if (def.id) exerciseExactMap.set(def.id.toLowerCase(), def);
    if (def.name) exerciseExactMap.set(def.name.toLowerCase().trim(), def);
    if (def.italianName) exerciseExactMap.set(def.italianName.toLowerCase().trim(), def);
  }
}

/**
 * Ricerca O(1) con indice precalcolato e cache memoizzata per eliminare la scansione lineare su 1352 elementi.
 */
export function findExerciseDefinitionFast(exerciseName: string): typeof EXERCISE_DATASET[0] | undefined {
  if (!exerciseName) return undefined;
  initExerciseIndex();
  const query = exerciseName.toLowerCase().trim();

  // 1. Check cache memoizzata
  if (exerciseLookupCache.has(query)) {
    return exerciseLookupCache.get(query) || undefined;
  }

  // 2. Check indice esatto O(1)
  const exact = exerciseExactMap.get(query);
  if (exact) {
    exerciseLookupCache.set(query, exact);
    return exact;
  }

  // 3. Fallback ricerca parziale (eseguita una sola volta per stringa unica e poi memorizzata O(1))
  const found = EXERCISE_DATASET.find(
    (e) =>
      e.name.toLowerCase().includes(query) ||
      query.includes(e.italianName.toLowerCase()) ||
      e.italianName.toLowerCase().includes(query)
  );

  exerciseLookupCache.set(query, found || null);
  return found;
}

/**
 * Calcola il livello di rank per un determinato esercizio.
 * Applica curva di soglia non lineare esponenziale, allometric scaling e peso di esperienza.
 */
export function getExerciseRank(
  exerciseName: string,
  maxWeight: number,
  repsAtMax: number,
  profile: UserProfile,
  weightMode: WeightMode = 'total',
  exerciseObj?: { bodyweightPercentage?: number; equipment?: string }
): RankLevel {
  const def = findExerciseDefinitionFast(exerciseName);

  // Calcolo centralizzato del carico effettivo (gestisce 'total', 'per_side' * 2 e corpo libero %BW + eventuale zavorra)
  const effCalc = getEffectiveWeight(
    {
      name: exerciseName,
      weightMode,
      equipment: exerciseObj?.equipment || def?.equipment,
      bodyweightPercentage: exerciseObj?.bodyweightPercentage ?? def?.bodyweightPercentage,
    },
    maxWeight,
    profile
  );

  const effectiveWeight = effCalc !== null ? effCalc : (weightMode === 'per_side' ? maxWeight * 2 : maxWeight);
  const estimated1RM = calculate1RM(effectiveWeight, repsAtMax);

  if (estimated1RM <= 0) return 'bronze';

  // Benchmark standard se non trovato nel catalogo
  const bench = def?.standard1RMBenchmarkKg || {
    bronze: 30,
    silver: 50,
    gold: 75,
    platinum: 100,
    diamond: 125,
  };

  // Scaling relativo allometrico (o 1.0 per assoluto)
  const allometricRatio = calculateAllometricRatio(profile);

  // Esperienza atleta: standard più severo per profili avanzati
  const expMultiplier =
    profile.experienceLevel === 'advanced'
      ? 1.08
      : profile.experienceLevel === 'intermediate'
      ? 1.02
      : 0.96;

  // Curva esponenziale di resistenza tra i livelli (impedisce rank-up facili con incrementi minimi)
  // Bronze: base (ritornato di default sotto bSilver)
  // Silver: +8% resistenza aggiuntiva
  // Gold: +20% resistenza aggiuntiva (intermedio consolidato)
  // Platinum: +35% resistenza aggiuntiva (avanzato vero)
  // Diamond: +55% resistenza aggiuntiva (standard agonistico/élite)
  const bSilver = bench.silver * allometricRatio * 1.08 * expMultiplier;
  const bGold = bench.gold * allometricRatio * 1.20 * expMultiplier;
  const bPlatinum = bench.platinum * allometricRatio * 1.35 * expMultiplier;
  const bDiamond = bench.diamond * allometricRatio * 1.55 * expMultiplier;

  if (estimated1RM >= bDiamond) return 'diamond';
  if (estimated1RM >= bPlatinum) return 'platinum';
  if (estimated1RM >= bGold) return 'gold';
  if (estimated1RM >= bSilver) return 'silver';
  return 'bronze';
}

/**
 * Calcola i rank per tutti i gruppi muscolari aggregando l'intera routine.
 * Introduce il controllo di consistenza di volume: per accedere a Platino o Diamante
 * è richiesto un volume effettivo adeguato per quel gruppo muscolare.
 */
export function calculateMuscleRanks(
  routine: WorkoutRoutine,
  profile: UserProfile
): Record<MuscleZone, RankLevel> {
  const rankPriority: Record<RankLevel, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
  };

  const priorityToRank: Record<number, RankLevel> = {
    1: 'bronze',
    2: 'silver',
    3: 'gold',
    4: 'platinum',
    5: 'diamond',
  };

  interface MuscleData {
    bestScore: number;
    scores: number[];
    totalSets: number;
  }

  const muscleData: Record<MuscleZone, MuscleData> = {
    chest: { bestScore: 0, scores: [], totalSets: 0 },
    back: { bestScore: 0, scores: [], totalSets: 0 },
    shoulders: { bestScore: 0, scores: [], totalSets: 0 },
    biceps: { bestScore: 0, scores: [], totalSets: 0 },
    triceps: { bestScore: 0, scores: [], totalSets: 0 },
    abs: { bestScore: 0, scores: [], totalSets: 0 },
    quads: { bestScore: 0, scores: [], totalSets: 0 },
    hamstrings: { bestScore: 0, scores: [], totalSets: 0 },
    glutes: { bestScore: 0, scores: [], totalSets: 0 },
    calves: { bestScore: 0, scores: [], totalSets: 0 },
  };

  // Analizza tutti gli esercizi in tutte le giornate della scheda
  routine.days.forEach((day) => {
    day.exercises.forEach((ex) => {
      // Ignora completamente gli esercizi di riscaldamento generico/mobilità
      if (ex.category === 'warmup') return;

      let maxSetWeight = 0;
      let repsForMax = 8;
      let validSetsCount = 0;

      ex.sets.forEach((s) => {
        // Ignora serie di riscaldamento: non contano per volume, carichi o ranking
        if (s.setType === 'warmup') return;

        const eff = getEffectiveWeight(ex, s.weight, profile);
        if (eff !== null && eff > 0) {
          validSetsCount++;
          if (eff > maxSetWeight) {
            maxSetWeight = eff;
            repsForMax = s.reps || 8;
          }
        }
      });

      if (maxSetWeight > 0) {
        const rank = getExerciseRank(ex.name, maxSetWeight, repsForMax, profile, ex.weightMode, ex);
        const score = rankPriority[rank];

        const target = muscleData[ex.targetMuscle];
        if (target) {
          target.scores.push(score);
          target.totalSets += validSetsCount;
          if (score > target.bestScore) {
            target.bestScore = score;
          }
        }

        // Distribuzione parziale ai muscoli secondari (massimo -1.5 livelli, peso di supporto)
        ex.secondaryMuscles?.forEach((sec) => {
          const secTarget = muscleData[sec];
          if (secTarget) {
            const secScore = Math.max(1, score - 2);
            secTarget.scores.push(secScore);
            secTarget.totalSets += Math.ceil(validSetsCount * 0.5);
            if (secScore > secTarget.bestScore) {
              secTarget.bestScore = secScore;
            }
          }
        });
      }
    });
  });

  const finalRanks: Record<MuscleZone, RankLevel> = {} as Record<MuscleZone, RankLevel>;

  (Object.keys(muscleData) as MuscleZone[]).forEach((zone) => {
    const data = muscleData[zone];

    if (data.scores.length === 0 || data.bestScore === 0) {
      finalRanks[zone] = 'bronze';
      return;
    }

    // Calcolo composito: 70% peso del miglior esercizio + 30% media della routine per quel gruppo
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    let compositeScore = Math.round(data.bestScore * 0.7 + avgScore * 0.3);

    // REQUISITO DI CONSISTENZA DI VOLUME:
    // Per ottenere Platino (4) servono almeno 3 serie totali valide per quel distretto.
    // Per ottenere Diamante (5) servono almeno 5 serie totali valide per quel distretto.
    if (compositeScore >= 5 && data.totalSets < 5) {
      compositeScore = 4;
    }
    if (compositeScore >= 4 && data.totalSets < 3) {
      compositeScore = 3;
    }

    const clampedLevel = Math.max(1, Math.min(5, compositeScore));
    finalRanks[zone] = priorityToRank[clampedLevel] || 'bronze';
  });

  return finalRanks;
}

/**
 * Trigger celebrazione visiva con coriandoli calibrati, feedback audio armonico e vibrazione
 * Utilizzato esclusivamente per celebrare i traguardi di rank nella pagina Ranking.
 */
export function triggerRankCelebration(rank: RankLevel = 'gold', _exerciseOrMuscle: string = 'Allenamento') {
  // Coriandoli con palette specifica per ogni livello di rank
  const colorsMap: Record<RankLevel, string[]> = {
    diamond: ['#38bdf8', '#7dd3fc', '#ffffff', '#0284c7', '#bae6fd'],
    platinum: ['#a5b4fc', '#c7d2fe', '#ffffff', '#818cf8', '#e0e7ff'],
    gold: ['#eab308', '#fef08a', '#ca8a04', '#ffffff', '#fde047'],
    silver: ['#cbd5e1', '#e2e8f0', '#ffffff', '#94a3b8'],
    bronze: ['#d97706', '#b45309', '#fef3c7', '#92400e'],
  };
  const colors = colorsMap[rank] || colorsMap.gold;

  try {
    // Doppio scoppio coordinato a ventaglio (sinistra e destra) per un effetto scenico fluido
    confetti({
      particleCount: rank === 'diamond' ? 65 : 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.65 },
      colors,
      ticks: 200,
      gravity: 1.1,
      scalar: 0.9,
    });

    setTimeout(() => {
      confetti({
        particleCount: rank === 'diamond' ? 65 : 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.85, y: 0.65 },
        colors,
        ticks: 200,
        gravity: 1.1,
        scalar: 0.9,
      });
    }, 120);
  } catch {
    // safe fallback se canvas-confetti non è disponibile
  }

  // Sintetizzatore audio nativo Web Audio armonico e morbido
  playChimeSound(rank === 'diamond' ? 'high' : 'normal');

  // Vibrazione dispositivo aptica calibrata (delicata e ritmata)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([50, 40, 80]);
  }
}

/**
 * Sintetizzatore sonoro Web Audio API per timer di recupero e rank up
 */
export function playChimeSound(type: 'high' | 'normal' | 'timer') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'timer') {
      // Tre bip ritmici
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      // Arpeggio dorato
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type === 'high' ? 659.25 : 523.25, ctx.currentTime); // E5 or C5
      osc.frequency.exponentialRampToValueAtTime(type === 'high' ? 1046.5 : 783.99, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch {
    // Audio contexts might be blocked until user gesture, safely ignore
  }
}
