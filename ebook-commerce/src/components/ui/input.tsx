import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  name?: string;
}

export const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  required = false,
  name
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    name={name}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
  />
); 