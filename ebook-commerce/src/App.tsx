import React, { useReducer } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartContext, cartReducer } from './context/CartContext';
import type { Product } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

const App: React.FC = () => {
  const [cartState, cartDispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const addToCart = (product: Product) => {
    cartDispatch({ type: 'ADD_TO_CART', product });
  };

  const removeFromCart = (productId: number) => {
    cartDispatch({ type: 'REMOVE_FROM_CART', productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    cartDispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    cartDispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      state: cartState,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      <Router>
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartContext.Provider>
  );
};

export default App;