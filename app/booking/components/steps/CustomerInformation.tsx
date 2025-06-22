"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, User, Mail, Phone, MessageSquare, Shield, Star } from 'lucide-react';
import { useBookingState } from '../../hooks/useBookingState';
import { CustomerInfo, customerInfoSchema } from '../../types';

export default function CustomerInformation() {
  const { state, updateState, nextStep, prevStep } = useBookingState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CustomerInfo>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: state.customerInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
      preferredCommunication: 'email',
      termsAccepted: false,
      marketingConsent: false,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const onSubmit = async (data: CustomerInfo) => {
    setIsSubmitting(true);
    
    // Simulate form processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateState({ customerInfo: data });
    nextStep();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair text-white mb-2">Your Information</h2>
        <p className="text-gray-300">Please provide your details to complete the booking</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <User className="text-amber-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Personal Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className={`
                      w-full px-4 py-3 bg-gray-800/50 border rounded-lg transition-colors
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      ${errors.firstName 
                        ? 'border-red-500 text-red-300' 
                        : 'border-gray-600 text-white hover:border-gray-500'
                      }
                    `}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    className={`
                      w-full px-4 py-3 bg-gray-800/50 border rounded-lg transition-colors
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      ${errors.lastName 
                        ? 'border-red-500 text-red-300' 
                        : 'border-gray-600 text-white hover:border-gray-500'
                      }
                    `}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`
                      w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-lg transition-colors
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      ${errors.email 
                        ? 'border-red-500 text-red-300' 
                        : 'border-gray-600 text-white hover:border-gray-500'
                      }
                    `}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    className={`
                      w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-lg transition-colors
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                      ${errors.phone 
                        ? 'border-red-500 text-red-300' 
                        : 'border-gray-600 text-white hover:border-gray-500'
                      }
                    `}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Communication Preferences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="text-amber-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Communication</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Preferred Contact Method *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'phone', label: 'Phone Call', icon: Phone },
                    { value: 'sms', label: 'Text Message', icon: MessageSquare },
                  ].map(({ value, label, icon: Icon }) => (
                    <label key={value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        {...register('preferredCommunication')}
                        type="radio"
                        value={value}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded-full border-2 transition-colors
                        ${watchedValues.preferredCommunication === value
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-gray-500'
                        }
                      `}>
                        {watchedValues.preferredCommunication === value && (
                          <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                        )}
                      </div>
                      <Icon size={16} className="text-gray-400" />
                      <span className="text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-300 mb-2">
                  Special Requests or Notes
                </label>
                <textarea
                  {...register('specialRequests')}
                  id="specialRequests"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white hover:border-gray-500 resize-none"
                  placeholder="Any allergies, specific requests, or additional information..."
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Terms and Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-amber-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Terms & Privacy</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                {...register('termsAccepted')}
                type="checkbox"
                className="sr-only"
              />
              <div className={`
                w-5 h-5 mt-0.5 border-2 rounded transition-colors flex items-center justify-center
                ${watchedValues.termsAccepted
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-gray-500'
                }
              `}>
                {watchedValues.termsAccepted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="text-sm">
                <span className="text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-amber-400 hover:text-amber-300 underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" className="text-amber-400 hover:text-amber-300 underline">
                    Privacy Policy
                  </a>
                  {' '}*
                </span>
              </div>
            </label>
            {errors.termsAccepted && (
              <p className="text-sm text-red-400 ml-8">{errors.termsAccepted.message}</p>
            )}

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                {...register('marketingConsent')}
                type="checkbox"
                className="sr-only"
              />
              <div className={`
                w-5 h-5 mt-0.5 border-2 rounded transition-colors flex items-center justify-center
                ${watchedValues.marketingConsent
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-gray-500'
                }
              `}>
                {watchedValues.marketingConsent && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    I would like to receive promotional emails and beauty tips (optional)
                  </span>
                </div>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Form Summary */}
        {watchedValues.firstName && watchedValues.email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Name:</span>
                <div className="text-white font-medium">
                  {watchedValues.firstName} {watchedValues.lastName}
                </div>
              </div>
              <div>
                <span className="text-gray-300">Contact:</span>
                <div className="text-white font-medium">{watchedValues.email}</div>
              </div>
              <div>
                <span className="text-gray-300">Phone:</span>
                <div className="text-white font-medium">{watchedValues.phone || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-gray-300">Preferred Contact:</span>
                <div className="text-white font-medium capitalize">
                  {watchedValues.preferredCommunication?.replace('sms', 'Text Message')}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Date & Time
          </button>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300
              ${isValid && !isSubmitting
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Add-ons
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}