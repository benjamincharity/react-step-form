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
  <div className="flex flex-col items-center justify-center gap-8">
    <h2 className="text-[60px] font-medium leading-tight text-center">Got design feedback?</h2>
    <div className="flex items-center gap-3">
      
      <div className="text-center">

      <button
        onClick={startFlow}
        className="bg-[#F26B5C] mb-1 text-white px-8 py-4 rounded-full text-2xl hover:bg-opacity-90 transition-colors"
      >
        Give feedback
      </button>
    <div className="flex items-center gap-2 justify-center text-gray-700">
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <span>Takes 2 minutes</span>
    </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-700">press</span>
        <span className="font-medium">Enter</span>
        <span className="text-xl">↵</span>
      </div>
    </div>
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
  const [firstName, setFirstName] = useState(() => stepData?.firstName || "");
  const [lastName, setLastName] = useState(() => stepData?.lastName || "");

  const handleSubmit = useCallback(() => {
    if (firstName.trim() && lastName.trim()) {
      setStepData({ ...stepData, firstName, lastName });
      goNext();
    }
  }, [firstName, lastName, setStepData, goNext, stepData]);
  
  return (
    <div className="inline-flex flex-col max-w-2xl w-full gap-8">
      
      <h2 className="text-[42px] flex items-center gap-2 font-medium leading-tight">
      <span className="flex items-center gap-1 text-xs text-[#F26B5C]">
        <span className="text-lg">1</span>
        <span className="text-lg">→</span>
      </span>
        First, what's your name?
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-lg">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-transparent border-b-2 border-[#FFD7D1] focus:border-[#F26B5C] py-2 text-2xl outline-none transition-colors placeholder:text-[#FFD7D1]"
            placeholder="Jane"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-lg">Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-transparent border-b-2 border-[#FFD7D1] focus:border-[#F26B5C] py-2 text-2xl outline-none transition-colors placeholder:text-[#FFD7D1]"
            placeholder="Smith"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!firstName.trim() || !lastName.trim()}
          className="bg-[#F26B5C] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          OK
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">press</span>
          <span className="font-medium">Enter</span>
          <span className="text-xl">↵</span>
        </div>
      </div>
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
    <div className="inline-flex flex-col max-w-2xl w-full gap-8">
      <h2 className="text-[42px] flex items-center gap-2 font-medium leading-tight">
        <span className="flex items-center gap-1 text-xs text-[#F26B5C]">
          <span className="text-lg">2</span>
          <span className="text-lg">→</span>
        </span>
        Thanks, {stepData?.firstName}. And your email?
      </h2>

      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-transparent border-b-2 border-[#FFD7D1] focus:border-[#F26B5C] py-2 text-2xl outline-none transition-colors placeholder:text-[#FFD7D1]"
          placeholder="name@example.com"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!value.includes("@")}
          className="bg-[#F26B5C] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          OK
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">press</span>
          <span className="font-medium">Enter</span>
          <span className="text-xl">↵</span>
        </div>
      </div>
    </div>
  );
};

const RatingStep = () => {
  const { goNext, setStepData, stepData } = useStepFlow();
  const [selected, setSelected] = useState(() => stepData?.rating || null);

  const handleSubmit = useCallback(() => {
    if (selected) {
      setStepData({ ...stepData, rating: selected });
      goNext();
    }
  }, [selected, setStepData, goNext, stepData]);
  
  return (
    <div className="inline-flex flex-col max-w-2xl w-full gap-8">
      <h2 className="text-[42px] flex items-center gap-2 font-medium leading-tight">
        <span className="flex items-center gap-1 text-xs text-[#F26B5C]">
          <span className="text-lg">3</span>
          <span className="text-lg">→</span>
        </span>
        Great! Now, how would you rate the design overall?
      </h2>

      <div className="flex flex-col items-center gap-4">
        <span className="text-gray-600 text-xl">Go with your gut.</span>
        
        <div className="flex gap-12 justify-center my-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setSelected(num)}
              className="group relative"
            >
              <svg 
                viewBox="0 0 24 24" 
                className={`w-12 h-12 transition-colors ${
                  selected === num 
                    ? 'text-[#F26B5C] fill-current' 
                    : 'text-[#FFD7D1] stroke-current fill-none hover:text-[#F26B5C]'
                }`}
                strokeWidth="2"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm ${
                selected === num ? 'text-[#F26B5C]' : 'text-[#FFD7D1]'
              }`}>
                {num}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="bg-[#F26B5C] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          OK
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">press</span>
          <span className="font-medium">Enter</span>
          <span className="text-xl">↵</span>
        </div>
      </div>
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
