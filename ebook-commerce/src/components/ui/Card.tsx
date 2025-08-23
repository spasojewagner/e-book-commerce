import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''} ${className}`}>
    {children}
  </div>
); 