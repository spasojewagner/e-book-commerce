import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Eye } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Container } from './ui/Container';

export const Header: React.FC = () => {
  const { state } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Eye className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold">Forbidden Knowledge</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-purple-400 transition-colors">Products</Link>
            <Link to="/about" className="hover:text-purple-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-purple-400 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative hover:text-purple-400 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
              <Link to="/products" className="hover:text-purple-400 transition-colors">Products</Link>
              <Link to="/about" className="hover:text-purple-400 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-purple-400 transition-colors">Contact</Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}; 