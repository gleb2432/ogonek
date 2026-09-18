import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
}

export function CartDrawer({ isOpen, onClose, cart, updateQuantity, clearCart, total }: Props) {
  const [orderSent, setOrderSent] = useState(false);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setOrderSent(true);
    setTimeout(() => {
      clearCart();
      setOrderSent(false);
      onClose();
    }, 2400);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in" 
          onClick={onClose} 
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[360px] md:w-[380px] max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-4 sm:py-3.5 border-b border-stone-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-stone-900 leading-tight">
                Ваш заказ
              </h2>
              {cart.length > 0 && (
                <p className="text-[11px] text-stone-400 font-medium">
                  {cart.length} {cart.length === 1 ? 'позиция' : cart.length < 5 ? 'позиции' : 'позиций'} • {totalItemsCount} шт.
                </p>
              )}
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-800 transition-colors active:scale-95"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items List - Compact Layout */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 bg-stone-50/50">
          {orderSent ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-lg font-black text-stone-900">Заказ отправлен!</h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Спасибо! Официант уже видит ваш заказ и скоро принесёт выбранные блюда.
              </p>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-300">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-stone-600">Корзина пуста</p>
              <p className="text-xs text-stone-400 max-w-xs">
                Добавьте аппетитные роллы, пиццу или напитки кнопкой «+» в меню
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id} 
                className="flex items-center gap-2.5 bg-white p-2 sm:p-2.5 rounded-xl shadow-xs border border-stone-200/80 hover:border-stone-300 transition-colors"
              >
                {/* Compact Thumbnail */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                  <img 
                    src={item.imageUrl || '/logo.jpg'} 
                    alt={item.name} 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
                    }}
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Name & Pricing */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-red-600 font-black text-xs sm:text-sm">
                      {item.price * item.quantity} ₽
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-stone-400 font-medium">
                        ({item.price} ₽/шт)
                      </span>
                    )}
                  </div>
                </div>

                {/* Compact Stepper */}
                <div className="flex items-center bg-stone-100/90 rounded-lg p-0.5 shrink-0 border border-stone-200/60">
                  <button 
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)} 
                    className="p-1 hover:bg-white text-stone-600 hover:text-red-600 rounded-md transition-colors active:scale-90"
                    title="Уменьшить"
                    aria-label="Уменьшить количество"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span className="min-w-[20px] text-center font-bold text-xs sm:text-sm text-stone-900 select-none">
                    {item.quantity}
                  </span>
                  <button 
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)} 
                    className="p-1 hover:bg-white text-stone-600 hover:text-red-600 rounded-md transition-colors active:scale-90"
                    title="Увеличить"
                    aria-label="Увеличить количество"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, -item.quantity)}
                  className="p-1 text-stone-300 hover:text-red-500 transition-colors rounded-md active:scale-90 shrink-0"
                  title="Удалить позицию"
                  aria-label="Удалить позицию"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Compact Footer */}
        {cart.length > 0 && !orderSent && (
          <div className="p-3 sm:p-3.5 border-t border-stone-200 bg-white shadow-[0_-6px_20px_-8px_rgba(0,0,0,0.06)] shrink-0">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Итого к оплате
              </span>
              <span className="text-xl sm:text-2xl font-black text-stone-900">
                {total} ₽
              </span>
            </div>
            <button 
              type="button"
              onClick={handleCheckout}
              className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/25 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Оформить заказ</span>
            </button>
            <button 
              type="button"
              onClick={clearCart} 
              className="w-full mt-1.5 py-1 text-stone-400 hover:text-red-600 font-semibold text-xs rounded-lg transition-colors active:bg-stone-50"
            >
              Очистить корзину
            </button>
          </div>
        )}
      </div>
    </>
  );
}
