import { describe, it, expect } from 'vitest';
import type {
  ConversationMessage,
  PetMood,
  ConversationPattern,
  ConversationHistory,
} from './Conversation';

describe('Conversation型定義', () => {
  describe('ConversationMessage', () => {
    it('should accept valid conversation message', () => {
      const validMessage: ConversationMessage = {
        id: 'msg-001',
        sender: 'pet',
        content: 'こんにちは！',
        timestamp: Date.now(),
      };

      expect(validMessage.id).toBe('msg-001');
      expect(validMessage.sender).toBe('pet');
      expect(validMessage.content).toBe('こんにちは！');
      expect(typeof validMessage.timestamp).toBe('number');
    });

    it('should accept user and pet as valid senders', () => {
      const userMessage: ConversationMessage = {
        id: 'msg-user',
        sender: 'user',
        content: 'ユーザーメッセージ',
        timestamp: Date.now(),
      };

      const petMessage: ConversationMessage = {
        id: 'msg-pet',
        sender: 'pet',
        content: 'ペットメッセージ',
        timestamp: Date.now(),
      };

      expect(userMessage.sender).toBe('user');
      expect(petMessage.sender).toBe('pet');
    });
  });

  describe('PetMood', () => {
    it('should accept all valid mood values', () => {
      const validMoods: PetMood[] = [
        'happy',
        'neutral',
        'sad',
        'excited',
        'tired',
        'hungry',
      ];

      validMoods.forEach(mood => {
        const testMood: PetMood = mood;
        expect(validMoods).toContain(testMood);
      });
    });
  });

  describe('ConversationPattern', () => {
    it('should accept valid conversation pattern', () => {
      const pattern: ConversationPattern = {
        category: 'greeting',
        mood: 'happy',
        level: 1,
        messages: ['こんにちは！', '元気だよ！', 'いい天気だね！'],
      };

      expect(pattern.category).toBe('greeting');
      expect(pattern.mood).toBe('happy');
      expect(pattern.level).toBe(1);
      expect(pattern.messages).toHaveLength(3);
      expect(pattern.messages[0]).toBe('こんにちは！');
    });

    it('should accept pattern without level requirement', () => {
      const pattern: ConversationPattern = {
        category: 'general',
        mood: 'neutral',
        messages: ['そうですね', 'なるほど'],
      };

      expect(pattern.level).toBeUndefined();
      expect(pattern.messages).toHaveLength(2);
    });
  });

  describe('ConversationHistory', () => {
    it('should accept valid conversation history', () => {
      const history: ConversationHistory = {
        messages: [],
        lastInteraction: Date.now(),
      };

      expect(Array.isArray(history.messages)).toBe(true);
      expect(typeof history.lastInteraction).toBe('number');
    });

    it('should handle multiple messages in history', () => {
      const messages: ConversationMessage[] = [
        {
          id: 'msg-1',
          sender: 'user',
          content: 'こんにちは',
          timestamp: Date.now() - 1000,
        },
        {
          id: 'msg-2',
          sender: 'pet',
          content: 'こんにちは！元気だよ！',
          timestamp: Date.now(),
        },
      ];

      const history: ConversationHistory = {
        messages,
        lastInteraction: Date.now(),
      };

      expect(history.messages).toHaveLength(2);
      expect(history.messages[0].sender).toBe('user');
      expect(history.messages[1].sender).toBe('pet');
    });
  });
});
