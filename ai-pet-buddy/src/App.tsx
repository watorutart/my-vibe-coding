import { useEffect, useState } from 'react'
import './App.css'
import ActionButtons from './components/ActionButtons'
import ConversationPanel from './components/ConversationPanel'
import MiniGamePanel from './components/MiniGamePanel'
import PetDisplay from './components/PetDisplay'
import StatsPanel from './components/StatsPanel'
import { useDataPersistence } from './hooks/useDataPersistence'
import { usePetProgress } from './hooks/usePetProgress'
import { useStatDecay } from './hooks/useStatDecay'
import type { ConversationMessage } from './types/Conversation'
import type { Pet } from './types/Pet'
import { DEFAULT_PET } from './types/Pet'
import { createUserMessage, generatePetResponse } from './utils/conversationEngine'

function App() {
  const [pet, setPet] = useState<Pet>(DEFAULT_PET)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [showGamePanel, setShowGamePanel] = useState(false)

  // データ永続化システム
  const { loadInitialData, saveData, setupAutoSave, clearAutoSave } = useDataPersistence({
    autoSaveInterval: 30000, // 30秒間隔で自動保存
    enableAutoSave: true
  })

  // 初期データロード
  useEffect(() => {
    const { pet: savedPet, conversationHistory: savedHistory } = loadInitialData()
    if (savedPet) {
      setPet(savedPet)
    }
    setConversationHistory(savedHistory)
  }, [loadInitialData])

  // レベルアップシステム（レベル計算のみ使用）
  const { getProgressInfo, getRequiredExperience } = usePetProgress(pet)

  // レベルアップロジック
  const calculateLevelUp = (currentExperience: number, currentLevel: number) => {
    let newExperience = currentExperience
    let newLevel = currentLevel
    const levelUpBonus = { happiness: 0, energy: 0 }
    
    // レベルアップ判定
    while (newLevel < 10 && newExperience >= getRequiredExperience(newLevel)) {
      newExperience -= getRequiredExperience(newLevel)
      newLevel++
      // レベルアップボーナス累積
      levelUpBonus.happiness += 5
      levelUpBonus.energy += 3
    }
    
    return { newExperience, newLevel, levelUpBonus }
  }

  // 自動ステータス減衰システム
  useStatDecay(pet, setPet, {
    decayInterval: 30000, // 30秒間隔でチェック
    minimumTimeBetweenUpdates: 15000, // 15秒の最小間隔
    decayRates: {
      happiness: 0.5, // 30秒で0.5ポイント減少
      hunger: 1,      // 30秒で1ポイント増加
      energy: 0.8     // 30秒で0.8ポイント減少
    }
  })

  // 自動保存設定
  useEffect(() => {
    setupAutoSave(pet, conversationHistory)
    return () => clearAutoSave()
  }, [pet, conversationHistory, setupAutoSave, clearAutoSave])

  // 手動保存トリガー（アクション実行時）
  const triggerSave = () => {
    saveData(pet, conversationHistory)
  }

  // Action handlers
  const handleFeed = () => {
    setPet(prev => {
      // ステータス更新
      const baseStats = {
        ...prev.stats,
        hunger: Math.max(0, prev.stats.hunger - 30),
        happiness: Math.min(100, prev.stats.happiness + 10)
      }
      
      // 経験値とレベルアップ計算
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + 5, prev.stats.level)
      
      // 最終ステータス（レベルアップボーナス適用）
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      return {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'happy',
        lastUpdate: Date.now()
      }
    })
    triggerSave() // データ保存
  }

  const handlePlay = () => {
    setPet(prev => {
      // ステータス更新
      const baseStats = {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 20),
        energy: Math.max(0, prev.stats.energy - 15)
      }
      
      // 経験値とレベルアップ計算
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + 10, prev.stats.level)
      
      // 最終ステータス（レベルアップボーナス適用）
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      return {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'excited',
        lastUpdate: Date.now()
      }
    })
    triggerSave() // データ保存
  }

  const handleRest = () => {
    setPet(prev => {
      // ステータス更新
      const baseStats = {
        ...prev.stats,
        energy: Math.min(100, prev.stats.energy + 30),
        happiness: Math.min(100, prev.stats.happiness + 5)
      }
      
      // 経験値とレベルアップ計算
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + 3, prev.stats.level)
      
      // 最終ステータス（レベルアップボーナス適用）
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      return {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'neutral',
        lastUpdate: Date.now()
      }
    })
    triggerSave() // データ保存
  }

  // ゲーム報酬適用ハンドラー
  const handleGameReward = (reward: { experience: number; happiness: number; energy: number; coins: number }) => {
    setPet(prev => {
      // ステータス更新
      const baseStats = {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + (reward.happiness || 0)),
        energy: Math.max(0, prev.stats.energy + (reward.energy || 0))
      }
      
      // 経験値とレベルアップ計算
      const currentExperience = prev.experience ?? 0
      const { newExperience, newLevel, levelUpBonus } = calculateLevelUp(currentExperience + (reward.experience || 0), prev.stats.level)
      
      // 最終ステータス（レベルアップボーナス適用）
      const finalStats = {
        ...baseStats,
        level: newLevel,
        happiness: Math.min(100, baseStats.happiness + levelUpBonus.happiness),
        energy: Math.min(100, baseStats.energy + levelUpBonus.energy)
      }
      
      return {
        ...prev,
        stats: finalStats,
        experience: newExperience,
        expression: 'excited', // ゲーム後は興奮状態
        lastUpdate: Date.now()
      }
    })
    triggerSave() // データ保存
  }

  // 会話メッセージ送信ハンドラー
  const handleSendMessage = (message: string) => {
    // ユーザーメッセージを追加
    const userMessage = createUserMessage(message)
    
    // ペットの応答を生成
    const petResponse = generatePetResponse(pet, message, 'general')
    
    // 会話履歴を更新
    setConversationHistory(prev => [...prev, userMessage, petResponse])
    triggerSave() // データ保存
  }

  // Auto-update pet expression based on stats
  useEffect(() => {
    const { happiness, energy } = pet.stats
    let newExpression: Pet['expression'] = 'neutral'

    if (happiness >= 80) newExpression = 'happy'
    else if (happiness >= 60) newExpression = 'neutral'
    else if (happiness < 30) newExpression = 'sad'
    
    if (energy < 20) newExpression = 'tired'
    if (happiness >= 90 && energy >= 70) newExpression = 'excited'

    if (newExpression !== pet.expression) {
      setPet(prev => ({ ...prev, expression: newExpression }))
    }
  }, [pet.stats, pet.expression])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐾 AI Pet Buddy</h1>
        <p>Take care of your virtual pet!</p>
        {/* レベル進行状況表示 */}
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
        ) : (
          <>
            <PetDisplay pet={pet} />
            <StatsPanel stats={pet.stats} />
            <ActionButtons 
              onFeed={handleFeed}
              onPlay={handlePlay}
              onRest={handleRest}
              onGames={() => setShowGamePanel(true)}
            />
            <ConversationPanel 
              pet={pet}
              conversationHistory={conversationHistory}
              onSendMessage={handleSendMessage}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
