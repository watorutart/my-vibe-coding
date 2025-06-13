/**
 * じゃんけんゲームコンポーネント
 */

import React, { useState, useEffect } from 'react';
import type { GameSession } from '../../types/Game';
import type { RockPaperScissorsData } from '../../types/Game';
import {
  determineWinner,
  generateAIChoice,
  getChoiceIcon,
  getChoiceName,
  getResultMessage,
  type Choice
} from '../../utils/rockPaperScissorsLogic';
import './RockPaperScissorsGame.css';

interface RockPaperScissorsGameProps {
  session: GameSession;
  onSubmitAnswer: (answer: Choice) => boolean;
  onEndGame: () => void;
  timeElapsed: number;
}

export const RockPaperScissorsGame: React.FC<RockPaperScissorsGameProps> = ({
  session,
  onSubmitAnswer,
  onEndGame,
  timeElapsed
}) => {
  const [gameData, setGameData] = useState<RockPaperScissorsData>(() => {
    return session.currentQuestion as RockPaperScissorsData || {
      playerChoice: null,
      aiChoice: null,
      result: null,
      consecutiveWins: 0,
      totalRounds: 5,
      currentRound: 1
    };
  });

  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const choices: Choice[] = ['rock', 'paper', 'scissors'];
  const timeRemaining = session.config.duration - timeElapsed;

  useEffect(() => {
    if (timeRemaining <= 0) {
      onEndGame();
    }
  }, [timeRemaining, onEndGame]);

  const handleChoice = async (choice: Choice) => {
    if (isAnimating || showResult) return;

    setIsAnimating(true);
    const aiChoice = generateAIChoice();
    const result = determineWinner(choice, aiChoice);

    // じゃんけんの「ポン！」演出
    setTimeout(() => {
      const newGameData: RockPaperScissorsData = {
        playerChoice: choice,
        aiChoice,
        result,
        consecutiveWins: result === 'win' ? gameData.consecutiveWins + 1 : 0,
        totalRounds: gameData.totalRounds,
        currentRound: gameData.currentRound
      };

      setGameData(newGameData);
      setShowResult(true);
      setIsAnimating(false);

      // 結果をゲームエンジンに送信
      onSubmitAnswer(choice);
    }, 1500); // 1.5秒のアニメーション
  };

  const handleNextRound = () => {
    if (gameData.currentRound >= gameData.totalRounds) {
      onEndGame();
      return;
    }

    setGameData(prev => ({
      ...prev,
      playerChoice: null,
      aiChoice: null,
      result: null,
      currentRound: prev.currentRound + 1
    }));
    setShowResult(false);
  };

  const renderChoiceButtons = () => (
    <div className="choice-buttons">
      {choices.map((choice) => (
        <button
          key={choice}
          className={`choice-button ${isAnimating ? 'disabled' : ''}`}
          onClick={() => handleChoice(choice)}
          disabled={isAnimating || showResult}
        >
          <span className="choice-icon">{getChoiceIcon(choice)}</span>
          <span className="choice-name">{getChoiceName(choice)}</span>
        </button>
      ))}
    </div>
  );

  const renderGameAnimation = () => (
    <div className="game-animation">
      <div className="player-side">
        <h3>あなた</h3>
        <div className={`choice-display ${isAnimating ? 'animating' : ''}`}>
          {gameData.playerChoice ? getChoiceIcon(gameData.playerChoice) : '❓'}
        </div>
      </div>
      
      <div className="vs-indicator">
        <span className={`vs-text ${isAnimating ? 'pulsing' : ''}`}>
          {isAnimating ? 'じゃん けん...' : 'VS'}
        </span>
      </div>
      
      <div className="ai-side">
        <h3>AI</h3>
        <div className={`choice-display ${isAnimating ? 'animating' : ''}`}>
          {gameData.aiChoice ? getChoiceIcon(gameData.aiChoice) : '❓'}
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!showResult || !gameData.result) return null;

    return (
      <div className={`result-display ${gameData.result}`}>
        <h2 className="result-message">{getResultMessage(gameData.result)}</h2>
        
        {gameData.result === 'win' && gameData.consecutiveWins > 1 && (
          <div className="consecutive-bonus">
            🔥 {gameData.consecutiveWins}連勝！ボーナス獲得！
          </div>
        )}
        
        <div className="result-choices">
          <div className="result-choice">
            <span>あなた: {getChoiceName(gameData.playerChoice!)}</span>
            <span>{getChoiceIcon(gameData.playerChoice!)}</span>
          </div>
          <div className="result-choice">
            <span>AI: {getChoiceName(gameData.aiChoice!)}</span>
            <span>{getChoiceIcon(gameData.aiChoice!)}</span>
          </div>
        </div>

        <button className="next-button" onClick={handleNextRound}>
          {gameData.currentRound >= gameData.totalRounds ? 'ゲーム終了' : '次のラウンド'}
        </button>
      </div>
    );
  };

  return (
    <div className="rock-paper-scissors-game">
      <div className="game-header">
        <h2>✊ じゃんけんゲーム</h2>
        <div className="game-info">
          <span className="round-counter">
            ラウンド {gameData.currentRound} / {gameData.totalRounds}
          </span>
          <span className="consecutive-wins">
            連勝: {gameData.consecutiveWins}
          </span>
          <span className="time-remaining">
            残り時間: {Math.max(0, Math.ceil(timeRemaining))}秒
          </span>
        </div>
      </div>

      <div className="game-content">
        {renderGameAnimation()}
        
        {!showResult && !isAnimating && (
          <div className="choice-section">
            <p className="instruction">あなたの手を選んでください</p>
            {renderChoiceButtons()}
          </div>
        )}

        {isAnimating && (
          <div className="animation-message">
            <h3>ポン！</h3>
          </div>
        )}

        {renderResult()}
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

export default RockPaperScissorsGame;