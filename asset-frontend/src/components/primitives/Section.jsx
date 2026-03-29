import React from 'react'

export const Section = ({ children, className = '', ...props }) => {
  return (
    <section 
      className={`py-24 md:py-32 lg:py-40 ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
