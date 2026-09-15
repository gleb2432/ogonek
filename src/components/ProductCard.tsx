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
      className={`group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col relative h-full select-none cursor-default ${
        isOutOfStock 
          ? 'border-amber-200/80 bg-stone-50/50' 
          : 'border-stone-100'
      }`}
    >
      <div className="aspect-[4/3] w-full bg-stone-100 relative overflow-hidden">
        <img 
          src={product.imageUrl || '/logo.jpg'} 
          alt={product.name} 
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/logo.jpg';
          }}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none ${
            isOutOfStock ? 'grayscale-[50%] opacity-70' : 'group-hover:scale-105'
          }`} 
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-amber-400/40 text-amber-300 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-md">
              <Ban className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">В стоп-листе</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className={`text-2xl font-bold leading-tight select-none ${isOutOfStock ? 'text-stone-600' : 'text-stone-900'}`}>
            {product.name}
          </h3>
        </div>
        <p className="text-stone-500 text-base line-clamp-3 mb-8 flex-1 leading-relaxed select-none">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className={`text-3xl font-black tracking-tight select-none ${isOutOfStock ? 'text-stone-400' : 'text-stone-900'}`}>
            {product.price} ₽
          </span>
          {isOutOfStock ? (
            <div 
              className="px-4 py-3 bg-stone-100 border border-stone-200 text-stone-400 rounded-2xl flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider select-none cursor-not-allowed"
              title="Блюдо временно недоступно"
            >
              <Ban className="w-4 h-4 text-stone-400" />
              <span>Закончилось</span>
            </div>
          ) : (
            <button 
              type="button"
              onClick={onAddToCart} 
              className="w-16 h-16 bg-stone-100 hover:bg-red-600 hover:text-white text-stone-900 rounded-2xl flex items-center justify-center transition-all active:scale-90 hover:shadow-lg hover:shadow-red-600/30 cursor-pointer"
              aria-label="Добавить в корзину"
            >
              <Plus className="w-8 h-8 pointer-events-none" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
