import React, { useState } from 'react';
import { WorkoutDay } from '../types';
import { MUSCLE_LABELS } from '../data/exerciseDataset';
import { formatDayDuration } from '../utils/duration';
import {
  Pencil,
  Plus,
  Check,
  Dumbbell,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface WorkoutCarouselProps {
  days: WorkoutDay[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  onUpdateDayName: (dayId: string, newName: string) => void;
  onAddDay: () => void;
  onDeleteDay: (dayId: string) => void;
  onMoveDay: (fromIndex: number, toIndex: number) => void;
}

export const WorkoutCarousel: React.FC<WorkoutCarouselProps> = ({
  days,
  selectedDayId,
  onSelectDay,
  onUpdateDayName,
  onAddDay,
  onDeleteDay,
  onMoveDay,
}) => {
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');

  const startEditing = (day: WorkoutDay, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDayId(day.id);
    setEditNameValue(day.name);
  };

  const saveEdit = (dayId: string) => {
    onUpdateDayName(dayId, editNameValue.trim());
    setEditingDayId(null);
  };

  return (
    <div className="w-full">
      {/* Scrollable Days Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5 py-1 no-scrollbar scroll-smooth">
        {days.map((day, idx) => {
          const isSelected = day.id === selectedDayId;
          const isEditing = editingDayId === day.id;

          return (
            <motion.div
              key={day.id}
              layout
              onClick={() => !isEditing && onSelectDay(day.id)}
              whileHover={MOTION_PRESETS.cardHover}
              whileTap={MOTION_PRESETS.cardTap}
              transition={MOTION_PRESETS.snappySpring}
              className={`flex-shrink-0 cursor-pointer ${UI_RADII.card} p-4 sm:p-5 w-[82vw] min-w-[230px] max-w-[300px] sm:w-[280px] sm:min-w-[280px] transition-colors select-none relative overflow-hidden backdrop-blur-xl outline-none focus:outline-none ${
                isSelected
                  ? 'bg-white/10 border border-sky-400/40 text-white shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 shadow-sm'
              }`}
            >
              {/* Refraction Sheen */}
              <div className={SPECULAR_HIGHLIGHT} />

              {/* Top Row: Day badge + Shift Left/Right + Edit/Delete */}
              <div className="flex items-center justify-between gap-1.5 mb-2.5 relative z-10">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md transition-all shrink-0 ${
                      isSelected
                        ? 'bg-sky-500 text-white border border-sky-400/40 shadow-sm'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    Day {String.fromCharCode(65 + idx)}
                  </span>

                  {/* Pulsanti Sposta Giorno a Destra / Sinistra */}
                  {days.length > 1 && !isEditing && (
                    <div className="flex items-center bg-white/[0.06] rounded-full p-0.5 border border-white/10 backdrop-blur-sm shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveDay(idx, idx - 1);
                        }}
                        className={`p-1 rounded-full transition-all ${
                          idx === 0
                            ? 'opacity-20 cursor-not-allowed text-slate-500'
                            : 'text-slate-300 hover:text-sky-300 hover:bg-white/15 active:scale-90'
                        }`}
                        title="Sposta giorno a sinistra"
                        aria-label="Sposta giorno a sinistra"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === days.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveDay(idx, idx + 1);
                        }}
                        className={`p-1 rounded-full transition-all ${
                          idx === days.length - 1
                            ? 'opacity-20 cursor-not-allowed text-slate-500'
                            : 'text-slate-300 hover:text-sky-300 hover:bg-white/15 active:scale-90'
                        }`}
                        title="Sposta giorno a destra"
                        aria-label="Sposta giorno a destra"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEdit(day.id);
                    }}
                    className="p-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shrink-0"
                    title="Conferma modifica"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => startEditing(day, e)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Rinomina giorno"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDay(day.id);
                      }}
                      className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Elimina giorno"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Day Title (Editable or Display) */}
              <div className="mb-2.5 relative z-10">
                {isEditing ? (
                  <input
                    type="text"
                    value={editNameValue}
                    placeholder="Nome auto se vuoto..."
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onBlur={() => saveEdit(day.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(day.id);
                      if (e.key === 'Escape') setEditingDayId(null);
                    }}
                    autoFocus
                    className="w-full bg-black/50 border border-sky-400 rounded-xl px-2 py-1 text-xs text-white font-bold focus:outline-none placeholder:text-slate-500"
                  />
                ) : (
                  <h3
                    className={`text-sm font-bold transition-colors break-words line-clamp-2 leading-snug min-h-[2.5rem] flex items-center ${
                      isSelected ? 'text-white' : 'text-slate-200'
                    }`}
                    title={day.name}
                  >
                    {day.name}
                  </h3>
                )}
              </div>

              {/* Muscle Chips & Stats */}
              <div className="space-y-2.5 relative z-10">
                {/* Focus muscles chips (Rounded full pills) */}
                <div className="flex flex-wrap gap-1">
                  {day.focusMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-md ${
                        isSelected
                          ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}
                    >
                      {MUSCLE_LABELS[muscle]}
                    </span>
                  ))}
                </div>

                {/* Exercise Count & Time Meta: Rounded Glass Pill instead of harsh straight border line */}
                <div className="flex items-center justify-between text-[11px] text-slate-300/90 px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-3 h-3 text-sky-400" />
                    <span>
                      {day.exercises.length} {day.exercises.length === 1 ? 'esercizio' : 'esercizi'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{formatDayDuration(day)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add Day Button with Glass Style */}
        <motion.button
          type="button"
          onClick={onAddDay}
          whileHover={MOTION_PRESETS.cardHover}
          whileTap={MOTION_PRESETS.buttonTap}
          transition={MOTION_PRESETS.snappySpring}
          className={`flex-shrink-0 flex flex-col items-center justify-center p-4 sm:p-5 ${UI_RADII.card} w-[38vw] min-w-[110px] sm:w-[140px] sm:min-w-[140px] self-stretch min-h-[148px] bg-white/[0.03] hover:bg-white/[0.08] border border-dashed border-white/20 text-slate-400 hover:text-white transition-all backdrop-blur-xl group outline-none focus:outline-none`}
        >
          <div className="w-10 h-10 rounded-2xl bg-white/10 group-hover:bg-sky-500 text-slate-300 group-hover:text-white flex items-center justify-center mb-2 transition-all shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold">Aggiungi Giorno</span>
        </motion.button>
      </div>
    </div>
  );
};
