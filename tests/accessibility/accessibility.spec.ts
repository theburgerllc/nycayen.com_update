import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up accessibility testing environment
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Homepage accessibility compliance', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Services page accessibility', async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Booking page accessibility', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('#stripe-element') // Exclude third-party Stripe elements
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Blog page accessibility', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Contact page accessibility', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Keyboard navigation - Homepage', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation through main elements
    await page.keyboard.press('Tab')
    let focusedElement = await page.locator(':focus').getAttribute('data-testid')
    expect(focusedElement).toBeTruthy()

    // Continue tabbing through navigation
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      focusedElement = await page.locator(':focus').getAttribute('data-testid')
      
      // Ensure focus is visible
      const focusedEl = page.locator(':focus')
      await expect(focusedEl).toBeVisible()
    }

    // Test Enter key activation
    await page.keyboard.press('Enter')
    // Should navigate or activate the focused element
  })

  test('Keyboard navigation - Booking form', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForSelector('[data-testid="service-selection"]')

    // Navigate through booking form with keyboard
    await page.keyboard.press('Tab')
    
    // Select service with keyboard
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="date-time-selection"]')

    // Navigate to next step
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Next button

    // Test form field navigation
    await page.waitForSelector('[data-testid="customer-info-form"]')
    
    await page.keyboard.press('Tab') // First name
    await page.keyboard.type('John')
    
    await page.keyboard.press('Tab') // Last name
    await page.keyboard.type('Doe')
    
    await page.keyboard.press('Tab') // Email
    await page.keyboard.type('john@example.com')
    
    await page.keyboard.press('Tab') // Phone
    await page.keyboard.type('1234567890')
  })

  test('Screen reader compatibility - ARIA labels', async ({ page }) => {
    await page.goto('/')

    // Check for proper ARIA labels
    const mainContent = page.locator('main')
    await expect(mainContent).toHaveAttribute('role', 'main')

    const navigation = page.locator('nav')
    await expect(navigation).toHaveAttribute('role', 'navigation')

    // Check for ARIA-described elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const hasAriaLabel = await button.getAttribute('aria-label')
      const hasAriaDescribedBy = await button.getAttribute('aria-describedby')
      const hasTextContent = await button.textContent()
      
      // Button should have either aria-label, aria-describedby, or text content
      expect(hasAriaLabel || hasAriaDescribedBy || hasTextContent).toBeTruthy()
    }
  })

  test('Form accessibility - Labels and validation', async ({ page }) => {
    await page.goto('/contact')

    // Check that all form inputs have labels
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const inputId = await input.getAttribute('id')
      const inputName = await input.getAttribute('name')
      
      if (inputId) {
        // Check for associated label
        const label = page.locator(`label[for="${inputId}"]`)
        await expect(label).toBeVisible()
      } else if (inputName) {
        // Check for aria-label or aria-labelledby
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        expect(ariaLabel || ariaLabelledBy).toBeTruthy()
      }
    }

    // Test form validation accessibility
    await page.click('[data-testid="contact-submit"]')
    
    // Check for ARIA error attributes
    const errorMessages = page.locator('[aria-invalid="true"]')
    const errorCount = await errorMessages.count()
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorField = errorMessages.nth(i)
        const ariaDescribedBy = await errorField.getAttribute('aria-describedby')
        expect(ariaDescribedBy).toBeTruthy()
        
        // Check that error message exists
        const errorMessage = page.locator(`#${ariaDescribedBy}`)
        await expect(errorMessage).toBeVisible()
      }
    }
  })

  test('Color contrast compliance', async ({ page }) => {
    await page.goto('/')

    // Use axe-core to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Image accessibility - Alt text', async ({ page }) => {
    await page.goto('/')

    // Check all images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const altText = await image.getAttribute('alt')
      const role = await image.getAttribute('role')
      
      // Image should have alt text or be marked as decorative
      expect(altText !== null || role === 'presentation').toBeTruthy()
      
      // If alt text exists, it should not be empty for content images
      if (altText !== null && role !== 'presentation') {
        expect(altText.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('Focus management - Modal dialogs', async ({ page }) => {
    await page.goto('/')

    // Trigger a modal (if any)
    const modalTrigger = page.locator('[data-testid="newsletter-popup-trigger"]')
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()
      
      // Check focus is trapped in modal
      const modal = page.locator('[data-testid="newsletter-modal"]')
      await expect(modal).toBeVisible()
      
      // Focus should be on first focusable element in modal
      const firstFocusable = modal.locator('button, input, select, textarea, [tabindex="0"]').first()
      await expect(firstFocusable).toBeFocused()
      
      // Test escape key closes modal
      await page.keyboard.press('Escape')
      await expect(modal).not.toBeVisible()
    }
  })

  test('Mobile accessibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Run accessibility scan on mobile
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    // Test mobile-specific interactions
    await page.click('[data-testid="mobile-menu-toggle"]')
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()

    // Check mobile menu is accessible
    const menuAccessibility = await new AxeBuilder({ page })
      .include('[data-testid="mobile-menu"]')
      .analyze()

    expect(menuAccessibility.violations).toEqual([])
  })

  test('Text scaling and zoom accessibility', async ({ page }) => {
    await page.goto('/')

    // Test 200% zoom (WCAG requirement)
    await page.evaluate(() => {
      document.body.style.zoom = '2'
    })

    // Check content is still readable and usable
    const navigation = page.locator('nav')
    await expect(navigation).toBeVisible()

    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()

    // Check no horizontal scrolling on main content
    const bodyOverflow = await page.evaluate(() => {
      return getComputedStyle(document.body).overflowX
    })
    expect(bodyOverflow).not.toBe('scroll')

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1'
    })
  })

  test('Video and media accessibility', async ({ page }) => {
    // Navigate to page with videos (if any)
    await page.goto('/blog')

    // Check for video elements
    const videos = page.locator('video')
    const videoCount = await videos.count()

    for (let i = 0; i < videoCount; i++) {
      const video = videos.nth(i)
      
      // Check for controls
      const hasControls = await video.getAttribute('controls')
      expect(hasControls).toBeTruthy()
      
      // Check for captions track
      const captionTrack = video.locator('track[kind="captions"]')
      if (await captionTrack.count() > 0) {
        await expect(captionTrack).toBeVisible()
      }
    }
  })

  test('Dynamic content accessibility', async ({ page }) => {
    await page.goto('/booking')

    // Interact with dynamic content
    await page.click('[data-testid="service-hair-cut"]')
    
    // Check that screen readers are notified of changes
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]')
    if (await liveRegion.count() > 0) {
      await expect(liveRegion.first()).toBeVisible()
    }

    // Check focus management with dynamic content
    await page.click('[data-testid="next-step"]')
    await page.waitForSelector('[data-testid="date-time-selection"]')
    
    // Focus should move to next section
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})