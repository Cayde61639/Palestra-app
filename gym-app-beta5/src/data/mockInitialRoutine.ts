import { ProgressionLog, UserProfile, WorkoutRoutine } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  bodyWeightKg: 75,
  heightCm: 175,
  unit: 'kg',
  experienceLevel: 'intermediate',
  rankingMode: 'relative', // Forza relativa di default (calibrata su peso corporeo e altezza)
  goal: 'hypertrophy',
  volumeMetric: 'tonnage', // Default tonnellaggio (kg totali sollevati)
};

export const INITIAL_ROUTINE: WorkoutRoutine = {
  id: 'routine-user',
  name: 'La Mia Scheda',
  currentCycle: 'Ipertrofia & Progressione',
  isDeloadWeek: false,
  deloadType: 'mixed',
  lastUpdated: new Date().toISOString(),
  days: [
    {
      id: 'day-a',
      name: 'Giorno A - Spinta (Petto, Spalle & Tricipiti)',
      focusMuscles: ['chest', 'shoulders', 'triceps'],
      isNameCustom: false,
      exercises: [
        {
          id: 'ex-bench-press',
          name: 'Panca Piana con Bilanciere',
          targetMuscle: 'chest',
          secondaryMuscles: ['triceps', 'shoulders'],
          weightMode: 'total',
          equipment: 'barbell',
          restTimeSeconds: 150,
          sets: [
            { id: 's1', setNumber: 1, reps: 8, weight: 60, completed: false },
            { id: 's2', setNumber: 2, reps: 8, weight: 60, completed: false },
            { id: 's3', setNumber: 3, reps: 8, weight: 60, completed: false },
            { id: 's4', setNumber: 4, reps: 8, weight: 60, completed: false },
          ],
        },
        {
          id: 'ex-incline-db',
          name: 'Panca Inclinata con Manubri',
          targetMuscle: 'chest',
          secondaryMuscles: ['shoulders', 'triceps'],
          weightMode: 'per_side',
          equipment: 'dumbbell',
          restTimeSeconds: 120,
          sets: [
            { id: 's5', setNumber: 1, reps: 10, weight: 22, completed: false },
            { id: 's6', setNumber: 2, reps: 10, weight: 22, completed: false },
            { id: 's7', setNumber: 3, reps: 10, weight: 22, completed: false },
          ],
        },
        {
          id: 'ex-lateral-raises',
          name: 'Alzate Laterali con Manubri',
          targetMuscle: 'shoulders',
          weightMode: 'per_side',
          equipment: 'dumbbell',
          restTimeSeconds: 60,
          sets: [
            { id: 's8', setNumber: 1, reps: 12, weight: 10, completed: false },
            { id: 's9', setNumber: 2, reps: 12, weight: 10, completed: false },
            { id: 's10', setNumber: 3, reps: 12, weight: 10, completed: false },
          ],
        },
        {
          id: 'ex-pushdown',
          name: 'Pushdown Tricipiti ai Cavi (Corda/Sbarra)',
          targetMuscle: 'triceps',
          weightMode: 'total',
          equipment: 'cable',
          restTimeSeconds: 60,
          sets: [
            { id: 's11', setNumber: 1, reps: 12, weight: 35, completed: false },
            { id: 's12', setNumber: 2, reps: 12, weight: 35, completed: false },
            { id: 's13', setNumber: 3, reps: 12, weight: 35, completed: false },
          ],
        },
      ],
    },
  ],
};

export const INITIAL_PROGRESSION_HISTORY: ProgressionLog[] = [];
