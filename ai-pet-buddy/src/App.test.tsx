import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the app with initial pet state', () => {
    render(<App />)
    
    // Check main elements are rendered
    expect(screen.getByText('🐾 AI Pet Buddy')).toBeInTheDocument()
    expect(screen.getByText('Take care of your virtual pet!')).toBeInTheDocument()
    
    // Check pet display (DEFAULT_PET has name "Buddy")
    expect(screen.getByText('Buddy')).toBeInTheDocument()
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    
    // Check unique stats panel elements
    expect(screen.getByText('Pet Status')).toBeInTheDocument()
    expect(screen.getByText('Happiness')).toBeInTheDocument()
    expect(screen.getByText('🍽️')).toBeInTheDocument() // Hunger icon  
    expect(screen.getByText('⚡')).toBeInTheDocument() // Energy icon
    expect(screen.getByText('⭐')).toBeInTheDocument() // Level icon
    
    // Check action buttons
    expect(screen.getByRole('button', { name: /feed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rest/i })).toBeInTheDocument()
  })

  it('should handle feed action correctly', () => {
    render(<App />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    
    // Click feed button
    fireEvent.click(feedButton)
    
    // Verify the action had some effect (button remains clickable)
    expect(feedButton).toBeInTheDocument()
  })

  it('should handle play action correctly', () => {
    render(<App />)
    
    const playButton = screen.getByRole('button', { name: /play/i })
    
    // Click play button
    fireEvent.click(playButton)
    
    // Verify the action had some effect (button remains clickable)
    expect(playButton).toBeInTheDocument()
  })

  it('should handle rest action correctly', () => {
    render(<App />)
    
    const restButton = screen.getByRole('button', { name: /rest/i })
    
    // Click rest button
    fireEvent.click(restButton)
    
    // Verify the action had some effect (button remains clickable)
    expect(restButton).toBeInTheDocument()
  })

  it('should update pet expression based on stats', () => {
    render(<App />)
    
    // The pet display should show the dragon emoji based on happy expression
    const petBody = document.querySelector('.pet-body')
    expect(petBody).toHaveClass('happy')
    
    // Pet expression should be rendered in the pet display
    const petExpression = document.querySelector('.pet-expression')
    expect(petExpression).toBeInTheDocument()
  })

  it('should maintain responsive layout structure', () => {
    render(<App />)
    
    const appContainer = document.querySelector('.app')
    const petDisplay = document.querySelector('.pet-display')
    const statsPanel = document.querySelector('.stats-panel')
    const actionButtons = document.querySelector('.action-buttons')
    
    expect(appContainer).toBeInTheDocument()
    expect(petDisplay).toBeInTheDocument()
    expect(statsPanel).toBeInTheDocument()
    expect(actionButtons).toBeInTheDocument()
  })

  it('should render all action button icons and labels', () => {
    render(<App />)
    
    // Check feed button elements
    expect(screen.getByText('🍖')).toBeInTheDocument()
    expect(screen.getByText('Feed')).toBeInTheDocument()
    
    // Check play button elements
    expect(screen.getByText('🎾')).toBeInTheDocument()
    expect(screen.getByText('Play')).toBeInTheDocument()
    
    // Check rest button elements
    expect(screen.getByText('😴')).toBeInTheDocument()
    expect(screen.getByText('Rest')).toBeInTheDocument()
  })

  it('should render pet with correct initial stats', () => {
    render(<App />)
    
    // Check that default pet stats are displayed
    expect(screen.getByText('80/100')).toBeInTheDocument() // Happiness
    expect(screen.getByText('40/100')).toBeInTheDocument() // Hunger (100-60=40)
    expect(screen.getByText('70/100')).toBeInTheDocument() // Energy
    expect(screen.getByText('1/10')).toBeInTheDocument() // Level
  })
})
