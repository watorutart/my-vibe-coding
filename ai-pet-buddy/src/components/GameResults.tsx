/**
 * ゲーム結果表示コンポーネント
 */

import React from 'react';
import type { GameResult } from '../types/Game';
import './GameResults.css';

export interface GameResultsProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({
  result,
  onPlayAgain,
  onBackToMenu,
}) => {
  const getGameIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return '🧠';
      case 'reflex':
        return '⚡';
      case 'quiz':
        return '❓';
      default:
        return '🎮';
    }
  };

  const getGameName = (type: string) => {
    switch (type) {
      case 'memory':
        return 'メモリーゲーム';
      case 'reflex':
        return '反射神経ゲーム';
      case 'quiz':
        return 'クイズゲーム';
      default:
        return 'ゲーム';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '簡単';
      case 'medium':
        return '普通';
      case 'hard':
        return '難しい';
      default:
        return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 1500) return { level: 'EXCELLENT', color: '#a855f7', icon: '🏆' };
    if (score >= 1000) return { level: 'GREAT', color: '#3b82f6', icon: '🥇' };
    if (score >= 500) return { level: 'GOOD', color: '#22c55e', icon: '🥈' };
    if (score >= 200) return { level: 'FAIR', color: '#f59e0b', icon: '🥉' };
    return { level: 'NEEDS IMPROVEMENT', color: '#ef4444', icon: '💪' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  const performance = getPerformanceLevel(result.score.points);

  return (
    <div className="game-results">
      <div className="results-header">
        <div className="game-info">
          <span className="game-icon">{getGameIcon(result.type)}</span>
          <div className="game-details">
            <h2>{getGameName(result.type)}</h2>
            <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(result.difficulty) }}>
              {getDifficultyName(result.difficulty)}
            </div>
          </div>
        </div>
        
        <div className="completion-status">
          <div className={`status-badge ${result.success ? 'success' : 'failure'}`}>
            {result.success ? (
              <>
                <span className="status-icon">🎉</span>
                <span>ゲームクリア！</span>
              </>
            ) : (
              <>
                <span className="status-icon">😅</span>
                <span>もう少し！</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="performance-section">
        <div className="performance-level">
          <span className="performance-icon">{performance.icon}</span>
          <span className="performance-text" style={{ color: performance.color }}>
            {performance.level}
          </span>
        </div>
        
        <div className="final-score">
          <span className="score-label">最終スコア</span>
          <span className="score-value">{result.score.points.toLocaleString()}</span>
          <span className="score-unit">pts</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">正答率</div>
            <div className="stat-value">{Math.round(result.score.accuracy * 100)}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">残り時間</div>
            <div className="stat-value">{formatTime(result.score.timeRemaining)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-label">コンボ</div>
            <div className="stat-value">{result.score.combo}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">完了時刻</div>
            <div className="stat-value">
              {result.completedAt.toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rewards-section">
        <h3>🎁 獲得報酬</h3>
        <div className="rewards-grid">
          <div className="reward-item">
            <span className="reward-icon">✨</span>
            <span className="reward-label">経験値</span>
            <span className="reward-value">+{result.reward.experience}</span>
          </div>
          
          <div className="reward-item">
            <span className="reward-icon">😊</span>
            <span className="reward-label">幸福度</span>
            <span className="reward-value">+{result.reward.happiness}</span>
          </div>
          
          <div className="reward-item">
            <span className="reward-icon">⚡</span>
            <span className="reward-label">エネルギー</span>
            <span className={`reward-value ${result.reward.energy < 0 ? 'negative' : 'positive'}`}>
              {result.reward.energy > 0 ? '+' : ''}{result.reward.energy}
            </span>
          </div>
        </div>
      </div>

      <div className="encouragement-message">
        {result.success ? (
          <div className="success-message">
            <p>🌟 素晴らしい結果です！ペットも喜んでいます！</p>
            <p>継続的な練習で更なる高得点を目指しましょう！</p>
          </div>
        ) : (
          <div className="improvement-message">
            <p>🚀 まだまだ伸びしろがあります！</p>
            <p>練習を重ねて、より良いスコアを目指しましょう！</p>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="play-again-button" onClick={onPlayAgain}>
          <span className="button-icon">🔄</span>
          もう一度プレイ
        </button>
        
        <button className="back-to-menu-button" onClick={onBackToMenu}>
          <span className="button-icon">📋</span>
          メニューに戻る
        </button>
      </div>
    </div>
  );
};

export default GameResults;
