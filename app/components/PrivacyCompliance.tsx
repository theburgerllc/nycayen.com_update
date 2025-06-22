'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Cookie, Eye, Download, Trash2, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

// GDPR Compliance Types
export interface ConsentRecord {
  id: string;
  userId: string;
  type: 'cookies' | 'marketing' | 'analytics' | 'functional';
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  method: 'explicit' | 'implicit' | 'opt-out';
  version: string;
}

export interface DataProcessingPurpose {
  id: string;
  name: string;
  description: string;
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  lawfulBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest';
  dataTypes: string[];
  retention: number; // days
  thirdParties?: string[];
}

export interface PrivacyPreferences {
  userId: string;
  cookies: {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  communications: {
    newsletter: boolean;
    promotions: boolean;
    reminders: boolean;
    surveys: boolean;
  };
  dataProcessing: {
    profileEnrichment: boolean;
    behaviorAnalysis: boolean;
    personalization: boolean;
    thirdPartySharing: boolean;
  };
  updatedAt: Date;
}

// Cookie Consent Banner
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    
    saveConsent(allPreferences);
    setIsVisible(false);
  }, []);

  const handleAcceptSelected = useCallback(() => {
    saveConsent(preferences);
    setIsVisible(false);
  }, [preferences]);

  const handleRejectNonEssential = useCallback(() => {
    const essentialOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    
    saveConsent(essentialOnly);
    setIsVisible(false);
  }, []);

  const saveConsent = (prefs: typeof preferences) => {
    const consentData = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
      method: 'explicit',
    };

    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    // Apply consent preferences
    applyCookiePreferences(prefs);
    
    // Track consent
    trackConsentGiven(prefs);
  };

  const applyCookiePreferences = (prefs: typeof preferences) => {
    // Disable/enable analytics
    if (!prefs.analytics && typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }

    // Disable/enable marketing cookies
    if (!prefs.marketing) {
      // Disable marketing pixels, retargeting, etc.
      document.querySelectorAll('[data-marketing-pixel]').forEach(element => {
        element.remove();
      });
    }

    // Apply functional preferences
    if (!prefs.functional) {
      // Disable chat widgets, preferences storage, etc.
      localStorage.removeItem('user-preferences');
    }
  };

  const trackConsentGiven = (prefs: typeof preferences) => {
    fetch('/api/privacy/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cookie-consent',
        preferences: prefs,
        timestamp: new Date().toISOString(),
        ipAddress: 'client-side', // Will be set server-side
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        {!showDetails ? (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-start space-x-3 flex-1">
              <Cookie className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 font-medium mb-1">
                  We use cookies to enhance your experience
                </p>
                <p className="text-sm text-gray-600">
                  We use essential cookies for site functionality and optional cookies for analytics and marketing. 
                  <button 
                    onClick={() => setShowDetails(true)}
                    className="text-amber-500 hover:underline ml-1"
                  >
                    Learn more
                  </button>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRejectNonEssential}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              {[
                {
                  key: 'necessary',
                  title: 'Necessary Cookies',
                  description: 'Essential for basic site functionality, security, and access to secure areas.',
                  required: true,
                },
                {
                  key: 'functional',
                  title: 'Functional Cookies',
                  description: 'Enable enhanced functionality like chat support and remembering your preferences.',
                  required: false,
                },
                {
                  key: 'analytics',
                  title: 'Analytics Cookies',
                  description: 'Help us understand how you use our site to improve performance and user experience.',
                  required: false,
                },
                {
                  key: 'marketing',
                  title: 'Marketing Cookies',
                  description: 'Used to show you relevant ads and measure the effectiveness of our marketing campaigns.',
                  required: false,
                },
              ].map(({ key, title, description, required }) => (
                <div key={key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                  <label className="flex items-center ml-4">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof typeof preferences]}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      disabled={required}
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 disabled:bg-gray-100"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {required ? 'Required' : 'Optional'}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleAcceptSelected}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Privacy Preferences Center
export function PrivacyPreferencesCenter({ 
  isOpen, 
  onClose, 
  userId 
}: {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}) {
  const [activeTab, setActiveTab] = useState<'cookies' | 'communications' | 'data'>('cookies');
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    userId: userId || 'anonymous',
    cookies: {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    },
    communications: {
      newsletter: true,
      promotions: false,
      reminders: true,
      surveys: false,
    },
    dataProcessing: {
      profileEnrichment: false,
      behaviorAnalysis: false,
      personalization: true,
      thirdPartySharing: false,
    },
    updatedAt: new Date(),
  });

  useEffect(() => {
    if (isOpen && userId) {
      loadUserPreferences(userId);
    }
  }, [isOpen, userId]);

  const loadUserPreferences = async (id: string) => {
    try {
      const response = await fetch(`/api/privacy/preferences?userId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const response = await fetch('/api/privacy/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preferences,
          updatedAt: new Date(),
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Preferences saved successfully');
        onClose();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleSectionUpdate = (section: keyof PrivacyPreferences, updates: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Privacy Preferences</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'cookies', label: 'Cookies', icon: Cookie },
              { id: 'communications', label: 'Communications', icon: Eye },
              { id: 'data', label: 'Data Processing', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'cookies' && (
            <CookiePreferencesTab
              preferences={preferences.cookies}
              onChange={(updates) => handleSectionUpdate('cookies', updates)}
            />
          )}

          {activeTab === 'communications' && (
            <CommunicationPreferencesTab
              preferences={preferences.communications}
              onChange={(updates) => handleSectionUpdate('communications', updates)}
            />
          )}

          {activeTab === 'data' && (
            <DataProcessingTab
              preferences={preferences.dataProcessing}
              onChange={(updates) => handleSectionUpdate('dataProcessing', updates)}
            />
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// Cookie Preferences Tab
function CookiePreferencesTab({ 
  preferences, 
  onChange 
}: {
  preferences: PrivacyPreferences['cookies'];
  onChange: (updates: Partial<PrivacyPreferences['cookies']>) => void;
}) {
  const cookieTypes = [
    {
      key: 'necessary',
      title: 'Strictly Necessary',
      description: 'These cookies are essential for the website to function properly.',
      examples: ['Security tokens', 'Session management', 'CSRF protection'],
      required: true,
    },
    {
      key: 'functional',
      title: 'Functional',
      description: 'These cookies enable enhanced functionality and personalization.',
      examples: ['Language preferences', 'Chat widget', 'Form auto-fill'],
      required: false,
    },
    {
      key: 'analytics',
      title: 'Analytics & Performance',
      description: 'These cookies help us understand how visitors interact with our website.',
      examples: ['Google Analytics', 'Page performance', 'User behavior tracking'],
      required: false,
    },
    {
      key: 'marketing',
      title: 'Marketing & Advertising',
      description: 'These cookies are used to make advertising messages more relevant to you.',
      examples: ['Facebook Pixel', 'Google Ads', 'Retargeting pixels'],
      required: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Cookie Settings</h3>
        <p className="text-gray-600">
          Manage your cookie preferences. You can change these settings at any time.
        </p>
      </div>

      <div className="space-y-4">
        {cookieTypes.map(({ key, title, description, examples, required }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{title}</h4>
                  {required && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Examples: </span>
                  {examples.join(', ')}
                </div>
              </div>
              
              <label className="flex items-center ml-4">
                <input
                  type="checkbox"
                  checked={preferences[key as keyof typeof preferences]}
                  onChange={(e) => onChange({ [key]: e.target.checked })}
                  disabled={required}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 disabled:bg-gray-100"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Communication Preferences Tab
function CommunicationPreferencesTab({ 
  preferences, 
  onChange 
}: {
  preferences: PrivacyPreferences['communications'];
  onChange: (updates: Partial<PrivacyPreferences['communications']>) => void;
}) {
  const communicationTypes = [
    {
      key: 'newsletter',
      title: 'Newsletter & Beauty Tips',
      description: 'Weekly newsletter with beauty tips, hair care advice, and styling tutorials.',
    },
    {
      key: 'promotions',
      title: 'Promotions & Special Offers',
      description: 'Exclusive discounts, seasonal promotions, and limited-time offers.',
    },
    {
      key: 'reminders',
      title: 'Appointment Reminders',
      description: 'Booking confirmations, appointment reminders, and follow-up messages.',
    },
    {
      key: 'surveys',
      title: 'Surveys & Feedback',
      description: 'Occasional surveys to help us improve our services and offerings.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Preferences</h3>
        <p className="text-gray-600">
          Choose what types of emails you'd like to receive from us.
        </p>
      </div>

      <div className="space-y-4">
        {communicationTypes.map(({ key, title, description }) => (
          <div key={key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            
            <label className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={preferences[key as keyof typeof preferences]}
                onChange={(e) => onChange({ [key]: e.target.checked })}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Data Processing Tab
function DataProcessingTab({ 
  preferences, 
  onChange 
}: {
  preferences: PrivacyPreferences['dataProcessing'];
  onChange: (updates: Partial<PrivacyPreferences['dataProcessing']>) => void;
}) {
  const dataProcessingTypes = [
    {
      key: 'profileEnrichment',
      title: 'Profile Enrichment',
      description: 'Enhance your profile with additional data to provide better recommendations.',
      impact: 'Enables personalized service suggestions and targeted content.',
    },
    {
      key: 'behaviorAnalysis',
      title: 'Behavior Analysis',
      description: 'Analyze your website usage patterns to improve our services.',
      impact: 'Helps us understand user preferences and optimize the user experience.',
    },
    {
      key: 'personalization',
      title: 'Content Personalization',
      description: 'Customize content and recommendations based on your interests.',
      impact: 'Shows you more relevant content, services, and offers.',
    },
    {
      key: 'thirdPartySharing',
      title: 'Third Party Data Sharing',
      description: 'Share anonymized data with trusted partners for improved services.',
      impact: 'May result in better integrations and expanded service offerings.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Data Processing Preferences</h3>
        <p className="text-gray-600">
          Control how we process your data to enhance your experience.
        </p>
      </div>

      <div className="space-y-4">
        {dataProcessingTypes.map(({ key, title, description, impact }) => (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600 mb-2">{description}</p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Impact: </span>
                  {impact}
                </p>
              </div>
              
              <label className="flex items-center ml-4">
                <input
                  type="checkbox"
                  checked={preferences[key as keyof typeof preferences]}
                  onChange={(e) => onChange({ [key]: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Your Data Rights</h4>
            <p className="text-sm text-blue-700">
              You have the right to access, correct, or delete your personal data at any time. 
              Contact us to exercise these rights or for any privacy-related questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data Rights Management Component
export function DataRightsCenter({ userId }: { userId?: string }) {
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dataRights = [
    {
      id: 'access',
      title: 'Access Your Data',
      description: 'Download a copy of all personal data we have about you.',
      icon: Download,
      action: 'Request Data Export',
    },
    {
      id: 'correct',
      title: 'Correct Your Data',
      description: 'Update or correct any inaccurate personal information.',
      icon: Settings,
      action: 'Update Information',
    },
    {
      id: 'delete',
      title: 'Delete Your Data',
      description: 'Request deletion of your personal data (right to be forgotten).',
      icon: Trash2,
      action: 'Request Deletion',
    },
    {
      id: 'restrict',
      title: 'Restrict Processing',
      description: 'Limit how we process your personal data.',
      icon: Shield,
      action: 'Restrict Processing',
    },
  ];

  const handleDataRequest = async (type: string) => {
    setActiveRequest(type);
    setIsLoading(true);

    try {
      const response = await fetch('/api/privacy/data-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requestType: type,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Show success message
        console.log(`${type} request submitted successfully`);
      }
    } catch (error) {
      console.error('Data request failed:', error);
    } finally {
      setIsLoading(false);
      setActiveRequest(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Data Rights</h3>
        <p className="text-gray-600">
          Under GDPR and other privacy laws, you have certain rights regarding your personal data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataRights.map(({ id, title, description, icon: Icon, action }) => (
          <div key={id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Icon className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <button
                  onClick={() => handleDataRequest(id)}
                  disabled={isLoading && activeRequest === id}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading && activeRequest === id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    action
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Processing Time</h4>
            <p className="text-sm text-yellow-700">
              Data requests are typically processed within 30 days. You'll receive an email confirmation 
              and updates on the status of your request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}