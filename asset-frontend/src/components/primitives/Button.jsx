import React from 'react'

export const Button = ({ 
  variant = 'primary', 
  size = 'default',
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'material-button focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
  
  const sizeClasses = {
    small: 'h-9 text-label-small px-6',
    default: 'h-10 text-label-medium px-8',
    large: 'h-12 text-label-large px-10'
  }
  
  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary active:scale-95 active:bg-primary/80',
    secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary active:scale-95 active:bg-secondary-container/80',
    tonal: 'bg-surface text-on-surface hover:bg-surface-container hover:text-on-surface active:scale-95 active:bg-surface-container/80',
    outlined: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10 hover:text-primary active:scale-95',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 hover:text-primary active:scale-95',
    fab: 'bg-tertiary text-on-tertiary hover:bg-tertiary-container hover:text-on-tertiary rounded-2xl w-14 h-14 shadow-md hover:shadow-xl hover:scale-105 active:scale-95'
  }

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
