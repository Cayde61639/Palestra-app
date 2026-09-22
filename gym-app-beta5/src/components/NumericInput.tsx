import React, { useState, useEffect, useRef } from 'react';

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max' | 'step'> {
  value: number;
  onChange: (value: number) => void;
  fallbackValue?: number;
  min?: number;
  max?: number;
  step?: number | string;
  allowDecimals?: boolean;
  className?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const NumericInput = React.memo<NumericInputProps>(({
  value,
  onChange,
  fallbackValue = 0,
  min,
  max,
  step,
  allowDecimals = false,
  className = '',
  onBlur,
  onFocus,
  onKeyDown,
  ...restProps
}) => {
  // Stato locale di digitazione: mantiene esattamente ciò che l'utente sta scrivendo
  const [localStr, setLocalStr] = useState<string>(() => {
    if (value === undefined || value === null || isNaN(value)) {
      return '';
    }
    return String(value);
  });

  const isFocusedRef = useRef(false);

  // Sincronizza lo stato locale solo se l'utente non sta attivamente modificando il campo
  useEffect(() => {
    if (!isFocusedRef.current) {
      if (value === undefined || value === null || isNaN(value)) {
        setLocalStr('');
      } else {
        setLocalStr(String(value));
      }
    }
  }, [value]);

  // Gestione focus con selezione automatica del testo (Bonus UX: tap per sovrascrivere)
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    try {
      e.currentTarget.select();
    } catch {
      // Ignora eventuali restrizioni browser minori
    }
    if (onFocus) {
      onFocus(e);
    }
  };

  // Gestione digitazione: nessun fallback forzato durante la scrittura
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    if (allowDecimals) {
      // Sostituisce virgola con punto per tastiere italiane/europee
      raw = raw.replace(',', '.');

      // Impedisce valori negativi se min >= 0 o non specificato
      if (min === undefined || min >= 0) {
        raw = raw.replace(/-/g, '');
      }

      // Consente solo cifre e al massimo un punto decimale
      if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) {
        return;
      }
    } else {
      // Solo numeri interi positivi
      raw = raw.replace(/\D/g, '');
    }

    setLocalStr(raw);

    // Se l'utente ha già digitato un numero valido e completo, aggiorniamo il parent
    // SENZA forzare alcun fallback (il campo locale può rimanere vuoto o parziale)
    if (raw !== '' && raw !== '.') {
      const parsed = allowDecimals ? parseFloat(raw) : parseInt(raw, 10);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  // Validazione ed eventuale applicazione del fallback SOLO al blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    const trimmed = localStr.trim();

    let finalVal: number;

    if (trimmed === '' || trimmed === '.') {
      // Se il campo è rimasto vuoto, applica il fallback specifico configurato
      finalVal = fallbackValue;
    } else {
      const parsed = allowDecimals ? parseFloat(trimmed) : parseInt(trimmed, 10);
      if (isNaN(parsed)) {
        finalVal = fallbackValue;
      } else {
        finalVal = parsed;
      }
    }

    // Applica eventuali limiti minimi e massimi
    if (min !== undefined && finalVal < min) {
      finalVal = min;
    }
    if (max !== undefined && finalVal > max) {
      finalVal = max;
    }

    setLocalStr(String(finalVal));
    onChange(finalVal);

    if (onBlur) {
      onBlur(e);
    }
  };

  // Premendo Invio, togliamo il focus per confermare
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <input
      {...restProps}
      type="text"
      inputMode={allowDecimals ? 'decimal' : 'numeric'}
      pattern={allowDecimals ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
    />
  );
});

// Alias di compatibilità
export const NumberField = NumericInput;
