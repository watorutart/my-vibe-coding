/**
 * ミニゲームパネル - ゲーム選択とプレイ画面
 */

import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import type { GameConfig, GameDifficulty, GameType } from '../types/Game';
import GameResults from './GameResults';
import MemoryGame from './games/MemoryGame';
import QuizGame from './games/QuizGame';
import ReflexGame from './games/ReflexGame';
import RockPaperScissorsGame from './games/RockPaperScissorsGame';
import NumberGuessingGame from './games/NumberGuessingGame';
import './MiniGamePanel.css';

export interface MiniGamePanelProps {
  onRewardEarned?: (reward: { experience: number; happiness: number; energy: number; coins: number }) => void;
  onClose?: () => void;
}

export const MiniGamePanel: React.FC<MiniGamePanelProps> = ({
  onRewardEarned,
  onClose,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [showResults, setShowResults] = useState(false);

  const {
    currentSession,
    isGameActive,
    timeElapsed,
    startGame,
    playGame,
    submitAnswer,
    forceEndGame,
    availableGames,
    recentResults,
    bestScores,
  } = useGame({
    onGameComplete: (result) => {
      console.log('🏁 ゲーム完了:', result);
      setShowResults(true);
    },
    onRewardGiven: (reward) => {
      console.log('🎁 報酬獲得:', reward);
      onRewardEarned?.({
        experience: reward.experience,
        happiness: reward.happiness,
        energy: reward.energy,
        coins: reward.coins || 0
      });
    },
  });

  const handleGameSelect = (config: GameConfig) => {
    setSelectedGame(config);
    setShowResults(false);
  };

  const handleGameStart = () => {
    if (!selectedGame) return;
    
    try {
      startGame(selectedGame);
      playGame();
    } catch (error) {
      console.error('ゲーム開始エラー:', error);
    }
  };

  const handleGameEnd = () => {
    forceEndGame();
    setSelectedGame(null);
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    if (selectedGame) {
      handleGameStart();
    }
  };

  const handleBackToMenu = () => {
    setShowResults(false);
    setSelectedGame(null);
  };

  const renderGameInterface = () => {
    if (!currentSession) return null;

    const gameType = currentSession.config.type;
    const commonProps = {
      session: currentSession,
      onSubmitAnswer: submitAnswer,
      onEndGame: handleGameEnd,
      timeElapsed,
    };

    switch (gameType) {
      case 'memory':
        return <MemoryGame {...commonProps} />;
      case 'reflex':
        return <ReflexGame {...commonProps} />;
      case 'quiz':
        return <QuizGame {...commonProps} />;
      case 'rock-paper-scissors':
        return <RockPaperScissorsGame {...commonProps} />;
      case 'number-guessing':
        return <NumberGuessingGame {...commonProps} />;
      default:
        return <div className="error">未対応のゲームタイプです</div>;
    }
  };

  const renderGameSelection = () => {
    const gameTypes: { type: GameType; name: string; icon: string; description: string }[] = [
      {
        type: 'memory',
        name: 'メモリーゲーム',
        icon: '🧠',
        description: '表示された色の順序を覚えて再現しよう！',
      },
      {
        type: 'reflex',
        name: '反射神経ゲーム',
        icon: '⚡',
        description: '素早く反応してボタンを押そう！',
      },
      {
        type: 'quiz',
        name: 'クイズゲーム',
        icon: '❓',
        description: 'ペットに関する質問に答えよう！',
      },
      {
        type: 'rock-paper-scissors',
        name: 'じゃんけんゲーム',
        icon: '✊',
        description: 'AIと勝負！連勝を目指そう！',
      },
      {
        type: 'number-guessing',
        name: '数当てゲーム',
        icon: '🔢',
        description: '隠された数字を効率的に当てよう！',
      },
    ];

    const difficulties: { difficulty: GameDifficulty; name: string; color: string }[] = [
      { difficulty: 'easy', name: '簡単', color: 'green' },
      { difficulty: 'medium', name: '普通', color: 'orange' },
      { difficulty: 'hard', name: '難しい', color: 'red' },
    ];

    return (
      <div className="game-selection">
        <h2 className="panel-title">🎮 ミニゲーム</h2>
        
        <div className="game-types">
          {gameTypes.map((game) => (
            <div key={game.type} className="game-type-section">
              <div className="game-type-header">
                <span className="game-icon">{game.icon}</span>
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                </div>
              </div>
              
              <div className="difficulty-buttons">
                {difficulties.map((diff) => {
                  const config = availableGames.find(
                    (g) => g.type === game.type && g.difficulty === diff.difficulty
                  );
                  
                  if (!config) return null;
                  
                  const bestScore = bestScores[`${game.type}_${diff.difficulty}`] || 0;
                  
                  return (
                    <button
                      key={diff.difficulty}
                      className={`difficulty-button ${diff.color}`}
                      onClick={() => handleGameSelect(config)}
                    >
                      <span className="difficulty-name">{diff.name}</span>
                      <span className="difficulty-time">{config.duration}秒</span>
                      {bestScore > 0 && (
                        <span className="best-score">最高: {bestScore}pt</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {recentResults.length > 0 && (
          <div className="recent-results">
            <h3>最近のゲーム結果</h3>
            <div className="results-list">
              {recentResults.slice(0, 3).map((result) => (
                <div key={result.gameId} className="result-item">
                  <span className="result-game">
                    {result.type === 'memory' && '🧠'}
                    {result.type === 'reflex' && '⚡'}
                    {result.type === 'quiz' && '❓'}
                    {result.type === 'rock-paper-scissors' && '✊'}
                    {result.type === 'number-guessing' && '🔢'}
                    {result.difficulty}
                  </span>
                  <span className="result-score">{result.score.points}pt</span>
                  <span className={`result-status ${result.success ? 'success' : 'failure'}`}>
                    {result.success ? '成功' : '失敗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mini-game-panel">
      <div className="panel-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-content">
        {showResults && recentResults.length > 0 ? (
          <GameResults
            result={recentResults[0]}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        ) : currentSession && isGameActive ? (
          <div className="game-interface">
            {renderGameInterface()}
          </div>
        ) : selectedGame ? (
          <div className="game-ready">
            <h2>
              {selectedGame.type === 'memory' && '🧠 メモリーゲーム'}
              {selectedGame.type === 'reflex' && '⚡ 反射神経ゲーム'}
              {selectedGame.type === 'quiz' && '❓ クイズゲーム'}
              {selectedGame.type === 'rock-paper-scissors' && '✊ じゃんけんゲーム'}
              {selectedGame.type === 'number-guessing' && '🔢 数当てゲーム'}
            </h2>
            <div className="game-details">
              <p>難易度: {selectedGame.difficulty}</p>
              <p>制限時間: {selectedGame.duration}秒</p>
            </div>
            <div className="game-actions">
              <button className="start-button" onClick={handleGameStart}>
                ゲーム開始
              </button>
              <button className="back-button" onClick={() => setSelectedGame(null)}>
                戻る
              </button>
            </div>
          </div>
        ) : (
          renderGameSelection()
        )}
      </div>
    </div>
  );
};

export default MiniGamePanel;
