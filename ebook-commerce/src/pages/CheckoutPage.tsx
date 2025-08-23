import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useCheckoutSelectors, type CustomerInfo } from '../store/checkoutStore';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/input';
import { StripePayment } from '../components/StripePayments';
import { Button } from '../components/ui/Button';

export const CheckoutPage: React.FC = () => {
  const { state, clearCart } = useCart();
  const navigate = useNavigate();
  
  const {
    customerInfo,
    clientSecret,
    isLoading,
    error,
    paymentStatus,
    isCustomerInfoValid,
    isReadyForPayment,
    actions
  } = useCheckoutSelectors();

  const [localError, setLocalError] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);

  const total = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Memoize the reset function to prevent unnecessary re-renders
  const resetCheckout = useCallback(() => {
    if (!hasInitialized) {
      actions.resetCheckout();
      setHasInitialized(true);
    }
  }, [actions, hasInitialized]);

  // Initialize checkout state only once
  useEffect(() => {
    resetCheckout();
  }, [resetCheckout]);

  // Handle payment status changes
  useEffect(() => {
    if (paymentStatus === 'completed') {
      // Show success message and redirect
      const timeoutId = setTimeout(() => {
        clearCart();
        navigate('/order-success');
      }, 2000);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [paymentStatus, clearCart, navigate]);

  // Memoize input change handler to prevent unnecessary re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    actions.setCustomerInfo({ [name]: value } as Partial<CustomerInfo>);
    
    // Clear errors when user starts typing
    if (error) {
      actions.setError(null);
    }
    if (localError) {
      setLocalError('');
    }
  }, [actions, error, localError]);

  const validateForm = useCallback((): boolean => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }

    // Check if all required fields are filled
    if (!isCustomerInfoValid()) {
      setLocalError('Please fill in all required fields');
      return false;
    }

    return true;
  }, [customerInfo.email, isCustomerInfoValid]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Convert cart items to order items format
      const orderItems = state.items.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        filePath: item.product.filePath || `/files/${item.product.id}.pdf`,
        fileName: item.product.fileName || `${item.product.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      }));

      // Create payment intent
      const paymentData = await actions.createPaymentIntent(orderItems, total);
      
      // Here you would integrate with Stripe Elements
      // For now, let's simulate payment processing
      console.log('Payment Intent Created:', paymentData);
      
      // In a real implementation, you would use Stripe Elements here
      // and then call confirmPayment after successful payment
      
    } catch (err) {
      console.error('Payment creation failed:', err);
      // Error is already set in the store
    }
  }, [validateForm, state.items, actions, total]);

  // Handle successful Stripe payment
  const handlePaymentSuccess = useCallback(async (paymentIntentId: string) => {
    try {
      setLocalError('');
      await actions.confirmPayment(paymentIntentId);
      
      // Success! The useEffect will handle redirect
    } catch (err) {
      console.error('Payment confirmation failed:', err);
      setLocalError('Payment succeeded but confirmation failed. Please contact support.');
    }
  }, [actions]);

  // Handle payment errors
  const handlePaymentError = useCallback((error: string) => {
    setLocalError(error);
    actions.setPaymentStatus('failed');
  }, [actions]);

  // Early return if no items - prevents unnecessary renders
  if (state.items.length === 0) {
    return (
      <div className="py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">No Items to Checkout</h1>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          {/* Error Display */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                {error || localError}
              </p>
            </div>
          )}

          {/* Success Display */}
          {paymentStatus === 'completed' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                Payment successful! Check your email for download links. Redirecting...
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-bold mb-6">Billing Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="firstName"
                      value={customerInfo.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="lastName"
                      value={customerInfo.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="country"
                    value={customerInfo.country}
                    onChange={handleInputChange}
                    required
                    placeholder="United States"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      required
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="zipCode"
                      value={customerInfo.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="10001"
                    />
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading || paymentStatus === 'processing'}
                  >
                    {isLoading || paymentStatus === 'processing' ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      `Create Payment - $${total.toFixed(2)}`
                    )}
                  </Button>

                  {/* Stripe Payment Component */}
                  {isReadyForPayment() && clientSecret && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <StripePayment
                        clientSecret={clientSecret}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        amount={total}
                        loading={isLoading || paymentStatus === 'processing'}
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <Card className="p-6">
                <div className="space-y-4">
                  {state.items.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-purple-600">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {paymentStatus !== 'idle' && (
                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600">
                        Status: <span className="capitalize font-medium">{paymentStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Order Instructions */}
              <Card className="p-4 mt-4 bg-blue-50">
                <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Payment will be processed securely</li>
                  <li>• Download links will be sent to your email</li>
                  <li>• Links expire in 24 hours (5 downloads max)</li>
                  <li>• Files are delivered as PDF format</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};