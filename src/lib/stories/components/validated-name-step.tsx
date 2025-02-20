import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { StepSubmitButton } from '../../components/step-submit-button'

interface ValidatedNameStepProps {
  onStepComplete: (result: { isComplete: boolean; stepData: any }) => void
}

export const ValidatedNameStep = ({ onStepComplete }: ValidatedNameStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
      }),
    ),
  })

  return (
    <form onSubmit={handleSubmit((data) => onStepComplete({ isComplete: true, stepData: data }))} className="p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input {...register('name')} className="w-full p-2 border rounded" />
        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
      </div>
      <StepSubmitButton />
    </form>
  )
}
