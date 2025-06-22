"use client";
import { useState, useEffect } from 'react';
import { BookingState, BookingStep } from '../types';

const STORAGE_KEY = 'nycayen-booking-state';

const initialState: BookingState = {
  currentStep: 'services',
  selectedServices: [],
  selectedAddOns: [],
  totalPrice: 0,
  estimatedDuration: 0,
};

export function useBookingState() {
  const [state, setState] = useState<BookingState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          setState({
            ...parsedState,
            selectedDate: parsedState.selectedDate ? new Date(parsedState.selectedDate) : undefined,
          });
        } catch (error) {
          console.warn('Failed to parse saved booking state:', error);
        }
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateState = (updates: Partial<BookingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setStep = (step: BookingStep) => {
    updateState({ currentStep: step });
  };

  const nextStep = () => {
    const steps: BookingStep[] = ['services', 'datetime', 'customer', 'addons', 'payment'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: BookingStep[] = ['services', 'datetime', 'customer', 'addons', 'payment'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const resetBooking = () => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const calculateTotals = (services: string[], addOns: string[], packageId?: string) => {
    // This would integrate with your service/pricing data
    // For now, return mock calculations
    const basePrice = services.length * 100;
    const addOnPrice = addOns.length * 25;
    const packageDiscount = packageId ? 20 : 0;
    
    return {
      totalPrice: basePrice + addOnPrice - packageDiscount,
      estimatedDuration: services.length * 60 + addOns.length * 30,
    };
  };

  return {
    state,
    updateState,
    setStep,
    nextStep,
    prevStep,
    resetBooking,
    calculateTotals,
  };
}