"use client";

import { CheckoutStep } from './CheckoutFlow';
import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  completed: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: CheckoutStep;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = step.completed;
          const isLast = stepIdx === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-center ${!isLast ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <div className="relative flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <Circle
                      className={`w-8 h-8 ${
                        isCurrent
                          ? 'text-[#D4A574] fill-[#D4A574]'
                          : 'text-gray-300'
                      }`}
                    />
                  )}
                  {isCurrent && !isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    isCurrent
                      ? 'text-[#D4A574]'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 mx-6">
                  <div
                    className={`h-px w-full ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}