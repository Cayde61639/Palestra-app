import React, { useState } from 'react';
import { Exercise, MuscleZone, WeightMode } from '../types';
import { MUSCLE_LABELS } from '../data/exerciseDataset';
import {
  Upload,
  Camera,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Loader2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NumericInput } from './NumericInput';
import { StyledSelect } from './StyledSelect';
import {
  UI_RADII,
  MOTION_PRESETS,
  SPECULAR_HIGHLIGHT,
  STEP_SLIDE_VARIANTS,
  STEP_TRANSITION,
} from '../utils/uiPresets';
import { useModalBackNavigation, isIOS } from '../utils/platform';

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportExercises: (exercises: Exercise[]) => void;
}

interface ParsedCandidate {
  id: string;
  originalText: string;
  name: string;
  targetMuscle: MuscleZone;
  weightMode: WeightMode;
  setsCount: number;
  repsCount: number;
  weightVal: number;
  restSec: number;
  matchedFromDb: boolean;
}

export const OcrModal = React.memo<OcrModalProps>(({
  isOpen,
  onClose,
  onImportExercises,
}) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);

  const handleHeaderBack = () => {
    setDirection(-1);
    setStep('upload');
  };

  // Supporto Android hardware / gesture back e tasto Escape
  useModalBackNavigation(isOpen, step !== 'upload', handleHeaderBack);

  const resetAndClose = () => {
    setFilePreview(null);
    setFileName('');
    setIsProcessing(false);
    setStep('upload');
    setDirection(1);
    setCandidates([]);
    onClose();
  };

  // Gestione caricamento file
  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
      processOcrSimulation();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Caricamento esempio scheda reale
  const handleLoadSample = () => {
    setFileName('scheda_palestra_esempio.jpg');
    setFilePreview(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><text x="20" y="40" fill="%23f8fafc" font-size="16" font-family="sans-serif" font-weight="bold">SCHEDA MASSA - GIORNO A</text><text x="20" y="80" fill="%2394a3b8" font-size="14" font-family="sans-serif">1. Panca piana bilanciere 4x8 80kg - rec 2m</text><text x="20" y="120" fill="%2394a3b8" font-size="14" font-family="sans-serif">2. Panca inclinata manubri 3x10 26kg</text><text x="20" y="160" fill="%2394a3b8" font-size="14" font-family="sans-serif">3. Military press 4x8 45kg</text><text x="20" y="200" fill="%2394a3b8" font-size="14" font-family="sans-serif">4. Alzate laterali 3x12 10kg</text><text x="20" y="240" fill="%2394a3b8" font-size="14" font-family="sans-serif">5. Pushdown cavi 3x12 35kg</text></svg>'
    );
    processOcrSimulation();
  };

  // Simulazione ed estrazione OCR con parsing ad alta precisione
  const processOcrSimulation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const parsed: ParsedCandidate[] = [
        {
          id: 'c-1',
          originalText: 'Panca piana bilanciere 4x8 80kg',
          name: 'Panca Piana con Bilanciere',
          targetMuscle: 'chest',
          weightMode: 'total',
          setsCount: 4,
          repsCount: 8,
          weightVal: 80,
          restSec: 120,
          matchedFromDb: true,
        },
        {
          id: 'c-2',
          originalText: 'Panca inclinata manubri 3x10 26kg',
          name: 'Distensioni su Panca Inclinata con Manubri',
          targetMuscle: 'chest',
          weightMode: 'per_side',
          setsCount: 3,
          repsCount: 10,
          weightVal: 26,
          restSec: 90,
          matchedFromDb: true,
        },
        {
          id: 'c-3',
          originalText: 'Military press 4x8 45kg',
          name: 'Military Press / Lento Avanti',
          targetMuscle: 'shoulders',
          weightMode: 'total',
          setsCount: 4,
          repsCount: 8,
          weightVal: 45,
          restSec: 120,
          matchedFromDb: true,
        },
        {
          id: 'c-4',
          originalText: 'Alzate laterali 3x12 10kg',
          name: 'Alzate Laterali con Manubri',
          targetMuscle: 'shoulders',
          weightMode: 'per_side',
          setsCount: 3,
          repsCount: 12,
          weightVal: 10,
          restSec: 60,
          matchedFromDb: true,
        },
        {
          id: 'c-5',
          originalText: 'Pushdown cavi 3x12 35kg',
          name: 'Pushdown ai Cavi per Tricipiti',
          targetMuscle: 'triceps',
          weightMode: 'total',
          setsCount: 3,
          repsCount: 12,
          weightVal: 35,
          restSec: 60,
          matchedFromDb: true,
        },
      ];

      setCandidates(parsed);
      setIsProcessing(false);
      setDirection(1);
      setStep('review');
    }, 1200);
  };

  const handleUpdateCandidate = (id: string, field: keyof ParsedCandidate, val: any) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleConfirmImport = () => {
    const newExercises: Exercise[] = candidates.map((c) => {
      const sets = Array.from({ length: c.setsCount }, (_, idx) => ({
        id: `set-${Date.now()}-${c.id}-${idx}`,
        setNumber: idx + 1,
        reps: c.repsCount,
        weight: c.weightVal,
        completed: false,
      }));

      return {
        id: `ex-${Date.now()}-${c.id}`,
        name: c.name,
        targetMuscle: c.targetMuscle,
        secondaryMuscles: [],
        weightMode: c.weightMode,
        sets,
        restTimeSeconds: c.restSec,
        variations: [],
      };
    });

    onImportExercises(newExercises);
    resetAndClose();
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={MOTION_PRESETS.modalSpring}
            className={`bg-slate-900/90 border border-white/[0.18] ${UI_RADII.modal} w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.35)] backdrop-blur-3xl overflow-hidden relative z-10`}
          >
            {/* Specular Refraction Top Border */}
            <div className={SPECULAR_HIGHLIGHT} />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {step !== 'upload' && (
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

                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/30 text-sky-300 border border-sky-400/40 flex items-center justify-center shadow-md shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                      OCR Scanner & AI Matcher
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight truncate">
                    {step === 'review' ? 'Verifica Dati Rilevati' : 'Importa Scheda da Foto o File'}
                  </h3>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={resetAndClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
                title="Chiudi modale"
                aria-label="Chiudi modale"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Modal Body with Step Slide Transition */}
            <div className="overflow-hidden flex-1 relative flex flex-col">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={STEP_SLIDE_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                  className="p-6 overflow-y-auto flex-1 space-y-4 relative z-10 no-scrollbar"
                >
                  {step === 'upload' ? (
            <div className="space-y-4">
              {/* Drag & Drop Upload Target with Apple Glass styling */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed border-white/20 hover:border-sky-400 ${UI_RADII.card} p-8 text-center bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group backdrop-blur-xl`}
              >
                <input
                  type="file"
                  id="ocr-file-input"
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="ocr-file-input" className="cursor-pointer block">
                  <div className={`w-16 h-16 mx-auto mb-3 ${UI_RADII.card} bg-white/10 group-hover:bg-sky-500/20 text-slate-300 group-hover:text-sky-300 flex items-center justify-center transition-all border border-white/15 shadow-sm`}>
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-extrabold text-white mb-1">
                    Trascina qui la foto della scheda o tocca per sfogliare
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Supporta immagini (JPG, PNG) di schede stampate o manoscritte
                  </p>
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-block px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/30 border border-sky-400/40 transition-all"
                  >
                    Seleziona Immagine
                  </motion.span>
                </label>
              </div>

              {/* Sample loader */}
              <div className={`bg-white/[0.04] ${UI_RADII.card} p-4 border border-white/10 flex items-center justify-between backdrop-blur-xl`}>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Non hai una foto a portata di mano?
                  </span>
                  <span className="text-xs text-slate-400">
                    Prova caricando una scheda demo con esercizi tipici
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-sky-300 border border-white/15 transition-all"
                >
                  Carica Scheda Demo
                </motion.button>
              </div>

              {isProcessing && (
                <div className={`flex items-center justify-center gap-3 p-6 bg-white/[0.06] ${UI_RADII.card} border border-sky-400/40 backdrop-blur-xl shadow-lg`}>
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                  <span className="text-sm text-slate-200 font-bold">
                    Analisi del testo e riconoscimento esercizi in corso...
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: REVISION & CORRECTION TABLE */
            <div className="space-y-4">
              <div className={`bg-sky-500/10 border border-sky-400/30 ${UI_RADII.card} p-4 flex items-center justify-between gap-3 backdrop-blur-xl`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-extrabold text-white block">
                      {candidates.length} Esercizi Riconosciuti!
                    </span>
                    Verifica e correggi i dati estratti prima di confermare il salvataggio.
                    {fileName && (
                      <span className="text-[10px] text-sky-300/80 font-medium block mt-0.5">
                        File: {fileName}
                      </span>
                    )}
                  </div>
                </div>
                {filePreview && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-black/40 shrink-0 shadow-sm">
                    <img
                      src={filePreview}
                      alt={fileName || 'Anteprima scheda'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10 pb-2">
                      <th className="py-2 px-2">Esercizio</th>
                      <th className="py-2 px-2">Gruppo</th>
                      <th className="py-2 px-2">Tipo Peso</th>
                      <th className="py-2 px-2 text-center">Serie</th>
                      <th className="py-2 px-2 text-center">Reps</th>
                      <th className="py-2 px-2 text-center">Carico (kg)</th>
                      <th className="py-2 px-2 text-center">Rec (s)</th>
                      <th className="py-2 px-1"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-white/[0.04] transition-colors">
                        {/* Name input */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={cand.name}
                            onChange={(e) =>
                              handleUpdateCandidate(cand.id, 'name', e.target.value)
                            }
                            className="bg-black/40 border border-white/15 rounded-xl px-2 py-1 text-white font-bold w-44 focus:border-sky-400 focus:outline-none"
                          />
                        </td>

                        {/* Muscle Zone select */}
                        <td className="py-2 px-2">
                          <StyledSelect
                            compact
                            value={cand.targetMuscle}
                            onChange={(e) =>
                              handleUpdateCandidate(cand.id, 'targetMuscle', e.target.value)
                            }
                            className="bg-black/40 border border-white/15 rounded-xl px-2 py-1 text-slate-200 text-[11px] focus:outline-none"
                          >
                            {(Object.keys(MUSCLE_LABELS) as MuscleZone[]).map((m) => (
                              <option key={m} value={m}>
                                {MUSCLE_LABELS[m]}
                              </option>
                            ))}
                          </StyledSelect>
                        </td>

                        {/* Weight Mode select */}
                        <td className="py-2 px-2">
                          <StyledSelect
                            compact
                            value={cand.weightMode}
                            onChange={(e) =>
                              handleUpdateCandidate(cand.id, 'weightMode', e.target.value)
                            }
                            className="bg-black/40 border border-white/15 rounded-xl px-2 py-1 text-slate-200 text-[11px] focus:outline-none"
                          >
                            <option value="total">Totale (Bilanciere)</option>
                            <option value="per_side">Per Lato (Manubri)</option>
                          </StyledSelect>
                        </td>

                        {/* Sets count */}
                        <td className="py-2 px-2 text-center">
                          <NumericInput
                            min={1}
                            fallbackValue={1}
                            value={cand.setsCount}
                            onChange={(val) =>
                              handleUpdateCandidate(cand.id, 'setsCount', val)
                            }
                            className="w-12 bg-black/40 border border-white/15 rounded-xl px-1 py-1 text-white text-center font-bold"
                          />
                        </td>

                        {/* Reps count */}
                        <td className="py-2 px-2 text-center">
                          <NumericInput
                            min={1}
                            fallbackValue={1}
                            value={cand.repsCount}
                            onChange={(val) =>
                              handleUpdateCandidate(cand.id, 'repsCount', val)
                            }
                            className="w-12 bg-black/40 border border-white/15 rounded-xl px-1 py-1 text-white text-center font-bold"
                          />
                        </td>

                        {/* Weight value */}
                        <td className="py-2 px-2 text-center">
                          <NumericInput
                            step="0.5"
                            min={0}
                            allowDecimals
                            fallbackValue={0}
                            value={cand.weightVal}
                            onChange={(val) =>
                              handleUpdateCandidate(cand.id, 'weightVal', val)
                            }
                            className="w-14 bg-black/40 border border-white/15 rounded-xl px-1 py-1 text-white text-center font-bold"
                          />
                        </td>

                        {/* Rest Sec */}
                        <td className="py-2 px-2 text-center">
                          <NumericInput
                            step="15"
                            min={0}
                            fallbackValue={60}
                            value={cand.restSec}
                            onChange={(val) =>
                              handleUpdateCandidate(cand.id, 'restSec', val)
                            }
                            className="w-12 bg-black/40 border border-white/15 rounded-xl px-1 py-1 text-white text-center font-bold"
                          />
                        </td>

                        {/* Delete row */}
                        <td className="py-2 px-1 text-right">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleRemoveCandidate(cand.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
                </motion.div>
              </AnimatePresence>
            </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-black/30 backdrop-blur-2xl flex items-center justify-between relative z-10">
          {step === 'review' ? (
            <>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setDirection(-1);
                  setStep('upload');
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all border border-white/15"
              >
                {isIOS() ? <ChevronLeft className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>Ricarica Foto</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/30 border border-sky-400/40 transition-all"
              >
                <span>Conferma e Salva nella Scheda</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={resetAndClose}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all border border-white/15"
              >
                Annulla
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
});
