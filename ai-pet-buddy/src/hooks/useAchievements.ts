/**
 * @file useAchievements.ts
 * @description React hook for managing achievement state and operations
 * 
 * Provides centralized achievement management including badge/title tracking,
 * progress updates, and notification handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Pet } from '../types/Pet';
import type { 
  AchievementState, 
  AchievementNotification, 
  AchievementProgress 
} from '../types/Achievement';
import {
  initializeAchievementState,
  updateGameProgress,
  updateCareProgress,
  updateLevelProgress,
  updateEvolutionProgress,
  updateSessionProgress,
  checkAchievements,
  activateTitle,
  getAchievementSummary,
  getNextAchievements,
  type GameData,
  type CareActionData,
  type SessionData
} from '../utils/achievementEngine';

// Storage key for achievements
const ACHIEVEMENT_STORAGE_KEY = 'ai-pet-buddy-achievements';

// Hook configuration options
export interface UseAchievementsOptions {
  autoSave?: boolean;
  saveInterval?: number; // milliseconds
  maxNotifications?: number;
  enableSessionTracking?: boolean;
}

// Hook return interface
export interface UseAchievementsReturn {
  // State
  achievementState: AchievementState;
  notifications: AchievementNotification[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  recordGameResult: (gameData: GameData) => void;
  recordCareAction: (careData: CareActionData) => void;
  recordLevelUp: (pet: Pet) => void;
  recordEvolution: (timestamp?: number) => void;
  startSession: () => void;
  endSession: () => void;
  setActiveTitle: (titleId: string) => void;
  dismissNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Utilities
  getSummary: () => ReturnType<typeof getAchievementSummary>;
  getNextAchievements: (limit?: number) => ReturnType<typeof getNextAchievements>;
  saveAchievements: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  resetAchievements: () => void;
}

// Default options
const DEFAULT_OPTIONS: Required<UseAchievementsOptions> = {
  autoSave: true,
  saveInterval: 5000, // 5 seconds
  maxNotifications: 10,
  enableSessionTracking: true
};

/**
 * Custom hook for managing achievements
 */
export function useAchievements(
  pet: Pet,
  options: UseAchievementsOptions = {}
): UseAchievementsReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // State
  const [achievementState, setAchievementState] = useState<AchievementState>(() => 
    initializeAchievementState()
  );
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Session tracking
  const sessionStartRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const actionsCountRef = useRef(0);

  /**
   * Save achievements to localStorage
   */
  const saveAchievements = useCallback(async (): Promise<void> => {
    try {
      const dataToSave = {
        ...achievementState,
        lastSaved: Date.now()
      };
      localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(dataToSave));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save achievements';
      setError(errorMessage);
      console.error('Failed to save achievements:', err);
      throw err;
    }
  }, [achievementState]);

  /**
   * Load achievements from localStorage
   */
  const loadAchievements = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const savedData = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Validate the loaded data has expected structure
        if (parsed.badges && parsed.titles && parsed.progress) {
          setAchievementState(parsed);
        } else {
          console.warn('Invalid achievement data found, initializing new state');
          setAchievementState(initializeAchievementState());
        }
      } else {
        setAchievementState(initializeAchievementState());
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Failed to load achievements:', err);
      setAchievementState(initializeAchievementState());
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update achievement state and check for new unlocks
   */
  const updateAchievements = useCallback((
    newProgress: AchievementProgress,
    pet: Pet
  ): void => {
    const newState = { ...achievementState, progress: newProgress };
    const { updatedState, notifications: newNotifications } = checkAchievements(newState, pet);
    
    setAchievementState(updatedState);
    
    // Add new notifications (limit total count)
    if (newNotifications.length > 0) {
      setNotifications(prev => {
        const combined = [...prev, ...newNotifications];
        return combined.slice(-opts.maxNotifications);
      });
    }
    
    // Schedule auto-save
    if (opts.autoSave) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveAchievements().catch(console.error);
      }, opts.saveInterval);
    }
  }, [achievementState, opts.autoSave, opts.saveInterval, opts.maxNotifications, saveAchievements]);

  /**
   * Record game result and update achievements
   */
  const recordGameResult = useCallback((gameData: GameData): void => {
    const newProgress = updateGameProgress(achievementState.progress, gameData);
    updateAchievements(newProgress, pet);
    actionsCountRef.current += 1;
  }, [achievementState.progress, updateAchievements, pet]);

  /**
   * Record care action and update achievements
   */
  const recordCareAction = useCallback((careData: CareActionData): void => {
    const newProgress = updateCareProgress(achievementState.progress, careData);
    updateAchievements(newProgress, pet);
    actionsCountRef.current += 1;
  }, [achievementState.progress, updateAchievements, pet]);

  /**
   * Record level up and update achievements
   */
  const recordLevelUp = useCallback((updatedPet: Pet): void => {
    const newProgress = updateLevelProgress(achievementState.progress, updatedPet);
    updateAchievements(newProgress, updatedPet);
    actionsCountRef.current += 1;
  }, [achievementState.progress, updateAchievements]);

  /**
   * Record evolution and update achievements
   */
  const recordEvolution = useCallback((timestamp: number = Date.now()): void => {
    const newProgress = updateEvolutionProgress(achievementState.progress, { timestamp });
    updateAchievements(newProgress, pet);
    actionsCountRef.current += 1;
  }, [achievementState.progress, updateAchievements, pet]);

  /**
   * Start a new session
   */
  const startSession = useCallback((): void => {
    if (opts.enableSessionTracking) {
      sessionStartRef.current = Date.now();
      actionsCountRef.current = 0;
    }
  }, [opts.enableSessionTracking]);

  /**
   * End current session and update achievements
   */
  const endSession = useCallback((): void => {
    if (opts.enableSessionTracking && sessionStartRef.current) {
      const sessionData: SessionData = {
        startTime: sessionStartRef.current,
        endTime: Date.now(),
        actionsPerformed: actionsCountRef.current
      };
      
      const newProgress = updateSessionProgress(achievementState.progress, sessionData);
      updateAchievements(newProgress, pet);
      
      sessionStartRef.current = null;
      actionsCountRef.current = 0;
    }
  }, [opts.enableSessionTracking, achievementState.progress, updateAchievements, pet]);

  /**
   * Activate a specific title
   */
  const setActiveTitle = useCallback((titleId: string): void => {
    const newState = activateTitle(achievementState, titleId);
    setAchievementState(newState);
    
    // Auto-save if enabled
    if (opts.autoSave) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveAchievements().catch(console.error);
      }, opts.saveInterval);
    }
  }, [achievementState, opts.autoSave, opts.saveInterval, saveAchievements]);

  /**
   * Dismiss a specific notification
   */
  const dismissNotification = useCallback((notificationId: string): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  /**
   * Get achievement summary
   */
  const getSummary = useCallback(() => {
    return getAchievementSummary(achievementState);
  }, [achievementState]);

  /**
   * Get next closest achievements
   */
  const getNextAchievementsCallback = useCallback((limit: number = 3) => {
    return getNextAchievements(achievementState, pet, limit);
  }, [achievementState, pet]);

  /**
   * Reset all achievements to initial state
   */
  const resetAchievements = useCallback((): void => {
    setAchievementState(initializeAchievementState());
    setNotifications([]);
    setError(null);
    
    // Clear saved data
    try {
      localStorage.removeItem(ACHIEVEMENT_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear achievement data:', err);
    }
  }, []);

  // Load achievements on mount
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Auto-start session on mount if enabled
  useEffect(() => {
    if (opts.enableSessionTracking && !sessionStartRef.current) {
      startSession();
    }
    
    // End session on unmount
    return () => {
      if (opts.enableSessionTracking && sessionStartRef.current) {
        endSession();
      }
      clearTimeout(saveTimeoutRef.current);
    };
  }, [opts.enableSessionTracking, startSession, endSession]);

  // Save on pet level changes
  useEffect(() => {
    if (!isLoading && pet.stats.level !== achievementState.progress.maxLevel) {
      recordLevelUp(pet);
    }
  }, [pet.stats.level, achievementState.progress.maxLevel, recordLevelUp, isLoading]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return {
    // State
    achievementState,
    notifications,
    isLoading,
    error,
    
    // Actions
    recordGameResult,
    recordCareAction,
    recordLevelUp,
    recordEvolution,
    startSession,
    endSession,
    setActiveTitle,
    dismissNotification,
    clearAllNotifications,
    
    // Utilities
    getSummary,
    getNextAchievements: getNextAchievementsCallback,
    saveAchievements,
    loadAchievements,
    resetAchievements
  };
}