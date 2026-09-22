import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';

/**
 * Utility per il rilevamento automatico del sistema operativo (Android, Samsung One UI, iOS, Web/Capacitor)
 * e adattamento automatico a runtime degli spazi di sicurezza (Notifiche sopra, Tasti digitali sotto).
 * Tutto viene gestito al 100% in automatico dall'applicazione senza richiedere alcuna impostazione manuale.
 */

export const getPlatform = (): 'android' | 'ios' | 'web' => {
  if (typeof window === 'undefined') return 'web';

  // Capacitor API globale se presente nell'ambiente ibrido nativo
  const cap = (window as any).Capacitor;
  if (cap?.getPlatform) {
    const p = cap.getPlatform();
    if (p === 'android' || p === 'ios') return p;
  }

  // Fallback tramite User Agent & UserAgentData
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';

  const navDataPlatform = (navigator as any).userAgentData?.platform?.toLowerCase?.() || '';
  if (navDataPlatform.includes('android')) return 'android';
  if (navDataPlatform.includes('ios')) return 'ios';

  return 'web';
};

export const isAndroid = (): boolean => getPlatform() === 'android';
export const isIOS = (): boolean => getPlatform() === 'ios';
export const isMobilePlatform = (): boolean => isAndroid() || isIOS();

/**
 * Rileva se il dispositivo è specificamente un Samsung (Galaxy con interfaccia One UI)
 */
export const isSamsung = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isSamUA = /samsung|sm-[a-z0-9]+/i.test(ua);
  const brands = (navigator as any).userAgentData?.brands || [];
  const isSamBrand = brands.some((b: any) => /samsung/i.test(b.brand || ''));
  return isSamUA || isSamBrand;
};

/**
 * Rileva se l'app è in esecuzione come app nativa Capacitor / Cordova / WebView
 */
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  const isCap = Boolean(cap?.isNativePlatform?.() || cap?.platform === 'android' || cap?.platform === 'ios');
  const ua = navigator.userAgent || '';
  const isWebView = /; wv\)|Android.*Version\/[0-9.]+/i.test(ua);
  return isCap || isWebView;
};

export interface InsetValues {
  top: number; // px
  bottom: number; // px
}

/**
 * Calcolo automatico in tempo reale degli spazi di sistema:
 * - Sopra: area notifiche, orologio di sistema, fotocamera punch-hole/notch
 * - Sotto: tasti digitali Android/Samsung (||| O <) o barra gesti
 */
export const calculateAutomaticInsets = (): InsetValues => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0 };

  const android = isAndroid();
  const samsung = isSamsung();
  const ios = isIOS();

  if (android) {
    // Su Android e in particolare Samsung One UI con i 3 pulsanti digitali:
    // La barra di stato superiore (notifiche + fotocamera) occupa circa 38-42px.
    // La barra dei 3 tasti digitali sotto (Recenti, Home, Indietro) occupa circa 54-58px.
    return {
      top: samsung ? 44 : 42,
      bottom: 58,
    };
  }

  if (ios) {
    // Su iOS (iPhone con Dynamic Island o notch + barra Home indicator):
    return {
      top: 44,
      bottom: 24,
    };
  }

  // Se su desktop o browser PC
  return {
    top: 0,
    bottom: 0,
  };
};

/**
 * Applica automaticamente le variabili CSS sul tag :root (HTML)
 * in modo che l'header, la barra inferiore e i modali si posizionino istantaneamente
 * senza alcuna sovrapposizione con i tasti del telefono o con la barra notifiche.
 */
export const applySafeAreaInsets = () => {
  if (typeof document === 'undefined') return;

  const insets = calculateAutomaticInsets();
  const root = document.documentElement;

  // Variabili custom calcolate automaticamente
  root.style.setProperty('--os-safe-top', `${insets.top}px`);
  root.style.setProperty('--os-safe-bottom', `${insets.bottom}px`);

  // Combina con il valore di safe-area-inset del browser (se supportato)
  root.style.setProperty(
    '--app-safe-top',
    `max(env(safe-area-inset-top, 0px), ${insets.top}px)`
  );
  root.style.setProperty(
    '--app-safe-bottom',
    `max(env(safe-area-inset-bottom, 0px), ${insets.bottom}px)`
  );

  // Attributi data sul root per eventuale styling specifico
  root.setAttribute('data-platform', getPlatform());
  if (isSamsung()) {
    root.setAttribute('data-samsung', 'true');
  }
};

// Inizializzazione automatica all'avvio
if (typeof window !== 'undefined') {
  try {
    applySafeAreaInsets();

    window.addEventListener('resize', applySafeAreaInsets, { passive: true });
    window.addEventListener('orientationchange', applySafeAreaInsets, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', applySafeAreaInsets, { passive: true });
    }
  } catch {
    // Fallback sicuro
  }
}

/**
 * Stack di gestione del tasto fisico/gesture "Indietro" di sistema (Android / Capacitor).
 * Quando un modale è aperto e si trova in uno step interno (es. 'configure', 'create_custom', 'review'),
 * la pressione del tasto Indietro fa tornare indietro di uno step senza chiudere il modale.
 * Se ci si trova invece nello step radice, l'evento non viene consumato e il sistema esegue l'azione predefinita.
 */
type BackHandler = () => boolean | void;
const backHandlerStack: BackHandler[] = [];

export function registerBackButtonHandler(handler: BackHandler): () => void {
  backHandlerStack.push(handler);
  return () => {
    const idx = backHandlerStack.lastIndexOf(handler);
    if (idx !== -1) {
      backHandlerStack.splice(idx, 1);
    }
  };
}

export function triggerSystemBackAction(): boolean {
  if (backHandlerStack.length > 0) {
    const handler = backHandlerStack[backHandlerStack.length - 1];
    const res = handler();
    return res !== false;
  }
  return false;
}

/**
 * Hook React per registrare l'azione di ritorno per il modale/schermata attiva.
 */
export function useModalBackNavigation(
  isOpen: boolean,
  canGoBack: boolean,
  onBack: () => void
) {
  useEffect(() => {
    if (!isOpen || !canGoBack) return;
    return registerBackButtonHandler(() => {
      onBack();
      return true;
    });
  }, [isOpen, canGoBack, onBack]);
}

// Inizializzazione listener hardware back button (Capacitor Android) e tasto Escape da tastiera
if (typeof window !== 'undefined') {
  try {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const handled = triggerSystemBackAction();
      if (!handled && !canGoBack) {
        // Nessun modale o step interno attivo: comportamento predefinito
      }
    });
  } catch {
    // Web environment
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      triggerSystemBackAction();
    }
  });
}
