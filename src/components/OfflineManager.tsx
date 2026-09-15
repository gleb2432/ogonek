import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, HardDrive, Download, Upload, CheckCircle2, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { Category, Product } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { prefetchAllProductImages, getCachedImagesCount } from '../utils/offlineCache';

interface Props {
  categories: Category[];
  products: Product[];
  onImportMenu?: (data: { categories: Category[]; products: Product[] }) => boolean;
}

export const OfflineManager: React.FC<Props> = ({ categories, products, onImportMenu }) => {
  const isOnline = useOnlineStatus();
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<{
    loaded: number;
    total: number;
    percent: number;
  }>({ loaded: 0, total: 0, percent: 0 });
  const [cacheFinishedMessage, setCacheFinishedMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    getCachedImagesCount().then(setCachedCount);
  }, []);

  // Filter list of product images
  const allImageUrls = React.useMemo(() => {
    return products
      .map(p => p.imageUrl)
      .filter((url): url is string => Boolean(url && url.length > 5));
  }, [products]);

  const handleStartCacheAll = async () => {
    setIsCaching(true);
    setCacheFinishedMessage(null);
    setCacheProgress({ loaded: 0, total: allImageUrls.length, percent: 0 });

    try {
      const result = await prefetchAllProductImages(allImageUrls, (p) => {
        setCacheProgress({ loaded: p.loaded, total: p.total, percent: p.percent });
      });

      const updatedCount = await getCachedImagesCount();
      setCachedCount(updatedCount);
      setCacheFinishedMessage(`Готово! Успешно сохранено ${result.success} фото в память устройства.`);
    } catch {
      setCacheFinishedMessage('Произошла ошибка при загрузке некоторых фото. Попробуйте еще раз.');
    } finally {
      setIsCaching(false);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      restaurant: 'San Takki Любино',
      categories,
      products,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `san-takki-menu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
          if (onImportMenu) {
            onImportMenu({ categories: parsed.categories, products: parsed.products });
            setImportMessage('База меню успешно восстановлена из файла!');
            setTimeout(() => setImportMessage(null), 5000);
          }
        } else {
          setImportMessage('Ошибка: файл имеет неверный формат базы меню.');
        }
      } catch {
        setImportMessage('Ошибка при чтении JSON-файла.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
      {/* Header with real-time Online/Offline indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-stone-900">
                Автономный режим (100% Офлайн)
              </h4>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {isOnline ? 'Интернет подключен' : 'Работает без интернета (Офлайн)'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Меню не требует интернета во время работы с гостями: все блюда, цены, стоп-листы и фотографии хранятся прямо в памяти планшета.
            </p>
          </div>
        </div>
      </div>

      {/* Cache all images for offline */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-5 h-5 text-red-600" />
              <h5 className="font-bold text-stone-900 text-base">
                Кэширование фотографий в память планшета
              </h5>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
              Нажмите кнопку один раз перед выключением Wi-Fi или раздачей планшетов в зал: браузер скачает все {allImageUrls.length} фотографий блюд в постоянную память. После этого меню откроется с полными фото даже при полностью отключенном интернете!
            </p>
            <div className="mt-2 text-xs font-semibold text-stone-500">
              Всего блюд с фото: <span className="text-stone-900 font-bold">{allImageUrls.length}</span>
              {cachedCount > 0 && (
                <span className="ml-3 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  В кэше браузера: ~{cachedCount} объектов
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isCaching}
            onClick={handleStartCacheAll}
            className="shrink-0 px-5 py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
          >
            {isCaching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Загрузка... {cacheProgress.percent}%</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Кэшировать все фото сейчас</span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isCaching && (
          <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Сохранение фотографий в память планшета...</span>
              <span>{cacheProgress.loaded} из {cacheProgress.total} ({cacheProgress.percent}%)</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${cacheProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {cacheFinishedMessage && !isCaching && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{cacheFinishedMessage}</span>
          </div>
        )}
      </div>

      {/* Backup & Transfer Menu without Internet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export JSON */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-stone-900 text-sm mb-1">
              Резервная копия меню (Экспорт в JSON)
            </h5>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              Скачать файл со всеми категориями, товарами, ценами, описаниями и стоп-листами. Файл можно сохранить на флешку или передать на другой планшет.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJson}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Скачать файл меню (.json)</span>
          </button>
        </div>

        {/* Import JSON */}
        <div className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h5 className="font-bold text-stone-900 text-sm mb-1">
              Восстановить меню из файла (Импорт)
            </h5>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              Загрузите ранее сохранённый JSON файл на новый планшет, чтобы перенести всё меню мгновенно без ручного ввода и без интернета.
            </p>
          </div>
          <label className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
            <Upload className="w-4 h-4" />
            <span>Выбрать файл резервной копии</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importMessage && (
        <div className="p-3 bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{importMessage}</span>
        </div>
      )}
    </div>
  );
};
