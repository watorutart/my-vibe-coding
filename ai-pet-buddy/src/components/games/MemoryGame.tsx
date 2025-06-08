/**
 * メモリーゲーム - 色の順序を覚えて再現するゲーム
 */

import React, { useEffect, useState } from 'react';
import type { GameSession, MemoryGameData } from '../../types/Game';
import './MemoryGame.css';

export interface MemoryGameProps {
  session: GameSession;
  onSubmitAnswer: (answer: string[]) => boolean;
  onEndGame: () => void;
  timeElapsed: number;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  session,
  onSubmitAnswer,
  onEndGame,
  timeElapsed,
}) => {
  const [gameData, setGameData] = useState<MemoryGameData | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (session.currentQuestion) {
      const data = session.currentQuestion as MemoryGameData;
      setGameData(data);
      setPlayerSequence([]);
      setFeedback('');
      showSequence(data);
    }
  }, [session.currentQuestion]);

  const showSequence = async (data: MemoryGameData) => {
    setIsShowingSequence(true);
    setCurrentSequenceIndex(-1);
    
    // 開始前の待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // シーケンスを順番に表示
    for (let i = 0; i < data.sequence.length; i++) {
      setCurrentSequenceIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentSequenceIndex(-1);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setIsShowingSequence(false);
    setFeedback('順序を覚えましたか？色をクリックして再現してください！');
  };

  const handleColorClick = (color: string) => {
    if (isShowingSequence || !gameData) return;

    const newSequence = [...playerSequence, color];
    setPlayerSequence(newSequence);

    // 完了チェック
    if (newSequence.length === gameData.sequence.length) {
      const isCorrect = onSubmitAnswer(newSequence);
      if (isCorrect) {
        setFeedback('🎉 正解です！');
      } else {
        setFeedback('❌ 間違いです。もう一度挑戦しましょう！');
      }
    }
  };

  const handleReset = () => {
    setPlayerSequence([]);
    setFeedback('リセットしました。再度順序をクリックしてください。');
  };

  const getTimeRemaining = () => {
    return Math.max(0, session.config.duration - timeElapsed);
  };

  const getColorClassName = (color: string, index: number) => {
    const classes = ['color-button', color];
    
    if (isShowingSequence && currentSequenceIndex === index) {
      classes.push('active');
    }
    
    if (!isShowingSequence && playerSequence.includes(color)) {
      const lastClickedIndex = playerSequence.lastIndexOf(color);
      if (lastClickedIndex === playerSequence.length - 1) {
        classes.push('clicked');
      }
    }
    
    return classes.join(' ');
  };

  if (!gameData) {
    return <div className="memory-game loading">ゲームを読み込み中...</div>;
  }

  return (
    <div className="memory-game">
      <div className="game-header">
        <h2>🧠 メモリーゲーム</h2>
        <div className="game-stats">
          <div className="time-remaining">
            ⏰ 残り時間: {Math.floor(getTimeRemaining())}秒
          </div>
          <div className="score">
            📊 スコア: {session.score.points}pts
          </div>
          <div className="accuracy">
            🎯 正答率: {Math.round(session.score.accuracy * 100)}%
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="sequence-display">
          <div className="sequence-length">
            シーケンス長: {gameData.sequence.length}色
          </div>
          
          {isShowingSequence && (
            <div className="showing-sequence">
              <p>順序を覚えてください...</p>
              <div className="sequence-progress">
                {currentSequenceIndex + 1} / {gameData.sequence.length}
              </div>
            </div>
          )}
        </div>

        <div className="color-grid">
          {gameData.colors.map((color, index) => (
            <button
              key={`${color}-${index}`}
              className={getColorClassName(color, gameData.sequence.indexOf(color))}
              onClick={() => handleColorClick(color)}
              disabled={isShowingSequence}
            >
              <span className="color-name">{color}</span>
            </button>
          ))}
        </div>

        <div className="player-sequence">
          <h3>あなたの回答:</h3>
          <div className="sequence-display">
            {playerSequence.map((color, index) => (
              <div key={index} className={`sequence-item ${color}`}>
                {index + 1}
              </div>
            ))}
            {playerSequence.length < gameData.sequence.length && (
              <div className="sequence-item empty">
                {playerSequence.length + 1}
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div className={`feedback ${feedback.includes('正解') ? 'success' : feedback.includes('間違い') ? 'error' : 'info'}`}>
            {feedback}
          </div>
        )}

        <div className="game-actions">
          {!isShowingSequence && playerSequence.length > 0 && playerSequence.length < gameData.sequence.length && (
            <button className="reset-button" onClick={handleReset}>
              リセット
            </button>
          )}
          <button className="end-game-button" onClick={onEndGame}>
            ゲーム終了
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
