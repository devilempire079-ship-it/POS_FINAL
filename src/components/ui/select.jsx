import React from "react"
import { cn } from "./utils"

const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          value,
          onValueChange,
          isOpen,
          setIsOpen
        })
      )}
    </div>
  )
}

const SelectTrigger = ({ className, children, isOpen, setIsOpen, ...props }) => (
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <svg
      className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
)

const SelectValue = ({ placeholder }) => (
  <span className="text-muted-foreground">{placeholder}</span>
)

const SelectContent = ({ className, children, isOpen, setIsOpen }) => {
  if (!isOpen) return null

  return (
    <div className={cn(
      "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg",
      className
    )}>
      <div className="py-1">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { setIsOpen })
        )}
      </div>
    </div>
  )
}

const SelectItem = ({ children, value, onValueChange, setIsOpen }) => (
  <button
    type="button"
    onClick={() => {
      onValueChange(value)
      setIsOpen(false)
    }}
    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
  >
    {children}
  </button>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
