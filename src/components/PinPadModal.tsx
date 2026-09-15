import React, { useState, useEffect } from 'react';
import { Lock, Unlock, X, Delete, ShieldAlert, KeyRound, Smartphone, Check, Eye, EyeOff } from 'lucide-react';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  actionTarget: 'admin' | 'exit_kiosk' | 'settings';
  onSuccess: (target: 'admin' | 'exit_kiosk' | 'settings') => void;
  onChangePin: (newPin: string) => boolean;
  isKioskActive: boolean;
}

export function PinPadModal({
  isOpen,
  onClose,
  correctPin,
  actionTarget,
  onSuccess,
  onChangePin,
  isKioskActive,
}: PinPadModalProps) {
  const [enteredPin, setEnteredPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChangingPinMode, setIsChangingPinMode] = useState(false);
  const [newPinDraft, setNewPinDraft] = useState('');
  const [showPinDigits, setShowPinDigits] = useState(false);
  const [isSuccessShake, setIsSuccessShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnteredPin('');
      setHasError(false);
      setErrorMessage('');
      setIsChangingPinMode(false);
      setNewPinDraft('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }

    if (isChangingPinMode) {
      if (newPinDraft.length < 6) {
        setNewPinDraft(prev => prev + digit);
      }
      return;
    }

    if (enteredPin.length < 8) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);

      // Auto-validate if matches correctPin length
      if (nextPin.length === correctPin.length) {
        if (nextPin === correctPin) {
          setIsSuccessShake(true);
          if (navigator.vibrate) navigator.vibrate(60);
          setTimeout(() => {
            setIsSuccessShake(false);
            onSuccess(actionTarget);
          }, 250);
        } else {
          setHasError(true);
          setErrorMessage('Неверный PIN-код');
          if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
          setTimeout(() => {
            setEnteredPin('');
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (isChangingPinMode) {
      setNewPinDraft(prev => prev.slice(0, -1));
    } else {
      setEnteredPin(prev => prev.slice(0, -1));
    }
    setHasError(false);
  };

  const handleClear = () => {
    if (isChangingPinMode) {
      setNewPinDraft('');
    } else {
      setEnteredPin('');
    }
    setHasError(false);
  };

  const handleSaveNewPin = () => {
    if (newPinDraft.length < 4) {
      setErrorMessage('Минимум 4 цифры');
      setHasError(true);
      return;
    }
    const ok = onChangePin(newPinDraft);
    if (ok) {
      alert(`Новый PIN-код сохранен: ${newPinDraft}`);
      setIsChangingPinMode(false);
      setEnteredPin('');
      setNewPinDraft('');
    }
  };

  const activeValue = isChangingPinMode ? newPinDraft : enteredPin;
  const targetLength = isChangingPinMode ? 4 : correctPin.length;

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className={`bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm overflow-hidden text-white shadow-2xl transition-transform ${
          hasError ? 'animate-bounce' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {isChangingPinMode
                  ? 'Смена PIN-кода'
                  : actionTarget === 'exit_kiosk'
                  ? 'Выход из режима меню'
                  : 'Доступ для персонала'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {isChangingPinMode ? 'Введите от 4 до 6 цифр' : 'Введите секретную комбинацию'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Display Dots / Preview */}
        <div className="py-6 px-6 text-center bg-stone-950/50">
          <div className="flex items-center justify-center gap-3 mb-3 min-h-[36px]">
            {Array.from({ length: Math.max(targetLength, activeValue.length) }).map((_, idx) => {
              const isFilled = idx < activeValue.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 flex items-center justify-center text-xs font-bold ${
                    isFilled
                      ? hasError
                        ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50'
                        : isSuccessShake
                        ? 'bg-emerald-500 scale-125 shadow-lg shadow-emerald-500/50'
                        : 'bg-white scale-110 shadow-md shadow-white/30'
                      : 'border-2 border-stone-700 bg-stone-900/60'
                  }`}
                >
                  {showPinDigits && isFilled && (
                    <span className="text-stone-900 text-[10px] leading-none">
                      {activeValue[idx]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2">
            <p
              className={`text-xs font-semibold ${
                hasError ? 'text-red-400 font-bold' : 'text-stone-400'
              }`}
            >
              {errorMessage || (isChangingPinMode ? 'Задайте новый код' : 'PIN-код по умолчанию: 1234')}
            </p>
            <button
              type="button"
              onClick={() => setShowPinDigits(!showPinDigits)}
              className="text-stone-500 hover:text-stone-300 transition-colors ml-1"
              title={showPinDigits ? 'Скрыть цифры' : 'Показать цифры'}
            >
              {showPinDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Keypad Grid (1-9, C, 0, Backspace) */}
        <div className="p-5 pt-3 grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-14 rounded-2xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 active:bg-stone-600 text-xl font-bold text-stone-100 shadow-sm transition-all flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-xs font-bold text-stone-400 hover:text-white transition-all flex items-center justify-center"
          >
            Сброс
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-14 rounded-2xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 active:bg-stone-600 text-xl font-bold text-stone-100 shadow-sm transition-all flex items-center justify-center"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-400 hover:text-white transition-all flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls in Modal */}
        <div className="p-4 pt-1 bg-stone-950/40 border-t border-stone-800/50 flex flex-col gap-2">
          {isChangingPinMode ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPinMode(false);
                  setNewPinDraft('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-xs font-bold text-stone-300 hover:bg-stone-700 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveNewPin}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
              >
                Сохранить PIN
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>Секрет: 4 тапа по логотипу</span>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPinMode(true);
                  setNewPinDraft('');
                }}
                className="text-red-400 hover:text-red-300 font-semibold underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" /> Сменить PIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
