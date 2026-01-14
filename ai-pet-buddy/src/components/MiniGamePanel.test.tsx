/**
 * MiniGamePanel 統合テスト
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MiniGamePanel } from './MiniGamePanel';

// モックの設定
vi.mock('../hooks/useGame', () => ({
  useGame: vi.fn(() => ({
    currentSession: null,
    isGameActive: false,
    timeElapsed: 0,
    startGame: vi.fn(),
    playGame: vi.fn(),
    submitAnswer: vi.fn(),
    forceEndGame: vi.fn(),
    availableGames: [
      {
        type: 'memory',
        difficulty: 'easy',
        duration: 30,
        name: 'メモリーゲーム（簡単）',
        description: '短い順序を覚えよう',
        points: { correct: 10, wrong: -2, bonus: 5 },
      },
      {
        type: 'rock-paper-scissors',
        difficulty: 'easy',
        duration: 60,
        name: 'じゃんけん（簡単）',
        description: 'AIと勝負！',
        points: { correct: 15, wrong: -3, bonus: 10 },
      },
      {
        type: 'number-guessing',
        difficulty: 'easy',
        duration: 120,
        name: '数当て（簡単）',
        description: '1-50の数字を当てよう',
        points: { correct: 20, wrong: -5, bonus: 15 },
      },
    ],
    recentResults: [],
    bestScores: {},
  })),
}));

describe('MiniGamePanel', () => {
  const mockOnRewardEarned = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ゲーム選択画面', () => {
    it('should render game selection with all available games', () => {
      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      // タイトルの確認
      expect(screen.getByText('🎮 ミニゲーム')).toBeInTheDocument();

      // 各ゲームタイプの表示確認
      expect(screen.getByText(/メモリーゲーム/)).toBeInTheDocument();
      expect(screen.getByText(/じゃんけん/)).toBeInTheDocument();
      expect(screen.getByText(/数当て/)).toBeInTheDocument();

      // ゲームアイコンの確認
      expect(screen.getByText('🧠')).toBeInTheDocument();
      expect(screen.getByText('✊')).toBeInTheDocument();
      expect(screen.getByText('🔢')).toBeInTheDocument();
    });

    it('should display difficulty buttons for each game', () => {
      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      // 難易度ボタンの確認
      const easyButtons = screen.getAllByText('簡単');
      expect(easyButtons.length).toBeGreaterThan(0);
    });

    it('should show game descriptions', () => {
      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      // ゲーム説明の確認 (実際にコンポーネントに表示される説明文)
      expect(
        screen.getByText('表示された色の順序を覚えて再現しよう！')
      ).toBeInTheDocument();
      expect(
        screen.getByText('AIと勝負！連勝を目指そう！')
      ).toBeInTheDocument();
      expect(
        screen.getByText('隠された数字を効率的に当てよう！')
      ).toBeInTheDocument();
    });
  });

  describe('クローズボタン', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ゲーム統合', () => {
    it('should handle rock-paper-scissors game integration', async () => {
      const mockUseGame = vi.fn(() => ({
        currentSession: {
          gameId: 'test-game',
          config: {
            type: 'rock-paper-scissors',
            difficulty: 'easy',
            duration: 60,
            name: 'じゃんけん（簡単）',
          },
          status: 'playing',
          startTime: new Date(),
          score: { points: 0, accuracy: 0, timeRemaining: 60, combo: 0 },
          questionHistory: [],
          currentQuestion: {
            playerChoice: null,
            aiChoice: null,
            result: null,
            consecutiveWins: 0,
            totalRounds: 5,
            currentRound: 1,
          },
        },
        isGameActive: true,
        timeElapsed: 0,
        startGame: vi.fn(),
        playGame: vi.fn(),
        submitAnswer: vi.fn(),
        forceEndGame: vi.fn(),
        availableGames: [],
        recentResults: [],
        bestScores: {},
      }));

      // モック更新
      const { useGame } = await import('../hooks/useGame');
      vi.mocked(useGame).mockImplementation(mockUseGame);

      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      // じゃんけんゲームコンポーネントが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/じゃんけん/)).toBeInTheDocument();
      });
    });

    it('should handle number-guessing game integration', async () => {
      const mockUseGame = vi.fn(() => ({
        currentSession: {
          gameId: 'test-game',
          config: {
            type: 'number-guessing',
            difficulty: 'easy',
            duration: 120,
            name: '数当て（簡単）',
          },
          status: 'playing',
          startTime: new Date(),
          score: { points: 0, accuracy: 0, timeRemaining: 120, combo: 0 },
          questionHistory: [],
          currentQuestion: {
            targetNumber: 25,
            currentGuess: null,
            attemptsLeft: 8,
            hints: [],
            minNumber: 1,
            maxNumber: 50,
          },
        },
        isGameActive: true,
        timeElapsed: 0,
        startGame: vi.fn(),
        playGame: vi.fn(),
        submitAnswer: vi.fn(),
        forceEndGame: vi.fn(),
        availableGames: [],
        recentResults: [],
        bestScores: {},
      }));

      // モック更新
      const { useGame } = await import('../hooks/useGame');
      vi.mocked(useGame).mockImplementation(mockUseGame);

      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      // 数当てゲームコンポーネントが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('🔢 数当てゲーム')).toBeInTheDocument();
      });
    });
  });

  describe('報酬システム統合', () => {
    it('should handle reward earned callback', async () => {
      const mockUseGame = vi.fn(() => ({
        currentSession: null,
        isGameActive: false,
        timeElapsed: 0,
        startGame: vi.fn(),
        playGame: vi.fn(),
        submitAnswer: vi.fn(),
        forceEndGame: vi.fn(),
        availableGames: [],
        recentResults: [],
        bestScores: {},
      }));

      // コールバック関数付きでモックを設定
      mockUseGame.mockImplementation(callbacks => {
        // コールバックが正しく渡されることを確認
        expect(callbacks.onRewardGiven).toBeDefined();
        expect(callbacks.onGameComplete).toBeDefined();

        return {
          currentSession: null,
          isGameActive: false,
          timeElapsed: 0,
          startGame: vi.fn(),
          playGame: vi.fn(),
          submitAnswer: vi.fn(),
          forceEndGame: vi.fn(),
          availableGames: [],
          recentResults: [],
          bestScores: {},
        };
      });

      const { useGame } = await import('../hooks/useGame');
      vi.mocked(useGame).mockImplementation(mockUseGame);

      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      expect(mockUseGame).toHaveBeenCalledWith(
        expect.objectContaining({
          onGameComplete: expect.any(Function),
          onRewardGiven: expect.any(Function),
        })
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle unsupported game types gracefully', async () => {
      const mockUseGame = vi.fn(() => ({
        currentSession: {
          gameId: 'test-game',
          config: {
            type: 'unknown-game' as any,
            difficulty: 'easy',
            duration: 60,
            name: '未知のゲーム',
          },
          status: 'playing',
          startTime: new Date(),
          score: { points: 0, accuracy: 0, timeRemaining: 60, combo: 0 },
          questionHistory: [],
          currentQuestion: null,
        },
        isGameActive: true,
        timeElapsed: 0,
        startGame: vi.fn(),
        playGame: vi.fn(),
        submitAnswer: vi.fn(),
        forceEndGame: vi.fn(),
        availableGames: [],
        recentResults: [],
        bestScores: {},
      }));

      const { useGame } = await import('../hooks/useGame');
      vi.mocked(useGame).mockImplementation(mockUseGame);

      render(
        <MiniGamePanel
          onRewardEarned={mockOnRewardEarned}
          onClose={mockOnClose}
        />
      );

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(
          screen.getByText('未対応のゲームタイプです')
        ).toBeInTheDocument();
      });
    });
  });
});
