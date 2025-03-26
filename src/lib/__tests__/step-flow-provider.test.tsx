import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StepFlowProvider, useStepFlow } from '../step-flow-provider';
import { localStorageAdapter } from '../storage-adapter';

// Mock matchMedia for reduced motion
const createMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} data-testid="motion-div" data-motion-props={JSON.stringify(props)}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children, mode }: any) => children,
}));

// Mock components for testing
const MockStep1 = () => {
  const { goNext } = useStepFlow();
  return <button onClick={goNext}>Next</button>;
};

const MockStep2 = () => {
  const { goNext, goBack } = useStepFlow();
  return (
    <div>
      <button onClick={goNext}>Next</button>
      <button onClick={goBack}>Back</button>
    </div>
  );
};

const MockWelcome = ({ startFlow }: { startFlow: () => void }) => <button onClick={startFlow}>Start</button>;

const MockComplete = ({ restartFlow }: { restartFlow: () => void }) => <button onClick={restartFlow}>Restart</button>;

describe('StepFlowProvider', () => {
  const TEST_ID = 'test-flow';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.matchMedia = createMatchMedia(false);
  });

  // Test missing id prop
  it('should throw error when id prop is missing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        // @ts-expect-error - intentionally testing missing required prop
        <StepFlowProvider>
          <MockStep1 />
        </StepFlowProvider>,
      );
    }).toThrow('StepFlowProvider requires an "id" prop');

    consoleError.mockRestore();
  });

  // Test animation behavior with animations enabled
  it('should apply animation props when reduced motion is disabled', async () => {
    window.matchMedia = createMatchMedia(false);

    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Check motion props
    const motionDiv = screen.getByTestId('motion-div');
    const motionProps = JSON.parse(motionDiv.getAttribute('data-motion-props') || '{}');

    expect(motionProps.initial).toEqual({ opacity: 0, y: 100 });
    expect(motionProps.animate).toEqual({ opacity: 1, y: 0 });
    expect(motionProps.exit).toEqual({ opacity: 0, y: -100 });
    expect(motionProps.transition).toEqual({ duration: 0.3 });
  });

  // Test animation behavior with reduced motion
  it('should disable animations when reduced motion is preferred', async () => {
    window.matchMedia = createMatchMedia(true);

    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Check motion props
    const motionDiv = screen.getByTestId('motion-div');
    const motionProps = JSON.parse(motionDiv.getAttribute('data-motion-props') || '{}');

    expect(motionProps.initial).toEqual({ opacity: 1, y: 0 });
    expect(motionProps.animate).toEqual({ opacity: 1, y: 0 });
    expect(motionProps.exit).toEqual({ opacity: 1, y: 0 });
    expect(motionProps.transition).toEqual({ duration: 0 });
  });

  // Test error boundary
  it('should render error boundary when child component throws', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <StepFlowProvider id={TEST_ID}>
        <ErrorComponent />
      </StepFlowProvider>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('Please try refreshing the page or contact support if the problem persists.'),
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('should render welcome component when flow has not started', () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should start flow when welcome component is clicked', async () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  it('should navigate through steps', async () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Go to next step
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  it('should show complete component when all steps are done', async () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome} completeComponent={MockComplete}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Complete all steps
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    await waitFor(() => {
      expect(screen.getByText('Restart')).toBeInTheDocument();
    });
  });

  it('should allow going back', async () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Go to second step
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    // Wait for the second step to be rendered
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    // Go back
    await act(async () => {
      fireEvent.click(screen.getByText('Back'));
    });

    // Wait for the first step to be rendered
    await waitFor(() => {
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  it('should persist state in storage', async () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Verify state is persisted
    const state = localStorageAdapter.getFlowState(TEST_ID);
    expect(state.flowStarted).toBe(true);
  });

  it('should restore state from storage', () => {
    // Set initial state in storage
    localStorageAdapter.setFlowStarted(TEST_ID, true);
    localStorageAdapter.setCurrentStep(TEST_ID, 1);

    render(
      <StepFlowProvider id={TEST_ID}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Verify we're on the second step
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should handle step data updates', async () => {
    const TestStep = () => {
      const { setStepData } = useStepFlow();
      return <button onClick={() => setStepData({ name: 'test' })}>Set Data</button>;
    };

    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome}>
        <TestStep />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Set step data
    await act(async () => {
      fireEvent.click(screen.getByText('Set Data'));
    });

    // Verify data is persisted
    const state = localStorageAdapter.getFlowState(TEST_ID);
    expect(state.stepData).toEqual({ name: 'test' });
  });

  it('should restart flow', async () => {
    render(
      <StepFlowProvider id={TEST_ID} welcomeComponent={MockWelcome} completeComponent={MockComplete}>
        <MockStep1 />
        <MockStep2 />
      </StepFlowProvider>,
    );

    // Start flow
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });

    // Complete all steps
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    // Wait for complete component to be rendered
    await waitFor(() => {
      expect(screen.getByText('Restart')).toBeInTheDocument();
    });

    // Restart flow
    await act(async () => {
      fireEvent.click(screen.getByText('Restart'));
    });

    // Wait for welcome screen to be rendered
    await waitFor(() => {
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  it('should throw error when useStepFlow is used outside provider', () => {
    const TestComponent = () => {
      useStepFlow();
      return null;
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    consoleError.mockRestore();
  });

  it('should handle error boundary', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <StepFlowProvider id={TEST_ID}>
        <ErrorComponent />
      </StepFlowProvider>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  // Test steps array handling
  it('should handle non-React children gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <StepFlowProvider id={TEST_ID}>
        {/* @ts-ignore - intentionally testing invalid children */}
        {[null, undefined, false, true, '', 0]}
      </StepFlowProvider>,
    );

    // Should render without any step content
    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toBeEmptyDOMElement();

    consoleError.mockRestore();
  });

  it('should handle empty children array', () => {
    render(<StepFlowProvider id={TEST_ID}>{[]}</StepFlowProvider>);

    // Should render without any step content
    const motionDiv = screen.getByTestId('motion-div');
    expect(motionDiv).toBeEmptyDOMElement();
  });

  // Test key generation for steps
  it('should use step key when available', async () => {
    const StepWithKey = () => <div>Step with key</div>;

    // Set initial state to skip welcome screen
    localStorageAdapter.setFlowStarted(TEST_ID, true);

    render(
      <StepFlowProvider id={TEST_ID}>
        <StepWithKey key="custom-key" />
      </StepFlowProvider>,
    );

    // Verify the step content is rendered
    await waitFor(() => {
      expect(screen.getByText('Step with key')).toBeInTheDocument();
    });

    // Verify animation props are applied
    const motionDiv = screen.getByTestId('motion-div');
    const props = JSON.parse(motionDiv.getAttribute('data-motion-props') || '{}');
    expect(props.initial).toEqual({ opacity: 0, y: 100 });
    expect(props.animate).toEqual({ opacity: 1, y: 0 });
    expect(props.exit).toEqual({ opacity: 0, y: -100 });
  });

  it('should fallback to step index when key is not available', async () => {
    const StepWithoutKey = () => <div>Step without key</div>;

    // Set initial state to skip welcome screen
    localStorageAdapter.setFlowStarted(TEST_ID, true);

    render(
      <StepFlowProvider id={TEST_ID}>
        <StepWithoutKey />
      </StepFlowProvider>,
    );

    // Verify the step content is rendered
    await waitFor(() => {
      expect(screen.getByText('Step without key')).toBeInTheDocument();
    });

    // Verify animation props are applied
    const motionDiv = screen.getByTestId('motion-div');
    const props = JSON.parse(motionDiv.getAttribute('data-motion-props') || '{}');
    expect(props.initial).toEqual({ opacity: 0, y: 100 });
    expect(props.animate).toEqual({ opacity: 1, y: 0 });
    expect(props.exit).toEqual({ opacity: 0, y: -100 });
  });

  // Test step validation
  it('should filter out invalid React elements', () => {
    const validStep = <div key="valid">Valid Step</div>;
    // @ts-ignore - intentionally testing invalid React element
    const steps = [validStep, 'Not a React element'];

    render(<StepFlowProvider id={TEST_ID}>{steps}</StepFlowProvider>);

    // Should only render the valid step
    expect(screen.getByText('Valid Step')).toBeInTheDocument();
  });
});
