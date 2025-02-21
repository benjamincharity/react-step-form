export interface StorageAdapter {
    getFlowData: (id: string) => FlowData;
    setCurrentStep: (id: string, step: number) => void;
    setStepData: (id: string, data: Record<string, any>) => void;
    setFlowStarted: (id: string, started: boolean) => void;
    setIsComplete: (id: string, complete: boolean) => void;
    clear: (id: string) => void;
}

interface FlowData {
    currentStep: number;
    flowStarted: boolean;
    isComplete: boolean;
    stepData: Record<string, any>;
}

export const localStorageAdapter = {
  getFlowState: (id: string) => {
    const storedData = JSON.parse(localStorage.getItem(`stepFlow_${id}`) || "{}");
    return {
      currentStep: storedData.currentStep || 0,
      flowStarted: storedData.flowStarted || false,
      isComplete: storedData.isComplete || false,
      stepData: storedData.stepData || {},
    };
  },

  setCurrentStep: (id: string, currentStep: number) => {
    const existingState = localStorageAdapter.getFlowState(id);
    localStorage.setItem(`stepFlow_${id}`, JSON.stringify({ ...existingState, currentStep }));
  },

  setFlowStarted: (id: string, flowStarted: boolean) => {
    const existingState = localStorageAdapter.getFlowState(id);
    localStorage.setItem(`stepFlow_${id}`, JSON.stringify({ ...existingState, flowStarted }));
  },

  setIsComplete: (id: string, isComplete: boolean) => {
    const existingState = localStorageAdapter.getFlowState(id);
    localStorage.setItem(`stepFlow_${id}`, JSON.stringify({ ...existingState, isComplete }));
  },

  setStepData: (id: string, stepData: Record<string, any>) => {
    const existingState = localStorageAdapter.getFlowState(id);
    localStorage.setItem(`stepFlow_${id}`, JSON.stringify({ ...existingState, stepData: { ...existingState.stepData, ...stepData } }));
  },

  clear: (id: string) => {
    localStorage.removeItem(`stepFlow_${id}`);
  },
};
