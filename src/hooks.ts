import { useState, useEffect } from 'react';
import { Category, Product, CartItem } from './types';
import { defaultCategories, defaultProducts } from './data';

const MENU_DATA_VERSION = 'san_takki_lubino_official_v6';

export function useMenuData() {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const version = localStorage.getItem('san_takki_menu_version');
      const savedCats = localStorage.getItem('san_takki_categories');
      const savedProds = localStorage.getItem('san_takki_products');
      
      const parsedCats = savedCats ? JSON.parse(savedCats) : [];
      const parsedProds = savedProds ? JSON.parse(savedProds) : [];

      // If version differs or menu is incomplete (less than 20 dishes), load complete catalog from VK
      if (version !== MENU_DATA_VERSION || parsedCats.length < 5 || parsedProds.length < 20) {
        localStorage.setItem('san_takki_menu_version', MENU_DATA_VERSION);
        localStorage.setItem('san_takki_categories', JSON.stringify(defaultCategories));
        localStorage.setItem('san_takki_products', JSON.stringify(defaultProducts));
        return defaultCategories;
      }
      return parsedCats;
    } catch {
      return defaultCategories;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const version = localStorage.getItem('san_takki_menu_version');
      const savedProds = localStorage.getItem('san_takki_products');
      const parsedProds = savedProds ? JSON.parse(savedProds) : [];

      if (version !== MENU_DATA_VERSION || parsedProds.length < 20) {
        return defaultProducts;
      }
      return parsedProds;
    } catch {
      return defaultProducts;
    }
  });

  useEffect(() => {
    localStorage.setItem('san_takki_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('san_takki_products', JSON.stringify(products));
  }, [products]);

  const resetToDefault = () => {
    localStorage.setItem('san_takki_menu_version', MENU_DATA_VERSION);
    setCategories(defaultCategories);
    setProducts(defaultProducts);
    localStorage.setItem('san_takki_categories', JSON.stringify(defaultCategories));
    localStorage.setItem('san_takki_products', JSON.stringify(defaultProducts));
  };

  const addCategory = (name: string): string => {
    const id = Date.now().toString();
    const newCategory: Category = {
      id,
      name,
      sortOrder: categories.length,
    };
    setCategories(prev => [...prev, newCategory]);
    return id;
  };

  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCategories(updated.map((c, i) => ({ ...c, sortOrder: i })));
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setProducts(products.filter(p => p.categoryId !== id)); // Cascade delete
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts([...products, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const toggleProductAvailability = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const isAvail = p.isAvailable !== false;
        return { ...p, isAvailable: !isAvail };
      }
      return p;
    }));
  };

  const setAllProductsAvailability = (available: boolean) => {
    setProducts(prev => prev.map(p => ({ ...p, isAvailable: available })));
  };

  const importMenuData = (data: { categories: Category[]; products: Product[] }) => {
    if (Array.isArray(data.categories) && Array.isArray(data.products)) {
      setCategories(data.categories);
      setProducts(data.products);
      localStorage.setItem('san_takki_categories', JSON.stringify(data.categories));
      localStorage.setItem('san_takki_products', JSON.stringify(data.products));
      return true;
    }
    return false;
  };

  return {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    setAllProductsAvailability,
    importMenuData,
    resetToDefault
  };
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    // Guard against adding stop-listed products
    if (product.isAvailable === false) {
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartItemId: Date.now().toString(), quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { cart, addToCart, updateQuantity, clearCart, total };
}
