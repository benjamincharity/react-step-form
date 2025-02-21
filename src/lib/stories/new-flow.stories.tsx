import React, { useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StepFlowProvider, useStepFlow } from "../step-flow-provider";

const meta = {
  title: "StepFlow/TypeformDemo",
  component: StepFlowProvider,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof StepFlowProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const WelcomeScreen: React.FC<{ startFlow: () => void }> = ({ startFlow }) => (
  <div className="flex flex-col items-center">
    <h2>Got design feedback?</h2>
    <button onClick={startFlow}>Give Feedback</button>
    <p>Takes 2 minutes</p>
  </div>
);
const CompleteScreen: React.FC<{ restartFlow: () => void }> = ({ restartFlow }) => (
  <div className="flex flex-col items-center">
    <h2>Thank you for your feedback!</h2>
    <button onClick={restartFlow}>Restart</button>
  </div>
);

const NameStep = () => {
  const { goNext, setStepData, stepData } = useStepFlow();
  const [value, setValue] = useState(() => stepData?.name || "");

  const handleSubmit = useCallback(() => {
    if (value.trim()) {
      setStepData({ ...stepData, name: value });
      goNext();
    }
  }, [value, setStepData, goNext, stepData]);
  
  return (
    <div>
      <h2>First, what's your name?</h2>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleSubmit} disabled={!value.trim()}>OK</button>
    </div>
  );
};

const EmailStep = () => {
  const { goNext, goBack, setStepData, stepData } = useStepFlow();
  const [value, setValue] = useState(() => stepData?.email || "");

  const handleSubmit = useCallback(() => {
    if (value.includes("@")) {
      setStepData({ ...stepData, email: value });
      goNext();
    }
  }, [value, setStepData, goNext, stepData]);
  
  return (
    <div>
      <h2>Thanks, {stepData?.name}. And your email?</h2>
      <input type="email" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={goBack}>Back</button>
      <button onClick={handleSubmit} disabled={!value.includes("@")}>OK</button>
    </div>
  );
};

const RatingStep = () => {
  const { goNext, goBack, setStepData, stepData } = useStepFlow();
  const [selected, setSelected] = useState(() => stepData?.rating || null);

  const handleSubmit = useCallback(() => {
    if (selected) {
      setStepData({ ...stepData, rating: selected });
      goNext();
    }
  }, [selected, setStepData, goNext, stepData]);
  
  return (
    <div>
      <h2>Great! Now, how would you rate the design overall?</h2>
      <div>
        {[1, 2, 3, 4, 5].map((num) => (
          <button key={num} onClick={() => setSelected(num)}>{num}</button>
        ))}
      </div>
      <button onClick={goBack}>Back</button>
      <button onClick={handleSubmit} disabled={!selected}>OK</button>
    </div>
  );
};

function TypeformTemplate() {
  return (
    <div className="h-screen bg-gradient-to-br from-[#fff3e9] to-[#ffd7d1] flex items-center justify-center">
      <StepFlowProvider id="typeform-flow" welcomeComponent={WelcomeScreen} completeComponent={CompleteScreen}>
        <NameStep />
        <EmailStep />
        <RatingStep />
      </StepFlowProvider>
    </div>
  );
}


export const TypeformFlow: Story = {
  args: {
    children: null
  },
  render: () => <TypeformTemplate />
};
