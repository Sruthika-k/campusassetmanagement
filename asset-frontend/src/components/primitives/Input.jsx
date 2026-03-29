import React from 'react'

export const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-label-small font-medium tracking-wide text-on-surface uppercase">
          {label}
        </label>
      )}
      <input
        className={`material-input ${error ? 'border-red-600' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-label-small text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}

export const Textarea = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-label-small font-medium tracking-wide text-on-surface uppercase">
          {label}
        </label>
      )}
      <textarea
        className={`material-input resize-y min-h-[120px] ${error ? 'border-red-600' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-label-small text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}
