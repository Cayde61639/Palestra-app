import React, { useState, useRef, useEffect } from 'react';
import { WorkoutSortCriterion } from '../types';
import { SORT_OPTIONS, SortOptionConfig } from '../utils/sorting';
import {
  Sparkles,
  ChevronDown,
  Layers,
  Shuffle,
  TrendingDown,
  ArrowDownAZ,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UI_RADII, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface WorkoutSortSelectorProps {
  onSelectSort: (criterion: WorkoutSortCriterion) => void;
  disabled?: boolean;
}

export const WorkoutSortSelector: React.FC<WorkoutSortSelectorProps> = ({
  onSelectSort,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chiusura al click fuori o al tasto Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleChooseOption = (option: SortOptionConfig) => {
    setIsOpen(false);
    onSelectSort(option.id);
  };

  const getCriterionIcon = (id: WorkoutSortCriterion) => {
    switch (id) {
      case 'biomechanic':
        return <Sparkles className="w-3.5 h-3.5 text-sky-400" />;
      case 'muscle_group':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case 'push_pull_legs':
        return <Shuffle className="w-3.5 h-3.5 text-teal-400" />;
      case 'heavy_to_light':
        return <TrendingDown className="w-3.5 h-3.5 text-amber-400" />;
      case 'alphabetical':
        return <ArrowDownAZ className="w-3.5 h-3.5 text-slate-300" />;
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger Button - Apple Glass Style */}
      <motion.button
        type="button"
        whileHover={!disabled ? { scale: 1.03 } : undefined}
        whileTap={!disabled ? { scale: 0.94 } : undefined}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-extrabold text-xs border shadow-md backdrop-blur-xl transition-all ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-white/[0.03] text-slate-500 border-white/5'
            : isOpen
            ? 'bg-sky-500/20 text-sky-200 border-sky-400/50 shadow-sky-500/20 ring-1 ring-sky-400/30'
            : 'bg-white/[0.06] hover:bg-white/[0.1] text-sky-300 border-white/15'
        }`}
        title="Scegli il criterio di riordino della scheda"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Ordina</span>
        <ChevronDown
          className={`w-3 h-3 text-sky-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Popover Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute left-0 top-full mt-2 w-[calc(100vw-2.5rem)] max-w-xs sm:w-80 bg-slate-900/95 border border-white/15 ${UI_RADII.card} p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl z-50 overflow-hidden`}
          >
            {/* Specular Edge Refraction */}
            <div className={SPECULAR_HIGHLIGHT} />

            {/* Menu Header */}
            <div className="px-2.5 pt-1.5 pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Criterio di Riordino
              </span>
              <span className="text-[10px] font-bold text-sky-400">
                {SORT_OPTIONS.length} Opzioni
              </span>
            </div>

            {/* List of Criteria */}
            <div className="space-y-1 pt-1.5">
              {SORT_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChooseOption(opt)}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-white/[0.08] transition-all flex items-start gap-2.5 group border border-transparent hover:border-white/10"
                >
                  <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-sky-400/30 group-hover:bg-sky-500/15 transition-all">
                    {getCriterionIcon(opt.id)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-sky-200 transition-colors break-words line-clamp-2">
                        {opt.label}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/[0.08] text-slate-300 border border-white/10 shrink-0">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight group-hover:text-slate-300 transition-colors">
                      {opt.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
