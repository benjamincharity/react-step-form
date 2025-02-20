import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StepForm } from '../components/step-form'
import { NameStep } from './components/name-step'
import { EmailStep } from './components/email-step'

// Define the meta object properly
const meta: Meta<typeof StepForm> = {
  title: 'StepForm/Custom Welcome & Complete Steps',
  component: StepForm,
  parameters: {
    layout: 'fullscreen',
  },
}

type Story = StoryObj<typeof meta>

interface CustomWelcomeProps {
  onStart: () => void
}

interface CustomCompletionProps {
  onRestart: () => void
  finalData: Record<string, any>
}

const CustomWelcomeComponent = ({ onStart }: CustomWelcomeProps) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-3xl font-bold mb-4">Welcome to Our Survey</h1>
    <p className="text-gray-600 mb-8">We value your feedback!</p>
    <button
      onClick={onStart}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Start Survey
    </button>
  </div>
)

const CustomCompletionComponent = ({ onRestart, finalData }: CustomCompletionProps) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
    <p className="text-gray-600 mb-4">Your responses have been recorded.</p>
    <pre className="bg-gray-100 p-4 rounded mb-4">{JSON.stringify(finalData, null, 2)}</pre>
    <button onClick={onRestart} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Take Another Survey
    </button>
  </div>
)

export default meta

export const CustomComponents: Story = {
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
    welcomeCover: CustomWelcomeComponent,
    completeStep: CustomCompletionComponent,
    onComplete: (data) => console.log('Form completed:', data),
  },
  render: (args) => (
    <div className="h-[95vh] bg-white p-4">
      <StepForm {...args} />
    </div>
  ),
}

export const CustomProps: Story = {
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
    welcomeCover: {
      title: 'Customer Feedback',
      description: 'Help us improve our services',
      buttonText: 'Begin Survey',
      estimatedTime: '5 minutes',
    },
    completeStep: {
      title: 'Feedback Submitted',
      description: 'Thanks for helping us improve!',
      buttonText: 'Submit Another Response',
    },
    onComplete: (data) => console.log('Form completed:', data),
  },
  render: (args) => (
    <div className="h-[95vh] bg-white p-4">
      <StepForm {...args} />
    </div>
  ),
}
