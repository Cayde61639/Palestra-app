import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Exercise, ExerciseCategory, ExerciseDefinition, MuscleZone, UserProfile, WeightMode } from '../types';
import {
  MUSCLE_LABELS,
  getAllExerciseDefinitions,
  saveUserCustomExercise,
  deleteUserCustomExercise,
} from '../data/exerciseDataset';
import {
  Search,
  Plus,
  Clock,
  ArrowLeft,
  ChevronLeft,
  X,
  Edit3,
  Check,
  FolderPlus,
  Link,
  Pencil,
  Sparkles,
  BookOpen,
  Trash2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NumericInput } from './NumericInput';
import { StyledSelect } from './StyledSelect';
import { getPlausibleSecondaryMuscles } from '../utils/dayNaming';
import { getDynamicNameSizeClass, getDynamicLineClampClass } from '../utils/textSizing';
import {
  UI_RADII,
  MOTION_PRESETS,
  SPECULAR_HIGHLIGHT,
  STEP_SLIDE_VARIANTS,
  STEP_TRANSITION,
} from '../utils/uiPresets';
import { useModalBackNavigation, isIOS } from '../utils/platform';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
  profile: UserProfile;
  supersetSourceExercise?: Exercise | null;
  currentDayExercises?: Exercise[];
  onLinkExistingExercise?: (sourceExerciseId: string, targetExerciseId: string) => void;
}

const AddExerciseModalComponent: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddExercise,
  profile,
  supersetSourceExercise = null,
  currentDayExercises = [],
  onLinkExistingExercise,
}) => {
  // Modal Mode: 'catalog' | 'configure' | 'create_custom'
  const [activeMode, setActiveMode] = useState<'catalog' | 'configure' | 'create_custom'>('catalog');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleZone | 'all' | 'warmup'>('all');
  const [selectedDef, setSelectedDef] = useState<ExerciseDefinition | null>(null);

  // Configuration form state
  const [setsCount, setSetsCount] = useState(3);
  const [repsCount, setRepsCount] = useState(10);
  const [initialWeight, setInitialWeight] = useState(20);
  const [weightMode, setWeightMode] = useState<WeightMode>('total');
  const [restSeconds, setRestSeconds] = useState(90);

  // Custom Exercise Creation Form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ExerciseCategory>('strength');
  const [customMuscle, setCustomMuscle] = useState<MuscleZone>('chest');
  const [customSecondaryMuscles, setCustomSecondaryMuscles] = useState<MuscleZone[]>([]);
  const [customEquipment, setCustomEquipment] = useState<'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'>('barbell');
  const [customWeightMode, setCustomWeightMode] = useState<WeightMode>('total');
  const [customBodyweightPct, setCustomBodyweightPct] = useState<number>(65);
  const [customSetsCount, setCustomSetsCount] = useState(3);
  const [customRepsCount, setCustomRepsCount] = useState(10);
  const [customRestSec, setCustomRestSec] = useState(90);
  const [customInitialWeight, setCustomInitialWeight] = useState(20);
  const [customNotes, setCustomNotes] = useState('');

  // Editing state for custom exercises
  const [editingCustomDef, setEditingCustomDef] = useState<ExerciseDefinition | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reload dataset including custom user-created exercises
  const allExercises = useMemo(() => getAllExerciseDefinitions(), [isOpen, refreshKey]);

  const eligibleDayExercises = useMemo(() => {
    if (!supersetSourceExercise || !currentDayExercises) return [];
    return currentDayExercises.filter(
      (ex) => ex.id !== supersetSourceExercise.id && !ex.supersetGroupId
    );
  }, [supersetSourceExercise, currentDayExercises]);

  // Esercizi personalizzati dell'utente: filtrati coerentemente con il filtro selezionato
  const customExercises = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (!ex.isCustom) return false;
      if (selectedMuscleFilter === 'warmup') {
        if (ex.category !== 'warmup') return false;
      } else if (selectedMuscleFilter !== 'all') {
        if (ex.muscle !== selectedMuscleFilter) return false;
      }
      if (!term) return true;
      return (
        ex.name.toLowerCase().includes(term) ||
        ex.italianName.toLowerCase().includes(term)
      );
    });
  }, [allExercises, searchTerm, selectedMuscleFilter]);

  // Esercizi del catalogo base: filtrati per ricerca e per muscolo/riscaldamento selezionato
  const catalogExercises = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (ex.isCustom) return false;
      const matchSearch =
        !term ||
        ex.name.toLowerCase().includes(term) ||
        ex.italianName.toLowerCase().includes(term);
      const matchMuscle =
        selectedMuscleFilter === 'all'
          ? true
          : selectedMuscleFilter === 'warmup'
          ? ex.category === 'warmup'
          : ex.muscle === selectedMuscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [allExercises, searchTerm, selectedMuscleFilter]);

  // Limite visualizzazione catalogo iniziale per annullare qualsiasi lag di montaggio DOM
  const [displayLimit, setDisplayLimit] = useState(30);

  // Reimposta limite al cambio di ricerca, filtro muscolare o apertura modale
  useEffect(() => {
    setDisplayLimit(30);
  }, [searchTerm, selectedMuscleFilter, isOpen]);

  const visibleCatalogExercises = useMemo(() => {
    if (searchTerm.trim() && catalogExercises.length <= 45) {
      return catalogExercises;
    }
    return catalogExercises.slice(0, displayLimit);
  }, [catalogExercises, displayLimit, searchTerm]);

  const filteredExercises = useMemo(() => {
    return [...customExercises, ...catalogExercises];
  }, [customExercises, catalogExercises]);

  // Caricamento progressivo allo scroll (smooth infinite load a 60fps)
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + clientHeight) < 280) {
      setDisplayLimit((prev) => (prev < catalogExercises.length ? prev + 30 : prev));
    }
  }, [catalogExercises.length]);

  // Navigazione indietro dall'header o da tasto fisico di sistema (Android / Escape)
  const handleHeaderBack = () => {
    setDirection(-1);
    if (activeMode === 'create_custom') {
      setEditingCustomDef(null);
      setShowDeleteConfirm(false);
    }
    setActiveMode('catalog');
  };

  // Connessione con il tasto fisico Android (@capacitor/app backButton) e keyboard Escape
  useModalBackNavigation(isOpen, activeMode !== 'catalog', handleHeaderBack);

  const handleSelectDefinition = (def: ExerciseDefinition) => {
    setSelectedDef(def);
    setWeightMode(def.defaultWeightMode);
    setRestSeconds(def.defaultRestSec);
    const isBodyweight = def.defaultWeightMode === 'bodyweight' || def.equipment === 'bodyweight';
    setInitialWeight(
      def.defaultWeight !== undefined
        ? def.defaultWeight
        : isBodyweight
        ? 0
        : def.defaultWeightMode === 'per_side'
        ? 14
        : 30
    );
    if (def.defaultSets !== undefined) setSetsCount(def.defaultSets);
    if (def.defaultReps !== undefined) setRepsCount(def.defaultReps);
    setDirection(1);
    setActiveMode('configure');
  };

  const handleOpenCreateCustom = (initialName: string = '') => {
    setEditingCustomDef(null);
    setShowDeleteConfirm(false);
    setCustomName(initialName);
    const isWarmupTab = selectedMuscleFilter === 'warmup';
    setCustomCategory(isWarmupTab ? 'warmup' : 'strength');
    setCustomMuscle(
      selectedMuscleFilter !== 'all' && selectedMuscleFilter !== 'warmup'
        ? selectedMuscleFilter
        : 'chest'
    );
    setCustomSecondaryMuscles([]);
    setCustomEquipment(isWarmupTab ? 'bodyweight' : 'barbell');
    setCustomWeightMode('total');
    setCustomSetsCount(isWarmupTab ? 2 : 3);
    setCustomRepsCount(isWarmupTab ? 12 : 10);
    setCustomInitialWeight(isWarmupTab ? 0 : 20);
    setCustomRestSec(isWarmupTab ? 0 : 90);
    setCustomNotes('');
    setDirection(1);
    setActiveMode('create_custom');
  };

  const handleEditCustomExercise = (def: ExerciseDefinition) => {
    setEditingCustomDef(def);
    setShowDeleteConfirm(false);
    setCustomName(def.italianName || def.name);
    setCustomCategory(def.category || 'strength');
    setCustomMuscle(def.muscle);
    const plausible = getPlausibleSecondaryMuscles(def.muscle);
    const cleanSecondary = (def.secondaryMuscles || []).filter(
      (sec) => sec !== def.muscle && (!plausible || plausible.includes(sec))
    );
    setCustomSecondaryMuscles(cleanSecondary);
    setCustomEquipment(def.equipment || 'barbell');
    setCustomWeightMode(def.defaultWeightMode || 'total');
    setCustomBodyweightPct(def.bodyweightPercentage ?? 65);
    setCustomSetsCount(def.defaultSets ?? 3);
    setCustomRepsCount(def.defaultReps ?? 10);
    setCustomInitialWeight(
      def.defaultWeight !== undefined
        ? def.defaultWeight
        : def.defaultWeightMode === 'per_side'
        ? 14
        : 20
    );
    setCustomRestSec(def.defaultRestSec ?? 90);
    setCustomNotes(def.tips?.[0] || '');
    setDirection(1);
    setActiveMode('create_custom');
  };

  const handleCancelCustomForm = () => {
    setEditingCustomDef(null);
    setShowDeleteConfirm(false);
    setDirection(-1);
    setActiveMode('catalog');
  };

  const handleDeleteCustomExercise = () => {
    if (!editingCustomDef) return;
    deleteUserCustomExercise(editingCustomDef.id);
    setRefreshKey((k) => k + 1);
    setEditingCustomDef(null);
    setShowDeleteConfirm(false);
    setDirection(-1);
    setActiveMode('catalog');
  };

  const handleConfirmAddFromCatalog = () => {
    if (!selectedDef) return;

    const isWarmupDef = selectedDef.category === 'warmup';
    const sets = Array.from({ length: setsCount }, (_, idx) => ({
      id: `set-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: idx + 1,
      reps: repsCount,
      weight: isWarmupDef ? 0 : initialWeight,
      completed: false,
      setType: 'working' as const,
    }));

    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: selectedDef.italianName,
      targetMuscle: selectedDef.muscle,
      secondaryMuscles: selectedDef.secondaryMuscles,
      weightMode: isWarmupDef ? 'total' : weightMode,
      bodyweightPercentage: selectedDef.bodyweightPercentage,
      sets,
      restTimeSeconds: restSeconds,
      warmupRestTimeSeconds: 30,
      variations: [selectedDef.name],
      equipment: selectedDef.equipment,
      category: selectedDef.category || 'strength',
    };

    onAddExercise(newEx);
    resetAndClose();
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customName.trim();
    if (!trimmedName) return;

    const isWarmup = customCategory === 'warmup';
    const isBw = customEquipment === 'bodyweight' || customWeightMode === 'bodyweight';
    const effectiveBwPct = isBw ? customBodyweightPct : undefined;

    if (editingCustomDef) {
      // Modifica esercizio custom esistente - preserva ID originale
      const updatedDef: ExerciseDefinition = {
        ...editingCustomDef,
        id: editingCustomDef.id,
        name: trimmedName,
        italianName: trimmedName,
        category: customCategory,
        muscle: customMuscle,
        secondaryMuscles: customSecondaryMuscles,
        defaultWeightMode: isWarmup ? 'total' : customWeightMode,
        defaultRestSec: customRestSec,
        equipment: customEquipment,
        bodyweightPercentage: effectiveBwPct,
        standard1RMBenchmarkKg: editingCustomDef.standard1RMBenchmarkKg || {
          bronze: 20,
          silver: 40,
          gold: 60,
          platinum: 80,
          diamond: 100,
        },
        tips: customNotes.trim() ? [customNotes.trim()] : (editingCustomDef.tips || []),
        commonMistakes: editingCustomDef.commonMistakes || [],
        isCustom: true,
        defaultSets: customSetsCount,
        defaultReps: customRepsCount,
        defaultWeight: isWarmup ? 0 : customInitialWeight,
      };

      saveUserCustomExercise(updatedDef);
      setRefreshKey((k) => k + 1);
      setEditingCustomDef(null);
      setActiveMode('catalog');
      return;
    }

    // Creazione nuovo esercizio custom
    const customDef: ExerciseDefinition = {
      id: `custom-def-${Date.now()}`,
      name: trimmedName,
      italianName: trimmedName,
      category: customCategory,
      muscle: customMuscle,
      secondaryMuscles: customSecondaryMuscles,
      defaultWeightMode: isWarmup ? 'total' : customWeightMode,
      defaultRestSec: customRestSec,
      equipment: customEquipment,
      bodyweightPercentage: effectiveBwPct,
      standard1RMBenchmarkKg: {
        bronze: 20,
        silver: 40,
        gold: 60,
        platinum: 80,
        diamond: 100,
      },
      tips: [customNotes.trim() || (isWarmup ? 'Esercizio di riscaldamento o mobilità dinamica.' : 'Esercizio personalizzato creato dall’utente.')],
      commonMistakes: [],
      isCustom: true,
      defaultSets: customSetsCount,
      defaultReps: customRepsCount,
      defaultWeight: isWarmup ? 0 : customInitialWeight,
    };

    // Save to user storage
    saveUserCustomExercise(customDef);
    setRefreshKey((k) => k + 1);

    // Create exercise instance for the routine
    const sets = Array.from({ length: customSetsCount }, (_, idx) => ({
      id: `set-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: idx + 1,
      reps: customRepsCount,
      weight: isWarmup ? 0 : customInitialWeight,
      completed: false,
      setType: 'working' as const,
    }));

    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: customDef.italianName,
      targetMuscle: customDef.muscle,
      secondaryMuscles: customDef.secondaryMuscles,
      weightMode: isWarmup ? 'total' : customWeightMode,
      bodyweightPercentage: effectiveBwPct,
      sets,
      restTimeSeconds: customRestSec,
      warmupRestTimeSeconds: 30,
      variations: [customDef.name],
      equipment: customDef.equipment,
      notes: customNotes.trim() || undefined,
      category: customCategory,
    };

    onAddExercise(newEx);
    resetAndClose();
  };

  const resetAndClose = () => {
    setActiveMode('catalog');
    setDirection(1);
    setSelectedDef(null);
    setEditingCustomDef(null);
    setShowDeleteConfirm(false);
    setSearchTerm('');
    setCustomName('');
    setCustomNotes('');
    setCustomSecondaryMuscles([]);
    onClose();
  };

  const toggleSecondaryMuscle = (m: MuscleZone) => {
    if (m === customMuscle) return;
    const plausible = getPlausibleSecondaryMuscles(customMuscle);
    if (plausible && !plausible.includes(m)) return;
    setCustomSecondaryMuscles((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe">
          {/* Backdrop glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={MOTION_PRESETS.modalSpring}
            className={`bg-slate-900/95 border border-white/[0.18] ${UI_RADII.modal} w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden relative z-10 gpu-accelerated`}
          >
            {/* Specular Top Refraction */}
            <div className={SPECULAR_HIGHLIGHT} />

            {/* Header with Mode Switcher & Back Button */}
            <div className="p-4 sm:p-5 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {activeMode !== 'catalog' && (
                  <motion.button
                    type="button"
                    whileHover={MOTION_PRESETS.iconHover}
                    whileTap={MOTION_PRESETS.buttonTap}
                    onClick={handleHeaderBack}
                    className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center border border-white/10 bg-white/5"
                    title="Torna indietro"
                    aria-label="Torna indietro"
                  >
                    {isIOS() ? (
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowLeft className="w-5 h-5" />
                    )}
                  </motion.button>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-white tracking-tight break-words">
                    {supersetSourceExercise
                      ? activeMode === 'create_custom'
                        ? editingCustomDef
                          ? 'Modifica Esercizio Personalizzato'
                          : 'Crea Nuovo Esercizio per Superset'
                        : activeMode === 'configure'
                        ? 'Parametri Superset'
                        : 'Collega Esercizio in Superset'
                      : activeMode === 'create_custom'
                      ? editingCustomDef
                        ? 'Modifica Esercizio Personalizzato'
                        : 'Crea Esercizio a Mano'
                      : activeMode === 'configure'
                      ? 'Personalizza Parametri'
                      : 'Aggiungi Esercizio'}
                  </h3>
                  <p className="text-xs text-slate-400 break-words line-clamp-1">
                    {supersetSourceExercise
                      ? editingCustomDef
                        ? `Modifica i parametri di "${editingCustomDef.italianName || editingCustomDef.name}"`
                        : `Crea un superset con "${supersetSourceExercise.name}" a recupero zero`
                      : activeMode === 'create_custom'
                      ? editingCustomDef
                        ? `Modifica "${editingCustomDef.italianName || editingCustomDef.name}" salvato nel catalogo`
                        : 'Definisci nome, muscolo, serie e recupero'
                      : activeMode === 'configure'
                      ? 'Imposta serie iniziali, carico target e recupero'
                      : `Catalogo con oltre ${allExercises.length} esercizi pronti o personalizzati`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeMode === 'catalog' && (
                  <motion.button
                    type="button"
                    whileHover={MOTION_PRESETS.buttonHover}
                    whileTap={MOTION_PRESETS.buttonTap}
                    onClick={() => handleOpenCreateCustom(searchTerm)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${UI_RADII.control} bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-bold transition-all shadow-sm shrink-0`}
                    title="Inserisci esercizio non presente"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Crea a mano</span>
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  whileHover={MOTION_PRESETS.iconHover}
                  whileTap={MOTION_PRESETS.buttonTap}
                  onClick={resetAndClose}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="Chiudi modale"
                  aria-label="Chiudi modale"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Superset Link Banner */}
            {supersetSourceExercise && (
              <div className="mx-6 mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-sky-500/15 to-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-sky-300 shrink-0">
                    <Link className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-xs block">
                      Collegamento Superset (Recupero Zero)
                    </span>
                    <span className="text-[11px] text-indigo-200/90">
                      Stai collegando con: <strong className="text-white">{supersetSourceExercise.name}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-400/25 text-indigo-200 border border-indigo-400/30">
                  Zero Rest
                </span>
              </div>
            )}

            {/* Main Content Body with Native Stack Slide Animation */}
            <div className="overflow-hidden flex-1 relative flex flex-col">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={activeMode}
                  custom={direction}
                  variants={STEP_SLIDE_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                  onScroll={handleScroll}
                  className="p-5 overflow-y-auto flex-1 space-y-4 relative z-10 no-scrollbar gpu-accelerated"
                >
                  {/* 1. CATALOG SEARCH MODE */}
                  {activeMode === 'catalog' && (
            <>
              {/* Eligible Day Exercises for Superset */}
              {supersetSourceExercise && eligibleDayExercises.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-400/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-indigo-400" />
                      Esercizi già nella scheda di oggi
                    </span>
                    <span className="text-[10px] text-indigo-300 font-bold">
                      {eligibleDayExercises.length} disponibili
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                    {eligibleDayExercises.map((dayEx) => (
                      <div
                        key={dayEx.id}
                        className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/40 transition-all flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="font-extrabold text-white text-xs break-words line-clamp-2 leading-snug" title={dayEx.name}>
                              {dayEx.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
                              {MUSCLE_LABELS[dayEx.targetMuscle]}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {dayEx.sets.length} serie impostate
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            if (onLinkExistingExercise && supersetSourceExercise) {
                              onLinkExistingExercise(supersetSourceExercise.id, dayEx.id);
                              resetAndClose();
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/30 flex items-center gap-1 border border-indigo-400/40 transition-all shrink-0"
                        >
                          <Link className="w-3 h-3" />
                          <span>Collega</span>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-[1px] flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Oppure seleziona dal catalogo
                    </span>
                    <div className="h-[1px] flex-1 bg-white/10" />
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Cerca esercizio (es. Panca, Trazioni, Squat, Curl, Dip...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors placeholder:text-slate-500"
                />
              </div>

              {/* Muscle & Warmup filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedMuscleFilter('all')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                    selectedMuscleFilter === 'all'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Tutti
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMuscleFilter('warmup')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedMuscleFilter === 'warmup'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 border border-amber-400/30'
                      : 'bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Riscaldamento</span>
                </button>
                {(Object.keys(MUSCLE_LABELS) as MuscleZone[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMuscleFilter(m)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                      selectedMuscleFilter === m
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {MUSCLE_LABELS[m]}
                  </button>
                ))}
              </div>

              {/* If no match found, show Quick Create Banner */}
              {filteredExercises.length === 0 && (
                <div className={`bg-white/[0.04] border border-white/15 ${UI_RADII.card} p-6 text-center space-y-3`}>
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-400/30">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Nessun esercizio trovato</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Vuoi inserire manualmente &quot;{searchTerm}&quot;?
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenCreateCustom(searchTerm)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-lg shadow-sky-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crea &quot;{searchTerm || 'Nuovo Esercizio'}&quot; a mano</span>
                  </motion.button>
                </div>
              )}

              {/* SECTION 1: I miei esercizi (mostrata solo se ce ne sono) */}
              {customExercises.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-black text-white tracking-wider uppercase">
                        I miei esercizi
                      </h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/25 text-sky-300 border border-sky-400/30">
                        {customExercises.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Creati da te</span>
                  </div>

                  <div className="space-y-2">
                    {customExercises.map((def) => (
                      <div
                        key={def.id}
                        onClick={() => handleSelectDefinition(def)}
                        className={`p-3.5 sm:p-4 ${UI_RADII.card} bg-gradient-to-r from-sky-500/10 via-white/[0.04] to-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] border border-sky-400/30 hover:border-sky-400/60 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group shadow-sm`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/25 text-sky-300 border border-sky-400/30 shrink-0">
                              {MUSCLE_LABELS[def.muscle]}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize shrink-0">
                              {def.equipment}
                            </span>
                            {def.category === 'warmup' && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>Riscaldamento</span>
                              </span>
                            )}
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
                              Personalizzato
                            </span>
                          </div>
                          <h4 className={`${getDynamicNameSizeClass(def.italianName, 'catalog')} ${getDynamicLineClampClass(def.italianName, 'catalog')} font-extrabold text-white group-hover:text-sky-300 transition-colors break-words leading-snug`}>
                            {def.italianName}
                          </h4>
                          {def.tips?.[0] ? (
                            <span className="text-xs text-slate-400 block break-words line-clamp-1 mt-0.5 italic">
                              {def.tips[0]}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 block break-words line-clamp-1 mt-0.5">
                              {def.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Pulsante di modifica: presente solo sugli esercizi custom */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomExercise(def);
                            }}
                            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-white/10 hover:bg-sky-500/30 active:scale-95 text-slate-300 hover:text-sky-300 border border-white/15 hover:border-sky-400/50 transition-all shadow-sm flex items-center gap-1.5"
                            title="Modifica esercizio personalizzato"
                            aria-label={`Modifica ${def.italianName}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold hidden sm:inline">Modifica</span>
                          </button>

                          {/* Pulsante aggiungi */}
                          <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center text-slate-300 transition-all shadow-sm">
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: Catalogo (esercizi predefiniti) */}
              {catalogExercises.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center border border-white/10">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-black text-slate-300 tracking-wider uppercase">
                        Catalogo
                      </h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-slate-400 border border-white/10">
                        {catalogExercises.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Predefiniti</span>
                  </div>

                  <div className="space-y-2">
                    {visibleCatalogExercises.map((def) => (
                      <div
                        key={def.id}
                        onClick={() => handleSelectDefinition(def)}
                        className={`p-3.5 sm:p-4 ${UI_RADII.card} bg-white/[0.04] hover:bg-white/[0.09] active:scale-[0.99] border border-white/[0.1] hover:border-sky-400/50 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
                              {MUSCLE_LABELS[def.muscle]}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize shrink-0">
                              {def.equipment}
                            </span>
                            {def.category === 'warmup' && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>Riscaldamento</span>
                              </span>
                            )}
                          </div>
                          <h4 className={`${getDynamicNameSizeClass(def.italianName, 'catalog')} ${getDynamicLineClampClass(def.italianName, 'catalog')} font-extrabold text-white group-hover:text-sky-300 transition-colors break-words leading-snug`}>
                            {def.italianName}
                          </h4>
                          <span className="text-xs text-slate-400 block break-words line-clamp-1 mt-0.5">{def.name}</span>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center text-slate-300 transition-all shadow-sm shrink-0">
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    ))}

                    {/* Tasto Carica Altri se ci sono ulteriori esercizi non ancora caricati dallo scroll */}
                    {catalogExercises.length > visibleCatalogExercises.length && (
                      <button
                        type="button"
                        onClick={() => setDisplayLimit((prev) => Math.min(prev + 40, catalogExercises.length))}
                        className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] border border-white/10 text-xs font-bold text-sky-400 text-center transition-all flex items-center justify-center gap-2"
                      >
                        <span>Mostra altri ({catalogExercises.length - visibleCatalogExercises.length} rimanenti)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 2. CONFIGURE SELECTED EXERCISE FROM CATALOG */}
          {activeMode === 'configure' && selectedDef && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className={`p-4.5 ${UI_RADII.card} border shadow-lg ${
                selectedDef.category === 'warmup'
                  ? 'bg-amber-500/10 border-amber-400/40 shadow-amber-500/10'
                  : 'bg-white/[0.06] border-sky-400/40'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    selectedDef.category === 'warmup' ? 'text-amber-400' : 'text-sky-400'
                  }`}>
                    {MUSCLE_LABELS[selectedDef.muscle]}
                  </span>
                  {selectedDef.category === 'warmup' && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Riscaldamento & Mobilità</span>
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {selectedDef.italianName}
                </h4>
                {selectedDef.tips?.[0] && (
                  <p className="text-xs text-slate-300 mt-1">{selectedDef.tips[0]}</p>
                )}
              </div>

              {selectedDef.category === 'warmup' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Sets Count */}
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Numero di Serie
                      </label>
                      <NumericInput
                        min={1}
                        max={10}
                        fallbackValue={1}
                        value={setsCount}
                        onChange={setSetsCount}
                        className="w-full bg-black/40 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none"
                      />
                    </div>

                    {/* Reps Count */}
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Ripetizioni Target
                      </label>
                      <NumericInput
                        min={1}
                        max={50}
                        fallbackValue={1}
                        value={repsCount}
                        onChange={setRepsCount}
                        className="w-full bg-black/40 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Warmup notice card */}
                  <div className="bg-amber-500/10 border border-amber-400/30 p-3.5 rounded-2xl flex items-start gap-2.5">
                    <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-200 block">
                        Mobilità & Attivazione Dinamica
                      </span>
                      <span className="text-[11px] text-amber-300/80 leading-relaxed block mt-0.5">
                        Questo esercizio serve a preparare articolazioni e muscoli prima del workout. Non richiede carico con pesi e non influisce sul ranking o progressione di forza.
                      </span>
                    </div>
                  </div>

                  {/* Rest Time */}
                  <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Pausa tra le Serie (Opzionale)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {restSeconds <= 0 ? 'Disattivata (flusso continuo)' : `${restSeconds} secondi di recupero`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/15">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <NumericInput
                        step="5"
                        min={0}
                        fallbackValue={0}
                        value={restSeconds}
                        onChange={setRestSeconds}
                        className="w-12 bg-transparent text-white font-extrabold text-center focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">sec</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Sets Count */}
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Numero di Serie
                      </label>
                      <NumericInput
                        min={1}
                        max={10}
                        fallbackValue={1}
                        value={setsCount}
                        onChange={setSetsCount}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none"
                      />
                    </div>

                    {/* Reps Count */}
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Ripetizioni Target
                      </label>
                      <NumericInput
                        min={1}
                        max={50}
                        fallbackValue={1}
                        value={repsCount}
                        onChange={setRepsCount}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none"
                      />
                    </div>

                    {/* Initial Weight */}
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Carico Iniziale ({profile.unit})
                      </label>
                      <NumericInput
                        step="0.5"
                        min={0}
                        allowDecimals
                        fallbackValue={0}
                        value={initialWeight}
                        onChange={setInitialWeight}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none"
                      />
                    </div>

                    {/* Weight Mode */}
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Modalità Peso
                      </label>
                      <StyledSelect
                        value={weightMode}
                        onChange={(e) => setWeightMode(e.target.value as WeightMode)}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-2 py-2 text-white font-bold text-xs focus:outline-none"
                      >
                        <option value="total">Totale (Bilanciere / Macchina)</option>
                        <option value="per_side">Per Lato (Manubri x2)</option>
                        <option value="bodyweight">Corpo Libero</option>
                      </StyledSelect>
                    </div>
                  </div>

                  {(weightMode === 'bodyweight' || selectedDef.equipment === 'bodyweight') && (
                    <div className="bg-sky-500/10 border border-sky-400/25 p-3 rounded-2xl">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-200 mb-1">
                        <span>Esercizio a Corpo Libero</span>
                        <span className="text-[11px] text-sky-300">
                          {selectedDef.bodyweightPercentage || 65}% BW (~{Math.round(((profile.bodyWeightKg || 75) * (selectedDef.bodyweightPercentage || 65)) / 100)} {profile.unit})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Il carico effettivo considera la percentuale del tuo peso corporeo. Nel campo "Carico Iniziale" inserisci l'eventuale <strong>zavorra</strong> aggiuntiva (0 se a peso naturale).
                      </p>
                    </div>
                  )}

                  {/* Suggested Rest Time */}
                  <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Tempo di Recupero Consigliato
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Suggerito automaticamente dal benchmark
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/15">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <NumericInput
                        step="15"
                        min={15}
                        fallbackValue={60}
                        value={restSeconds}
                        onChange={setRestSeconds}
                        className="w-12 bg-transparent text-white font-extrabold text-center focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">sec</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* 3. CREATE CUSTOM EXERCISE MANUALLY FORM */}
          {activeMode === 'create_custom' && (
            <motion.form
              onSubmit={handleCreateCustomExercise}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Exercise Category (Tipo di Esercizio) */}
              <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 space-y-2`}>
                <label className="text-xs font-extrabold text-white block">
                  Tipologia Esercizio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCategory('strength');
                      if (customEquipment === 'bodyweight' && customInitialWeight === 0) {
                        setCustomEquipment('barbell');
                        setCustomInitialWeight(20);
                        setCustomRestSec(90);
                      }
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                      customCategory === 'strength'
                        ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <span className="block font-extrabold text-white">Esercizio da Lavoro</span>
                      <span className="text-[10px] text-slate-400">Con carico, progressione e ranking</span>
                    </div>
                    {customCategory === 'strength' && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomCategory('warmup');
                      setCustomEquipment('bodyweight');
                      setCustomInitialWeight(0);
                      setCustomRestSec(0);
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                      customCategory === 'warmup'
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <span className="block font-extrabold text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Riscaldamento
                      </span>
                      <span className="text-[10px] text-slate-400">Mobilità & attivazione dinamica</span>
                    </div>
                    {customCategory === 'warmup' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Exercise Name */}
              <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 space-y-2`}>
                <label className="text-xs font-extrabold text-white block">
                  Nome dell&apos;Esercizio *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    customCategory === 'warmup'
                      ? 'Es. Circonduzioni Spalle, World Greatest Stretch, Cat-Cow...'
                      : 'Es. Spinte Manubri su Panca Inclinata, Dip Zavorrate...'
                  }
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-2xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Target Muscle Selection (Zona Muscolare Principale) */}
              <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 space-y-2`}>
                <label className="text-xs font-extrabold text-white block">
                  Zona Muscolare Principale Coinvolta *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(MUSCLE_LABELS) as MuscleZone[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setCustomMuscle(m);
                        const plausible = getPlausibleSecondaryMuscles(m);
                        setCustomSecondaryMuscles((prev) =>
                          prev.filter((item) => item !== m && (!plausible || plausible.includes(item)))
                        );
                      }}
                      className={`p-2.5 rounded-2xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                        customMuscle === m
                          ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm'
                          : 'bg-black/30 border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{MUSCLE_LABELS[m]}</span>
                      {customMuscle === m && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Muscles (Opzionali) con filtro di plausibilità biomeccanica */}
              <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 space-y-2`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-300 block">
                    Muscoli Secondari / Sinergici (Opzionale)
                  </label>
                  {getPlausibleSecondaryMuscles(customMuscle) && (
                    <span className="text-[10px] text-sky-400/90 font-bold uppercase tracking-wider">
                      Sinergie biomeccaniche
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(MUSCLE_LABELS) as MuscleZone[])
                    .filter((m) => m !== customMuscle)
                    .map((m) => {
                      const isSelected = customSecondaryMuscles.includes(m);
                      const plausibleList = getPlausibleSecondaryMuscles(customMuscle);
                      const isPlausible = !plausibleList || plausibleList.includes(m);

                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={!isPlausible}
                          onClick={() => isPlausible && toggleSecondaryMuscle(m)}
                          title={
                            !isPlausible
                              ? `Non comune come muscolo sinergico per ${MUSCLE_LABELS[customMuscle as keyof typeof MUSCLE_LABELS] || customMuscle}`
                              : undefined
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            !isPlausible
                              ? 'opacity-25 cursor-not-allowed bg-black/20 border-white/5 text-slate-500'
                              : isSelected
                              ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-sm'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {isSelected ? '✓ ' : isPlausible ? '+ ' : ''}
                          {MUSCLE_LABELS[m]}
                        </button>
                      );
                    })}
                </div>
              </div>

              {customCategory === 'warmup' ? (
                /* Warmup Exercise Configuration */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Serie</label>
                      <NumericInput
                        min={1}
                        max={10}
                        fallbackValue={2}
                        value={customSetsCount}
                        onChange={setCustomSetsCount}
                        className="w-full bg-black/40 border border-white/15 focus:border-amber-400 rounded-xl py-1.5 text-white font-bold text-center focus:outline-none text-xs"
                      />
                    </div>

                    <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Reps Target</label>
                      <NumericInput
                        min={1}
                        max={50}
                        fallbackValue={12}
                        value={customRepsCount}
                        onChange={setCustomRepsCount}
                        className="w-full bg-black/40 border border-white/15 focus:border-amber-400 rounded-xl py-1.5 text-white font-bold text-center focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-400/30 p-3 rounded-2xl flex items-start gap-2.5">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-200 block">
                        Mobilità & Riscaldamento Dinamico
                      </span>
                      <span className="text-[11px] text-amber-300/80 leading-relaxed block mt-0.5">
                        Gli esercizi di riscaldamento vengono eseguiti a corpo libero o con elastici/bastone, non contano nel calcolo del volume e non influenzano il ranking di forza.
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Riposo (sec)</label>
                      <span className="text-[11px] text-slate-400">
                        {customRestSec <= 0 ? 'Disattivato (flusso continuo)' : `${customRestSec} sec`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/15">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <NumericInput
                        step="5"
                        min={0}
                        fallbackValue={0}
                        value={customRestSec}
                        onChange={setCustomRestSec}
                        className="w-12 bg-transparent text-white font-extrabold text-center focus:outline-none text-xs"
                      />
                      <span className="text-xs text-slate-400">sec</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Strength Exercise Configuration */
                <>
                  {/* Equipment & Weight Mode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Attrezzatura
                      </label>
                      <StyledSelect
                        value={customEquipment}
                        onChange={(e) => setCustomEquipment(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-2 py-2 text-white font-bold text-xs focus:outline-none"
                      >
                        <option value="barbell">Bilanciere</option>
                        <option value="dumbbell">Manubri</option>
                        <option value="cable">Cavi</option>
                        <option value="machine">Macchina</option>
                        <option value="bodyweight">Corpo Libero</option>
                      </StyledSelect>
                    </div>

                    <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Modalità Peso
                      </label>
                      <StyledSelect
                        value={customWeightMode}
                        onChange={(e) => setCustomWeightMode(e.target.value as WeightMode)}
                        className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-2 py-2 text-white font-bold text-xs focus:outline-none"
                      >
                        <option value="total">Totale (Bilanciere / Macchina)</option>
                        <option value="per_side">Per Lato (Manubri x2)</option>
                        <option value="bodyweight">Corpo Libero</option>
                      </StyledSelect>
                    </div>
                  </div>

                  {(customEquipment === 'bodyweight' || customWeightMode === 'bodyweight') && (
                    <div className="bg-sky-500/10 border border-sky-400/30 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-sky-200 block">
                          % Peso Corporeo Sollevata
                        </label>
                        <span className="text-[10px] text-sky-300 font-bold bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-400/30">
                          Default: 65%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <NumericInput
                          min={0}
                          max={100}
                          fallbackValue={65}
                          value={customBodyweightPct}
                          onChange={setCustomBodyweightPct}
                          className="w-24 bg-black/40 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-white font-bold text-center text-sm focus:outline-none"
                        />
                        <span className="text-xs font-extrabold text-white">
                          % del peso corporeo (~{Math.round(((profile.bodyWeightKg || 75) * (customBodyweightPct || 65)) / 100)} {profile.unit})
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-300/80 leading-relaxed">
                        Percentuale stimata del tuo peso corporeo sollevata nel movimento (65% è il valore tipico per appoggio mani/piedi tipo piegamenti). Puoi personalizzarla liberamente.
                      </p>
                    </div>
                  )}

                  {/* Initial Sets, Reps, Weight & Rest */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Serie</label>
                      <NumericInput
                        min={1}
                        max={12}
                        fallbackValue={1}
                        value={customSetsCount}
                        onChange={setCustomSetsCount}
                        className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 text-white font-bold text-center focus:outline-none text-xs"
                      />
                    </div>

                    <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Reps</label>
                      <NumericInput
                        min={1}
                        max={100}
                        fallbackValue={1}
                        value={customRepsCount}
                        onChange={setCustomRepsCount}
                        className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 text-white font-bold text-center focus:outline-none text-xs"
                      />
                    </div>

                    <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Carico ({profile.unit})
                      </label>
                      <NumericInput
                        step="0.5"
                        min={0}
                        allowDecimals
                        fallbackValue={0}
                        value={customInitialWeight}
                        onChange={setCustomInitialWeight}
                        className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 text-white font-bold text-center focus:outline-none text-xs"
                      />
                    </div>

                    <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10">
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Riposo (sec)
                      </label>
                      <NumericInput
                        step="15"
                        min={0}
                        fallbackValue={60}
                        value={customRestSec}
                        onChange={setCustomRestSec}
                        className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 text-white font-bold text-center focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Notes / Tips */}
              <div className={`bg-white/[0.04] p-4 ${UI_RADII.card} border border-white/10 space-y-1.5`}>
                <label className="text-xs font-bold text-slate-300 block">
                  Note di Esecuzione / Suggerimenti (Opzionale)
                </label>
                <textarea
                  rows={2}
                  placeholder="Es. Schienale a 30°, gomiti vicini al busto, discesa controllata..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 focus:border-sky-400 rounded-2xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Submit Button & Delete Option */}
              <div className="pt-2 space-y-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={!customName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 border border-sky-400/40 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  {editingCustomDef ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Salva Modifiche</span>
                    </>
                  ) : supersetSourceExercise ? (
                    <>
                      <Link className="w-5 h-5" />
                      <span>Salva e Collega in Superset</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Salva e Aggiungi alla Scheda</span>
                    </>
                  )}
                </motion.button>

                {/* Delete Custom Exercise Button (only when editing existing custom exercise) */}
                {editingCustomDef && (
                  <div className="pt-1">
                    {!showDeleteConfirm ? (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Elimina questo esercizio dal catalogo</span>
                      </motion.button>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-2.5">
                        <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>Sei sicuro di voler eliminare definitivamente questo esercizio dal catalogo?</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all"
                          >
                            Annulla
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteCustomExercise}
                            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Elimina</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.form>
          )}
                </motion.div>
              </AnimatePresence>
            </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/40 flex items-center justify-between relative z-10">
          {activeMode === 'configure' ? (
            <>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setDirection(-1);
                  setActiveMode('catalog');
                }}
                className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all border border-white/15"
              >
                {isIOS() ? <ChevronLeft className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>Indietro</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmAddFromCatalog}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/30 border border-sky-400/40 transition-all"
              >
                {supersetSourceExercise ? <Link className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>
                  {supersetSourceExercise
                    ? 'Collega in Superset'
                    : 'Aggiungi alla Giornata'}
                </span>
              </motion.button>
            </>
          ) : activeMode === 'create_custom' ? (
            <div className="w-full flex items-center justify-between">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={handleCancelCustomForm}
                className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all border border-white/15"
              >
                {isIOS() ? <ChevronLeft className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{editingCustomDef ? 'Annulla Modifica' : 'Torna al Catalogo'}</span>
              </motion.button>

              <span className="text-[11px] text-slate-400 font-medium">
                {editingCustomDef
                  ? 'Le modifiche aggiorneranno l’esercizio nel catalogo'
                  : 'Verrà salvato nel tuo catalogo'}
              </span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Non trovi il tuo esercizio?{' '}
                <button
                  type="button"
                  onClick={() => handleOpenCreateCustom(searchTerm)}
                  className="text-sky-400 hover:underline font-bold"
                >
                  Crealo qui
                </button>
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={resetAndClose}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all border border-white/15"
              >
                Chiudi
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};

export const AddExerciseModal = React.memo(AddExerciseModalComponent);
