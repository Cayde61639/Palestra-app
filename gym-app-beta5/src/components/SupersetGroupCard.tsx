import React from 'react';
import { Exercise, UserProfile, DeloadType } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { Link, Unlink, ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { DELOAD_OPTIONS } from '../data/deloadOptions';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface SupersetGroupCardProps {
  groupId: string;
  exercises: Exercise[];
  groupIndex: number;
  totalGroups: number;
  profile: UserProfile;
  isDeload?: boolean;
  deloadType?: DeloadType;
  onUpdateExercise: (updated: Exercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onMoveGroupUp: (groupIndex: number) => void;
  onMoveGroupDown: (groupIndex: number) => void;
  onStartRestTimer: (seconds: number, exerciseName: string) => void;
  onUnlinkSuperset: (groupId: string) => void;
}

export const SupersetGroupCard = React.memo<SupersetGroupCardProps>(({
  groupId,
  exercises,
  groupIndex,
  totalGroups,
  profile,
  isDeload = false,
  deloadType = 'mixed',
  onUpdateExercise,
  onDeleteExercise,
  onMoveGroupUp,
  onMoveGroupDown,
  onStartRestTimer,
  onUnlinkSuperset,
}) => {
  const currentDeloadConfig =
    DELOAD_OPTIONS.find((o) => o.id === deloadType) || DELOAD_OPTIONS[2];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileHover={MOTION_PRESETS.cardHover}
      transition={MOTION_PRESETS.snappySpring}
      className={`relative ${UI_RADII.card} overflow-hidden transition-colors backdrop-blur-2xl border ${
        isDeload
          ? 'bg-gradient-to-br from-indigo-950/45 via-amber-950/20 to-sky-950/35 border-indigo-400/50 shadow-[0_12px_36px_rgba(99,102,241,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)]'
          : 'bg-gradient-to-br from-indigo-950/40 via-white/[0.06] to-sky-950/30 border-indigo-500/50 shadow-[0_12px_36px_rgba(99,102,241,0.22),inset_0_1px_1px_rgba(255,255,255,0.3)]'
      }`}
    >
      {/* Specular Light Refraction Border Highlight */}
      <div className={SPECULAR_HIGHLIGHT} />

      {/* Superset Master Header */}
      <div className="px-5 pt-4 pb-3 border-b border-indigo-500/20 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-[10px] font-black px-3 py-1 ${UI_RADII.pill} uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-500/30`}>
            <Link className="w-3.5 h-3.5" />
            <span>Superset (Recupero Zero Intermedio)</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 ${UI_RADII.pill} bg-indigo-400/20 text-indigo-300 border border-indigo-400/30`}>
            {exercises.length} Esercizi
          </span>

          {isDeload && (
            <div className={`flex items-center gap-1 px-2.5 py-0.5 ${UI_RADII.pill} bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold`}>
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{currentDeloadConfig.name}</span>
            </div>
          )}
        </div>

        {/* Group Actions: Move Entire Superset Up/Down & Unlink */}
        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            disabled={groupIndex === 0}
            onClick={() => onMoveGroupUp(groupIndex)}
            className={`p-1.5 ${UI_RADII.control} text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors`}
            title="Sposta intero blocco superset in alto"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            disabled={groupIndex === totalGroups - 1}
            onClick={() => onMoveGroupDown(groupIndex)}
            className={`p-1.5 ${UI_RADII.control} text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors`}
            title="Sposta intero blocco superset in basso"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => onUnlinkSuperset(groupId)}
            className={`flex items-center gap-1 px-2.5 py-1 ${UI_RADII.control} bg-white/[0.08] hover:bg-rose-500/20 text-indigo-200 hover:text-rose-200 border border-white/10 hover:border-rose-400/30 text-[11px] font-extrabold transition-all ml-1 shadow-sm`}
            title="Scollega gli esercizi del superset"
          >
            <Unlink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scollega</span>
          </motion.button>
        </div>
      </div>

      {/* Stacked Exercises with zero-rest connector */}
      <div>
        {exercises.map((ex, exIdx) => {
          const isLast = exIdx === exercises.length - 1;
          const nextEx = exercises[exIdx + 1];

          return (
            <div key={ex.id}>
              <ExerciseCard
                exercise={ex}
                index={exIdx}
                totalExercises={exercises.length}
                profile={profile}
                isDeload={isDeload}
                deloadType={deloadType}
                isInsideSupersetGroup={true}
                isLastInSupersetGroup={isLast}
                onUpdateExercise={onUpdateExercise}
                onDeleteExercise={onDeleteExercise}
                onMoveUp={() => {}}
                onMoveDown={() => {}}
                onStartRestTimer={onStartRestTimer}
                onToggleSuperset={() => onUnlinkSuperset(groupId)}
                onUnlinkSuperset={() => onUnlinkSuperset(groupId)}
              />

              {/* Zero-rest connector divider between exercises */}
              {!isLast && nextEx && (
                <div className="relative py-2.5 px-4 flex items-center justify-center bg-indigo-950/30">
                  <div className="absolute inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
                  <div className="relative z-10 px-3 py-1 rounded-full bg-indigo-950/95 border border-indigo-400/40 text-indigo-200 text-[11px] font-extrabold flex items-center gap-1.5 shadow-md backdrop-blur-md">
                    <Link className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                    <span>
                      Passa subito a <span className="text-white font-black">{nextEx.name}</span> • Recupero 0s
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});
