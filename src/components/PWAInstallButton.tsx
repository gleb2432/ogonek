import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-4 w-full p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm hover:bg-red-100 transition-colors mt-2"
      >
        <Download className="w-6 h-6" />
        <span className="font-bold text-lg">Установить на планшет</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-4 w-full p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-sm hover:bg-red-100 transition-colors mt-2"
        >
          <Download className="w-6 h-6" />
          <span className="font-bold text-lg">Установить (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95">
              <h3 className="text-xl font-bold text-stone-900">Установка на iPad / iPhone</h3>
              <p className="mt-4 text-stone-600 text-lg leading-relaxed">
                1. Нажмите кнопку <strong>«Поделиться»</strong> в панели Safari.<br />
                2. Прокрутите вниз и выберите <strong>«На экран "Домой"»</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-2xl bg-stone-100 py-4 text-lg font-bold text-stone-800 hover:bg-stone-200 transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
