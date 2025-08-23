import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-400',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:border-gray-400 disabled:text-gray-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}; 