import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingCart, Settings, Search, X, Sparkles, SlidersHorizontal, Menu as MenuIcon, Lock, Shield, ShieldAlert, ShieldCheck, WifiOff } from 'lucide-react';
import { Product, Category, CartItem } from '../types';
import { CartDrawer } from './CartDrawer';
import { ProductCard } from './ProductCard';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface Props {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateQuantity: (id: string, d: number) => void;
  clearCart: () => void;
  total: number;
  onOpenAdmin: () => void;
  isKioskEnabled?: boolean;
  onSecretLogoTap?: () => void;
  onToggleKiosk?: () => void;
}

export function MenuApp({ 
  categories, 
  products, 
  cart, 
  addToCart, 
  updateQuantity, 
  clearCart, 
  total, 
  onOpenAdmin,
  isKioskEnabled = false,
  onSecretLogoTap,
  onToggleKiosk,
}: Props) {
  // 'all' or specific category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const productsContainerRef = useRef<HTMLDivElement>(null);

  // When category or search changes, always scroll back to the first product at the very top
  useEffect(() => {
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      productsContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedCategoryId, searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery('');
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      productsContainerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // If a category was deleted and selected, fallback to 'all'
  useEffect(() => {
    if (selectedCategoryId !== 'all' && !categories.some(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId('all');
    }
  }, [categories, selectedCategoryId]);

  const currentCategory = categories.find(c => c.id === selectedCategoryId);

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategoryId !== 'all') {
      list = list.filter(p => p.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategoryId, searchQuery]);

  // Product counts per category
  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    }
    return map;
  }, [products]);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden w-full flex-col lg:flex-row">
      {/* Mobile Top Header (below lg) */}
      <header className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between z-30 shrink-0 shadow-sm">
        <button
          type="button"
          onClick={onSecretLogoTap}
          className="flex items-center gap-3 text-left active:scale-95 transition-transform"
          title="San Takki (4 быстрых нажатия для персонала)"
        >
          <img 
            src="/logo.jpg" 
            alt="San Takki" 
            className="w-11 h-11 rounded-xl object-cover border border-stone-200 shadow-sm"
          />
          <div>
            <h1 className="text-lg font-black text-stone-900 tracking-tight leading-none uppercase">San Takki</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-red-600 font-bold">Любино • Меню</p>
              {!isOnline && (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5 border border-amber-300">
                  <WifiOff className="w-2.5 h-2.5" /> Офлайн
                </span>
              )}
              {isKioskEnabled && (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5 border border-amber-300">
                  <Lock className="w-2.5 h-2.5" /> Замок
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {isKioskEnabled ? (
            <button
              onClick={onOpenAdmin}
              className="p-2.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors flex items-center gap-1"
              title="Режим киоска активен. Требуется PIN для выхода"
            >
              <Lock className="w-5 h-5 text-amber-700" />
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="Панель управления"
              aria-label="Управление"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all text-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{total} ₽</span>
            {cartItemsCount > 0 && (
              <span className="bg-white text-red-600 text-xs font-black px-1.5 py-0.5 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Category Horizontal Scroll Bar */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 z-20 shrink-0">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategoryId === 'all'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>Все блюда</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full ${selectedCategoryId === 'all' ? 'bg-red-700 text-white' : 'bg-stone-200 text-stone-600'}`}>
            {products.length}
          </span>
        </button>

        {categories.map(c => {
          const count = countsByCategory[c.id] || 0;
          return (
            <button
              key={c.id}
              onClick={() => handleCategorySelect(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategoryId === c.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>{c.name}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full ${selectedCategoryId === c.id ? 'bg-red-700 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Left Sidebar (lg+) */}
      <aside className="hidden lg:flex w-[320px] bg-white border-r border-stone-200 flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
        {/* Logo & Brand Header */}
        <div className="p-6 border-b border-stone-100">
          <button
            type="button"
            onClick={onSecretLogoTap}
            className="flex items-center gap-4 text-left active:scale-95 transition-transform w-full group"
            title="San Takki (4 быстрых нажатия для вызова PIN-кода персонала)"
          >
            <img 
              src="/logo.jpg" 
              alt="San Takki" 
              className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shadow-md shrink-0 group-hover:shadow-lg transition-shadow"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black tracking-tight text-stone-900 uppercase leading-none truncate">San Takki</h1>
              <p className="text-xs text-red-600 uppercase tracking-wider font-extrabold mt-1">Любино • Суши и Пицца</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[11px] text-stone-400 font-medium">{products.length} позиций</p>
                {isKioskEnabled && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-amber-300">
                    <Lock className="w-2.5 h-2.5" /> Заблокировано
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold text-base transition-all flex items-center justify-between ${
              selectedCategoryId === 'all' 
                ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-200' 
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              Все категории
            </span>
            <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
              selectedCategoryId === 'all' ? 'bg-red-200/70 text-red-800' : 'bg-stone-100 text-stone-500'
            }`}>
              {products.length}
            </span>
          </button>

          <div className="pt-2 pb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Разделы меню
          </div>

          {categories.map(c => {
            const count = countsByCategory[c.id] || 0;
            const isSelected = selectedCategoryId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCategorySelect(c.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-base transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-200' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                  isSelected ? 'bg-red-200/70 text-red-800' : 'bg-stone-100 text-stone-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 space-y-2">
          {isKioskEnabled ? (
            <div className="space-y-1.5">
              <button 
                onClick={onOpenAdmin} 
                className="flex items-center justify-between w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-900 shadow-sm transition-colors text-left"
                title="Режим стола включен. Требуется PIN для выхода"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-200/80 flex items-center justify-center text-amber-900 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-amber-950 truncate leading-tight">Защита включена</p>
                    <p className="text-[10px] text-amber-700">Выход по PIN-коду</p>
                  </div>
                </div>
                <span className="text-[11px] font-black bg-amber-200 text-amber-900 px-2 py-1 rounded-md">
                  ВЫХОД
                </span>
              </button>
              <p className="text-[10px] text-stone-400 text-center">
                Секрет: 4 тапа по логотипу San Takki
              </p>
            </div>
          ) : (
            <>
              <button 
                onClick={onToggleKiosk} 
                className="flex items-center justify-center gap-2.5 w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-700 shadow-sm transition-colors text-xs font-bold"
                title="Заблокировать планшет в режиме меню перед выдачей гостю"
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Включить защиту стола (Киоск)</span>
              </button>
              <button 
                onClick={onOpenAdmin} 
                className="flex items-center justify-center gap-2.5 w-full p-2.5 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-stone-300 hover:bg-stone-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-xs text-stone-700">Управление меню</span>
              </button>
            </>
          )}
          <PWAInstallButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-stone-50">
        {/* Desktop Sticky Header */}
        <header className="px-6 lg:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/90 backdrop-blur-xl sticky top-0 z-10 border-b border-stone-200/60">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-stone-900">
              {selectedCategoryId === 'all' ? 'Все блюда меню' : currentCategory?.name || 'Меню'}
            </h2>
            <span className="text-sm sm:text-base font-bold text-stone-400">
              ({filteredProducts.length})
            </span>
            {!isOnline && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm" title="Автономный режим — меню работает без интернета">
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Офлайн-режим</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по меню..."
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden lg:flex items-center gap-4 px-6 py-2.5 bg-white rounded-2xl shadow-sm border border-stone-200 hover:border-red-300 hover:shadow-md transition-all group active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-stone-700 group-hover:text-red-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="font-black text-lg text-stone-900">{total} ₽</span>
            </button>
          </div>
        </header>

        {/* Products Grid */}
        <div 
          ref={productsContainerRef}
          id="products-scroll-container"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pt-4"
          style={{ overscrollBehaviorY: 'contain' }}
        >
          {searchQuery && (
            <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200/70 px-4 py-2 rounded-xl text-xs sm:text-sm text-amber-800">
              <span>Результаты поиска по запросу: <strong>«{searchQuery}»</strong></span>
              <button 
                onClick={() => handleCategorySelect(selectedCategoryId)}
                className="font-bold text-amber-900 underline hover:no-underline ml-2"
              >
                Сбросить
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-dashed border-stone-200">
                <p className="text-xl font-bold text-stone-700 mb-2">Блюда не найдены</p>
                <p className="text-sm text-stone-400 mb-4 max-w-sm">
                  {searchQuery 
                    ? `По запросу «${searchQuery}» ничего не найдено. Попробуйте изменить запрос.` 
                    : 'В выбранной категории пока нет позиций.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => handleCategorySelect(selectedCategoryId)}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Показать все блюда
                  </button>
                ) : (
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Перейти ко всем блюдам
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        total={total}
      />
    </div>
  );
}
