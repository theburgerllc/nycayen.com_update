"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { InstagramLightboxProps, InstagramMedia } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Heart,
  MessageCircle,
  Calendar,
  Download,
  Share
} from 'lucide-react';
import { trackInstagramEngagement } from '../lib/analytics';

export function InstagramLightbox({
  media,
  initialIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  showCaptions = true,
  showCounts = true,
  enableKeyboard = true,
  enableSwipe = true,
  className = '',
}: InstagramLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMedia = media[currentIndex];

  // Update current index when initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
      setIsZoomed(false);
      setZoomLevel(1);
    }
  }, [initialIndex, isOpen]);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const handleNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setIsLoading(true);
      setIsZoomed(false);
      setZoomLevel(1);
      onNext?.();
      
      // Track navigation
      trackInstagramEngagement({
        type: 'view',
        mediaId: media[nextIndex].id,
        mediaType: media[nextIndex].media_type,
        timestamp: new Date(),
        customProperties: {
          source: 'lightbox',
          navigation: 'next',
          position: nextIndex,
        },
      });
    }
  }, [currentIndex, media, onNext]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setIsLoading(true);
      setIsZoomed(false);
      setZoomLevel(1);
      onPrevious?.();
      
      // Track navigation
      trackInstagramEngagement({
        type: 'view',
        mediaId: media[prevIndex].id,
        mediaType: media[prevIndex].media_type,
        timestamp: new Date(),
        customProperties: {
          source: 'lightbox',
          navigation: 'previous',
          position: prevIndex,
        },
      });
    }
  }, [currentIndex, media, onPrevious]);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    setIsZoomed(false);
    setZoomLevel(1);
    onClose();
  }, [onClose]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        
        trackInstagramEngagement({
          type: 'pause',
          mediaId: currentMedia.id,
          mediaType: currentMedia.media_type,
          timestamp: new Date(),
          duration: videoRef.current.currentTime,
        });
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        
        trackInstagramEngagement({
          type: 'play',
          mediaId: currentMedia.id,
          mediaType: currentMedia.media_type,
          timestamp: new Date(),
        });
      }
    }
  }, [isPlaying, currentMedia]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleZoomIn = useCallback(() => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => Math.min(prev + 0.5, 3));
      setIsZoomed(true);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(prev - 0.5, 1));
      if (zoomLevel <= 1.5) {
        setIsZoomed(false);
      }
    }
  }, [zoomLevel]);

  const handleShare = useCallback(async () => {
    const url = currentMedia.permalink;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this Instagram post',
          text: currentMedia.caption || 'Instagram post from @nycayenmoore',
          url,
        });
        
        trackInstagramEngagement({
          type: 'share',
          mediaId: currentMedia.id,
          mediaType: currentMedia.media_type,
          timestamp: new Date(),
          customProperties: { method: 'native' },
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      
      trackInstagramEngagement({
        type: 'share',
        mediaId: currentMedia.id,
        mediaType: currentMedia.media_type,
        timestamp: new Date(),
        customProperties: { method: 'clipboard' },
      });
    }
  }, [currentMedia]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(currentMedia.media_url, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `instagram-${currentMedia.id}.${currentMedia.media_type === 'VIDEO' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(url);
      
      trackInstagramEngagement({
        type: 'click',
        mediaId: currentMedia.id,
        mediaType: currentMedia.media_type,
        timestamp: new Date(),
        customProperties: { action: 'download' },
      });
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [currentMedia]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleMediaLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const formatDate = useCallback((timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const formatCount = useCallback((count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  }, []);

  if (!isOpen || !currentMedia) return null;

  const lightboxContent = (
    <div
      className={`fixed inset-0 z-50 bg-black/95 flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/20 rounded-full transition-all ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:bg-white/20 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === media.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:bg-white/20 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main content area */}
      <div
        ref={containerRef}
        className="relative max-w-full max-h-full flex items-center justify-center p-4"
      >
        {currentMedia.media_type === 'VIDEO' ? (
          <div className="relative">
            <video
              ref={videoRef}
              src={currentMedia.media_url}
              className="max-w-full max-h-screen object-contain"
              onLoadedData={handleMediaLoad}
              onEnded={handleVideoEnd}
              muted={isMuted}
              playsInline
              controls={false}
            />
            
            {/* Video controls overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={togglePlay}
                className="p-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current" />
                )}
              </button>
            </div>

            {/* Video controls bar */}
            <div
              className={`absolute bottom-4 left-4 right-4 flex items-center space-x-2 transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Image
              ref={imageRef}
              src={currentMedia.media_url}
              alt={currentMedia.caption || 'Instagram post'}
              width={1200}
              height={1200}
              className={`max-w-full max-h-screen object-contain transition-transform cursor-pointer ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${zoomLevel})`,
              }}
              onLoad={handleMediaLoad}
              onClick={() => isZoomed ? handleZoomOut() : handleZoomIn()}
            />
          </div>
        )}
      </div>

      {/* Info panel */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Action buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Engagement stats */}
              {showCounts && (
                <div className="flex items-center space-x-4 text-white">
                  {currentMedia.like_count !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-5 h-5 fill-current" />
                      <span>{formatCount(currentMedia.like_count)}</span>
                    </div>
                  )}
                  {currentMedia.comments_count !== undefined && (
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-5 h-5" />
                      <span>{formatCount(currentMedia.comments_count)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Zoom controls for images */}
              {currentMedia.media_type === 'IMAGE' && (
                <>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="Share post"
              >
                <Share className="w-5 h-5" />
              </button>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="Download media"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* View on Instagram */}
              <a
                href={currentMedia.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="View on Instagram"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Caption and metadata */}
          {showCaptions && (
            <div className="text-white space-y-2">
              {/* Date */}
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentMedia.timestamp)}</span>
                {media.length > 1 && (
                  <span>• {currentIndex + 1} of {media.length}</span>
                )}
              </div>

              {/* Caption */}
              {currentMedia.caption && (
                <p className="text-sm leading-relaxed max-w-2xl">
                  {currentMedia.caption}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render through portal for proper z-index stacking
  return typeof window !== 'undefined' 
    ? createPortal(lightboxContent, document.body)
    : null;
}