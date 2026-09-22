import { DeloadType } from '../types';

export interface DeloadOptionConfig {
  id: DeloadType;
  name: string;
  volumeReduction: string;
  intensityReduction: string;
  volumeBadge: string;
  intensityBadge: string;
  whenToUse: string;
  shortDescription: string;
  weightMultiplier: number;
  repsMultiplier: number;
}

export const DELOAD_OPTIONS: DeloadOptionConfig[] = [
  {
    id: 'volume',
    name: 'Scarico di Volume',
    volumeReduction: 'Ridotto del 40-50%',
    intensityReduction: 'Invariato (o -5%)',
    volumeBadge: 'Volume -40/50%',
    intensityBadge: 'Carico Invariato',
    whenToUse:
      'Ideale per mantenere la forza massimale facendo riposare le articolazioni.',
    shortDescription:
      'Serie e ripetizioni quasi dimezzate per far rifiatare tendini e legamenti mantenendo i carichi alti.',
    weightMultiplier: 1.0,
    repsMultiplier: 0.55,
  },
  {
    id: 'intensity',
    name: 'Scarico di Intensità',
    volumeReduction: 'Invariato',
    intensityReduction: 'Ridotto del 15-20%',
    volumeBadge: 'Volume Invariato',
    intensityBadge: 'Carico -15/20%',
    whenToUse:
      'Perfetto per recuperare a livello neuronale e mentale se ti senti svuotato.',
    shortDescription:
      'Pesi più leggeri con le stesse serie e ripetizioni per rigenerare il sistema nervoso e la mente.',
    weightMultiplier: 0.825,
    repsMultiplier: 1.0,
  },
  {
    id: 'mixed',
    name: 'Scarico Misto (Completo)',
    volumeReduction: 'Ridotto del 30-40%',
    intensityReduction: 'Ridotto del 15-20%',
    volumeBadge: 'Volume -30/40%',
    intensityBadge: 'Carico -15/20%',
    whenToUse:
      'Il più sicuro. Si usa dopo cicli molto intensi (es. powerlifting o ipertrofia spinta).',
    shortDescription:
      'Taglio bilanciato sia di peso che di volume per un recupero globale e sicuro prima del prossimo ciclo.',
    weightMultiplier: 0.825,
    repsMultiplier: 0.65,
  },
];

/**
 * Calcola i carichi e le ripetizioni consigliati in base al tipo di Deload scelto
 */
export function calculateDeloadValues(
  weight: number,
  reps: number,
  type: DeloadType | string = 'mixed'
): { deloadWeight: number; deloadReps: number; config: DeloadOptionConfig } {
  const config =
    DELOAD_OPTIONS.find((o) => o.id === type) || DELOAD_OPTIONS[2];

  let deloadWeight = weight;
  if (config.weightMultiplier < 1.0 && weight > 0) {
    deloadWeight = Math.round(weight * config.weightMultiplier * 2) / 2;
  }

  let deloadReps = reps;
  if (config.repsMultiplier < 1.0) {
    deloadReps = Math.max(1, Math.round(reps * config.repsMultiplier));
  }

  return { deloadWeight, deloadReps, config };
}
