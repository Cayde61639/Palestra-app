import React from 'react';
import { MuscleZone, Exercise, UserProfile, RankLevel } from '../types';
import { MUSCLE_LABELS } from '../data/exerciseDataset';
import { RANK_METADATA, findExerciseDefinitionFast } from '../utils/ranking';
import { X, Activity, AlertTriangle, Lightbulb, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';
import { getDynamicNameSizeClass } from '../utils/textSizing';

interface MuscleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  muscle: MuscleZone;
  exercise: Exercise;
  currentRank: RankLevel;
  estimated1RM: number;
  profile: UserProfile;
}

const MUSCLE_ANATOMY_DETAILS: Record<
  MuscleZone,
  {
    scientificName: string;
    description: string;
    function: string;
    recoveryTime: string;
  }
> = {
  chest: {
    scientificName: 'Pectoralis Major & Minor',
    description:
      'Il gran pettorale è composto da fascio clavicolare (alto), sterno-costale (medio) e addominale (basso). Il piccolo pettorale stabilizza la scapola.',
    function: 'Adduzione, flessione e rotazione interna dell’omero sul piano orizzontale.',
    recoveryTime: '48 - 72 ore tra sessioni pesanti',
  },
  back: {
    scientificName: 'Latissimus Dorsi, Trapezius & Rhomboids',
    description:
      'Comprende gran dorsale (larghezza a "V"), trapezio superiore, medio e inferiore (spessore), romboidi ed erettori spinali.',
    function: 'Estensione, adduzione orizzontale e retrazione/depressione delle scapole.',
    recoveryTime: '48 - 72 ore tra sessioni ad alto volume',
  },
  shoulders: {
    scientificName: 'Deltoid (Anterior, Lateral, Posterior)',
    description:
      'Struttura a 3 capi: deltoide anteriore (spinta), laterale (ampiezza clavicolare) e posteriore (salute posturale e spessore).',
    function: 'Abduzione fino a 90°, flessione, estensione e rotazione dell’omero.',
    recoveryTime: '48 ore (recupero rapido ma delicata cuffia rotatori)',
  },
  biceps: {
    scientificName: 'Biceps Brachii & Brachialis',
    description:
      'Capo lungo (picco esterno) e capo breve (ampiezza interna), supportati dal muscolo brachiale sottostante per la densità del braccio.',
    function: 'Flessione del gomito e principale supinatore dell’avambraccio.',
    recoveryTime: '48 ore',
  },
  triceps: {
    scientificName: 'Triceps Brachii (Lateral, Long, Medial Head)',
    description:
      'Costituisce circa il 60% del volume totale del braccio. Il capo lungo richiede estensione sopra la testa per massimo stiramento.',
    function: 'Estensione completa dell’articolazione del gomito e adduzione dell’omero.',
    recoveryTime: '48 - 72 ore',
  },
  quads: {
    scientificName: 'Quadriceps Femoris (Rectus, Vasti)',
    description:
      'Vasto mediale (goccia sopra il ginocchio), vasto laterale, vasto intermedio e retto femorale bi-articolare.',
    function: 'Estensione del ginocchio e flessione dell’anca (retto femorale).',
    recoveryTime: '72 ore per carichi massimali e squat profondo',
  },
  hamstrings: {
    scientificName: 'Hamstrings (Biceps Femoris, Semi-T/M)',
    description:
      'Bicipite femorale (capo lungo e breve), semitendinoso e semimembranoso nella loggia posteriore della coscia.',
    function: 'Flessione della gamba sul ginocchio ed estensione potente dell’anca.',
    recoveryTime: '48 - 72 ore (vulnerabili se non allungati regolarmente)',
  },
  glutes: {
    scientificName: 'Gluteus Maximus, Medius & Minimus',
    description:
      'Il grande gluteo è il muscolo più forte e voluminoso del corpo umano. Il medio e piccolo gluteo garantiscono stabilità pelvica.',
    function: 'Estensione dell’anca, rotazione esterna e abduzione della coscia.',
    recoveryTime: '48 - 72 ore',
  },
  calves: {
    scientificName: 'Gastrocnemius & Soleus',
    description:
      'Gastrocnemio (gemelli visibili, fibre veloci) e soleo profondo (fibre lente a ginocchio flesso).',
    function: 'Flessione plantare della caviglia e spinta propulsiva nel cammino e salto.',
    recoveryTime: '24 - 48 ore (alta tolleranza al volume)',
  },
  abs: {
    scientificName: 'Rectus Abdominis, Obliques & Core',
    description:
      'Retto addominale ("six pack"), obliqui interni ed esterni, e trasverso dell’addome (cintura naturale stabilizzatrice).',
    function: 'Flessione del rachide, anti-estensione, anti-rotazione e pressione intra-addominale.',
    recoveryTime: '24 - 48 ore',
  },
};

export const MuscleDetailModal: React.FC<MuscleDetailModalProps> = ({
  isOpen,
  onClose,
  muscle,
  exercise,
  currentRank,
  estimated1RM,
  profile,
}) => {
  if (!isOpen) return null;

  const anatomy = MUSCLE_ANATOMY_DETAILS[muscle] || {
    scientificName: MUSCLE_LABELS[muscle],
    description: 'Gruppo muscolare target del movimento.',
    function: 'Contrazione e stabilizzazione articolare.',
    recoveryTime: '48 ore',
  };

  // Find exercise definition tips if available via fast O(1) indexed lookup
  const def = findExerciseDefinitionFast(exercise.name);

  const rankMeta = RANK_METADATA[currentRank];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={MOTION_PRESETS.modalSpring}
        className={`bg-slate-900/95 border border-white/[0.18] ${UI_RADII.modal} w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.3)] backdrop-blur-3xl overflow-hidden relative max-h-[88vh] flex flex-col`}
      >
        {/* Specular Refraction Top Border */}
        <div className={SPECULAR_HIGHLIGHT} />

        {/* Header */}
        <div className="p-5 px-6 border-b border-white/10 flex items-center justify-between relative z-10 shrink-0">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
              Anatomia & Biomeccanica
            </span>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{MUSCLE_LABELS[muscle]}</span>
              <span className="text-xs font-semibold text-slate-400">
                ({anatomy.scientificName})
              </span>
            </h3>
          </div>
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto no-scrollbar relative z-10 text-xs">
          {/* Active Exercise Context Badge */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Esercizio in esecuzione
              </span>
              <span className={`${getDynamicNameSizeClass(exercise.name, 'modal')} font-extrabold text-white break-words block leading-snug transition-[font-size,line-height] duration-200`}>
                {exercise.name}
              </span>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${rankMeta.dotColor} shadow-[0_0_8px_currentColor] animate-pulse`}
                />
                <span className={`text-xs font-black ${rankMeta.textColor}`}>
                  {rankMeta.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                1RM ~{estimated1RM} {profile.unit}
              </span>
            </div>
          </div>

          {/* Muscle Anatomy & Function Card */}
          <div className={`p-4 ${UI_RADII.card} bg-white/[0.03] border border-white/10 space-y-2`}>
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Funzione Motoria Principale</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">{anatomy.description}</p>
            <div className="pt-1.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 font-bold block">Azione Biomeccanica:</span>
                <span className="text-slate-200 font-medium">{anatomy.function}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Finestra di Recupero:</span>
                <span className="text-sky-300 font-bold">{anatomy.recoveryTime}</span>
              </div>
            </div>
          </div>

          {/* Exercise Specific Tips & Mistakes */}
          {def && (
            <div className="space-y-3">
              {def.tips && def.tips.length > 0 && (
                <div className={`p-4 ${UI_RADII.card} bg-emerald-500/[0.07] border border-emerald-500/20 space-y-2`}>
                  <h4 className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Consigli di Esecuzione & Focus Mentale</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {def.tips.map((tip, idx) => (
                      <li key={idx} className="leading-normal">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {def.commonMistakes && def.commonMistakes.length > 0 && (
                <div className={`p-4 ${UI_RADII.card} bg-rose-500/[0.07] border border-rose-500/20 space-y-2`}>
                  <h4 className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Errori Comuni da Evitare</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {def.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="leading-normal">
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Benchmark Table for this Exercise */}
          {def?.standard1RMBenchmarkKg && (
            <div className={`p-4 ${UI_RADII.card} bg-white/[0.03] border border-white/10 space-y-2`}>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Benchmark 1RM ({profile.unit})</span>
              </h4>
              <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as RankLevel[]).map((lvl) => {
                  const m = RANK_METADATA[lvl];
                  const benchKg = def.standard1RMBenchmarkKg[lvl];
                  const displayWeight = profile.unit === 'lb' ? Math.round(benchKg * 2.2) : benchKg;
                  const isCurrent = currentRank === lvl;

                  return (
                    <div
                      key={lvl}
                      className={`p-2 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-sky-500/20 border-sky-400 shadow-md shadow-sky-500/20 scale-105'
                          : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mx-auto mb-1 block ${m.dotColor}`}
                      />
                      <span className="text-[10px] font-bold block text-slate-300 capitalize">
                        {m.label}
                      </span>
                      <span className="text-xs font-black text-white block mt-0.5">
                        {displayWeight}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] text-sky-400 font-extrabold block mt-0.5">
                          Tuo
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/30 backdrop-blur-2xl flex items-center justify-end relative z-10">
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={onClose}
            className={`px-6 py-2.5 ${UI_RADII.card} bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15 transition-all shadow-sm`}
          >
            Chiudi
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
