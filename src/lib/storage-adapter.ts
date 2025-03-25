export interface StorageAdapter {
  getFlowState: (id: string) => FlowData;
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

const STORAGE_KEY_PREFIX = 'stepFlow_';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

const getStorageKey = (id: string) => `${STORAGE_KEY_PREFIX}${id}`;

const checkStorageQuota = (data: string): boolean => {
  try {
    // Check if we can store the data by attempting to store it in a temporary key
    const testKey = 'test_storage_quota';
    localStorage.setItem(testKey, data);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (!checkStorageQuota(value)) {
      throw new Error('Storage quota exceeded');
    }
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    // You might want to implement a fallback storage mechanism here
  }
};

export const localStorageAdapter = {
  getFlowState: (id: string): FlowData => {
    try {
      const storedData = localStorage.getItem(getStorageKey(id));
      if (!storedData)
        return {
          currentStep: 0,
          flowStarted: false,
          isComplete: false,
          stepData: {},
        };

      const parsedData = JSON.parse(storedData);
      return {
        currentStep: Number(parsedData.currentStep) || 0,
        flowStarted: Boolean(parsedData.flowStarted),
        isComplete: Boolean(parsedData.isComplete),
        stepData: parsedData.stepData || {},
      };
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return {
        currentStep: 0,
        flowStarted: false,
        isComplete: false,
        stepData: {},
      };
    }
  },

  setCurrentStep: (id: string, currentStep: number): void => {
    const existingState = localStorageAdapter.getFlowState(id);
    safeSetItem(getStorageKey(id), JSON.stringify({ ...existingState, currentStep }));
  },

  setFlowStarted: (id: string, flowStarted: boolean): void => {
    const existingState = localStorageAdapter.getFlowState(id);
    safeSetItem(getStorageKey(id), JSON.stringify({ ...existingState, flowStarted }));
  },

  setIsComplete: (id: string, isComplete: boolean): void => {
    const existingState = localStorageAdapter.getFlowState(id);
    safeSetItem(getStorageKey(id), JSON.stringify({ ...existingState, isComplete }));
  },

  setStepData: (id: string, stepData: Record<string, any>): void => {
    const existingState = localStorageAdapter.getFlowState(id);
    safeSetItem(
      getStorageKey(id),
      JSON.stringify({
        ...existingState,
        stepData: { ...existingState.stepData, ...stepData },
      }),
    );
  },

  clear: (id: string): void => {
    try {
      localStorage.removeItem(getStorageKey(id));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};
