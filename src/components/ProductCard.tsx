import React from 'react';
import { Plus, Ban } from 'lucide-react';
import { Product } from '../types';

interface Props {
  key?: React.Key;
  product: Product;
  onAddToCart: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  const isOutOfStock = product.isAvailable === false;

  return (
    <div 
      className={`group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col relative h-full select-none cursor-default ${
        isOutOfStock 
          ? 'border-amber-200/80 bg-stone-50/50' 
          : 'border-stone-200/70'
      }`}
    >
      <div className="aspect-[16/10] w-full bg-stone-100 relative overflow-hidden shrink-0">
        <img 
          src={product.imageUrl || '/logo.jpg'} 
          alt={product.name} 
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out pointer-events-none ${
            isOutOfStock ? 'grayscale-[50%] opacity-70' : 'group-hover:scale-105'
          }`} 
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] flex items-center justify-center p-2">
            <div className="bg-stone-900/90 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 backdrop-blur-md">
              <Ban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider">В стоп-листе</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className={`text-sm sm:text-base font-bold leading-snug line-clamp-1 select-none ${isOutOfStock ? 'text-stone-600' : 'text-stone-900'}`} title={product.name}>
            {product.name}
          </h3>
        </div>
        <p className="text-stone-500 text-xs line-clamp-2 mb-2.5 flex-1 leading-relaxed select-none" title={product.description}>
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-stone-100">
          <span className={`text-base sm:text-lg font-black tracking-tight select-none ${isOutOfStock ? 'text-stone-400' : 'text-stone-900'}`}>
            {product.price} ₽
          </span>
          {isOutOfStock ? (
            <div 
              className="px-2.5 py-1.5 bg-stone-100 border border-stone-200 text-stone-400 rounded-xl flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider select-none cursor-not-allowed"
              title="Блюдо временно недоступно"
            >
              <Ban className="w-3.5 h-3.5 text-stone-400" />
              <span>Закончилось</span>
            </div>
          ) : (
            <button 
              type="button"
              onClick={onAddToCart} 
              className="w-9 h-9 sm:w-10 sm:h-10 bg-stone-100 hover:bg-red-600 hover:text-white text-stone-900 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:shadow-md cursor-pointer shrink-0"
              aria-label="Добавить в корзину"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
