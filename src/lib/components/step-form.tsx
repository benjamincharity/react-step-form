import { AnimatePresence, motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { createContext, createElement, useCallback, useContext, useEffect, useState, useId, useRef } from 'react'

import { Check } from './icons/check'
import { DefaultWelcomeCover } from './default-welcome-cover'
import { ChevronUp } from './icons/chevron-up'
import { ChevronDown } from './icons/chevron-down'
import { PressEnterHint } from './press-enter-hint'
import { DefaultCompleteStep } from './default-complete-step'

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

// Add new fade variants for starter step
const fadeVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
}

// Replace validation context with simpler version
interface StepValidationContext {
  validateStep?: (stepId: string, stepData: unknown) => boolean | Promise<boolean>
}

const StepValidationContext = createContext<StepValidationContext | null>(null)

export const useStepValidation = () => {
  const context = useContext(StepValidationContext)
  if (!context) {
    throw new Error('useStepValidation must be used within StepForm')
  }
  return context
}

export interface StepProps<T> {
  initialData?: T
  isActive: boolean
  onStepComplete: (result: { isComplete: boolean; stepData: T }) => void
  stepId: string
  submitButtonProps?: {
    className?: string
  }
  validate?: (validateFn: () => Promise<boolean>) => void
}

export interface Step {
  component: ComponentType<StepProps<any>>
  id: string
  isOptional?: boolean
}

export interface StepFormProps {
  id?: string
  completeStep?:
    | ComponentType<{ onRestart: () => void; finalData: unknown[] }>
    | {
        title?: string
        description?: string
        buttonText?: string
      }
  debugMode?: boolean
  onComplete: (data: Record<string, any>) => void
  welcomeCover?:
    | ComponentType<{ onStart: () => void }>
    | {
        title?: string
        buttonText?: string
        estimatedTime?: string
        description?: string
      }
  steps: Step[]
  className?: string
  stepIndicatorProps?: {
    activeStepClassName?: string
    completedStepClassName?: string
    inactiveStepClassName?: string
    connectionLineClassName?: string
    stepNumberClassName?: string
    footerNavButtonClassName?: string
    footerNavButtonActiveClassName?: string
    footerNavButtonInactiveClassName?: string
  }
  submitButtonProps?: {
    className?: string
  }
  validateStep?: (stepId: string, stepData: unknown) => boolean | Promise<boolean>
  hideEnterHint?: boolean
}

export function StepForm({
  id: providedId,
  completeStep: CustomCompleteStep,
  debugMode = false,
  onComplete,
  welcomeCover,
  steps,
  className,
  stepIndicatorProps,
  submitButtonProps,
  validateStep,
  hideEnterHint,
}: StepFormProps) {
  const fallbackId = useId()
  const formId = providedId || fallbackId
  const storageKey = `stepForm-${formId}`
  const [isStorageLoaded, setIsStorageLoaded] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(steps.length).fill(false))
  const [stepData, setStepData] = useState<unknown[]>(new Array(steps.length).fill(null))
  const [isCompleted, setIsCompleted] = useState(false)
  const [direction, setDirection] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)

  // Add touch tracking state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Add ref to store current step's validate function
  const currentStepValidate = useRef<(() => Promise<boolean>) | null>(null)

  // Add ref for handleNext
  const handleNextRef = useRef<(forceAllowNext: boolean | React.MouseEvent) => Promise<void>>()

  const handleStart = useCallback(() => {
    setShowWelcome(false)
    setCurrentStepIndex(0)
  }, [])

  const validateAllSteps = useCallback(
    async (data: Record<string, unknown>) => {
      if (!validateStep) return true

      // Validate each step's data
      for (let i = 0; i < steps.length; i++) {
        const stepId = steps[i].id
        const stepData = data[stepId]
        const isValid = await validateStep(stepId, stepData)
        if (!isValid) return false
      }
      return true
    },
    [validateStep, steps],
  )

  const canProceedToNextStep = useCallback(async () => {
    if (debugMode) return true

    // Check if the current step is completed or optional
    const isStepCompletedOrOptional = completedSteps[currentStepIndex] || steps[currentStepIndex]?.isOptional

    if (!isStepCompletedOrOptional) return false

    // If we have a validateStep function, use it
    if (validateStep && stepData[currentStepIndex]) {
      const isValid = await validateStep(steps[currentStepIndex].id, stepData[currentStepIndex])
      return isValid
    }

    return isStepCompletedOrOptional
  }, [debugMode, completedSteps, currentStepIndex, steps, validateStep, stepData])

  const handleNext = useCallback(
    async (forceAllowNext: boolean | React.MouseEvent = false) => {
      const shouldForceNext = typeof forceAllowNext === 'boolean' ? forceAllowNext : false

      if (!shouldForceNext && currentStepValidate.current) {
        const isValid = await currentStepValidate.current()

        if (!isValid) {
          return
        }
      }

      const canProceed = await canProceedToNextStep()

      if (currentStepIndex < steps.length - 1 && (canProceed || shouldForceNext)) {
        setDirection(1)
        setCurrentStepIndex(currentStepIndex + 1)
      } else if (currentStepIndex === steps.length - 1 && completedSteps[currentStepIndex]) {
        const finalData = Object.assign({}, ...stepData)
        if (await validateAllSteps(finalData)) {
          setIsCompleted(true)
          onComplete(finalData)
        }
      }
    },
    [canProceedToNextStep, completedSteps, currentStepIndex, onComplete, stepData, steps.length, validateAllSteps],
  )

  useEffect(() => {
    handleNextRef.current = handleNext
  }, [handleNext])

  const handleStepComplete = useCallback(
    (result: { isComplete: boolean; stepData: unknown }) => {
      setStepData((prevStepData) => {
        const newStepData = [...prevStepData]
        newStepData[currentStepIndex] = result.stepData
        return newStepData
      })

      // Only update completion state if explicitly completed
      if (result.isComplete) {
        setCompletedSteps((prevCompletedSteps) => {
          const newCompletedSteps = [...prevCompletedSteps]
          newCompletedSteps[currentStepIndex] = true
          return newCompletedSteps
        })

        // Automatically move to next step when completed
        handleNextRef.current?.(true)
      }
    },
    [currentStepIndex],
  )

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setDirection(-1)
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }, [currentStepIndex])

  // Modify the useEffect that loads from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey)
    if (savedState) {
      try {
        const {
          currentStepIndex: savedIndex,
          completedSteps: savedCompleted,
          stepData: savedData,
        } = JSON.parse(savedState)
        setCurrentStepIndex(savedIndex)
        setCompletedSteps(savedCompleted)
        setStepData(savedData)
        setShowWelcome(false) // Don't show welcome if we have saved state
      } catch (e) {
        console.error('Error loading saved form state:', e)
        // Don't set currentStepIndex if there's an error
      }
    }
    setIsStorageLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (!isStorageLoaded) return

    if (isCompleted) {
      localStorage.removeItem(storageKey)
    } else if (currentStepIndex >= 0) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentStepIndex,
          completedSteps,
          stepData,
        }),
      )
    }
  }, [currentStepIndex, completedSteps, stepData, isCompleted, isStorageLoaded, storageKey])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          handlePrevious()
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          handleNext()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentStepIndex, steps.length, handleNext, handlePrevious])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showWelcome && event.key === 'Enter') {
        handleStart()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showWelcome, handleStart])

  const handleRestart = useCallback(() => {
    setShowWelcome(true)
    setCompletedSteps(new Array(steps.length).fill(false))
    setStepData(new Array(steps.length).fill(null))
    setIsCompleted(false)
    setCurrentStepIndex(-1)
    localStorage.removeItem(storageKey)
  }, [steps.length, storageKey])

  const renderCurrentStep = () => {
    if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
      const CurrentStepComponent = steps[currentStepIndex].component
      return (
        <CurrentStepComponent
          initialData={stepData[currentStepIndex]}
          isActive={true}
          onStepComplete={handleStepComplete}
          stepId={steps[currentStepIndex].id}
          submitButtonProps={submitButtonProps}
          validate={(fn) => {
            currentStepValidate.current = fn
          }}
        />
      )
    }

    return <div>Invalid step</div>
  }

  const handleIndicatorStepClick = useCallback(
    (newIndex: number) => {
      if (newIndex > currentStepIndex) {
        setDirection(1)
      } else {
        setDirection(-1)
      }
      setCurrentStepIndex(newIndex)
    },
    [currentStepIndex],
  )

  const showStepIndicators = currentStepIndex >= 0 && currentStepIndex < steps.length && !isCompleted

  const renderThumb = ({ style, ...props }: { style: React.CSSProperties }) => {
    const thumbStyle = {
      backgroundColor: '#CBD5E1', // Tailwind's gray-300
      borderRadius: '0.25rem',
    }
    return <div style={{ ...style, ...thumbStyle }} {...props} />
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientY)
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isSwipeDown = distance < -50
    const isSwipeUp = distance > 50

    if (isSwipeUp) {
      const canProceed = await canProceedToNextStep()
      if (canProceed) {
        handleNext()
      }
    } else if (isSwipeDown) {
      handlePrevious()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, handleNext, handlePrevious, canProceedToNextStep])

  useEffect(() => {
    const content = document.querySelector('[data-e2e="step-content"]')
    if (!content) return

    const preventWheel = (e: Event) => {
      if (!(e instanceof WheelEvent)) return
      if (currentStepIndex >= 0 && !isCompleted) {
        e.preventDefault()

        if (Math.abs(e.deltaY) < 20) return // Ignore small scrolls

        if (e.deltaY < 0) {
          // Scrolling up
          handlePrevious()
        } else if (e.deltaY > 0) {
          // Scrolling down
          void handleNext()
        }
      }
    }

    content.addEventListener('wheel', preventWheel)
    return () => content.removeEventListener('wheel', preventWheel)
  }, [currentStepIndex, isCompleted, handleNext, handlePrevious])

  // Update the footer navigation buttons in the render section
  const footerNavButtonBaseClass = stepIndicatorProps?.footerNavButtonClassName || 'p-1.5'
  const footerNavButtonActiveClass = stepIndicatorProps?.footerNavButtonActiveClassName || 'hover:bg-gray-50'
  const footerNavButtonInactiveClass = stepIndicatorProps?.footerNavButtonInactiveClassName || 'text-gray-400 cursor-not-allowed'

  return (
    <StepValidationContext.Provider value={{ validateStep }}>
      <div className={`flex flex-col h-full relative ${className || ''}`}>
        {/* Only render the main form content if we're not showing welcome screen */}
        {!showWelcome ? (
          <div className="flex flex-col h-full">
            {/* Header with step indicators */}
            {!isCompleted && (
              <div data-e2e="step-indicators" className="flex-none py-4">
                <div className="flex flex-col items-center">
                  <span className="font-semibold">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>

                  <div className="flex gap-2 mt-2">
                    {steps.map((step, index) => {
                      const isComplete = completedSteps[index]
                      const isActive = index === currentStepIndex
                      return (
                        <button
                          key={step.id}
                          onClick={() => handleIndicatorStepClick(index)}
                          className={`
                            ${
                              stepIndicatorProps?.stepNumberClassName ||
                              'w-8 h-8 rounded-full flex items-center justify-center transition-colors'
                            }
                            ${isActive ? stepIndicatorProps?.activeStepClassName || 'bg-teal-500 text-white' : ''}
                            ${isComplete ? stepIndicatorProps?.completedStepClassName || 'bg-teal-500 text-white' : ''}
                            ${
                              !isActive && !isComplete ? stepIndicatorProps?.inactiveStepClassName || 'bg-gray-100' : ''
                            }
                          `}
                        >
                          {isComplete ? <Check /> : <span>{index + 1}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Main content area with step animations */}
            <div
              data-e2e="step-content"
              className="flex-1 overflow-hidden relative"
              onTouchStart={currentStepIndex >= 0 && !isCompleted ? handleTouchStart : undefined}
              onTouchMove={currentStepIndex >= 0 && !isCompleted ? handleTouchMove : undefined}
              onTouchEnd={currentStepIndex >= 0 && !isCompleted ? handleTouchEnd : undefined}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStepIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="h-full overflow-auto"
                >
                  <div className="flex flex-col p-4">
                    <div className="max-w-2xl mx-auto w-full">
                      {isCompleted ? (
                        typeof CustomCompleteStep === 'function' ? (
                          <CustomCompleteStep onRestart={handleRestart} finalData={stepData} />
                        ) : (
                          <DefaultCompleteStep onRestart={handleRestart} {...(CustomCompleteStep || {})} />
                        )
                      ) : (
                        renderCurrentStep()
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            {!isCompleted && (
              <div data-e2e="step-footer" className="flex-none p-4 border-t">
                <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
                  <button
                    onClick={handleRestart}
                    className="px-2 py-1 text-xs text-red-500 border border-red-500 rounded hover:bg-red-50 transition-colors"
                  >
                    Restart
                  </button>

                  <div data-e2e="step-footer-navigation" className="flex items-center gap-2">
                    <div className="flex rounded-full overflow-hidden">
                      <button
                        className={`${footerNavButtonBaseClass} border-r border-rose-400/20 ${
                          currentStepIndex === 0 ? footerNavButtonInactiveClass : footerNavButtonActiveClass
                        }`}
                        disabled={currentStepIndex === 0}
                        onClick={handlePrevious}
                        aria-label="Previous step"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        className={`${footerNavButtonBaseClass} ${
                          currentStepIndex === steps.length - 1 || !canProceedToNextStep()
                            ? footerNavButtonInactiveClass
                            : footerNavButtonActiveClass
                        }`}
                        disabled={currentStepIndex === steps.length - 1 || !canProceedToNextStep()}
                        onClick={handleNext}
                        aria-label="Next step"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    {!hideEnterHint && <PressEnterHint />}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Welcome cover overlay */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 1 }} // Changed from 0 to 1
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0"
            >
              {welcomeCover ? (
                typeof welcomeCover === 'function' ? (
                  createElement(welcomeCover, { onStart: handleStart })
                ) : (
                  <DefaultWelcomeCover onStart={handleStart} {...welcomeCover} />
                )
              ) : (
                <DefaultWelcomeCover onStart={handleStart} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepValidationContext.Provider>
  )
}
