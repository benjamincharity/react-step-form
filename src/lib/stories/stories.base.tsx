import type { Meta } from '@storybook/react';
import { StepFlowProvider } from '../step-flow-provider';

export const meta = {
  title: 'StepForm',
  component: StepFlowProvider,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StepFlowProvider>;

export default meta;
