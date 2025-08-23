import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useProducts } from '../hooks/useProduct';
import { useCart } from '../hooks/useCart';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const product = getProduct(Number(id));

  if (!product) {
    return (
      <div className="py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{product.pages} pages</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{product.format}</span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-purple-600">${product.price}</span>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span 
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => addToCart(product)}
                size="lg"
                className="w-full"
              >
                Add to Cart - ${product.price}
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  addToCart(product);
                  navigate('/checkout');
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}; 