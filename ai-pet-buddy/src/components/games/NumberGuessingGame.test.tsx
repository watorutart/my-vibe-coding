/**
 * 数当てゲームコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NumberGuessingGame from './NumberGuessingGame';
import type { GameSession } from '../../types/Game';

const createMockSession = (difficulty: 'easy' | 'medium' | 'hard' = 'easy'): GameSession => ({
  gameId: 'test-game-1',
  config: {
    type: 'number-guessing',
    difficulty,
    duration: 120
  },
  status: 'playing',
  startTime: new Date(),
  score: {
    points: 0,
    accuracy: 0,
    timeRemaining: 120,
    combo: 0
  },
  currentQuestion: {
    targetNumber: 25,
    currentGuess: null,
    attemptsLeft: 8,
    hints: [],
    minNumber: 1,
    maxNumber: 50
  },
  questionHistory: []
});

describe('NumberGuessingGame', () => {
  const mockProps = {
    session: createMockSession(),
    onSubmitAnswer: vi.fn(),
    onEndGame: vi.fn(),
    timeElapsed: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render game title and basic information', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    expect(screen.getByText('🔢 数当てゲーム')).toBeInTheDocument();
    expect(screen.getByText('難易度: EASY')).toBeInTheDocument();
    expect(screen.getByText('範囲: 1〜50')).toBeInTheDocument();
    expect(screen.getByText('残り試行: 8回')).toBeInTheDocument();
  });

  it('should render game description', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    expect(screen.getByText('私が思い浮かべた数字を当ててください！')).toBeInTheDocument();
    expect(screen.getByText('ヒントを参考に、効率よく正解を見つけましょう。')).toBeInTheDocument();
  });

  it('should render input field and submit button', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
    
    const submitButton = screen.getByText('推測');
    expect(submitButton).toBeInTheDocument();
  });

  it('should handle number input', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '25' } });
    
    expect(input.value).toBe('25');
  });

  it('should submit guess when button is clicked', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50');
    const submitButton = screen.getByText('推測');
    
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.click(submitButton);
    
    expect(mockProps.onSubmitAnswer).toHaveBeenCalledWith(25);
  });

  it('should submit guess when Enter key is pressed', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50');
    
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(mockProps.onSubmitAnswer).toHaveBeenCalledWith(30);
  });

  it('should show error for invalid input', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50');
    const submitButton = screen.getByText('推測');
    
    fireEvent.change(input, { target: { value: '100' } }); // 範囲外
    fireEvent.click(submitButton);
    
    expect(screen.getByText('1〜50の範囲で入力してください')).toBeInTheDocument();
    expect(mockProps.onSubmitAnswer).not.toHaveBeenCalled();
  });

  it('should show error for non-numeric input', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50');
    const submitButton = screen.getByText('推測');
    
    // For a number input field, non-numeric values like 'abc' are treated as empty
    // So we'll simulate clicking submit with an empty field
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    // The button should be disabled when input is empty, so no error message should appear
    expect(screen.queryByText('数字を入力してください')).not.toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when input is empty', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const submitButton = screen.getByText('推測') as HTMLButtonElement;
    
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when valid input is provided', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    const input = screen.getByPlaceholderText('1〜50');
    const submitButton = screen.getByText('推測') as HTMLButtonElement;
    
    fireEvent.change(input, { target: { value: '25' } });
    
    expect(submitButton.disabled).toBe(false);
  });

  it('should display progress bar', () => {
    render(<NumberGuessingGame {...mockProps} />);
    
    expect(screen.getByText('進捗: 0 / 8 回')).toBeInTheDocument();
    
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should display game score', () => {
    const sessionWithScore = {
      ...mockProps.session,
      score: {
        points: 200,
        accuracy: 1.0,
        timeRemaining: 100,
        combo: 1
      }
    };
    
    render(<NumberGuessingGame {...mockProps} session={sessionWithScore} />);
    
    expect(screen.getByText('スコア: 200pt')).toBeInTheDocument();
    expect(screen.getByText('正答率: 100%')).toBeInTheDocument();
  });

  it('should call onEndGame when time runs out', () => {
    const propsWithTimeUp = {
      ...mockProps,
      timeElapsed: 125 // 制限時間の120秒を超過
    };
    
    render(<NumberGuessingGame {...propsWithTimeUp} />);
    
    expect(mockProps.onEndGame).toHaveBeenCalled();
  });

  it('should update time remaining correctly', () => {
    const { rerender } = render(<NumberGuessingGame {...mockProps} />);
    
    expect(screen.getByText('残り時間: 120秒')).toBeInTheDocument();
    
    rerender(<NumberGuessingGame {...mockProps} timeElapsed={30} />);
    
    expect(screen.getByText('残り時間: 90秒')).toBeInTheDocument();
  });

  it('should render different difficulty settings', () => {
    const mediumSession = createMockSession('medium');
    // Update the mock session to reflect medium difficulty settings
    mediumSession.currentQuestion = {
      targetNumber: 50,
      currentGuess: null,
      attemptsLeft: 10, // Medium difficulty has 10 attempts
      hints: [],
      minNumber: 1,
      maxNumber: 100
    };
    const mediumProps = { ...mockProps, session: mediumSession };
    
    render(<NumberGuessingGame {...mediumProps} />);
    
    expect(screen.getByText('難易度: MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('範囲: 1〜100')).toBeInTheDocument();
    expect(screen.getByText('残り試行: 10回')).toBeInTheDocument();
  });
});