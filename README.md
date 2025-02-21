# react-step-form

A flexible and animated multi-step form component for React applications. Features include:

- 🎨 Customizable welcome and completion screens
- ✨ Smooth transitions between steps
- 📱 Mobile-friendly with touch/swipe support
- ⌨️ Keyboard navigation
- ✅ Form validation with Zod
- 💾 Progress auto-save
- 🎯 TypeScript support

## Installation

Install the package:

```bash
npm install @benjc/react-step-form
```

Install the peer dependencies:

```bash
npm install framer-motion
```

## Usage

### TypeScript Interfaces

```tsx
interface Step {
  component: ComponentType<StepProps<any>>
  id: string
  isOptional?: boolean
}

interface StepProps<T> {
  initialData?: T
  isActive: boolean
  onStepComplete: (result: { isComplete: boolean; stepData: T }) => void
  stepId: string
  submitButtonProps?: { className?: string }
  validate?: (validateFn: () => Promise<boolean>) => void
}
```

Basic usage example:

```tsx
import { StepForm } from '@benjc/react-step-form'

interface NameFormData {
  name: string
}

const NameStep = ({ onStepComplete, validate }) => {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit((data) => onStepComplete({ isComplete: true, stepData: data }))}>
      <input {...register('name')} />
      <button type="submit">Next</button>
    </form>
  )
}

const EmailStep = ({ onStepComplete }) => {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit((data) => onStepComplete({ isComplete: true, stepData: data }))}>
      <input {...register('email')} />
      <button type="submit">Next</button>
    </form>
  )
}

function App() {
  return (
    <StepForm
      steps={[
        { id: 'name', component: NameStep },
        { id: 'email', component: EmailStep },
      ]}
      onComplete={(data) => console.log('Form completed:', data)}
    />
  )
}
```

## Customization

### Welcome Screen

You can customize the welcome screen either with a component or configuration object:

```tsx
// Using a custom component
<StepForm
  welcomeCover={({ onStart }) => (
    <div>
      <h1>Welcome!</h1>
      <button onClick={onStart}>Start</button>
    </div>
  )}
  // ...
/>

// Using configuration object
<StepForm
  welcomeCover={{
    title: 'Welcome',
    description: 'Please complete this form',
    buttonText: 'Begin',
    estimatedTime: '5 minutes'
  }}
  // ...
/>
```

### Completion Screen

Similarly, customize the completion screen:

```tsx
<StepForm
  completeStep={{
    title: 'Thank You',
    description: 'Your response has been recorded',
    buttonText: 'Start Over',
  }}
  // ...
/>
```

### Styling

Customize the appearance using className props:

```tsx
<StepForm
  className="bg-white p-4"
  stepIndicatorProps={{
    activeStepClassName: 'bg-blue-500 text-white',
    completedStepClassName: 'bg-green-500 text-white',
    inactiveStepClassName: 'bg-gray-200',
  }}
  submitButtonProps={{
    className: 'bg-blue-500 text-white px-4 py-2 rounded',
  }}
  // ...
/>
```

### Form Validation

The StepForm supports two levels of validation:

> Note: All validation examples fully support TypeScript, providing type safety for your form data.

1. **Step-Level Validation** - Individual step validation using react-hook-form:

```tsx
const ValidatedStep = ({ onStepComplete, validate }) => {
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  // Register validation function
  React.useEffect(() => {
    if (validate) {
      validate(async () => {
        const isValid = await trigger()
        if (isValid) {
          return true
        }
        return false
      })
    }
  }, [validate, trigger])

  const onSubmit = handleSubmit((data) => {
    onStepComplete({ isComplete: true, stepData: data })
  })

  return (
    <form onSubmit={onSubmit}>
      <input {...register('email')} />
      <button type="submit">Next</button>
    </form>
  )
}
```

2. **Form-Level Validation** - Validate across all steps:

```tsx
const schemas = {
  personal: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
  address: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
  }),
}

const validateStep = (stepId: string, stepData: unknown) => {
  const schema = schemas[stepId]
  if (!schema) return true
  try {
    schema.parse(stepData)
    return true
  } catch (error) {
    return false
  }
}

<StepForm
  steps={steps}
  validateStep={validateStep}
  onComplete={handleComplete}
/>
```

Key validation behaviors:

- Steps validate on navigation attempts (next button, scroll, swipe)
- Steps are marked complete only on explicit submission
- Form data persists when navigating between steps
- Users can freely move between completed steps

## Form State Persistence

The form automatically saves progress to localStorage:

- Progress is saved after each step completion
- Form state is restored when returning to the form
- State is cleared after successful form completion
- Each form instance can be uniquely identified with an optional `id` prop

```tsx
<StepForm
  id="signup-form"  // Optional unique ID for storage
  steps={steps}
  onComplete={handleComplete}
/>
```

## Props

| Prop                 | Type                                  | Description                     |
| -------------------- | ------------------------------------- | ------------------------------- |
| `id`                 | `string`                              | Unique form identifier          |
| `steps`              | `Step[]`                              | Array of step configurations    |
| `onComplete`         | `(data: Record<string, any>) => void` | Callback when form completes    |
| `welcomeCover`       | `Component \| Object`                 | Welcome screen customization    |
| `completeStep`       | `Component \| Object`                 | Completion screen customization |
| `className`          | `string`                              | Container CSS class             |
| `stepIndicatorProps` | `Object`                              | Step indicator styling          |
| `submitButtonProps`  | `Object`                              | Submit button styling           |
| `debugMode`          | `boolean`                             | Enable debug features           |
| `validateStep`       | `(stepId: string, stepData: unknown) => boolean \| Promise<boolean>` | Form-level validation function |

## License

MIT
