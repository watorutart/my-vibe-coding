/**
 * @file AchievementNotification.tsx
 * @description Toast notification component for achievement unlocks
 * 
 * Displays a celebratory notification when achievements are unlocked,
 * with auto-dismiss functionality and manual dismiss option.
 */

import React, { useEffect, useState } from 'react';
import type { AchievementNotification as NotificationType } from '../../types/Achievement';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  notification: NotificationType;
  onDismiss: (notificationId: string) => void;
  duration?: number; // milliseconds
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  notification,
  onDismiss,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    // Call onDismiss immediately for testing and immediate response
    onDismiss(notification.id);
  };

  const getRarityColor = (rarity: NotificationType['rarity']): string => {
    switch (rarity) {
      case 'common': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: NotificationType['type']): string => {
    return type === 'badge' ? '🏆' : '👑';
  };

  const notificationClasses = [
    'achievement-notification',
    `achievement-notification--${notification.rarity}`,
    `achievement-notification--${notification.type}`,
    isVisible ? 'achievement-notification--visible' : '',
    isLeaving ? 'achievement-notification--leaving' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={notificationClasses}
      style={{
        '--rarity-color': getRarityColor(notification.rarity)
      } as React.CSSProperties}
    >
      <div className="achievement-notification__content">
        <div className="achievement-notification__header">
          <div className="achievement-notification__icon-container">
            <span className="achievement-notification__type-icon">
              {getTypeIcon(notification.type)}
            </span>
            <span className="achievement-notification__main-icon">
              {notification.icon}
            </span>
          </div>
          <div className="achievement-notification__text">
            <div className="achievement-notification__title">
              {notification.type === 'badge' ? 'Achievement Unlocked!' : 'New Title Earned!'}
            </div>
            <div className="achievement-notification__name">
              {notification.name}
            </div>
          </div>
        </div>
        
        <div className="achievement-notification__description">
          {notification.description}
        </div>
        
        <div className="achievement-notification__rarity">
          {notification.rarity}
        </div>
      </div>

      <button 
        className="achievement-notification__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        ✕
      </button>

      {/* Sparkle effects for special rarities */}
      {(notification.rarity === 'epic' || notification.rarity === 'legendary') && (
        <div className="achievement-notification__sparkles">
          <span className="sparkle sparkle--1">✨</span>
          <span className="sparkle sparkle--2">⭐</span>
          <span className="sparkle sparkle--3">💫</span>
        </div>
      )}
    </div>
  );
};

export default AchievementNotification;