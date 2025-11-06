/**
 * @file AchievementItem.test.tsx
 * @description Tests for the AchievementItem component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Badge, Title } from '../../types/Achievement';
import AchievementItem from './AchievementItem';

// Mock badge data
const mockBadge: Badge = {
  id: 'test-badge',
  name: 'Test Badge',
  description: 'A test badge for testing',
  icon: '🏆',
  category: 'game',
  rarity: 'rare',
  requirements: {
    type: 'total_games',
    value: 10,
    description: 'Play 10 games',
  },
  unlocked: false,
  progress: 0.5,
};

const mockUnlockedBadge: Badge = {
  ...mockBadge,
  id: 'unlocked-badge',
  unlocked: true,
  progress: 1,
  unlockedAt: Date.now() - 86400000, // 1 day ago
};

const mockTitle: Title = {
  id: 'test-title',
  name: 'Test Title',
  description: 'A test title for testing',
  icon: '👑',
  category: 'level',
  rarity: 'epic',
  requirements: {
    type: 'level_reached',
    value: 5,
    description: 'Reach level 5',
  },
  unlocked: true,
  unlockedAt: Date.now() - 3600000, // 1 hour ago
  active: false,
};

const mockActiveTitle: Title = {
  ...mockTitle,
  id: 'active-title',
  active: true,
};

describe('AchievementItem', () => {
  describe('Badge Rendering', () => {
    it('should render locked badge correctly', () => {
      render(<AchievementItem achievement={mockBadge} type="badge" />);

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
      expect(screen.getByText('A test badge for testing')).toBeInTheDocument();
      expect(screen.getByText('Play 10 games')).toBeInTheDocument();
      expect(screen.getByText('rare')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument(); // Locked icon
      expect(screen.getByText('50%')).toBeInTheDocument(); // Progress
    });

    it('should render unlocked badge correctly', () => {
      render(<AchievementItem achievement={mockUnlockedBadge} type="badge" />);

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
      const trophyIcons = screen.getAllByText('🏆');
      expect(trophyIcons.length).toBeGreaterThan(0); // Should have the actual icon
      expect(screen.getByText('✨')).toBeInTheDocument(); // Unlock indicator
      expect(screen.queryByText('50%')).not.toBeInTheDocument(); // No progress for unlocked
      expect(screen.getByText(/Unlocked:/)).toBeInTheDocument(); // Unlock date
    });

    it('should show progress bar for locked badges', () => {
      const { container } = render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          showProgress={true}
        />
      );

      const progressBar = container.querySelector(
        '.achievement-item__progress-bar'
      );
      const progressFill = container.querySelector(
        '.achievement-item__progress-fill'
      );

      expect(progressBar).toBeInTheDocument();
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveStyle({ width: '50%' });
    });

    it('should hide progress when showProgress is false', () => {
      const { container } = render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          showProgress={false}
        />
      );

      const progressBar = container.querySelector(
        '.achievement-item__progress-bar'
      );
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Title Rendering', () => {
    it('should render title correctly', () => {
      render(<AchievementItem achievement={mockTitle} type="title" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('A test title for testing')).toBeInTheDocument();
      expect(screen.getByText('Reach level 5')).toBeInTheDocument();
      expect(screen.getByText('epic')).toBeInTheDocument();
      const crownIcons = screen.getAllByText('👑');
      expect(crownIcons.length).toBeGreaterThan(0); // Should have type indicator
    });

    it('should show active indicator for active titles', () => {
      render(
        <AchievementItem
          achievement={mockActiveTitle}
          type="title"
          isActive={true}
        />
      );

      // Should have the active crown indicator
      const activeIndicators = screen.getAllByText('👑');
      expect(activeIndicators.length).toBeGreaterThan(1); // Type indicator + active indicator
    });

    it('should not show progress bar for titles', () => {
      const { container } = render(
        <AchievementItem
          achievement={mockTitle}
          type="title"
          showProgress={true}
        />
      );

      const progressBar = container.querySelector(
        '.achievement-item__progress-bar'
      );
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when item is clicked', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          onClick={mockOnClick}
        />
      );

      const item = screen.getByRole('button');
      await user.click(item);

      expect(mockOnClick).toHaveBeenCalledWith(mockBadge);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          onClick={mockOnClick}
        />
      );

      const item = screen.getByRole('button');
      item.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledWith(mockBadge);
    });

    it('should call onClick when Space key is pressed', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          onClick={mockOnClick}
        />
      );

      const item = screen.getByRole('button');
      item.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledWith(mockBadge);
    });

    it('should not be interactive when onClick is not provided', () => {
      render(<AchievementItem achievement={mockBadge} type="badge" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct size class', () => {
      const { container } = render(
        <AchievementItem achievement={mockBadge} type="badge" size="small" />
      );

      const item = container.querySelector('.achievement-item');
      expect(item).toHaveClass('achievement-item--small');
    });

    it('should apply correct rarity class', () => {
      const { container } = render(
        <AchievementItem achievement={mockBadge} type="badge" />
      );

      const item = container.querySelector('.achievement-item');
      expect(item).toHaveClass('achievement-item--rare');
    });

    it('should apply unlocked class for unlocked items', () => {
      const { container } = render(
        <AchievementItem achievement={mockUnlockedBadge} type="badge" />
      );

      const item = container.querySelector('.achievement-item');
      expect(item).toHaveClass('achievement-item--unlocked');
    });

    it('should apply locked class for locked items', () => {
      const { container } = render(
        <AchievementItem achievement={mockBadge} type="badge" />
      );

      const item = container.querySelector('.achievement-item');
      expect(item).toHaveClass('achievement-item--locked');
    });

    it('should apply active class for active titles', () => {
      const { container } = render(
        <AchievementItem
          achievement={mockActiveTitle}
          type="title"
          isActive={true}
        />
      );

      const item = container.querySelector('.achievement-item');
      expect(item).toHaveClass('achievement-item--active');
    });

    it('should apply clickable class when onClick is provided', () => {
      const { container } = render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          onClick={() => {}}
        />
      );

      const item = container.querySelector('.achievement-item');
      expect(item).toHaveClass('achievement-item--clickable');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when clickable', () => {
      render(
        <AchievementItem
          achievement={mockBadge}
          type="badge"
          onClick={() => {}}
        />
      );

      const item = screen.getByRole('button');
      expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<AchievementItem achievement={mockBadge} type="badge" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
