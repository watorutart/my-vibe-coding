import { useState, useEffect } from 'react'
import type { Pet } from './types/Pet'
import { DEFAULT_PET } from './types/Pet'
import PetDisplay from './components/PetDisplay'
import StatsPanel from './components/StatsPanel'
import ActionButtons from './components/ActionButtons'
import './App.css'

function App() {
  const [pet, setPet] = useState<Pet>(DEFAULT_PET)

  // Action handlers
  const handleFeed = () => {
    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hunger: Math.max(0, prev.stats.hunger - 30),
        happiness: Math.min(100, prev.stats.happiness + 10)
      },
      expression: 'happy',
      lastUpdate: Date.now()
    }))
  }

  const handlePlay = () => {
    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 20),
        energy: Math.max(0, prev.stats.energy - 15)
      },
      expression: 'excited',
      lastUpdate: Date.now()
    }))
  }

  const handleRest = () => {
    setPet(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        energy: Math.min(100, prev.stats.energy + 30),
        happiness: Math.min(100, prev.stats.happiness + 5)
      },
      expression: 'neutral',
      lastUpdate: Date.now()
    }))
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
      </header>
      
      <main className="app-main">
        <PetDisplay pet={pet} />
        <StatsPanel stats={pet.stats} />
        <ActionButtons 
          onFeed={handleFeed}
          onPlay={handlePlay}
          onRest={handleRest}
        />
      </main>
    </div>
  )
}

export default App
