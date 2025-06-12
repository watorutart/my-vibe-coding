/**
 * 数当てゲームコンポーネント
 */

import React, { useState, useEffect } from 'react';
import type { GameSession } from '../../types/Game';
import type { NumberGuessingData } from '../../types/Game';
import {
  DIFFICULTY_SETTINGS,
  evaluateGuess,
  generateHint,
  getResultMessage,
  getWarningMessage,
  validateGuess
} from '../../utils/numberGuessingLogic';
import './NumberGuessingGame.css';

interface NumberGuessingGameProps {
  session: GameSession;
  onSubmitAnswer: (answer: number) => boolean;
  onEndGame: () => void;
  timeElapsed: number;
}

export const NumberGuessingGame: React.FC<NumberGuessingGameProps> = ({
  session,
  onSubmitAnswer,
  onEndGame,
  timeElapsed
}) => {
  const [gameData, setGameData] = useState<NumberGuessingData>(() => {
    const settings = DIFFICULTY_SETTINGS[session.config.difficulty];
    return session.currentQuestion as NumberGuessingData || {
      targetNumber: 50,
      currentGuess: null,
      attemptsLeft: settings.maxAttempts,
      hints: [],
      minNumber: settings.min,
      maxNumber: settings.max
    };
  });

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const settings = DIFFICULTY_SETTINGS[session.config.difficulty];
  const timeRemaining = session.config.duration - timeElapsed;

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsGameOver(true);
      onEndGame();
    }
  }, [timeRemaining, onEndGame]);

  const handleSubmitGuess = () => {
    if (isGameOver || gameData.attemptsLeft <= 0) return;

    const guess = parseInt(inputValue);
    const validation = validateGuess(guess, session.config.difficulty);

    if (!validation.isValid) {
      setError(validation.errorMessage || 'Invalid input');
      return;
    }

    setError(null);
    const evaluation = evaluateGuess(guess, gameData.targetNumber);
    const hint = generateHint(guess, gameData.targetNumber);

    const newGameData: NumberGuessingData = {
      ...gameData,
      currentGuess: guess,
      attemptsLeft: gameData.attemptsLeft - 1,
      hints: [...gameData.hints, hint]
    };

    setGameData(newGameData);
    setShowHint(true);

    // ゲームエンジンに結果を送信
    const isCorrect = onSubmitAnswer(guess);

    if (evaluation === 'correct' || newGameData.attemptsLeft <= 0) {
      setIsGameOver(true);
      setTimeout(() => {
        onEndGame();
      }, 3000); // 3秒後に自動終了
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitGuess();
    }
  };

  const renderProgressBar = () => {
    const progress = ((settings.maxAttempts - gameData.attemptsLeft) / settings.maxAttempts) * 100;
    const progressColor = gameData.attemptsLeft <= 2 ? '#e74c3c' : 
                         gameData.attemptsLeft <= 4 ? '#f39c12' : '#27ae60';

    return (
      <div className="progress-container">
        <div className="progress-label">
          進捗: {settings.maxAttempts - gameData.attemptsLeft} / {settings.maxAttempts} 回
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: progressColor 
            }}
          />
        </div>
      </div>
    );
  };

  const renderHints = () => {
    if (gameData.hints.length === 0) return null;

    return (
      <div className="hints-section">
        <h3>ヒント履歴</h3>
        <div className="hints-list">
          {gameData.hints.slice(-3).map((hint, index) => (
            <div 
              key={index} 
              className={`hint-item ${index === gameData.hints.slice(-3).length - 1 ? 'latest' : ''}`}
            >
              {hint}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGameInput = () => {
    if (isGameOver) return null;

    const warningMessage = getWarningMessage(gameData.attemptsLeft);

    return (
      <div className="game-input-section">
        {warningMessage && (
          <div className="warning-message">
            {warningMessage}
          </div>
        )}
        
        <div className="input-container">
          <label htmlFor="guess-input" className="input-label">
            {settings.min}〜{settings.max}の数字を入力してください
          </label>
          <div className="input-group">
            <input
              id="guess-input"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              min={settings.min}
              max={settings.max}
              className={`guess-input ${error ? 'error' : ''}`}
              placeholder={`${settings.min}〜${settings.max}`}
              disabled={isGameOver}
            />
            <button 
              className="submit-button"
              onClick={handleSubmitGuess}
              disabled={!inputValue || isGameOver}
            >
              推測
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  };

  const renderGameResult = () => {
    if (!isGameOver) return null;

    const isCorrect = gameData.hints.length > 0 && 
                     gameData.hints[gameData.hints.length - 1].includes('正解');
    const message = getResultMessage(
      isCorrect, 
      settings.maxAttempts - gameData.attemptsLeft, 
      settings.maxAttempts, 
      gameData.targetNumber
    );

    return (
      <div className={`game-result ${isCorrect ? 'success' : 'failure'}`}>
        <h2 className="result-message">{message}</h2>
        
        <div className="result-stats">
          <div className="stat-item">
            <span className="stat-label">正解:</span>
            <span className="stat-value">{gameData.targetNumber}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">試行回数:</span>
            <span className="stat-value">{settings.maxAttempts - gameData.attemptsLeft}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">効率:</span>
            <span className="stat-value">
              {Math.round(((settings.maxAttempts - (settings.maxAttempts - gameData.attemptsLeft) + 1) / settings.maxAttempts) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="number-guessing-game">
      <div className="game-header">
        <h2>🔢 数当てゲーム</h2>
        <div className="game-info">
          <span className="difficulty">
            難易度: {session.config.difficulty.toUpperCase()}
          </span>
          <span className="range">
            範囲: {settings.min}〜{settings.max}
          </span>
          <span className="attempts">
            残り試行: {gameData.attemptsLeft}回
          </span>
          <span className="time-remaining">
            残り時間: {Math.max(0, Math.ceil(timeRemaining))}秒
          </span>
        </div>
      </div>

      <div className="game-content">
        {renderProgressBar()}
        
        <div className="game-description">
          <p>私が思い浮かべた数字を当ててください！</p>
          <p>ヒントを参考に、効率よく正解を見つけましょう。</p>
        </div>

        {renderGameInput()}
        {renderHints()}
        {renderGameResult()}
      </div>

      <div className="game-score">
        <div className="score-item">
          <span>スコア: {session.score.points}pt</span>
        </div>
        <div className="score-item">
          <span>正答率: {Math.round(session.score.accuracy * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default NumberGuessingGame;