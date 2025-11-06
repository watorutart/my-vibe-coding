/**
 * クイズゲーム - ペットに関する質問に答えるゲーム
 */

import React, { useEffect, useState } from 'react';
import type { GameSession, QuizGameData } from '../../types/Game';
import './QuizGame.css';

export interface QuizGameProps {
  session: GameSession;
  onSubmitAnswer: (answer: number) => boolean;
  onEndGame: () => void;
  timeElapsed: number;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  session,
  onSubmitAnswer,
  onEndGame,
  timeElapsed,
}) => {
  const [gameData, setGameData] = useState<QuizGameData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (session.currentQuestion) {
      const data = session.currentQuestion as QuizGameData;
      setGameData(data);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setFeedback('');
      setShowExplanation(false);
    }
  }, [session.currentQuestion]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return;

    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || hasAnswered || !gameData) return;

    const isCorrect = onSubmitAnswer(selectedAnswer);
    setHasAnswered(true);

    if (isCorrect) {
      setFeedback('🎉 正解です！');
    } else {
      setFeedback(
        `❌ 不正解です。正解は「${gameData.options[gameData.correctAnswer]}」でした。`
      );
    }

    if (gameData.explanation) {
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    // ゲームエンジンが次の問題を自動生成するため、
    // 現在の問題をリセットして次の問題を待つ
    setGameData(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setFeedback('');
    setShowExplanation(false);
  };

  const getTimeRemaining = () => {
    return Math.max(0, session.config.duration - timeElapsed);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pet':
        return '🐕';
      case 'general':
        return '📚';
      default:
        return '❓';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'pet':
        return 'ペット';
      case 'general':
        return '一般知識';
      default:
        return 'その他';
    }
  };

  if (!gameData) {
    return <div className="quiz-game loading">次の問題を読み込み中...</div>;
  }

  return (
    <div className="quiz-game">
      <div className="game-header">
        <h2>❓ クイズゲーム</h2>
        <div className="game-stats">
          <div className="time-remaining">
            ⏰ 残り時間: {Math.floor(getTimeRemaining())}秒
          </div>
          <div className="score">📊 スコア: {session.score.points}pts</div>
          <div className="accuracy">
            🎯 正答率: {Math.round(session.score.accuracy * 100)}%
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="question-section">
          <div className="question-header">
            <span className="category-badge">
              {getCategoryIcon(gameData.category)}{' '}
              {getCategoryName(gameData.category)}
            </span>
            <span className="question-number">
              問題 {(session.score.combo || 0) + 1}
            </span>
          </div>

          <div className="question-content">
            <h3 className="question-text">{gameData.question}</h3>
          </div>
        </div>

        <div className="answers-section">
          <div className="answer-options">
            {gameData.options.map((option, index) => {
              let className = 'answer-option';

              if (hasAnswered) {
                if (index === gameData.correctAnswer) {
                  className += ' correct';
                } else if (
                  index === selectedAnswer &&
                  selectedAnswer !== gameData.correctAnswer
                ) {
                  className += ' incorrect';
                }
              } else if (selectedAnswer === index) {
                className += ' selected';
              }

              return (
                <button
                  key={index}
                  className={className}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                  {hasAnswered && index === gameData.correctAnswer && (
                    <span className="correct-icon">✅</span>
                  )}
                  {hasAnswered &&
                    index === selectedAnswer &&
                    selectedAnswer !== gameData.correctAnswer && (
                      <span className="incorrect-icon">❌</span>
                    )}
                </button>
              );
            })}
          </div>
        </div>

        {feedback && (
          <div
            className={`feedback ${feedback.includes('正解') ? 'success' : 'error'}`}
          >
            {feedback}
          </div>
        )}

        {showExplanation && gameData.explanation && (
          <div className="explanation">
            <h4>💡 解説</h4>
            <p>{gameData.explanation}</p>
          </div>
        )}

        <div className="game-actions">
          {!hasAnswered ? (
            <button
              className="submit-button"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              回答する
            </button>
          ) : (
            <button className="next-button" onClick={handleNextQuestion}>
              次の問題
            </button>
          )}
          <button className="end-game-button" onClick={onEndGame}>
            ゲーム終了
          </button>
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (timeElapsed / session.config.duration) * 100)}%`,
              }}
            />
          </div>
          <div className="progress-info">
            <span>経過時間: {Math.floor(timeElapsed)}秒</span>
            <span>残り時間: {Math.floor(getTimeRemaining())}秒</span>
          </div>
        </div>

        <div className="difficulty-info">
          <h4>難易度: {session.config.difficulty}</h4>
          <div className="tips">
            💡 ヒント:
            時間内にできるだけ多くの問題に正解して高得点を目指しましょう！
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
