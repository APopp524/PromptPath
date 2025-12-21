import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'green' | 'gray' | 'blue' | 'red';
  className?: string;
}

const Pill: React.FC<PillProps> = ({ children, variant = 'gray', className = '' }) => {
  const variantStyles = {
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Pill;
