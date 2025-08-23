import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Star } from 'lucide-react';
import { useProducts } from '../hooks/useProduct';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 via-black to-purple-900 text-white py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Unlock the <span className="text-purple-400">Forbidden</span> Knowledge
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover ancient secrets, hidden truths, and forbidden wisdom that has been concealed from the masses for centuries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg">Explore Collection</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">Learn More</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Books</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Carefully selected titles that reveal the most profound secrets and hidden knowledge.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
              <p className="text-gray-600">
                Access to rare and forbidden knowledge that you won't find anywhere else.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Download className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
              <p className="text-gray-600">
                Get immediate access to your purchases. No waiting, no shipping delays.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                High-quality PDFs with detailed research and comprehensive information.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}; 