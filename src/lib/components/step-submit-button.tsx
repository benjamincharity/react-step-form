import { PressEnterHint } from './press-enter-hint'

interface StepSubmitButtonProps {
  className?: string
  hidePressEnterHint?: boolean
}

export function StepSubmitButton({ className = '', hidePressEnterHint = false }: StepSubmitButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <button type="submit" className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-700 ${className}`}>
        OK
      </button>
      {!hidePressEnterHint && <PressEnterHint />}
    </div>
  )
}
