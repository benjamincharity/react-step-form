import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { StepSubmitButton } from '../../components/step-submit-button'

interface ValidatedEmailStepProps {
  onStepComplete: (result: { isComplete: boolean; stepData: any }) => void
}

export const ValidatedEmailStep = ({ onStepComplete }: ValidatedEmailStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email(),
      }),
    ),
  })

  return (
    <form onSubmit={handleSubmit((data) => onStepComplete({ isComplete: true, stepData: data }))} className="p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input {...register('email')} className="w-full p-2 border rounded" />
        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
      </div>
      <StepSubmitButton />
    </form>
  )
}
