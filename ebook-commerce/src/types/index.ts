export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
  rating: number;
  pages: number;
  format: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
} 