"use client";

// Accessibility utilities for booking flow
export class BookingA11y {
  private static announceToScreenReader(message: string) {
    if (typeof window === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  static announceStepChange(stepName: string, stepNumber: number, totalSteps: number) {
    const message = `Step ${stepNumber} of ${totalSteps}: ${stepName}`;
    this.announceToScreenReader(message);
  }

  static announceFormError(fieldName: string, errorMessage: string) {
    const message = `Error in ${fieldName}: ${errorMessage}`;
    this.announceToScreenReader(message);
  }

  static announceSelection(itemName: string, action: 'added' | 'removed') {
    const message = `${itemName} ${action}`;
    this.announceToScreenReader(message);
  }

  static announceLoadingState(isLoading: boolean, context: string) {
    const message = isLoading ? `Loading ${context}` : `${context} loaded`;
    this.announceToScreenReader(message);
  }

  static announceBookingConfirmation(confirmationNumber: string) {
    const message = `Booking confirmed. Your confirmation number is ${confirmationNumber}`;
    this.announceToScreenReader(message);
  }

  static manageFocus(elementId: string) {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  static trapFocus(containerElement: HTMLElement) {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);

    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }

  static addKeyboardNavigation(element: HTMLElement, onEnter: () => void, onSpace?: () => void) {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter();
      } else if (e.key === ' ' && onSpace) {
        e.preventDefault();
        onSpace();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    element.setAttribute('tabindex', '0');

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }

  static validateColorContrast() {
    // This would integrate with a color contrast checking library
    // For now, we ensure our design meets WCAG AA standards
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 Color contrast validation should be implemented with axe-core or similar');
    }
  }

  static addAriaLabel(element: HTMLElement, label: string) {
    element.setAttribute('aria-label', label);
  }

  static addAriaDescribedBy(element: HTMLElement, describedById: string) {
    element.setAttribute('aria-describedby', describedById);
  }

  static setAriaExpanded(element: HTMLElement, expanded: boolean) {
    element.setAttribute('aria-expanded', expanded.toString());
  }

  static setAriaSelected(element: HTMLElement, selected: boolean) {
    element.setAttribute('aria-selected', selected.toString());
  }
}