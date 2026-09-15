import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, List, ArrowLeft, Plus, Edit2, Trash2, Search, Image as ImageIcon, RotateCcw, Camera, Lock, ShieldCheck, Smartphone, KeyRound, AlertTriangle, Check, Tablet, Monitor, Download, ExternalLink, Copy, Ban, CheckCircle2, ChevronUp, ChevronDown, FolderPlus, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductModal, CategoryModal } from './Modals';
import { OfflineManager } from './OfflineManager';

interface Props {
  categories: Category[];
  products: Product[];
  addCategory: (name: string) => string | void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  moveCategory?: (id: string, direction: 'up' | 'down') => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability?: (id: string) => void;
  setAllProductsAvailability?: (available: boolean) => void;
  importMenuData?: (data: { categories: Category[]; products: Product[] }) => boolean;
  resetToDefault: () => void;
  onClose: () => void;
  isKioskEnabled?: boolean;
  enableKiosk?: () => void;
  disableKiosk?: () => void;
  pin?: string;
  setPin?: (pin: string) => boolean;
}

export function AdminPanel({
  categories, products, addCategory, updateCategory, deleteCategory, moveCategory,
  addProduct, updateProduct, deleteProduct,
  toggleProductAvailability,
  setAllProductsAvailability,
  importMenuData,
  resetToDefault, onClose,
  isKioskEnabled = false,
  enableKiosk,
  disableKiosk,
  pin = '1234',
  setPin,
}: Props) {
  const [activeTab, setActiveTab] = useState<'products' | 'stoplist' | 'categories' | 'kiosk' | 'offline'>('products');
  const [search, setSearch] = useState('');
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Stop-list specific filters
  const [stopListFilterMode, setStopListFilterMode] = useState<'only_stopped' | 'all'>('only_stopped');
  const [stopListCategoryFilter, setStopListCategoryFilter] = useState<string>('all');
  const [stopListSearch, setStopListSearch] = useState<string>('');

  const adminScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adminScrollRef.current) {
      adminScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | null | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'product' | 'category' | 'reset_menu' | 'unstop_all';
    id?: string;
    name?: string;
    count?: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const stoppedProducts = products.filter(p => p.isAvailable === false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    categories.find(c => c.id === p.categoryId)?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const stopListDisplayProducts = products.filter(p => {
    const matchesMode = stopListFilterMode === 'all' || p.isAvailable === false;
    const matchesCat = stopListCategoryFilter === 'all' || p.categoryId === stopListCategoryFilter;
    const matchesSearch = !stopListSearch.trim() || 
      p.name.toLowerCase().includes(stopListSearch.toLowerCase()) ||
      categories.find(c => c.id === p.categoryId)?.name?.toLowerCase().includes(stopListSearch.toLowerCase());
    return matchesMode && matchesCat && matchesSearch;
  });

  const handleUpdatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setPin && newPinInput.length >= 4) {
      const ok = setPin(newPinInput);
      if (ok) {
        setPinChangeSuccess(true);
        setTimeout(() => setPinChangeSuccess(false), 3000);
        setNewPinInput('');
      }
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden w-full flex-col lg:flex-row">
      {/* Mobile Admin Bar */}
      <div className="lg:hidden bg-stone-900 text-stone-300 p-3 px-4 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="San Takki" className="w-9 h-9 rounded-xl object-cover border border-stone-700 shrink-0" />
          <div>
            <h1 className="text-base font-black text-white leading-none">San Takki</h1>
            <p className="text-[11px] text-stone-400">Управление</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${activeTab === 'products' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300'}`}
          >
            Товары
          </button>
          <button 
            onClick={() => setActiveTab('stoplist')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 ${activeTab === 'stoplist' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300'}`}
          >
            <Ban className="w-3 h-3 text-amber-400" />
            <span>Стоп-лист</span>
            {stoppedProducts.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full">
                {stoppedProducts.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${activeTab === 'categories' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300'}`}
          >
            Категории
          </button>
          <button 
            onClick={() => setActiveTab('kiosk')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 ${activeTab === 'kiosk' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300'}`}
          >
            <Lock className="w-3 h-3" /> Защита
          </button>
          <button 
            onClick={() => setActiveTab('offline')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 ${activeTab === 'offline' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300'}`}
          >
            <HardDrive className="w-3 h-3 text-amber-400" /> Офлайн
          </button>
          <button 
            onClick={onClose}
            className="px-2.5 py-1.5 bg-stone-700 hover:bg-stone-600 text-xs font-semibold rounded-lg text-white shrink-0"
          >
            В меню
          </button>
        </div>
      </div>

      {/* Admin Sidebar */}
      <aside className="hidden lg:flex w-[280px] bg-stone-900 text-stone-300 flex-col z-20 shrink-0">
        <div className="p-6 border-b border-stone-800 flex items-center gap-3.5">
          <img 
            src="/logo.jpg" 
            alt="San Takki" 
            className="w-12 h-12 rounded-2xl object-cover border border-stone-700 shadow-md shrink-0" 
          />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight">San Takki</h1>
            <p className="text-xs text-red-400 font-bold">Любино • Админ</p>
            <p className="text-[11px] text-stone-500 mt-0.5">{products.length} блюд, {categories.length} категорий</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'products' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5" /> Товары
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md ${activeTab === 'products' ? 'bg-red-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
              {products.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('stoplist')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'stoplist' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <Ban className={`w-5 h-5 ${activeTab === 'stoplist' ? 'text-white' : 'text-amber-400'}`} /> Стоп-лист
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${
              stoppedProducts.length > 0 
                ? 'bg-amber-500 text-stone-950 shadow-sm' 
                : (activeTab === 'stoplist' ? 'bg-red-700 text-white' : 'bg-stone-800 text-stone-400')
            }`}>
              {stoppedProducts.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'categories' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <List className="w-5 h-5" /> Категории
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md ${activeTab === 'categories' ? 'bg-red-700 text-white' : 'bg-stone-800 text-stone-400'}`}>
              {categories.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('kiosk')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'kiosk' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <Lock className="w-5 h-5" /> Защита стола / Киоск
            </span>
            {isKioskEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-black font-extrabold">
                ON
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('offline')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'offline' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <HardDrive className="w-5 h-5" /> Автономность / Офлайн
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-bold">
              100%
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-stone-800 space-y-2">
          <button 
            type="button"
            onClick={() => setDeleteConfirm({ type: 'reset_menu' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors text-sm"
            title="Восстановить меню из группы VK"
          >
            <RotateCcw className="w-5 h-5 text-red-500" /> Меню из группы
          </button>
          <button 
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium hover:bg-stone-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> В меню планшета
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <header className="h-24 px-6 lg:px-10 flex items-center justify-between border-b border-stone-100">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-stone-900">
              {activeTab === 'products' && 'Товары'}
              {activeTab === 'stoplist' && 'Стоп-лист (Закончившиеся блюда)'}
              {activeTab === 'categories' && 'Категории'}
              {activeTab === 'kiosk' && 'Защита планшета (Киоск)'}
              {activeTab === 'offline' && 'Автономная работа (100% Офлайн)'}
            </h2>
            {activeTab === 'stoplist' && (
              <p className="text-xs text-stone-500 mt-1">
                Блюда в стоп-листе блокируются для заказа гостями и помечаются специальной меткой
              </p>
            )}
            {activeTab === 'kiosk' && (
              <p className="text-xs text-stone-500 mt-1">
                Блокировка закрытия меню гостями • Доступ по секретной комбинации
              </p>
            )}
            {activeTab === 'offline' && (
              <p className="text-xs text-stone-500 mt-1">
                Сохранение всех фото в память устройства • Работа без интернета • Экспорт и импорт
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'stoplist' && (
              <div className="flex items-center gap-3">
                {stoppedProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ type: 'unstop_all', count: stoppedProducts.length })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Снять всё со стопа</span>
                  </button>
                )}
                <span className={`text-xs font-bold px-3 py-2 rounded-xl border ${
                  stoppedProducts.length > 0
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  На стопе: {stoppedProducts.length}
                </span>
              </div>
            )}
            {activeTab === 'products' && (
              <>
                <div className="relative">
                  <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Поиск..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-64 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" /> Добавить товар
                </button>
              </>
            )}
            {activeTab === 'categories' && (
              <button 
                onClick={() => setEditingCategory(null)}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Добавить категорию
              </button>
            )}
            {activeTab === 'kiosk' && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  isKioskEnabled 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isKioskEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
                  {isKioskEnabled ? 'Киоск включен' : 'Киоск выключен'}
                </span>
              </div>
            )}
          </div>
        </header>

        <div ref={adminScrollRef} className="flex-1 overflow-y-auto p-6 lg:p-10 bg-stone-50/30">
          {activeTab === 'kiosk' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Quick Toggle Card */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      isKioskEnabled ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {isKioskEnabled ? <Lock className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">
                        {isKioskEnabled ? 'Режим киоска активен' : 'Защита меню перед выдачей планшета гостю'}
                      </h3>
                      <p className="text-sm text-stone-500 mt-1 max-w-xl">
                        При включении приложение разворачивается на весь экран, блокирует жесты «Назад», контекстное меню и случайное закрытие. Выйти из меню можно только по секретной комбинации тапов и PIN-коду.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isKioskEnabled ? (
                      <button
                        onClick={disableKiosk}
                        className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl transition-all shadow-sm active:scale-95"
                      >
                        Отключить киоск
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (enableKiosk) enableKiosk();
                          onClose();
                        }}
                        className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/25 active:scale-95 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Запустить режим стола
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Secret Combination & PIN Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Secret Combo Details */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 mb-2">
                      Секретная комбинация для персонала
                    </h4>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Гости не видят кнопки выхода. Чтобы открыть окно ввода PIN-кода и выйти из режима меню:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-stone-700 font-medium">
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                        <span><strong>4 быстрых тапа</strong> по логотипу San Takki в левом верхнем углу экрана</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                        <span>Или комбинация клавиш <strong>Ctrl + Alt + K</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                        <span>Или 3 быстрых нажатия <strong>Escape</strong></span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-400">
                    После ввода правильного PIN-кода меню закрывается или открывается админ-панель.
                  </div>
                </div>

                {/* PIN Code Setup */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-1">
                    PIN-код разблокировки
                  </h4>
                  <p className="text-xs text-stone-500 mb-4">
                    Текущий PIN-код: <strong className="text-stone-900 tracking-wider text-sm bg-stone-100 px-2 py-0.5 rounded-md">{pin}</strong>
                  </p>

                  <form onSubmit={handleUpdatePinSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 mb-1 block">
                        Задать новый PIN-код (от 4 до 8 цифр):
                      </label>
                      <input 
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        value={newPinInput}
                        onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Например: 1234"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={newPinInput.length < 4}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Сохранить новый PIN-код
                    </button>

                    {pinChangeSuccess && (
                      <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 mt-2">
                        <Check className="w-4 h-4" /> Новый PIN-код успешно установлен!
                      </p>
                    )}
                  </form>
                </div>
              </div>

              {/* Hardware Tablet Lock Instructions (100% Protection) */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                    <Tablet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight">
                      Как заблокировать планшет на 100% (Режим витрины/киоска)
                    </h4>
                    <p className="text-xs text-stone-400">
                      Чтобы гость физически не мог нажать «Домой» или свернуть браузер
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* iPad / iOS */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h5 className="font-bold text-sm text-red-400 mb-2 flex items-center gap-2">
                      🍎 Для Apple iPad (Гид-доступ)
                    </h5>
                    <ol className="text-xs text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Откройте <strong>«Настройки» → «Универсальный доступ» → «Гид-доступ»</strong> и включите его.</li>
                      <li>Задайте код-пароль для гид-доступа.</li>
                      <li>Откройте меню San Takki в Safari и нажмите кнопку питания <strong>3 раза подряд</strong>.</li>
                      <li>Нажмите <strong>«Старт»</strong> в углу экрана. Планшет заблокирован в меню!</li>
                    </ol>
                  </div>

                  {/* Android */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h5 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-2">
                      🤖 Для Android планшетов (Блокировка в приложении)
                    </h5>
                    <ol className="text-xs text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Откройте <strong>«Настройки» → «Безопасность» → «Блокировка в приложении» (App Pinning)</strong>.</li>
                      <li>Включите блокировку и запросы пароля.</li>
                      <li>Откройте меню San Takki, перейдите в список открытых окон.</li>
                      <li>Нажмите на значок меню и выберите <strong>«Закрепить»</strong>. Выйти без пароля планшета невозможно!</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* APK Generation Card */}
              <div className="bg-white border-2 border-emerald-500/20 rounded-3xl p-6 lg:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xl font-bold text-stone-900">
                        Как получить APK файл для планшета Android
                      </h4>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        2 быстрых способа
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                      Приложение полностью оптимизировано и готово для установки в виде нативного Android APK.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                      {/* Method 1: WebAPK */}
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">1</span>
                            <h5 className="font-bold text-sm text-stone-900">Самый простой способ (WebAPK)</h5>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Не требует сборки на компьютере: откройте ссылку меню в браузере <strong>Google Chrome</strong> на планшете и выберите <strong>«Установить приложение»</strong>.
                          </p>
                          <p className="text-xs text-stone-500 mt-2">
                            Android сам сгенерирует нативный системный APK-пакет, создаст отдельную иконку без рамок браузера и позволит закрепить приложение на столе.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2500);
                            }}
                            className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedLink ? 'Ссылка скопирована!' : 'Скопировать ссылку для планшета'}
                          </button>
                        </div>
                      </div>

                      {/* Method 2: PWABuilder / Direct APK */}
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">2</span>
                            <h5 className="font-bold text-sm text-stone-900">Скачать готовый .APK файл</h5>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Официальный сервис от <strong>Microsoft & Google (PWABuilder)</strong> собирает готовый подписанный <strong>.apk</strong> файл из манифеста нашего приложения за 1 минуту.
                          </p>
                          <p className="text-xs text-stone-500 mt-2">
                            Подходит для установки через флешку, RuStore или отправки в Telegram/WhatsApp.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center gap-2">
                          <a
                            href={`https://www.pwabuilder.com/?url=${encodeURIComponent(window.location.origin)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Собрать APK в PWABuilder
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offline & Cache Section inside Kiosk settings */}
                <div className="pt-2">
                  <OfflineManager 
                    categories={categories}
                    products={products}
                    onImportMenu={importMenuData}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'offline' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <OfflineManager 
                categories={categories}
                products={products}
                onImportMenu={importMenuData}
              />
            </div>
          )}
          {activeTab === 'products' && (
            <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 text-stone-500 border-b border-stone-200">
                    <th className="font-semibold px-6 py-4 w-20">Фото</th>
                    <th className="font-semibold px-6 py-4">Название</th>
                    <th className="font-semibold px-6 py-4">Категория</th>
                    <th className="font-semibold px-6 py-4">Цена</th>
                    <th className="font-semibold px-6 py-4">Стоп-лист</th>
                    <th className="font-semibold px-6 py-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="relative group/pic block text-left"
                          title="Нажмите, чтобы сделать фото или загрузить"
                        >
                          {product.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className={`w-full h-full object-cover ${product.isAvailable === false ? 'grayscale opacity-70' : ''}`} 
                              />
                              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/pic:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover/pic:bg-red-50 flex items-center justify-center text-stone-400 group-hover/pic:text-red-500 border border-stone-200 transition-colors">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span>{product.name}</span>
                          {product.isAvailable === false && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                              СТОП
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-500">{categories.find(c => c.id === product.categoryId)?.name || '—'}</td>
                      <td className="px-6 py-4 font-bold text-stone-900">{product.price} ₽</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleProductAvailability?.(product.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
                            product.isAvailable === false
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-amber-50 hover:text-amber-800'
                          }`}
                          title={product.isAvailable === false ? 'Нажмите, чтобы снять со стопа и вернуть в меню' : 'Нажмите, чтобы поставить блюдо в стоп-лист'}
                        >
                          {product.isAvailable === false ? (
                            <>
                              <Ban className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>На стопе</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span>В наличии</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingProduct(product)} 
                            className="px-3 py-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold border border-stone-200"
                            title="Сделать фото или изменить товар"
                          >
                            <Camera className="w-4 h-4 text-red-500" />
                            <span>Фото</span>
                          </button>
                          <button onClick={() => setEditingProduct(product)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" title="Редактировать">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDeleteConfirm({ type: 'product', id: product.id, name: product.name })} 
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-stone-400 font-medium text-lg">
                        Товары не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stoplist' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Summary and Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Сейчас на стопе</p>
                    <p className="text-3xl font-black text-amber-600 mt-1">{stoppedProducts.length}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Заблокировано для заказа</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Ban className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Доступно к заказу</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{products.length - stoppedProducts.length}</p>
                    <p className="text-xs text-stone-400 mt-0.5">В меню планшета</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Всего в меню</p>
                    <p className="text-3xl font-black text-stone-900 mt-1">{products.length}</p>
                    <p className="text-xs text-stone-400 mt-0.5">По всем категориям</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Toolbar & Filters */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Mode switch */}
                  <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setStopListFilterMode('only_stopped')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        stopListFilterMode === 'only_stopped'
                          ? 'bg-amber-500 text-stone-950 shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Только на стопе ({stoppedProducts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStopListFilterMode('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        stopListFilterMode === 'all'
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>Все блюда меню ({products.length})</span>
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Поиск по названию или разделу..."
                      value={stopListSearch}
                      onChange={(e) => setStopListSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={stopListCategoryFilter}
                    onChange={(e) => setStopListCategoryFilter(e.target.value)}
                    className="px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 outline-none focus:border-red-500"
                  >
                    <option value="all">Все категории ({products.length})</option>
                    {categories.map((cat) => {
                      const count = products.filter(p => p.categoryId === cat.id).length;
                      const stoppedCount = products.filter(p => p.categoryId === cat.id && p.isAvailable === false).length;
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({stoppedCount > 0 ? `стоп: ${stoppedCount} / ` : ''}всего: {count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Explanation banner */}
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Когда блюдо помещено в <strong>стоп-лист</strong>, на карточке в планшете гостей отображается метка «В стоп-листе / Закончилось», а кнопка добавления блокируется.
                  </span>
                </div>
              </div>

              {/* Product List */}
              <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
                {stopListDisplayProducts.length > 0 ? (
                  <div className="divide-y divide-stone-100">
                    {stopListDisplayProducts.map(product => {
                      const isStopped = product.isAvailable === false;
                      const categoryName = categories.find(c => c.id === product.categoryId)?.name || '—';
                      return (
                        <div 
                          key={product.id} 
                          className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            isStopped ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-stone-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className={`w-full h-full object-cover transition-all ${isStopped ? 'grayscale contrast-125 opacity-75' : ''}`} 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
                              {isStopped && (
                                <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                                  <Ban className="w-6 h-6 text-amber-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-stone-900 text-base">{product.name}</h4>
                                {isStopped ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300">
                                    <Ban className="w-3 h-3 text-red-600" /> На стопе
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Check className="w-3 h-3" /> В наличии
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 mt-1">
                                {categoryName} • <span className="font-bold text-stone-700">{product.price} ₽</span>
                                {product.description ? ` • ${product.description.slice(0, 45)}${product.description.length > 45 ? '...' : ''}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => toggleProductAvailability?.(product.id)}
                              className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95 ${
                                isStopped
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                                  : 'bg-amber-500 text-stone-950 hover:bg-amber-600 shadow-amber-500/20'
                              }`}
                            >
                              {isStopped ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                  <span>Снять со стопа (Вернуть)</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 text-red-700" />
                                  <span>Поставить на стоп</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 px-6 text-center">
                    {stopListFilterMode === 'only_stopped' ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900">Стоп-лист сейчас пуст!</h3>
                        <p className="text-sm text-stone-500">
                          Все блюда кухни San Takki доступны для заказа гостями на планшете. Если какое-то блюдо закончилось, переключитесь на «Все блюда» и нажмите «Поставить на стоп».
                        </p>
                        <button
                          type="button"
                          onClick={() => setStopListFilterMode('all')}
                          className="mt-2 px-6 py-2.5 bg-stone-900 text-white rounded-2xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-md inline-flex items-center gap-2"
                        >
                          <span>Показать все блюда меню</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-stone-400 font-medium">Блюда по заданному фильтру не найдены</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Quick Add Category Card */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Добавить новую категорию</h3>
                    <p className="text-xs text-stone-500">
                      Новый раздел сразу появится в навигации меню на планшете
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (quickCategoryName.trim()) {
                      addCategory(quickCategoryName.trim());
                      setQuickCategoryName('');
                    }
                  }}
                  className="mt-4 flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    placeholder="Например: Десерты, Напитки, Салаты, Супы..."
                    className="flex-1 px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-base font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!quickCategoryName.trim()}
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-2xl font-bold text-sm shadow-md shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Добавить раздел</span>
                  </button>
                </form>
              </div>

              {/* Categories list table */}
              <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Разделы меню ({categories.length})
                  </span>
                  <span className="text-xs text-stone-400">
                    Стрелки ↑ ↓ меняют порядок вкладок в меню планшета
                  </span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/40 text-stone-500 border-b border-stone-200 text-xs uppercase tracking-wider">
                      <th className="font-semibold px-6 py-3 w-16 text-center">№</th>
                      <th className="font-semibold px-6 py-3">Название</th>
                      <th className="font-semibold px-6 py-3">Блюд</th>
                      <th className="font-semibold px-6 py-3 text-center w-28">Порядок</th>
                      <th className="font-semibold px-6 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {categories.map((category, index) => {
                      const count = products.filter(p => p.categoryId === category.id).length;
                      const isFirst = index === 0;
                      const isLast = index === categories.length - 1;
                      return (
                        <tr key={category.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4 text-center">
                            <span className="w-7 h-7 rounded-xl bg-stone-100 text-stone-600 inline-flex items-center justify-center font-bold text-xs">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-stone-900 text-base">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 text-stone-500">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                              {count} {count === 1 ? 'блюдо' : count > 1 && count < 5 ? 'блюда' : 'блюд'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => moveCategory?.(category.id, 'up')}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                title="Поднять категорию выше"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => moveCategory?.(category.id, 'down')}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                title="Опустить категорию ниже"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setEditingCategory(category)} 
                                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                                title="Переименовать"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })} 
                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" 
                                title="Удалить категорию"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-medium">
                          <p className="text-base mb-3">Категории пока не созданы</p>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Создать первую категорию</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {editingProduct !== undefined && (
        <ProductModal
          product={editingProduct}
          categoryId={categories[0]?.id || ''}
          categories={categories}
          onClose={() => setEditingProduct(undefined)}
          onAddCategory={addCategory}
          onDelete={(id) => {
            setDeleteConfirm({ type: 'product', id, name: editingProduct?.name || 'Товар' });
            setEditingProduct(undefined);
          }}
          onSave={(p) => {
            if (editingProduct) {
              updateProduct({ ...p, id: editingProduct.id });
              showToast(`Товар «${p.name}» успешно обновлен`);
            } else {
              addProduct(p);
              showToast(`Товар «${p.name}» успешно добавлен`);
            }
            setEditingProduct(undefined);
          }}
        />
      )}

      {editingCategory !== undefined && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(undefined)}
          onSave={(name) => {
            if (editingCategory) {
              updateCategory(editingCategory.id, name);
              showToast(`Раздел «${name}» переименован`);
            } else {
              addCategory(name);
              showToast(`Раздел «${name}» успешно создан`);
            }
            setEditingCategory(undefined);
          }}
        />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 text-center space-y-4">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
              deleteConfirm.type === 'unstop_all' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {deleteConfirm.type === 'unstop_all' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : deleteConfirm.type === 'reset_menu' ? (
                <RotateCcw className="w-7 h-7" />
              ) : (
                <Trash2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-black text-stone-900">
                {deleteConfirm.type === 'product' && 'Удалить товар?'}
                {deleteConfirm.type === 'category' && 'Удалить раздел?'}
                {deleteConfirm.type === 'reset_menu' && 'Восстановить меню?'}
                {deleteConfirm.type === 'unstop_all' && 'Вернуть все блюда?'}
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                {deleteConfirm.type === 'product' && (
                  <>Вы действительно хотите удалить блюдо <strong className="text-stone-900">«{deleteConfirm.name}»</strong>? Оно исчезнет из меню на планшете.</>
                )}
                {deleteConfirm.type === 'category' && (
                  <>Вы действительно хотите удалить раздел <strong className="text-stone-900">«{deleteConfirm.name}»</strong> и все блюда, входящие в него?</>
                )}
                {deleteConfirm.type === 'reset_menu' && (
                  <>Сбросить все текущие изменения и вернуть исходное оригинальное меню San Takki (Любино) со всеми 45 блюдами?</>
                )}
                {deleteConfirm.type === 'unstop_all' && (
                  <>Вернуть все {deleteConfirm.count} блюд из стоп-листа обратно в активное меню для гостей?</>
                )}
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'product' && deleteConfirm.id) {
                    deleteProduct(deleteConfirm.id);
                    showToast(`Блюдо «${deleteConfirm.name || ''}» удалено`);
                  } else if (deleteConfirm.type === 'category' && deleteConfirm.id) {
                    deleteCategory(deleteConfirm.id);
                    showToast(`Раздел «${deleteConfirm.name || ''}» удален`);
                  } else if (deleteConfirm.type === 'reset_menu') {
                    resetToDefault();
                    showToast('Меню восстановлено к оригинальному');
                  } else if (deleteConfirm.type === 'unstop_all') {
                    setAllProductsAvailability?.(true);
                    showToast('Все блюда снова доступны в меню');
                  }
                  setDeleteConfirm(null);
                }}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm text-white transition-all shadow-lg active:scale-95 ${
                  deleteConfirm.type === 'unstop_all'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                }`}
              >
                {deleteConfirm.type === 'unstop_all' ? 'Вернуть' : deleteConfirm.type === 'reset_menu' ? 'Сбросить' : 'Да, удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
