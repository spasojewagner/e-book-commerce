import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

export const AboutPage: React.FC = () => (
  <div className="py-16">
    <Container>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Forbidden Knowledge</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 text-center">
            We are dedicated to preserving and sharing the knowledge that has been hidden from humanity for centuries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700">
                To make forbidden knowledge accessible to those who seek truth and understanding. We believe that knowledge should not be restricted or hidden from those who genuinely seek to learn and grow.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-700">
                A world where hidden truths are revealed, where ancient wisdom is preserved, and where seekers of knowledge can access the information they need to understand our reality.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <ChevronRight className="h-5 w-5 text-purple-600 mt-0.5" />
                <span>Carefully researched and documented forbidden knowledge</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="h-5 w-5 text-purple-600 mt-0.5" />
                <span>Ancient wisdom and esoteric teachings</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="h-5 w-5 text-purple-600 mt-0.5" />
                <span>Hidden histories and suppressed information</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="h-5 w-5 text-purple-600 mt-0.5" />
                <span>Conspiracy research and alternative perspectives</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-gray-700 mb-8">
              Connect with other truth-seekers and share your journey of discovery. Together, we can uncover the mysteries that have been hidden from us.
            </p>
            <Link to="/contact">
              <Button size="lg">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  </div>
); 