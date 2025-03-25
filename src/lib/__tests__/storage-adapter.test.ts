import { beforeEach, describe, expect, it, vi } from 'vitest';
import { localStorageAdapter } from '../storage-adapter';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = mockLocalStorage;

describe('localStorageAdapter', () => {
  const TEST_ID = 'test-flow';
  const STORAGE_KEY = `stepFlow_${TEST_ID}`;

  beforeEach(() => {
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    mockLocalStorage.removeItem.mockReset();
    mockLocalStorage.clear.mockReset();
  });

  it('should get flow state from storage', () => {
    const mockState = {
      flowStarted: true,
      currentStep: 1,
      isComplete: false,
      stepData: { name: 'test' },
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockState));

    const state = localStorageAdapter.getFlowState(TEST_ID);
    expect(state).toEqual(mockState);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('should return default state when no state in storage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const state = localStorageAdapter.getFlowState(TEST_ID);
    expect(state).toEqual({
      flowStarted: false,
      currentStep: 0,
      isComplete: false,
      stepData: {},
    });
  });

  it('should handle invalid JSON in storage', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const state = localStorageAdapter.getFlowState(TEST_ID);
    expect(state).toEqual({
      flowStarted: false,
      currentStep: 0,
      isComplete: false,
      stepData: {},
    });
    expect(consoleError).toHaveBeenCalledWith('Failed to read from localStorage:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('should handle storage quota exceeded', () => {
    const largeData = 'x'.repeat(6 * 1024 * 1024); // 6MB data (exceeds 5MB limit)
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    localStorageAdapter.setStepData(TEST_ID, { largeData });

    expect(consoleError).toHaveBeenCalledWith('Failed to save to localStorage:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('should handle localStorage.setItem throwing other errors', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Unknown error');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    localStorageAdapter.setCurrentStep(TEST_ID, 1);

    expect(consoleError).toHaveBeenCalledWith('Failed to save to localStorage:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('should handle localStorage.removeItem throwing errors', () => {
    mockLocalStorage.removeItem.mockImplementation(() => {
      throw new Error('Remove error');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    localStorageAdapter.clear(TEST_ID);

    expect(consoleError).toHaveBeenCalledWith('Failed to clear localStorage:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('should handle malformed data in storage gracefully', () => {
    const malformedState = {
      currentStep: '1', // Should be number
      flowStarted: 1, // Should be boolean
      isComplete: 'true', // Should be boolean
      stepData: null, // Should be object
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(malformedState));

    const state = localStorageAdapter.getFlowState(TEST_ID);
    expect(state).toEqual({
      currentStep: 1,
      flowStarted: true,
      isComplete: true,
      stepData: {},
    });
  });

  it('should merge step data correctly', () => {
    const existingState = {
      currentStep: 1,
      flowStarted: true,
      isComplete: false,
      stepData: { name: 'test', age: 25 },
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingState));

    localStorageAdapter.setStepData(TEST_ID, { age: 30, city: 'New York' });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"stepData":{"name":"test","age":30,"city":"New York"}'),
    );
  });

  it('should set flow started state', () => {
    localStorageAdapter.setFlowStarted(TEST_ID, true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.stringContaining('"flowStarted":true'));
  });

  it('should set current step', () => {
    localStorageAdapter.setCurrentStep(TEST_ID, 2);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.stringContaining('"currentStep":2'));
  });

  it('should set complete state', () => {
    localStorageAdapter.setIsComplete(TEST_ID, true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.stringContaining('"isComplete":true'));
  });

  it('should set step data', () => {
    const testData = { name: 'test' };
    localStorageAdapter.setStepData(TEST_ID, testData);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"stepData":{"name":"test"}'),
    );
  });

  it('should clear storage', () => {
    localStorageAdapter.clear(TEST_ID);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
