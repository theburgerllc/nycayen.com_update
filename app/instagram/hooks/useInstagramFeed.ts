"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  InstagramMedia, 
  InstagramError, 
  UseInstagramFeedOptions, 
  UseInstagramFeedReturn 
} from '../types';

export function useInstagramFeed(options: UseInstagramFeedOptions = {}): UseInstagramFeedReturn {
  const {
    maxPosts = 25,
    refreshInterval = 0,
    enableRealtime = false,
    cacheKey = 'default',
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<InstagramMedia[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<InstagramError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFeed = useCallback(async (loadMore = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!loadMore) {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        limit: maxPosts.toString(),
        ...(loadMore && cursor ? { after: cursor } : {}),
      });

      const response = await fetch(`/api/instagram/feed?${params}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new InstagramError(
          errorData.code || 'FETCH_ERROR',
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'NETWORK_ERROR',
          { status: response.status, errorData },
          new Date()
        );
      }

      const result = await response.json();
      
      if (loadMore) {
        setData(prevData => {
          const newData = prevData ? [...prevData, ...result.data] : result.data;
          onSuccess?.(newData);
          return newData;
        });
      } else {
        setData(result.data);
        onSuccess?.(result.data);
      }

      // Update pagination info
      if (result.pagination?.next) {
        const nextUrl = new URL(result.pagination.next);
        setCursor(nextUrl.searchParams.get('after'));
        setHasMore(true);
      } else {
        setHasMore(false);
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }

      const instagramError = err instanceof InstagramError ? err : new InstagramError(
        'UNKNOWN_ERROR',
        err instanceof Error ? err.message : 'An unknown error occurred',
        'NETWORK_ERROR',
        { originalError: err },
        new Date()
      );

      setError(instagramError);
      onError?.(instagramError);
    } finally {
      setLoading(false);
    }
  }, [maxPosts, cursor, onError, onSuccess]);

  const refetch = useCallback(async () => {
    setCursor(null);
    setHasMore(true);
    await fetchFeed(false);
  }, [fetchFeed]);

  const refresh = useCallback(async () => {
    // Force refresh by adding nocache parameter
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: maxPosts.toString(),
        nocache: 'true',
      });

      const response = await fetch(`/api/instagram/feed?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data);
      setCursor(null);
      setHasMore(result.pagination?.next ? true : false);
      onSuccess?.(result.data);

    } catch (err) {
      const instagramError = new InstagramError(
        'REFRESH_ERROR',
        err instanceof Error ? err.message : 'Failed to refresh feed',
        'NETWORK_ERROR',
        { originalError: err },
        new Date()
      );

      setError(instagramError);
      onError?.(instagramError);
    } finally {
      setLoading(false);
    }
  }, [maxPosts, onError, onSuccess]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchFeed(true);
  }, [hasMore, loading, fetchFeed]);

  // Initial fetch
  useEffect(() => {
    fetchFeed(false);
  }, [fetchFeed]);

  // Set up automatic refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        if (!loading) {
          refetch();
        }
      }, refreshInterval * 1000);

      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current);
        }
      };
    }
  }, [refreshInterval, loading, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    refresh,
    hasMore,
    loadMore,
  };
}

// Custom InstagramError class for better error handling
class InstagramError extends Error implements InstagramError {
  code: string;
  type: InstagramError['type'];
  details?: Record<string, any>;
  timestamp: Date;

  constructor(
    code: string,
    message: string,
    type: InstagramError['type'],
    details?: Record<string, any>,
    timestamp?: Date
  ) {
    super(message);
    this.name = 'InstagramError';
    this.code = code;
    this.type = type;
    this.details = details;
    this.timestamp = timestamp || new Date();
  }
}