// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/services',
        'http://localhost:3000/booking',
        'http://localhost:3000/portfolio',
        'http://localhost:3000/blog',
        'http://localhost:3000/contact'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
          cpuSlowdownMultiplier: 1
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: [
          'unused-javascript',
          'unused-css-rules',
          'non-composited-animations',
          'unsized-images'
        ]
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }], // 2s
        'first-input-delay': ['error', { maxNumericValue: 100 }], // 100ms
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }], // 1.5s
        'speed-index': ['warn', { maxNumericValue: 3000 }], // 3s
        'interactive': ['warn', { maxNumericValue: 4000 }], // 4s
        
        // Resource optimization
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        'unused-css-rules': 'off',
        'unused-javascript': 'off',
        
        // Image optimization
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        'efficiently-encode-images': ['warn', { maxNumericValue: 100000 }],
        'uses-responsive-images': ['warn', { minScore: 0.8 }],
        
        // Font optimization
        'font-display': ['error', { minScore: 1 }],
        'preload-fonts': 'off',
        
        // Accessibility
        'color-contrast': ['error', { minScore: 1 }],
        'heading-order': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        
        // SEO
        'meta-description': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'crawlable-anchors': ['error', { minScore: 1 }],
        
        // Best practices
        'is-on-https': ['error', { minScore: 1 }],
        'uses-https': ['error', { minScore: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: '.lighthouseci'
    }
  }
};