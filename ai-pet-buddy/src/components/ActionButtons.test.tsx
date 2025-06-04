import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActionButtons from '../components/ActionButtons'

describe('ActionButtons Component', () => {
  const mockHandlers = {
    onFeed: vi.fn(),
    onPlay: vi.fn(),
    onRest: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render actions title', () => {
    render(<ActionButtons {...mockHandlers} />)
    expect(screen.getByText('Pet Actions')).toBeInTheDocument()
  })

  it('should render all action buttons', () => {
    render(<ActionButtons {...mockHandlers} />)
    expect(screen.getByText('Feed')).toBeInTheDocument()
    expect(screen.getByText('Play')).toBeInTheDocument()
    expect(screen.getByText('Rest')).toBeInTheDocument()
  })

  it('should render correct button icons', () => {
    render(<ActionButtons {...mockHandlers} />)
    expect(screen.getByText('🍖')).toBeInTheDocument() // Feed icon
    expect(screen.getByText('🎾')).toBeInTheDocument() // Play icon
    expect(screen.getByText('😴')).toBeInTheDocument() // Rest icon
  })

  it('should call onFeed when Feed button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...mockHandlers} />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    await user.click(feedButton)
    
    expect(mockHandlers.onFeed).toHaveBeenCalledTimes(1)
  })

  it('should call onPlay when Play button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...mockHandlers} />)
    
    const playButton = screen.getByRole('button', { name: /play/i })
    await user.click(playButton)
    
    expect(mockHandlers.onPlay).toHaveBeenCalledTimes(1)
  })

  it('should call onRest when Rest button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...mockHandlers} />)
    
    const restButton = screen.getByRole('button', { name: /rest/i })
    await user.click(restButton)
    
    expect(mockHandlers.onRest).toHaveBeenCalledTimes(1)
  })

  it('should disable all buttons when disabled prop is true', () => {
    render(<ActionButtons {...mockHandlers} disabled={true} />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    const playButton = screen.getByRole('button', { name: /play/i })
    const restButton = screen.getByRole('button', { name: /rest/i })
    
    expect(feedButton).toBeDisabled()
    expect(playButton).toBeDisabled()
    expect(restButton).toBeDisabled()
  })

  it('should not call handlers when buttons are disabled', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...mockHandlers} disabled={true} />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    await user.click(feedButton)
    
    expect(mockHandlers.onFeed).not.toHaveBeenCalled()
  })

  it('should have correct button CSS classes', () => {
    render(<ActionButtons {...mockHandlers} />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    const playButton = screen.getByRole('button', { name: /play/i })
    const restButton = screen.getByRole('button', { name: /rest/i })
    
    expect(feedButton).toHaveClass('action-btn', 'feed-btn')
    expect(playButton).toHaveClass('action-btn', 'play-btn')
    expect(restButton).toHaveClass('action-btn', 'rest-btn')
  })

  it('should show correct button tooltips', () => {
    render(<ActionButtons {...mockHandlers} />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    const playButton = screen.getByRole('button', { name: /play/i })
    const restButton = screen.getByRole('button', { name: /rest/i })
    
    expect(feedButton).toHaveAttribute('title', 'Reduce hunger')
    expect(playButton).toHaveAttribute('title', 'Increase happiness')
    expect(restButton).toHaveAttribute('title', 'Restore energy')
  })

  it('should have proper structure with icons and labels', () => {
    render(<ActionButtons {...mockHandlers} />)
    
    // Check if each button has both icon and label elements
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      const icon = button.querySelector('.btn-icon')
      const label = button.querySelector('.btn-label')
      
      expect(icon).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })
  })

  it('should support keyboard interaction', async () => {
    const user = userEvent.setup()
    render(<ActionButtons {...mockHandlers} />)
    
    const feedButton = screen.getByRole('button', { name: /feed/i })
    feedButton.focus()
    
    await user.keyboard('{Enter}')
    expect(mockHandlers.onFeed).toHaveBeenCalledTimes(1)
    
    // Space key should also trigger the button
    await user.keyboard(' ')
    expect(mockHandlers.onFeed).toHaveBeenCalledTimes(2)
  })
})
