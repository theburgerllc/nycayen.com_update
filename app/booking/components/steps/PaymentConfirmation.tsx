"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone,
  MapPin,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useBookingState } from '../../hooks/useBookingState';
import { services, addOns } from '../../data/services';
import { PaymentInfo, paymentSchema, BookingConfirmation } from '../../types';

export default function PaymentConfirmation() {
  const { state, prevStep, resetBooking } = useBookingState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationData, setConfirmationData] = useState<BookingConfirmation | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'deposit'>('card');

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<PaymentInfo>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'card',
      savePaymentMethod: false,
    },
    mode: 'onChange',
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSelectedServices = () => {
    return state.selectedServices.map(serviceId => 
      services.find(s => s.id === serviceId)
    ).filter(Boolean);
  };

  const getSelectedAddOns = () => {
    return state.selectedAddOns.map(addOnId => 
      addOns.find(a => a.id === addOnId)
    ).filter(Boolean);
  };

  const depositAmount = Math.ceil(state.totalPrice * 0.3); // 30% deposit
  const remainingAmount = state.totalPrice - depositAmount;

  const onSubmit = async (data: PaymentInfo) => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful booking creation
      const confirmation: BookingConfirmation = {
        bookingId: `NYC${Date.now()}`,
        confirmationNumber: `CNF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'confirmed',
        paymentStatus: data.paymentMethod === 'deposit' ? 'pending' : 'paid',
        emailSent: true,
        smsSent: state.customerInfo?.preferredCommunication === 'sms',
      };

      setConfirmationData(confirmation);
      setBookingConfirmed(true);

      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: confirmation.bookingId,
          value: state.totalPrice,
          currency: 'USD',
          items: getSelectedServices().map(service => ({
            item_id: service?.id,
            item_name: service?.title,
            category: service?.category,
            quantity: 1,
            price: service?.price,
          })),
        });
      }

    } catch (error) {
      console.error('Payment processing failed:', error);
      // Handle error state
    } finally {
      setIsProcessing(false);
    }
  };

  if (bookingConfirmed && confirmationData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        <div className="glass rounded-xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="text-white" size={40} />
          </motion.div>

          <h2 className="text-3xl font-playfair text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-300 mb-6">
            Your appointment has been successfully booked. We've sent confirmation details to your email.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Booking ID</div>
              <div className="text-white font-mono">{confirmationData.bookingId}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Confirmation Number</div>
              <div className="text-white font-mono">{confirmationData.confirmationNumber}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Status</div>
              <div className="text-green-400 capitalize">{confirmationData.status}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Payment</div>
              <div className="text-amber-400 capitalize">{confirmationData.paymentStatus}</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">What's Next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
              <span className="text-gray-300">Confirmation email sent to {state.customerInfo?.email}</span>
            </div>
            {confirmationData.smsSent && (
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                <span className="text-gray-300">SMS reminder sent to {state.customerInfo?.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="text-amber-400 flex-shrink-0" size={20} />
              <span className="text-gray-300">Calendar invite will be sent 24 hours before your appointment</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-amber-400 flex-shrink-0" size={20} />
              <span className="text-gray-300">We'll call to confirm your appointment details</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 rounded-full transition-colors"
          >
            Print Receipt
          </button>
          <button
            onClick={resetBooking}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full font-semibold transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair text-white mb-2">Review & Payment</h2>
        <p className="text-gray-300">Please review your booking details and complete payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Appointment Details */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="text-amber-400" size={20} />
              Appointment Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Date:</span>
                <span className="text-white font-medium">
                  {state.selectedDate ? formatDate(state.selectedDate) : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Time:</span>
                <span className="text-white font-medium">
                  {state.selectedTime ? formatTime(state.selectedTime) : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Duration:</span>
                <span className="text-white font-medium">~{Math.round(state.estimatedDuration / 60)} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Stylist:</span>
                <span className="text-white font-medium">Nycayen Moore</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="text-amber-400" size={20} />
              Customer Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-400" />
                <span className="text-white">
                  {state.customerInfo?.firstName} {state.customerInfo?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-white">{state.customerInfo?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-white">{state.customerInfo?.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-white">Manhattan Studio, NYC</span>
              </div>
            </div>
          </div>

          {/* Services Summary */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-400" size={20} />
              Services & Add-ons
            </h3>
            
            <div className="space-y-3">
              {getSelectedServices().map(service => (
                <div key={service?.id} className="flex justify-between items-center">
                  <div>
                    <span className="text-white">{service?.title}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={12} />
                      {service?.duration}min
                    </div>
                  </div>
                  <span className="text-amber-400 font-semibold">${service?.price}</span>
                </div>
              ))}

              {getSelectedAddOns().length > 0 && (
                <>
                  <hr className="border-gray-600" />
                  <div className="text-gray-300 font-medium">Add-ons:</div>
                  {getSelectedAddOns().map(addOn => (
                    <div key={addOn?.id} className="flex justify-between items-center pl-4">
                      <div>
                        <span className="text-white">{addOn?.title}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock size={12} />
                          {addOn?.duration}min
                        </div>
                      </div>
                      <span className="text-amber-400 font-semibold">${addOn?.price}</span>
                    </div>
                  ))}
                </>
              )}

              <hr className="border-gray-600" />
              <div className="flex justify-between items-center text-lg">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-amber-400 font-bold">${state.totalPrice}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="text-amber-400" size={20} />
                Payment Method
              </h3>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="card"
                    className="sr-only"
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div className={`
                    w-5 h-5 mt-0.5 border-2 rounded-full transition-colors flex items-center justify-center
                    ${paymentMethod === 'card' ? 'border-amber-500 bg-amber-500' : 'border-gray-500'}
                  `}>
                    {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={20} className="text-gray-400" />
                      <span className="text-white font-medium">Pay Full Amount</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Pay the complete amount of <span className="text-amber-400 font-semibold">${state.totalPrice}</span> now
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="deposit"
                    className="sr-only"
                    onChange={() => setPaymentMethod('deposit')}
                  />
                  <div className={`
                    w-5 h-5 mt-0.5 border-2 rounded-full transition-colors flex items-center justify-center
                    ${paymentMethod === 'deposit' ? 'border-amber-500 bg-amber-500' : 'border-gray-500'}
                  `}>
                    {paymentMethod === 'deposit' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-gray-400" />
                      <span className="text-white font-medium">Pay Deposit</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Pay <span className="text-amber-400 font-semibold">${depositAmount}</span> now, 
                      remaining <span className="text-gray-300">${remainingAmount}</span> at appointment
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Stripe Payment Form Placeholder */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="text-amber-400" size={20} />
                Payment Details
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    <CreditCard size={20} />
                    <span>Stripe Payment Form</span>
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-2">
                    Secure payment processing powered by Stripe
                  </p>
                  <p className="text-center text-gray-500 text-xs mt-2">
                    (Integration requires Stripe keys - demo placeholder)
                  </p>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    {...register('savePaymentMethod')}
                    type="checkbox"
                    className="sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">Save payment method for future bookings</span>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="glass rounded-xl p-4">
              <div className="text-center text-sm text-gray-300">
                <p className="mb-2">
                  By completing this booking, you agree to our cancellation policy.
                </p>
                <p className="text-xs text-gray-400">
                  Cancellations must be made at least 24 hours in advance.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isProcessing}
              className={`
                w-full py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2
                ${isValid && !isProcessing
                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  Complete Booking
                  <span className="text-2xl font-bold">
                    ${paymentMethod === 'deposit' ? depositAmount : state.totalPrice}
                  </span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-6">
        <button
          onClick={prevStep}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={20} />
          Back to Add-ons
        </button>
      </div>
    </div>
  );
}