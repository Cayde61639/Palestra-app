import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, X, ShieldAlert, Dumbbell, Zap, Activity } from 'lucide-react';
import { DeloadType } from '../types';
import { DELOAD_OPTIONS, DeloadOptionConfig } from '../data/deloadOptions';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface DeloadModalProps {
  isOpen: boolean;
  isDeloadActive: boolean;
  activeDeloadType?: DeloadType;
  onSelectDeload: (type: DeloadType) => void;
  onDisableDeload: () => void;
  onClose: () => void;
}

export const DeloadModal: React.FC<DeloadModalProps> = ({
  isOpen,
  isDeloadActive,
  activeDeloadType = 'mixed',
  onSelectDeload,
  onDisableDeload,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIconForType = (id: DeloadType) => {
    switch (id) {
      case 'volume':
        return <Dumbbell className="w-5 h-5 text-amber-400" />;
      case 'intensity':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'mixed':
      default:
        return <Activity className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none pt-safe pb-safe">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container in Apple Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={MOTION_PRESETS.modalSpring}
          className={`relative w-full max-w-lg ${UI_RADII.modal} bg-slate-900/90 border border-white/15 p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-3xl z-10 overflow-hidden max-h-[92vh] flex flex-col`}
        >
          {/* Refraction Top Sheen */}
          <div className={SPECULAR_HIGHLIGHT} />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-10 h-10 ${UI_RADII.control} bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20 shrink-0`}>
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span>Settimana di Scarico</span>
                  {isDeloadActive && (
                    <span className={`text-[10px] uppercase font-black bg-amber-500/25 text-amber-300 border border-amber-400/40 px-2 py-0.5 ${UI_RADII.pill}`}>
                      Attivo
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-medium break-words">
                  Seleziona il tipo di scarico ideale per il tuo recupero
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.iconHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={onClose}
              className={`p-2 ${UI_RADII.control} bg-white/[0.06] hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 shrink-0`}
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Body: 3 Deload Options */}
          <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-0.5">
            {DELOAD_OPTIONS.map((opt: DeloadOptionConfig) => {
              const isSelected = isDeloadActive && activeDeloadType === opt.id;

              return (
                <motion.div
                  key={opt.id}
                  whileHover={MOTION_PRESETS.cardHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={() => onSelectDeload(opt.id)}
                  className={`cursor-pointer ${UI_RADII.card} p-4 border transition-all relative overflow-hidden backdrop-blur-xl ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_8px_24px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)] ring-1 ring-amber-400/30'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 ${UI_RADII.control} flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'bg-amber-500/30 border-amber-400/50'
                            : 'bg-white/[0.06] border-white/10'
                        }`}
                      >
                        {getIconForType(opt.id)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">
                          {opt.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 ${UI_RADII.pill} bg-white/[0.08] text-slate-300 border border-white/10`}>
                            Vol: {opt.volumeReduction}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 ${UI_RADII.pill} bg-white/[0.08] text-slate-300 border border-white/10`}>
                            Carico: {opt.intensityReduction}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-md shadow-amber-400/50'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Concise and simple description from table */}
                  <div className={`mt-2 text-xs text-slate-300 font-medium bg-black/25 ${UI_RADII.control} p-2.5 border border-white/5`}>
                    <p className="text-[11px] text-amber-200/90 font-semibold mb-1">
                      💡 {opt.whenToUse}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {opt.shortDescription}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            {isDeloadActive ? (
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.buttonHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={onDisableDeload}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 ${UI_RADII.control} bg-white/[0.06] hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-white/10 hover:border-rose-400/40 text-xs font-bold transition-all`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Disattiva Scarico</span>
              </motion.button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Seleziona uno scarico per attivarlo
              </span>
            )}

            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.buttonHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={onClose}
              className={`px-5 py-2.5 ${UI_RADII.control} bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/30 border border-sky-400/40 transition-all ml-auto`}
            >
              Fatto
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
