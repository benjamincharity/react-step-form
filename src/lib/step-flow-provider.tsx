import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { localStorageAdapter } from "./storage-adapter";

export interface StepFlowContextProps {
  currentStep: number;
  flowStarted: boolean;
  isComplete: boolean;
  stepData: Record<string, any>;
  startFlow: () => void;
  goNext: () => void;
  goBack: () => void;
  setStepData: (data: Record<string, any>) => void;
}

export const StepFlowContext = createContext<StepFlowContextProps | undefined>(undefined);

export const StepFlowProvider: React.FC<{
  id: string;
  welcomeComponent?: React.FC<{ startFlow: () => void }>;
  completeComponent?: React.FC<{ restartFlow: () => void }>;
  children: ReactNode;
}> = ({ id, welcomeComponent: WelcomeComponent, completeComponent: CompleteComponent, children }) => {
  const storedState = localStorageAdapter.getFlowState(id);

  const [currentStep, setCurrentStep] = useState(storedState.currentStep || 0);
  const [flowStarted, setFlowStarted] = useState(storedState.flowStarted || false);
  const [isComplete, setIsComplete] = useState(storedState.isComplete || false);
  const [stepData, setStepDataState] = useState(storedState.stepData || {});

  const steps = React.Children.toArray(children).filter((child) =>
    React.isValidElement(child)
  ) as React.ReactElement[];

  const setStepData = (data: Record<string, any>) => {
    const newStepData = { ...stepData, ...data };
    setStepDataState(newStepData);
    localStorageAdapter.setStepData(id, newStepData);
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      localStorageAdapter.setCurrentStep(id, currentStep + 1);
    } else {
      setIsComplete(true);
      localStorageAdapter.setIsComplete(id, true);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      localStorageAdapter.setCurrentStep(id, currentStep - 1);
    }
  };

  const startFlow = () => {
    setFlowStarted(true);
    localStorageAdapter.setFlowStarted(id, true);
  };

  return (
    <StepFlowContext.Provider
      value={{
        currentStep,
        flowStarted,
        isComplete,
        stepData,
        startFlow,
        goNext,
        goBack,
        setStepData,
      }}
    >
      <AnimatePresence mode="wait">
        {!flowStarted && WelcomeComponent ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeComponent startFlow={startFlow} />
          </motion.div>
        ) : isComplete && CompleteComponent ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompleteComponent restartFlow={() => {
              setFlowStarted(false);
              setIsComplete(false);
              setCurrentStep(0);
              setStepDataState({});
              localStorageAdapter.clear(id);
            }} />
          </motion.div>
        ) : (
          <motion.div
            key={steps[currentStep]?.key || `step-${currentStep}`}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep]}
          </motion.div>
        )}
      </AnimatePresence>
    </StepFlowContext.Provider>
  );
};

export const useStepFlow = () => {
  const context = useContext(StepFlowContext);
  if (!context) {
    throw new Error("useStepFlow must be used within a StepFlowProvider");
  }
  return context;
};
