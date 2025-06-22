'use client';

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available
                    config.onUpdate?.(registration);
                  } else {
                    // Content is cached for offline use
                    config.onSuccess?.(registration);
                  }
                }
              });
            }
          });

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 60); // Check every hour

        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          config.onError?.(error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          // Handle update available
          const shouldUpdate = confirm(
            'A new version is available! Click OK to update.'
          );
          if (shouldUpdate) {
            event.ports[0].postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });

      // Handle controller change (new SW has taken control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
}

// Utility to check if we're online
export function getNetworkStatus() {
  return {
    online: navigator.onLine,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
  };
}

// Cache management utilities
export class CacheManager {
  static async clearCache(cacheName?: string) {
    if (!('caches' in window)) return;

    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  static async getCacheSize() {
    if (!('caches' in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const responseClone = response.clone();
          const blob = await responseClone.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  }

  static async getCacheInfo() {
    if (!('caches' in window)) return [];

    const cacheNames = await caches.keys();
    const cacheInfo = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      cacheInfo.push({
        name: cacheName,
        entries: requests.length,
        urls: requests.map(req => req.url),
      });
    }

    return cacheInfo;
  }
}

// Background sync utilities
export function requestBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return (registration as any).sync.register(tag);
    });
  }
}

// Push notification utilities
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

// Performance monitoring for service worker
export function monitorServiceWorkerPerformance() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PERFORMANCE_METRIC') {
      const { name, duration } = event.data;
      
      // Send to analytics
      if ('gtag' in window) {
        (window as any).gtag('event', 'sw_performance', {
          event_category: 'Service Worker',
          event_label: name,
          value: Math.round(duration),
        });
      }
    }
  });
}