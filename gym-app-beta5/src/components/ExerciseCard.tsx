import React, { useState } from 'react';
import { Exercise, ExerciseSet, UserProfile, WeightMode, DeloadType } from '../types';
import { calculate1RM, getExerciseRank, RANK_METADATA } from '../utils/ranking';
import { getEffectiveWeight } from '../utils/volume';
import { MUSCLE_LABELS } from '../data/exerciseDataset';
import { calculateDeloadValues, DELOAD_OPTIONS } from '../data/deloadOptions';
import { calculateWarmupRampWeight, calculateWarmupRampReps } from '../utils/warmup';
import {
  Play,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Link,
  Unlink,
  Zap,
  MessageSquare,
  Repeat,
  Scale,
  Info,
  Flame,
  X,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MuscleDetailModal } from './MuscleDetailModal';
import { NumericInput } from './NumericInput';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';
import { getDynamicNameSizeClass, getDynamicLineClampClass } from '../utils/textSizing';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  totalExercises: number;
  profile: UserProfile;
  isDeload?: boolean;
  deloadType?: DeloadType;
  isInsideSupersetGroup?: boolean;
  isLastInSupersetGroup?: boolean;
  onUpdateExercise: (updated: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onStartRestTimer: (seconds: number, exerciseName: string) => void;
  onToggleSuperset: (exerciseId: string) => void;
  onUnlinkSuperset?: (exerciseId: string) => void;
}

export const ExerciseCard = React.memo<ExerciseCardProps>(({
  exercise,
  index,
  totalExercises,
  profile,
  isDeload = false,
  deloadType = 'mixed',
  isInsideSupersetGroup = false,
  isLastInSupersetGroup = false,
  onUpdateExercise,
  onDeleteExercise,
  onMoveUp,
  onMoveDown,
  onStartRestTimer,
  onToggleSuperset,
  onUnlinkSuperset,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showMuscleModal, setShowMuscleModal] = useState(false);

  const isWarmupCategory = exercise.category === 'warmup';

  const currentDeloadConfig =
    DELOAD_OPTIONS.find((o) => o.id === deloadType) || DELOAD_OPTIONS[2];

  // Separa le serie di riscaldamento da quelle da lavoro
  const workingSets = exercise.sets.filter((s) => s.setType !== 'warmup');
  const warmupSets = exercise.sets.filter((s) => s.setType === 'warmup');

  // Trova il carico massimo impostato solo sulle serie da lavoro per il calcolo del rank
  let maxWeight = 0;
  let repsForMax = 8;
  workingSets.forEach((s) => {
    if (s.weight > maxWeight) {
      maxWeight = s.weight;
      repsForMax = s.reps || 8;
    }
  });

  const effectiveWeight = getEffectiveWeight(exercise, maxWeight, profile);
  const estimated1RM = effectiveWeight !== null ? calculate1RM(effectiveWeight, repsForMax) : 0;
  const currentRank = getExerciseRank(
    exercise.name,
    maxWeight,
    repsForMax,
    profile,
    exercise.weightMode,
    exercise
  );
  const rankMeta = RANK_METADATA[currentRank];

  // Gestione aggiunta serie di lavoro / mobilità
  const handleAddSet = () => {
    const lastWorkingSet =
      workingSets[workingSets.length - 1] || exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: `set-${Date.now()}-${exercise.sets.length}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: exercise.sets.length + 1,
      reps: isWarmupCategory ? (lastWorkingSet ? lastWorkingSet.reps : 12) : (lastWorkingSet ? lastWorkingSet.reps : 10),
      weight: isWarmupCategory ? 0 : (lastWorkingSet ? lastWorkingSet.weight : 20),
      completed: false,
      setType: 'working',
    };
    onUpdateExercise({
      ...exercise,
      sets: [...exercise.sets, newSet].map((s, idx) => ({ ...s, setNumber: idx + 1 })),
    });
  };

  // Gestione aggiunta serie di riscaldamento a rampa progressiva
  const handleAddWarmupSet = () => {
    const warmupIndex = warmupSets.length;
    const totalWarmupsTarget = warmupIndex + 1;

    const suggestedWeight = calculateWarmupRampWeight(
      maxWeight,
      warmupIndex,
      totalWarmupsTarget,
      exercise.weightMode,
      exercise.equipment
    );

    const baseWorkingReps = workingSets[0]?.reps || 10;
    const suggestedReps = calculateWarmupRampReps(baseWorkingReps, warmupIndex);

    const newWarmupSet: ExerciseSet = {
      id: `set-warmup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: 1,
      reps: suggestedReps,
      weight: suggestedWeight,
      completed: false,
      setType: 'warmup',
    };

    // Inserisci le serie di riscaldamento all'inizio, prima delle serie di lavoro
    const allWarmups = [...warmupSets, newWarmupSet];
    const reindexedSets = [...allWarmups, ...workingSets].map((s, idx) => ({
      ...s,
      setNumber: idx + 1,
    }));

    onUpdateExercise({
      ...exercise,
      sets: reindexedSets,
      warmupRestTimeSeconds: exercise.warmupRestTimeSeconds ?? 30,
    });
  };

  const handleRemoveSet = (setId: string) => {
    if (exercise.sets.length <= 1) return;
    const filtered = exercise.sets
      .filter((s) => s.id !== setId)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    onUpdateExercise({
      ...exercise,
      sets: filtered,
    });
  };

  const handleUpdateSet = (setId: string, field: 'weight' | 'reps' | 'completed', value: any) => {
    const updated = exercise.sets.map((s) => {
      if (s.id === setId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onUpdateExercise({
      ...exercise,
      sets: updated,
    });
  };

  const handleToggleSetCompleted = (set: ExerciseSet) => {
    const newStatus = !set.completed;
    handleUpdateSet(set.id, 'completed', newStatus);
    if (!newStatus) return;

    if (isWarmupCategory) {
      if (exercise.restTimeSeconds > 0) {
        onStartRestTimer(exercise.restTimeSeconds, `${exercise.name} (Mobilità)`);
      }
    } else if (set.setType === 'warmup') {
      const warmupRest = exercise.warmupRestTimeSeconds ?? 30;
      if (warmupRest > 0) {
        onStartRestTimer(warmupRest, `${exercise.name} (Riscaldamento)`);
      }
    } else {
      if (exercise.restTimeSeconds > 0) {
        onStartRestTimer(exercise.restTimeSeconds, exercise.name);
      }
    }
  };

  const toggleWeightMode = () => {
    const cycle: WeightMode[] =
      exercise.equipment === 'bodyweight' || exercise.weightMode === 'bodyweight'
        ? ['bodyweight', 'total', 'per_side']
        : ['total', 'per_side', 'bodyweight'];
    const currentIndex = cycle.indexOf(exercise.weightMode);
    const nextMode: WeightMode = cycle[(currentIndex + 1) % cycle.length];
    onUpdateExercise({
      ...exercise,
      weightMode: nextMode,
    });
  };

  const handleRestChange = (newSec: number) => {
    onUpdateExercise({
      ...exercise,
      restTimeSeconds: Math.max(0, newSec),
    });
  };

  const handleWarmupRestChange = (newSec: number) => {
    onUpdateExercise({
      ...exercise,
      warmupRestTimeSeconds: Math.max(10, newSec),
    });
  };

  // Funzione per applicare i carichi di deload calcolati
  const applyDeloadToSet = (setId: string, deloadW: number, deloadR: number) => {
    const updated = exercise.sets.map((s) => {
      if (s.id === setId) {
        return { ...s, weight: deloadW, reps: deloadR };
      }
      return s;
    });
    onUpdateExercise({
      ...exercise,
      sets: updated,
    });
  };

  return (
    <>
      {/* Animated Box Container */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        whileHover={isInsideSupersetGroup ? undefined : MOTION_PRESETS.cardHover}
        transition={MOTION_PRESETS.snappySpring}
        className={
          isInsideSupersetGroup
            ? 'relative p-3.5 sm:p-5 transition-colors'
            : `relative ${UI_RADII.card} p-3.5 sm:p-5 transition-colors backdrop-blur-xl border ${
                exercise.isSuperset
                  ? 'bg-gradient-to-br from-indigo-950/40 via-white/[0.06] to-sky-950/30 border-indigo-500/40 shadow-sm'
                  : isDeload
                  ? 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-500/40 shadow-sm'
                  : isWarmupCategory
                  ? 'bg-gradient-to-br from-amber-950/20 via-white/[0.04] to-orange-950/15 border-amber-500/30 hover:border-amber-400/50 shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-white/20 shadow-sm'
              }`
        }
      >
        {/* Specular Light Refraction Border Highlight */}
        {!isInsideSupersetGroup && (
          <div className={SPECULAR_HIGHLIGHT} />
        )}

        {/* Superset indicator bar for standalone cards */}
        {!isInsideSupersetGroup && exercise.isSuperset && (
          <div className={`absolute -top-3 left-6 bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-[10px] font-extrabold px-3 py-0.5 ${UI_RADII.pill} uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-500/30 backdrop-blur-md`}>
            <Link className="w-3 h-3" />
            <span>Superset (Recupero Zero Intermedio)</span>
          </div>
        )}

        {/* Deload Active banner indicator if in Deload week */}
        {isDeload && !isWarmupCategory && (
          <div className="mb-2.5 flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="break-words line-clamp-1">{currentDeloadConfig.name}</span>
            </div>
            <span className="text-[10px] text-amber-300/80 uppercase tracking-wider font-extrabold shrink-0">
              Deload
            </span>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {/* Muscle Zone badge */}
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.buttonHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={() => setShowMuscleModal(true)}
                className={`text-[10px] font-extrabold px-3 py-1 ${UI_RADII.pill} bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 backdrop-blur-md transition-all flex items-center gap-1 shadow-sm`}
                title="Tocca per vedere la descrizione biomeccanica del muscolo"
              >
                <span>{MUSCLE_LABELS[exercise.targetMuscle]}</span>
                <Info className="w-3 h-3 text-sky-300 opacity-70" />
              </motion.button>

              {/* Se esercizio di riscaldamento generico: Badge dedicato */}
              {isWarmupCategory ? (
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-sm">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Mobilità & Riscaldamento</span>
                </span>
              ) : (
                <>
                  {/* Strength Rank Dot / Pallio con colore e animazione */}
                  <motion.div
                    whileHover={MOTION_PRESETS.iconHover}
                    whileTap={MOTION_PRESETS.buttonTap}
                    onClick={() => setShowMuscleModal(true)}
                    className="inline-flex items-center gap-1.5 cursor-pointer p-1"
                    title={`Livello di Forza: ${rankMeta.label} (1RM stimato ~${estimated1RM} ${profile.unit}) - Tocca per dettagli`}
                  >
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${rankMeta.pingColor}`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${rankMeta.dotColor} shadow-[0_0_8px_currentColor]`}
                      />
                    </span>
                    <span className={`text-[10px] font-black ${rankMeta.textColor}`}>
                      {rankMeta.label}
                    </span>
                  </motion.div>

                  {/* Weight Mode Switch Button */}
                  <motion.button
                    type="button"
                    whileHover={MOTION_PRESETS.buttonHover}
                    whileTap={MOTION_PRESETS.buttonTap}
                    onClick={toggleWeightMode}
                    className={`text-[10px] font-bold px-2.5 py-0.5 ${UI_RADII.pill} border transition-all flex items-center gap-1 backdrop-blur-md ${
                      exercise.weightMode === 'per_side'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : exercise.weightMode === 'bodyweight'
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                        : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
                    }`}
                    title="Alterna tra Carico Totale, Per Lato (x2) e Corpo Libero"
                  >
                    <Scale className="w-3 h-3" />
                    <span>
                      {exercise.weightMode === 'per_side'
                        ? 'Per Lato (x2)'
                        : exercise.weightMode === 'bodyweight'
                        ? `Corpo Libero (${exercise.bodyweightPercentage || 65}% BW)`
                        : 'Carico Totale'}
                    </span>
                  </motion.button>
                </>
              )}
            </div>

            <h3
              className={`${getDynamicNameSizeClass(exercise.name)} ${getDynamicLineClampClass(exercise.name)} font-extrabold text-white tracking-tight break-words leading-snug transition-[font-size,line-height] duration-200`}
              title={exercise.name}
            >
              {exercise.name}
            </h3>
          </div>

          {/* Action icons (Move up/down, Delete) */}
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            {!isInsideSupersetGroup && (
              <>
                <motion.button
                  type="button"
                  whileHover={MOTION_PRESETS.iconHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  disabled={index === 0}
                  onClick={() => onMoveUp(index)}
                  className={`p-1.5 ${UI_RADII.control} hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors`}
                  title="Sposta su"
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={MOTION_PRESETS.iconHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  disabled={index === totalExercises - 1}
                  onClick={() => onMoveDown(index)}
                  className={`p-1.5 ${UI_RADII.control} hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors`}
                  title="Sposta giù"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              </>
            )}
            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.iconHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={() => onDeleteExercise(exercise.id)}
              className={`p-1.5 ${UI_RADII.control} hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-0.5`}
              title="Elimina esercizio"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Sets Table */}
        <div className="overflow-x-auto mb-3 py-1 -my-1 no-scrollbar">
          <table className="w-full text-left text-[11px] sm:text-xs min-w-[290px] sm:min-w-full">
            <thead>
              <tr className="text-slate-400 border-b border-white/10 pb-1.5">
                <th className="font-semibold py-1.5 w-10 sm:w-12 text-center">Serie</th>
                {!isWarmupCategory && (
                  <th className="font-semibold py-1.5 px-1.5 sm:px-2">
                    Carico ({profile.unit}){' '}
                    {exercise.weightMode === 'per_side'
                      ? 'x2'
                      : exercise.weightMode === 'bodyweight'
                      ? '(+zav)'
                      : ''}
                  </th>
                )}
                <th className="font-semibold py-1.5 px-1.5 sm:px-2">Ripetizioni</th>
                {!isWarmupCategory && isDeload && (
                  <th className="font-semibold py-1.5 px-1.5 sm:px-2 text-amber-300">
                    Consigli Deload
                  </th>
                )}
                <th className="font-semibold py-1.5 w-14 sm:w-16 text-center">Fatta</th>
                <th className="font-semibold py-1.5 w-7 sm:w-8 pr-1.5 sm:pr-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {exercise.sets.map((set, sIdx) => {
                const isWarmupSet = set.setType === 'warmup';
                const warmupIdx = isWarmupSet
                  ? warmupSets.findIndex((s) => s.id === set.id)
                  : -1;
                const workingIdx = !isWarmupSet
                  ? workingSets.findIndex((s) => s.id === set.id)
                  : -1;

                // Calcolo Deload consigliato per ogni serie
                const { deloadWeight, deloadReps } = calculateDeloadValues(
                  set.weight,
                  set.reps,
                  deloadType
                );

                return (
                  <tr
                    key={set.id}
                    className={`transition-all ${
                      set.completed
                        ? isWarmupSet
                          ? 'bg-amber-500/[0.15] text-amber-100'
                          : 'bg-emerald-500/[0.08] text-slate-300'
                        : isWarmupSet
                        ? 'bg-amber-500/[0.06] hover:bg-amber-500/[0.10] text-amber-200/90'
                        : 'text-slate-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Serie Badge / Number */}
                    <td className="py-2 text-center font-extrabold">
                      {isWarmupSet ? (
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-400/40 text-[10px] font-black tracking-tight"
                            title="Serie di Riscaldamento progressivo (non conta per volume/ranking)"
                          >
                            <Flame className="w-2.5 h-2.5 text-amber-400" />
                            R{warmupIdx + 1}
                          </span>
                        </div>
                      ) : isWarmupCategory ? (
                        <span className="text-slate-400 font-extrabold">{sIdx + 1}</span>
                      ) : (
                        <span className="text-slate-400 font-extrabold">{workingIdx + 1}</span>
                      )}
                    </td>

                    {/* Weight Input (nascosto per esercizi di riscaldamento generico) */}
                    {!isWarmupCategory && (
                      <td className="py-1.5 px-1.5 sm:px-2">
                        <div className="flex items-center gap-1">
                          <NumericInput
                            step="0.5"
                            min={0}
                            allowDecimals
                            fallbackValue={0}
                            value={set.weight}
                            onChange={(val) => handleUpdateSet(set.id, 'weight', val)}
                            className={`w-14 sm:w-16 md:w-20 bg-black/40 border rounded-xl px-1.5 sm:px-2 py-1 font-bold text-center backdrop-blur-md focus:outline-none transition-colors text-xs sm:text-sm ${
                              isWarmupSet
                                ? 'border-amber-400/40 text-amber-200 focus:border-amber-400'
                                : 'border-white/15 text-white focus:border-sky-400'
                            }`}
                          />
                          {exercise.weightMode === 'per_side' && (
                            <span className="text-[10px] text-amber-400 font-semibold">/lato</span>
                          )}
                          {exercise.weightMode === 'bodyweight' && (
                            <span className="text-[10px] text-sky-400 font-semibold" title="Zavorra aggiuntiva oltre al peso corporeo">+zav</span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Reps Input */}
                    <td className="py-1.5 px-1.5 sm:px-2">
                      <NumericInput
                        min={1}
                        fallbackValue={1}
                        value={set.reps}
                        onChange={(val) => handleUpdateSet(set.id, 'reps', val)}
                        className={`w-12 sm:w-14 md:w-16 bg-black/40 border rounded-xl px-1.5 sm:px-2 py-1 font-bold text-center backdrop-blur-md focus:outline-none transition-colors text-xs sm:text-sm ${
                          isWarmupSet
                            ? 'border-amber-400/40 text-amber-200 focus:border-amber-400'
                            : 'border-white/15 text-white focus:border-sky-400'
                        }`}
                      />
                    </td>

                    {/* Deload Calculation Column if active */}
                    {!isWarmupCategory && isDeload && (
                      <td className="py-1.5 px-1.5 sm:px-2">
                        {isWarmupSet ? (
                          <span className="text-[10px] text-slate-500 italic">Riscaldamento</span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-lg whitespace-nowrap">
                              {deloadWeight} {profile.unit} × {deloadReps}
                            </span>
                            <button
                              type="button"
                              onClick={() => applyDeloadToSet(set.id, deloadWeight, deloadReps)}
                              className="text-[9px] text-amber-400 hover:text-amber-200 font-extrabold underline transition-colors"
                              title="Applica carico e ripetizioni consigliati per il deload"
                            >
                              Applica
                            </button>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Completion Checkmark with Bouncy Motion */}
                    <td className="py-2 px-1 text-center">
                      <motion.button
                        type="button"
                        whileHover={MOTION_PRESETS.iconHover}
                        whileTap={MOTION_PRESETS.buttonTap}
                        transition={MOTION_PRESETS.snappySpring}
                        onClick={() => handleToggleSetCompleted(set)}
                        className={`w-8 h-8 sm:w-7 sm:h-7 min-w-[32px] min-h-[32px] ${UI_RADII.control} inline-flex items-center justify-center transition-all ${
                          set.completed
                            ? isWarmupSet
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-300/40'
                              : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300/40'
                            : isWarmupSet
                            ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 hover:text-white border border-amber-400/30 backdrop-blur-md'
                            : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white border border-white/15 backdrop-blur-md'
                        }`}
                        title={
                          isWarmupSet
                            ? `Segna serie di riscaldamento completata (recupero ${exercise.warmupRestTimeSeconds ?? 30}s)`
                            : `Segna serie completata (recupero ${exercise.restTimeSeconds}s)`
                        }
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </motion.button>
                    </td>

                    {/* Delete set */}
                    <td className="py-2 pr-1.5 sm:pr-2 text-right">
                      {exercise.sets.length > 1 && (
                        <motion.button
                          type="button"
                          whileHover={MOTION_PRESETS.iconHover}
                          whileTap={MOTION_PRESETS.buttonTap}
                          onClick={() => handleRemoveSet(set.id)}
                          className="w-7 h-7 sm:w-6 sm:h-6 min-w-[28px] min-h-[28px] inline-flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="Rimuovi serie"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </motion.button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Set Controls & Rest Timer bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Set Button */}
            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.buttonHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={handleAddSet}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} bg-white/10 hover:bg-white/15 text-slate-200 font-bold transition-all border border-white/15 backdrop-blur-md shadow-sm`}
            >
              <Plus className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />
              <span>{isWarmupCategory ? 'Serie Mobilità' : 'Serie'}</span>
            </motion.button>

            {/* Add Warmup Set Button (solo per esercizi normali) */}
            {!isWarmupCategory && (
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.buttonHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={handleAddWarmupSet}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold transition-all border border-amber-400/30 backdrop-blur-md shadow-sm`}
                title="Aggiungi una serie di riscaldamento con calcolo automatico a rampa (peso e reps modificabili)"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span>+ Riscaldamento</span>
              </motion.button>
            )}

            {/* Toggle Superset / Scollega (solo per esercizi normali) */}
            {!isWarmupCategory && (
              isInsideSupersetGroup ? (
                <motion.button
                  type="button"
                  whileHover={MOTION_PRESETS.buttonHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={() => (onUnlinkSuperset ? onUnlinkSuperset(exercise.id) : onToggleSuperset(exercise.id))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} font-bold transition-all border backdrop-blur-md shadow-sm bg-white/10 hover:bg-rose-500/20 border-white/15 hover:border-rose-400/30 text-slate-300 hover:text-rose-200`}
                  title="Scollega questo esercizio dal Superset"
                >
                  <Unlink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Scollega</span>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={MOTION_PRESETS.buttonHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={() => onToggleSuperset(exercise.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} font-bold transition-all border backdrop-blur-md shadow-sm ${
                    exercise.isSuperset
                      ? 'bg-indigo-500/30 border-indigo-400/60 text-indigo-200'
                      : 'bg-white/10 hover:bg-indigo-500/20 border-white/15 hover:border-indigo-400/40 text-slate-300 hover:text-indigo-200'
                  }`}
                  title="Collega in Superset con un altro esercizio"
                >
                  <Link className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Superset</span>
                </motion.button>
              )
            )}

            {/* Toggle Notes */}
            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.buttonHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} font-bold transition-all border backdrop-blur-md shadow-sm ${
                exercise.notes
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300 border-white/15'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Note</span>
            </motion.button>
          </div>

          {/* Rest Timer Controls */}
          {isInsideSupersetGroup && !isLastInSupersetGroup ? (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold backdrop-blur-md`}
              title="Recupero zero tra gli esercizi del superset: riposo previsto solo al termine del giro"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recupero 0s</span>
            </div>
          ) : isWarmupCategory ? (
            <div className="flex items-center gap-1.5">
              {exercise.restTimeSeconds <= 0 ? (
                <button
                  type="button"
                  onClick={() => handleRestChange(30)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-amber-300 text-[11px] font-bold transition-all"
                  title="Attiva timer di recupero facoltativo tra le serie di riscaldamento"
                >
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Recupero: Disattivato</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <div className={`flex items-center bg-black/40 border border-amber-400/30 ${UI_RADII.control} px-2.5 py-1 text-amber-200 backdrop-blur-md`}>
                    <span className="text-[11px] text-amber-400/80 mr-1">Rec:</span>
                    <NumericInput
                      min={0}
                      step="5"
                      fallbackValue={30}
                      value={exercise.restTimeSeconds}
                      onChange={(val) => handleRestChange(val)}
                      className="w-8 bg-transparent text-amber-200 font-bold text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-400/80">s</span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={MOTION_PRESETS.buttonHover}
                    whileTap={MOTION_PRESETS.buttonTap}
                    onClick={() => onStartRestTimer(exercise.restTimeSeconds, `${exercise.name} (Mobilità)`)}
                    className={`flex items-center gap-1 px-2.5 py-1 ${UI_RADII.control} bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-sm border border-amber-400/50 transition-all`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => handleRestChange(0)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Disattiva timer di recupero"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Recupero per serie di riscaldamento (se ce ne sono) */}
              {warmupSets.length > 0 && (
                <div
                  className={`flex items-center bg-amber-500/10 border border-amber-400/30 ${UI_RADII.control} px-2 py-1 text-amber-300 backdrop-blur-md`}
                  title="Recupero tra serie di riscaldamento (default 30s)"
                >
                  <Flame className="w-3 h-3 text-amber-400 mr-1" />
                  <span className="text-[10px] font-bold mr-1">Risc:</span>
                  <NumericInput
                    min={10}
                    step="5"
                    fallbackValue={30}
                    value={exercise.warmupRestTimeSeconds ?? 30}
                    onChange={(val) => handleWarmupRestChange(val)}
                    className="w-8 bg-transparent text-amber-200 font-bold text-center focus:outline-none"
                  />
                  <span className="text-[9px] text-amber-400/80">s</span>
                </div>
              )}

              {/* Recupero standard serie di lavoro */}
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center bg-black/40 border border-white/15 ${UI_RADII.control} px-2.5 py-1 text-slate-300 backdrop-blur-md`}>
                  <span className="text-[11px] text-slate-400 mr-1">Rec:</span>
                  <NumericInput
                    min={15}
                    step="15"
                    fallbackValue={60}
                    value={exercise.restTimeSeconds}
                    onChange={(val) => handleRestChange(val)}
                    className="w-10 bg-transparent text-white font-bold text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">s</span>
                </div>

                <motion.button
                  type="button"
                  whileHover={MOTION_PRESETS.buttonHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={() => onStartRestTimer(exercise.restTimeSeconds, exercise.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 ${UI_RADII.control} bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-sm border border-sky-400/50 transition-all`}
                  title={isInsideSupersetGroup ? 'Avvia timer recupero al termine del giro' : 'Avvia timer recupero'}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Notes Input */}
        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-2.5 border-t border-white/10 overflow-hidden"
            >
              <textarea
                rows={2}
                value={exercise.notes || ''}
                onChange={(e) => onUpdateExercise({ ...exercise, notes: e.target.value })}
                placeholder="Aggiungi note personali (es. presa larga, sensazioni, impostazione schienale...)"
                className="w-full bg-black/40 border border-white/15 rounded-2xl p-2.5 text-xs text-slate-200 focus:border-sky-400 focus:outline-none resize-none backdrop-blur-md placeholder:text-slate-500"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variations & Tips Quick Bar */}
        {exercise.variations && exercise.variations.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
            <Repeat className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="text-slate-500 font-medium">Varianti:</span>
            {exercise.variations.map((v) => (
              <span
                key={v}
                className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {v}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal for full Muscle Anatomical Description & Biomechanics */}
      <MuscleDetailModal
        isOpen={showMuscleModal}
        onClose={() => setShowMuscleModal(false)}
        muscle={exercise.targetMuscle}
        exercise={exercise}
        currentRank={currentRank}
        estimated1RM={estimated1RM}
        profile={profile}
      />
    </>
  );
});

