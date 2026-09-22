/**
 * Utility per il calcolo dinamico delle dimensioni del testo e del line-clamping
 * per i titoli degli esercizi. Permette a nomi lunghi o descrittivi (es. esercizi custom)
 * di rimanere sempre completamente visibili e leggibili senza puntini di sospensione (...).
 */

export type TextSizingVariant = 'card' | 'catalog' | 'compact' | 'modal';

/**
 * Restituisce la classe Tailwind per la dimensione del font in base alla lunghezza del testo.
 * - Per 'card' (default):
 *     fino a 22 caratteri: text-base
 *     23-35 caratteri: text-sm
 *     36-50 caratteri: text-xs
 *     oltre 50 caratteri: text-[11px]
 * - Per 'catalog' / 'compact' / 'modal':
 *     fino a 25 caratteri: text-sm
 *     26-42 caratteri: text-xs
 *     oltre 42 caratteri: text-[11px]
 */
export function getDynamicNameSizeClass(
  name: string = '',
  variant: TextSizingVariant = 'card'
): string {
  const len = (name || '').trim().length;

  if (variant === 'card') {
    if (len <= 22) {
      return 'text-base';
    }
    if (len <= 35) {
      return 'text-sm';
    }
    if (len <= 50) {
      return 'text-xs';
    }
    return 'text-[11px]';
  }

  // catalog / compact / modal
  if (len <= 25) {
    return 'text-sm';
  }
  if (len <= 42) {
    return 'text-xs';
  }
  return 'text-[11px]';
}

/**
 * Restituisce il numero massimo di righe (line-clamp) consigliato per consentire
 * al testo di andare a capo ed essere sempre visibile senza troncamento.
 */
export function getDynamicLineClampClass(
  name: string = '',
  variant: TextSizingVariant = 'card'
): string {
  const len = (name || '').trim().length;

  if (variant === 'card') {
    if (len <= 24) {
      return 'line-clamp-2';
    }
    if (len <= 50) {
      return 'line-clamp-3';
    }
    return 'line-clamp-4';
  }

  // catalog / compact
  if (len <= 26) {
    return 'line-clamp-2';
  }
  if (len <= 50) {
    return 'line-clamp-3';
  }
  return 'line-clamp-4';
}

/**
 * Restituisce le classi combinate di font-size, line-clamp e transizione fluida
 */
export function getExerciseTitleDynamicClasses(
  name: string = '',
  variant: TextSizingVariant = 'card'
): string {
  const sizeClass = getDynamicNameSizeClass(name, variant);
  const clampClass = getDynamicLineClampClass(name, variant);
  return `${sizeClass} ${clampClass} transition-[font-size,line-height] duration-200`;
}
