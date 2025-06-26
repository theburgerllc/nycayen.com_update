# Testing Guide for Nycayen Hair Artistry

This document provides comprehensive information about the testing strategy and implementation for the Nycayen Hair Artistry website.

## Table of Contents

1. [Overview](#overview)
2. [Testing Types](#testing-types)
3. [Getting Started](#getting-started)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Coverage Reports](#coverage-reports)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)

## Overview

Our testing strategy ensures high-quality, reliable, and accessible web application through multiple layers of testing:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test interactions between different parts of the application
- **End-to-End Tests**: Test complete user workflows across the entire application
- **Accessibility Tests**: Ensure WCAG 2.1 AA compliance
- **Performance Tests**: Validate application performance under various conditions
- **Visual Regression Tests**: Detect unintended visual changes

## Testing Types

### 🧪 Unit Testing

**Technology**: Jest + React Testing Library + TypeScript

Unit tests focus on testing individual components, hooks, and utility functions in isolation.

**Location**: `__tests__/` directories or `.test.{js,jsx,ts,tsx}` files
**Configuration**: `jest.config.js`

**Example:**
```typescript
// app/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@/tests/utils/test-utils'
import Button from '../Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 🔗 Integration Testing

**Technology**: Jest + Supertest + MSW

Integration tests verify that different parts of the application work together correctly.

**Location**: `*.integration.{js,jsx,ts,tsx}` files
**Focus**: API routes, database interactions, service integrations

**Example:**
```typescript
// app/api/__tests__/booking.integration.test.ts
import { POST } from '../booking/route'
import { createMockRequest } from '@/tests/utils/test-utils'

describe('/api/booking Integration', () => {
  it('creates a booking successfully', async () => {
    const bookingData = {
      serviceType: 'Hair Cut',
      customerEmail: 'test@example.com',
      appointmentDate: '2024-02-15T10:00:00Z'
    }

    const request = createMockRequest({ method: 'POST', body: bookingData })
    const response = await POST(request)
    
    expect(response.status).toBe(201)
    const result = await response.json()
    expect(result.booking.id).toBeTruthy()
  })
})
```

### 🎭 End-to-End Testing

**Technology**: Playwright

E2E tests simulate real user interactions across the entire application.

**Location**: `tests/e2e/`
**Configuration**: `playwright.config.ts`

**Example:**
```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test('Complete booking flow', async ({ page }) => {
  await page.goto('/')
  
  // Navigate to booking
  await page.click('[data-testid="book-appointment-cta"]')
  
  // Select service
  await page.click('[data-testid="service-hair-cut"]')
  
  // Fill booking form
  await page.fill('[name="firstName"]', 'John')
  await page.fill('[name="lastName"]', 'Doe')
  await page.fill('[name="email"]', 'john@example.com')
  
  // Submit booking
  await page.click('[data-testid="confirm-booking"]')
  
  // Verify success
  await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
})
```

### ♿ Accessibility Testing

**Technology**: Jest + jest-axe + Playwright + @axe-core/playwright

Accessibility tests ensure WCAG 2.1 AA compliance across the application.

**Location**: `*.accessibility.{js,jsx,ts,tsx}` files

**Example:**
```typescript
// app/components/__tests__/Navigation.accessibility.test.tsx
import { render } from '@/tests/utils/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Navigation from '../Navigation'

expect.extend(toHaveNoViolations)

describe('Navigation Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Navigation />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### ⚡ Performance Testing

**Technology**: Lighthouse CI + k6 + Artillery

Performance tests validate application speed, responsiveness, and resource usage.

**Load Testing**: `tests/performance/load-test.js`
**Lighthouse**: `lighthouserc.js`

**Example k6 Test:**
```javascript
// tests/performance/load-test.js
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
}

export default function () {
  const response = http.get('http://localhost:3000')
  check(response, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage loads in under 2s': (r) => r.timings.duration < 2000,
  })
}
```

### 📱 Component Testing with Storybook

**Technology**: Storybook + Storybook Test Runner

Component testing isolates UI components for development and testing.

**Location**: `*.stories.{js,jsx,ts,tsx}` files
**Configuration**: `.storybook/`

**Example:**
```typescript
// app/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nycayen.com_update
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. Set up pre-commit hooks:
```bash
npm run prepare
```

## Running Tests

### All Tests
```bash
npm test                    # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:ci            # Run tests in CI mode
```

### Specific Test Types
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests
npm run test:accessibility # Accessibility tests
npm run test:performance   # Performance tests
npm run test:visual        # Visual regression tests
npm run test:storybook     # Storybook tests
```

### Coverage
```bash
npm run test:coverage      # Generate coverage report
```

### Performance & Quality
```bash
npm run test:lighthouse    # Lighthouse performance audit
npm run test:performance   # Load testing with k6
```

### Development Tools
```bash
npm run storybook          # Start Storybook dev server
npm run test:e2e:ui        # Run E2E tests with UI
npm run test:e2e:headed    # Run E2E tests in headed mode
```

## Writing Tests

### Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Arrange
    const props = { ... }
    
    // Act
    render(<Component {...props} />)
    fireEvent.click(screen.getByRole('button'))
    
    // Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })
})
```

### Best Practices

1. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
2. **Single Responsibility**: Each test should verify one specific behavior
3. **Test User Behavior**: Focus on testing what users see and do, not implementation details
4. **Use Test IDs**: Add `data-testid` attributes for reliable element selection
5. **Mock External Dependencies**: Use mocks for API calls, external services, and complex dependencies
6. **Clean Up**: Ensure tests clean up after themselves and don't affect other tests

### Test Data Management

Use factory functions for consistent test data:

```typescript
import { UserFactory, BookingFactory } from '@/tests/utils/factories'

// Create test data
const user = UserFactory.build()
const booking = BookingFactory.build({ userId: user.id })

// Create multiple items
const users = UserFactory.buildList(5)
```

### Custom Test Utilities

Use the custom render function that includes providers:

```typescript
import { render, screen, customRender } from '@/tests/utils/test-utils'

// Use customRender for components that need providers
customRender(<ComponentThatNeedsProviders />)
```

## Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in your browser to view the detailed coverage report.

### Coverage Thresholds

The project maintains minimum coverage thresholds:
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Coverage Exclusions

The following files are excluded from coverage:
- Type definition files (`*.d.ts`)
- Test files (`*.test.*`, `*.spec.*`)
- Story files (`*.stories.*`)
- Build artifacts
- Configuration files

## Continuous Integration

### GitHub Actions

The project uses GitHub Actions for automated testing:

- **Test Suite** (`.github/workflows/test.yml`): Runs all test types
- **Coverage Report** (`.github/workflows/coverage.yml`): Generates and reports coverage

### Pre-commit Hooks

Pre-commit hooks run automatically before each commit:
- Linting and formatting
- Type checking
- Unit tests
- Test coverage validation

### Pre-push Hooks

Pre-push hooks run before pushing to remote:
- Full test suite execution

## Troubleshooting

### Common Issues

#### Tests Failing Due to Environment
```bash
# Set up test environment variables
export NODE_ENV=test
export NEXT_PUBLIC_ENVIRONMENT=test
```

#### Playwright Browser Issues
```bash
# Reinstall Playwright browsers
npx playwright install --with-deps
```

#### Memory Issues During Testing
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### Port Conflicts
```bash
# Kill processes using test ports
lsof -ti:3000 | xargs kill -9
lsof -ti:6006 | xargs kill -9
```

### Debug Mode

Run tests in debug mode:
```bash
# Jest debug mode
npm test -- --no-cache --verbose

# Playwright debug mode
npx playwright test --debug

# E2E tests with browser UI
npm run test:e2e:headed
```

### Performance Debugging

```bash
# Analyze bundle size
npm run build:analyze

# Performance profiling
npm run perf:audit
```

## Test Maintenance

### Updating Tests

1. **When adding new features**: Add corresponding tests
2. **When modifying components**: Update existing tests
3. **When changing APIs**: Update integration tests
4. **When updating dependencies**: Run full test suite

### Test Health Monitoring

- Monitor test execution time
- Address flaky tests promptly
- Maintain good test coverage
- Regular dependency updates

### Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

For questions or issues with testing, please check this documentation first, then create an issue in the project repository.