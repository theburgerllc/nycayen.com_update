# Testing Quick Reference

## 🚀 Quick Commands

### Development Testing
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:ci            # Run tests in CI mode (no watch)
```

### Specific Test Types
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:accessibility # Accessibility tests
npm run test:performance   # Performance/load tests
npm run test:visual        # Visual regression tests
npm run test:storybook     # Component tests via Storybook
```

### Performance & Quality
```bash
npm run test:lighthouse    # Lighthouse performance audit
npm run lint               # Code linting
npm run type-check         # TypeScript type checking
```

### Development Tools
```bash
npm run storybook          # Start Storybook (http://localhost:6006)
npm run test:e2e:ui        # E2E tests with Playwright UI
npm run test:e2e:headed    # E2E tests in browser (non-headless)
```

## 📁 File Structure

```
tests/
├── e2e/                   # End-to-end tests
│   ├── critical-journeys.spec.ts
│   └── accessibility.spec.ts
├── performance/           # Performance tests
│   └── load-test.js
├── utils/                 # Test utilities
│   ├── test-utils.tsx     # Custom render functions
│   └── factories.ts       # Test data factories
├── mocks/                 # Mock implementations
│   ├── stripe.ts
│   └── analytics.ts
└── setup/                 # Global test setup
    ├── global-setup.js
    └── global-teardown.js

app/
├── components/
│   ├── __tests__/         # Component tests
│   └── *.stories.tsx      # Storybook stories
└── **/__tests__/          # Feature-specific tests
```

## 🧪 Common Test Patterns

### Unit Test Template
```typescript
import { render, screen, fireEvent } from '@/tests/utils/test-utils'
import Component from '../Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })
})
```

### Integration Test Template
```typescript
import { createMockRequest } from '@/tests/utils/test-utils'
import { POST } from '../route'

describe('API Route', () => {
  it('should handle request', async () => {
    const request = createMockRequest({ method: 'POST', body: {} })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test('user workflow', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="button"]')
  await expect(page.locator('[data-testid="result"]')).toBeVisible()
})
```

### Accessibility Test Template
```typescript
import { render } from '@/tests/utils/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should be accessible', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## 🎯 Test Data Creation

### Using Factories
```typescript
import { UserFactory, BookingFactory } from '@/tests/utils/factories'

// Single item
const user = UserFactory.build()

// Multiple items
const users = UserFactory.buildList(5)

// With overrides
const user = UserFactory.build({ email: 'specific@email.com' })

// Complex scenarios
const { user, service, booking } = TestDataBuilder.createBookingFlow()
```

### Mock Data
```typescript
import { mockStripe, mockAnalytics } from '@/tests/mocks'

// Use mocks in tests
jest.mock('@stripe/stripe-js', () => mockStripe)
```

## 🔍 Debugging Tests

### Debug Commands
```bash
# Jest with debugging
npm test -- --no-cache --verbose

# Single test file
npm test -- Button.test.tsx

# Specific test
npm test -- --testNamePattern="should render"

# Playwright debug
npx playwright test --debug

# Playwright with UI
npm run test:e2e:ui
```

### Debug Environment
```typescript
// In test files
console.log(screen.debug()) // Print DOM
screen.logTestingPlaygroundURL() // Testing playground URL

// Environment variables
process.env.DEBUG = 'true'
process.env.NODE_ENV = 'test'
```

## 📊 Coverage Commands

```bash
# Generate coverage
npm run test:coverage

# View coverage (after running coverage)
open coverage/lcov-report/index.html

# Coverage thresholds
# Lines: 70% | Functions: 70% | Branches: 70% | Statements: 70%
```

## 🚨 Troubleshooting

### Common Fixes
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall Playwright browsers
npx playwright install --with-deps

# Kill processes on test ports
lsof -ti:3000 | xargs kill -9
lsof -ti:6006 | xargs kill -9

# Fix memory issues
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Test Environment Issues
```bash
# Set test environment
export NODE_ENV=test
export NEXT_PUBLIC_ENVIRONMENT=test

# Reset git hooks
npm run prepare
```

## 🔄 CI/CD Integration

### GitHub Actions Triggers
- **Push to main/develop**: Full test suite
- **Pull Request**: Full test suite + coverage report
- **Manual**: Individual test workflows

### Pre-commit Hooks
- Lint staged files
- Type check
- Run related tests
- Check coverage

### Pre-push Hooks
- Full test suite
- Coverage validation

## 📝 Writing Guidelines

### Test Naming
- **Descriptive**: `should render submit button when form is valid`
- **Behavior-focused**: `should call onSubmit when form is submitted`
- **User-centric**: `should show error message when email is invalid`

### Best Practices
- Test user behavior, not implementation
- Use `data-testid` for reliable selectors
- Mock external dependencies
- Keep tests isolated and independent
- Follow AAA pattern (Arrange, Act, Assert)

## 🔗 Useful Links

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)
- [Storybook Docs](https://storybook.js.org/docs/react/get-started/introduction)
- [Testing Playground](https://testing-playground.com/)