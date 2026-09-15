import { useState, useEffect, useCallback } from 'react';

const KIOSK_PIN_KEY = 'san_takki_kiosk_pin';
const KIOSK_ENABLED_KEY = 'san_takki_kiosk_enabled';
const DEFAULT_PIN = '1234';

export function useKiosk() {
  const [pin, setPinState] = useState<string>(() => {
    return localStorage.getItem(KIOSK_PIN_KEY) || DEFAULT_PIN;
  });

  const [isKioskEnabled, setIsKioskEnabledState] = useState<boolean>(() => {
    return localStorage.getItem(KIOSK_ENABLED_KEY) === 'true';
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return Boolean(document.fullscreenElement);
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinActionTarget, setPinActionTarget] = useState<'admin' | 'exit_kiosk' | 'settings'>('admin');

  // Save PIN
  const setPin = (newPin: string) => {
    const clean = newPin.replace(/\D/g, '').slice(0, 8);
    if (clean.length >= 4) {
      setPinState(clean);
      localStorage.setItem(KIOSK_PIN_KEY, clean);
      return true;
    }
    return false;
  };

  // Toggle Fullscreen safely
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not allowed in frame:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
  };

  // Enable Kiosk Mode
  const enableKiosk = () => {
    setIsKioskEnabledState(true);
    localStorage.setItem(KIOSK_ENABLED_KEY, 'true');
    enterFullscreen();
  };

  // Disable Kiosk Mode
  const disableKiosk = () => {
    setIsKioskEnabledState(false);
    localStorage.setItem(KIOSK_ENABLED_KEY, 'false');
    exitFullscreen();
  };

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // Browser Exit Prevention & Kiosk Traps when enabled
  useEffect(() => {
    if (!isKioskEnabled) return;

    // 1. Prevent back button / gesture swipe navigation
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    // 2. Prevent accidental tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 3. Disable right-click / context menu on tablets
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isKioskEnabled]);

  // Secret Logo Tap Combination (4 rapid taps within 1.5 seconds)
  const tapTimestampsRef = useState<number[]>(() => [])[0];

  const handleSecretLogoTap = useCallback(() => {
    const now = Date.now();
    // Keep taps from the last 1500ms
    while (tapTimestampsRef.length > 0 && now - tapTimestampsRef[0] > 1500) {
      tapTimestampsRef.shift();
    }
    tapTimestampsRef.push(now);

    if (tapTimestampsRef.length >= 4) {
      tapTimestampsRef.length = 0; // reset
      setPinActionTarget('exit_kiosk');
      setIsPinModalOpen(true);
      if (navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
    }
  }, [tapTimestampsRef]);

  // Keyboard shortcut listener (Ctrl+Shift+L or 3x Esc)
  useEffect(() => {
    let escCount = 0;
    let lastEscTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl+Alt+K or Ctrl+Shift+L
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setPinActionTarget('exit_kiosk');
        setIsPinModalOpen(true);
        return;
      }

      // Triple Escape
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscTime < 800) {
          escCount++;
        } else {
          escCount = 1;
        }
        lastEscTime = now;

        if (escCount >= 3) {
          escCount = 0;
          e.preventDefault();
          setPinActionTarget('exit_kiosk');
          setIsPinModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openPinModal = (target: 'admin' | 'exit_kiosk' | 'settings' = 'admin') => {
    setPinActionTarget(target);
    setIsPinModalOpen(true);
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
  };

  return {
    pin,
    setPin,
    isKioskEnabled,
    enableKiosk,
    disableKiosk,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    isPinModalOpen,
    pinActionTarget,
    openPinModal,
    closePinModal,
    handleSecretLogoTap,
  };
}
