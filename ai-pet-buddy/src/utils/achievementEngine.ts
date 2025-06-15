/**
 * @file achievementEngine.ts
 * @description Core achievement checking and badge/title management engine
 * 
 * Provides functions to check achievement conditions, update progress,
 * and manage badge/title unlocking based on game data and pet statistics.
 */

import type { Pet } from '../types/Pet';
import type {
  Badge,
  Title,
  AchievementProgress,
  AchievementState,
  AchievementNotification
} from '../types/Achievement';
import { 
  PREDEFINED_BADGES, 
  PREDEFINED_TITLES, 
  DEFAULT_ACHIEVEMENT_PROGRESS 
} from '../types/Achievement';

// Game data interface for achievement checking
export interface GameData {
  type: string;
  result: 'win' | 'lose' | 'draw';
  timestamp: number;
  duration: number; // in seconds
}

// Care action data
export interface CareActionData {
  action: 'feed' | 'play' | 'rest';
  timestamp: number;
  statsBefore: {
    happiness: number;
    energy: number;
    hunger: number;
  };
  statsAfter: {
    happiness: number;
    energy: number;
    hunger: number;
  };
}

// Session data for playtime tracking
export interface SessionData {
  startTime: number;
  endTime: number;
  actionsPerformed: number;
}

/**
 * Initialize achievement state with default values
 */
export function initializeAchievementState(): AchievementState {
  const badges: Badge[] = PREDEFINED_BADGES.map(badgeTemplate => ({
    ...badgeTemplate,
    unlocked: false,
    progress: 0
  }));

  const titles: Title[] = PREDEFINED_TITLES.map(titleTemplate => ({
    ...titleTemplate,
    unlocked: false,
    active: false
  }));

  // Unlock beginner trainer title by default
  const beginnerTitle = titles.find(title => title.id === 'beginner-trainer');
  if (beginnerTitle) {
    beginnerTitle.unlocked = true;
    beginnerTitle.active = true;
    beginnerTitle.unlockedAt = Date.now();
  }

  return {
    badges,
    titles,
    progress: { ...DEFAULT_ACHIEVEMENT_PROGRESS },
    newlyUnlocked: []
  };
}

/**
 * Update achievement progress based on game result
 */
export function updateGameProgress(
  progress: AchievementProgress,
  gameData: GameData
): AchievementProgress {
  const updatedProgress = { ...progress };

  // Update game statistics
  updatedProgress.totalGames += 1;
  
  if (gameData.result === 'win') {
    updatedProgress.totalWins += 1;
    updatedProgress.currentWinStreak += 1;
    
    if (updatedProgress.currentWinStreak > updatedProgress.maxWinStreak) {
      updatedProgress.maxWinStreak = updatedProgress.currentWinStreak;
    }
  } else {
    updatedProgress.currentWinStreak = 0;
  }

  // Update playtime (convert seconds to minutes)
  updatedProgress.totalPlaytime += Math.ceil(gameData.duration / 60);
  updatedProgress.lastPlayDate = gameData.timestamp;

  return updatedProgress;
}

/**
 * Update achievement progress based on care action
 */
export function updateCareProgress(
  progress: AchievementProgress,
  careData: CareActionData
): AchievementProgress {
  const updatedProgress = { ...progress };

  // Update max stats if new records are achieved
  if (careData.statsAfter.happiness > updatedProgress.maxHappiness) {
    updatedProgress.maxHappiness = careData.statsAfter.happiness;
  }
  
  if (careData.statsAfter.energy > updatedProgress.maxEnergy) {
    updatedProgress.maxEnergy = careData.statsAfter.energy;
  }

  updatedProgress.lastPlayDate = careData.timestamp;

  return updatedProgress;
}

/**
 * Update achievement progress based on pet level change
 */
export function updateLevelProgress(
  progress: AchievementProgress,
  pet: Pet
): AchievementProgress {
  const updatedProgress = { ...progress };

  if (pet.stats.level > updatedProgress.maxLevel) {
    updatedProgress.maxLevel = pet.stats.level;
  }

  return updatedProgress;
}

/**
 * Update achievement progress based on evolution
 */
export function updateEvolutionProgress(
  progress: AchievementProgress,
  evolutionData: { timestamp: number }
): AchievementProgress {
  const updatedProgress = { ...progress };
  
  updatedProgress.evolutionCount += 1;
  updatedProgress.lastPlayDate = evolutionData.timestamp;

  return updatedProgress;
}

/**
 * Update achievement progress based on play session
 */
export function updateSessionProgress(
  progress: AchievementProgress,
  sessionData: SessionData
): AchievementProgress {
  const updatedProgress = { ...progress };

  // Calculate session duration in minutes
  const sessionDuration = Math.ceil((sessionData.endTime - sessionData.startTime) / 60000);
  updatedProgress.totalPlaytime += sessionDuration;

  // Update consecutive days
  const today = new Date(sessionData.endTime).toDateString();
  const lastPlayDay = new Date(updatedProgress.lastPlayDate).toDateString();
  const yesterday = new Date(sessionData.endTime - 86400000).toDateString();

  if (today !== lastPlayDay) {
    if (lastPlayDay === yesterday) {
      // Continue streak
      updatedProgress.consecutiveDays += 1;
    } else {
      // Reset streak
      updatedProgress.consecutiveDays = 1;
    }
  }

  updatedProgress.lastPlayDate = sessionData.endTime;

  return updatedProgress;
}

/**
 * Check if a specific achievement requirement is met
 */
export function checkAchievementRequirement(
  requirement: Badge['requirements'] | Title['requirements'],
  progress: AchievementProgress,
  pet: Pet
): { met: boolean; currentValue: number } {
  let currentValue = 0;
  let met = false;

  switch (requirement.type) {
    case 'evolution_count':
      currentValue = progress.evolutionCount;
      met = currentValue >= requirement.value;
      break;

    case 'game_win_streak':
      currentValue = progress.maxWinStreak;
      met = currentValue >= requirement.value;
      break;

    case 'consecutive_days':
      currentValue = progress.consecutiveDays;
      met = currentValue >= requirement.value;
      break;

    case 'level_reached':
      currentValue = progress.maxLevel;
      met = currentValue >= requirement.value;
      break;

    case 'stat_max':
      // For simplicity, check happiness as the main stat
      currentValue = progress.maxHappiness;
      met = currentValue >= requirement.value;
      break;

    case 'total_games':
      currentValue = progress.totalGames;
      met = currentValue >= requirement.value;
      break;

    case 'total_playtime':
      currentValue = progress.totalPlaytime;
      met = currentValue >= requirement.value;
      break;

    default:
      met = false;
      break;
  }

  return { met, currentValue };
}

/**
 * Calculate progress percentage for an achievement
 */
export function calculateAchievementProgress(
  requirement: Badge['requirements'] | Title['requirements'],
  progress: AchievementProgress,
  pet: Pet
): number {
  const { currentValue } = checkAchievementRequirement(requirement, progress, pet);
  const progressRatio = currentValue / requirement.value;
  return Math.min(progressRatio, 1); // Cap at 100%
}

/**
 * Check all achievements and return newly unlocked ones
 */
export function checkAchievements(
  achievementState: AchievementState,
  pet: Pet
): { updatedState: AchievementState; notifications: AchievementNotification[] } {
  const updatedState = { ...achievementState };
  const notifications: AchievementNotification[] = [];
  const newlyUnlocked: string[] = [];

  // Check badges
  updatedState.badges = achievementState.badges.map(badge => {
    if (badge.unlocked) {
      return badge; // Already unlocked
    }

    const { met, currentValue } = checkAchievementRequirement(
      badge.requirements,
      achievementState.progress,
      pet
    );

    const newProgress = calculateAchievementProgress(
      badge.requirements,
      achievementState.progress,
      pet
    );

    const updatedBadge = {
      ...badge,
      progress: newProgress
    };

    if (met && !badge.unlocked) {
      // Unlock the badge
      updatedBadge.unlocked = true;
      updatedBadge.unlockedAt = Date.now();
      newlyUnlocked.push(badge.id);

      notifications.push({
        id: `badge-${badge.id}`,
        type: 'badge',
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        timestamp: Date.now()
      });
    }

    return updatedBadge;
  });

  // Check titles
  updatedState.titles = achievementState.titles.map(title => {
    if (title.unlocked) {
      return title; // Already unlocked
    }

    const { met } = checkAchievementRequirement(
      title.requirements,
      achievementState.progress,
      pet
    );

    if (met && !title.unlocked) {
      // Unlock the title
      const updatedTitle = {
        ...title,
        unlocked: true,
        unlockedAt: Date.now(),
        active: false // Don't auto-activate, let user choose
      };

      newlyUnlocked.push(title.id);

      notifications.push({
        id: `title-${title.id}`,
        type: 'title',
        name: title.name,
        description: title.description,
        icon: title.icon,
        rarity: title.rarity,
        timestamp: Date.now()
      });

      return updatedTitle;
    }

    return title;
  });

  updatedState.newlyUnlocked = newlyUnlocked;

  return { updatedState, notifications };
}

/**
 * Activate a specific title (deactivate others)
 */
export function activateTitle(
  achievementState: AchievementState,
  titleId: string
): AchievementState {
  const updatedState = { ...achievementState };

  updatedState.titles = achievementState.titles.map(title => ({
    ...title,
    active: title.id === titleId && title.unlocked
  }));

  return updatedState;
}

/**
 * Get achievement statistics summary
 */
export function getAchievementSummary(achievementState: AchievementState) {
  const totalBadges = achievementState.badges.length;
  const unlockedBadges = achievementState.badges.filter(badge => badge.unlocked).length;
  const totalTitles = achievementState.titles.length;
  const unlockedTitles = achievementState.titles.filter(title => title.unlocked).length;
  const activeTitle = achievementState.titles.find(title => title.active);

  const badgeProgress = totalBadges > 0 ? unlockedBadges / totalBadges : 0;
  const titleProgress = totalTitles > 0 ? unlockedTitles / totalTitles : 0;

  return {
    badges: {
      total: totalBadges,
      unlocked: unlockedBadges,
      progress: badgeProgress
    },
    titles: {
      total: totalTitles,
      unlocked: unlockedTitles,
      progress: titleProgress,
      active: activeTitle
    },
    overall: {
      totalAchievements: totalBadges + totalTitles,
      unlockedAchievements: unlockedBadges + unlockedTitles,
      progress: (badgeProgress + titleProgress) / 2
    }
  };
}

/**
 * Get next achievable badges (closest to completion)
 */
export function getNextAchievements(
  achievementState: AchievementState,
  pet: Pet,
  limit: number = 3
): Array<{ badge?: Badge; title?: Title; progress: number; remaining: number }> {
  const incompleteAchievements: Array<{
    badge?: Badge;
    title?: Title;
    progress: number;
    remaining: number;
  }> = [];

  // Add incomplete badges
  achievementState.badges
    .filter(badge => !badge.unlocked)
    .forEach(badge => {
      const progress = calculateAchievementProgress(
        badge.requirements,
        achievementState.progress,
        pet
      );
      const { currentValue } = checkAchievementRequirement(
        badge.requirements,
        achievementState.progress,
        pet
      );
      const remaining = badge.requirements.value - currentValue;

      incompleteAchievements.push({
        badge,
        progress,
        remaining
      });
    });

  // Add incomplete titles
  achievementState.titles
    .filter(title => !title.unlocked)
    .forEach(title => {
      const progress = calculateAchievementProgress(
        title.requirements,
        achievementState.progress,
        pet
      );
      const { currentValue } = checkAchievementRequirement(
        title.requirements,
        achievementState.progress,
        pet
      );
      const remaining = title.requirements.value - currentValue;

      incompleteAchievements.push({
        title,
        progress,
        remaining
      });
    });

  // Sort by progress (highest first), then by remaining (lowest first)
  return incompleteAchievements
    .sort((a, b) => {
      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }
      return a.remaining - b.remaining;
    })
    .slice(0, limit);
}