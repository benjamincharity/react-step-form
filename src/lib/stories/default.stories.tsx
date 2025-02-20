import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StepForm } from '../components/step-form'
import { NameStep } from './components/name-step'
import { EmailStep } from './components/email-step'

const meta = {
  title: 'StepForm/Default',
  component: StepForm,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StepForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    steps: [
      {
        id: 'step1',
        component: NameStep,
      },
      {
        id: 'step2',
        component: EmailStep,
      },
    ],
    onComplete: (data) => console.log('Form completed:', data),
  },
  render: (args) => (
    <div className="h-[95vh] bg-white p-4">
      <StepForm {...args} />
    </div>
  ),
}
