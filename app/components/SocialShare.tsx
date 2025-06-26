'use client';

import { useState } from 'react';
import { useConversionTracking } from '../lib/conversion-tracking';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
  className?: string;
  showLabels?: boolean;
  showCounts?: boolean;
}

interface SharePlatform {
  name: string;
  icon: string;
  shareUrl: (props: SocialShareProps) => string;
  color: string;
  label: string;
}

const platforms: SharePlatform[] = [
  {
    name: 'facebook',
    icon: '📘',
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: ({ url, title, description }) => {
      const params = new URLSearchParams({
        u: url || window.location.href,
        quote: `${title || document.title}${description ? ` - ${description}` : ''}`,
      });
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    },
  },
  {
    name: 'twitter',
    icon: '🐦',
    label: 'Twitter',
    color: 'bg-sky-500 hover:bg-sky-600',
    shareUrl: ({ url, title, hashtags, via }) => {
      const params = new URLSearchParams({
        url: url || window.location.href,
        text: title || document.title,
        ...(hashtags && { hashtags: hashtags.join(',') }),
        ...(via && { via }),
      });
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    },
  },
  {
    name: 'instagram',
    icon: '📷',
    label: 'Instagram',
    color: 'bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
    shareUrl: () => 'https://www.instagram.com', // Instagram doesn't have direct URL sharing
  },
  {
    name: 'pinterest',
    icon: '📌',
    label: 'Pinterest',
    color: 'bg-red-600 hover:bg-red-700',
    shareUrl: ({ url, title, description, image }) => {
      const params = new URLSearchParams({
        url: url || window.location.href,
        description: `${title || document.title}${description ? ` - ${description}` : ''}`,
        ...(image && { media: image }),
      });
      return `https://pinterest.com/pin/create/button/?${params.toString()}`;
    },
  },
  {
    name: 'linkedin',
    icon: '💼',
    label: 'LinkedIn',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: ({ url, title, description }) => {
      const params = new URLSearchParams({
        url: url || window.location.href,
        title: title || document.title,
        summary: description || '',
      });
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
    },
  },
  {
    name: 'whatsapp',
    icon: '💬',
    label: 'WhatsApp',
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: ({ url, title }) => {
      const text = `${title || document.title} ${url || window.location.href}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
  },
  {
    name: 'telegram',
    icon: '✈️',
    label: 'Telegram',
    color: 'bg-blue-500 hover:bg-blue-600',
    shareUrl: ({ url, title }) => {
      const params = new URLSearchParams({
        url: url || window.location.href,
        text: title || document.title,
      });
      return `https://t.me/share/url?${params.toString()}`;
    },
  },
  {
    name: 'email',
    icon: '📧',
    label: 'Email',
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: ({ url, title, description }) => {
      const subject = title || document.title;
      const body = `${description || 'Check out this amazing content!'}\n\n${url || window.location.href}`;
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    },
  },
  {
    name: 'copy',
    icon: '📋',
    label: 'Copy Link',
    color: 'bg-gray-500 hover:bg-gray-600',
    shareUrl: ({ url }) => url || window.location.href,
  },
];

export default function SocialShare({
  url,
  title,
  description,
  image,
  hashtags = ['hairsalon', 'NYC', 'beauty'],
  via = 'nycayenmoore',
  className = '',
  showLabels = true,
  showCounts = false,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});
  const { trackSocialShare } = useConversionTracking();

  const handleShare = async (platform: SharePlatform) => {
    const shareData = { url, title, description, image, hashtags, via };
    
    // Track the share event
    trackSocialShare({
      platform: platform.name,
      content_type: 'page',
      content_id: url || window.location.pathname,
      url: url || window.location.href,
    });

    if (platform.name === 'copy') {
      try {
        const urlToCopy = shareData.url || window.location.href;
        await navigator.clipboard.writeText(urlToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareData.url || window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    if (platform.name === 'instagram') {
      // Instagram requires special handling
      alert('To share on Instagram, please take a screenshot and post it to your Instagram story or feed!');
      return;
    }

    // Use Web Share API if available
    if (navigator.share && platform.name !== 'copy') {
      try {
        await navigator.share({
          title: shareData.title || document.title,
          text: shareData.description,
          url: shareData.url || window.location.href,
        });
        return;
      } catch (err) {
        // Fall back to traditional sharing
      }
    }

    // Traditional sharing via popup
    const shareUrl = platform.shareUrl(shareData);
    const popup = window.open(
      shareUrl,
      `share-${platform.name}`,
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    // Focus the popup if it was successfully opened
    if (popup) {
      popup.focus();
    }
  };

  // Mock share counts (in a real implementation, you'd fetch these from APIs)
  const getShareCount = (platform: string): number => {
    const baseCounts: Record<string, number> = {
      facebook: 234,
      twitter: 156,
      pinterest: 89,
      linkedin: 67,
      whatsapp: 145,
      telegram: 34,
    };
    return baseCounts[platform] || 0;
  };

  return (
    <div className={`social-share ${className}`}>
      <div className="flex flex-wrap gap-2 items-center">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => handleShare(platform)}
            className={`
              ${platform.color}
              text-white rounded-lg transition-all duration-200 
              flex items-center justify-center gap-2 
              ${showLabels ? 'px-4 py-2' : 'w-10 h-10'}
              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
              ${platform.name === 'copy' && copied ? 'bg-green-500 hover:bg-green-600' : ''}
            `}
            title={`Share on ${platform.label}`}
            disabled={platform.name === 'copy' && copied}
          >
            <span className="text-lg" role="img" aria-label={platform.label}>
              {platform.name === 'copy' && copied ? '✅' : platform.icon}
            </span>
            {showLabels && (
              <span className="text-sm font-medium">
                {platform.name === 'copy' && copied ? 'Copied!' : platform.label}
              </span>
            )}
            {showCounts && platform.name !== 'copy' && platform.name !== 'email' && (
              <span className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded-full">
                {getShareCount(platform.name)}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Share modal for complex content */}
      <div className="hidden">
        {/* This would contain a modal for more advanced sharing options */}
      </div>
    </div>
  );
}

// Preset configurations for different content types
export function BlogPostShare({
  slug,
  title,
  excerpt,
  featuredImage,
  category,
  tags,
}: {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
}) {
  return (
    <SocialShare
      url={`${window.location.origin}/blog/${slug}`}
      title={title}
      description={excerpt}
      image={featuredImage}
      hashtags={[...tags, category, 'blog'].slice(0, 5)}
      className="blog-share"
    />
  );
}

export function ServiceShare({
  serviceName,
  description,
  serviceImage,
}: {
  serviceName: string;
  description: string;
  serviceImage?: string;
}) {
  return (
    <SocialShare
      title={`${serviceName} - NYC Ayen Hair Artistry`}
      description={description}
      image={serviceImage}
      hashtags={['hairsalon', 'NYC', serviceName.toLowerCase().replace(/\s+/g, ''), 'beauty']}
      className="service-share"
    />
  );
}

export function BookingShare({
  appointmentType,
}: {
  appointmentType: string;
}) {
  return (
    <SocialShare
      title={`Just booked my ${appointmentType} at NYC Ayen Hair Artistry!`}
      description="Amazing hair artistry and professional service in NYC"
      hashtags={['hairsalon', 'NYC', 'booking', appointmentType.toLowerCase()]}
      showLabels={false}
      className="booking-share"
    />
  );
}

// Analytics integration for share tracking
export function trackSocialShareEvent(platform: string, contentType: string, contentId: string) {
  // This integrates with your analytics system
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', {
      method: platform,
      content_type: contentType,
      content_id: contentId,
    });
  }

  // Track custom conversion
  if (typeof window !== 'undefined') {
    // Custom analytics tracking
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'social_share',
        platform,
        content_type: contentType,
        content_id: contentId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }),
    }).catch(console.error);
  }
}