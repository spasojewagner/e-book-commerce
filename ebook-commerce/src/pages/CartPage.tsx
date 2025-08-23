import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const CartPage: React.FC = () => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const total = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (state.items.length === 0) {
    return (
      <div className="py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Add some forbidden knowledge to your collection!
            </p>
            <Link to="/products">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="space-y-6">
            {state.items.map(item => (
              <Card key={item.product.id} className="p-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.product.image} 
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.title}</h3>
                    <p className="text-gray-600">${item.product.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-purple-600">${total.toFixed(2)}</span>
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1"
              >
                Clear Cart
              </Button>
              <Button
                onClick={() => navigate('/checkout')}
                className="flex-1"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}; 