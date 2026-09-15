import React, { useState } from 'react';
import { X, Plus, Check, Trash2 } from 'lucide-react';
import { Product, Category } from '../types';
import { ImagePicker } from './ImagePicker';

interface ProductModalProps {
  product?: Product | null;
  categoryId: string;
  categories: Category[];
  onSave: (p: Omit<Product, 'id'>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onAddCategory?: (name: string) => string | void;
}

export function ProductModal({ product, categoryId, categories, onSave, onDelete, onClose, onAddCategory }: ProductModalProps) {
  const [name, setName] = useState(product?.name || '');
  const [selCatId, setSelCatId] = useState(product?.categoryId || categoryId);
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [isAvailable, setIsAvailable] = useState<boolean>(product?.isAvailable !== false);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleQuickAddCategory = () => {
    if (newCatName.trim() && onAddCategory) {
      const createdId = onAddCategory(newCatName.trim());
      if (createdId) {
        setSelCatId(createdId);
      }
      setNewCatName('');
      setIsAddingCat(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      categoryId: selCatId,
      price: parseFloat(price) || 0,
      description,
      imageUrl,
      isAvailable
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex justify-between items-center p-6 sm:p-7 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {product ? 'Редактировать блюдо' : 'Новое блюдо'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Укажите название, цену и загрузите фото</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Photo Uploader / Camera Capture */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-3xl border border-stone-200">
            <ImagePicker value={imageUrl} onChange={setImageUrl} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wider">Название блюда</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 text-base sm:text-lg border border-stone-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-stone-50 focus:bg-white" placeholder="Например: Ролл Калифорния" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-stone-700 uppercase tracking-wider">Категория</label>
                {onAddCategory && !isAddingCat && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Новый раздел</span>
                  </button>
                )}
              </div>

              {isAddingCat ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Название нового раздела..."
                      className="w-full p-3 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-stone-50"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickAddCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      disabled={!newCatName.trim()}
                      className="px-3.5 bg-red-600 hover:bg-red-700 disabled:bg-stone-200 text-white rounded-xl text-xs font-bold transition-colors"
                      title="Создать категорию"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsAddingCat(false); setNewCatName(''); }}
                      className="px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold transition-colors"
                      title="Отмена"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">Нажмите галочку или Enter для создания</p>
                </div>
              ) : (
                <select value={selCatId} onChange={e => setSelCatId(e.target.value)} className="w-full p-4 text-base sm:text-lg border border-stone-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-stone-50 focus:bg-white appearance-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wider">Цена (₽)</label>
              <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-4 text-base sm:text-lg border border-stone-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-stone-50 focus:bg-white" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wider">Описание и состав</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 text-base sm:text-lg border border-stone-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-stone-50 focus:bg-white resize-none" placeholder="Состав блюда, вес, порция..." />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <p className="font-bold text-sm text-stone-900">Статус в меню (Стоп-лист)</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAvailable ? 'Блюдо доступно для заказа гостями' : 'Блюдо в стоп-листе (заказ заблокирован)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 self-start sm:self-center shadow-sm ${
                isAvailable 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-amber-500 text-stone-950 hover:bg-amber-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-200 animate-pulse' : 'bg-stone-900'}`}></span>
              <span>{isAvailable ? 'В наличии' : 'В стоп-листе'}</span>
            </button>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-stone-100">
            {product && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl font-bold text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                title="Удалить это блюдо из меню"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить блюдо</span>
              </button>
            ) : <div className="hidden sm:block" />}
            <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
              <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-2xl font-bold text-base text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Отмена</button>
              <button type="submit" className="px-8 py-3.5 rounded-2xl font-bold text-base bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-95">Сохранить</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CategoryModalProps {
  category?: Category | null;
  onSave: (name: string) => void;
  onClose: () => void;
}

export function CategoryModal({ category, onSave, onClose }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-8 border-b border-stone-100">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">{category ? 'Редактировать' : 'Новая категория'}</h2>
          <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wider">Название категории</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 text-lg border border-stone-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-stone-50 focus:bg-white" autoFocus placeholder="Например: Горячие роллы" />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Отмена</button>
            <button type="submit" className="px-6 py-4 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-95">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
