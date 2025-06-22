'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { SocialShareOptions } from '../types';
import { getSocialShareUrl } from '../utils';

interface SocialShareProps extends SocialShareOptions {
  className?: string;
}

export function SocialShare({ url, title, description, image, hashtags, className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: getSocialShareUrl('twitter', { url, title, description, image, hashtags }),
      color: 'hover:bg-blue-500 hover:text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: getSocialShareUrl('facebook', { url, title, description, image }),
      color: 'hover:bg-blue-600 hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: getSocialShareUrl('linkedin', { url, title, description, image }),
      color: 'hover:bg-blue-700 hover:text-white',
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Share2 className="w-5 h-5" />
        <span>Share this article</span>
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 transition-colors ${option.color}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{option.name}</span>
            </a>
          );
        })}
        
        <button
          onClick={copyToClipboard}
          className={`flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg transition-colors ${
            copied 
              ? 'bg-green-500 text-white border-green-500' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Share this article with your network to spread the knowledge!
        </p>
      </div>
    </div>
  );
}