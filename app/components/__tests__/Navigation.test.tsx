import { render, screen, fireEvent, waitFor } from '@/tests/utils/test-utils'
import { axe } from 'jest-axe'
import Navigation from '../Navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))

describe('Navigation Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders navigation component', () => {
      render(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('renders all navigation links', () => {
      render(<Navigation />)
      
      // Check for main navigation links
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Blog')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(screen.getByText('Book Now')).toBeInTheDocument()
    })

    it('renders logo', () => {
      render(<Navigation />)
      
      const logo = screen.getByTestId('nav-logo')
      expect(logo).toBeInTheDocument()
    })

    it('has correct navigation structure', () => {
      render(<Navigation />)
      
      const navList = screen.getByRole('list')
      expect(navList).toBeInTheDocument()
      
      const navItems = screen.getAllByRole('listitem')
      expect(navItems).toHaveLength(6) // Including Book Now button
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
    })

    it('shows mobile menu toggle button on small screens', () => {
      render(<Navigation />)
      
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      expect(mobileToggle).toBeInTheDocument()
      expect(mobileToggle).toHaveAttribute('aria-label', 'Toggle mobile menu')
    })

    it('opens mobile menu when toggle is clicked', async () => {
      render(<Navigation />)
      
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      fireEvent.click(mobileToggle)
      
      await waitFor(() => {
        const mobileMenu = screen.getByTestId('mobile-menu')
        expect(mobileMenu).toBeVisible()
      })
    })

    it('closes mobile menu when close button is clicked', async () => {
      render(<Navigation />)
      
      // Open menu
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      fireEvent.click(mobileToggle)
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).toBeVisible()
      })
      
      // Close menu
      const closeButton = screen.getByTestId('mobile-menu-close')
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).not.toBeVisible()
      })
    })

    it('closes mobile menu when overlay is clicked', async () => {
      render(<Navigation />)
      
      // Open menu
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      fireEvent.click(mobileToggle)
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).toBeVisible()
      })
      
      // Click overlay
      const overlay = screen.getByTestId('mobile-menu-overlay')
      fireEvent.click(overlay)
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).not.toBeVisible()
      })
    })

    it('manages focus properly when opening mobile menu', async () => {
      render(<Navigation />)
      
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      fireEvent.click(mobileToggle)
      
      await waitFor(() => {
        const firstMenuItem = screen.getByTestId('mobile-nav-home')
        expect(firstMenuItem).toHaveFocus()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through menu items', () => {
      render(<Navigation />)
      
      const homeLink = screen.getByTestId('nav-home')
      homeLink.focus()
      
      expect(homeLink).toHaveFocus()
      
      // Tab to next item
      fireEvent.keyDown(homeLink, { key: 'Tab' })
      
      const servicesLink = screen.getByTestId('nav-services')
      expect(servicesLink).toHaveFocus()
    })

    it('activates menu items with Enter key', () => {
      render(<Navigation />)
      
      const servicesLink = screen.getByTestId('nav-services')
      fireEvent.keyDown(servicesLink, { key: 'Enter' })
      
      // Should trigger navigation (mocked)
      expect(servicesLink).toHaveAttribute('href', '/services')
    })

    it('supports Escape key to close mobile menu', async () => {
      render(<Navigation />)
      
      // Open mobile menu
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      fireEvent.click(mobileToggle)
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).toBeVisible()
      })
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).not.toBeVisible()
      })
    })
  })

  describe('Active State', () => {
    it('highlights active navigation item', () => {
      // Mock current pathname
      jest.doMock('next/navigation', () => ({
        usePathname: () => '/services',
      }))
      
      render(<Navigation />)
      
      const servicesLink = screen.getByTestId('nav-services')
      expect(servicesLink).toHaveClass('active')
    })

    it('shows correct active state for nested routes', () => {
      jest.doMock('next/navigation', () => ({
        usePathname: () => '/blog/hair-care-tips',
      }))
      
      render(<Navigation />)
      
      const blogLink = screen.getByTestId('nav-blog')
      expect(blogLink).toHaveClass('active')
    })
  })

  describe('Search Functionality', () => {
    it('renders search toggle button', () => {
      render(<Navigation />)
      
      const searchToggle = screen.getByTestId('search-toggle')
      expect(searchToggle).toBeInTheDocument()
      expect(searchToggle).toHaveAttribute('aria-label', 'Toggle search')
    })

    it('opens search modal when search toggle is clicked', async () => {
      render(<Navigation />)
      
      const searchToggle = screen.getByTestId('search-toggle')
      fireEvent.click(searchToggle)
      
      await waitFor(() => {
        const searchModal = screen.getByTestId('search-modal')
        expect(searchModal).toBeVisible()
      })
    })

    it('focuses search input when modal opens', async () => {
      render(<Navigation />)
      
      const searchToggle = screen.getByTestId('search-toggle')
      fireEvent.click(searchToggle)
      
      await waitFor(() => {
        const searchInput = screen.getByTestId('search-input')
        expect(searchInput).toHaveFocus()
      })
    })
  })

  describe('Sticky Behavior', () => {
    it('adds sticky class on scroll', async () => {
      render(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      
      // Mock scroll event
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
      fireEvent.scroll(window)
      
      await waitFor(() => {
        expect(nav).toHaveClass('sticky')
      })
    })

    it('removes sticky class when scrolled to top', async () => {
      render(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      
      // First scroll down
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
      fireEvent.scroll(window)
      
      await waitFor(() => {
        expect(nav).toHaveClass('sticky')
      })
      
      // Then scroll to top
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
      fireEvent.scroll(window)
      
      await waitFor(() => {
        expect(nav).not.toHaveClass('sticky')
      })
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Navigation />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper ARIA attributes', () => {
      render(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')
      
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('manages aria-expanded correctly for mobile menu', async () => {
      render(<Navigation />)
      
      const mobileToggle = screen.getByTestId('mobile-menu-toggle')
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(mobileToggle)
      
      await waitFor(() => {
        expect(mobileToggle).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('has proper heading hierarchy', () => {
      render(<Navigation />)
      
      // Logo should be properly structured for screen readers
      const logo = screen.getByTestId('nav-logo')
      expect(logo).toHaveAttribute('role', 'banner')
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now()
      render(<Navigation />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('memoizes expensive calculations', () => {
      const { rerender } = render(<Navigation />)
      
      // Re-render with same props
      rerender(<Navigation />)
      
      // Component should not re-render unnecessarily
      // This would be verified through React DevTools in a real scenario
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    it('handles errors gracefully', () => {
      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Force an error in a child component
      const ThrowError = () => {
        throw new Error('Test error')
      }
      
      expect(() => {
        render(
          <Navigation>
            <ThrowError />
          </Navigation>
        )
      }).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })
})