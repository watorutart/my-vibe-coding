/**
 * @file AchievementNotificationContainer.tsx
 * @description Container component for managing multiple achievement notifications
 * 
 * Handles positioning, stacking, and lifecycle of achievement notifications.
 */

import React from 'react';
import type { AchievementNotification } from '../../types/Achievement';
import AchievementNotificationComponent from './AchievementNotification';
import './AchievementNotificationContainer.css';

interface AchievementNotificationContainerProps {
  notifications: AchievementNotification[];
  onDismiss: (notificationId: string) => void;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const AchievementNotificationContainer: React.FC<AchievementNotificationContainerProps> = ({
  notifications,
  onDismiss,
  maxVisible = 3,
  position = 'top-right'
}) => {
  // Show only the most recent notifications
  const visibleNotifications = notifications.slice(-maxVisible);

  if (visibleNotifications.length === 0) {
    return null;
  }

  const containerClasses = [
    'achievement-notification-container',
    `achievement-notification-container--${position}`
  ].join(' ');

  return (
    <div className={containerClasses}>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="achievement-notification-container__item"
          style={{
            '--stack-index': index,
            '--total-notifications': visibleNotifications.length
          } as React.CSSProperties}
        >
          <AchievementNotificationComponent
            notification={notification}
            onDismiss={onDismiss}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
};

export default AchievementNotificationContainer;