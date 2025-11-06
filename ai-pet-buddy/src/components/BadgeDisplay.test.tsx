/**
 * @file BadgeDisplay.test.tsx
 * @description Tests for BadgeDisplay component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Badge } from '../types/Achievement';
import BadgeDisplay from './BadgeDisplay';

describe('BadgeDisplay', () => {
  const mockUnlockedBadge: Badge = {
    id: 'test-unlocked',
    name: 'Test Unlocked Badge',
    description: 'A test badge that is unlocked',
    icon: '🏆',
    category: 'game',
    rarity: 'rare',
    requirements: {
      type: 'total_games',
      value: 10,
      description: 'Play 10 games',
    },
    unlocked: true,
    unlockedAt: Date.now() - 86400000, // 1 day ago
    progress: 1,
  };

  const mockLockedBadge: Badge = {
    id: 'test-locked',
    name: 'Test Locked Badge',
    description: 'A test badge that is locked',
    icon: '⭐',
    category: 'level',
    rarity: 'epic',
    requirements: {
      type: 'level_reached',
      value: 20,
      description: 'Reach level 20',
    },
    unlocked: false,
    progress: 0.6,
  };

  describe('Basic Rendering', () => {
    it('should render unlocked badge correctly', () => {
      render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(screen.getByText('Test Unlocked Badge')).toBeInTheDocument();
      expect(
        screen.getByText('A test badge that is unlocked')
      ).toBeInTheDocument();
      expect(screen.getByText('Play 10 games')).toBeInTheDocument();
      expect(screen.getByText('rare')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should render locked badge correctly', () => {
      render(<BadgeDisplay badge={mockLockedBadge} />);

      expect(screen.getByText('Test Locked Badge')).toBeInTheDocument();
      expect(
        screen.getByText('A test badge that is locked')
      ).toBeInTheDocument();
      expect(screen.getByText('Reach level 20')).toBeInTheDocument();
      expect(screen.getByText('epic')).toBeInTheDocument();
      expect(screen.getByText('🔒')).toBeInTheDocument(); // Lock icon for locked badge
    });

    it('should show unlock date for unlocked badges', () => {
      render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(screen.getByText(/Unlocked:/)).toBeInTheDocument();
    });

    it('should show progress bar for locked badges', () => {
      render(<BadgeDisplay badge={mockLockedBadge} />);

      expect(screen.getByText('60%')).toBeInTheDocument();

      // Check if progress bar exists
      const progressBar = document.querySelector(
        '.badge-display__progress-bar'
      );
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      const { container } = render(
        <BadgeDisplay badge={mockUnlockedBadge} size="small" />
      );

      expect(container.firstChild).toHaveClass('badge-display--small');
    });

    it('should apply medium size class by default', () => {
      const { container } = render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(container.firstChild).toHaveClass('badge-display--medium');
    });

    it('should apply large size class', () => {
      const { container } = render(
        <BadgeDisplay badge={mockUnlockedBadge} size="large" />
      );

      expect(container.firstChild).toHaveClass('badge-display--large');
    });
  });

  describe('Rarity Styling', () => {
    it('should apply rarity class for common badge', () => {
      const commonBadge = { ...mockUnlockedBadge, rarity: 'common' as const };
      const { container } = render(<BadgeDisplay badge={commonBadge} />);

      expect(container.firstChild).toHaveClass('badge-display--common');
    });

    it('should apply rarity class for legendary badge', () => {
      const legendaryBadge = {
        ...mockUnlockedBadge,
        rarity: 'legendary' as const,
      };
      const { container } = render(<BadgeDisplay badge={legendaryBadge} />);

      expect(container.firstChild).toHaveClass('badge-display--legendary');
    });
  });

  describe('Unlock Status', () => {
    it('should apply unlocked class for unlocked badges', () => {
      const { container } = render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(container.firstChild).toHaveClass('badge-display--unlocked');
    });

    it('should apply locked class for locked badges', () => {
      const { container } = render(<BadgeDisplay badge={mockLockedBadge} />);

      expect(container.firstChild).toHaveClass('badge-display--locked');
    });

    it('should show unlock indicator for unlocked badges', () => {
      render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('should not show unlock indicator for locked badges', () => {
      render(<BadgeDisplay badge={mockLockedBadge} />);

      expect(screen.queryByText('✨')).not.toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show progress bar when showProgress is true', () => {
      render(<BadgeDisplay badge={mockLockedBadge} showProgress={true} />);

      const progressBar = document.querySelector('.badge-display__progress');
      expect(progressBar).toBeInTheDocument();
    });

    it('should hide progress bar when showProgress is false', () => {
      render(<BadgeDisplay badge={mockLockedBadge} showProgress={false} />);

      const progressBar = document.querySelector('.badge-display__progress');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should not show progress bar for unlocked badges', () => {
      render(<BadgeDisplay badge={mockUnlockedBadge} showProgress={true} />);

      const progressBar = document.querySelector('.badge-display__progress');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should format progress percentage correctly', () => {
      const partialBadge = { ...mockLockedBadge, progress: 0.75 };
      render(<BadgeDisplay badge={partialBadge} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Description Display', () => {
    it('should show description when showDescription is true', () => {
      render(<BadgeDisplay badge={mockUnlockedBadge} showDescription={true} />);

      expect(
        screen.getByText('A test badge that is unlocked')
      ).toBeInTheDocument();
    });

    it('should hide description when showDescription is false', () => {
      render(
        <BadgeDisplay badge={mockUnlockedBadge} showDescription={false} />
      );

      expect(
        screen.queryByText('A test badge that is unlocked')
      ).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when badge is clicked', () => {
      const handleClick = vi.fn();
      render(<BadgeDisplay badge={mockUnlockedBadge} onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledWith(mockUnlockedBadge);
    });

    it('should call onClick when Enter key is pressed', () => {
      const handleClick = vi.fn();
      render(<BadgeDisplay badge={mockUnlockedBadge} onClick={handleClick} />);

      const badge = screen.getByRole('button');
      fireEvent.keyDown(badge, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledWith(mockUnlockedBadge);
    });

    it('should call onClick when Space key is pressed', () => {
      const handleClick = vi.fn();
      render(<BadgeDisplay badge={mockUnlockedBadge} onClick={handleClick} />);

      const badge = screen.getByRole('button');
      fireEvent.keyDown(badge, { key: ' ' });

      expect(handleClick).toHaveBeenCalledWith(mockUnlockedBadge);
    });

    it('should not call onClick for other keys', () => {
      const handleClick = vi.fn();
      render(<BadgeDisplay badge={mockUnlockedBadge} onClick={handleClick} />);

      const badge = screen.getByRole('button');
      fireEvent.keyDown(badge, { key: 'Tab' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply clickable class when onClick is provided', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <BadgeDisplay badge={mockUnlockedBadge} onClick={handleClick} />
      );

      expect(container.firstChild).toHaveClass('badge-display--clickable');
    });

    it('should not apply clickable class when onClick is not provided', () => {
      const { container } = render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(container.firstChild).not.toHaveClass('badge-display--clickable');
    });

    it('should have proper accessibility attributes when clickable', () => {
      const handleClick = vi.fn();
      render(<BadgeDisplay badge={mockUnlockedBadge} onClick={handleClick} />);

      const badge = screen.getByRole('button');
      expect(badge).toHaveAttribute('tabindex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<BadgeDisplay badge={mockUnlockedBadge} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Category Icons', () => {
    it('should display correct icon for game category', () => {
      const gameBadge = { ...mockUnlockedBadge, category: 'game' as const };
      render(<BadgeDisplay badge={gameBadge} />);

      expect(screen.getByText('🎮')).toBeInTheDocument();
    });

    it('should display correct icon for evolution category', () => {
      const evolutionBadge = {
        ...mockUnlockedBadge,
        category: 'evolution' as const,
      };
      render(<BadgeDisplay badge={evolutionBadge} />);

      expect(screen.getByText('🦋')).toBeInTheDocument();
    });

    it('should display correct icon for care category', () => {
      const careBadge = { ...mockUnlockedBadge, category: 'care' as const };
      render(<BadgeDisplay badge={careBadge} />);

      expect(screen.getByText('💝')).toBeInTheDocument();
    });

    it('should display correct icon for time category', () => {
      const timeBadge = { ...mockUnlockedBadge, category: 'time' as const };
      render(<BadgeDisplay badge={timeBadge} />);

      expect(screen.getByText('⏰')).toBeInTheDocument();
    });

    it('should display correct icon for level category', () => {
      const levelBadge = { ...mockUnlockedBadge, category: 'level' as const };
      render(<BadgeDisplay badge={levelBadge} />);

      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <BadgeDisplay badge={mockUnlockedBadge} className="custom-badge" />
      );

      expect(container.firstChild).toHaveClass('custom-badge');
    });

    it('should set CSS custom properties for rarity color', () => {
      const { container } = render(<BadgeDisplay badge={mockUnlockedBadge} />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.style.getPropertyValue('--rarity-color')).toBe('#3b82f6'); // blue for rare
    });

    it('should set CSS custom properties for progress color', () => {
      const { container } = render(<BadgeDisplay badge={mockLockedBadge} />);

      const badge = container.firstChild as HTMLElement;
      expect(badge.style.getPropertyValue('--progress-color')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle badge with 0% progress', () => {
      const noBadge = { ...mockLockedBadge, progress: 0 };
      render(<BadgeDisplay badge={noBadge} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle badge with 100% progress but not unlocked', () => {
      const completeBadge = {
        ...mockLockedBadge,
        progress: 1,
        unlocked: false,
      };
      render(<BadgeDisplay badge={completeBadge} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle badge without unlockedAt timestamp', () => {
      const badgeWithoutTimestamp = { ...mockUnlockedBadge };
      delete badgeWithoutTimestamp.unlockedAt;

      render(<BadgeDisplay badge={badgeWithoutTimestamp} />);

      expect(screen.queryByText(/Unlocked:/)).not.toBeInTheDocument();
    });

    it('should handle empty or missing description', () => {
      const badgeWithoutDescription = { ...mockUnlockedBadge, description: '' };
      render(
        <BadgeDisplay badge={badgeWithoutDescription} showDescription={true} />
      );

      // Should not crash and should render other content
      expect(screen.getByText('Test Unlocked Badge')).toBeInTheDocument();
    });
  });
});
