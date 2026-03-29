import React from 'react'

export const Card = ({ 
  variant = 'surface', 
  elevation = 'rest',
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'material-card'
  
  const variantClasses = {
    surface: 'bg-surface text-on-surface',
    primary: 'bg-primary-container text-on-primary',
    secondary: 'bg-secondary-container text-on-secondary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
    outlined: 'bg-transparent border-2 border-outline',
    glass: 'glass-morphism border border-white/10',
    elevated: 'shadow-md hover:shadow-lg hover:scale-[1.02]',
    featured: 'shadow-lg hover:shadow-xl hover:scale-[1.02] md:-translate-y-4'
  }

  const elevationClasses = {
    rest: 'shadow-sm',
    hover: 'shadow-md',
    lifted: 'shadow-lg'
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${elevationClasses[elevation]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
