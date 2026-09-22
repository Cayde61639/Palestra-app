import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MuscleZone, RankLevel, UserProfile, WorkoutRoutine } from '../types';
import { calculateMuscleRanks, RANK_METADATA, triggerRankCelebration } from '../utils/ranking';
import { MUSCLE_LABELS } from '../data/exerciseDataset';
import { HumanBodyMap } from './HumanBodyMap';
import { Sparkles, Trophy, Award, Zap, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface RankingsViewProps {
  routine: WorkoutRoutine;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const RankingsView = React.memo<RankingsViewProps>(({
  routine,
  profile,
  onUpdateProfile,
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleZone | null>('chest');
  
  // Memoizzazione del calcolo per evitare ricalcoli inutili a ogni render
  const muscleRanks = useMemo(() => calculateMuscleRanks(routine, profile), [routine, profile]);

  // Calcola il rank complessivo più frequente tramite useMemo
  const overallRank: RankLevel = useMemo(() => {
    const ranksList = Object.values(muscleRanks);
    const diamondCount = ranksList.filter((r) => r === 'diamond').length;
    const platinumCount = ranksList.filter((r) => r === 'platinum').length;
    const goldCount = ranksList.filter((r) => r === 'gold').length;

    return diamondCount >= 3
      ? 'diamond'
      : platinumCount >= 3
      ? 'platinum'
      : goldCount >= 3
      ? 'gold'
      : 'silver';
  }, [muscleRanks]);

  const overallMeta = RANK_METADATA[overallRank];

  // Trigger automatico al salire di livello (rank-up)
  const rankScores: Record<RankLevel, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
  };

  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    if (hasCelebratedRef.current) return;
    const lastSavedRank = (localStorage.getItem('gym_app_last_celebrated_rank_v1') as RankLevel) || 'bronze';
    const currentScore = rankScores[overallRank];
    const lastScore = rankScores[lastSavedRank] || 1;

    if (currentScore > lastScore && currentScore >= 3) {
      // È salito di livello a Oro, Platino o Diamante!
      const timer = setTimeout(() => {
        triggerRankCelebration(overallRank, overallMeta.label);
        localStorage.setItem('gym_app_last_celebrated_rank_v1', overallRank);
        hasCelebratedRef.current = true;
      }, 500);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem('gym_app_last_celebrated_rank_v1', overallRank);
    }
  }, [overallRank]);

  return (
    <div className="space-y-5">
      {/* Top Banner: Overall Strength Rank in Apple Glass */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_PRESETS.snappySpring}
        className={`${UI_RADII.card} p-6 border relative overflow-hidden backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)] ${
          overallMeta.bgBadge
        }`}
      >
        {/* Specular Refraction Highlight */}
        <div className={SPECULAR_HIGHLIGHT} />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                Livello Globale
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{overallMeta.label}</span>
              {overallRank === 'diamond' && (
                <Sparkles className="w-5 h-5 text-sky-200 animate-spin" />
              )}
            </h3>
            <p className="text-xs text-white/80 mt-1 max-w-sm">
              Normalizzato per{' '}
              {profile.rankingMode === 'relative'
                ? `${profile.bodyWeightKg} kg / ${profile.heightCm || 175} cm (allometrico)`
                : 'carico assoluto'}
              .
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => triggerRankCelebration(overallRank, 'Corpo')}
            className={`px-4 py-2 ${UI_RADII.control} bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white text-xs font-black transition-all shadow-lg flex items-center gap-2`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Celebra</span>
          </motion.button>
        </div>

        {/* Shimmer overlay for high ranks */}
        {(overallRank === 'platinum' || overallRank === 'diamond') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />
        )}
      </motion.div>

      {/* Mode Switcher Banner in Apple Glass */}
      <div className={`bg-white/[0.05] ${UI_RADII.card} p-3 border border-white/[0.12] backdrop-blur-2xl flex items-center justify-between shadow-lg relative overflow-hidden`}>
        <div className={SPECULAR_HIGHLIGHT} />
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-extrabold text-white">Metrica:</span>
        </div>
        <div className={`flex items-center bg-black/40 p-1 ${UI_RADII.control} border border-white/10 text-xs font-bold backdrop-blur-md`}>
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => onUpdateProfile({ ...profile, rankingMode: 'relative' })}
            className={`px-3 py-1 rounded-lg transition-all ${
              profile.rankingMode === 'relative'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Relativa (Peso/Altezza)
          </motion.button>
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => onUpdateProfile({ ...profile, rankingMode: 'absolute' })}
            className={`px-3 py-1 rounded-lg transition-all ${
              profile.rankingMode === 'absolute'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Assoluta (Kg)
          </motion.button>
        </div>
      </div>

      {/* Interactive Anatomical Body Map in Apple Glass */}
      <HumanBodyMap
        muscleRanks={muscleRanks}
        selectedMuscle={selectedMuscle}
        onSelectMuscle={(m) => setSelectedMuscle(m)}
      />

      {/* Muscle Breakdown Grid with Rank-Specific Glow & Animations */}
      <div className={`bg-white/[0.05] ${UI_RADII.card} p-5 border border-white/[0.12] backdrop-blur-2xl shadow-xl relative overflow-hidden`}>
        <div className={SPECULAR_HIGHLIGHT} />
        <h4 className="text-sm font-extrabold text-white mb-3.5 flex items-center gap-2">
          <Award className="w-4 h-4 text-sky-400" />
          <span>Rank per Muscolo</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(Object.keys(MUSCLE_LABELS) as MuscleZone[]).map((zone) => {
            const rank = muscleRanks[zone] || 'bronze';
            const meta = RANK_METADATA[rank];
            const isSelected = selectedMuscle === zone;
            const isDiamond = rank === 'diamond';
            const isPlatinum = rank === 'platinum';

            // Calcola il box shadow rank-specific
            const rankShadow = isDiamond
              ? `0 0 16px ${meta.colorHex}45, inset 0 1px 1px rgba(255,255,255,0.2)`
              : isPlatinum
              ? `0 0 12px ${meta.colorHex}35, inset 0 1px 1px rgba(255,255,255,0.15)`
              : rank === 'gold'
              ? `0 0 10px ${meta.colorHex}25`
              : rank === 'silver'
              ? `0 0 6px ${meta.colorHex}15`
              : 'none';

            return (
              <motion.div
                key={zone}
                whileHover={MOTION_PRESETS.cardHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={() => setSelectedMuscle(zone)}
                className={`p-3.5 ${UI_RADII.card} border transition-all cursor-pointer backdrop-blur-xl relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-sky-400/80 bg-white/[0.12]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
                style={{
                  borderColor: isSelected ? '#38bdf8' : `${meta.colorHex}40`,
                  boxShadow: isSelected
                    ? `0 0 20px rgba(56,189,248,0.4), ${rankShadow}`
                    : rankShadow,
                }}
              >
                {/* Specular highlight for highest tiers */}
                {(isDiamond || isPlatinum) && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px] opacity-70 pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${meta.colorHex}, transparent)`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
                  <span className="text-xs font-bold text-white truncate min-w-0 flex-1" title={MUSCLE_LABELS[zone]}>
                    {MUSCLE_LABELS[zone]}
                  </span>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {(isDiamond || isPlatinum) && (
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: meta.colorHex }}
                      />
                    )}
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm"
                      style={{
                        backgroundColor: meta.colorHex,
                        boxShadow: `0 0 8px ${meta.colorHex}`,
                      }}
                    />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold" style={{ color: meta.colorHex }}>
                    {meta.label}
                  </span>
                  {isDiamond && (
                    <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-spin" />
                  )}
                  {isPlatinum && (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Methodology Card in Apple Glass */}
      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200 block mb-0.5">Come funziona il calcolo:</span>
          Il sistema converte ogni serie in massimale stimato tramite la formula standard di Epley:
          <span className="font-mono text-sky-300 ml-1 font-bold">
            1RM = Peso × (1 + Ripetizioni / 30)
          </span>
          . I carichi vengono confrontati con gli standard internazionali per assegnare il rank
          (Bronzo, Argento, Oro, Platino, Diamante).
        </div>
      </div>
    </div>
  );
});
