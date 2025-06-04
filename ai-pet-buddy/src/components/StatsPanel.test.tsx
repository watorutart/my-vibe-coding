import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsPanel from '../components/StatsPanel'
import { type PetStats } from '../types/Pet'

describe('StatsPanel Component', () => {
  const mockStats: PetStats = {
    happiness: 80,
    hunger: 40,
    energy: 60,
    level: 3
  }

  it('should render stats title', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('Pet Status')).toBeInTheDocument()
  })

  it('should render all stat labels', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('Happiness')).toBeInTheDocument()
    expect(screen.getByText('Hunger')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Level')).toBeInTheDocument()
  })

  it('should render correct stat values', () => {
    render(<StatsPanel stats={mockStats} />)
    expect(screen.getByText('80/100')).toBeInTheDocument() // Happiness
    expect(screen.getAllByText('60/100')).toHaveLength(2) // Hunger and Energy both 60/100
    expect(screen.getByText('3/10')).toBeInTheDocument()   // Level
  })

  it('should render correct stat icons', () => {
    render(<StatsPanel stats={mockStats} />)
        expect(screen.getByText('😊')).toBeInTheDocument() // Happiness icon
    expect(screen.getByText('🍽️')).toBeInTheDocument() // Hunger icon
    expect(screen.getByText('⚡')).toBeInTheDocument() // Energy icon
    expect(screen.getByText('⭐')).toBeInTheDocument() // Level icon
  })

  it('should apply correct colors based on stat values', () => {
    render(<StatsPanel stats={mockStats} />)
    const statFills = document.querySelectorAll('.stat-fill')
    
    // Should have 4 stat bars
    expect(statFills).toHaveLength(4)
    
    // Each stat fill should have a background color set
    statFills.forEach(fill => {
      expect(fill.getAttribute('style')).toContain('background-color')
    })
  })

  it('should show green color for high stats (>=70)', () => {
    const highStats: PetStats = { happiness: 85, hunger: 20, energy: 75, level: 8 }
    render(<StatsPanel stats={highStats} />)
    
    const statFills = document.querySelectorAll('.stat-fill')
    const happinessFill = statFills[0] // First stat is happiness
    const energyFill = statFills[2]    // Third stat is energy
    
    expect(happinessFill).toHaveStyle({ backgroundColor: '#4CAF50' }) // Green
    expect(energyFill).toHaveStyle({ backgroundColor: '#4CAF50' })    // Green
  })

  it('should show orange color for medium stats (40-69)', () => {
    const mediumStats: PetStats = { happiness: 50, hunger: 50, energy: 45, level: 5 }
    render(<StatsPanel stats={mediumStats} />)
    
    const statFills = document.querySelectorAll('.stat-fill')
    const happinessFill = statFills[0]
    const energyFill = statFills[2]
    
    expect(happinessFill).toHaveStyle({ backgroundColor: '#FF9800' }) // Orange
    expect(energyFill).toHaveStyle({ backgroundColor: '#FF9800' })    // Orange
  })

  it('should show red color for low stats (<40)', () => {
    const lowStats: PetStats = { happiness: 25, hunger: 80, energy: 15, level: 1 }
    render(<StatsPanel stats={lowStats} />)
    
    const statFills = document.querySelectorAll('.stat-fill')
    const happinessFill = statFills[0]
    const energyFill = statFills[2]
    
    expect(happinessFill).toHaveStyle({ backgroundColor: '#F44336' }) // Red
    expect(energyFill).toHaveStyle({ backgroundColor: '#F44336' })    // Red
  })

  it('should correctly invert hunger display', () => {
    // When hunger is 80 (very hungry), display should show 20 (not full)
    const hungryStats: PetStats = { ...mockStats, hunger: 80 }
    render(<StatsPanel stats={hungryStats} />)
    expect(screen.getByText('20/100')).toBeInTheDocument()
  })

  it('should set correct width for stat bars', () => {
    render(<StatsPanel stats={mockStats} />)
    const statFills = document.querySelectorAll('.stat-fill')
    
    expect(statFills[0]).toHaveStyle({ width: '80%' })  // Happiness: 80%
    expect(statFills[1]).toHaveStyle({ width: '60%' })  // Hunger: (100-40) = 60%
    expect(statFills[2]).toHaveStyle({ width: '60%' })  // Energy: 60%
    expect(statFills[3]).toHaveStyle({ width: '30%' })  // Level: (3/10) = 30%
  })
})
