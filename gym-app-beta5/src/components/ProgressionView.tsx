import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  Search,
  X,
  Dumbbell,
  Layers,
  Trash2,
  HelpCircle,
  Maximize2,
  Minimize2,
  Trophy,
  Clock,
  Sparkles,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProgressionLog, UserProfile, WorkoutRoutine, MuscleZone } from '../types';
import { EXERCISE_DATASET, MUSCLE_LABELS } from '../data/exerciseDataset';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

interface ProgressionViewProps {
  logs: ProgressionLog[];
  routine: WorkoutRoutine;
  profile: UserProfile;
  onClearLogs?: () => void;
}

type TimeRange = '4w' | '3m' | 'all';
type MetricMode = 'weight' | 'volume';

interface EnrichedLog extends ProgressionLog {
  isPR: boolean;
  isWeightPR: boolean;
  is1RMPR: boolean;
}

interface ExerciseGroup {
  key: string;
  displayName: string;
  targetMuscle: MuscleZone | 'other';
  muscleLabel: string;
  logs: EnrichedLog[];
  logCount: number;
  lastDate: string;
  maxWeightEver: number;
  max1RMEver: number;
  maxVolumeEver: number;
}

// Fallback sicuro per nome gruppo muscolare
const getMuscleLabelSafe = (muscle: MuscleZone | 'other'): string => {
  if (muscle === 'other') return 'Altro';
  return MUSCLE_LABELS[muscle] || 'Altro';
};

// Formattazione data estesa in italiano
const formatFullDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Formattazione data sintetica per Asse X
const formatShortDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(5);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr.slice(5);
  }
};

// Tooltip Glass Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: EnrichedLog;
  }>;
  label?: string;
  unit: string;
  metricMode: MetricMode;
  volumeMetric?: 'tonnage' | 'effective_sets';
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  unit,
  metricMode,
  volumeMetric = 'tonnage',
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  return (
    <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-xl p-3 shadow-2xl text-white min-w-[190px] space-y-1.5 pointer-events-none ring-1 ring-white/10 z-50">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatFullDate(dataPoint.date || label || '')}</span>
        </div>
        {dataPoint.isPR && (
          <span className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Trophy className="w-2.5 h-2.5" />
            PR
          </span>
        )}
      </div>

      <div className="space-y-1 text-xs">
        {metricMode === 'weight' ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Carico:
              </span>
              <span className="font-extrabold text-white">
                {dataPoint.maxWeight} {unit}
                {dataPoint.repsAtMax > 0 && (
                  <span className="text-slate-400 font-normal ml-1">
                    ({dataPoint.repsAtMax} reps)
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                1RM:
              </span>
              <span className="font-extrabold text-amber-300">
                {dataPoint.estimated1RM} {unit}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {volumeMetric === 'effective_sets' ? 'Serie Efficaci:' : 'Tonnellaggio:'}
            </span>
            <span className="font-extrabold text-amber-300">
              {volumeMetric === 'effective_sets'
                ? `${dataPoint.totalVolume} serie`
                : dataPoint.totalVolume > 0
                ? `${dataPoint.totalVolume.toLocaleString()} ${unit}`
                : '—'}
            </span>
          </div>
        )}

        <div className="pt-1 border-t border-white/5 text-[10px] text-sky-300/80 text-center font-medium">
          Tocca per dettagli
        </div>
      </div>
    </div>
  );
};

export const ProgressionView: React.FC<ProgressionViewProps> = ({
  logs,
  routine,
  profile,
  onClearLogs,
}) => {
  // Stati principali
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [metricMode, setMetricMode] = useState<MetricMode>('weight');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Modali
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);

  // 1. Raggruppamento e arricchimento log con calcolo retroattivo dei PR
  const exerciseGroups = useMemo<ExerciseGroup[]>(() => {
    if (!logs || logs.length === 0) return [];

    const map = new Map<
      string,
      {
        displayName: string;
        targetMuscle: MuscleZone | 'other';
        logs: ProgressionLog[];
      }
    >();

    logs.forEach((log) => {
      const rawName = (log.exerciseName || '').trim();
      if (!rawName) return;

      const normKey = rawName.toLowerCase();

      const cleanLog: ProgressionLog = {
        ...log,
        exerciseName: rawName,
        maxWeight:
          Number.isFinite(log.maxWeight) && log.maxWeight > 0
            ? Math.round(log.maxWeight * 10) / 10
            : 0,
        estimated1RM:
          Number.isFinite(log.estimated1RM) && log.estimated1RM > 0
            ? Math.round(log.estimated1RM * 10) / 10
            : 0,
        totalVolume:
          Number.isFinite(log.totalVolume) && log.totalVolume > 0
            ? Math.round(log.totalVolume)
            : 0,
        repsAtMax:
          Number.isFinite(log.repsAtMax) && log.repsAtMax > 0 ? Math.round(log.repsAtMax) : 0,
      };

      if (!map.has(normKey)) {
        let detectedMuscle: MuscleZone | 'other' = log.targetMuscle || 'other';

        if (!detectedMuscle || detectedMuscle === 'other') {
          for (const day of routine.days) {
            const found = day.exercises.find((e) => e.name.trim().toLowerCase() === normKey);
            if (found && found.targetMuscle) {
              detectedMuscle = found.targetMuscle;
              break;
            }
          }
        }

        if (!detectedMuscle || detectedMuscle === 'other') {
          const def = EXERCISE_DATASET.find(
            (e) =>
              e.name.toLowerCase() === normKey ||
              e.italianName.toLowerCase() === normKey ||
              e.name.toLowerCase().includes(normKey) ||
              normKey.includes(e.italianName.toLowerCase())
          );
          if (def && def.muscle) {
            detectedMuscle = def.muscle;
          }
        }

        map.set(normKey, {
          displayName: rawName,
          targetMuscle: detectedMuscle || 'other',
          logs: [cleanLog],
        });
      } else {
        const entry = map.get(normKey)!;
        entry.logs.push(cleanLog);

        if (
          entry.displayName === entry.displayName.toLowerCase() &&
          rawName !== rawName.toLowerCase()
        ) {
          entry.displayName = rawName;
        }

        if (entry.targetMuscle === 'other' && log.targetMuscle && log.targetMuscle !== 'other') {
          entry.targetMuscle = log.targetMuscle;
        }
      }
    });

    const groups: ExerciseGroup[] = [];

    map.forEach((value, key) => {
      // Ordina cronologicamente
      const sorted = [...value.logs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calcolo progressivo PR: un punto è PR se supera i massimi storici precedenti
      let runningWeight = 0;
      let running1RM = 0;

      const enriched: EnrichedLog[] = sorted.map((l, idx) => {
        const isWeightPR = idx > 0 && l.maxWeight > runningWeight;
        const is1RMPR = idx > 0 && l.estimated1RM > running1RM;
        const isPR = Boolean(l.isPR || isWeightPR || is1RMPR);

        if (l.maxWeight > runningWeight) runningWeight = l.maxWeight;
        if (l.estimated1RM > running1RM) running1RM = l.estimated1RM;

        return {
          ...l,
          isPR,
          isWeightPR,
          is1RMPR,
        };
      });

      const maxWeightEver = Math.max(...enriched.map((l) => l.maxWeight), 0);
      const max1RMEver = Math.max(...enriched.map((l) => l.estimated1RM), 0);
      const maxVolumeEver = Math.max(...enriched.map((l) => l.totalVolume), 0);
      const lastDate = enriched[enriched.length - 1]?.date || '';

      groups.push({
        key,
        displayName: value.displayName,
        targetMuscle: value.targetMuscle,
        muscleLabel: getMuscleLabelSafe(value.targetMuscle),
        logs: enriched,
        logCount: enriched.length,
        lastDate,
        maxWeightEver,
        max1RMEver,
        maxVolumeEver,
      });
    });

    return groups.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
  }, [logs, routine]);

  // Esercizio attivo corrente
  const activeExerciseKey = useMemo(() => {
    if (selectedKey && exerciseGroups.some((g) => g.key === selectedKey)) {
      return selectedKey;
    }
    return exerciseGroups[0]?.key || '';
  }, [selectedKey, exerciseGroups]);

  const activeGroup = useMemo(() => {
    return exerciseGroups.find((g) => g.key === activeExerciseKey) || null;
  }, [exerciseGroups, activeExerciseKey]);

  // Filtro periodo temporale (4 settimane, 3 mesi, tutto)
  const filteredLogs = useMemo(() => {
    if (!activeGroup) return [];
    const all = activeGroup.logs;
    if (timeRange === 'all') return all;

    const now = new Date().getTime();
    const daysLimit = timeRange === '4w' ? 28 : 90;
    const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

    const filtered = all.filter((l) => new Date(l.date).getTime() >= cutoff);
    // Se il filtro è troppo stretto e non ha punti, mostra almeno gli ultimi punti disponibili
    return filtered.length >= 1 ? filtered : all;
  }, [activeGroup, timeRange]);

  // Quando si apre la vista espansa, se non è selezionata una giornata, pre-seleziona l'ultima disponibile per mostrare subito il dettaglio
  useEffect(() => {
    if (isExpandedModalOpen && !selectedDateDetail && filteredLogs.length > 0) {
      setSelectedDateDetail(filteredLogs[filteredLogs.length - 1].date);
    }
  }, [isExpandedModalOpen, selectedDateDetail, filteredLogs]);

  // Calcolo statistiche sintetiche e trend
  const stats = useMemo(() => {
    if (!filteredLogs || filteredLogs.length === 0) {
      return {
        maxWeight: 0,
        max1RM: 0,
        maxVolume: 0,
        weightTrend: null,
        oneRMTrend: null,
        volumeTrend: null,
      };
    }

    const maxWeight = Math.max(...filteredLogs.map((l) => l.maxWeight), 0);
    const max1RM = Math.max(...filteredLogs.map((l) => l.estimated1RM), 0);
    const maxVolume = Math.max(...filteredLogs.map((l) => l.totalVolume), 0);

    if (filteredLogs.length < 2) {
      return {
        maxWeight,
        max1RM,
        maxVolume,
        weightTrend: null,
        oneRMTrend: null,
        volumeTrend: null,
      };
    }

    const latest = filteredLogs[filteredLogs.length - 1];
    const previous = filteredLogs[filteredLogs.length - 2];

    const calcTrend = (curr: number, prev: number) => {
      const diff = curr - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;
      return {
        diff: Math.round(diff * 10) / 10,
        pct: Math.round(pct * 10) / 10,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
      };
    };

    return {
      maxWeight,
      max1RM,
      maxVolume,
      weightTrend: calcTrend(latest.maxWeight, previous.maxWeight),
      oneRMTrend: calcTrend(latest.estimated1RM, previous.estimated1RM),
      volumeTrend: calcTrend(latest.totalVolume, previous.totalVolume),
    };
  }, [filteredLogs]);

  // Frequenza di allenamento (es. "1.5 / sett.")
  const frequencyStats = useMemo(() => {
    if (filteredLogs.length === 0) return { weekly: 0, total: 0, label: '0 sedute' };
    const total = filteredLogs.length;
    if (total === 1) return { weekly: 1, total: 1, label: '1 seduta' };

    const first = new Date(filteredLogs[0].date).getTime();
    const last = new Date(filteredLogs[filteredLogs.length - 1].date).getTime();
    const diffDays = Math.max(1, Math.round((last - first) / (1000 * 60 * 60 * 24)));
    const weeks = Math.max(1, diffDays / 7);
    const weekly = Math.round((total / weeks) * 10) / 10;

    return {
      weekly,
      total,
      label: `${weekly}/sett.`,
    };
  }, [filteredLogs]);

  // Lista distretti muscolari disponibili
  const availableMuscleFilters = useMemo(() => {
    const muscles = new Set<string>();
    exerciseGroups.forEach((g) => muscles.add(g.targetMuscle));
    return Array.from(muscles);
  }, [exerciseGroups]);

  // Esercizi filtrati per chip orizzontali
  const visibleGroups = useMemo(() => {
    return exerciseGroups.filter((g) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        g.displayName.toLowerCase().includes(q) ||
        g.muscleLabel.toLowerCase().includes(q);
      const matchesMuscle =
        selectedMuscleFilter === 'all' || g.targetMuscle === selectedMuscleFilter;
      return matchesSearch && matchesMuscle;
    });
  }, [exerciseGroups, searchQuery, selectedMuscleFilter]);

  // Dettaglio giornaliero completo per la data selezionata (include tutti gli esercizi svolti quel giorno con PR arricchiti)
  const activeDayExercises = useMemo(() => {
    if (!selectedDateDetail) return [];
    const result: EnrichedLog[] = [];
    exerciseGroups.forEach((group) => {
      const match = group.logs.find((l) => l.date === selectedDateDetail);
      if (match) {
        result.push(match);
      }
    });
    if (result.length === 0) {
      return logs.filter((l) => l.date === selectedDateDetail) as EnrichedLog[];
    }
    return result;
  }, [exerciseGroups, logs, selectedDateDetail]);

  const activeDayHasPR = useMemo(() => {
    return activeDayExercises.some((ex) => ex.isPR);
  }, [activeDayExercises]);

  const activeDayTotalVolume = useMemo(() => {
    return activeDayExercises.reduce((sum, ex) => sum + (ex.totalVolume || 0), 0);
  }, [activeDayExercises]);

  // Render personalizzato per i punti con Record Personale (PR)
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const isPR = payload?.isPR;

    if (isPR) {
      return (
        <g
          key={`pr-dot-${payload.date}`}
          className="cursor-pointer"
          onClick={() => setSelectedDateDetail(payload.date)}
        >
          <circle cx={cx} cy={cy} r={8} fill="#f59e0b" fillOpacity={0.3} />
          <circle cx={cx} cy={cy} r={5} fill="#fbbf24" stroke="#ffffff" strokeWidth={2} />
        </g>
      );
    }

    return (
      <circle
        key={`dot-${payload.date}`}
        cx={cx}
        cy={cy}
        r={3.5}
        fill="#38bdf8"
        stroke="#ffffff"
        strokeWidth={1.5}
        className="cursor-pointer hover:r-5 transition-all"
        onClick={() => setSelectedDateDetail(payload.date)}
      />
    );
  };

  // Schermata vuota iniziale
  if (!logs || logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_PRESETS.modalSpring}
        className={`bg-white/[0.05] ${UI_RADII.card} p-8 border border-white/[0.12] backdrop-blur-2xl shadow-xl text-center space-y-4 relative overflow-hidden`}
      >
        <div className={SPECULAR_HIGHLIGHT} />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            title="Come funziona"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>
        </div>
        <div
          className={`w-14 h-14 ${UI_RADII.card} bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20`}
        >
          <TrendingUp className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white">Nessuna progressione ancora</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            I grafici si popolano in automatico: segna le serie come &quot;Fatta&quot; nella scheda e i tuoi progressi appariranno qui.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER COMPATTO CON TITOLO E PULSANTE '?' */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Progressione</span>
            {activeGroup && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
                {activeGroup.muscleLabel}
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-400">Storico carichi, volume e record</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pulsante '?' di aiuto */}
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => setHelpModalOpen(true)}
            className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
            title="Guida rapida ai grafici"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </motion.button>

          {/* Reset cache opzionale */}
          {onClearLogs && (
            <>
              {confirmClearOpen ? (
                <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 p-1 rounded-xl text-xs">
                  <span className="text-[10px] text-rose-300 font-bold px-1">Azzera?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearLogs();
                      setConfirmClearOpen(false);
                    }}
                    className="px-2 py-0.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-[10px] rounded-lg transition-colors"
                  >
                    Sì
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-1.5 py-0.5 text-slate-300 hover:text-white text-[10px]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={() => setConfirmClearOpen(true)}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-300 transition-all"
                  title="Svuota storico log"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>

      {/* SEZIONE 1: SELETTORE ESERCIZI COMPATTO ED ELEGANTE */}
      <div
        className={`bg-white/[0.05] ${UI_RADII.card} p-3 sm:p-4 border border-white/[0.12] backdrop-blur-2xl shadow-xl space-y-3 relative overflow-hidden`}
      >
        <div className={SPECULAR_HIGHLIGHT} />

        {/* Ricerca e Filtro Muscoli compatto */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca esercizio..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400/60 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {availableMuscleFilters.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[50%]">
              <button
                type="button"
                onClick={() => setSelectedMuscleFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedMuscleFilter === 'all'
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                Tutti
              </button>
              {availableMuscleFilters.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(m)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedMuscleFilter === m
                      ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {getMuscleLabelSafe(m as MuscleZone)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chip Orizzontali degli Esercizi */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => {
              const isSelected = group.key === activeExerciseKey;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setSelectedKey(group.key)}
                  className={`px-3 py-1.5 rounded-xl text-left whitespace-nowrap transition-all border text-xs font-bold flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-400/40'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  <span>{group.displayName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({group.logCount})
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-2 text-center text-xs text-slate-400 w-full">
              Nessun esercizio trovato
            </div>
          )}
        </div>
      </div>

      {/* CONTROLLI GRAFICO: METRICA & RANGE TEMPORALE */}
      <div className="flex items-center justify-between gap-2 flex-wrap px-1">
        {/* Toggle Carico vs Volume */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setMetricMode('weight')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              metricMode === 'weight'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Carico</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('volume')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              metricMode === 'volume'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {profile.volumeMetric === 'effective_sets' ? 'Serie Efficaci' : 'Tonnellaggio'}
            </span>
          </button>
        </div>

        {/* Selettore Periodo (4S, 3M, Tutto) */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setTimeRange('4w')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeRange === '4w'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4 Settimane
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('3m')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeRange === '3m'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Mesi
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              timeRange === 'all'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutto
          </button>
        </div>
      </div>

      {/* SEZIONE 2: GRAFICO PRINCIPALE INTERATTIVO ED ESPANDIBILE */}
      <div
        className={`bg-white/[0.05] ${UI_RADII.card} p-4 sm:p-5 border border-white/[0.12] backdrop-blur-2xl shadow-xl relative overflow-hidden`}
      >
        <div className={SPECULAR_HIGHLIGHT} />

        {/* Top bar del grafico con pulsante Espandi */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-white">
                {metricMode === 'weight'
                  ? 'Andamento Carico & 1RM'
                  : profile.volumeMetric === 'effective_sets'
                  ? 'Andamento Serie Efficaci'
                  : 'Andamento Tonnellaggio'}
              </h4>
              {metricMode === 'weight' && (
                <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Punti = PR
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {activeGroup?.displayName} • Tocca un punto per il dettaglio
            </p>
          </div>

          {/* Pulsante Espandi */}
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => setIsExpandedModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 text-xs font-bold transition-all shadow-sm"
            title="Ingrandisci grafico a schermo intero"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Espandi</span>
          </motion.button>
        </div>

        {/* CONTENITORE GRAFICO */}
        <div className="min-h-[220px] w-full flex flex-col justify-center">
          {filteredLogs.length >= 2 ? (
            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {metricMode === 'weight' ? (
                  <LineChart
                    data={filteredLogs}
                    margin={{ top: 8, right: 10, left: -18, bottom: 5 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        setSelectedDateDetail(e.activePayload[0].payload.date);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      interval="preserveStartEnd"
                      tickFormatter={formatShortDate}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      domain={[
                        (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.9)),
                        (dataMax: number) => Math.ceil(dataMax * 1.1),
                      ]}
                      unit={` ${profile.unit}`}
                    />
                    <Tooltip
                      content={
                        <CustomChartTooltip unit={profile.unit} metricMode="weight" />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="maxWeight"
                      name="Carico"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={renderCustomDot}
                      activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="estimated1RM"
                      name="1RM Stimato"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    data={filteredLogs}
                    margin={{ top: 8, right: 10, left: -10, bottom: 5 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        setSelectedDateDetail(e.activePayload[0].payload.date);
                      }
                    }}
                  >
                    <defs>
                      <linearGradient id="progressionVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      interval="preserveStartEnd"
                      tickFormatter={formatShortDate}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      unit={profile.volumeMetric === 'effective_sets' ? ' s.' : ` ${profile.unit}`}
                    />
                    <Tooltip
                      content={
                        <CustomChartTooltip
                          unit={profile.unit}
                          metricMode="volume"
                          volumeMetric={profile.volumeMetric}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="totalVolume"
                      name={
                        profile.volumeMetric === 'effective_sets'
                          ? 'Serie Efficaci'
                          : 'Tonnellaggio'
                      }
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#progressionVolumeGrad)"
                      dot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 7, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : filteredLogs.length === 1 ? (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-center space-y-3 max-w-md mx-auto my-1">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center mx-auto">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-white">1 sola sessione registrata</h5>
                <p className="text-[11px] text-slate-400">
                  La curva di progressione apparirà automaticamente dalla prossima sessione.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-black/30 rounded-lg p-2 text-left text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block">Carico</span>
                  <span className="font-extrabold text-white">
                    {filteredLogs[0].maxWeight} {profile.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">1RM</span>
                  <span className="font-extrabold text-amber-300">
                    {filteredLogs[0].estimated1RM} {profile.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">
                    {profile.volumeMetric === 'effective_sets' ? 'Serie Efficaci' : 'Tonnellaggio'}
                  </span>
                  <span className="font-extrabold text-slate-200">
                    {profile.volumeMetric === 'effective_sets'
                      ? `${filteredLogs[0].totalVolume} serie`
                      : filteredLogs[0].totalVolume > 0
                      ? `${filteredLogs[0].totalVolume.toLocaleString()} ${profile.unit}`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Nessun dato nel periodo selezionato.
            </div>
          )}
        </div>
      </div>

      {/* SEZIONE 3: METRICHE DI SUPPORTO (CARICO MAX, 1RM, VOLUME, FREQUENZA) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Carico Max */}
        <div
          className={`bg-white/[0.05] ${UI_RADII.card} p-3 border border-white/[0.1] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between`}
        >
          <div className={SPECULAR_HIGHLIGHT} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Carico Max
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-white">{stats.maxWeight}</span>
            <span className="text-[10px] font-bold text-slate-400">{profile.unit}</span>
          </div>
          {stats.weightTrend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold mt-1 ${
                stats.weightTrend.direction === 'up'
                  ? 'text-emerald-400'
                  : stats.weightTrend.direction === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {stats.weightTrend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : stats.weightTrend.direction === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>
                {stats.weightTrend.diff > 0 ? `+${stats.weightTrend.diff}` : stats.weightTrend.diff}{' '}
                {profile.unit}
              </span>
            </span>
          )}
        </div>

        {/* 1RM Stimato */}
        <div
          className={`bg-white/[0.05] ${UI_RADII.card} p-3 border border-white/[0.1] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between`}
        >
          <div className={SPECULAR_HIGHLIGHT} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            1RM Stimato
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-300">{stats.max1RM}</span>
            <span className="text-[10px] font-bold text-slate-400">{profile.unit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Formula Epley</span>
        </div>

        {/* Volume Picco / Serie Efficaci */}
        <div
          className={`bg-white/[0.05] ${UI_RADII.card} p-3 border border-white/[0.1] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between`}
        >
          <div className={SPECULAR_HIGHLIGHT} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {profile.volumeMetric === 'effective_sets' ? 'Max Serie Efficaci' : 'Picco Tonnellaggio'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-white">
              {profile.volumeMetric === 'effective_sets'
                ? stats.maxVolume
                : stats.maxVolume > 0
                ? stats.maxVolume.toLocaleString()
                : '—'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {profile.volumeMetric === 'effective_sets'
                ? 'serie'
                : stats.maxVolume > 0
                ? profile.unit
                : ''}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Miglior sessione</span>
        </div>

        {/* Frequenza */}
        <div
          className={`bg-white/[0.05] ${UI_RADII.card} p-3 border border-white/[0.1] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between`}
        >
          <div className={SPECULAR_HIGHLIGHT} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Frequenza
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-sky-400">
              {frequencyStats.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {frequencyStats.total} {frequencyStats.total === 1 ? 'sessione' : 'sessioni'}
          </span>
        </div>
      </div>

      {/* MODALE 1: GRAFICO INGRANDITO A SCHERMO INTERO CON DETTAGLIO GIORNALIERO */}
      <AnimatePresence>
        {isExpandedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={MOTION_PRESETS.modalSpring}
              className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950/95 border border-white/20 ${UI_RADII.card} p-4 sm:p-6 shadow-2xl space-y-4 relative no-scrollbar`}
            >
              <div className={SPECULAR_HIGHLIGHT} />

              {/* Intestazione Modale Espansa */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{activeGroup?.displayName}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {activeGroup?.muscleLabel}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vista espansa • Tocca un punto per vedere gli esercizi e le serie di quel giorno
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={() => setIsExpandedModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Toggle Metrica & Range dentro Vista Espansa */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setMetricMode('weight')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      metricMode === 'weight'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Carico & 1RM
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricMode('volume')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      metricMode === 'volume'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {profile.volumeMetric === 'effective_sets' ? 'Serie Efficaci' : 'Tonnellaggio'}
                  </button>
                </div>

                <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setTimeRange('4w')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      timeRange === '4w' ? 'bg-white/20 text-white' : 'text-slate-400'
                    }`}
                  >
                    4S
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('3m')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      timeRange === '3m' ? 'bg-white/20 text-white' : 'text-slate-400'
                    }`}
                  >
                    3M
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      timeRange === 'all' ? 'bg-white/20 text-white' : 'text-slate-400'
                    }`}
                  >
                    Tutto
                  </button>
                </div>
              </div>

              {/* Grafico ad Alta Risoluzione */}
              <div className="h-72 sm:h-80 w-full bg-black/30 rounded-2xl p-2 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  {metricMode === 'weight' ? (
                    <LineChart
                      data={filteredLogs}
                      margin={{ top: 12, right: 15, left: -10, bottom: 8 }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          setSelectedDateDetail(e.activePayload[0].payload.date);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickFormatter={formatShortDate}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} unit={` ${profile.unit}`} />
                      <Tooltip
                        content={<CustomChartTooltip unit={profile.unit} metricMode="weight" />}
                      />
                      <Line
                        type="monotone"
                        dataKey="maxWeight"
                        name="Carico"
                        stroke="#38bdf8"
                        strokeWidth={3.5}
                        dot={renderCustomDot}
                        activeDot={{ r: 8, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="estimated1RM"
                        name="1RM Stimato"
                        stroke="#fbbf24"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart
                      data={filteredLogs}
                      margin={{ top: 12, right: 15, left: -5, bottom: 8 }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          setSelectedDateDetail(e.activePayload[0].payload.date);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="expandedVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickFormatter={formatShortDate}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        unit={profile.volumeMetric === 'effective_sets' ? ' s.' : ` ${profile.unit}`}
                      />
                      <Tooltip
                        content={
                          <CustomChartTooltip
                            unit={profile.unit}
                            metricMode="volume"
                            volumeMetric={profile.volumeMetric}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="totalVolume"
                        name={
                          profile.volumeMetric === 'effective_sets'
                            ? 'Serie Efficaci'
                            : 'Tonnellaggio'
                        }
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#expandedVolumeGrad)"
                        dot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* SELETTORE RAPIDO DELLE SESSIONI REGISTRATE */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Seleziona una giornata di allenamento:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {filteredLogs.map((l) => {
                    const isSelected = selectedDateDetail === l.date;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedDateDetail(l.date)}
                        className={`px-3 py-1.5 rounded-xl text-left border transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-500/30 border-sky-400 text-white font-black ring-1 ring-sky-400/50'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Calendar className="w-3 h-3 text-sky-400" />
                        <span>{formatShortDate(l.date)}</span>
                        {l.isPR && <Trophy className="w-3 h-3 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PANNELLO DETTAGLIO GIORNALIERO (SE SELEZIONATO UN GIORNO) */}
              {selectedDateDetail && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <h4 className="text-sm font-black text-white">
                        {formatFullDate(selectedDateDetail)}
                      </h4>
                    </div>

                    {activeDayHasPR && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Record Personale (PR)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {activeDayExercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white">
                              {ex.exerciseName}
                            </span>
                            {ex.isPR && (
                              <span className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Trophy className="w-2.5 h-2.5" /> PR
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-300">
                            {profile.volumeMetric === 'effective_sets'
                              ? `${ex.totalVolume} serie`
                              : ex.totalVolume > 0
                              ? `${ex.totalVolume.toLocaleString()} ${profile.unit}`
                              : '—'}
                          </span>
                        </div>

                        {/* Serie effettivamente registrate */}
                        {ex.performedSets && ex.performedSets.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                            {ex.performedSets.map((s, idx) => (
                              <div
                                key={idx}
                                className={`text-[11px] px-2 py-1 rounded-lg border flex items-center justify-between ${
                                  s.setType === 'warmup'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                                    : 'bg-white/[0.04] border-white/10 text-slate-200'
                                }`}
                              >
                                <span className="font-semibold text-slate-400">
                                  {s.setType === 'warmup' ? 'R' : 'S'}
                                  {s.setNumber || idx + 1}:
                                </span>
                                <span className="font-bold">
                                  {s.weight} {profile.unit} × {s.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 pt-0.5">
                            Carico Max: <span className="text-white font-bold">{ex.maxWeight} {profile.unit}</span>
                            {ex.repsAtMax > 0 && ` (${ex.repsAtMax} reps)`} • 1RM: <span className="text-amber-300 font-bold">{ex.estimated1RM} {profile.unit}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE 2: DETTAGLIO RAPIDO GIORNALIERO (DA CLICK SU PUNTO NEL GRAFICO STANDARD) */}
      <AnimatePresence>
        {selectedDateDetail && !isExpandedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={MOTION_PRESETS.modalSpring}
              className={`w-full max-w-lg bg-slate-950 border border-white/20 ${UI_RADII.card} p-5 shadow-2xl space-y-4 relative`}
            >
              <div className={SPECULAR_HIGHLIGHT} />

              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <span>{formatFullDate(selectedDateDetail)}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {profile.volumeMetric === 'effective_sets'
                      ? `Serie efficaci totali seduta: ${activeDayTotalVolume} serie`
                      : `Tonnellaggio totale seduta: ${
                          activeDayTotalVolume > 0
                            ? activeDayTotalVolume.toLocaleString() + ' ' + profile.unit
                            : '—'
                        }`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDateDetail(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeDayHasPR && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Nuovo Record Personale raggiunto in questa seduta!</span>
                </div>
              )}

              {/* Lista esercizi svolti */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                {activeDayExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-white">
                          {ex.exerciseName}
                        </span>
                        {ex.isPR && (
                          <span className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Trophy className="w-3 h-3" /> PR
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-300">
                        {profile.volumeMetric === 'effective_sets'
                          ? `${ex.totalVolume} serie`
                          : ex.totalVolume > 0
                          ? `${ex.totalVolume.toLocaleString()} ${profile.unit}`
                          : '—'}
                      </span>
                    </div>

                    {ex.performedSets && ex.performedSets.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {ex.performedSets.map((s, idx) => (
                          <div
                            key={idx}
                            className={`text-[11px] px-2 py-1 rounded-lg border flex items-center justify-between ${
                              s.setType === 'warmup'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                                : 'bg-black/30 border-white/5 text-slate-200'
                            }`}
                          >
                            <span className="text-slate-400">
                              {s.setType === 'warmup' ? 'R' : 'S'}
                              {s.setNumber || idx + 1}:
                            </span>
                            <span className="font-bold">
                              {s.weight} {profile.unit} × {s.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Carico Max: <span className="text-white font-bold">{ex.maxWeight} {profile.unit}</span>
                        {ex.repsAtMax > 0 && ` (${ex.repsAtMax} reps)`}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDateDetail(null)}
                  className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE 3: AIUTO & SPIEGAZIONE PAGINA ("?") */}
      <AnimatePresence>
        {helpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={MOTION_PRESETS.modalSpring}
              className={`w-full max-w-md bg-slate-950 border border-white/20 ${UI_RADII.card} p-5 shadow-2xl space-y-4 relative`}
            >
              <div className={SPECULAR_HIGHLIGHT} />

              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-white">Guida Grafici</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <strong className="text-white">Grafico:</strong> Mostra l&apos;andamento del peso
                    sollevato e del volume nel tempo per l&apos;esercizio scelto.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <strong className="text-white">Punti dorati (PR):</strong> Indicano un nuovo
                    record personale raggiunto in quella seduta.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <strong className="text-white">Tocca un punto:</strong> Apre il dettaglio con
                    tutte le serie, i carichi e le ripetizioni esatte di quella giornata.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <strong className="text-white">Periodo:</strong> Filtra tra le ultime 4
                    settimane, 3 mesi o tutto lo storico registrato.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <strong className="text-white">Aggiornamento automatico:</strong> I dati si
                    salvano da soli ogni volta che segni &quot;Fatta&quot; nella scheda.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md"
                >
                  Ho capito
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
