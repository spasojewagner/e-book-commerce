import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from './ui/Button';

// Initialize Stripe - you'll need to add your publishable key to environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RsMKxIdfUVjEq60VBEngw9jdShKvG8i2ChlYVuZI9NzKEOPqdEtAoWf5webMR0RaWVdLsSIqh0x42DVr9t9cgLp005ELR4wQO');

interface PaymentFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  amount: number;
  loading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  amount,
  loading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Confirm the payment with the card element
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onPaymentError(stripeError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful!
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError('Payment was not completed successfully');
        onPaymentError('Payment was not completed successfully');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      onPaymentError(err.message || 'An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        <div className="bg-white p-4 border border-gray-300 rounded-md">
          <CardElement 
            options={cardElementOptions}
            onChange={(e) => {
              if (e.error) {
                setError(e.error.message);
              } else {
                setError('');
              }
            }}
          />
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>💳 <strong>Test Card Numbers:</strong></p>
          <p>• Success: 4242 4242 4242 4242</p>
          <p>• Declined: 4000 0000 0000 0002</p>
          <p>• Use any future date for expiry and any 3-digit CVC</p>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || processing || loading}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

interface StripePaymentProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  amount: number;
  loading?: boolean;
}

export const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}; 