import { Exercise } from '../types';

export interface ExerciseGroupItem {
  id: string;
  isSuperset: boolean;
  supersetGroupId?: string;
  exercises: Exercise[];
}

/**
 * Raggruppa gli esercizi consecutivi che appartengono allo stesso gruppo superset (stesso supersetGroupId).
 * Gli esercizi singoli formano un gruppo con isSuperset: false.
 */
export function groupExercisesBySuperset(exercises: Exercise[]): ExerciseGroupItem[] {
  const groups: ExerciseGroupItem[] = [];

  for (const ex of exercises) {
    if (ex.supersetGroupId) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.isSuperset && lastGroup.supersetGroupId === ex.supersetGroupId) {
        lastGroup.exercises.push(ex);
        continue;
      }
      groups.push({
        id: ex.supersetGroupId,
        isSuperset: true,
        supersetGroupId: ex.supersetGroupId,
        exercises: [ex],
      });
    } else {
      groups.push({
        id: ex.id,
        isSuperset: false,
        exercises: [ex],
      });
    }
  }

  return groups;
}

/**
 * Pulisce eventuali superset orfani (con meno di 2 esercizi)
 */
export function sanitizeExercisesSupersets(exercises: Exercise[]): Exercise[] {
  const counts: Record<string, number> = {};
  exercises.forEach((e) => {
    if (e.supersetGroupId) {
      counts[e.supersetGroupId] = (counts[e.supersetGroupId] || 0) + 1;
    }
  });

  return exercises.map((e) => {
    if (e.supersetGroupId && counts[e.supersetGroupId] < 2) {
      return { ...e, supersetGroupId: undefined, isSuperset: false };
    }
    return { ...e, isSuperset: !!e.supersetGroupId };
  });
}
