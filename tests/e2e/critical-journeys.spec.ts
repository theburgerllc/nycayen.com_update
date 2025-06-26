import { test, expect } from '@playwright/test'

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Complete booking flow - Hair Cut service', async ({ page }) => {
    // Start booking journey from homepage
    await page.click('[data-testid="book-appointment-cta"]')
    await expect(page).toHaveURL(/.*booking/)
    
    // Step 1: Service Selection
    await page.waitForSelector('[data-testid="service-selection"]')
    await page.click('[data-testid="service-hair-cut"]')
    await page.click('[data-testid="next-step"]')
    
    // Step 2: Date and Time Selection
    await page.waitForSelector('[data-testid="date-time-selection"]')
    
    // Select a date (next week)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const dateSelector = `[data-date="${nextWeek.toISOString().split('T')[0]}"]`
    await page.click(dateSelector)
    
    // Select time slot
    await page.click('[data-testid="time-slot-10-00"]')
    await page.click('[data-testid="next-step"]')
    
    // Step 3: Customer Information
    await page.waitForSelector('[data-testid="customer-info-form"]')
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john.doe@example.com')
    await page.fill('[name="phone"]', '+1234567890')
    await page.click('[data-testid="next-step"]')
    
    // Step 4: Add-ons Selection (optional)
    await page.waitForSelector('[data-testid="addons-selection"]')
    await page.click('[data-testid="addon-hair-wash"]')
    await page.click('[data-testid="next-step"]')
    
    // Step 5: Payment Confirmation
    await page.waitForSelector('[data-testid="payment-confirmation"]')
    
    // Verify booking summary
    await expect(page.locator('[data-testid="service-summary"]')).toContainText('Hair Cut')
    await expect(page.locator('[data-testid="total-price"]')).toContainText('$')
    
    // Mock Stripe payment (in real tests, use Stripe test cards)
    await page.click('[data-testid="confirm-booking"]')
    
    // Wait for success page
    await page.waitForSelector('[data-testid="booking-success"]', { timeout: 10000 })
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()
  })

  test('Complete purchase flow - Hair care product', async ({ page }) => {
    // Navigate to shop
    await page.click('[data-testid="shop-nav-link"]')
    await expect(page).toHaveURL(/.*shop/)
    
    // Browse products
    await page.waitForSelector('[data-testid="product-grid"]')
    
    // Click on first product
    await page.click('[data-testid="product-card"]:first-child')
    await page.waitForSelector('[data-testid="product-details"]')
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]')
    await expect(page.locator('[data-testid="cart-notification"]')).toBeVisible()
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page).toHaveURL(/.*cart/)
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    await expect(page).toHaveURL(/.*checkout/)
    
    // Fill shipping information
    await page.fill('[name="shippingFirstName"]', 'Jane')
    await page.fill('[name="shippingLastName"]', 'Smith')
    await page.fill('[name="shippingAddress"]', '123 Main St')
    await page.fill('[name="shippingCity"]', 'New York')
    await page.selectOption('[name="shippingState"]', 'NY')
    await page.fill('[name="shippingZip"]', '10001')
    
    // Select shipping method
    await page.click('[data-testid="shipping-standard"]')
    
    // Fill payment information (mock Stripe)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    
    // Complete purchase
    await page.click('[data-testid="complete-purchase"]')
    
    // Wait for success page
    await page.waitForSelector('[data-testid="order-success"]', { timeout: 15000 })
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })

  test('Newsletter signup flow', async ({ page }) => {
    // Wait for newsletter popup or find signup form
    const signupTrigger = page.locator('[data-testid="newsletter-signup"], [data-testid="footer-newsletter"]')
    await signupTrigger.first().waitFor()
    
    // Fill email
    await page.fill('[data-testid="newsletter-email"]', 'test@example.com')
    
    // Select interests (if available)
    const interestsSection = page.locator('[data-testid="newsletter-interests"]')
    if (await interestsSection.isVisible()) {
      await page.check('[data-testid="interest-hair-care"]')
      await page.check('[data-testid="interest-styling-tips"]')
    }
    
    // Submit
    await page.click('[data-testid="newsletter-submit"]')
    
    // Verify success
    await expect(page.locator('[data-testid="newsletter-success"]')).toBeVisible()
  })

  test('Contact form submission', async ({ page }) => {
    // Navigate to contact page
    await page.click('[data-testid="contact-nav-link"]')
    await expect(page).toHaveURL(/.*contact/)
    
    // Fill contact form
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="phone"]', '+1234567890')
    await page.selectOption('[name="inquiryType"]', 'service_inquiry')
    await page.fill('[name="message"]', 'I would like to book a consultation for hair color.')
    
    // Submit form
    await page.click('[data-testid="contact-submit"]')
    
    // Verify success
    await expect(page.locator('[data-testid="contact-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-success"]')).toContainText('Thank you')
  })

  test('Search functionality', async ({ page }) => {
    // Use search functionality
    await page.click('[data-testid="search-toggle"]')
    await page.fill('[data-testid="search-input"]', 'hair color')
    await page.press('[data-testid="search-input"]', 'Enter')
    
    // Verify search results
    await expect(page).toHaveURL(/.*search/)
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount.greaterThan(0)
  })

  test('Social media sharing', async ({ page }) => {
    // Navigate to a blog post
    await page.click('[data-testid="blog-nav-link"]')
    await page.click('[data-testid="blog-post"]:first-child')
    
    // Test social sharing buttons
    const facebookShare = page.locator('[data-testid="share-facebook"]')
    const twitterShare = page.locator('[data-testid="share-twitter"]')
    const instagramShare = page.locator('[data-testid="share-instagram"]')
    
    await expect(facebookShare).toBeVisible()
    await expect(twitterShare).toBeVisible()
    await expect(instagramShare).toBeVisible()
    
    // Test copy link functionality
    await page.click('[data-testid="share-copy"]')
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
  })

  test('Mobile navigation and responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Test mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Navigate through mobile menu
    await page.click('[data-testid="mobile-services-link"]')
    await expect(page).toHaveURL(/.*services/)
    
    // Test mobile booking flow
    await page.click('[data-testid="mobile-book-button"]')
    await expect(page).toHaveURL(/.*booking/)
    
    // Verify mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-service-cards"]')).toBeVisible()
  })

  test('Error handling - 404 page', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page')
    
    // Verify 404 page
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="back-home-link"]')).toBeVisible()
    
    // Test back to home functionality
    await page.click('[data-testid="back-home-link"]')
    await expect(page).toHaveURL('/')
  })

  test('Performance - Page load times', async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Verify page loads within acceptable time (3 seconds)
    expect(loadTime).toBeLessThan(3000)
    
    // Check for performance metrics
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'))
    })
    
    const navigation = JSON.parse(performanceEntries)[0]
    
    // Verify Core Web Vitals thresholds
    expect(navigation.loadEventEnd - navigation.loadEventStart).toBeLessThan(2000)
    expect(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toBeLessThan(1500)
  })
})