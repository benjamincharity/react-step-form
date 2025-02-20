import { PressEnterHint } from './press-enter-hint'

interface DefaultWelcomeCoverProps {
  onStart: () => void
  title?: string
  description?: string
  buttonText?: string
  estimatedTime?: string
}

export function DefaultWelcomeCover({
  onStart,
  title = 'Share your thoughts',
  description = 'We appreciate your feedback to help us improve!',
  buttonText = 'Give feedback',
  estimatedTime = '7+ minutes',
}: DefaultWelcomeCoverProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <p className="text-gray-600 text-center max-w-md mb-8">{description}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={onStart}
          className="mt-6 px-8 py-4 bg-blue-50 rounded-lg text-blue-600 text-xl font-medium hover:bg-blue-100 transition-colors"
        >
          {buttonText}
        </button>
        <PressEnterHint className="mt-6" />
      </div>

      <div className="mt-4 text-gray-500 flex items-center gap-2">
        <span className="inline-block w-5 h-5">⏱️</span>
        Takes {estimatedTime}
      </div>
    </div>
  )
}
