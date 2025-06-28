// Polyfill for 'self' in Node.js environment
(function() {
  'use strict';
  
  // Define self globally for server-side compatibility
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.self) {
      globalThis.self = globalThis;
    }
  }
  
  if (typeof global !== 'undefined') {
    if (!global.self) {
      global.self = global;
    }
  }
  
  // For modules that check for self directly
  if (typeof window === 'undefined' && typeof self === 'undefined') {
    if (typeof global !== 'undefined') {
      global.self = global;
    }
  }
})();