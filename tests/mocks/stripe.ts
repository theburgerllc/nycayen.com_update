// Mock Stripe for testing
export const mockStripe = {
  createPaymentMethod: jest.fn().mockResolvedValue({
    paymentMethod: {
      id: 'pm_test_123',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
      },
    },
  }),
  
  confirmCardPayment: jest.fn().mockResolvedValue({
    paymentIntent: {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 15000, // $150.00
      currency: 'usd',
    },
  }),
  
  retrievePaymentIntent: jest.fn().mockResolvedValue({
    paymentIntent: {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 15000,
      currency: 'usd',
      metadata: {
        booking_id: 'booking-123',
        service_type: 'Hair Cut',
      },
    },
  }),
  
  createPaymentIntent: jest.fn().mockResolvedValue({
    client_secret: 'pi_test_123_secret_test',
  }),
}

// Mock Stripe Elements
export const mockElements = {
  create: jest.fn().mockReturnValue({
    mount: jest.fn(),
    unmount: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    update: jest.fn(),
  }),
  
  getElement: jest.fn().mockReturnValue({
    mount: jest.fn(),
    unmount: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    update: jest.fn(),
  }),
}

// Mock loadStripe
export const mockLoadStripe = jest.fn().mockResolvedValue(mockStripe)

// Stripe webhook event mocks
export const createMockWebhookEvent = (type: string, data: any) => ({
  id: 'evt_test_123',
  object: 'event',
  api_version: '2020-08-27',
  created: Date.now(),
  data: {
    object: data,
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_123',
    idempotency_key: null,
  },
  type,
})

export const mockPaymentIntentSucceeded = createMockWebhookEvent(
  'payment_intent.succeeded',
  {
    id: 'pi_test_123',
    object: 'payment_intent',
    amount: 15000,
    currency: 'usd',
    status: 'succeeded',
    metadata: {
      booking_id: 'booking-123',
      service_type: 'Hair Cut',
    },
  }
)

export const mockPaymentIntentFailed = createMockWebhookEvent(
  'payment_intent.payment_failed',
  {
    id: 'pi_test_123',
    object: 'payment_intent',
    amount: 15000,
    currency: 'usd',
    status: 'requires_payment_method',
    last_payment_error: {
      code: 'card_declined',
      message: 'Your card was declined.',
    },
    metadata: {
      booking_id: 'booking-123',
      service_type: 'Hair Cut',
    },
  }
)

// Stripe API error mocks
export const mockStripeError = (type: string, message: string) => ({
  type,
  message,
  code: type,
  decline_code: type === 'card_error' ? 'generic_decline' : undefined,
  payment_intent: {
    id: 'pi_test_123',
    status: 'requires_payment_method',
  },
})

// Mock Stripe constructors
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: mockLoadStripe,
}))

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  CardElement: (props: any) => (
    <div data-testid="card-element" {...props} />
  ),
  CardNumberElement: (props: any) => (
    <input data-testid="card-number" {...props} />
  ),
  CardExpiryElement: (props: any) => (
    <input data-testid="card-expiry" {...props} />
  ),
  CardCvcElement: (props: any) => (
    <input data-testid="card-cvc" {...props} />
  ),
}))

// Server-side Stripe mock for API routes
export const mockServerStripe = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret_test',
      amount: 15000,
      currency: 'usd',
      status: 'requires_payment_method',
    }),
    
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 15000,
      currency: 'usd',
      metadata: {
        booking_id: 'booking-123',
      },
    }),
    
    update: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      metadata: {
        booking_id: 'booking-123',
        updated: 'true',
      },
    }),
  },
  
  webhooks: {
    constructEvent: jest.fn().mockReturnValue(mockPaymentIntentSucceeded),
  },
  
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_test_123',
      email: 'test@example.com',
      name: 'Test Customer',
    }),
    
    retrieve: jest.fn().mockResolvedValue({
      id: 'cus_test_123',
      email: 'test@example.com',
      name: 'Test Customer',
    }),
  },
}

// Helper functions for testing Stripe flows
export const simulateSuccessfulPayment = async () => {
  mockStripe.confirmCardPayment.mockResolvedValueOnce({
    paymentIntent: {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 15000,
      currency: 'usd',
    },
  })
}

export const simulateFailedPayment = async (errorCode = 'card_declined') => {
  mockStripe.confirmCardPayment.mockRejectedValueOnce(
    mockStripeError('card_error', 'Your card was declined.')
  )
}

export const simulateNetworkError = async () => {
  mockStripe.confirmCardPayment.mockRejectedValueOnce(
    new Error('Network error')
  )
}

// Reset all Stripe mocks
export const resetStripeMocks = () => {
  Object.values(mockStripe).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
  
  Object.values(mockElements).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
  
  mockLoadStripe.mockClear()
}