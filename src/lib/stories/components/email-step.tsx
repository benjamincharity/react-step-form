import React from 'react'
import { useForm } from 'react-hook-form'
import { StepSubmitButton } from '../../components/step-submit-button'

interface EmailStepProps {
  onStepComplete: (result: { isComplete: boolean; stepData: any }) => void
}

export const EmailStep = ({ onStepComplete }: EmailStepProps) => {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit((data) => onStepComplete({ isComplete: true, stepData: data }))} className="p-4">
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input {...register('email')} className="w-full p-2 border rounded" />
      </div>
      <StepSubmitButton />
    </form>
  )
}
