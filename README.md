# react-step-form

A headless, unstyled React component library for building animated, stateful multi-step flows. This library handles flow state and transitions — you bring your own UI.

## ✨ Features

- 🔁 Step-based flow management (forward/back/reset)
- 💾 Pluggable storage adapter system (local/session/custom)
- 🎬 Animated transitions using framer-motion
- ⚛️ Clean React context API
- 🧩 Optional welcome and completion screens
- 🪶 Zero styling or UI constraints — fully unstyled/headless

## 📦 Installation

```bash
npm install @benjc/react-step-form
```

### Required Peer Dependencies

Install these if not already present in your app:

```bash
npm install react framer-motion
```

> 💡 react-hook-form and zod are used in examples for validation, but are not required.

## 🚀 Usage

```typescript
import { StepFlowProvider } from '@benjc/react-step-form';

function MyFlow() {
  return (
    <StepFlowProvider id="my-flow">
      <StepOne />
      <StepTwo />
      <StepThree />
    </StepFlowProvider>
  );
}
```

## Optional: Welcome and Complete Screens

```typescript
<StepFlowProvider welcomeComponent={WelcomeScreen} completeComponent={CompleteScreen} id="my-flow">
  <StepOne />
  <StepTwo />
</StepFlowProvider>
```

## 🧠 API: `useStepFlow`

Use this hook to control the flow programmatically.

```
const {
  currentStep,
  currentStepNumber,
  flowStarted,
  isComplete,
  stepData,
  startFlow,
  goNext,
  goBack,
  setStepData,
  restartFlow,
} = useStepFlow();
```

Function Description

| Function        | Description                                   |
| --------------- | --------------------------------------------- |
| `startFlow()`   | Starts the flow manually                      |
| `goNext()`      | Moves to the next step                        |
| `goBack()`      | Returns to the previous step                  |
| `restartFlow()` | Clears progress and restarts the flow         |
| `setStepData()` | Merges custom data into persistent step state |

## 💾 Storage Adapter

This library uses a storage adapter abstraction. You can use localStorage, sessionStorage, cookies, or any custom implementation.

### Example: How To Create a Session Storage Adapter

```typescript
export const sessionStorageAdapter = {
  getFlowState: (id) => {
    const raw = sessionStorage.getItem(id);
    return raw ? JSON.parse(raw) : {};
  },
  setCurrentStep: (id, step) => {
    const state = sessionStorageAdapter.getFlowState(id);
    sessionStorage.setItem(id, JSON.stringify({ ...state, currentStep: step }));
  },
  setFlowStarted: (id, started) => {
    const state = sessionStorageAdapter.getFlowState(id);
    sessionStorage.setItem(id, JSON.stringify({ ...state, flowStarted: started }));
  },
  setIsComplete: (id, complete) => {
    const state = sessionStorageAdapter.getFlowState(id);
    sessionStorage.setItem(id, JSON.stringify({ ...state, isComplete: complete }));
  },
  setStepData: (id, data) => {
    const state = sessionStorageAdapter.getFlowState(id);
    sessionStorage.setItem(id, JSON.stringify({ ...state, stepData: data }));
  },
  clear: (id) => sessionStorage.removeItem(id),
};
```

Then pass in the custom storage adapter to the provider:

```typescript
<StepFlowProvider id="my-flow" storageAdapter={customStorageAdapter}>
  ...
</StepFlowProvider>
```

## Step Validation Example

You can use your preferred method of validation for each step. Here is an example using `react-hook-form` and `zod`.

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
});

export const EmailStep = () => {
  const { goNext, setStepData, stepData } = useStepFlow();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: stepData.email || '' },
  });

  const onSubmit = (data) => {
    setStepData({ ...stepData, ...data });
    goNext();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <button type="submit">Next</button>
    </form>
  );
};
```
