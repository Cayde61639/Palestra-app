import React, { useState } from 'react';
import { UserProfile, VolumeMetric } from '../types';
import { User, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { NumericInput } from './NumericInput';
import { StyledSelect } from './StyledSelect';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [bodyWeight, setBodyWeight] = useState(profile.bodyWeightKg || 75);
  const [heightCm, setHeightCm] = useState(profile.heightCm || 175);
  const [unit, setUnit] = useState<'kg' | 'lb'>(profile.unit);
  const [experience, setExperience] = useState(profile.experienceLevel);
  const [rankingMode, setRankingMode] = useState(profile.rankingMode);
  const [volumeMetric, setVolumeMetric] = useState<VolumeMetric>(profile.volumeMetric || 'tonnage');
  const [goal, setGoal] = useState(profile.goal);
  const [weightNotice, setWeightNotice] = useState<string | null>(null);
  const [heightNotice, setHeightNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Enforce user rule: "se si inserisce un numero minore di 5 te lo setti a 50 come range base"
  const handleWeightBlur = () => {
    setBodyWeight((current) => {
      if (current < 5) {
        setWeightNotice('Valore < 5: impostato automaticamente al valore base di 50');
        setTimeout(() => setWeightNotice(null), 3500);
        return 50;
      }
      return current;
    });
  };

  // Enforce user rule: "se inserisce sotto i 100 cm imposta il valore a 170"
  const handleHeightBlur = () => {
    setHeightCm((current) => {
      if (current < 100) {
        setHeightNotice('Valore < 100 cm: impostato automaticamente a 170');
        setTimeout(() => setHeightNotice(null), 3500);
        return 170;
      }
      return current;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalWeight = Number(bodyWeight) || 75;
    if (finalWeight < 5) {
      finalWeight = 50;
    }

    let finalHeight = Number(heightCm) || 170;
    if (finalHeight < 100) {
      finalHeight = 170;
    }

    onSaveProfile({
      name: name.trim(),
      bodyWeightKg: finalWeight,
      heightCm: finalHeight,
      unit,
      experienceLevel: experience,
      rankingMode,
      goal,
      volumeMetric,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={MOTION_PRESETS.modalSpring}
        className={`bg-slate-900/90 border border-white/[0.18] ${UI_RADII.modal} w-full max-w-md shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.3)] backdrop-blur-3xl overflow-hidden relative max-h-[92vh] flex flex-col`}
      >
        {/* Specular Refraction Top Border */}
        <div className={SPECULAR_HIGHLIGHT} />

          {/* Header */}
          <div className="p-4 sm:p-5 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/30 text-sky-300 border border-sky-400/40 flex items-center justify-center shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Profilo & Calibrazione
                </h3>
                <p className="text-xs text-slate-400">
                  Parametri personali e calcolo dei livelli di forza
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 relative z-10 overflow-y-auto no-scrollbar"
          >
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nome Atleta</label>
              <input
                type="text"
                placeholder="Inserisci il tuo nome..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2.5 text-sm text-white font-bold focus:border-sky-400 focus:outline-none backdrop-blur-md placeholder:text-slate-500"
              />
            </div>

            {/* Bodyweight & Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Peso ({unit})
                </label>

                <div className="relative">
                  <NumericInput
                    step="0.5"
                    min={0}
                    max={300}
                    allowDecimals
                    fallbackValue={75}
                    value={bodyWeight}
                    onChange={setBodyWeight}
                    onBlur={handleWeightBlur}
                    className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2.5 text-sm text-white font-black text-center focus:border-sky-400 focus:outline-none backdrop-blur-md hover:border-sky-400/50 transition-colors"
                  />
                </div>
                {weightNotice && (
                  <p className="text-[10px] text-amber-300 font-bold mt-1 leading-tight animate-pulse">
                    {weightNotice}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Altezza (cm)
                </label>
                <div className="relative">
                  <NumericInput
                    step={1}
                    min={0}
                    max={250}
                    fallbackValue={175}
                    value={heightCm}
                    onChange={setHeightCm}
                    onBlur={handleHeightBlur}
                    className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2.5 text-sm text-white font-black text-center focus:border-sky-400 focus:outline-none backdrop-blur-md hover:border-sky-400/50 transition-colors"
                  />
                </div>
                {heightNotice && (
                  <p className="text-[10px] text-amber-300 font-bold mt-1 leading-tight animate-pulse">
                    {heightNotice}
                  </p>
                )}
              </div>
            </div>

            {/* Unit selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Unità di Misura Carichi
              </label>
              <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    unit === 'kg'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chilogrammi (KG)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('lb')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    unit === 'lb'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Libbre (LB)
                </button>
              </div>
            </div>

            {/* Ranking Mode (Absolute vs Relative to Body Weight & Height) */}
            <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 backdrop-blur-md`}>
              <label className="text-xs font-extrabold text-white block mb-1.5">
                Calcolo Livelli di Forza (Rank)
              </label>
              <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 mb-2">
                <button
                  type="button"
                  onClick={() => setRankingMode('relative')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                    rankingMode === 'relative'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Relativa (Peso & Altezza)
                </button>
                <button
                  type="button"
                  onClick={() => setRankingMode('absolute')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                    rankingMode === 'absolute'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Assoluta (Kg Puri)
                </button>
              </div>
              <span className="text-[11px] text-slate-300 block">
                {rankingMode === 'relative'
                  ? `I benchmark di forza tengono conto del peso (${bodyWeight} ${unit}) e della leva biomeccanica dell'altezza (${heightCm} cm) per un confronto equo e proporzionato.`
                  : 'I benchmark utilizzano i carichi standard fissi indipendentemente dalle proporzioni fisiche.'}
              </span>
            </div>

            {/* Volume Metric Selection */}
            <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 backdrop-blur-md`}>
              <label className="text-xs font-extrabold text-white block mb-1.5">
                Metrica Volume di Allenamento
              </label>
              <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 mb-2">
                <button
                  type="button"
                  onClick={() => setVolumeMetric('tonnage')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                    volumeMetric === 'tonnage'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tonnellaggio
                </button>
                <button
                  type="button"
                  onClick={() => setVolumeMetric('effective_sets')}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                    volumeMetric === 'effective_sets'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Serie Efficaci
                </button>
              </div>
              <p className="text-[11px] text-slate-300 block mb-1 leading-snug">
                {volumeMetric === 'tonnage'
                  ? 'Tonnellaggio: kg totali sollevati (carico effettivo × ripetizioni per ciascuna serie di lavoro).'
                  : 'Serie Efficaci: numero di serie da lavoro (esclude il riscaldamento), ideale per monitorare il volume ipertrofico.'}
              </p>
              <p className="text-[10px] text-sky-400/90 font-medium block">
                Si applica a tutta l'app. Cambiala solo da qui.
              </p>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Esperienza</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', label: 'Base' },
                  { id: 'intermediate', label: 'Intermedio' },
                  { id: 'advanced', label: 'Avanzato' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperience(lvl.id as any)}
                    className={`py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                      experience === lvl.id
                        ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Goal */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Obiettivo</label>
              <StyledSelect
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-white font-bold focus:border-sky-400 focus:outline-none backdrop-blur-md"
              >
                <option value="hypertrophy">Ipertrofia & Massa Muscolare</option>
                <option value="strength">Forza Massimale (Powerlifting)</option>
                <option value="fat_loss">Definizione & Ricomposizione</option>
                <option value="endurance">Resistenza & Condizionamento</option>
              </StyledSelect>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 border border-sky-400/40 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salva Impostazioni</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};
