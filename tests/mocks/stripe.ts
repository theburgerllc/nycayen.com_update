import { jest } from '@jest/globals';
import React from 'react';

interface MockStripeElement {
  mount: jest.Mock;
  unmount: jest.Mock;
  destroy: jest.Mock;
  on: jest.Mock;
  off: jest.Mock;
  update: jest.Mock;
  blur?: jest.Mock;
  clear?: jest.Mock;
  focus?: jest.Mock;
}

const mockStripe = {
  confirmCardPayment: jest.fn(),
  confirmSetupIntent: jest.fn(),
  createToken: jest.fn(),
  createSource: jest.fn(),
  retrieveSource: jest.fn(),
  createPaymentMethod: jest.fn(),
  retrievePaymentIntent: jest.fn(),
  retrieveSetupIntent: jest.fn(),
  elements: jest.fn(),
  redirectToCheckout: jest.fn(),
};

const mockElements = {
  create: jest.fn().mockReturnValue({
    mount: jest.fn(),
    unmount: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    update: jest.fn(),
  }),
  getElement: jest.fn(),
};

const mockCardElement: MockStripeElement = {
  mount: jest.fn(),
  unmount: jest.fn(),
  destroy: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  update: jest.fn(),
  blur: jest.fn(),
  clear: jest.fn(),
  focus: jest.fn(),
};

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue(mockStripe),
  Stripe: jest.fn().mockImplementation(() => mockStripe),
}));

const MockElements: React.FC<{ children: React.ReactNode }> = ({ children }) => 
  React.createElement('div', { 'data-testid': 'stripe-elements' }, children);

const MockCardElement: React.FC<any> = (props) => 
  React.createElement('div', { 'data-testid': 'card-element', ...props });

const MockCardNumberElement: React.FC<any> = (props) => 
  React.createElement('input', { 'data-testid': 'card-number', ...props });

const MockCardExpiryElement: React.FC<any> = (props) => 
  React.createElement('input', { 'data-testid': 'card-expiry', ...props });

const MockCardCvcElement: React.FC<any> = (props) => 
  React.createElement('input', { 'data-testid': 'card-cvc', ...props });

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: MockElements,
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  CardElement: MockCardElement,
  CardNumberElement: MockCardNumberElement,
  CardExpiryElement: MockCardExpiryElement,
  CardCvcElement: MockCardCvcElement,
}));

export { mockStripe, mockElements, mockCardElement };