import { useCallback } from 'react'
import type { Pet } from '../types/Pet'

// Experience required for each level (level 1-10)
const EXPERIENCE_REQUIREMENTS = [
  100,  // Level 1 -> 2
  150,  // Level 2 -> 3
  200,  // Level 3 -> 4
  250,  // Level 4 -> 5
  300,  // Level 5 -> 6
  350,  // Level 6 -> 7
  400,  // Level 7 -> 8
  450,  // Level 8 -> 9
  500,  // Level 9 -> 10
  0     // Level 10 (max level)
]

const MAX_LEVEL = 10

export interface ProgressInfo {
  currentLevel: number
  currentExperience: number
  experienceToNextLevel: number
  progressPercentage: number
}

export interface UsePetProgressReturn {
  gainExperience: (action: string, amount: number) => void
  getRequiredExperience: (level: number) => number
  getExperienceToNextLevel: () => number
  getProgressInfo: () => ProgressInfo
}

export function usePetProgress(
  pet: Pet,
  onUpdate?: (updatedPet: Pet) => void
): UsePetProgressReturn {
  // 現在の経験値とレベルを取得（petが更新されるたびに再計算）
  const currentExperience = pet.experience ?? 0
  const currentLevel = pet.stats.level

  const getRequiredExperience = useCallback((level: number): number => {
    if (level < 1 || level > MAX_LEVEL) return 0
    return EXPERIENCE_REQUIREMENTS[level - 1] || 0
  }, [])

  const getExperienceToNextLevel = useCallback((): number => {
    if (currentLevel >= MAX_LEVEL) return 0
    const required = getRequiredExperience(currentLevel)
    return Math.max(0, required - currentExperience)
  }, [currentLevel, currentExperience, getRequiredExperience])

  const getProgressInfo = useCallback((): ProgressInfo => {
    const experienceToNext = getExperienceToNextLevel()
    const required = getRequiredExperience(currentLevel)
    const percentage = required > 0 ? ((currentExperience / required) * 100) : 100

    return {
      currentLevel,
      currentExperience,
      experienceToNextLevel: experienceToNext,
      progressPercentage: Math.min(100, Math.max(0, percentage))
    }
  }, [currentLevel, currentExperience, getExperienceToNextLevel, getRequiredExperience])

  const applyLevelUpBonuses = useCallback((newLevel: number, currentStats: Pet['stats']) => {
    // Apply stat bonuses for leveling up
    const bonusPerLevel = {
      happiness: 5,  // +5 happiness per level
      energy: 3      // +3 energy per level
    }

    return {
      ...currentStats,
      level: newLevel,
      happiness: Math.min(100, currentStats.happiness + bonusPerLevel.happiness),
      energy: Math.min(100, currentStats.energy + bonusPerLevel.energy)
    }
  }, [])

  const gainExperience = useCallback((_action: string, amount: number) => {
    // Guard against negative experience and invalid callback
    if (amount < 0 || !onUpdate) return

    // 現在のpetから最新の経験値を取得（重要：petが更新されていることを前提）
    let newExperience = (pet.experience ?? 0) + amount
    let newLevel = pet.stats.level
    let newStats = { ...pet.stats }

    // Process level ups
    while (newLevel < MAX_LEVEL && newExperience >= getRequiredExperience(newLevel)) {
      newExperience -= getRequiredExperience(newLevel)
      newLevel++
      
      // Apply level up bonuses
      newStats = applyLevelUpBonuses(newLevel, newStats)
    }

    // If at max level, don't accumulate excess experience
    if (newLevel >= MAX_LEVEL) {
      newExperience = 0
      newLevel = MAX_LEVEL
    }

    // Update the pet
    const updatedPet: Pet = {
      ...pet,
      stats: newStats,
      experience: newExperience,
      lastUpdate: Date.now()
    }

    onUpdate(updatedPet)
  }, [pet, onUpdate, getRequiredExperience, applyLevelUpBonuses])

  return {
    gainExperience,
    getRequiredExperience,
    getExperienceToNextLevel,
    getProgressInfo
  }
}
