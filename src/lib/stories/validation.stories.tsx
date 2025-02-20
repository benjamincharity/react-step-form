import React, { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StepForm } from '../components/step-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { StepSubmitButton } from '../components/step-submit-button'

const meta = {
  title: 'StepForm/Step Validation',
  component: StepForm,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StepForm>

export default meta
type Story = StoryObj<typeof meta>

// Define types for the form data
type PersonalFormData = {
  name: string
  email: string
}

type AddressFormData = {
  address: string
  city: string
}

// Validation schemas - now used only in the story, not in the component
const schemas = {
  personal: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
  }),
  address: z.object({
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
  }),
}

// Custom validation function for the StepForm
const validateStep = (stepId: string, stepData: unknown) => {
  const schema = schemas[stepId as keyof typeof schemas]
  if (!schema) return true

  try {
    schema.parse(stepData)
    return true
  } catch (error) {
    return false
  }
}

interface StepComponentProps {
  onStepComplete: Function
  stepId: string
  initialData?: PersonalFormData
  validate?: (validateFn: () => Promise<boolean>) => void
}

const PersonalInfoStep = ({ onStepComplete, stepId, initialData, validate }: StepComponentProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    getValues,
  } = useForm<PersonalFormData>({
    resolver: zodResolver(schemas.personal),
    mode: 'onChange',
    defaultValues: initialData,
  })

  // Register validation function with parent
  React.useEffect(() => {
    if (validate) {
      validate(async () => {
        const isValid = await trigger()
        if (isValid) {
          const data = getValues()
          return true
        }
        return false
      })
    }
  }, [validate, trigger, getValues])

  const onSubmit = handleSubmit((data) => {
    // Mark step as complete and provide data
    onStepComplete({ isComplete: true, stepData: data })
  })

  const handleFieldChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof PersonalFormData
    register(field).onChange(e)
    await trigger(field)

    // Update data without marking as complete
    onStepComplete({
      isComplete: false,
      stepData: getValues(),
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault() // Prevent double submission
        onSubmit(e)
      }}
      className="p-4"
    >
      <div className="space-y-4 mb-2">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input {...register('name')} className="w-full p-2 border rounded" onChange={handleFieldChange} />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full p-2 border rounded"
            onChange={handleFieldChange}
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>
      </div>
      <StepSubmitButton />
    </form>
  )
}

interface AddressStepProps {
  onStepComplete: Function
  stepId: string
  initialData?: AddressFormData
  validate?: (validateFn: () => Promise<boolean>) => void
}

const AddressStep = ({ onStepComplete, stepId, initialData, validate }: AddressStepProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<AddressFormData>({
    resolver: zodResolver(schemas.address),
    mode: 'onChange',
    defaultValues: initialData,
  })

  // Register validation function with parent
  React.useEffect(() => {
    if (validate) {
      validate(async () => {
        const isValid = await trigger()
        if (isValid) {
          const data = getValues()
          onStepComplete({ isComplete: true, stepData: data })
          return true
        }
        // Trigger validation to show errors
        await trigger()
        return false
      })
    }
  }, [validate, trigger, getValues, onStepComplete])

  // If we have initial data and it's valid, mark as complete
  React.useEffect(() => {
    if (initialData) {
      try {
        schemas.address.parse(initialData)
        onStepComplete({ isComplete: true, stepData: initialData })
      } catch (e) {
        // Initial data is invalid, don't mark as complete
      }
    }
  }, [initialData, onStepComplete])

  const onSubmit = handleSubmit((data) => {
    onStepComplete({ isComplete: true, stepData: data })
  })

  const handleFieldChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as keyof AddressFormData
    register(field).onChange(e)
    await trigger(field)

    const values = getValues()
    onStepComplete({
      isComplete: false,
      stepData: values,
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="p-4">
      <div className="space-y-4 mb-2">
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input {...register('address')} className="w-full p-2 border rounded" onChange={handleFieldChange} />
          {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input {...register('city')} className="w-full p-2 border rounded" onChange={handleFieldChange} />
          {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
        </div>
      </div>
      <StepSubmitButton />
    </form>
  )
}

const Template: Story = {
  args: {
    steps: [
      {
        id: 'personal',
        component: PersonalInfoStep,
      },
      {
        id: 'address',
        component: AddressStep,
      },
    ],
    validateStep,
    onComplete: (data) => console.log('Form completed:', data),
  },
  render: (args) => (
    <div className="h-[95vh] bg-white p-4">
      <StepForm {...args} />
    </div>
  ),
}

export const WithValidation = {
  ...Template,
}
