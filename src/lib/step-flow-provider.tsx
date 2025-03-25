import { AnimatePresence, motion } from 'framer-motion';
import React, {
  Component,
  createContext,
  ErrorInfo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useReducedMotion } from './hooks/use-reduced-motion';
import { localStorageAdapter, StorageAdapter } from './storage-adapter';

export interface StepFlowContextProps {
  currentStep: number;
  currentStepNumber: number;
  flowStarted: boolean;
  isComplete: boolean;
  stepData: Record<string, any>;
  startFlow: () => void;
  goNext: () => void;
  goBack: () => void;
  setStepData: (data: Record<string, any>) => void;
  restartFlow: () => void;
}

export const StepFlowContext = createContext<StepFlowContextProps | undefined>(undefined);

class StepFlowErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('StepFlow Error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const StepFlowProvider: React.FC<{
  id: string;
  storageAdapter?: StorageAdapter;
  welcomeComponent?: React.FC<{ startFlow: () => void }>;
  completeComponent?: React.FC<{ restartFlow: () => void }>;
  children: ReactNode;
}> = ({
  id,
  storageAdapter = localStorageAdapter,
  welcomeComponent: WelcomeComponent,
  completeComponent: CompleteComponent,
  children,
}) => {
  // Validate required props
  if (!id) {
    throw new Error('StepFlowProvider requires an "id" prop');
  }
  const prefersReducedMotion = useReducedMotion();
  const storedState = storageAdapter.getFlowState(id);
  const [currentStep, setCurrentStep] = useState(storedState.currentStep || 0);
  const [flowStarted, setFlowStarted] = useState(storedState.flowStarted || false);
  const [isComplete, setIsComplete] = useState(storedState.isComplete || false);
  const [stepData, setStepDataState] = useState(storedState.stepData || {});

  const steps = useMemo(
    () => React.Children.toArray(children).filter((child) => React.isValidElement(child)) as React.ReactElement[],
    [children],
  );

  const setStepData = useCallback(
    (data: Record<string, any>) => {
      const newStepData = { ...stepData, ...data };
      setStepDataState(newStepData);
      storageAdapter.setStepData(id, newStepData);
    },
    [id, stepData, storageAdapter],
  );

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      storageAdapter.setCurrentStep(id, currentStep + 1);
    } else {
      setIsComplete(true);
      storageAdapter.setIsComplete(id, true);
    }
  }, [currentStep, id, steps.length, storageAdapter]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      storageAdapter.setCurrentStep(id, currentStep - 1);
    }
  }, [currentStep, id, storageAdapter]);

  const startFlow = useCallback(() => {
    setFlowStarted(true);
    storageAdapter.setFlowStarted(id, true);
  }, [id, storageAdapter]);

  const restartFlow = useCallback(() => {
    setFlowStarted(false);
    setIsComplete(false);
    setCurrentStep(0);
    setStepDataState({});
    storageAdapter.clear(id);
  }, [id, storageAdapter]);

  const contextValue = useMemo(
    () => ({
      currentStep,
      currentStepNumber: currentStep + 1,
      flowStarted,
      isComplete,
      stepData,
      startFlow,
      goNext,
      goBack,
      setStepData,
      restartFlow,
    }),
    [currentStep, flowStarted, isComplete, stepData, startFlow, goNext, goBack, setStepData, restartFlow],
  );

  const animationProps = useMemo(
    () =>
      prefersReducedMotion
        ? {
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: { opacity: 1 },
            transition: { duration: 0 },
          }
        : {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.3 },
          },
    [prefersReducedMotion],
  );

  const stepAnimationProps = useMemo(
    () =>
      prefersReducedMotion
        ? {
            initial: { opacity: 1, y: 0 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 1, y: 0 },
            transition: { duration: 0 },
          }
        : {
            initial: { opacity: 0, y: 100 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -100 },
            transition: { duration: 0.3 },
          },
    [prefersReducedMotion],
  );

  return (
    <StepFlowErrorBoundary>
      <StepFlowContext.Provider value={contextValue}>
        <AnimatePresence mode="wait">
          {!flowStarted && WelcomeComponent ? (
            <motion.div key="welcome" {...animationProps}>
              <WelcomeComponent startFlow={startFlow} />
            </motion.div>
          ) : isComplete && CompleteComponent ? (
            <motion.div key="complete" {...animationProps}>
              <CompleteComponent restartFlow={restartFlow} />
            </motion.div>
          ) : (
            <motion.div key={steps[currentStep]?.key || `step-${currentStep}`} {...stepAnimationProps}>
              {steps[currentStep]}
            </motion.div>
          )}
        </AnimatePresence>
      </StepFlowContext.Provider>
    </StepFlowErrorBoundary>
  );
};

export const useStepFlow = () => {
  const context = useContext(StepFlowContext);
  if (!context) {
    throw new Error('useStepFlow must be used within a StepFlowProvider');
  }
  return context;
};
