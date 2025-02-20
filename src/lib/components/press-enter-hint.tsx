interface PressEnterHintProps {
  className?: string
}

export function PressEnterHint({ className = '' }: PressEnterHintProps) {
  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      press <span className="font-bold">Enter ↵</span>
    </span>
  )
}
