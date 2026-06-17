import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'info' | 'danger' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const variants = {
    default: 'bg-namsan-bg-alt text-namsan-text-muted',
    primary: 'bg-namsan-primary text-namsan-text',
    info: 'bg-namsan-blue text-white',
    warning: 'bg-namsan-red-light text-white',
    danger: 'bg-namsan-red text-white'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
