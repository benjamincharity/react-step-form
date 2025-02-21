import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PressEnterHint } from '../../../components/press-enter-hint'
import type { StepProps } from '../../../components/step-form'
import { TypeformInput } from './typeform-input'

export const TypeformEmailStep = ({ onStepComplete, isActive }: StepProps<NameStepData>) => {
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
    <form
      onSubmit={handleSubmit((data) => onStepComplete({ isComplete: true, stepData: data }))}
      className="flex flex-col h-full"
    >
      <h1 className="text-4xl mb-12 flex items-center gap-2 justify-center">
        <span className="text-rose-400 text-base font-normal">1 →</span>
        <span className="font-bold">Thanks, ____. And your email?</span>
      </h1>
      <div className="flex flex-col gap-8 mb-4">
        <TypeformInput
          label="Email"
          {...register('email')}
          placeholder="name@example.com"
          error={errors.email?.message}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex items-center gap-2">
          <button className="bg-rose-400 shadow-md text-white px-6 py-2 rounded-full disabled:opacity-50" type="submit">
            OK
          </button>
          <PressEnterHint />
        </div>
      </div>
    </form>
  )
}
