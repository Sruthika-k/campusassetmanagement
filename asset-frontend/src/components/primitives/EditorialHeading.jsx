import React from 'react'

export const EditorialHeading = ({ 
  level = 1, 
  size = '4xl', 
  children, 
  className = '', 
  ...props 
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
    '9xl': 'text-9xl'
  }

  const trackingClasses = {
    xs: 'tracking-widest',
    sm: 'tracking-widest',
    base: 'tracking-normal',
    lg: 'tracking-normal',
    xl: 'tracking-normal',
    '2xl': 'tracking-tight',
    '3xl': 'tracking-tight',
    '4xl': 'tracking-tight',
    '5xl': 'tracking-tighter',
    '6xl': 'tracking-tighter',
    '7xl': 'tracking-tighter',
    '8xl': 'tracking-tighter',
    '9xl': 'tracking-tighter'
  }

  const HeadingTag = `h${level}`

  return (
    <HeadingTag 
      className={`font-display ${sizeClasses[size]} ${trackingClasses[size]} leading-none ${className}`}
      {...props}
    >
      {children}
    </HeadingTag>
  )
}
