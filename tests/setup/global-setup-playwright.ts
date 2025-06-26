import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use
  
  console.log('🚀 Starting global setup for Playwright tests...')
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to the application
    await page.goto(baseURL || 'http://localhost:3000')
    
    // Wait for the app to be ready
    await page.waitForSelector('body', { timeout: 30000 })
    
    // Set up any global state needed for tests
    await setupAnalytics(page)
    await setupTestData(page)
    await setupMockServices(page)
    
    // Save storage state for tests that need authentication
    if (storageState) {
      await page.context().storageState({ path: storageState as string })
    }
    
    console.log('✅ Global setup completed successfully')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupAnalytics(page: any) {
  // Disable analytics in tests to avoid polluting data
  await page.addInitScript(() => {
    // Mock Google Analytics
    window.gtag = () => {}
    
    // Mock Facebook Pixel
    window.fbq = () => {}
    
    // Mock Hotjar
    window.hj = () => {}
    
    // Mock Microsoft Clarity
    window.clarity = () => {}
    
    // Disable actual tracking
    window.dataLayer = []
  })
}

async function setupTestData(page: any) {
  // Set up localStorage with test data
  await page.addInitScript(() => {
    localStorage.setItem('test_mode', 'true')
    localStorage.setItem('analytics_disabled', 'true')
    
    // Mock user preferences
    localStorage.setItem('user_preferences', JSON.stringify({
      theme: 'light',
      language: 'en',
      cookiesAccepted: true,
    }))
  })
}

async function setupMockServices(page: any) {
  // Mock external API calls
  await page.route('**/api/analytics/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })
  
  // Mock Stripe API calls
  await page.route('**/api/stripe/**', route => {
    const url = route.request().url()
    
    if (url.includes('create-payment-intent')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          client_secret: 'pi_test_123_secret_test',
        }),
      })
    } else {
      route.continue()
    }
  })
  
  // Mock Instagram API calls
  await page.route('**/api/instagram/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '1',
            media_type: 'IMAGE',
            media_url: 'https://example.com/image1.jpg',
            permalink: 'https://instagram.com/p/test1',
            caption: 'Test post 1',
          },
          {
            id: '2',
            media_type: 'IMAGE', 
            media_url: 'https://example.com/image2.jpg',
            permalink: 'https://instagram.com/p/test2',
            caption: 'Test post 2',
          },
        ],
      }),
    })
  })
  
  // Mock email service
  await page.route('**/api/email/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, id: 'email_test_123' }),
    })
  })
  
  // Mock contact form submissions
  await page.route('**/api/contact/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully' 
      }),
    })
  })
}

export default globalSetup