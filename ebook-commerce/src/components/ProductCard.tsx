import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <Card hover className="h-full flex flex-col">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {product.format}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-600 font-medium">{product.category}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-purple-600">${product.price}</span>
          <span className="text-sm text-gray-500">{product.pages} pages</span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => addToCart(product)}
            className="flex-1"
          >
            Add to Cart
          </Button>
          <Link to={`/products/${product.id}`}>
            <Button variant="outline" size="md">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}; 