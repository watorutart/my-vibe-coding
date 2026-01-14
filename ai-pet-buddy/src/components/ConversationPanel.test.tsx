import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConversationPanel from './ConversationPanel';
import type { Pet } from '../types/Pet';
import type { ConversationMessage } from '../types/Conversation';

// モックペットデータ
const mockPet: Pet = {
  id: 'test-pet',
  name: 'テストペット',
  type: 'dragon',
  stats: {
    happiness: 80,
    hunger: 60,
    energy: 70,
    level: 5,
  },
  lastUpdate: Date.now(),
  expression: 'happy',
  experience: 150,
};

describe('ConversationPanel', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('会話パネルの基本要素がレンダリングされる', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    expect(screen.getByText('💬 テストペットとの会話')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('メッセージを入力...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
  });

  it('メッセージ履歴が正しく表示される', () => {
    const history: ConversationMessage[] = [
      {
        id: '1',
        type: 'user',
        content: 'こんにちは',
        timestamp: new Date('2024-01-01T10:00:00'),
      },
      {
        id: '2',
        type: 'pet',
        content: 'にゃーん！元気だよ！',
        timestamp: new Date('2024-01-01T10:00:01'),
      },
    ];

    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={history}
      />
    );

    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('にゃーん！元気だよ！')).toBeInTheDocument();
  });

  it('ユーザーメッセージとペットメッセージが異なるスタイルで表示される', () => {
    const history: ConversationMessage[] = [
      {
        id: '1',
        sender: 'user',
        content: 'ユーザーメッセージ',
        timestamp: Date.now(),
      },
      {
        id: '2',
        sender: 'pet',
        content: 'ペットメッセージ',
        timestamp: Date.now(),
      },
    ];

    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={history}
      />
    );

    const userMessage = screen
      .getByText('ユーザーメッセージ')
      .closest('.message');
    const petMessage = screen.getByText('ペットメッセージ').closest('.message');

    expect(userMessage).toHaveClass('user-message');
    expect(petMessage).toHaveClass('pet-message');
  });

  it('メッセージ入力フィールドが正常に動作する', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const input = screen.getByPlaceholderText(
      'メッセージを入力...'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'テストメッセージ' } });
    expect(input.value).toBe('テストメッセージ');
  });

  it('送信ボタンクリックでメッセージが送信される', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    fireEvent.change(input, { target: { value: 'テストメッセージ' } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('テストメッセージ');
  });

  it('Enterキーでメッセージが送信される', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const input = screen.getByPlaceholderText('メッセージを入力...');

    fireEvent.change(input, { target: { value: 'Enterテスト' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSendMessage).toHaveBeenCalledWith('Enterテスト');
  });

  it('空のメッセージは送信されない', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const sendButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('空白のみのメッセージは送信されない', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('メッセージ送信後に入力フィールドがクリアされる', async () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const input = screen.getByPlaceholderText(
      'メッセージを入力...'
    ) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: '送信' });

    fireEvent.change(input, { target: { value: 'クリアテスト' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('最大メッセージ長制限が適用される', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
        maxMessageLength={10}
      />
    );

    const input = screen.getByPlaceholderText(
      'メッセージを入力...'
    ) as HTMLInputElement;
    const longMessage = '１２３４５６７８９０１１１２';

    fireEvent.change(input, { target: { value: longMessage } });
    expect(input.value).toBe('１２３４５６７８９０');
  });

  it('メッセージ履歴が多い場合にスクロールが適用される', () => {
    const longHistory: ConversationMessage[] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `${i}`,
        sender: i % 2 === 0 ? 'user' : 'pet',
        content: `メッセージ ${i + 1}`,
        timestamp: Date.now(),
      })
    );

    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={longHistory}
      />
    );

    const historyContainer = screen.getByTestId('conversation-history');
    expect(historyContainer).toHaveStyle({
      overflowY: 'auto',
      maxHeight: '300px',
    });
  });

  it('ペットの気分に応じたスタイルが適用される', () => {
    const happyPet = { ...mockPet, mood: 'happy' as const };

    render(
      <ConversationPanel
        pet={happyPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    const panel = screen.getByTestId('conversation-panel');
    expect(panel).toHaveClass('mood-happy');
  });

  it('タイムスタンプが正しい形式で表示される', () => {
    const history: ConversationMessage[] = [
      {
        id: '1',
        type: 'user',
        content: 'タイムスタンプテスト',
        timestamp: new Date('2024-01-01T15:30:45'),
      },
    ];

    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={history}
      />
    );

    expect(screen.getByText('15:30')).toBeInTheDocument();
  });

  it('会話履歴がない場合のウェルカムメッセージが表示される', () => {
    render(
      <ConversationPanel
        pet={mockPet}
        onSendMessage={mockOnSendMessage}
        conversationHistory={[]}
      />
    );

    expect(
      screen.getByText('テストペットと会話を始めよう！')
    ).toBeInTheDocument();
  });
});
