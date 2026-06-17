import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'blue';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  className = '', 
  ...props 
}) => {
  const baseStyles = 'rounded-xl shadow-sm border p-6 transition-all duration-200';
  
  const variants = {
    default: 'bg-namsan-bg border-namsan-bg-alt hover:shadow-md',
    highlight: 'bg-namsan-secondary border-namsan-primary/20',
    blue: 'bg-namsan-blue/5 border-namsan-blue/20'
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-xl text-namsan-text ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);
