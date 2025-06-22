'use client';

import { useState, useCallback } from 'react';
import { Download, FileText, Crown, Star, Gift, BookOpen } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';
import { leadMagnets } from '@/lib/email-marketing';

// Lead Magnet Types
export interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'checklist' | 'template' | 'course' | 'consultation';
  category: 'hair-care' | 'styling' | 'color' | 'bridal' | 'business';
  value: string;
  fileSize?: string;
  pageCount?: number;
  duration?: string;
  thumbnailUrl: string;
  previewImages?: string[];
  features: string[];
  downloadUrl?: string;
  isExclusive?: boolean;
  requiresVIP?: boolean;
}

// Available Lead Magnets
const LEAD_MAGNETS: LeadMagnet[] = [
  {
    id: 'ultimate-hair-care-guide',
    title: 'Ultimate Hair Care Guide',
    description: 'Complete guide to maintaining healthy, beautiful hair at home with professional techniques.',
    type: 'pdf',
    category: 'hair-care',
    value: '$49 Value',
    fileSize: '8.2 MB',
    pageCount: 35,
    thumbnailUrl: '/images/lead-magnets/hair-care-guide-thumb.jpg',
    previewImages: [
      '/images/lead-magnets/hair-care-preview-1.jpg',
      '/images/lead-magnets/hair-care-preview-2.jpg',
    ],
    features: [
      'Daily hair care routines for all hair types',
      'Professional product recommendations',
      'DIY hair masks and treatments',
      'Damage prevention and repair techniques',
      'Seasonal hair care adjustments',
    ],
  },
  {
    id: 'styling-secrets-masterclass',
    title: 'Styling Secrets Masterclass',
    description: 'Learn professional styling techniques to achieve salon-quality results at home.',
    type: 'video',
    category: 'styling',
    value: '$99 Value',
    duration: '45 minutes',
    thumbnailUrl: '/images/lead-magnets/styling-masterclass-thumb.jpg',
    features: [
      '45-minute video masterclass',
      'Step-by-step styling tutorials',
      'Tool recommendations and techniques',
      'Common mistakes to avoid',
      'Lifetime access',
    ],
    isExclusive: true,
  },
  {
    id: 'color-consultation-checklist',
    title: 'Color Consultation Checklist',
    description: 'Essential checklist to prepare for your perfect hair color transformation.',
    type: 'checklist',
    category: 'color',
    value: '$25 Value',
    fileSize: '2.1 MB',
    pageCount: 12,
    thumbnailUrl: '/images/lead-magnets/color-checklist-thumb.jpg',
    features: [
      'Pre-consultation preparation guide',
      'Color maintenance timeline',
      'Aftercare instructions',
      'Product shopping list',
      'Touch-up scheduling guide',
    ],
  },
  {
    id: 'bridal-hair-timeline',
    title: 'Bridal Hair Timeline Planner',
    description: 'Complete timeline for planning your perfect bridal hair from engagement to wedding day.',
    type: 'template',
    category: 'bridal',
    value: '$75 Value',
    fileSize: '5.4 MB',
    pageCount: 20,
    thumbnailUrl: '/images/lead-magnets/bridal-timeline-thumb.jpg',
    features: [
      '12-month planning timeline',
      'Trial appointment scheduling guide',
      'Emergency backup plans',
      'Vendor coordination templates',
      'Day-of timeline template',
    ],
    isExclusive: true,
  },
  {
    id: 'free-style-consultation',
    title: 'Free Style Consultation',
    description: 'Complimentary 15-minute style consultation to discuss your hair goals and options.',
    type: 'consultation',
    category: 'styling',
    value: '$50 Value',
    duration: '15 minutes',
    thumbnailUrl: '/images/lead-magnets/consultation-thumb.jpg',
    features: [
      'Personalized hair analysis',
      'Style recommendations',
      'Product suggestions',
      'Service planning',
      'No obligation',
    ],
    requiresVIP: true,
  },
  {
    id: 'vip-membership-guide',
    title: 'VIP Membership Benefits',
    description: 'Exclusive access to VIP perks, early booking, and member-only discounts.',
    type: 'course',
    category: 'business',
    value: 'Priceless',
    thumbnailUrl: '/images/lead-magnets/vip-membership-thumb.jpg',
    features: [
      'Priority booking access',
      '15% member discount on all services',
      'Exclusive member events',
      'First access to new services',
      'Birthday month special offers',
    ],
    requiresVIP: true,
    isExclusive: true,
  },
];

// Lead Magnet Card Component
interface LeadMagnetCardProps {
  leadMagnet: LeadMagnet;
  onDownload: (id: string) => void;
  variant?: 'card' | 'featured' | 'inline';
  showSignup?: boolean;
}

export function LeadMagnetCard({ 
  leadMagnet, 
  onDownload, 
  variant = 'card',
  showSignup = false
}: LeadMagnetCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getIcon = () => {
    switch (leadMagnet.type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'video': return <BookOpen className="w-8 h-8 text-blue-500" />;
      case 'checklist': return <Star className="w-8 h-8 text-yellow-500" />;
      case 'template': return <FileText className="w-8 h-8 text-green-500" />;
      case 'consultation': return <Crown className="w-8 h-8 text-purple-500" />;
      case 'course': return <Gift className="w-8 h-8 text-pink-500" />;
      default: return <Download className="w-8 h-8 text-gray-500" />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'featured':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 p-8 rounded-xl';
      case 'inline':
        return 'bg-white border border-gray-200 p-6 rounded-lg';
      default:
        return 'bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow';
    }
  };

  const handleDownload = async () => {
    if (leadMagnet.requiresVIP || showSignup) {
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    onDownload(leadMagnet.id);
    setIsLoading(false);
  };

  const handleSignupSuccess = async (subscriberId: string) => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
      const result = await leadMagnets.downloadGuide(leadMagnet.id, subscriberId);
      if (result.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <div className={getVariantClasses()}>
        {leadMagnet.isExclusive && (
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Exclusive Content</span>
          </div>
        )}

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {leadMagnet.title}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {leadMagnet.description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                {leadMagnet.value}
              </span>
              
              {leadMagnet.fileSize && (
                <span>{leadMagnet.fileSize}</span>
              )}
              
              {leadMagnet.pageCount && (
                <span>{leadMagnet.pageCount} pages</span>
              )}
              
              {leadMagnet.duration && (
                <span>{leadMagnet.duration}</span>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {leadMagnet.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                  <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {leadMagnet.features.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{leadMagnet.features.length - 3} more features
                </li>
              )}
            </ul>

            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>
                    {leadMagnet.type === 'consultation' ? 'Book Free Consultation' : 'Get Free Download'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-90vh overflow-y-auto">
            <NewsletterSignup
              variant="lead-magnet"
              title={`Download: ${leadMagnet.title}`}
              description="Get instant access to this exclusive content plus join our beauty community."
              showName={true}
              showInterests={true}
              leadMagnet={leadMagnet.title}
              onSuccess={handleSignupSuccess}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Lead Magnet Collection Component
export function LeadMagnetCollection({ 
  category,
  featured,
  limit 
}: {
  category?: string;
  featured?: boolean;
  limit?: number;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredMagnets = LEAD_MAGNETS.filter(magnet => {
    if (category && magnet.category !== category) return false;
    if (featured && !magnet.isExclusive) return false;
    return true;
  }).slice(0, limit);

  const handleDownload = useCallback(async (id: string) => {
    setDownloadingId(id);
    
    try {
      // Track download attempt
      const event = new CustomEvent('lead-magnet-download', { 
        detail: { id, timestamp: Date.now() } 
      });
      window.dispatchEvent(event);

      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Downloading lead magnet:', id);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {featured && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Exclusive Beauty Resources
          </h2>
          <p className="text-gray-600">
            Get professional beauty tips and exclusive content delivered to your inbox.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMagnets.map((magnet) => (
          <LeadMagnetCard
            key={magnet.id}
            leadMagnet={magnet}
            onDownload={handleDownload}
            variant={featured ? 'featured' : 'card'}
            showSignup={!magnet.downloadUrl}
          />
        ))}
      </div>
    </div>
  );
}

// Inline Lead Magnet Component
export function InlineLeadMagnet({ 
  id, 
  className = '' 
}: { 
  id: string; 
  className?: string; 
}) {
  const leadMagnet = LEAD_MAGNETS.find(m => m.id === id);
  
  if (!leadMagnet) return null;

  const handleDownload = (magnetId: string) => {
    console.log('Inline download:', magnetId);
  };

  return (
    <div className={`my-8 ${className}`}>
      <LeadMagnetCard
        leadMagnet={leadMagnet}
        onDownload={handleDownload}
        variant="inline"
        showSignup={true}
      />
    </div>
  );
}

// VIP Access Component
export function VIPAccessCard() {
  const [showSignup, setShowSignup] = useState(false);

  const handleVIPSignup = async (subscriberId: string) => {
    try {
      await leadMagnets.requestVIPAccess(subscriberId, {
        tier: 'vip',
        interests: ['vip-offers', 'exclusive-access'],
      });
      setShowSignup(false);
    } catch (error) {
      console.error('VIP access error:', error);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-8 rounded-xl text-center">
        <Crown className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Join Our VIP Community
        </h3>
        
        <p className="text-gray-600 mb-6">
          Get exclusive access to premium content, early booking, and VIP-only offers.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          {[
            'Priority Booking',
            '15% Member Discount',
            'Exclusive Events',
            'First Access to New Services',
            'Birthday Specials',
            'VIP-Only Content',
          ].map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowSignup(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Apply for VIP Access
        </button>
      </div>

      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-90vh overflow-y-auto">
            <NewsletterSignup
              variant="lead-magnet"
              title="VIP Membership Application"
              description="Join our exclusive VIP community for premium perks and early access."
              showName={true}
              showInterests={true}
              leadMagnet="VIP Membership"
              onSuccess={handleVIPSignup}
              onClose={() => setShowSignup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Content Upgrade Component (for blog posts)
export function ContentUpgrade({ 
  title = "Want the Complete Guide?",
  description = "Get the full guide with bonus tips and exclusive content.",
  magnetId 
}: {
  title?: string;
  description?: string;
  magnetId: string;
}) {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (subscriberId: string) => {
    setShowModal(false);
    // Trigger download
    leadMagnets.downloadGuide(magnetId, subscriberId);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
        <div className="flex items-center space-x-4">
          <Gift className="w-12 h-12 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h4>
            <p className="text-gray-600 mb-4">
              {description}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Get Free Download
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-90vh overflow-y-auto">
            <NewsletterSignup
              variant="lead-magnet"
              title="Download Complete Guide"
              description="Get instant access plus join our beauty community for more exclusive content."
              showName={true}
              leadMagnet="Complete Guide"
              onSuccess={handleSuccess}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}