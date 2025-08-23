import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProduct';
import type { Product } from '../types';
import { Container } from '../components/ui/Container';
import { Input } from '../components/ui/input';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage: React.FC = () => {
  const { products, searchProducts, filterByTag } = useProducts();
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = Array.from(new Set(products.flatMap(p => p.tags)));

  useEffect(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = searchProducts(searchQuery);
    }
    
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }
    
    setDisplayProducts(filtered);
  }, [searchQuery, selectedTag, products, searchProducts]);

  return (
    <div className="py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <p className="text-gray-600">
            Explore our complete collection of forbidden knowledge and hidden truths.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {displayProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found matching your criteria.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}; 