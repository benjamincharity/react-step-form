import React from 'react'

interface TypeformInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const TypeformInput = React.forwardRef<HTMLInputElement, TypeformInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-lg">{label}</label>
        <input
          ref={ref}
          className="bg-transparent border-b-2 border-rose-200 focus:border-rose-400 outline-none py-2 text-xl placeholder-rose-200"
          {...props}
        />
        {error && <span className="text-rose-400 text-sm">{error}</span>}
      </div>
    )
  }
)

TypeformInput.displayName = 'TypeformInput'
