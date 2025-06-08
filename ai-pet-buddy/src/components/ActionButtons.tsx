import React from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  onGames?: () => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onFeed, onPlay, onRest, onGames, disabled = false }) => {
  const buttons = [
    {
      id: 'feed',
      label: 'Feed',
      icon: '🍖',
      onClick: onFeed,
      color: '#e74c3c',
      description: 'Reduce hunger'
    },
    {
      id: 'play',
      label: 'Play',
      icon: '🎾',
      onClick: onPlay,
      color: '#3498db',
      description: 'Increase happiness'
    },
    {
      id: 'rest',
      label: 'Rest',
      icon: '😴',
      onClick: onRest,
      color: '#9b59b6',
      description: 'Restore energy'
    },
    ...(onGames ? [{
      id: 'games',
      label: 'Games',
      icon: '🎮',
      onClick: onGames,
      color: '#f39c12',
      description: 'Play mini-games'
    }] : [])
  ];

  return (
    <div className="action-buttons">
      <h3 className="actions-title">Pet Actions</h3>
      <div className="buttons-container">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`action-btn ${button.id}-btn`}
            onClick={button.onClick}
            disabled={disabled}
            style={{ '--btn-color': button.color } as React.CSSProperties}
            title={button.description}
          >
            <div className="btn-icon">{button.icon}</div>
            <div className="btn-label">{button.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
