"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckoutData } from '../../shop/types';
import { Mail, Phone, User, MapPin, Globe } from 'lucide-react';

const customerInfoSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional(),
  }),
  sameAsShipping: z.boolean().optional().default(true),
  billingAddress: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  createAccount: z.boolean().optional().default(false),
  password: z.string().optional(),
  subscribeToNewsletter: z.boolean().optional().default(false),
});

type CustomerInfoForm = z.infer<typeof customerInfoSchema>;

interface CustomerInformationProps {
  data: Partial<CheckoutData>;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  errors: { [key: string]: string };
  onError: (field: string, message: string) => void;
  onClearError: (field: string) => void;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export function CustomerInformation({
  data,
  onUpdate,
  onNext,
  errors,
  onError,
  onClearError,
}: CustomerInformationProps) {
  const [showBillingAddress, setShowBillingAddress] = useState(!data.sameAsShipping);
  const [createAccount, setCreateAccount] = useState(data.createAccount || false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors, isValid },
  } = useForm<CustomerInfoForm>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      email: data.email || '',
      phone: data.phone || '',
      shippingAddress: {
        firstName: data.shippingAddress?.firstName || '',
        lastName: data.shippingAddress?.lastName || '',
        company: data.shippingAddress?.company || '',
        address1: data.shippingAddress?.address1 || '',
        address2: data.shippingAddress?.address2 || '',
        city: data.shippingAddress?.city || '',
        state: data.shippingAddress?.state || '',
        zipCode: data.shippingAddress?.zipCode || '',
        country: data.shippingAddress?.country || 'US',
        phone: data.shippingAddress?.phone || '',
      },
      sameAsShipping: data.sameAsShipping ?? true,
      billingAddress: data.billingAddress || {},
      createAccount: data.createAccount || false,
      subscribeToNewsletter: data.subscribeToNewsletter || false,
    },
    mode: 'onChange',
  });

  const watchSameAsShipping = watch('sameAsShipping');
  const watchCreateAccount = watch('createAccount');

  const onSubmit = async (formData: CustomerInfoForm) => {
    try {
      // Validate email uniqueness if creating account
      if (formData.createAccount && formData.email) {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        
        if (!response.ok) {
          const { error } = await response.json();
          onError('email', error || 'Email validation failed');
          return;
        }
      }

      onUpdate(formData);
      onNext();
    } catch (error) {
      onError('form', 'Failed to validate information. Please try again.');
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setValue('sameAsShipping', checked);
    setShowBillingAddress(!checked);
    if (checked) {
      setValue('billingAddress', {});
    }
  };

  const handleCreateAccountChange = (checked: boolean) => {
    setValue('createAccount', checked);
    setCreateAccount(checked);
    if (!checked) {
      setValue('password', '');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                placeholder="your@email.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email.message}</p>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('shippingAddress.firstName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                />
                {formErrors.shippingAddress?.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.shippingAddress.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('shippingAddress.lastName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                />
                {formErrors.shippingAddress?.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.shippingAddress.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                {...register('shippingAddress.company')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                {...register('shippingAddress.address1')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                placeholder="Street address"
              />
              {formErrors.shippingAddress?.address1 && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.shippingAddress.address1.message}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, suite, etc. (Optional)
              </label>
              <input
                type="text"
                {...register('shippingAddress.address2')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  {...register('shippingAddress.city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                />
                {formErrors.shippingAddress?.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.shippingAddress.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  {...register('shippingAddress.state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {formErrors.shippingAddress?.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.shippingAddress.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  {...register('shippingAddress.zipCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                />
                {formErrors.shippingAddress?.zipCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.shippingAddress.zipCode.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Country *
              </label>
              <select
                {...register('shippingAddress.country')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>

          {/* Billing Address Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sameAsShipping"
              checked={watchSameAsShipping}
              onChange={(e) => handleSameAsShippingChange(e.target.checked)}
              className="h-4 w-4 text-[#D4A574] focus:ring-[#D4A574] border-gray-300 rounded"
            />
            <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
              Billing address is the same as shipping address
            </label>
          </div>

          {/* Account Creation */}
          <div className="border-t pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="createAccount"
                checked={watchCreateAccount}
                onChange={(e) => handleCreateAccountChange(e.target.checked)}
                className="h-4 w-4 text-[#D4A574] focus:ring-[#D4A574] border-gray-300 rounded"
              />
              <label htmlFor="createAccount" className="ml-2 text-sm text-gray-700">
                Create an account for faster checkout next time
              </label>
            </div>

            {watchCreateAccount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: watchCreateAccount ? 'Password is required' : false,
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                  placeholder="Minimum 8 characters"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="newsletter"
              {...register('subscribeToNewsletter')}
              className="h-4 w-4 text-[#D4A574] focus:ring-[#D4A574] border-gray-300 rounded"
            />
            <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
              Subscribe to our newsletter for exclusive offers and hair care tips
            </label>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{errors.form}</p>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-[#D4A574] text-white font-medium rounded-md hover:bg-[#B8956A] focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isValid}
            >
              Continue to Shipping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}