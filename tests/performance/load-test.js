import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('error_rate')

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '2m', target: 50 },  // Stay at 50 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
    error_rate: ['rate<0.1'],          // Custom error rate should be below 10%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test scenarios
export default function () {
  // Test homepage
  testHomepage()
  
  // Test services page
  testServicesPage()
  
  // Test booking flow
  testBookingFlow()
  
  // Test blog
  testBlogPage()
  
  // Test contact page
  testContactPage()
  
  // Test API endpoints
  testAPIEndpoints()
  
  sleep(1)
}

function testHomepage() {
  const response = http.get(`${BASE_URL}/`)
  
  const isSuccess = check(response, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage loads in under 2s': (r) => r.timings.duration < 2000,
    'Homepage contains navigation': (r) => r.body.includes('nav'),
    'Homepage contains hero section': (r) => r.body.includes('hero'),
  })
  
  errorRate.add(!isSuccess)
}

function testServicesPage() {
  const response = http.get(`${BASE_URL}/services`)
  
  const isSuccess = check(response, {
    'Services status is 200': (r) => r.status === 200,
    'Services loads in under 2s': (r) => r.timings.duration < 2000,
    'Services contains service list': (r) => r.body.includes('service'),
  })
  
  errorRate.add(!isSuccess)
}

function testBookingFlow() {
  // Test booking page
  const bookingResponse = http.get(`${BASE_URL}/booking`)
  
  const bookingSuccess = check(bookingResponse, {
    'Booking page status is 200': (r) => r.status === 200,
    'Booking page loads in under 3s': (r) => r.timings.duration < 3000,
    'Booking page contains form': (r) => r.body.includes('form'),
  })
  
  errorRate.add(!bookingSuccess)
  
  // Test booking API (if available)
  const bookingData = {
    serviceType: 'Hair Cut',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    appointmentDate: '2024-02-15T10:00:00Z',
  }
  
  const apiResponse = http.post(
    `${BASE_URL}/api/bookings`,
    JSON.stringify(bookingData),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  const apiSuccess = check(apiResponse, {
    'Booking API responds': (r) => r.status === 200 || r.status === 201,
    'Booking API response time under 1s': (r) => r.timings.duration < 1000,
  })
  
  errorRate.add(!apiSuccess)
}

function testBlogPage() {
  const response = http.get(`${BASE_URL}/blog`)
  
  const isSuccess = check(response, {
    'Blog status is 200': (r) => r.status === 200,
    'Blog loads in under 2s': (r) => r.timings.duration < 2000,
    'Blog contains posts': (r) => r.body.includes('post') || r.body.includes('article'),
  })
  
  errorRate.add(!isSuccess)
}

function testContactPage() {
  const response = http.get(`${BASE_URL}/contact`)
  
  const isSuccess = check(response, {
    'Contact status is 200': (r) => r.status === 200,
    'Contact loads in under 2s': (r) => r.timings.duration < 2000,
    'Contact contains form': (r) => r.body.includes('form'),
  })
  
  errorRate.add(!isSuccess)
  
  // Test contact form submission
  const contactData = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message',
  }
  
  const submitResponse = http.post(
    `${BASE_URL}/api/contact`,
    JSON.stringify(contactData),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  const submitSuccess = check(submitResponse, {
    'Contact form submission responds': (r) => r.status === 200 || r.status === 201,
    'Contact API response time under 1s': (r) => r.timings.duration < 1000,
  })
  
  errorRate.add(!submitSuccess)
}

function testAPIEndpoints() {
  // Test analytics endpoint
  const analyticsResponse = http.post(
    `${BASE_URL}/api/analytics/track`,
    JSON.stringify({
      event: 'page_view',
      page: '/test',
      timestamp: Date.now(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  check(analyticsResponse, {
    'Analytics API responds': (r) => r.status === 200,
    'Analytics API fast response': (r) => r.timings.duration < 500,
  })
  
  // Test Instagram feed endpoint
  const instagramResponse = http.get(`${BASE_URL}/api/instagram/feed`)
  
  check(instagramResponse, {
    'Instagram API responds': (r) => r.status === 200,
    'Instagram API response time under 2s': (r) => r.timings.duration < 2000,
  })
  
  // Test search endpoint
  const searchResponse = http.get(`${BASE_URL}/api/search?q=hair`)
  
  check(searchResponse, {
    'Search API responds': (r) => r.status === 200,
    'Search API response time under 1s': (r) => r.timings.duration < 1000,
  })
}

// Setup function (runs once)
export function setup() {
  console.log('Starting performance tests...')
  
  // Verify the application is running
  const response = http.get(`${BASE_URL}/`)
  
  if (response.status !== 200) {
    throw new Error(`Application not responding. Status: ${response.status}`)
  }
  
  console.log('Application is running, starting load tests')
  return { baseUrl: BASE_URL }
}

// Teardown function (runs once after all tests)
export function teardown(data) {
  console.log('Performance tests completed')
  console.log(`Tested against: ${data.baseUrl}`)
}

// Additional test scenarios for specific use cases
export function stressTestBookingAPI() {
  const bookingData = {
    serviceType: 'Hair Color',
    customerName: 'Stress Test User',
    customerEmail: 'stress@example.com',
    appointmentDate: '2024-02-20T14:00:00Z',
  }
  
  const response = http.post(
    `${BASE_URL}/api/bookings`,
    JSON.stringify(bookingData),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  check(response, {
    'Booking API handles stress': (r) => r.status < 500,
    'Booking API stress response time': (r) => r.timings.duration < 5000,
  })
}

export function loadTestStaticAssets() {
  // Test CSS files
  http.get(`${BASE_URL}/_next/static/css/app.css`)
  
  // Test JavaScript bundles
  http.get(`${BASE_URL}/_next/static/chunks/main.js`)
  
  // Test images
  http.get(`${BASE_URL}/images/logo.png`)
  http.get(`${BASE_URL}/images/hero-bg.jpg`)
  
  // All static assets should load quickly
  sleep(0.1)
}