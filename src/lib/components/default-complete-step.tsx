interface DefaultCompleteStepProps {
  onRestart: () => void
  title?: string
  description?: string
  buttonText?: string
}

export function DefaultCompleteStep({
  onRestart,
  title = 'Successfully Completed!',
  description = 'Thank you for completing all the steps.',
  buttonText = 'Start Again',
}: DefaultCompleteStepProps) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600 mb-8">{description}</p>
      <button
        onClick={onRestart}
        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  )
}
