import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PetDisplay from '../components/PetDisplay'
import { DEFAULT_PET, type Pet } from '../types/Pet'

describe('PetDisplay Component', () => {
  const mockPet: Pet = {
    ...DEFAULT_PET,
    name: 'TestPet',
    stats: { ...DEFAULT_PET.stats, level: 3 }
  }

  it('should render pet name correctly', () => {
    render(<PetDisplay pet={mockPet} />)
    expect(screen.getByText('TestPet')).toBeInTheDocument()
  })

  it('should render pet level correctly', () => {
    render(<PetDisplay pet={mockPet} />)
    expect(screen.getByText('Level 3')).toBeInTheDocument()
  })

  it('should display correct expression emoji for happy pet', () => {
    const happyPet: Pet = { ...mockPet, expression: 'happy' }
    render(<PetDisplay pet={happyPet} />)
    expect(screen.getByText('😊')).toBeInTheDocument()
  })

  it('should display correct expression emoji for excited pet', () => {
    const excitedPet: Pet = { ...mockPet, expression: 'excited' }
    render(<PetDisplay pet={excitedPet} />)
    expect(screen.getByText('🤩')).toBeInTheDocument()
  })

  it('should display correct expression emoji for sad pet', () => {
    const sadPet: Pet = { ...mockPet, expression: 'sad' }
    render(<PetDisplay pet={sadPet} />)
    expect(screen.getByText('😢')).toBeInTheDocument()
  })

  it('should display correct expression emoji for tired pet', () => {
    const tiredPet: Pet = { ...mockPet, expression: 'tired' }
    render(<PetDisplay pet={tiredPet} />)
    expect(screen.getByText('😴')).toBeInTheDocument()
  })

  it('should display neutral emoji for neutral expression', () => {
    const neutralPet: Pet = { ...mockPet, expression: 'neutral' }
    render(<PetDisplay pet={neutralPet} />)
    expect(screen.getByText('😐')).toBeInTheDocument()
  })

  it('should have proper CSS classes for animations', () => {
    render(<PetDisplay pet={mockPet} />)
    const petBody = document.querySelector('.pet-body')
    expect(petBody).toHaveClass('pet-body')
    expect(petBody).toHaveClass(mockPet.expression)
  })

  it('should change color based on pet level', () => {
    const level5Pet: Pet = { ...mockPet, stats: { ...mockPet.stats, level: 5 } }
    render(<PetDisplay pet={level5Pet} />)
    
    const petBody = document.querySelector('.pet-body')
    expect(petBody?.getAttribute('style')).toContain('background-color')
  })

  it('should render pet wings', () => {
    render(<PetDisplay pet={mockPet} />)
    const leftWing = document.querySelector('.left-wing')
    const rightWing = document.querySelector('.right-wing')
    
    expect(leftWing).toBeInTheDocument()
    expect(rightWing).toBeInTheDocument()
  })

  it('should render pet eyes', () => {
    render(<PetDisplay pet={mockPet} />)
    const leftEye = document.querySelector('.left-eye')
    const rightEye = document.querySelector('.right-eye')
    
    expect(leftEye).toBeInTheDocument()
    expect(rightEye).toBeInTheDocument()
  })
})
