import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Mail, Phone } from 'lucide-react';
import { Container } from './ui/Container';

export const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white mt-16">
    <Container>
      <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-6 w-6 text-purple-400" />
            <span className="text-lg font-bold">Forbidden Knowledge</span>
          </div>
          <p className="text-gray-400">
            Unlock the secrets of the universe with our carefully curated collection of forbidden knowledge.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Contact Info</h3>
          <div className="space-y-2 text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>info@forbiddenknowledge.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-gray-400">
        <p>&copy; 2025 Forbidden Knowledge. All rights reserved.</p>
      </div>
    </Container>
  </footer>
); 