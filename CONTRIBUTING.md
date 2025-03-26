# 🤝 Contributing to @benjc/react-step-form

Thanks for your interest in contributing! This document outlines the development workflow, standards, and how to get started.

---

## 🛠 Project Setup

This project uses [pnpm](https://pnpm.io/) and requires Node.js `>=18`.

```bash
pnpm install
```

## 🔃 Local Development

### Start Storybook

To explore the library interactively:

```bash
pnpm dev
```

Open [http://localhost:6006](http://localhost:6006) to view stories and test step flows.

## 📦 Build the Library

```bash
pnpm build:lib
```

Outputs production-ready files to `dist/`.

## ✅ Linting & Formatting

We enforce strict linting and consistent formatting:

```bash
pnpm lint        # Run ESLint
pnpm prettier    # Format code using Prettier
```

These run automatically on commit via `lint-staged` and `husky`.

## 🧪 Running Tests

```bash
pnpm test       # Run unit tests
pnpm test:cov   # Run tests with coverage
```

We use [Vitest](https://vitest.dev/) for unit testing. Add tests for any logic-heavy additions or bug fixes.

## 🧱 File Structure

- `src/`: Source code
- `stories/`: Storybook demos and integration tests
- `__tests__/`: Unit tests
- `dist/`: Build output (ignored in Git)

## 🧩 Contributing a New Feature or Fix

1.  Fork the repository
2.  Create a feature branch: `git checkout -b feat/your-feature-name`
3.  Commit using clear, conventional messages
4.  Ensure lint and tests pass
5.  Push to your fork
6.  Open a pull request and describe your changes

## 💬 Commit Conventions

Follow this format:

```bash
type(scope): short summary

body (optional)
```

**Examples:**

- `fix: handle null values in session adapter`
- `feat: add goToStep API`
- `docs: clarify usage of setStepData`

## 🔍 What Can You Work On?

- 🐛 Bug fixes
- 📖 Documentation improvements
- 🧪 Tests and coverage
- ✨ New animation modes or transitions
- 🧩 New examples or adapters

## 💬 Need Help?

If you run into issues or need help understanding the codebase, feel free to open an issue or start a discussion.

Thanks again for helping improve `@benjc/react-step-form`!
