import { useState } from 'react';
import type { Product } from '../types';
import { PRODUCTS } from '../data/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(false);

  const getProduct = (id: number) => {
    return products.find(p => p.id === id);
  };

  const searchProducts = (query: string) => {
    return products.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const filterByTag = (tag: string) => {
    return products.filter(p => p.tags.includes(tag));
  };

  return { products, loading, getProduct, searchProducts, filterByTag };
}; 