import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { StepFlowProvider, useStepFlow } from '../step-flow-provider';

const meta = {
  title: 'StepFlow/TypeformDemo',
  component: StepFlowProvider,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StepFlowProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function StartAndRestartButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`bg-[#F26B5C] mb-1 text-white px-8 py-4 rounded-full text-2xl hover:bg-opacity-90 transition-colors ${className}`}
      {...props}
    />
  );
}

const WelcomeScreen: React.FC<{ startFlow: () => void }> = ({ startFlow }) => (
  <div className="flex flex-col items-center justify-center gap-8">
    <h2 className="text-[60px] font-medium leading-tight text-center">Got design feedback?</h2>
    <div className="flex items-center gap-3">
      <div className="text-center">
        <StartAndRestartButton onClick={startFlow}>Give feedback</StartAndRestartButton>
        <div className="flex items-center gap-2 justify-center text-gray-700">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <span>Takes 2 minutes</span>
        </div>
      </div>
      <div className="flex items-center gap-2 relative -top-[.9em]">
        <span className="text-gray-700">press</span>
        <span className="font-medium">Enter</span>
        <span className="text-xl">↵</span>
      </div>
    </div>
  </div>
);

const CompleteScreen: React.FC<{ restartFlow: () => void }> = ({ restartFlow }) => (
  <div className="flex flex-col gap-8 items-center">
    <h2 className="text-4xl font-medium leading-tight text-center">Thank you for your feedback!</h2>
    <StartAndRestartButton onClick={restartFlow}>Restart</StartAndRestartButton>
  </div>
);

const nameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type NameFormData = z.infer<typeof nameSchema>;

const NameStep = () => {
  const { goNext, setStepData, stepData, currentStepNumber } = useStepFlow();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      firstName: stepData?.firstName || '',
      lastName: stepData?.lastName || '',
    },
  });

  const onSubmit = useCallback(
    (data: NameFormData) => {
      setStepData({ ...stepData, ...data });
      goNext();
    },
    [setStepData, goNext, stepData],
  );

  return (
    <div className="inline-flex flex-col max-w-2xl w-full gap-8">
      <h2 className="text-[42px] flex items-center gap-2 font-medium leading-tight">
        <span className="flex items-center gap-1 text-xs text-[#F26B5C]">
          <span className="text-lg">{currentStepNumber}</span>
          <span className="text-lg">→</span>
        </span>
        First, what's your name?
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-lg">First name</label>
          <input
            type="text"
            {...register('firstName')}
            className="bg-transparent border-b-2 border-[#FFD7D1] focus:border-[#F26B5C] py-2 text-2xl outline-none transition-colors placeholder:text-[#FFD7D1]"
            placeholder="Jane"
            autoFocus
          />
          {errors.firstName && <span className="text-[#F26B5C] text-sm">{errors.firstName.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-lg">Last name</label>
          <input
            type="text"
            {...register('lastName')}
            className="bg-transparent border-b-2 border-[#FFD7D1] focus:border-[#F26B5C] py-2 text-2xl outline-none transition-colors placeholder:text-[#FFD7D1]"
            placeholder="Smith"
          />
          {errors.lastName && <span className="text-[#F26B5C] text-sm">{errors.lastName.message}</span>}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
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
      </form>
    </div>
  );
};

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

const EmailStep = () => {
  const { goNext, setStepData, stepData, restartFlow, currentStepNumber } = useStepFlow();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: stepData?.email || '',
    },
  });

  const onSubmit = useCallback(
    (data: EmailFormData) => {
      setStepData({ ...stepData, ...data });
      goNext();
    },
    [setStepData, goNext, stepData],
  );

  return (
    <div className="inline-flex flex-col max-w-2xl w-full gap-8">
      <h2 className="text-[42px] flex items-center gap-2 font-medium leading-tight">
        <span className="flex items-center gap-1 text-xs text-[#F26B5C]">
          <span className="text-lg">{currentStepNumber}</span>
          <span className="text-lg">→</span>
        </span>
        Thanks, {stepData?.firstName}. And your email?
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <input
          type="email"
          {...register('email')}
          className="bg-transparent border-b-2 border-[#FFD7D1] focus:border-[#F26B5C] py-2 text-2xl outline-none transition-colors placeholder:text-[#FFD7D1]"
          placeholder="name@example.com"
          autoFocus
        />
        {errors.email && <span className="text-[#F26B5C] text-sm">{errors.email.message}</span>}
      </form>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isValid}
          className="bg-[#F26B5C] text-white px-8 py-3 rounded-full text-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          OK
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">press</span>
          <span className="font-medium">Enter</span>
          <span className="text-xl">↵</span>
        </div>
        <div>
          <button onClick={restartFlow}>(restart)</button>
        </div>
      </div>
    </div>
  );
};

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});

type RatingFormData = z.infer<typeof ratingSchema>;

const RatingStep = () => {
  const { goNext, setStepData, stepData, currentStepNumber } = useStepFlow();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      rating: stepData?.rating || undefined,
    },
  });

  const currentRating = watch('rating');

  const onSubmit = useCallback(
    (data: RatingFormData) => {
      setStepData({ ...stepData, ...data });
      goNext();
    },
    [setStepData, goNext, stepData],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, num: number) => {
      let nextNum = num;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          nextNum = Math.max(1, num - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextNum = Math.min(5, num + 1);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          setValue('rating', num, { shouldValidate: true });
          return;
      }

      if (nextNum !== num) {
        buttonRefs.current[nextNum - 1]?.focus();
      }
    },
    [setValue],
  );

  return (
    <div className="inline-flex flex-col max-w-2xl w-full gap-8">
      <h2 className="text-[42px] flex items-center gap-2 font-medium leading-tight">
        <span className="flex items-center gap-1 text-xs text-[#F26B5C]">
          <span className="text-lg">{currentStepNumber}</span>
          <span className="text-lg">→</span>
        </span>
        Great! Now, how would you rate the design overall?
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4">
        <span className="text-gray-600 text-xl">Go with your gut.</span>

        <div className="flex gap-12 justify-center my-8" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              aria-checked={currentRating === num}
              className="group relative outline-none"
              key={num}
              onClick={() => setValue('rating', num, { shouldValidate: true })}
              onKeyDown={(e) => handleKeyDown(e, num)}
              ref={(el) => (buttonRefs.current[num - 1] = el)}
              role="radio"
              tabIndex={num === 1 || num === currentRating ? 0 : -1}
              type="button"
            >
              <div className="relative">
                <svg
                  aria-hidden="true"
                  className={`transition-colors ${
                    num <= (currentRating || 0)
                      ? 'text-[#F26B5C] fill-current'
                      : 'text-[#FFD7D1] stroke-current fill-none hover:text-[#F26B5C]'
                  } focus-visible:ring-4 focus-visible:ring-[#F26B5C] focus-visible:ring-opacity-50 rounded-full`}
                  height="48"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="48"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span
                aria-hidden="true"
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm ${
                  num <= (currentRating || 0) ? 'text-[#F26B5C]' : 'text-[#FFD7D1]'
                }`}
              >
                {num}
              </span>
            </button>
          ))}
        </div>

        {isSubmitted && errors.rating && (
          <span className="text-[#F26B5C] text-sm" role="alert">
            Please select a rating
          </span>
        )}

        <input type="hidden" {...register('rating')} />

        <div className="flex items-center gap-3">
          <button
            type="submit"
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
      </form>
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
    id: 'typeform-flow',
    children: null,
  },
  render: () => <TypeformTemplate />,
};
