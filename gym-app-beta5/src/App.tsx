import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Exercise,
  ProgressionLog,
  UserProfile,
  WorkoutDay,
  WorkoutRoutine,
  DeloadType,
  WorkoutSortCriterion,
} from './types';
import {
  INITIAL_PROGRESSION_HISTORY,
  INITIAL_ROUTINE,
  INITIAL_USER_PROFILE,
} from './data/mockInitialRoutine';
import { WorkoutSortSelector } from './components/WorkoutSortSelector';
import { sortExercisesByCriterion, SORT_OPTIONS } from './utils/sorting';
import { syncDayMetadata, generateDayName } from './utils/dayNaming';
import { WorkoutCarousel } from './components/WorkoutCarousel';
import { ExerciseCard } from './components/ExerciseCard';
import { SupersetGroupCard } from './components/SupersetGroupCard';
import { groupExercisesBySuperset } from './utils/superset';
import { RestTimerModal } from './components/RestTimerModal';
import { OcrModal } from './components/OcrModal';
import { AddExerciseModal } from './components/AddExerciseModal';
import { RankingsView } from './components/RankingsView';
import { ProgressionView } from './components/ProgressionView';
import { OnboardingModal } from './components/OnboardingModal';
import { DeloadModal } from './components/DeloadModal';
import { DELOAD_OPTIONS } from './data/deloadOptions';
import { getEffectiveWeight, calculateVolume, calculateExerciseVolume } from './utils/volume';
import { isAndroid, applySafeAreaInsets } from './utils/platform';
import {
  Dumbbell,
  Trophy,
  TrendingUp,
  Plus,
  Camera,
  Sparkles,
  Settings,
  Flame,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from './utils/uiPresets';

export default function App() {
  // Rilevamento piattaforma per isolamento layer GPU e ottimizzazione blur su Android
  const isAndroidDevice = useMemo(() => isAndroid(), []);

  // Local storage loading with fallback to clean slate
  const [routine, setRoutine] = useState<WorkoutRoutine>(() => {
    try {
      const saved = localStorage.getItem('gym_app_routine_v3');
      return saved ? JSON.parse(saved) : INITIAL_ROUTINE;
    } catch {
      return INITIAL_ROUTINE;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('gym_app_profile_v3');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [progressionLogs, setProgressionLogs] = useState<ProgressionLog[]>(() => {
    try {
      // Liberazione cache vecchie versioni
      localStorage.removeItem('gym_app_logs_v3');
      localStorage.removeItem('gym_app_logs_v2');
      localStorage.removeItem('gym_app_logs_v1');
      const saved = localStorage.getItem('gym_app_logs_v4');
      return saved ? JSON.parse(saved) : INITIAL_PROGRESSION_HISTORY;
    } catch {
      return INITIAL_PROGRESSION_HISTORY;
    }
  });

  const handleClearLogs = () => {
    try {
      localStorage.removeItem('gym_app_logs_v4');
      localStorage.removeItem('gym_app_logs_v3');
    } catch {}
    setProgressionLogs([]);
  };

  const [selectedDayId, setSelectedDayId] = useState<string>(routine.days[0]?.id || 'day-a');
  const [currentTab, setCurrentTab] = useState<'workout' | 'rankings' | 'progression'>('workout');

  // Modals state
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [supersetSourceExercise, setSupersetSourceExercise] = useState<Exercise | null>(null);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [deloadModalOpen, setDeloadModalOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [sortNotice, setSortNotice] = useState<string | null>(null);

  const activeDeloadConfig =
    DELOAD_OPTIONS.find((o) => o.id === (routine.deloadType || 'mixed')) || DELOAD_OPTIONS[2];

  // Auto-apri modale profilo all'avvio se il nome utente non è ancora stato inserito
  useEffect(() => {
    if (!profile.name || profile.name.trim() === '') {
      setOnboardingModalOpen(true);
    }
  }, []);

  // Sincronizzazione automatica degli spazi safe-area con il layout di sistema
  useEffect(() => {
    applySafeAreaInsets();
  }, []);

  // Timer state
  const [timerState, setTimerState] = useState<{
    isOpen: boolean;
    seconds: number;
    exerciseName: string;
  }>({
    isOpen: false,
    seconds: 90,
    exerciseName: '',
  });

  // AUTO-RESET DELLE SERIE COMPLETATE AL PASSAGGIO AL GIORNO SUCCESSIVO (dal giorno del telefono)
  useEffect(() => {
    const checkDateAndReset = () => {
      const todayString = new Date().toDateString();
      const lastRecordedDate = localStorage.getItem('gym_app_last_active_date_v1');

      if (lastRecordedDate && lastRecordedDate !== todayString) {
        // Il giorno del telefono è cambiato: azzera tutte le spunte di completamento
        setRoutine((prevRoutine) => ({
          ...prevRoutine,
          days: prevRoutine.days.map((day) => ({
            ...day,
            exercises: day.exercises.map((ex) => ({
              ...ex,
              sets: ex.sets.map((s) => ({ ...s, completed: false })),
            })),
          })),
        }));
        setResetNotice('Nuovo giorno: le spunte delle serie sono state azzerate per la nuova sessione.');
        setTimeout(() => setResetNotice(null), 5000);
      }
      localStorage.setItem('gym_app_last_active_date_v1', todayString);
    };

    checkDateAndReset();

    // Ascolta anche quando l'utente riprende il telefono o riapre l'app
    window.addEventListener('focus', checkDateAndReset);
    document.addEventListener('visibilitychange', checkDateAndReset);
    return () => {
      window.removeEventListener('focus', checkDateAndReset);
      document.removeEventListener('visibilitychange', checkDateAndReset);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gym_app_routine_v3', JSON.stringify(routine));
    } catch {}
  }, [routine]);

  useEffect(() => {
    try {
      localStorage.setItem('gym_app_profile_v3', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('gym_app_logs_v4', JSON.stringify(progressionLogs));
    } catch {}
  }, [progressionLogs]);

  const activeDay = useMemo(() => {
    return routine.days.find((d) => d.id === selectedDayId) || routine.days[0];
  }, [routine.days, selectedDayId]);

  // Calcolo memoizzato dei gruppi superset per evitare ricalcoli inutili
  const activeDayGroups = useMemo(() => {
    if (!activeDay || !activeDay.exercises) return [];
    return groupExercisesBySuperset(activeDay.exercises);
  }, [activeDay]);

  // Inserimento tramite OCR
  const handleImportOcrExercises = useCallback((newExercises: Exercise[]) => {
    setRoutine((prevRoutine) => {
      const targetDay = prevRoutine.days.find((d) => d.id === selectedDayId) || prevRoutine.days[0];
      if (!targetDay) return prevRoutine;

      const updatedDays = prevRoutine.days.map((day, idx) => {
        if (day.id === targetDay.id) {
          return syncDayMetadata(
            {
              ...day,
              exercises: [...day.exercises, ...newExercises],
            },
            idx
          );
        }
        return day;
      });
      return { ...prevRoutine, days: updatedDays };
    });
  }, [selectedDayId]);

  // Inserimento manuale esercizio (supporta anche creazione collegata in Superset)
  const handleAddManualExercise = useCallback((exercise: Exercise) => {
    setRoutine((prevRoutine) => {
      const targetDay = prevRoutine.days.find((d) => d.id === selectedDayId) || prevRoutine.days[0];
      if (!targetDay) return prevRoutine;

      if (supersetSourceExercise) {
        const newGroupId = `superset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const sourceIdx = targetDay.exercises.findIndex((e) => e.id === supersetSourceExercise.id);

        const linkedNewEx: Exercise = {
          ...exercise,
          supersetGroupId: newGroupId,
          isSuperset: true,
        };

        const list = targetDay.exercises.map((ex) => {
          if (ex.id === supersetSourceExercise.id) {
            return { ...ex, supersetGroupId: newGroupId, isSuperset: true };
          }
          return ex;
        });

        if (sourceIdx !== -1) {
          list.splice(sourceIdx + 1, 0, linkedNewEx);
        } else {
          list.push(linkedNewEx);
        }

        const updatedDays = prevRoutine.days.map((day, idx) => {
          if (day.id === targetDay.id) {
            return syncDayMetadata({ ...day, exercises: list }, idx);
          }
          return day;
        });

        return { ...prevRoutine, days: updatedDays };
      }

      const updatedDays = prevRoutine.days.map((day, idx) => {
        if (day.id === targetDay.id) {
          return syncDayMetadata(
            {
              ...day,
              exercises: [...day.exercises, exercise],
            },
            idx
          );
        }
        return day;
      });
      return { ...prevRoutine, days: updatedDays };
    });

    if (supersetSourceExercise) {
      setSortNotice(`Superset creato: ${supersetSourceExercise.name} + ${exercise.name}!`);
      setTimeout(() => setSortNotice(null), 3500);
      setSupersetSourceExercise(null);
      setAddExerciseModalOpen(false);
    }
  }, [selectedDayId, supersetSourceExercise]);

  // Collega due esercizi già presenti nella scheda di oggi in Superset
  const handleLinkExistingExercises = useCallback((sourceExerciseId: string, targetExerciseId: string) => {
    let sourceName = '';
    let targetName = '';

    setRoutine((prevRoutine) => {
      const targetDay = prevRoutine.days.find((d) => d.id === selectedDayId) || prevRoutine.days[0];
      if (!targetDay) return prevRoutine;

      const sourceIdx = targetDay.exercises.findIndex((e) => e.id === sourceExerciseId);
      const targetIdx = targetDay.exercises.findIndex((e) => e.id === targetExerciseId);
      if (sourceIdx === -1 || targetIdx === -1) return prevRoutine;

      const sourceEx = targetDay.exercises[sourceIdx];
      const targetEx = targetDay.exercises[targetIdx];
      sourceName = sourceEx.name;
      targetName = targetEx.name;

      const newGroupId = `superset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Rimuovi target dalla posizione attuale
      const list = targetDay.exercises.filter((e) => e.id !== targetExerciseId);
      const newSourceIdx = list.findIndex((e) => e.id === sourceExerciseId);

      const updatedSource = { ...sourceEx, supersetGroupId: newGroupId, isSuperset: true };
      const updatedTarget = { ...targetEx, supersetGroupId: newGroupId, isSuperset: true };

      list[newSourceIdx] = updatedSource;
      list.splice(newSourceIdx + 1, 0, updatedTarget);

      const updatedDays = prevRoutine.days.map((day) => {
        if (day.id === targetDay.id) {
          return { ...day, exercises: list };
        }
        return day;
      });

      return { ...prevRoutine, days: updatedDays };
    });

    if (sourceName && targetName) {
      setSortNotice(`Superset creato: ${sourceName} + ${targetName}!`);
      setTimeout(() => setSortNotice(null), 3500);
    }
    setSupersetSourceExercise(null);
    setAddExerciseModalOpen(false);
  }, [selectedDayId]);

  // Scollega esercizi dal Superset (tornano singoli)
  const handleUnlinkSuperset = useCallback((groupIdOrExerciseId: string) => {
    setRoutine((prevRoutine) => {
      const targetDay = prevRoutine.days.find((d) => d.id === selectedDayId) || prevRoutine.days[0];
      if (!targetDay) return prevRoutine;

      let targetGroupId = groupIdOrExerciseId;
      const targetEx = targetDay.exercises.find((e) => e.id === groupIdOrExerciseId);
      if (targetEx?.supersetGroupId) {
        targetGroupId = targetEx.supersetGroupId;
      }

      const updatedExercises = targetDay.exercises.map((e) => {
        if (e.supersetGroupId === targetGroupId) {
          return { ...e, supersetGroupId: undefined, isSuperset: false };
        }
        return e;
      });

      const updatedDays = prevRoutine.days.map((day) => {
        if (day.id === targetDay.id) {
          return { ...day, exercises: updatedExercises };
        }
        return day;
      });

      return { ...prevRoutine, days: updatedDays };
    });

    setSortNotice('Superset scollegato: gli esercizi sono ora indipendenti.');
    setTimeout(() => setSortNotice(null), 3000);
  }, [selectedDayId]);

  // Aggiornamento esercizio & sincronizzazione automatica log progressi
  const handleUpdateExercise = useCallback((updatedEx: Exercise) => {
    setRoutine((prevRoutine) => {
      const updatedDays = prevRoutine.days.map((day, idx) => {
        const hasEx = day.exercises.some((ex) => ex.id === updatedEx.id);
        if (hasEx) {
          const updatedExercises = day.exercises.map((ex) => (ex.id === updatedEx.id ? updatedEx : ex));
          return syncDayMetadata(
            {
              ...day,
              exercises: updatedExercises,
            },
            idx
          );
        }
        return day;
      });
      return { ...prevRoutine, days: updatedDays };
    });

    // Ignora esercizi di riscaldamento generico (nessun carico)
    if (updatedEx.category === 'warmup') {
      return;
    }

    // Sincronizza lo storico dei carichi solo per serie da lavoro effettive completate
    const completedSets = updatedEx.sets.filter(
      (s) => s.completed && s.reps > 0 && s.setType !== 'warmup'
    );
    if (completedSets.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      let maxWeight = 0;
      let repsAtMax = 0;

      completedSets.forEach((s) => {
        const effectiveLoad = getEffectiveWeight(updatedEx, s.weight, profile);
        const setWeight = effectiveLoad !== null ? effectiveLoad : s.weight;
        if (setWeight > maxWeight) {
          maxWeight = setWeight;
          repsAtMax = s.reps;
        } else if (setWeight === maxWeight && s.reps > repsAtMax) {
          repsAtMax = s.reps;
        }
      });

      const volRes = calculateExerciseVolume({ ...updatedEx, sets: completedSets }, profile, true);
      const totalVolume = volRes.value !== null ? volRes.value : 0;

      const estimated1RM =
        repsAtMax > 0 ? Math.round(maxWeight * (1 + repsAtMax / 30) * 10) / 10 : maxWeight;
      const trimmedExName = updatedEx.name.trim();

      const performedSets = completedSets.map((s, idx) => ({
        setNumber: s.setNumber || idx + 1,
        weight: s.weight,
        reps: s.reps,
        completed: true,
        setType: s.setType,
      }));

      setProgressionLogs((prev) => {
        const existingIdx = prev.findIndex(
          (log) =>
            log.exerciseName.trim().toLowerCase() === trimmedExName.toLowerCase() &&
            log.date === todayStr
        );

        // Calcola se è un nuovo PR rispetto allo storico passato
        const pastLogs = prev.filter(
          (log) =>
            log.exerciseName.trim().toLowerCase() === trimmedExName.toLowerCase() &&
            log.date !== todayStr
        );
        const pastMaxWeight = pastLogs.length > 0 ? Math.max(...pastLogs.map((l) => l.maxWeight)) : 0;
        const pastMax1RM = pastLogs.length > 0 ? Math.max(...pastLogs.map((l) => l.estimated1RM)) : 0;
        const isPR = pastLogs.length > 0 && (maxWeight > pastMaxWeight || estimated1RM > pastMax1RM);

        const newLog: ProgressionLog = {
          id: existingIdx >= 0 ? prev[existingIdx].id : `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: todayStr,
          exerciseName: trimmedExName,
          targetMuscle: updatedEx.targetMuscle,
          maxWeight,
          repsAtMax,
          estimated1RM,
          totalVolume,
          performedSets,
          isPR,
        };

        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = newLog;
          return copy;
        }
        return [...prev, newLog];
      });
    }
  }, [profile]);

  // Eliminazione esercizio e pulizia del gruppo superset se rimane orfano
  const handleDeleteExercise = useCallback((exerciseId: string) => {
    setRoutine((prevRoutine) => {
      const updatedDays = prevRoutine.days.map((day, idx) => {
        const deletedEx = day.exercises.find((e) => e.id === exerciseId);
        if (!deletedEx) return day;

        let remaining = day.exercises.filter((ex) => ex.id !== exerciseId);

        if (deletedEx.supersetGroupId) {
          const gId = deletedEx.supersetGroupId;
          const groupMembers = remaining.filter((e) => e.supersetGroupId === gId);
          if (groupMembers.length <= 1) {
            remaining = remaining.map((e) =>
              e.supersetGroupId === gId ? { ...e, supersetGroupId: undefined, isSuperset: false } : e
            );
          }
        }

        return syncDayMetadata(
          {
            ...day,
            exercises: remaining,
          },
          idx
        );
      });

      return { ...prevRoutine, days: updatedDays };
    });
  }, []);

  // Spostamento su/giù di un elemento o blocco superset
  const handleMoveGroupItem = useCallback((groupIndex: number, direction: -1 | 1) => {
    setRoutine((prevRoutine) => {
      const currentDay = prevRoutine.days.find((d) => d.id === selectedDayId) || prevRoutine.days[0];
      if (!currentDay) return prevRoutine;

      const groups = groupExercisesBySuperset(currentDay.exercises);
      const targetIdx = groupIndex + direction;
      if (targetIdx < 0 || targetIdx >= groups.length) return prevRoutine;

      const list = [...groups];
      const [moved] = list.splice(groupIndex, 1);
      list.splice(targetIdx, 0, moved);

      const flattened = list.flatMap((g) => g.exercises);

      const updatedDays = prevRoutine.days.map((day, idx) => {
        if (day.id === currentDay.id) {
          return syncDayMetadata({ ...day, exercises: flattened }, idx);
        }
        return day;
      });
      return { ...prevRoutine, days: updatedDays };
    });
  }, [selectedDayId]);

  const handleMoveGroupUp = useCallback((index: number) => {
    handleMoveGroupItem(index, -1);
  }, [handleMoveGroupItem]);

  const handleMoveGroupDown = useCallback((index: number) => {
    handleMoveGroupItem(index, 1);
  }, [handleMoveGroupItem]);

  // Rinomina giorno con supporto al reset del nome automatico se svuotato
  const handleUpdateDayName = useCallback((dayId: string, newName: string) => {
    setRoutine((prev) => ({
      ...prev,
      days: prev.days.map((d, index) => {
        if (d.id !== dayId) return d;
        const trimmed = newName.trim();
        if (!trimmed) {
          const dayLetter = String.fromCharCode(65 + index);
          return {
            ...d,
            name: generateDayName(d.exercises, dayLetter),
            isNameCustom: false,
          };
        }
        return {
          ...d,
          name: trimmed,
          isNameCustom: true,
        };
      }),
    }));
  }, []);

  // Aggiungi nuovo giorno
  const handleAddDay = useCallback(() => {
    setRoutine((prev) => {
      const nextIndex = prev.days.length;
      const newDay: WorkoutDay = syncDayMetadata(
        {
          id: `day-${Date.now()}`,
          name: '',
          focusMuscles: [],
          exercises: [],
          isNameCustom: false,
        },
        nextIndex
      );
      setSelectedDayId(newDay.id);
      return {
        ...prev,
        days: [...prev.days, newDay],
      };
    });
  }, []);

  // Spostamento giorno a sinistra/destra
  const handleMoveDay = useCallback((fromIndex: number, toIndex: number) => {
    setRoutine((prev) => {
      if (toIndex < 0 || toIndex >= prev.days.length) return prev;
      const list = [...prev.days];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return {
        ...prev,
        days: list.map((day, idx) => syncDayMetadata(day, idx)),
      };
    });
  }, []);

  // Elimina giorno
  const handleDeleteDay = useCallback((dayId: string) => {
    setRoutine((prev) => {
      if (prev.days.length <= 1) return prev;
      const remainingDays = prev.days.filter((d) => d.id !== dayId);
      setSelectedDayId((currId) => (currId === dayId ? remainingDays[0].id : currId));
      return {
        ...prev,
        days: remainingDays.map((day, idx) => syncDayMetadata(day, idx)),
      };
    });
  }, []);

  // Riordino selettivo degli esercizi del giorno attivo in base al criterio scelto
  const handleSortWorkout = useCallback((criterion: WorkoutSortCriterion) => {
    setRoutine((prev) => {
      const targetDay = prev.days.find((d) => d.id === selectedDayId) || prev.days[0];
      if (!targetDay || targetDay.exercises.length === 0) return prev;

      const sorted = sortExercisesByCriterion(targetDay.exercises, criterion);

      const updatedDays = prev.days.map((day) => {
        if (day.id === targetDay.id) {
          return { ...day, exercises: sorted };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });

    const option = SORT_OPTIONS.find((o) => o.id === criterion);
    const text = option ? option.noticeText : 'Scheda riorganizzata';
    setSortNotice(text);
    setTimeout(() => setSortNotice(null), 3000);
  }, [selectedDayId]);

  // Azzera manualmente le spunte del giorno attivo e il timer di recupero
  const handleResetCurrentDayChecks = useCallback(() => {
    setRoutine((prev) => {
      const targetDay = prev.days.find((d) => d.id === selectedDayId) || prev.days[0];
      if (!targetDay) return prev;

      const updatedDays = prev.days.map((day) => {
        if (day.id === targetDay.id) {
          return {
            ...day,
            exercises: day.exercises.map((ex) => ({
              ...ex,
              sets: ex.sets.map((s) => ({ ...s, completed: false })),
            })),
          };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });

    // Azzera anche il timer attivo
    setTimerState({
      isOpen: false,
      seconds: 90,
      exerciseName: '',
    });
    setResetNotice('Timer e serie completate della giornata azzerati!');
    setTimeout(() => setResetNotice(null), 3000);
  }, [selectedDayId]);

  // Toggle Superset: apre la selezione esercizio in modalità collegamento, oppure scollega se già legato
  const handleToggleSuperset = useCallback((exerciseId: string) => {
    if (!activeDay) return;
    const ex = activeDay.exercises.find((e) => e.id === exerciseId);
    if (!ex) return;

    if (ex.supersetGroupId) {
      handleUnlinkSuperset(ex.supersetGroupId);
    } else {
      setSupersetSourceExercise(ex);
      setAddExerciseModalOpen(true);
    }
  }, [activeDay, handleUnlinkSuperset]);

  // Gestione Settimana di Scarico (Deload): Apertura modale
  const handleToggleDeload = useCallback(() => {
    setDeloadModalOpen(true);
  }, []);

  // Selezione specifica del tipo di Deload (Volume, Intensità, Misto)
  const handleSelectDeload = useCallback((type: DeloadType) => {
    setRoutine((prev) => ({
      ...prev,
      isDeloadWeek: true,
      deloadType: type,
    }));
    const cfg = DELOAD_OPTIONS.find((o) => o.id === type);
    setSortNotice(cfg ? `Attivato ${cfg.name}` : 'Scarico Deload attivato');
    setTimeout(() => setSortNotice(null), 3000);
  }, []);

  // Disattivazione Deload
  const handleDisableDeload = useCallback(() => {
    setRoutine((prev) => ({
      ...prev,
      isDeloadWeek: false,
    }));
    setDeloadModalOpen(false);
    setResetNotice('Settimana di scarico disattivata: ripristinati carichi normali.');
    setTimeout(() => setResetNotice(null), 3000);
  }, []);

  // Start Rest Timer
  const handleStartRestTimer = useCallback((seconds: number, exerciseName: string) => {
    setTimerState({
      isOpen: true,
      seconds: seconds > 0 ? seconds : 90,
      exerciseName,
    });
  }, []);

  // Chiudi Rest Timer
  const handleCloseTimer = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Aggiornamento profilo utente
  const handleUpdateProfile = useCallback((p: UserProfile) => {
    setProfile(p);
  }, []);

  return (
    <div className="min-h-screen relative bg-[#090d16] text-slate-100 flex flex-col items-center justify-start">
      {/* VisionOS / Apple Glass Ambient Luminous Light Orbs (isolati su layer GPU dedicato) */}
      <div className="fixed top-[-10%] left-[15%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,transparent_70%)] pointer-events-none z-0 [transform:translateZ(0)] will-change-transform [contain:layout_paint]" />
      <div className="fixed bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)] pointer-events-none z-0 [transform:translateZ(0)] will-change-transform [contain:layout_paint]" />

      {/* Main Native Application Canvas (App vera e propria, edge-to-edge nativa) */}
      <main
        style={{
          paddingTop: 'calc(0.75rem + var(--app-safe-top, 0px))',
          paddingBottom: 'calc(7.5rem + var(--app-safe-bottom, 0px))',
        }}
        className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl min-h-screen flex flex-col relative z-10 mx-auto px-3.5 sm:px-5"
      >
        {/* Specular Refraction Accent */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Top Native App Header Bar */}
        <header className="flex items-center justify-between gap-3 pt-2 pb-3 mb-1 border-b border-white/10 relative z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setOnboardingModalOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 border border-white/20 shrink-0"
              title="Profilo e Calibrazione"
            >
              <Dumbbell className="w-5 h-5" />
            </motion.button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight break-words line-clamp-1" title={profile.name}>
                Bentornato{profile.name ? `, ${profile.name}` : ''}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium break-words line-clamp-1">
                {profile.bodyWeightKg ? `${profile.bodyWeightKg} ${profile.unit}` : ''}
                {profile.heightCm ? ` • ${profile.heightCm} cm` : ''}
                {` • ${profile.rankingMode === 'relative' ? 'Rank Relativo' : 'Rank Assoluto'}`}
              </p>
            </div>
          </div>

          {/* Quick Header Actions (Deload, Export Native, Theme, Settings) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleDeload}
              className={`text-[10px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-1.5 rounded-2xl border transition-all backdrop-blur-md flex items-center gap-1 min-h-[38px] ${
                routine.isDeloadWeek
                  ? 'bg-amber-500/30 text-amber-300 border-amber-400/50 shadow-md shadow-amber-500/20'
                  : 'bg-white/[0.06] text-slate-300 border-white/10 hover:text-white'
              }`}
              title="Gestisci e visualizza i 3 tipi di scarico (Deload)"
            >
              <Flame className={`w-3.5 h-3.5 ${routine.isDeloadWeek ? 'text-amber-400 animate-pulse' : ''}`} />
              <span>
                {routine.isDeloadWeek
                  ? activeDeloadConfig.id === 'volume'
                    ? 'Scarico Volume'
                    : activeDeloadConfig.id === 'intensity'
                    ? 'Scarico Intensità'
                    : 'Scarico Misto'
                  : 'Deload'}
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setOnboardingModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-slate-300 border border-white/10 backdrop-blur-md transition-all min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Profilo & Impostazioni"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </header>

        {/* Date Auto-Reset Notification Alert if day changed */}
        {resetNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="my-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetNotice}</span>
          </motion.div>
        )}

        {/* Toast leggero riordino scheda con testo dinamico in base al criterio */}
        {sortNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="my-2 p-3 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-bold flex items-center justify-between gap-2 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{sortNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSortNotice(null)}
              className="text-sky-300/60 hover:text-sky-200 text-xs px-1 font-normal"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Deload Week Banner if active - snello e compatto */}
        {routine.isDeloadWeek && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`my-2 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-400/40 ${UI_RADII.card} p-2.5 px-3.5 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-lg backdrop-blur-2xl relative overflow-hidden`}
          >
            <div className={SPECULAR_HIGHLIGHT} />
            <div className="flex items-center gap-2.5 min-w-0 flex-1 relative z-10">
              <div className={`w-7 h-7 ${UI_RADII.control} bg-amber-500/30 flex items-center justify-center text-amber-400 border border-amber-400/30 shrink-0 shadow-sm`}>
                <Flame className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider shrink-0">
                  Deload:
                </span>
                <span className="font-black text-white text-xs break-words line-clamp-1">
                  {activeDeloadConfig.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 relative z-10">
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.buttonHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={() => setDeloadModalOpen(true)}
                className={`px-2.5 py-1.5 ${UI_RADII.control} bg-white/[0.08] hover:bg-white/15 text-white font-extrabold text-[10px] border border-white/15 transition-all whitespace-nowrap`}
                title="Visualizza spiegazione e cambia tipo di scarico"
              >
                Cambia
              </motion.button>
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.buttonHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={handleDisableDeload}
                className={`px-2.5 py-1.5 ${UI_RADII.control} bg-amber-500/25 hover:bg-rose-500/30 text-amber-200 hover:text-rose-200 font-extrabold text-[10px] border border-amber-400/40 transition-all whitespace-nowrap`}
                title="Disattiva settimana di scarico"
              >
                Disattiva
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Animated Main Tab Content */}
        <div className="flex-1 space-y-4 pt-1">
          <AnimatePresence mode="wait">
            {currentTab === 'workout' && (
              <motion.div
                key="workout"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Contenitore Unificato: Carrello Giorni + Scheda Esercizi */}
                <div
                  className={`bg-white/[0.05] backdrop-blur-xl border border-white/10 ${UI_RADII.card} shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden`}
                >
                  <div className={SPECULAR_HIGHLIGHT} />

                  {/* Sezione Superiore: Carrello Giorni di Allenamento */}
                  <div className="p-4 sm:p-5">
                    <WorkoutCarousel
                      days={routine.days}
                      selectedDayId={selectedDayId}
                      onSelectDay={(id) => setSelectedDayId(id)}
                      onUpdateDayName={handleUpdateDayName}
                      onAddDay={handleAddDay}
                      onDeleteDay={handleDeleteDay}
                      onMoveDay={handleMoveDay}
                    />
                  </div>

                  {/* Divider Interno Sottile */}
                  <div className="border-b border-white/10" />

                  {/* Sezione Inferiore: Scheda Esercizi e Azioni */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Workout Actions Bar: Analizza e ordina, Inserisci Manuale, Foto OCR, Azzera Spunte */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {/* Selettore Ordinamento Scheda Dinamico (Apple Glass) */}
                        <WorkoutSortSelector
                          onSelectSort={handleSortWorkout}
                          disabled={!activeDay || activeDay.exercises.length === 0}
                        />

                        {/* Reset Rapido Spunte del Giorno e Timer */}
                        <motion.button
                          type="button"
                          whileHover={MOTION_PRESETS.buttonHover}
                          whileTap={MOTION_PRESETS.buttonTap}
                          onClick={handleResetCurrentDayChecks}
                          className={`flex items-center gap-1.5 px-3 py-2 ${UI_RADII.control} bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold text-xs border border-white/15 backdrop-blur-xl transition-all`}
                          title="Azzera il timer di recupero attivo e le spunte delle serie completate della giornata"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px]">Azzera timer giornata</span>
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Foto OCR */}
                        <motion.button
                          type="button"
                          whileHover={MOTION_PRESETS.buttonHover}
                          whileTap={MOTION_PRESETS.buttonTap}
                          onClick={() => setOcrModalOpen(true)}
                          className={`flex items-center gap-1.5 px-3 py-2 ${UI_RADII.control} bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-extrabold text-xs border border-white/15 backdrop-blur-xl transition-all shadow-md`}
                          title="Scansiona scheda cartacea tramite Foto OCR"
                        >
                          <Camera className="w-3.5 h-3.5 text-sky-400" />
                          <span>Foto</span>
                        </motion.button>

                        {/* Inserisci Esercizio (Manuale / Catalogo) */}
                        <motion.button
                          type="button"
                          whileHover={MOTION_PRESETS.buttonHover}
                          whileTap={MOTION_PRESETS.buttonTap}
                          onClick={() => {
                            setSupersetSourceExercise(null);
                            setAddExerciseModalOpen(true);
                          }}
                          className={`flex items-center gap-1 px-3.5 py-2 ${UI_RADII.control} bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-sm border border-sky-400/50 transition-all`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Esercizio</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Lista Esercizi */}
                    <div className="space-y-3">
                  {activeDay && activeDay.exercises.length > 0 ? (
                    <>
                      {activeDayGroups.map((group, grpIdx) => {
                        if (group.isSuperset) {
                          return (
                            <SupersetGroupCard
                              key={group.id}
                              groupId={group.id}
                              exercises={group.exercises}
                              groupIndex={grpIdx}
                              totalGroups={activeDayGroups.length}
                              profile={profile}
                              isDeload={routine.isDeloadWeek}
                              deloadType={routine.deloadType || 'mixed'}
                              onUpdateExercise={handleUpdateExercise}
                              onDeleteExercise={handleDeleteExercise}
                              onMoveGroupUp={handleMoveGroupUp}
                              onMoveGroupDown={handleMoveGroupDown}
                              onStartRestTimer={handleStartRestTimer}
                              onUnlinkSuperset={handleUnlinkSuperset}
                            />
                          );
                        }

                        const singleEx = group.exercises[0];
                        return (
                          <ExerciseCard
                            key={singleEx.id}
                            exercise={singleEx}
                            index={grpIdx}
                            totalExercises={activeDayGroups.length}
                            profile={profile}
                            isDeload={routine.isDeloadWeek}
                            deloadType={routine.deloadType || 'mixed'}
                            onUpdateExercise={handleUpdateExercise}
                            onDeleteExercise={handleDeleteExercise}
                            onMoveUp={handleMoveGroupUp}
                            onMoveDown={handleMoveGroupDown}
                            onStartRestTimer={handleStartRestTimer}
                            onToggleSuperset={handleToggleSuperset}
                            onUnlinkSuperset={handleUnlinkSuperset}
                          />
                        );
                      })}

                      <motion.button
                        type="button"
                        whileHover={MOTION_PRESETS.cardHover}
                        whileTap={MOTION_PRESETS.buttonTap}
                        onClick={() => {
                          setSupersetSourceExercise(null);
                          setAddExerciseModalOpen(true);
                        }}
                        className={`w-full py-3.5 px-4 ${UI_RADII.card} bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-sky-400/40 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all backdrop-blur-xl shadow-sm`}
                      >
                        <Plus className="w-4 h-4 text-sky-400" />
                        <span>Aggiungi un altro esercizio a questa seduta</span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={MOTION_PRESETS.modalSpring}
                      className={`bg-white/[0.04] border border-dashed border-white/20 ${UI_RADII.card} p-8 text-center space-y-3 backdrop-blur-xl shadow-xl relative overflow-hidden`}
                    >
                      <div className={SPECULAR_HIGHLIGHT} />
                      <div className={`w-14 h-14 ${UI_RADII.card} bg-white/10 mx-auto flex items-center justify-center text-slate-300 border border-white/15 shadow-sm`}>
                        <Dumbbell className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-extrabold text-white">
                        Nessun esercizio per questa seduta
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Aggiungi i tuoi esercizi manualmente specificando nome e zona muscolare, oppure scansiona la scheda cartacea con Foto OCR.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <motion.button
                          type="button"
                          whileHover={MOTION_PRESETS.buttonHover}
                          whileTap={MOTION_PRESETS.buttonTap}
                          onClick={() => setAddExerciseModalOpen(true)}
                          className={`px-4 py-2 ${UI_RADII.control} bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-sm border border-sky-400/50`}
                        >
                          Crea Esercizio a Mano
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={MOTION_PRESETS.buttonHover}
                          whileTap={MOTION_PRESETS.buttonTap}
                          onClick={() => setOcrModalOpen(true)}
                          className={`px-4 py-2 ${UI_RADII.control} bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs border border-white/15 backdrop-blur-md`}
                        >
                          Foto OCR
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

            {/* TAB 2: RANKINGS */}
            {currentTab === 'rankings' && (
              <motion.div
                key="rankings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <RankingsView
                  routine={routine}
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                />
              </motion.div>
            )}

            {/* TAB 3: PROGRESSIONE */}
            {currentTab === 'progression' && (
              <motion.div
                key="progression"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ProgressionView
                  logs={progressionLogs}
                  routine={routine}
                  profile={profile}
                  onClearLogs={handleClearLogs}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM FLOATING APPLE GLASS DOCK / TAB BAR */}
        <nav
          style={{
            bottom: 'calc(0.75rem + var(--app-safe-bottom, 0px))',
          }}
          className="fixed left-0 right-0 z-40 max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-3.5 sm:px-5 pointer-events-none [transform:translateZ(0)] will-change-transform [backface-visibility:hidden]"
        >
          <div
            className={`border border-white/[0.18] ${UI_RADII.modal} px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] pointer-events-auto relative overflow-hidden [transform:translateZ(0)] [contain:layout_paint] ${
              isAndroidDevice
                ? 'bg-slate-900/95'
                : 'bg-slate-900/90 backdrop-blur-lg'
            }`}
          >
            {/* Specular Refraction Top Border */}
            <div className={SPECULAR_HIGHLIGHT} />

            <div className="grid grid-cols-3 gap-1 relative z-10">
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.iconHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={() => setCurrentTab('workout')}
                className={`flex flex-col items-center justify-center min-h-[46px] py-1.5 ${UI_RADII.control} transition-all relative ${
                  currentTab === 'workout'
                    ? 'text-sky-300 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentTab === 'workout' && (
                  <motion.div
                    layoutId="activeDockTab"
                    className={`absolute inset-0 bg-white/10 ${UI_RADII.card} border border-white/15`}
                    transition={MOTION_PRESETS.snappySpring}
                  />
                )}
                <Dumbbell className="w-5 h-5 mb-0.5 relative z-10" />
                <span className="text-[10px] tracking-tight relative z-10">Scheda</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.iconHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={() => setCurrentTab('rankings')}
                className={`flex flex-col items-center justify-center min-h-[46px] py-1.5 ${UI_RADII.control} transition-all relative ${
                  currentTab === 'rankings'
                    ? 'text-sky-300 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentTab === 'rankings' && (
                  <motion.div
                    layoutId="activeDockTab"
                    className={`absolute inset-0 bg-white/10 ${UI_RADII.card} border border-white/15`}
                    transition={MOTION_PRESETS.snappySpring}
                  />
                )}
                <Trophy className="w-5 h-5 mb-0.5 relative z-10" />
                <span className="text-[10px] tracking-tight relative z-10">Ranking</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.iconHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={() => setCurrentTab('progression')}
                className={`flex flex-col items-center justify-center min-h-[46px] py-1.5 ${UI_RADII.control} transition-all relative ${
                  currentTab === 'progression'
                    ? 'text-sky-300 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentTab === 'progression' && (
                  <motion.div
                    layoutId="activeDockTab"
                    className={`absolute inset-0 bg-white/10 ${UI_RADII.card} border border-white/15`}
                    transition={MOTION_PRESETS.snappySpring}
                  />
                )}
                <TrendingUp className="w-5 h-5 mb-0.5 relative z-10" />
                <span className="text-[10px] tracking-tight relative z-10">Grafici</span>
              </motion.button>
            </div>
          </div>
        </nav>
      </main>

      {/* Floating / Active Rest Timer Modal (minimized floating pill sopra il dock, resettabile alla chiusura) */}
      <RestTimerModal
        isOpen={timerState.isOpen}
        initialSeconds={timerState.seconds}
        exerciseName={timerState.exerciseName}
        onClose={handleCloseTimer}
      />

      {/* OCR Camera Routine Scanner Modal */}
      <OcrModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onImportExercises={handleImportOcrExercises}
      />

      {/* Manual Search & Add Exercise Modal with custom exercise creator and superset linker */}
      <AddExerciseModal
        isOpen={addExerciseModalOpen}
        onClose={() => {
          setAddExerciseModalOpen(false);
          setSupersetSourceExercise(null);
        }}
        onAddExercise={handleAddManualExercise}
        profile={profile}
        supersetSourceExercise={supersetSourceExercise}
        currentDayExercises={activeDay ? activeDay.exercises : []}
        onLinkExistingExercise={handleLinkExistingExercises}
      />

      {/* Profile & Onboarding Settings Modal */}
      <OnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
      />

      {/* Deload Strategy & Configuration Modal */}
      <DeloadModal
        isOpen={deloadModalOpen}
        isDeloadActive={routine.isDeloadWeek}
        activeDeloadType={routine.deloadType || 'mixed'}
        onSelectDeload={handleSelectDeload}
        onDisableDeload={handleDisableDeload}
        onClose={() => setDeloadModalOpen(false)}
      />
    </div>
  );
}
