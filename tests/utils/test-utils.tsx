import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AnalyticsProvider } from '@/app/components/AnalyticsProvider'

// Mock providers for testing
const MockAnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="mock-analytics-provider">
      {children}
    </div>
  )
}

// All the providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockAnalyticsProvider>
      {children}
    </MockAnalyticsProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data generators
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  ...overrides,
})

export const createMockBooking = (overrides = {}) => ({
  id: 'booking-123',
  userId: 'user-123',
  serviceType: 'Hair Cut',
  serviceCategory: 'Styling',
  appointmentDate: '2024-02-15T10:00:00Z',
  duration: 90,
  price: 150,
  status: 'confirmed',
  createdAt: '2024-01-15T09:00:00Z',
  ...overrides,
})

export const createMockService = (overrides = {}) => ({
  id: 'service-123',
  name: 'Premium Hair Cut',
  category: 'Styling',
  description: 'Professional hair cutting service',
  price: 150,
  duration: 90,
  available: true,
  ...overrides,
})

export const createMockProduct = (overrides = {}) => ({
  id: 'product-123',
  name: 'Premium Shampoo',
  category: 'Hair Care',
  description: 'Professional grade shampoo',
  price: 42.99,
  inStock: true,
  images: ['/images/shampoo.jpg'],
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: 'order-123',
  userId: 'user-123',
  items: [
    {
      productId: 'product-123',
      quantity: 2,
      price: 42.99,
      totalPrice: 85.98,
    },
  ],
  subtotal: 85.98,
  tax: 6.88,
  shipping: 10.00,
  total: 102.86,
  status: 'pending',
  paymentStatus: 'pending',
  createdAt: '2024-01-15T09:00:00Z',
  ...overrides,
})

export const createMockBlogPost = (overrides = {}) => ({
  id: 'post-123',
  slug: 'hair-care-tips',
  title: 'Essential Hair Care Tips',
  excerpt: 'Learn the best practices for healthy hair',
  content: 'Lorem ipsum dolor sit amet...',
  category: 'Hair Care',
  tags: ['tips', 'care', 'health'],
  author: 'Nycayen Moore',
  publishedAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-15T09:00:00Z',
  featured: false,
  ...overrides,
})

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: expect.objectContaining({
    toBeInTheDocument: expect.any(Function),
  }),
  toHaveClass: expect.objectContaining({
    toHaveClass: expect.any(Function),
  }),
  toHaveAttribute: expect.objectContaining({
    toHaveAttribute: expect.any(Function),
  }),
}

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response)
}

export const mockFetchError = (status = 500, message = 'Internal Server Error') => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
  } as Response)
}

// Form testing helpers
export const fillForm = async (container: HTMLElement, formData: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react')
  
  Object.entries(formData).forEach(([name, value]) => {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      fireEvent.change(input, { target: { value } })
    }
  })
}

export const submitForm = async (container: HTMLElement) => {
  const { fireEvent } = await import('@testing-library/react')
  const form = container.querySelector('form')
  if (form) {
    fireEvent.submit(form)
  }
}

// Accessibility testing helpers
export const runAccessibilityTests = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe')
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Performance testing helpers
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now()
  await fn()
  const end = performance.now()
  return end - start
}

// URL and navigation helpers
export const mockNavigate = () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockBack = jest.fn()
  
  return {
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }
}

// Local storage helpers
export const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

export const clearLocalStorage = () => {
  localStorage.clear()
}

// Session storage helpers
export const setSessionStorage = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export const getSessionStorage = (key: string) => {
  const item = sessionStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

export const clearSessionStorage = () => {
  sessionStorage.clear()
}

// Timer helpers
export const advanceTimers = (ms: number) => {
  jest.advanceTimersByTime(ms)
}

export const runAllTimers = () => {
  jest.runAllTimers()
}

// Network helpers
export const mockNetworkDelay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Error boundary testing
export const throwError = () => {
  throw new Error('Test error')
}

// Component wrapper for error testing
export const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>
  } catch (error) {
    return <div data-testid="error-boundary">Something went wrong</div>
  }
}

// Viewport helpers
export const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
}

// Media query helpers
export const setMatchMedia = (query: string, matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(q => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Animation helpers
export const waitForAnimation = (ms = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// File upload helpers
export const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

export const createMockFileList = (files: File[]) => {
  const fileList = {
    ...files,
    length: files.length,
    item: (index: number) => files[index] || null,
  }
  return fileList as FileList
}