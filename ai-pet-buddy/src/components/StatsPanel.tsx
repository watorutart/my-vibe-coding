import React from 'react';
import type { PetStats } from '../types/Pet';
import './StatsPanel.css';

interface StatsPanelProps {
  stats: PetStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const getStatColor = (value: number) => {
    if (value >= 70) return '#4CAF50'; // Green
    if (value >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'happiness':
        return '😊';
      case 'hunger':
        return '🍽️';
      case 'energy':
        return '⚡';
      case 'level':
        return '⭐';
      default:
        return '📊';
    }
  };

  const StatBar = ({
    label,
    value,
    maxValue = 100,
  }: {
    label: string;
    value: number;
    maxValue?: number;
  }) => {
    // レベルは整数表示、他のステータスは小数点1桁までの表示に制限
    const displayValue =
      label.toLowerCase() === 'level'
        ? Math.round(value)
        : Math.round(value * 10) / 10;

    return (
      <div className="stat-item">
        <div className="stat-header">
          <span className="stat-icon">{getStatIcon(label.toLowerCase())}</span>
          <span className="stat-label">{label}</span>
          <span className="stat-value">
            {displayValue}/{maxValue}
          </span>
        </div>
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{
              width: `${(value / maxValue) * 100}%`,
              backgroundColor: getStatColor(value),
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="stats-panel">
      <h3 className="stats-title">Pet Status</h3>
      <div className="stats-container">
        <StatBar label="Happiness" value={stats.happiness} />
        <StatBar label="Hunger" value={100 - stats.hunger} />{' '}
        {/* Invert hunger so full = good */}
        <StatBar label="Energy" value={stats.energy} />
        <StatBar label="Level" value={stats.level} maxValue={10} />
      </div>
    </div>
  );
};

export default StatsPanel;
