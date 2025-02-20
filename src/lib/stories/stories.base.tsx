import type { Meta } from '@storybook/react'
import { StepForm } from '../components/step-form'

export const meta = {
  title: 'StepForm',
  component: StepForm,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    debugMode: { control: 'boolean' },
    onComplete: { action: 'completed' },
    id: { control: 'text' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof StepForm>

export default meta
