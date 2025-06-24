/**
 * @file AchievementNotification.test.tsx
 * @description Tests for the AchievementNotification component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AchievementNotification as NotificationType } from '../../types/Achievement';
import AchievementNotification from './AchievementNotification';

// Mock notification data
const mockNotification: NotificationType = {
  id: 'test-notification-1',
  type: 'badge',
  name: 'First Steps',
  description: 'You started your journey!',
  icon: '🌟',
  rarity: 'common',
  timestamp: Date.now()
};

const mockLegendaryNotification: NotificationType = {
  id: 'test-notification-2',
  type: 'title',
  name: 'Legend',
  description: 'You achieved legendary status!',
  icon: '👑',
  rarity: 'legendary',
  timestamp: Date.now()
};

describe('AchievementNotification', () => {
  let mockOnDismiss: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnDismiss = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render badge notification correctly', () => {
      render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('First Steps')).toBeInTheDocument();
      expect(screen.getByText('You started your journey!')).toBeInTheDocument();
      expect(screen.getByText('common')).toBeInTheDocument();
      expect(screen.getByText('🌟')).toBeInTheDocument();
    });

    it('should render title notification correctly', () => {
      render(
        <AchievementNotification
          notification={mockLegendaryNotification}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('New Title Earned!')).toBeInTheDocument();
      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText('You achieved legendary status!')).toBeInTheDocument();
      expect(screen.getByText('legendary')).toBeInTheDocument();
      expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('should show sparkles for legendary achievements', () => {
      render(
        <AchievementNotification
          notification={mockLegendaryNotification}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
      expect(screen.getByText('💫')).toBeInTheDocument();
    });

    it('should not show sparkles for common achievements', () => {
      render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('✨')).not.toBeInTheDocument();
      expect(screen.queryByText('⭐')).not.toBeInTheDocument();
      expect(screen.queryByText('💫')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss notification');
      await user.click(dismissButton);

      // Wait for the animation delay
      vi.advanceTimersByTime(300);

      expect(mockOnDismiss).toHaveBeenCalledWith('test-notification-1');
    });

    it('should auto-dismiss after duration', async () => {
      render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
          duration={2000}
        />
      );

      // Fast-forward past the duration + animation delay
      vi.advanceTimersByTime(2300);

      expect(mockOnDismiss).toHaveBeenCalledWith('test-notification-1');
    });

    it('should use default duration when not specified', async () => {
      render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      // Fast-forward past the default duration (5000ms) + animation delay
      vi.advanceTimersByTime(5300);

      expect(mockOnDismiss).toHaveBeenCalledWith('test-notification-1');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct rarity class', () => {
      const { container } = render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = container.querySelector('.achievement-notification');
      expect(notification).toHaveClass('achievement-notification--common');
    });

    it('should apply correct type class', () => {
      const { container } = render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = container.querySelector('.achievement-notification');
      expect(notification).toHaveClass('achievement-notification--badge');
    });

    it('should become visible after mount', async () => {
      const { container } = render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const notification = container.querySelector('.achievement-notification');
      
      // Initially not visible
      expect(notification).not.toHaveClass('achievement-notification--visible');

      // Advance timer to trigger visibility
      vi.advanceTimersByTime(100);

      await waitFor(() => {
        expect(notification).toHaveClass('achievement-notification--visible');
      });
    });
  });

  describe('Cleanup', () => {
    it('should clear timers on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const { unmount } = render(
        <AchievementNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});