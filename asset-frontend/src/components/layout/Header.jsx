import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../primitives'

export const Header = () => {
  return (
    <header className="bg-surface border-b-2 border-outline shadow-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-on-primary font-display text-xl font-bold">AM</span>
            </div>
            <h1 className="text-headline-large font-display tracking-tight">
              Asset System
            </h1>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-label-medium tracking-wide text-on-surface hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full transition-all duration-300 px-4 py-2"
            >
              Archive
            </Link>
            <Link 
              to="/assets/create" 
              className="text-label-medium tracking-wide text-on-surface hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full transition-all duration-300 px-4 py-2"
            >
              Create Asset
            </Link>
            <Button variant="primary" size="small">
              New Asset
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
