/**
 * @file BadgeDisplay.tsx
 * @description Component for displaying individual achievement badges
 * 
 * Shows badge icon, name, description, progress, and unlock status
 * with visual effects for unlocked/locked states.
 */

import React from 'react';
import type { Badge } from '../types/Achievement';
import './BadgeDisplay.css';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showDescription?: boolean;
  onClick?: (badge: Badge) => void;
  className?: string;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  size = 'medium',
  showProgress = true,
  showDescription = true,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(badge);
    }
  };

  const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'common': return '#10b981'; // green
      case 'rare': return '#3b82f6'; // blue
      case 'epic': return '#8b5cf6'; // purple
      case 'legendary': return '#f59e0b'; // gold
      default: return '#6b7280'; // gray
    }
  };

  const getCategoryIcon = (category: Badge['category']): string => {
    switch (category) {
      case 'evolution': return '🦋';
      case 'game': return '🎮';
      case 'care': return '💝';
      case 'time': return '⏰';
      case 'level': return '⭐';
      default: return '🏆';
    }
  };

  const formatProgress = (progress: number): string => {
    return `${Math.round(progress * 100)}%`;
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 1) return '#10b981'; // green - complete
    if (progress >= 0.7) return '#f59e0b'; // amber - close
    if (progress >= 0.3) return '#3b82f6'; // blue - making progress
    return '#6b7280'; // gray - just started
  };

  const badgeClasses = [
    'badge-display',
    `badge-display--${size}`,
    badge.unlocked ? 'badge-display--unlocked' : 'badge-display--locked',
    `badge-display--${badge.rarity}`,
    onClick ? 'badge-display--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={badgeClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{
        '--rarity-color': getRarityColor(badge.rarity),
        '--progress-color': getProgressColor(badge.progress)
      } as React.CSSProperties}
    >
      {/* Badge Icon */}
      <div className="badge-display__icon-container">
        <div className="badge-display__icon">
          {badge.unlocked ? badge.icon : '🔒'}
        </div>
        {badge.unlocked && (
          <div className="badge-display__unlock-indicator">
            ✨
          </div>
        )}
        <div className="badge-display__category-icon">
          {getCategoryIcon(badge.category)}
        </div>
      </div>

      {/* Badge Content */}
      <div className="badge-display__content">
        <div className="badge-display__header">
          <h3 className="badge-display__name">
            {badge.name}
          </h3>
          <div className="badge-display__rarity">
            {badge.rarity}
          </div>
        </div>

        {showDescription && (
          <p className="badge-display__description">
            {badge.description}
          </p>
        )}

        <div className="badge-display__requirements">
          {badge.requirements.description}
        </div>

        {showProgress && !badge.unlocked && (
          <div className="badge-display__progress">
            <div className="badge-display__progress-bar">
              <div 
                className="badge-display__progress-fill"
                style={{
                  width: `${badge.progress * 100}%`,
                  backgroundColor: getProgressColor(badge.progress)
                }}
              />
            </div>
            <div className="badge-display__progress-text">
              {formatProgress(badge.progress)}
            </div>
          </div>
        )}

        {badge.unlocked && badge.unlockedAt && (
          <div className="badge-display__unlock-date">
            Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Rarity Border Effect */}
      <div className="badge-display__rarity-border" />
      
      {/* Shine Effect for Unlocked Badges */}
      {badge.unlocked && (
        <div className="badge-display__shine" />
      )}
    </div>
  );
};

export default BadgeDisplay;