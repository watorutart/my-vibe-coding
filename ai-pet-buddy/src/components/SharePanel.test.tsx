/**
 * SharePanel.tsxのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SharePanel } from './SharePanel';
import type { StatsCardData } from '../types/Share';

// useShare hookをモック
vi.mock('../hooks/useShare', () => ({
  useShare: () => ({
    captureScreenshot: vi.fn().mockResolvedValue('mock-image-url'),
    shareToSocial: vi.fn().mockResolvedValue({ success: true }),
    downloadImage: vi.fn(),
    generateShareData: vi.fn().mockReturnValue({
      imageDataUrl: 'mock-image-url',
      title: 'Test',
      description: 'Test description',
      hashtags: ['#test'],
    }),
    generateStatsCard: vi.fn().mockResolvedValue('mock-stats-url'),
    isSharing: false,
    error: null,
    lastShareImageUrl: null,
    clearError: vi.fn(),
  }),
}));

const mockStatsData: StatsCardData = {
  petName: 'Test Pet',
  level: 10,
  evolutionStage: 'adult',
  totalPlayTime: 1440,
  gameWinRate: 0.75,
  achievementCount: 5,
  birthDate: new Date('2024-01-01'),
};

describe('SharePanel', () => {
  const mockOnClose = vi.fn();
  const mockCaptureTargetRef = { current: document.createElement('div') };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <SharePanel
        isOpen={false}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    expect(screen.getByRole('dialog', { name: 'シェア' })).toBeInTheDocument();
    expect(screen.getByText('シェア')).toBeInTheDocument();
  });

  it('should render capture buttons', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
        statsData={mockStatsData}
      />
    );

    expect(screen.getByText('📷 スクリーンショット')).toBeInTheDocument();
    expect(screen.getByText('📊 統計カード')).toBeInTheDocument();
  });

  it('should not render stats card button when statsData is not provided', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    expect(screen.getByText('📷 スクリーンショット')).toBeInTheDocument();
    expect(screen.queryByText('📊 統計カード')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    fireEvent.click(screen.getByLabelText('閉じる'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when panel content is clicked', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
      />
    );

    expect(screen.getByRole('dialog', { name: 'シェア' })).toBeInTheDocument();
    expect(screen.getByLabelText('閉じる')).toBeInTheDocument();
  });

  it('should render capture buttons correctly', () => {
    render(
      <SharePanel
        isOpen={true}
        onClose={mockOnClose}
        captureTargetRef={mockCaptureTargetRef}
        statsData={mockStatsData}
      />
    );

    const screenshotButton = screen.getByText('📷 スクリーンショット');
    const statsButton = screen.getByText('📊 統計カード');

    expect(screenshotButton).toBeInTheDocument();
    expect(statsButton).toBeInTheDocument();
    expect(screenshotButton).not.toBeDisabled();
    expect(statsButton).not.toBeDisabled();
  });
});
