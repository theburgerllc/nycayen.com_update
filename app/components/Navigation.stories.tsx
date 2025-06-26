import type { Meta, StoryObj } from '@storybook/react'
import Navigation from './Navigation'

const meta = {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main navigation component with responsive mobile menu and search functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Add any props that Navigation accepts
  },
} satisfies Meta<typeof Navigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default navigation state with all menu items visible.',
      },
    },
  },
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Navigation on mobile devices with hamburger menu.',
      },
    },
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Navigation on tablet devices.',
      },
    },
  },
}

export const Sticky: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: '200vh', background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)' }}>
        <Story />
        <div style={{ padding: '2rem', marginTop: '4rem' }}>
          <h1>Scroll down to see sticky behavior</h1>
          <p>The navigation should become sticky when scrolling.</p>
          <div style={{ height: '100vh', background: '#f9fafb', margin: '2rem 0' }}>
            <p>Content area...</p>
          </div>
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Navigation with sticky behavior when scrolling.',
      },
    },
  },
}

export const WithSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const searchToggle = canvas.getByTestId('search-toggle')
    await userEvent.click(searchToggle)
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation with search modal opened.',
      },
    },
  },
}

export const MobileMenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const mobileToggle = canvas.getByTestId('mobile-menu-toggle')
    await userEvent.click(mobileToggle)
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile navigation with menu opened.',
      },
    },
  },
}

export const AccessibilityTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Test keyboard navigation
    const firstLink = canvas.getByTestId('nav-home')
    firstLink.focus()
    
    // Tab through navigation items
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
  },
  parameters: {
    a11y: {
      element: 'nav',
    },
    docs: {
      description: {
        story: 'Navigation component tested for accessibility compliance.',
      },
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Navigation component in dark mode.',
      },
    },
  },
}

export const Performance: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Navigation component performance testing scenario.',
      },
    },
  },
}