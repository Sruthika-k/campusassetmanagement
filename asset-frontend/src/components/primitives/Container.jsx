import React from 'react'

export const Container = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`max-w-6xl mx-auto px-6 md:px-8 lg:px-12 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
