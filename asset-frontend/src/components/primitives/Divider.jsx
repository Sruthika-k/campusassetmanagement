import React from 'react'

export const Divider = ({ thickness = 'thick', className = '', ...props }) => {
  const thicknessClasses = {
    hairline: 'border-hairline',
    thin: 'border-thin',
    medium: 'border-medium',
    thick: 'border-thick',
    ultra: 'border-ultra'
  }

  return (
    <hr 
      className={`border-t border-foreground ${thicknessClasses[thickness]} ${className}`}
      {...props}
    />
  )
}
