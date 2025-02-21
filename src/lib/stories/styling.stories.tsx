import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StepForm, StepFormProps } from '../components/step-form'
import { NameStep } from './components/name-step'
import { EmailStep } from './components/email-step'
import { WelcomeStep } from './components/welcome-step'
import { TypeformNameStep } from './components/typeform-demo/typeform-name-step'
import { TypeformEmailStep } from './components/typeform-demo/typeform-email-step'
import { useState } from 'react'

const meta = {
  title: 'StepForm/Styling',
  component: StepForm,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StepForm>

export default meta
type Story = StoryObj<typeof meta>

const Template: Story = {
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

export const CustomStyles = {
  ...Template,
  args: {
    ...Template.args,
    className:
      'bg-gradient-to-r from-purple-50 to-pink-50 outline outline-2 outline-purple-200 p-6 rounded-xl shadow-lg',
    stepIndicatorProps: {
      activeStepClassName: 'bg-purple-600 text-white border-purple-600',
      completedStepClassName: 'bg-pink-100 text-purple-600 border-purple-600',
      inactiveStepClassName: 'bg-white text-gray-400 border-gray-200',
      connectionLineClassName: 'bg-purple-200',
      stepNumberClassName:
        'w-6 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-colors duration-200',
    },
    submitButtonProps: {
      className:
        'w-32 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2',
    },
  },
}

function TypeformTemplate(args: StepFormProps) {
  const [data, setData] = useState<Record<string, any>>({})
  console.log(data)

  return (
    <div className="h-screen bg-gradient-to-br from-[#fff3e9] to-[#ffd7d1]">
      <StepForm {...args} validateStep={(stepId, stepData) => {
        setData(stepData as any)
        return true
      }} />
    </div>
  )
}

export const Typeform: Story = {
  args: {
    welcomeCover: WelcomeStep,
    steps: [
      {
        id: 'step1',
        component: TypeformNameStep,
      },
      {
        id: 'step2',
        component: TypeformEmailStep,
      },
    ],
    onComplete: (data) => console.log('Form completed:', data),
    className: 'h-full',
    hideEnterHint: true,
    stepIndicatorProps: {
      stepNumberClassName: 'hidden',
      connectionLineClassName: 'hidden',
      activeStepClassName: 'hidden',
      completedStepClassName: 'hidden',
      inactiveStepClassName: 'hidden',
      footerNavButtonClassName: 'w-10 h-10 flex items-center justify-center bg-rose-400/10',
      footerNavButtonActiveClassName: 'text-rose-400 hover:bg-rose-400/20',
      footerNavButtonInactiveClassName: 'text-rose-400/40 cursor-not-allowed',
    },
    submitButtonProps: {
      className:
        'bg-rose-400 text-white px-6 py-2 rounded-full disabled:opacity-50',
    }
  },
  render: (args) => (
    <div className="h-screen bg-gradient-to-br from-[#fff3e9] to-[#ffd7d1]">
      <TypeformTemplate {...args} />
    </div>
  ),
}
