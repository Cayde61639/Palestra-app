import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, Maximize2, Minimize2, Check } from 'lucide-react';
import { playChimeSound } from '../utils/ranking';
import { motion } from 'motion/react';
import { isAndroid } from '../utils/platform';
import { UI_RADII, MOTION_PRESETS, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';
import { getDynamicNameSizeClass, getDynamicLineClampClass } from '../utils/textSizing';

interface RestTimerProps {
  initialSeconds: number;
  exerciseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RestTimerModal = React.memo<RestTimerProps>(({
  initialSeconds,
  exerciseName,
  isOpen,
  onClose,
}) => {
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Direct small icon / pill mode by default as requested
  const [isMinimized, setIsMinimized] = useState(true);

  // Rilevamento piattaforma per isolamento layer GPU e ottimizzazione blur su Android
  const isAndroidDevice = useMemo(() => isAndroid(), []);

  // Timestamp di termine previsto del countdown (Date.now() + residuo ms)
  const endTimeRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Inizializzazione all'apertura del timer o al cambio della durata configurata
  useEffect(() => {
    if (isOpen) {
      setTotalTime(initialSeconds);
      setTimeLeft(initialSeconds);
      setIsActive(true);
      setIsMinimized(true);
      endTimeRef.current = Date.now() + initialSeconds * 1000;
    } else {
      endTimeRef.current = null;
    }
  }, [initialSeconds, isOpen]);

  // Gestione countdown ad intervallo singolo e stabile:
  // L'effetto dipende solo da [isActive, isOpen], NON si distrugge/ricrea ad ogni secondo
  useEffect(() => {
    if (!isOpen || !isActive) {
      endTimeRef.current = null;
      return;
    }

    // Se si riparte da pausa, imposta il target temporale in base al residuo corrente
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
    }

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        setIsActive(false);
        endTimeRef.current = null;
        if (soundEnabledRef.current) {
          playChimeSound('timer');
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([200, 100, 200, 100, 400]);
          } catch {
            // Ignora se la vibrazione non è supportata dal browser
          }
        }
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progressPct = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;
  const strokeDashoffset = 264 - (264 * progressPct) / 100;

  const addSeconds = (secs: number) => {
    setTimeLeft((prev) => {
      const next = prev + secs;
      if (isActive) {
        endTimeRef.current = Date.now() + next * 1000;
      }
      setTotalTime((prevTotal) => Math.max(prevTotal, next));
      return next;
    });
  };

  const handleToggleActive = () => {
    setIsActive((prev) => {
      const next = !prev;
      if (next) {
        endTimeRef.current = Date.now() + timeLeftRef.current * 1000;
      } else {
        endTimeRef.current = null;
      }
      return next;
    });
  };

  const handleReset = () => {
    setTimeLeft(totalTime);
    setIsActive(true);
    endTimeRef.current = Date.now() + totalTime * 1000;
  };

  // Reset e chiusura del timer
  const handleCloseAndReset = () => {
    endTimeRef.current = null;
    setTimeLeft(initialSeconds);
    setIsActive(false);
    setIsMinimized(true);
    onClose();
  };

  // 1. DIRECT COMPACT FLOATING ICON / PILL (POSITIONED CLEANLY ABOVE BOTTOM DOCK)
  if (isMinimized) {
    return (
      <motion.aside
        aria-label="Timer di recupero compatto"
        initial={{ y: 25, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 25, opacity: 0, scale: 0.9 }}
        style={{
          bottom: 'calc(5.5rem + var(--app-safe-bottom, 0px))',
        }}
        className={`fixed right-3.5 sm:right-6 border border-sky-400/50 rounded-full p-2 pl-3.5 pr-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.3)] z-40 flex items-center gap-2.5 [transform:translateZ(0)] will-change-transform [contain:layout_paint] [backface-visibility:hidden] ${
          isAndroidDevice
            ? 'bg-slate-900/95'
            : 'bg-slate-900/90 backdrop-blur-md'
        }`}
      >
        {/* Ring & Time display */}
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 text-left group"
          title="Tocca per ingrandire il timer"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors shadow-sm ${
              timeLeft === 0
                ? 'bg-emerald-500 text-white animate-bounce'
                : isActive
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60'
                : 'bg-white/10 text-slate-300 border border-white/20'
            }`}
          >
            {timeLeft === 0 ? <Check className="w-4 h-4" /> : formattedTime}
          </div>

          <div className="max-w-[140px] sm:max-w-[200px] min-w-0 leading-tight">
            <span className="text-[9px] text-sky-400 font-extrabold uppercase tracking-wider block">
              {timeLeft === 0 ? 'Finito' : isActive ? 'Recupero' : 'Pausa'}
            </span>
            <span
              className="text-[11px] font-bold text-white truncate block group-hover:text-sky-300 transition-colors"
              title={exerciseName}
            >
              {exerciseName}
            </span>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1 border-l border-white/15 pl-1.5">
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={handleToggleActive}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title={isActive ? 'Pausa' : 'Riprendi'}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </motion.button>

          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.buttonHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => addSeconds(30)}
            className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-sky-500/25 text-sky-300 border border-sky-500/40 hover:bg-sky-500/40 transition-colors"
            title="Aggiungi 30 secondi"
          >
            +30s
          </motion.button>

          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Ingrandisci a schermo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </motion.button>

          {/* Close button: always available in small mode as requested, and resets timer */}
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={handleCloseAndReset}
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Chiudi e azzera timer"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.aside>
    );
  }

  // 2. EXPANDED FULL-SCREEN MODAL
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto pt-safe pb-safe">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={MOTION_PRESETS.modalSpring}
        className={`bg-slate-900/95 border border-white/[0.18] ${UI_RADII.modal} p-4 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.35)] backdrop-blur-2xl relative text-center`}
      >
        {/* Specular Edge Refraction */}
        <div className={SPECULAR_HIGHLIGHT} />

        {/* Ambient background radial gradient orbs (più leggeri per la GPU rispetto ai filtri blur pesanti) */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[radial-gradient(circle,rgba(56,189,248,0.22)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_70%)] pointer-events-none" />

        {/* Top bar controls */}
        <div className="flex items-center justify-between text-slate-400 mb-2 relative z-10">
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 ${UI_RADII.card} hover:text-white hover:bg-white/10 transition-colors`}
            title={soundEnabled ? 'Disattiva suono' : 'Attiva suono'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-sky-400" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </motion.button>

          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-300">
            Recupero Attivo
          </span>

          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.iconHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={() => setIsMinimized(true)}
              className={`p-2 ${UI_RADII.card} hover:text-white hover:bg-white/10 transition-colors`}
              title="Riduci a icona piccola"
            >
              <Minimize2 className="w-4 h-4" />
            </motion.button>

            {/* ONLY show the X in expanded view when the timer is finished (timeLeft === 0) */}
            {timeLeft === 0 && (
              <motion.button
                type="button"
                whileHover={MOTION_PRESETS.iconHover}
                whileTap={MOTION_PRESETS.buttonTap}
                onClick={handleCloseAndReset}
                className={`p-2 ${UI_RADII.card} hover:text-rose-400 hover:bg-white/10 transition-colors`}
                title="Chiudi e azzera timer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Exercise name */}
        <h4
          className={`${getDynamicNameSizeClass(exerciseName, 'modal')} ${getDynamicLineClampClass(exerciseName, 'modal')} font-extrabold text-white mb-6 break-words leading-snug px-2 relative z-10 transition-[font-size,line-height] duration-200`}
          title={exerciseName}
        >
          {exerciseName}
        </h4>

        {/* Circular Progress Ring */}
        <div className="relative w-52 h-52 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-white/10"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className={`transition-all duration-300 ease-out ${
                timeLeft === 0 ? 'stroke-emerald-400' : 'stroke-sky-400'
              }`}
              strokeWidth="6"
              strokeDasharray={264}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter:
                  timeLeft === 0
                    ? 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.8))'
                    : 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.7))',
              }}
            />
          </svg>

          {/* Central Counter Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-black tracking-tighter tabular-nums ${
                timeLeft === 0 ? 'text-emerald-400 animate-bounce' : 'text-white'
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {timeLeft === 0 ? 'Recupero completato!' : isActive ? 'Riposo in corso' : 'In Pausa'}
            </span>
          </div>
        </div>

        {/* Quick Add Time Pills */}
        <div className="flex items-center justify-center gap-2 mb-6 relative z-10">
          {[15, 30, 60].map((sec) => (
            <motion.button
              key={sec}
              type="button"
              whileHover={MOTION_PRESETS.buttonHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={() => addSeconds(sec)}
              className={`px-3.5 py-1.5 ${UI_RADII.pill} text-xs font-extrabold bg-white/10 hover:bg-white/20 text-sky-300 border border-white/15 backdrop-blur-md transition-all shadow-sm`}
            >
              +{sec}s
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 relative z-10">
          <motion.button
            type="button"
            whileHover={MOTION_PRESETS.iconHover}
            whileTap={MOTION_PRESETS.buttonTap}
            onClick={handleReset}
            className={`p-3.5 ${UI_RADII.card} bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md transition-all`}
            title="Azzera e riavvia"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {timeLeft === 0 ? (
            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.buttonHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={handleCloseAndReset}
              className={`flex items-center gap-2 px-8 py-3.5 ${UI_RADII.card} font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/30 transition-all`}
            >
              <Check className="w-5 h-5" />
              <span>Inizia Prossima Serie</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileHover={MOTION_PRESETS.buttonHover}
              whileTap={MOTION_PRESETS.buttonTap}
              onClick={handleToggleActive}
              className={`flex items-center gap-2 px-8 py-3.5 ${UI_RADII.card} font-extrabold text-sm transition-all shadow-xl backdrop-blur-md border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400/50 shadow-sky-500/30'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Metti in Pausa</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Riprendi</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
});
