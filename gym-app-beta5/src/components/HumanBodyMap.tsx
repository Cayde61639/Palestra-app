import React, { useState } from 'react';
import { MuscleZone, RankLevel } from '../types';
import { RANK_METADATA } from '../utils/ranking';
import { MUSCLE_LABELS } from '../data/exerciseDataset';
import { Eye, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { UI_RADII, SPECULAR_HIGHLIGHT } from '../utils/uiPresets';

/**
 * Helper per estrarre l'hex colore reale associato al rank di una determinata zona muscolare.
 * Utilizza esclusivamente RANK_METADATA come unica fonte di verità.
 */
export const getRankColor = (
  zone: MuscleZone,
  muscleRanks: Record<MuscleZone, RankLevel>
): string => {
  const rank = muscleRanks[zone] || 'bronze';
  return RANK_METADATA[rank].colorHex;
};

interface HumanBodyMapProps {
  muscleRanks: Record<MuscleZone, RankLevel>;
  onSelectMuscle?: (muscle: MuscleZone) => void;
  selectedMuscle?: MuscleZone | null;
}

export const HumanBodyMap = React.memo<HumanBodyMapProps>(({
  muscleRanks,
  onSelectMuscle,
  selectedMuscle,
}) => {
  const [view, setView] = useState<'front' | 'back'>('front');

  const getRankConfig = (zone: MuscleZone) => {
    const rank = muscleRanks[zone] || 'bronze';
    return RANK_METADATA[rank];
  };

  const isZoneActive = (zone: MuscleZone) => selectedMuscle === zone;

  /**
   * Rendering discreto ed elegante delle zone muscolari:
   * - Colore rigorosamente derivato dal rank reale (RANK_METADATA).
   * - Bordo bianco pulito da 1.1px che definisce i singoli fasci senza accavallamenti.
   * - Quando attiva, la zona riceve un bordo leggermente più nitido (1.7px) e un'opacità piena
   *   senza lampi o aloni accecanti che sfigurino l'equilibrio del modello.
   */
  const renderMuscleAttrs = (zone: MuscleZone) => {
    const active = isZoneActive(zone);
    const hasActiveSelection = selectedMuscle !== null && selectedMuscle !== undefined;
    const colorHex = getRankColor(zone, muscleRanks);

    return {
      fill: colorHex,
      opacity: active ? 1 : hasActiveSelection ? 0.82 : 0.94,
      stroke: active ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
      strokeWidth: active ? 1.7 : 1.1,
      strokeLinejoin: 'round' as const,
      strokeLinecap: 'round' as const,
      filter: active ? 'url(#discreteGlow)' : undefined,
      onClick: () => onSelectMuscle?.(zone),
      className:
        'cursor-pointer transition-all duration-200 hover:opacity-100 hover:brightness-105',
    };
  };

  return (
    <div className={`bg-slate-900/70 ${UI_RADII.card} p-3.5 sm:p-5 border border-white/10 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden`}>
      {/* Specular Refraction Top Edge */}
      <div className={SPECULAR_HIGHLIGHT} />

      {/* Header with Front/Back Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
              Anatomia Interattiva
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-400/20 backdrop-blur-md">
              <Activity className="w-3 h-3" />
              Livelli di Forza (1RM)
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Mappa Muscolare
          </h3>
        </div>

        {/* Apple Segmented Control Fronte / Retro */}
        <div className="flex items-center bg-black/50 rounded-2xl p-1 border border-white/10 backdrop-blur-md">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('front')}
            className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all ${
              view === 'front'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fronte
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('back')}
            className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all ${
              view === 'back'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 border border-sky-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Retro
          </motion.button>
        </div>
      </div>

      {/* Main SVG Visualization */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 py-2">
        <div className="relative w-full max-w-[260px] sm:max-w-[290px] h-[370px] sm:h-[430px] flex items-center justify-center">
          {/* Delicato ambient glow retrostante */}
          <div className="absolute inset-10 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <svg
            viewBox="0 0 200 400"
            className="w-full h-full filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)] relative z-10 select-none"
          >
            <defs>
              {/* Glow discreto e raffinato per la selezione attiva */}
              <filter id="discreteGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {view === 'front' ? (
              /* =========================================================================
                 VISTA FRONTALE (Proporzioni anatomiche 8 teste, canone classico)
                 Centro X = 100
                 ========================================================================= */
              <g id="frontBodyGroup">
                {/* 1. SAGOMA DI BASE ANTERIORE (Silhouette corporea atletica dettagliata) */}
                <g id="frontBaseSilhouette">
                  {/* Profilo completo continuo: testa, collo, spalle, braccia, mani, tronco, gambe, piedi */}
                  <path
                    d="M 94 62
                       C 91 62 89 67 87 74
                       C 76 77 64 81 53 88
                       C 45 93 42 102 42 113
                       C 42 124 43 135 44 144
                       C 38 155 35 170 38 186
                       C 40 196 44 206 46 214
                       C 43 218 39 224 41 231
                       C 43 235 47 235 49 231
                       C 51 226 51 221 51 217
                       C 54 215 54 212 51 211
                       C 53 194 54 178 56 168
                       C 63 158 64 146 65 142
                       C 68 152 70 164 72 174
                       C 71 184 70 194 71 198
                       C 63 216 62 234 64 256
                       C 65 270 69 282 73 288
                       L 73 300
                       C 64 316 64 336 72 358
                       C 70 361 63 369 49 378
                       C 58 380 72 380 78 378
                       C 80 370 81 364 83 360
                       C 87 342 87 322 87 304
                       L 87 292
                       C 86 272 87 248 100 216
                       C 113 248 114 272 113 292
                       L 113 304
                       C 113 322 113 342 117 360
                       C 119 364 120 370 122 378
                       C 128 380 142 380 151 378
                       C 137 369 130 361 128 358
                       C 136 336 136 316 127 300
                       L 127 288
                       C 131 282 135 270 136 256
                       C 138 234 137 216 129 198
                       C 130 194 129 184 128 174
                       C 130 164 132 152 135 142
                       C 136 146 137 158 144 168
                       C 146 178 147 194 149 211
                       C 146 212 146 215 149 217
                       C 149 221 149 226 151 231
                       C 153 235 157 235 159 231
                       C 161 224 157 218 154 214
                       C 156 206 160 196 162 186
                       C 165 170 162 155 156 144
                       C 157 135 158 124 158 113
                       C 158 102 155 93 147 88
                       C 136 81 124 77 113 74
                       C 111 67 109 62 106 62
                       Z"
                    fill="#1e2738"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1.2"
                  />

                  {/* Dettaglio anatomico testa e viso stilizzato */}
                  <path
                    d="M 93 62 L 94 48 C 94 40 92 36 91 30 C 88 28 88 38 91 40 C 93 45 96 50 100 51 C 104 50 107 45 109 40 C 112 38 112 28 109 30 C 108 36 106 40 106 48 L 107 62 Z"
                    fill="#1e2738"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1.1"
                  />

                  {/* Acconciatura atletica proporzionata */}
                  <path
                    d="M 91 28
                       C 87 23 85 16 89 12
                       C 92 8 96 5 101 4
                       C 104 2 107 3 109 5
                       C 111 4 115 4 117 7
                       C 119 7 122 8 122 12
                       C 123 17 119 23 114 26
                       C 112 22 108 19 104 18
                       C 100 16 96 18 94 24
                       Z"
                    fill="#334155"
                    stroke="rgba(255, 255, 255, 0.55)"
                    strokeWidth="1"
                  />

                  {/* Linee del collo (muscoli sternocleidomastoidei) */}
                  <path
                    d="M 95 52 C 97 58 98 63 99 66 M 105 52 C 103 58 102 63 101 66"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                  />

                  {/* Clavicole */}
                  <path
                    d="M 99 67 C 88 67 76 70 66 74 M 101 67 C 112 67 124 70 134 74"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                  />

                  {/* Avambracci anteriori neutri (brachioradiale ed estensori) */}
                  <g fill="#283548" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.9">
                    {/* Avambraccio Sinistro */}
                    <path d="M 43 148 C 37 160 36 178 40 196 C 44 204 47 207 48 205 C 50 190 52 174 54 158 Z" />
                    {/* Avambraccio Destro */}
                    <path d="M 157 148 C 163 160 164 178 160 196 C 156 204 153 207 152 205 C 150 190 148 174 146 158 Z" />
                  </g>

                  {/* Ginocchia e rotule sagomate */}
                  <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" fill="none">
                    <ellipse cx="80" cy="294" rx="4.5" ry="5.5" />
                    <ellipse cx="120" cy="294" rx="4.5" ry="5.5" />
                  </g>

                  {/* Cresta tibiale */}
                  <path
                    d="M 80 304 L 80 350 M 120 304 L 120 350"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1"
                  />
                </g>

                {/* 2. GRUPPI MUSCOLARI ANTERIORI (Perfettamente incastonati nella silhouette) */}

                {/* SPALLE (Deltoide anteriore e laterale - calotta ergonomica) */}
                <g id="front-shoulders">
                  {/* Spalla Sinistra */}
                  <path
                    d="M 64 74
                       C 53 79 43 89 43 106
                       C 44 116 48 122 53 120
                       C 58 116 63 106 65 92
                       Z"
                    {...renderMuscleAttrs('shoulders')}
                  />
                  {/* Spalla Destra */}
                  <path
                    d="M 136 74
                       C 147 79 157 89 157 106
                       C 156 116 152 122 147 120
                       C 142 116 137 106 135 92
                       Z"
                    {...renderMuscleAttrs('shoulders')}
                  />
                </g>

                {/* PETTORALI (Due ampi pettorali divisi al centro dallo sterno) */}
                <g id="front-chest">
                  {/* Pettorale Sinistro */}
                  <path
                    d="M 98 75
                       C 86 75 75 77 66 84
                       C 63 94 65 107 70 115
                       C 78 125 88 128 98 127
                       Z"
                    {...renderMuscleAttrs('chest')}
                  />
                  {/* Pettorale Destro */}
                  <path
                    d="M 102 75
                       C 114 75 125 77 134 84
                       C 137 94 135 107 130 115
                       C 122 125 112 128 102 127
                       Z"
                    {...renderMuscleAttrs('chest')}
                  />
                </g>

                {/* BICIPITI (Braccio superiore, perfettamente compresi tra spalla e gomito) */}
                <g id="front-biceps">
                  {/* Bicipite Sinistro */}
                  <path
                    d="M 52 118
                       C 45 124 43 134 45 146
                       C 48 152 53 153 56 148
                       C 61 138 61 127 58 120
                       Z"
                    {...renderMuscleAttrs('biceps')}
                  />
                  {/* Bicipite Destro */}
                  <path
                    d="M 148 118
                       C 155 124 157 134 155 146
                       C 152 152 147 153 144 148
                       C 139 138 139 127 142 120
                       Z"
                    {...renderMuscleAttrs('biceps')}
                  />
                </g>

                {/* ADDOMINALI (Six-pack armonico a 3 righe x 2 colonne + V-taper inferiore) */}
                <g id="front-abs">
                  {/* Blocco Superiore Sx */}
                  <path
                    d="M 98 131 C 91 131 84 132 82 133 C 82 140 82 143 83 144 C 88 144 93 144 98 143 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Blocco Superiore Dx */}
                  <path
                    d="M 102 131 C 109 131 116 132 118 133 C 118 140 118 143 117 144 C 112 144 107 144 102 143 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Blocco Mediano Sx */}
                  <path
                    d="M 98 147 C 91 147 85 147 84 149 C 84 157 84 160 85 161 C 89 161 94 161 98 160 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Blocco Mediano Dx */}
                  <path
                    d="M 102 147 C 109 147 115 147 116 149 C 116 157 116 160 115 161 C 111 161 106 161 102 160 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Blocco Inferiore Sx */}
                  <path
                    d="M 98 164 C 92 164 87 164 86 166 C 87 178 92 189 98 193 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Blocco Inferiore Dx */}
                  <path
                    d="M 102 164 C 108 164 113 164 114 166 C 113 178 108 189 102 193 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Obliqui laterali sx */}
                  <path
                    d="M 72 135 C 77 133 80 137 80 152 C 80 167 75 181 73 184 C 70 173 69 153 72 135 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                  {/* Obliqui laterali dx */}
                  <path
                    d="M 128 135 C 123 133 120 137 120 152 C 120 167 125 181 127 184 C 130 173 131 153 128 135 Z"
                    {...renderMuscleAttrs('abs')}
                  />
                </g>

                {/* QUADRICIPITI (3 ventri netti affiancati senza sovrapposizioni) */}
                <g id="front-quads">
                  {/* Gamba Sx: Retto Femorale (Centrale affusolato) */}
                  <path
                    d="M 79 202 C 74 216 73 240 75 264 C 77 266 82 266 84 264 C 86 240 85 216 81 202 Z"
                    {...renderMuscleAttrs('quads')}
                  />
                  {/* Gamba Sx: Vasto Laterale (Esterno lungo, segue la linea della coscia) */}
                  <path
                    d="M 75 204 C 67 215 63 232 65 258 C 67 270 70 274 72 274 C 71 257 70 234 75 204 Z"
                    {...renderMuscleAttrs('quads')}
                  />
                  {/* Gamba Sx: Vasto Mediale (Goccia sopra il ginocchio) */}
                  <path
                    d="M 82 248 C 79 257 79 269 82 280 C 85 282 89 282 91 276 C 92 266 88 255 82 248 Z"
                    {...renderMuscleAttrs('quads')}
                  />

                  {/* Gamba Dx: Retto Femorale (Centrale affusolato) */}
                  <path
                    d="M 121 202 C 126 216 127 240 125 264 C 123 266 118 266 116 264 C 114 240 115 216 119 202 Z"
                    {...renderMuscleAttrs('quads')}
                  />
                  {/* Gamba Dx: Vasto Laterale (Esterno lungo) */}
                  <path
                    d="M 125 204 C 133 215 137 232 135 258 C 133 270 130 274 128 274 C 129 257 130 234 125 204 Z"
                    {...renderMuscleAttrs('quads')}
                  />
                  {/* Gamba Dx: Vasto Mediale (Goccia sopra il ginocchio) */}
                  <path
                    d="M 118 248 C 121 257 121 269 118 280 C 115 282 111 282 109 276 C 108 266 112 255 118 248 Z"
                    {...renderMuscleAttrs('quads')}
                  />
                </g>

                {/* POLPACCI ANTERIORI (Gemello mediale e laterale ai lati della tibia) */}
                <g id="front-calves">
                  {/* Gamba Sx - Gemello Laterale */}
                  <path
                    d="M 71 306 C 64 318 63 333 67 346 C 70 354 73 356 74 356 C 73 343 71 326 72 306 Z"
                    {...renderMuscleAttrs('calves')}
                  />
                  {/* Gamba Sx - Gemello Mediale */}
                  <path
                    d="M 76 306 C 81 316 86 325 85 340 C 84 350 81 354 79 354 C 78 341 76 324 76 306 Z"
                    {...renderMuscleAttrs('calves')}
                  />

                  {/* Gamba Dx - Gemello Mediale */}
                  <path
                    d="M 124 306 C 119 316 114 325 115 340 C 116 350 119 354 121 354 C 122 341 124 324 124 306 Z"
                    {...renderMuscleAttrs('calves')}
                  />
                  {/* Gamba Dx - Gemello Laterale */}
                  <path
                    d="M 129 306 C 136 318 137 333 133 346 C 130 354 127 356 126 356 C 127 343 129 326 128 306 Z"
                    {...renderMuscleAttrs('calves')}
                  />
                </g>
              </g>
            ) : (
              /* =========================================================================
                 VISTA POSTERIORE (RETRO)
                 Centro X = 100
                 ========================================================================= */
              <g id="backBodyGroup">
                {/* 1. SAGOMA DI BASE POSTERIORE (Dettagliata e continua) */}
                <g id="backBaseSilhouette">
                  <path
                    d="M 94 62
                       C 91 62 89 67 87 74
                       C 76 77 64 81 53 88
                       C 45 93 42 102 42 113
                       C 42 124 43 135 44 144
                       C 38 155 35 170 38 186
                       C 40 196 44 206 46 214
                       C 43 218 39 224 41 231
                       C 43 235 47 235 49 231
                       C 51 226 51 221 51 217
                       C 54 215 54 212 51 211
                       C 53 194 54 178 56 168
                       C 63 158 64 146 65 142
                       C 68 152 70 164 72 174
                       C 71 184 70 194 71 198
                       C 63 216 62 234 64 256
                       C 65 270 69 282 73 288
                       L 73 300
                       C 64 316 64 336 72 358
                       C 70 361 63 369 49 378
                       C 58 380 72 380 78 378
                       C 80 370 81 364 83 360
                       C 87 342 87 322 87 304
                       L 87 292
                       C 86 272 87 248 100 216
                       C 113 248 114 272 113 292
                       L 113 304
                       C 113 322 113 342 117 360
                       C 119 364 120 370 122 378
                       C 128 380 142 380 151 378
                       C 137 369 130 361 128 358
                       C 136 336 136 316 127 300
                       L 127 288
                       C 131 282 135 270 136 256
                       C 138 234 137 216 129 198
                       C 130 194 129 184 128 174
                       C 130 164 132 152 135 142
                       C 136 146 137 158 144 168
                       C 146 178 147 194 149 211
                       C 146 212 146 215 149 217
                       C 149 221 149 226 151 231
                       C 153 235 157 235 159 231
                       C 161 224 157 218 154 214
                       C 156 206 160 196 162 186
                       C 165 170 162 155 156 144
                       C 157 135 158 124 158 113
                       C 158 102 155 93 147 88
                       C 136 81 124 77 113 74
                       C 111 67 109 62 106 62
                       Z"
                    fill="#1e2738"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1.2"
                  />

                  {/* Nuca e taglio posteriore proporzionato */}
                  <path
                    d="M 93 62 L 94 48 C 94 40 92 34 91 28 C 87 23 85 16 89 12 C 92 8 96 5 101 4 C 106 4 116 4 117 7 C 119 7 122 8 122 12 C 123 17 119 23 114 26 C 111 34 108 40 106 48 L 107 62 Z"
                    fill="#334155"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1.1"
                  />

                  {/* Solco colonna vertebrale */}
                  <path
                    d="M 100 64 L 100 180"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1"
                  />

                  {/* Avambracci posteriori neutri */}
                  <g fill="#283548" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.9">
                    <path d="M 43 148 C 37 160 36 178 40 196 C 44 204 47 207 48 205 C 50 190 52 174 54 158 Z" />
                    <path d="M 157 148 C 163 160 164 178 160 196 C 156 204 153 207 152 205 C 150 190 148 174 146 158 Z" />
                  </g>

                  {/* Tendine di Achille e caviglie */}
                  <g stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" fill="none">
                    <path d="M 78 344 L 78 362" />
                    <path d="M 122 344 L 122 362" />
                  </g>
                </g>

                {/* 2. GRUPPI MUSCOLARI POSTERIORI */}

                {/* SPALLE POSTERIORI (Deltoide posteriore) */}
                <g id="back-shoulders">
                  {/* Spalla Sx Posteriore */}
                  <path
                    d="M 64 74
                       C 53 79 43 89 43 106
                       C 44 116 48 122 53 120
                       C 58 116 63 106 65 92
                       Z"
                    {...renderMuscleAttrs('shoulders')}
                  />
                  {/* Spalla Dx Posteriore */}
                  <path
                    d="M 136 74
                       C 147 79 157 89 157 106
                       C 156 116 152 122 147 120
                       C 142 116 137 106 135 92
                       Z"
                    {...renderMuscleAttrs('shoulders')}
                  />
                </g>

                {/* SCHIENA / DORSO (Trapezio romboidale a diamante + Gran Dorsale a V) */}
                <g id="back-dorsals">
                  {/* Trapezio Superiore / Romboide */}
                  <path
                    d="M 94 62 L 106 62 C 113 67 124 71 133 74 C 122 84 112 105 100 126 C 88 105 78 84 67 74 C 76 71 87 67 94 62 Z"
                    {...renderMuscleAttrs('back')}
                  />
                  {/* Gran Dorsale Sx (Ala a V) */}
                  <path
                    d="M 66 88 C 73 88 83 95 86 107 C 88 124 90 148 98 168 C 92 168 84 160 78 147 C 72 135 68 114 66 88 Z"
                    {...renderMuscleAttrs('back')}
                  />
                  {/* Gran Dorsale Dx (Ala a V) */}
                  <path
                    d="M 134 88 C 127 88 117 95 114 107 C 112 124 110 148 102 168 C 108 168 116 160 122 147 C 128 135 132 114 134 88 Z"
                    {...renderMuscleAttrs('back')}
                  />
                  {/* Erettori spinali / Bassa schiena */}
                  <path
                    d="M 98 169 C 93 169 88 170 86 173 C 87 183 91 192 98 194 Z"
                    {...renderMuscleAttrs('back')}
                  />
                  <path
                    d="M 102 169 C 107 169 112 170 114 173 C 113 183 109 192 102 194 Z"
                    {...renderMuscleAttrs('back')}
                  />
                </g>

                {/* TRICIPITI (Ferro di cavallo compreso nel braccio posteriore) */}
                <g id="back-triceps">
                  {/* Tricipite Sx */}
                  <path
                    d="M 52 116
                       C 45 122 43 133 44 144
                       C 48 148 52 147 54 142
                       C 58 132 60 122 56 116
                       Z"
                    {...renderMuscleAttrs('triceps')}
                  />
                  {/* Tricipite Dx */}
                  <path
                    d="M 148 116
                       C 155 122 157 133 156 144
                       C 152 148 148 147 146 142
                       C 142 132 140 122 144 116
                       Z"
                    {...renderMuscleAttrs('triceps')}
                  />
                </g>

                {/* GLUTEI (Due cupole piene e rotonde sul bacino posteriore) */}
                <g id="back-glutes">
                  {/* Gluteo Sx */}
                  <path
                    d="M 72 181
                       C 68 193 70 208 82 216
                       C 92 217 98 210 98 181
                       C 88 179 78 179 72 181
                       Z"
                    {...renderMuscleAttrs('glutes')}
                  />
                  {/* Gluteo Dx */}
                  <path
                    d="M 128 181
                       C 132 193 130 208 118 216
                       C 108 217 102 210 102 181
                       C 112 179 122 179 128 181
                       Z"
                    {...renderMuscleAttrs('glutes')}
                  />
                </g>

                {/* FEMORALI (Ischiocrurali a 2 fasci verticali per coscia sotto i glutei) */}
                <g id="back-hamstrings">
                  {/* Gamba Sx - Capo laterale */}
                  <path
                    d="M 74 218 C 69 232 70 254 73 276 C 79 278 84 278 86 274 C 86 254 85 232 82 218 Z"
                    {...renderMuscleAttrs('hamstrings')}
                  />
                  {/* Gamba Sx - Capo mediale */}
                  <path
                    d="M 83 218 C 86 232 87 254 87 274 C 91 276 95 276 95 270 C 95 252 93 232 89 218 Z"
                    {...renderMuscleAttrs('hamstrings')}
                  />

                  {/* Gamba Dx - Capo mediale */}
                  <path
                    d="M 117 218 C 114 232 113 254 113 274 C 109 276 105 276 105 270 C 105 252 107 232 111 218 Z"
                    {...renderMuscleAttrs('hamstrings')}
                  />
                  {/* Gamba Dx - Capo laterale */}
                  <path
                    d="M 126 218 C 131 232 130 254 127 276 C 121 278 116 278 114 274 C 114 254 115 232 118 218 Z"
                    {...renderMuscleAttrs('hamstrings')}
                  />
                </g>

                {/* POLPACCI POSTERIORI (Doppi gemelli a cuore sul retro della gamba) */}
                <g id="back-calves">
                  {/* Polpaccio Sx */}
                  <path
                    d="M 71 302 C 62 314 63 331 69 342 C 73 344 77 344 79 342 C 85 331 86 314 77 302 Z"
                    {...renderMuscleAttrs('calves')}
                  />
                  {/* Polpaccio Dx */}
                  <path
                    d="M 129 302 C 138 314 137 331 131 342 C 127 344 123 344 121 342 C 115 331 114 314 123 302 Z"
                    {...renderMuscleAttrs('calves')}
                  />
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Legend & Active Muscle Detail Panel in Apple Glass */}
        <div className="flex-1 w-full max-w-xs flex flex-col justify-between space-y-3.5">
          {/* Livelli di Forza Legend */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
              Fasce di Livello (1RM)
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as RankLevel[]).map((r) => {
                const conf = RANK_METADATA[r];
                const hasAnim = r === 'platinum' || r === 'diamond';
                return (
                  <motion.div
                    key={r}
                    whileHover={{ scale: 1.06 }}
                    className={`rounded-2xl py-2 px-1 flex flex-col items-center justify-center border transition-all backdrop-blur-md ${
                      hasAnim ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: `${conf.colorHex}18`,
                      borderColor: `${conf.colorHex}55`,
                      boxShadow: `0 4px 12px ${conf.colorHex}22`,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full mb-1 shadow-sm"
                      style={{
                        backgroundColor: conf.colorHex,
                        boxShadow: `0 0 8px ${conf.colorHex}`,
                      }}
                    />
                    <span className="text-[10px] font-extrabold" style={{ color: conf.colorHex }}>
                      {conf.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Muscle Detail Card in Apple Glass */}
          <div className="bg-white/[0.06] rounded-2xl p-4 border border-white/[0.14] backdrop-blur-xl shadow-lg">
            {selectedMuscle ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-400">Gruppo Selezionato</span>
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm"
                    style={{
                      backgroundColor: `${getRankConfig(selectedMuscle).colorHex}25`,
                      color: getRankConfig(selectedMuscle).colorHex,
                      border: `1px solid ${getRankConfig(selectedMuscle).colorHex}70`,
                    }}
                  >
                    {getRankConfig(selectedMuscle).label}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{
                      backgroundColor: getRankConfig(selectedMuscle).colorHex,
                      boxShadow: `0 0 8px ${getRankConfig(selectedMuscle).colorHex}`,
                    }}
                  />
                  <span>{MUSCLE_LABELS[selectedMuscle]}</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tocca qualsiasi gruppo muscolare per visualizzare dettagli, volume e livello 1RM.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <span>Tocca un muscolo sul corpo per analizzarne i dettagli.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
