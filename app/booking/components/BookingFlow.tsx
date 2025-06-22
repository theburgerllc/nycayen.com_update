"use client";
import { useBookingState } from '../hooks/useBookingState';
import ProgressIndicator from './ProgressIndicator';
import ServiceSelection from './steps/ServiceSelection';
import DateTimeSelection from './steps/DateTimeSelection';
import CustomerInformation from './steps/CustomerInformation';
import AddOnsSelection from './steps/AddOnsSelection';
import PaymentConfirmation from './steps/PaymentConfirmation';
import ErrorBoundary from './ErrorBoundary';

export default function BookingFlow() {
  const { state, setStep } = useBookingState();

  const renderStep = () => {
    switch (state.currentStep) {
      case 'services':
        return <ServiceSelection />;
      case 'datetime':
        return <DateTimeSelection />;
      case 'customer':
        return <CustomerInformation />;
      case 'addons':
        return <AddOnsSelection />;
      case 'payment':
        return <PaymentConfirmation />;
      default:
        return <ServiceSelection />;
    }
  };

  return (
    <ErrorBoundary>
      {/* Skip Navigation Links */}
      <a 
        href="#booking-content" 
        className="skip-link"
        tabIndex={0}
      >
        Skip to booking form
      </a>
      
      <div className="container mx-auto px-6 py-8" role="main">
        <div className="max-w-4xl mx-auto" id="booking-content">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-playfair text-white mb-2">
              Book Your Appointment
            </h1>
            <p className="text-gray-300">
              Experience luxury hair artistry with Nycayen Moore
            </p>
          </div>

          <ProgressIndicator 
            currentStep={state.currentStep} 
            onStepClick={setStep}
          />

          <div className="mt-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}