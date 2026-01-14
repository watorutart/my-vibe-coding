/**
 * じゃんけんゲームコンポーネントのテスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RockPaperScissorsGame from './RockPaperScissorsGame';
import type { GameSession } from '../../types/Game';

const createMockSession = (): GameSession => ({
  gameId: 'test-game-1',
  config: {
    type: 'rock-paper-scissors',
    difficulty: 'easy',
    duration: 30,
  },
  status: 'playing',
  startTime: new Date(),
  score: {
    points: 0,
    accuracy: 0,
    timeRemaining: 30,
    combo: 0,
  },
  currentQuestion: {
    playerChoice: null,
    aiChoice: null,
    result: null,
    consecutiveWins: 0,
    totalRounds: 5,
    currentRound: 1,
  },
  questionHistory: [],
});

describe('RockPaperScissorsGame', () => {
  const mockProps = {
    session: createMockSession(),
    onSubmitAnswer: vi.fn(),
    onEndGame: vi.fn(),
    timeElapsed: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render game title and basic information', () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    expect(screen.getByText('✊ じゃんけんゲーム')).toBeInTheDocument();
    expect(screen.getByText(/ラウンド 1 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText(/連勝: 0/)).toBeInTheDocument();
    expect(screen.getByText(/残り時間: 30秒/)).toBeInTheDocument();
  });

  it('should render choice buttons', () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    expect(screen.getByText('グー')).toBeInTheDocument();
    expect(screen.getByText('パー')).toBeInTheDocument();
    expect(screen.getByText('チョキ')).toBeInTheDocument();
  });

  it('should show instruction text', () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    expect(screen.getByText('あなたの手を選んでください')).toBeInTheDocument();
  });

  it('should handle choice selection', async () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    const rockButton = screen.getByText('グー').closest('button');
    expect(rockButton).toBeInTheDocument();

    fireEvent.click(rockButton!);

    // アニメーション中は「ポン！」が表示される
    await waitFor(() => {
      expect(screen.getByText('ポン！')).toBeInTheDocument();
    });

    // アニメーション完了後、結果が表示される
    await waitFor(
      () => {
        expect(mockProps.onSubmitAnswer).toHaveBeenCalledWith('rock');
      },
      { timeout: 2000 }
    );
  });

  it('should disable buttons during animation', async () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    const rockButton = screen.getByText('グー').closest('button');

    fireEvent.click(rockButton!);

    // アニメーション中は選択ボタンが非表示になり、「ポン！」メッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('ポン！')).toBeInTheDocument();
    });

    // 選択ボタンが非表示になっているかチェック
    expect(
      screen.queryByText('あなたの手を選んでください')
    ).not.toBeInTheDocument();
  });

  it('should call onEndGame when time runs out', () => {
    const propsWithTimeUp = {
      ...mockProps,
      timeElapsed: 35, // 制限時間の30秒を超過
    };

    render(<RockPaperScissorsGame {...propsWithTimeUp} />);

    expect(mockProps.onEndGame).toHaveBeenCalled();
  });

  it('should display game score', () => {
    const sessionWithScore = {
      ...mockProps.session,
      score: {
        points: 150,
        accuracy: 0.8,
        timeRemaining: 20,
        combo: 2,
      },
    };

    render(<RockPaperScissorsGame {...mockProps} session={sessionWithScore} />);

    expect(screen.getByText('スコア: 150pt')).toBeInTheDocument();
    expect(screen.getByText('正答率: 80%')).toBeInTheDocument();
  });

  it('should update time remaining correctly', () => {
    const { rerender } = render(<RockPaperScissorsGame {...mockProps} />);

    expect(screen.getByText('残り時間: 30秒')).toBeInTheDocument();

    rerender(<RockPaperScissorsGame {...mockProps} timeElapsed={10} />);

    expect(screen.getByText('残り時間: 20秒')).toBeInTheDocument();
  });

  it('should show VS indicator', () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('should display player and AI sections', () => {
    render(<RockPaperScissorsGame {...mockProps} />);

    expect(screen.getByText('あなた')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });
});
