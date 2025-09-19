import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  padding = 'md',
  style
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${paddingClasses[padding]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};