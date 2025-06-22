'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { Mail, CheckCircle, AlertCircle, X } from 'lucide-react';
import { emailMarketing, subscriberSchema, INTEREST_CATEGORIES, type SubscriberInput } from '@/lib/email-marketing';

interface NewsletterSignupProps {
  variant?: 'footer' | 'inline' | 'popup' | 'lead-magnet';
  title?: string;
  description?: string;
  showInterests?: boolean;
  showName?: boolean;
  className?: string;
  onSuccess?: (subscriberId: string) => void;
  onClose?: () => void;
  leadMagnet?: string;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  interests: string[];
  gdprConsent: boolean;
  marketingConsent: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export default function NewsletterSignup({
  variant = 'inline',
  title,
  description,
  showInterests = false,
  showName = false,
  className = '',
  onSuccess,
  onClose,
  leadMagnet,
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    interests: [],
    gdprConsent: false,
    marketingConsent: true,
    frequency: 'weekly',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return 'bg-stone-900 text-white p-6 rounded-lg';
      case 'popup':
        return 'bg-white p-8 rounded-xl shadow-2xl max-w-md mx-auto';
      case 'lead-magnet':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-xl border border-amber-200';
      default:
        return 'bg-white p-6 rounded-lg border border-gray-200';
    }
  };

  const getDefaultContent = () => {
    switch (variant) {
      case 'footer':
        return {
          title: 'Stay Beautiful',
          description: 'Get exclusive beauty tips, special offers, and appointment reminders.',
        };
      case 'popup':
        return {
          title: 'Get 15% Off Your First Service',
          description: 'Join our VIP list for exclusive offers and beauty insider tips.',
        };
      case 'lead-magnet':
        return {
          title: `Download Your Free ${leadMagnet || 'Beauty Guide'}`,
          description: 'Get instant access to our exclusive beauty guide and join our community.',
        };
      default:
        return {
          title: 'Join Our Beauty Community',
          description: 'Subscribe for the latest hair trends, beauty tips, and exclusive offers.',
        };
    }
  };

  const content = {
    title: title || getDefaultContent().title,
    description: description || getDefaultContent().description,
  };

  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (status === 'error') setStatus('idle');
  }, [status]);

  const handleInterestToggle = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const subscriberData: SubscriberInput = {
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        interests: formData.interests,
        source: variant as any,
        gdprConsent: formData.gdprConsent,
        marketingConsent: formData.marketingConsent,
        preferences: {
          newsletter: true,
          promotions: formData.marketingConsent,
          bookingReminders: true,
          serviceUpdates: true,
          vipOffers: formData.marketingConsent,
          frequency: formData.frequency,
        },
      };

      const result = await emailMarketing.subscribe(subscriberData);

      if (result.success) {
        setStatus('success');
        onSuccess?.(result.subscriberId!);
        
        // Track conversion for A/B testing
        if (typeof window !== 'undefined') {
          const userId = localStorage.getItem('userId') || 'anonymous';
          // ABTesting will be implemented in popup components
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (status === 'success') {
    return (
      <div className={`${getVariantStyles()} ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {variant === 'lead-magnet' ? 'Download Starting!' : 'Welcome to Our Community!'}
          </h3>
          <p className="text-gray-600 mb-4">
            {variant === 'lead-magnet' 
              ? 'Check your email for the download link and confirmation.'
              : 'Please check your email to confirm your subscription.'}
          </p>
          {variant === 'popup' && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {variant === 'popup' && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      )}

      <div className="text-center mb-6">
        <Mail className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
        <p className="text-gray-600">{content.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showName && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        )}

        <input
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />

        {showInterests && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What interests you? (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_CATEGORIES.map((interest) => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.gdprConsent}
              onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
              required
              className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">
              I consent to receiving emails and understand I can unsubscribe at any time. *
            </span>
          </label>

          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.marketingConsent}
              onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">
              I'd like to receive promotional offers and special deals.
            </span>
          </label>
        </div>

        {status === 'error' && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={20} />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !formData.gdprConsent}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {status === 'loading' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Subscribing...</span>
            </div>
          ) : (
            variant === 'lead-magnet' ? 'Get Free Download' : 'Subscribe Now'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to our{' '}
          <a href="/privacy-policy" className="text-amber-500 hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" className="text-amber-500 hover:underline">
            Terms of Service
          </a>
          .
        </p>
      </form>
    </div>
  );
}

// Footer Newsletter Component
export function FooterNewsletter() {
  return (
    <div className="bg-stone-900 py-12">
      <div className="container mx-auto px-6">
        <NewsletterSignup 
          variant="footer"
          showName={true}
          className="max-w-md mx-auto"
        />
      </div>
    </div>
  );
}

// Inline Newsletter Component (for blog posts, etc.)
export function InlineNewsletter({ 
  title = "Love This Content?",
  description = "Get more beauty tips and exclusive offers delivered to your inbox."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="my-12">
      <NewsletterSignup 
        variant="inline"
        title={title}
        description={description}
        showInterests={true}
        className="max-w-lg mx-auto"
      />
    </div>
  );
}

// Quick Email Capture (minimal version)
export function QuickEmailCapture({ 
  placeholder = "Your email address",
  buttonText = "Subscribe",
  className = ""
}: {
  placeholder?: string;
  buttonText?: string;
  className?: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const result = await emailMarketing.subscribe({
        email,
        source: 'inline',
        gdprConsent: true,
        marketingConsent: true,
        interests: [],
        preferences: {
          newsletter: true,
          promotions: false,
          bookingReminders: true,
          serviceUpdates: false,
          vipOffers: false,
          frequency: 'weekly',
        },
      });

      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
        <CheckCircle size={20} />
        <span>Thanks! Check your email to confirm.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
      >
        {status === 'loading' ? '...' : buttonText}
      </button>
    </form>
  );
}