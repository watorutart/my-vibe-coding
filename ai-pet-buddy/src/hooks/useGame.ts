/**
 * ゲーム管理カスタムフック
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    GameConfig,
    GameEngineCallbacks,
    GameResult,
    GameReward,
    GameSession,
    GameState,
} from '../types/Game';
import { GameEngine } from '../utils/gameEngine';

export interface UseGameReturn {
  // State
  gameState: GameState;
  currentSession: GameSession | null;
  isGameActive: boolean;
  timeElapsed: number;

  // Actions
  startGame: (config: GameConfig) => void;
  playGame: () => void;
  submitAnswer: (answer: any) => boolean;
  forceEndGame: () => void;
  
  // Data
  availableGames: GameConfig[];
  recentResults: GameResult[];
  bestScores: Record<string, number>;

  // Events
  onGameComplete?: (result: GameResult) => void;
  onRewardGiven?: (reward: GameReward) => void;
}

export interface UseGameOptions {
  onGameComplete?: (result: GameResult) => void;
  onRewardGiven?: (reward: GameReward) => void;
  autoStartTimer?: boolean;
}

export function useGame(options: UseGameOptions = {}): UseGameReturn {
  const {
    onGameComplete,
    onRewardGiven,
    autoStartTimer = true,
  } = options;

  // Game engine instance (singleton per hook)
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  // State management
  const [gameState, setGameState] = useState<GameState>({
    currentSession: null,
    availableGames: [],
    recentResults: [],
    totalGamesPlayed: 0,
    totalExperienceEarned: 0,
    bestScores: {},
  });
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Callbacks for game engine
  const engineCallbacks: GameEngineCallbacks = {
    onGameStart: useCallback((session: GameSession) => {
      console.log('🎮 ゲーム開始:', session.config.type, session.config.difficulty);
      setGameState(prev => ({ ...prev, currentSession: session }));
      setTimeElapsed(0);
      
      if (autoStartTimer) {
        startTimer();
      }
    }, [autoStartTimer]),

    onGameUpdate: useCallback((session: GameSession) => {
      console.log('⚡ ゲーム更新:', session.score);
      setGameState(prev => ({ ...prev, currentSession: session }));
    }, []),

    onGameComplete: useCallback((result: GameResult) => {
      console.log('🏁 ゲーム終了:', result.type, '成功:', result.success);
      console.log('📊 スコア:', result.score);
      console.log('🎁 報酬:', result.reward);
      
      setGameState(prev => ({
        ...gameState,
        currentSession: null,
        recentResults: [result, ...prev.recentResults.slice(0, 9)],
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        totalExperienceEarned: prev.totalExperienceEarned + result.reward.experience,
        bestScores: {
          ...prev.bestScores,
          [`${result.type}_${result.difficulty}`]: Math.max(
            prev.bestScores[`${result.type}_${result.difficulty}`] || 0,
            result.score.points
          ),
        },
      }));
      
      stopTimer();
      onGameComplete?.(result);
    }, [gameState, onGameComplete]),

    onRewardGiven: useCallback((reward: GameReward) => {
      console.log('💰 報酬付与:', reward);
      onRewardGiven?.(reward);
    }, [onRewardGiven]),
  };

  // Initialize game engine
  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(engineCallbacks);
      const initialState = gameEngineRef.current.getGameState();
      setGameState(initialState);
    }
  }, []);

  // Timer management
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newElapsed = prev + 1;
        gameEngineRef.current?.updateTime(newElapsed);
        return newElapsed;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // Game actions
  const startGame = useCallback((config: GameConfig) => {
    if (!gameEngineRef.current) {
      console.error('ゲームエンジンが初期化されていません');
      return;
    }

    try {
      gameEngineRef.current.startGame(config);
    } catch (error) {
      console.error('ゲーム開始エラー:', error);
      throw error;
    }
  }, []);

  const playGame = useCallback(() => {
    if (!gameEngineRef.current) {
      console.error('ゲームエンジンが初期化されていません');
      return;
    }

    try {
      gameEngineRef.current.playGame();
    } catch (error) {
      console.error('ゲームプレイエラー:', error);
      throw error;
    }
  }, []);

  const submitAnswer = useCallback((answer: any): boolean => {
    if (!gameEngineRef.current) {
      console.error('ゲームエンジンが初期化されていません');
      return false;
    }

    try {
      return gameEngineRef.current.submitAnswer(answer);
    } catch (error) {
      console.error('回答提出エラー:', error);
      return false;
    }
  }, []);

  const forceEndGame = useCallback(() => {
    if (!gameEngineRef.current) {
      return;
    }

    gameEngineRef.current.forceEndGame();
    stopTimer();
  }, [stopTimer]);

  // Computed values
  const isGameActive = gameState.currentSession?.status === 'playing';
  const availableGames = gameEngineRef.current?.getAvailableGames() || [];
  const recentResults = gameEngineRef.current?.getRecentResults() || [];
  const bestScores = gameEngineRef.current?.getBestScores() || {};

  return {
    // State
    gameState,
    currentSession: gameState.currentSession,
    isGameActive,
    timeElapsed,

    // Actions
    startGame,
    playGame,
    submitAnswer,
    forceEndGame,
    
    // Data
    availableGames,
    recentResults,
    bestScores,

    // Events (passed through options)
    onGameComplete,
    onRewardGiven,
  };
}
