import React from 'react';

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
  required?: boolean;
  name?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  rows = 4, 
  className = '', 
  required = false,
  name
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    required={required}
    name={name}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical ${className}`}
  />
); 