"use client";
import { BookingStep } from '../types';
import { Check, Calendar, User, ShoppingBag, CreditCard, Scissors } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
}

const steps = [
  { key: 'services' as const, label: 'Services', icon: Scissors },
  { key: 'datetime' as const, label: 'Date & Time', icon: Calendar },
  { key: 'customer' as const, label: 'Your Info', icon: User },
  { key: 'addons' as const, label: 'Add-ons', icon: ShoppingBag },
  { key: 'payment' as const, label: 'Payment', icon: CreditCard },
];

export default function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
  const currentIndex = getCurrentStepIndex();

  return (
    <nav aria-label="Booking progress" className="w-full">
      <div className="flex items-center justify-between mb-4" role="tablist">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = index < currentIndex;
          const isClickable = index <= currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick(step.key as BookingStep)}
                disabled={!isClickable}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${step.key}`}
                aria-label={`${step.label} step ${index + 1} of ${steps.length}${isCompleted ? ' - completed' : isActive ? ' - current' : ''}`}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200
                  ${isActive 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <Icon size={20} />
                )}
              </button>
              <span className={`
                text-sm font-medium text-center
                ${isActive ? 'text-amber-400' : isCompleted ? 'text-green-400' : 'text-gray-400'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8" role="progressbar" aria-label="Booking progress">
        <div 
          className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Step ${currentIndex + 1} of ${steps.length}`}
        />
      </div>
    </nav>
  );
}