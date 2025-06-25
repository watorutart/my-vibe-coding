/**
 * @file AchievementItem.tsx
 * @description Individual achievement item component for lists
 * 
 * Shows compact achievement information with progress, unlock status,
 * and interaction capabilities.
 */

import React from 'react';
import type { Badge, Title } from '../../types/Achievement';
import './AchievementItem.css';

interface AchievementItemProps {
  achievement: Badge | Title;
  type: 'badge' | 'title';
  onClick?: (achievement: Badge | Title) => void;
  showProgress?: boolean;
  size?: 'small' | 'medium';
  isActive?: boolean; // For titles - if currently active
}

const AchievementItem: React.FC<AchievementItemProps> = ({
  achievement,
  type,
  onClick,
  showProgress = true,
  size = 'medium',
  isActive = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(achievement);
    }
  };

  const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'common': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatProgress = (progress: number): string => {
    return `${Math.round(progress * 100)}%`;
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 1) return '#10b981';
    if (progress >= 0.7) return '#f59e0b';
    if (progress >= 0.3) return '#3b82f6';
    return '#6b7280';
  };

  const isBadge = (item: Badge | Title): item is Badge => {
    return 'progress' in item;
  };

  const isTitle = (item: Badge | Title): item is Title => {
    return 'active' in item;
  };

  const itemClasses = [
    'achievement-item',
    `achievement-item--${size}`,
    `achievement-item--${type}`,
    `achievement-item--${achievement.rarity}`,
    achievement.unlocked ? 'achievement-item--unlocked' : 'achievement-item--locked',
    isActive ? 'achievement-item--active' : '',
    onClick ? 'achievement-item--clickable' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={itemClasses}
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
        '--rarity-color': getRarityColor(achievement.rarity)
      } as React.CSSProperties}
    >
      {/* Icon Section */}
      <div className="achievement-item__icon-section">
        <div className="achievement-item__icon">
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>
        
        {achievement.unlocked && (
          <div className="achievement-item__unlock-indicator">
            ✨
          </div>
        )}
        
        {type === 'title' && isActive && (
          <div className="achievement-item__active-indicator">
            👑
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="achievement-item__content">
        <div className="achievement-item__header">
          <h4 className="achievement-item__name">
            {achievement.name}
          </h4>
          <span className="achievement-item__rarity">
            {achievement.rarity}
          </span>
        </div>
        
        <p className="achievement-item__description">
          {achievement.description}
        </p>
        
        <div className="achievement-item__requirement">
          {achievement.requirements.description}
        </div>
        
        {/* Progress Section (only for badges and locked items) */}
        {showProgress && isBadge(achievement) && !achievement.unlocked && (
          <div className="achievement-item__progress">
            <div className="achievement-item__progress-bar">
              <div 
                className="achievement-item__progress-fill"
                style={{
                  width: `${achievement.progress * 100}%`,
                  backgroundColor: getProgressColor(achievement.progress)
                }}
              />
            </div>
            <span className="achievement-item__progress-text">
              {formatProgress(achievement.progress)}
            </span>
          </div>
        )}
        
        {/* Unlock Date */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="achievement-item__unlock-date">
            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Type Indicator */}
      <div className="achievement-item__type-indicator">
        {type === 'badge' ? '🏆' : '👑'}
      </div>
    </div>
  );
};

export default AchievementItem;