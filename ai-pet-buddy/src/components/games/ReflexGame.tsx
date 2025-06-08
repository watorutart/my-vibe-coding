/**
 * 反射神経ゲーム - 素早い反応を測定するゲーム
 */

import React, { useCallback, useEffect, useState } from 'react';
import type { GameSession, ReflexGameData } from '../../types/Game';
import './ReflexGame.css';

export interface ReflexGameProps {
  session: GameSession;
  onSubmitAnswer: (answer: number) => boolean;
  onEndGame: () => void;
  timeElapsed: number;
}

export const ReflexGame: React.FC<ReflexGameProps> = ({
  session,
  onSubmitAnswer,
  onEndGame,
  timeElapsed,
}) => {
  const [gameData, setGameData] = useState<ReflexGameData | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isShowingStimulus, setIsShowingStimulus] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (session.currentQuestion) {
      const data = session.currentQuestion as ReflexGameData;
      setGameData(data);
      setFeedback('準備ができたら「開始」ボタンを押してください');
      setIsReady(false);
      setIsWaiting(false);
      setIsShowingStimulus(false);
      setLastReactionTime(null);
    }
  }, [session.currentQuestion]);

  const startReaction = useCallback(async () => {
    if (!gameData) return;

    setIsReady(true);
    setFeedback('刺激が現れるまで待ってください...');
    setIsWaiting(true);
    setIsShowingStimulus(false);

    // ランダムな待機時間（1-4秒）
    const waitTime = 1000 + Math.random() * 3000;
    
    setTimeout(() => {
      setIsWaiting(false);
      setIsShowingStimulus(true);
      setReactionStartTime(Date.now());
      setFeedback(getStimulusMessage(gameData.stimulus));
    }, waitTime);
  }, [gameData]);

  const handleReaction = useCallback(() => {
    if (!isShowingStimulus || !reactionStartTime) return;

    const reactionTime = Date.now() - reactionStartTime;
    setLastReactionTime(reactionTime);
    setIsShowingStimulus(false);
    setIsReady(false);

    // 回答を提出
    const isCorrect = onSubmitAnswer(reactionTime);
    
    if (isCorrect) {
      setFeedback(`🎉 素晴らしい！反応時間: ${reactionTime}ms (目標: ${gameData?.targetTime}ms以下)`);
    } else {
      setFeedback(`⏰ 少し遅いですね。反応時間: ${reactionTime}ms (目標: ${gameData?.targetTime}ms以下)`);
    }
  }, [isShowingStimulus, reactionStartTime, onSubmitAnswer, gameData]);

  const getStimulusMessage = (stimulus: string): string => {
    switch (stimulus) {
      case 'green-light':
        return '🟢 緑色のライトが点灯！今すぐクリック！';
      case 'red-light':
        return '🔴 赤色のライトが点灯！今すぐクリック！';
      case 'sound-beep':
        return '🔊 ビープ音が鳴りました！今すぐクリック！';
      case 'flash':
        return '⚡ フラッシュ！今すぐクリック！';
      default:
        return '今すぐクリック！';
    }
  };

  const getStimulusClass = (stimulus: string): string => {
    switch (stimulus) {
      case 'green-light':
        return 'stimulus-green';
      case 'red-light':
        return 'stimulus-red';
      case 'sound-beep':
        return 'stimulus-sound';
      case 'flash':
        return 'stimulus-flash';
      default:
        return '';
    }
  };

  const getTimeRemaining = () => {
    return Math.max(0, session.config.duration - timeElapsed);
  };

  const getTargetDescription = () => {
    if (!gameData) return '';
    
    if (gameData.targetTime >= 1000) {
      return `${gameData.targetTime / 1000}秒`;
    }
    return `${gameData.targetTime}ミリ秒`;
  };

  if (!gameData) {
    return <div className="reflex-game loading">ゲームを読み込み中...</div>;
  }

  return (
    <div className="reflex-game">
      <div className="game-header">
        <h2>⚡ 反射神経ゲーム</h2>
        <div className="game-stats">
          <div className="time-remaining">
            ⏰ 残り時間: {Math.floor(getTimeRemaining())}秒
          </div>
          <div className="target-time">
            🎯 目標時間: {getTargetDescription()}以下
          </div>
          <div className="score">
            📊 スコア: {session.score.points}pts
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="reaction-area">
          {!isReady ? (
            <div className="start-section">
              <button 
                className="start-reaction-button"
                onClick={startReaction}
                disabled={isWaiting || isShowingStimulus}
              >
                反応テスト開始
              </button>
              <p className="instructions">
                刺激が現れたら素早くボタンをクリックしてください
              </p>
            </div>
          ) : (
            <div className={`stimulus-area ${isShowingStimulus ? getStimulusClass(gameData.stimulus) : ''}`}>
              {isWaiting && (
                <div className="waiting-message">
                  <div className="waiting-spinner">⏳</div>
                  <p>刺激が現れるまで待ってください...</p>
                </div>
              )}
              
              {isShowingStimulus && (
                <button 
                  className="reaction-button"
                  onClick={handleReaction}
                >
                  <div className="stimulus-display">
                    {gameData.stimulus === 'green-light' && '🟢'}
                    {gameData.stimulus === 'red-light' && '🔴'}
                    {gameData.stimulus === 'sound-beep' && '🔊'}
                    {gameData.stimulus === 'flash' && '⚡'}
                  </div>
                  <span>クリック！</span>
                </button>
              )}
            </div>
          )}
        </div>

        {lastReactionTime !== null && (
          <div className="reaction-result">
            <h3>前回の結果</h3>
            <div className="result-details">
              <div className="reaction-time">
                反応時間: <span className="time-value">{lastReactionTime}ms</span>
              </div>
              <div className="target-comparison">
                目標: {gameData.targetTime}ms以下
                <span className={`comparison ${lastReactionTime <= gameData.targetTime ? 'success' : 'miss'}`}>
                  {lastReactionTime <= gameData.targetTime ? ' ✅ 達成' : ' ❌ 未達成'}
                </span>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className={`feedback ${
            feedback.includes('素晴らしい') ? 'success' : 
            feedback.includes('遅い') ? 'warning' : 'info'
          }`}>
            {feedback}
          </div>
        )}

        <div className="difficulty-info">
          <h3>難易度情報</h3>
          <p>
            <strong>{session.config.difficulty}</strong> - 
            目標反応時間: {getTargetDescription()}以下
          </p>
          <div className="tips">
            💡 ヒント: フライングはペナルティです。刺激が現れてからクリックしてください。
          </div>
        </div>

        <div className="game-actions">
          {!isReady && !isWaiting && (
            <button className="retry-button" onClick={startReaction}>
              もう一度挑戦
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

export default ReflexGame;
