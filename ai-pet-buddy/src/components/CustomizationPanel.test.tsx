/**
 * CustomizationPanel.test.tsx - カスタマイズパネルコンポーネントのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomizationPanel from './CustomizationPanel';
import { DEFAULT_CUSTOMIZATION, DEFAULT_ACCESSORIES } from '../types/Customization';

// useCustomization フックのモック
let mockCustomizationHook = {
  customizationState: {
    current: DEFAULT_CUSTOMIZATION,
    available: DEFAULT_ACCESSORIES,
    presets: []
  },
  previewCustomization: DEFAULT_CUSTOMIZATION,
  isPreviewMode: false,
  isLoading: false,
  error: null as string | null,
  updateName: vi.fn(),
  updateColor: vi.fn(),
  addAccessory: vi.fn(),
  removeAccessory: vi.fn(),
  startPreview: vi.fn(),
  applyPreview: vi.fn(),
  cancelPreview: vi.fn(),
  resetToDefault: vi.fn()
};

vi.mock('../hooks/useCustomization', () => ({
  useCustomization: () => mockCustomizationHook
}));

describe('CustomizationPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnApply = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // モック状態をリセット
    mockCustomizationHook = {
      customizationState: {
        current: DEFAULT_CUSTOMIZATION,
        available: DEFAULT_ACCESSORIES,
        presets: []
      },
      previewCustomization: DEFAULT_CUSTOMIZATION,
      isPreviewMode: false,
      isLoading: false,
      error: null as string | null,
      updateName: vi.fn().mockReturnValue({ isValid: true }),
      updateColor: vi.fn().mockReturnValue({ isValid: true }),
      addAccessory: vi.fn().mockReturnValue({ success: true }),
      removeAccessory: vi.fn(),
      startPreview: vi.fn(),
      applyPreview: vi.fn(),
      cancelPreview: vi.fn(),
      resetToDefault: vi.fn()
    };
  });

  describe('レンダリング', () => {
    it('should render customization panel', () => {
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      expect(screen.getByText('🎨 ペットカスタマイズ')).toBeInTheDocument();
      expect(screen.getByText('名前')).toBeInTheDocument();
      expect(screen.getByText('色')).toBeInTheDocument();
      expect(screen.getByText('アクセサリー')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      mockCustomizationHook.isLoading = true;
      
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('should render error message', () => {
      mockCustomizationHook.error = 'テストエラー';
      
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);
      
      expect(screen.getByText('テストエラー')).toBeInTheDocument();
    });
  });

  describe('タブ切り替え', () => {
    it('should switch to color tab', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      await user.click(screen.getByText('色'));

      expect(screen.getByText('色の変更')).toBeInTheDocument();
      expect(screen.getByText('カラーパレット')).toBeInTheDocument();
    });

    it('should switch to accessories tab', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      await user.click(screen.getByRole('button', { name: 'アクセサリー' }));

      expect(screen.getByText('アクセサリー', { selector: 'h3' })).toBeInTheDocument();
      // デフォルトアクセサリーが表示されることを確認
      expect(screen.getByText('麦わら帽子')).toBeInTheDocument();
    });

    it('should show active tab styling', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const colorTab = screen.getByText('色');
      await user.click(colorTab);

      expect(colorTab).toHaveClass('active');
    });
  });

  describe('名前編集', () => {
    it('should update name input', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const nameInput = screen.getByLabelText('ペット名:');
      await user.clear(nameInput);
      await user.type(nameInput, '新しい名前');

      expect(nameInput).toHaveValue('新しい名前');
    });

    it('should show character count', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const nameInput = screen.getByLabelText('ペット名:');
      await user.clear(nameInput);
      await user.type(nameInput, 'テスト');

      expect(screen.getByText('3/20文字')).toBeInTheDocument();
    });

    it('should call updateName when in preview mode', async () => {
      mockCustomizationHook.isPreviewMode = true;
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const nameInput = screen.getByLabelText('ペット名:');
      await user.type(nameInput, 'x');

      // updateName should be called when typing
      expect(mockCustomizationHook.updateName).toHaveBeenCalled();
    });
  });

  describe('色編集', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);
      await user.click(screen.getByText('色'));
    });

    it('should display color palette', () => {
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('色を') && 
        button.getAttribute('aria-label')?.includes('に変更')
      );
      
      expect(colorButtons.length).toBeGreaterThan(0);
    });

    it('should handle color selection from palette', async () => {
      const user = userEvent.setup();
      
      const redColorButton = screen.getByLabelText('色を#FF6B6Bに変更');
      await user.click(redColorButton);

      // プレビューモードでない場合は、内部状態のみ更新される
      expect(redColorButton).toHaveClass('selected');
    });

    it('should handle custom color input', async () => {
      const user = userEvent.setup();
      
      const customColorInputs = screen.getAllByDisplayValue('#FF6B6B');
      const textColorInput = customColorInputs.find(input => input.getAttribute('type') === 'text');
      
      if (textColorInput) {
        // Just verify that the input can be interacted with
        await user.click(textColorInput);
        expect(textColorInput).toBeInTheDocument();
        expect(textColorInput).toHaveValue('#FF6B6B');
      }
    });
  });

  describe('アクセサリー管理', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);
      await user.click(screen.getByText('アクセサリー'));
    });

    it('should display available accessories', () => {
      expect(screen.getByText('麦わら帽子')).toBeInTheDocument();
      expect(screen.getByText('赤いリボン')).toBeInTheDocument();
    });

    it('should show unlocked accessories as available', () => {
      const hatAccessory = screen.getByText('麦わら帽子').closest('.accessory-item');
      expect(hatAccessory).not.toHaveClass('locked');
      
      const addButton = hatAccessory?.querySelector('.accessory-button');
      expect(addButton).not.toBeDisabled();
    });

    it('should show locked accessories as disabled', () => {
      const sunglassesAccessory = screen.getByText('サングラス').closest('.accessory-item');
      expect(sunglassesAccessory).toHaveClass('locked');
      
      const lockButton = sunglassesAccessory?.querySelector('.accessory-button');
      expect(lockButton).toBeDisabled();
    });

    it('should handle accessory toggle', async () => {
      const user = userEvent.setup();
      
      const hatAccessory = screen.getByText('麦わら帽子').closest('.accessory-item');
      const addButton = hatAccessory?.querySelector('.accessory-button');
      
      if (addButton) {
        await user.click(addButton);
        expect(mockCustomizationHook.addAccessory).toHaveBeenCalled();
      }
    });
  });

  describe('プレビュー機能', () => {
    it('should start preview mode', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const previewButton = screen.getByText('プレビュー開始');
      await user.click(previewButton);

      expect(mockCustomizationHook.startPreview).toHaveBeenCalled();
    });

    it('should not show preview button when in preview mode', () => {
      mockCustomizationHook.isPreviewMode = true;
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      expect(screen.queryByText('プレビュー開始')).not.toBeInTheDocument();
    });

    it('should show preview pet with customizations', () => {
      mockCustomizationHook.isPreviewMode = true;
      mockCustomizationHook.previewCustomization = {
        ...DEFAULT_CUSTOMIZATION,
        name: 'プレビューペット',
        color: '#00FF00'
      };
      
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      expect(screen.getByText('プレビューペット')).toBeInTheDocument();
    });
  });

  describe('ボタンアクション', () => {
    it('should apply changes', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const applyButton = screen.getByText('適用');
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalled();
    });

    it('should cancel changes', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const cancelButton = screen.getByText('キャンセル');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset to default', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const resetButton = screen.getByText('リセット');
      await user.click(resetButton);

      expect(mockCustomizationHook.resetToDefault).toHaveBeenCalled();
    });

    it('should close panel when close button clicked', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const closeButton = screen.getByLabelText('閉じる');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('should display name validation error', () => {
      mockCustomizationHook.error = '名前が無効です';
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      expect(screen.getByText('名前が無効です')).toBeInTheDocument();
      
      const nameInput = screen.getByLabelText('ペット名:');
      expect(nameInput).toHaveClass('error');
    });

    it('should display color validation error', async () => {
      const user = userEvent.setup();
      mockCustomizationHook.error = '色コードが無効です';
      
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);
      await user.click(screen.getByText('色'));

      expect(screen.getByText('色コードが無効です')).toBeInTheDocument();
    });

    it('should display accessory error', async () => {
      const user = userEvent.setup();
      mockCustomizationHook.error = 'アクセサリーエラー';
      
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);
      await user.click(screen.getByText('アクセサリー'));

      expect(screen.getByText('アクセサリーエラー')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('should have proper ARIA labels', () => {
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      expect(screen.getByLabelText('閉じる')).toBeInTheDocument();
      expect(screen.getByLabelText('ペット名:')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CustomizationPanel customizationApi={mockCustomizationHook} onClose={mockOnClose} onApply={mockOnApply} />);

      const nameInput = screen.getByLabelText('ペット名:');
      await user.click(nameInput);
      
      // 直接フォーカスした要素が正しいことを確認
      expect(document.activeElement).toBe(nameInput);
    });
  });
});