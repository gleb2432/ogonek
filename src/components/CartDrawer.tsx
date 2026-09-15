import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
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
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" 
          onClick={onClose} 
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-8 border-b border-stone-100 bg-white">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-stone-900">
            <ShoppingBag className="w-8 h-8 text-red-600" /> Заказ
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-colors active:scale-95">
            <X className="w-7 h-7 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-stone-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <ShoppingBag className="w-24 h-24 opacity-20" />
              <p className="text-xl font-medium">Корзина пока пуста</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-stone-100">
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200'} 
                  alt={item.name} 
                  className="w-24 h-24 rounded-2xl object-cover bg-stone-100" 
                />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-stone-900 text-lg leading-tight line-clamp-2">{item.name}</h3>
                  <p className="text-red-600 font-black text-lg mt-1">{item.price} ₽</p>
                </div>
                <div className="flex flex-col items-center gap-2 bg-stone-100 rounded-2xl p-2">
                  <button 
                    onClick={() => updateQuantity(item.id, 1)} 
                    className="p-2 bg-white text-stone-900 hover:text-red-600 shadow-sm rounded-xl transition-colors active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="w-6 text-center font-bold text-lg text-stone-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, -1)} 
                    className="p-2 bg-white text-stone-900 hover:text-red-600 shadow-sm rounded-xl transition-colors active:scale-95"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t border-stone-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-semibold text-stone-500 uppercase tracking-wider">Итого</span>
              <span className="text-4xl font-black text-stone-900">{total} ₽</span>
            </div>
            <button className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-red-600/30 active:scale-[0.98]">
              Оформить заказ
            </button>
            <button 
              onClick={clearCart} 
              className="w-full mt-4 py-4 text-stone-500 hover:text-red-600 font-bold text-lg rounded-2xl transition-colors active:bg-stone-50"
            >
              Очистить корзину
            </button>
          </div>
        )}
      </div>
    </>
  );
}
