export type RankLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type WeightMode = 'total' | 'per_side' | 'bodyweight'; // Totale (bilanciere) vs Per Lato (manubri) vs Corpo Libero

export type VolumeMetric = 'tonnage' | 'effective_sets'; // Tonnellaggio (kg/lb sollevati) vs Serie Efficaci (serie da lavoro)

export type MuscleZone =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | (string & {});

export type DeloadType = 'volume' | 'intensity' | 'mixed';

export type SetType = 'working' | 'warmup';

export type ExerciseCategory = 'strength' | 'warmup';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number; // in kg or lb
  completed?: boolean;
  rpe?: number;
  setType?: SetType; // 'working' | 'warmup', default 'working'
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleZone;
  secondaryMuscles?: MuscleZone[];
  weightMode: WeightMode;
  bodyweightPercentage?: number; // % del peso corporeo sollevata (0-100) per calcolo del carico effettivo
  sets: ExerciseSet[];
  restTimeSeconds: number; // Suggested or custom
  warmupRestTimeSeconds?: number; // Tempo di recupero specifico per serie di riscaldamento (default 30s)
  notes?: string;
  isSuperset?: boolean;
  supersetGroupId?: string;
  variations?: string[];
  equipment?: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
  category?: ExerciseCategory; // 'strength' (standard) vs 'warmup' (riscaldamento/mobilità a corpo libero)
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "Giorno A - Spinte (Petto & Tricipiti)"
  focusMuscles: MuscleZone[];
  exercises: Exercise[];
  isNameCustom?: boolean;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  days: WorkoutDay[];
  currentCycle: string; // e.g. "Mesociclo Ipertrofia"
  isDeloadWeek: boolean;
  deloadType?: DeloadType;
  lastUpdated: string;
}

export interface UserProfile {
  name: string;
  bodyWeightKg: number;
  heightCm: number;
  unit: 'kg' | 'lb';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  rankingMode: 'absolute' | 'relative'; // Calcolo rank per forza assoluta vs peso corporeo e altezza
  goal: 'hypertrophy' | 'strength' | 'endurance' | 'fat_loss';
  volumeMetric: VolumeMetric; // 'tonnage' (kg totali sollevati) | 'effective_sets' (serie di lavoro)
}

export interface LoggedSetRecord {
  setNumber: number;
  weight: number;
  reps: number;
  completed?: boolean;
  setType?: SetType;
}

export interface ProgressionLog {
  id: string;
  date: string;
  exerciseName: string;
  targetMuscle: MuscleZone;
  maxWeight: number;
  estimated1RM: number;
  totalVolume: number; // sum of reps * weight
  repsAtMax: number;
  performedSets?: LoggedSetRecord[];
  isPR?: boolean;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  italianName: string;
  muscle: MuscleZone;
  secondaryMuscles: MuscleZone[];
  defaultWeightMode: WeightMode;
  defaultRestSec: number;
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
  bodyweightPercentage?: number; // % del peso corporeo sollevata (0-100) per calcolo del carico effettivo
  standard1RMBenchmarkKg: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  tips: string[];
  commonMistakes: string[];
  videoThumbnail?: string;
  isCustom?: boolean;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  category?: ExerciseCategory; // 'strength' (default) | 'warmup'
}

export type WorkoutSortCriterion =
  | 'biomechanic'
  | 'muscle_group'
  | 'push_pull_legs'
  | 'heavy_to_light'
  | 'alphabetical';
