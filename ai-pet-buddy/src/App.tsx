import { useEffect, useState, useRef } from 'react'
import './App.css'
import ActionButtons from './components/ActionButtons'
import ConversationPanel from './components/ConversationPanel'
import CustomizationPanel from './components/CustomizationPanel'
import MiniGamePanel from './components/MiniGamePanel'
import PetDisplay from './components/PetDisplay'
import StatsPanel from './components/StatsPanel'
import { SharePanel } from './components/SharePanel'
import PWAProvider from './components/PWAProvider'
import AchievementList from './components/achievements/AchievementList'
import AchievementNotificationContainer from './components/achievements/AchievementNotificationContainer'
import { useDataPersistence } from './hooks/useDataPersistence'
import { usePetProgress } from './hooks/usePetProgress'
import { useStatDecay } from './hooks/useStatDecay'
import { useCustomization } from './hooks/useCustomization'
import { useAchievements } from './hooks/useAchievements'
import type { ConversationMessage } from './types/Conversation'
import type { Pet } from './types/Pet'
import type { StatsCardData } from './types/Share'
import { DEFAULT_PET } from './types/Pet'
import { createUserMessage, generatePetResponse } from './utils/conversationEngine'

function App() {
  const [pet, setPet] = useState<Pet>(DEFAULT_PET)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [showGamePanel, setShowGamePanel] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false)
  const [showAchievementPanel, setShowAchievementPanel] = useState(false)

  const customizationApi = useCustomization();
  const initialLoadComplete = useRef(false); // Correct: Add this ref
  
  // Initialize achievements
  const achievements = useAchievements(pet, {
    autoSave: true,
    saveInterval: 5000,
    maxNotifications: 5,
    enableSessionTracking: true
  });

  const petDisplayRef = useRef<HTMLDivElement>(null)

  const { loadInitialData, saveData, setupAutoSave, clearAutoSave } = useDataPersistence({
    autoSaveInterval: 30000,
    enableAutoSave: true
  })

  useEffect(() => {
    if (initialLoadComplete.current) {
      return;
    }

    customizationApi.loadInitialCustomization(); 
    const { pet: savedPet, conversationHistory: savedHistory } = loadInitialData();

    if (savedPet) {
      setPet(savedPet);
    } else {
      setPet(() => ({ 
        ...DEFAULT_PET, 
        name: customizationApi.customizationState.current.name,
        color: customizationApi.customizationState.current.color,
        accessories: customizationApi.customizationState.current.accessories,
      }));
    }
    if (savedHistory) { 
      setConversationHistory(savedHistory);
    }

    initialLoadComplete.current = true; 
  }, [loadInitialData, customizationApi]); 

  const { getProgressInfo, getRequiredExperience } = usePetProgress(pet)

  const calculateLevelUp = (currentExperience: number, currentLevel: number) => {
    let newExperience = currentExperience
    let newLevel = currentLevel
    const levelUpBonus = { happiness: 0, energy: 0 }
    
    while (newLevel < 10 && newExperience >= getRequiredExperience(newLevel)) {
      newExperience -= getRequiredExperience(newLevel)
      newLevel++
      levelUpBonus.happiness += 5
      levelUpBonus.energy += 3
    }
    
    return { newExperience, newLevel, levelUpBonus }
  }

  useStatDecay(pet, setPet, {
    decayInterval: 30000, 
    minimumTimeBetweenUpdates: 15000, 
    decayRates: {
      happiness: 0.5, 
      hunger: 1,      
      energy: 0.8     
    }
  })

  useEffect(() => {
    setupAutoSave(pet, conversationHistory)
    return () => clearAutoSave()
  }, [pet, conversationHistory, setupAutoSave, clearAutoSave])

  const triggerSave = () => {
    saveData(pet, conversationHistory)
  }

  const handleFeed = () => {
    setPet((prev: Pet) => { // prev の型を明示
      const baseStats = {
        ...prev.stats,
        hunger: Math.max(0, prev.stats.hunger - 30),
        happiness: Math.min(100, prev.stats.happiness + 10)
      }
      
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + 5, prev.stats.level)
      
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      const updatedPet = {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'happy',
        lastUpdate: Date.now()
      }
      
      // Record care action for achievements
      achievements.recordCareAction({
        type: 'feed',
        timestamp: Date.now(),
        statChanges: {
          hunger: finalStats.hunger - prev.stats.hunger,
          happiness: finalStats.happiness - prev.stats.happiness,
          energy: finalStats.energy - prev.stats.energy
        }
      })
      
      // Record level up if it occurred
      if (newLevel > prev.stats.level) {
        achievements.recordLevelUp(updatedPet)
      }
      
      return updatedPet
    })
    triggerSave()
  }

  const handlePlay = () => {
    setPet((prev: Pet) => { // prev の型を明示
      const baseStats = {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 20),
        energy: Math.max(0, prev.stats.energy - 15)
      }
      
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + 10, prev.stats.level)
      
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      const updatedPet = {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'excited',
        lastUpdate: Date.now()
      }
      
      // Record care action for achievements
      achievements.recordCareAction({
        type: 'play',
        timestamp: Date.now(),
        statChanges: {
          hunger: 0,
          happiness: finalStats.happiness - prev.stats.happiness,
          energy: finalStats.energy - prev.stats.energy
        }
      })
      
      // Record level up if it occurred
      if (newLevel > prev.stats.level) {
        achievements.recordLevelUp(updatedPet)
      }
      
      return updatedPet
    })
    triggerSave()
  }

  const handleRest = () => {
    setPet((prev: Pet) => { // prev の型を明示
      const baseStats = {
        ...prev.stats,
        energy: Math.min(100, prev.stats.energy + 30),
        happiness: Math.min(100, prev.stats.happiness + 5)
      }
      
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + 3, prev.stats.level)
      
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      const updatedPet = {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'neutral',
        lastUpdate: Date.now()
      }
      
      // Record care action for achievements
      achievements.recordCareAction({
        type: 'rest',
        timestamp: Date.now(),
        statChanges: {
          hunger: 0,
          happiness: finalStats.happiness - prev.stats.happiness,
          energy: finalStats.energy - prev.stats.energy
        }
      })
      
      // Record level up if it occurred
      if (newLevel > prev.stats.level) {
        achievements.recordLevelUp(updatedPet)
      }
      
      return updatedPet
    })
    triggerSave()
  }

  const handleGameReward = (reward: { experience: number; happiness: number; energy: number; coins: number }) => {
    setPet((prev: Pet) => { // prev の型を明示し、setPet((prev: Pet) => ({...})) の形式に修正
      const baseStats = {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + (reward.happiness || 0)),
        energy: Math.max(0, prev.stats.energy + (reward.energy || 0))
      }
      
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + (reward.experience || 0), prev.stats.level)
      
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      const updatedPet = {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'excited',
        lastUpdate: Date.now()
      }
      
      // Record game result for achievements
      achievements.recordGameResult({
        type: 'mini-game',
        result: reward.experience > 0 ? 'win' : 'loss',
        timestamp: Date.now(),
        experienceGained: reward.experience,
        duration: 30 // Default duration
      })
      
      // Record level up if it occurred
      if (newLevel > prev.stats.level) {
        achievements.recordLevelUp(updatedPet)
      }
      
      return updatedPet
    })
    triggerSave()
  }

  const handleSendMessage = (message: string) => {
    const userMessage = createUserMessage(message)
    const petResponse = generatePetResponse(pet, message, 'general')
    setConversationHistory(prev => [...prev, userMessage, petResponse])
    triggerSave()
  }

  const generateStatsData = (): StatsCardData => {
    const birthDate = new Date(Date.now() - (pet.stats.level * 24 * 60 * 60 * 1000));
    
    return {
      petName: pet.name,
      level: pet.stats.level,
      evolutionStage: pet.stats.level < 3 ? 'baby' : pet.stats.level < 6 ? 'child' : 'adult',
      totalPlayTime: Math.floor((Date.now() - birthDate.getTime()) / 1000 / 60),
      gameWinRate: 0.75,
      achievementCount: pet.stats.level * 2,
      birthDate: birthDate
    };
  };

  useEffect(() => {
    const { happiness, energy } = pet.stats
    let newExpression: Pet['expression'] = 'neutral'

    if (happiness >= 80) newExpression = 'happy'
    else if (happiness >= 60) newExpression = 'neutral'
    else if (happiness < 30) newExpression = 'sad'
    
    if (energy < 20) newExpression = 'tired'
    if (happiness >= 90 && energy >= 70) newExpression = 'excited'

    if (newExpression !== pet.expression) {
      setPet((prev: Pet) => ({ ...prev, expression: newExpression })) // prev の型を明示
    }
  }, [pet.stats, pet.expression])

  const handleApplyCustomization = () => {
    // 先にプレビューを適用してカスタマイズAPIの状態を更新
    customizationApi.applyPreview();
    
    // カスタマイズAPIの最新状態を使ってペット状態を更新
    setPet((prevPet: Pet) => ({ 
      ...prevPet,
      name: customizationApi.customizationState.current.name,
      color: customizationApi.customizationState.current.color,
      accessories: customizationApi.customizationState.current.accessories,
    }));
    
    // パネルを閉じる
    setShowCustomizationPanel(false);
    
    // カスタマイズ固有データを保存
    customizationApi.saveCustomization();
    
    // Note: ペットデータの保存は setupAutoSave の useEffect に委ねる
  };

  return (
    <PWAProvider pet={pet}>
      <div className="app">
        <header className="app-header">
          <h1>🐾 AI Pet Buddy</h1>
          <p>Take care of your virtual pet!</p>
          <div className="progress-info">
            <p>レベル {getProgressInfo().currentLevel} | 経験値: {Math.round(getProgressInfo().currentExperience * 10) / 10}</p>
            <p>次のレベルまで: {Math.round(getProgressInfo().experienceToNextLevel * 10) / 10}経験値</p>
          </div>
        </header>
        
        <main className="app-main">
          {showGamePanel ? (
            <div className="game-panel-container">
              <MiniGamePanel
                onRewardEarned={handleGameReward}
                onClose={() => setShowGamePanel(false)}
              />
            </div>
          ) : showAchievementPanel ? (
            <div className="achievement-panel-container">
              <div className="achievement-panel-header">
                <button 
                  className="close-button"
                  onClick={() => setShowAchievementPanel(false)}
                  aria-label="Close achievements"
                >
                  ← Back to Pet
                </button>
              </div>
              <AchievementList
                achievementState={achievements.achievementState}
                onTitleActivate={achievements.setActiveTitle}
                onAchievementClick={(achievement, type) => {
                  console.log(`Clicked ${type}:`, achievement);
                }}
              />
            </div>
          ) : (
            <>
              <div ref={petDisplayRef} className="pet-display-area">
                <PetDisplay pet={pet} />
                <StatsPanel stats={pet.stats} />
              </div>
              <ActionButtons
                onFeed={handleFeed}
                onPlay={handlePlay}
                onRest={handleRest}
                onGames={() => setShowGamePanel(true)}
                onShare={() => setShowSharePanel(true)}
                onCustomize={() => setShowCustomizationPanel(true)}
                onAchievements={() => setShowAchievementPanel(true)}
              />
              <ConversationPanel 
                pet={pet}
                conversationHistory={conversationHistory}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
          
          {showCustomizationPanel && (
            <CustomizationPanel
              customizationApi={customizationApi}
              onClose={() => {
                customizationApi.cancelPreview(); // プレビューをキャンセルする処理を追加
                setShowCustomizationPanel(false);
              }}
              onApply={handleApplyCustomization}
            />
          )}
        </main>
        
        <SharePanel
          isOpen={showSharePanel}
          onClose={() => setShowSharePanel(false)}
          captureTargetRef={petDisplayRef}
          statsData={generateStatsData()}
        />
        
        {/* Achievement Notifications */}
        <AchievementNotificationContainer
          notifications={achievements.notifications}
          onDismiss={achievements.dismissNotification}
          maxVisible={3}
          position="top-right"
        />
      </div>
    </PWAProvider>
  )
}

export default App
