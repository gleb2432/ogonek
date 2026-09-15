export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable?: boolean; // false = in stop-list (out of stock)
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
}
