import { describe, it, expect, beforeEach } from 'vitest';
import type { Pet } from '../types/Pet';
import { 
  generatePetResponse, 
  createUserMessage, 
  ConversationHistory,
  categorizeUserInput 
} from './conversationEngine';

describe('conversationEngine', () => {
  // テスト用のモックペットデータ
  const happyPet: Pet = {
    id: 'test-pet',
    name: 'テストペット',
    type: 'dragon',
    stats: {
      happiness: 85,
      hunger: 80,
      energy: 90,
      level: 1
    },
    lastUpdate: Date.now(),
    expression: 'happy',
    experience: 0
  };

  const sadPet: Pet = {
    ...happyPet,
    stats: {
      happiness: 20,
      hunger: 30,
      energy: 30,
      level: 1
    },
    expression: 'sad'
  };

  const tiredPet: Pet = {
    ...happyPet,
    stats: {
      happiness: 60,
      hunger: 60,
      energy: 15,
      level: 1
    },
    expression: 'tired'
  };

  const hungryPet: Pet = {
    ...happyPet,
    stats: {
      happiness: 60,
      hunger: 20,
      energy: 60,
      level: 1
    },
    expression: 'neutral'
  };

  const excitedPet: Pet = {
    ...happyPet,
    stats: {
      happiness: 90,
      hunger: 80,
      energy: 85,
      level: 1
    },
    expression: 'happy'
  };

  const highLevelPet: Pet = {
    ...happyPet,
    stats: {
      happiness: 80,
      hunger: 80,
      energy: 85,
      level: 5
    }
  };

  describe('generatePetResponse', () => {
    it('should generate a response from a happy pet', () => {
      const response = generatePetResponse(happyPet, 'こんにちは', 'greeting');
      
      expect(response).toBeDefined();
      expect(response.sender).toBe('pet');
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.timestamp).toBeDefined();
      expect(response.id).toBeDefined();
    });

    it('should generate a response from a sad pet', () => {
      const response = generatePetResponse(sadPet, 'こんにちは', 'greeting');
      
      expect(response).toBeDefined();
      expect(response.sender).toBe('pet');
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(0);
    });

    it('should generate different responses for different moods', () => {
      // 気分によって異なる応答パターンが選択されることを確認
      // 注意: ランダム性があるため、複数回テストして統計的に検証
      const happyResponses = new Set();
      const sadResponses = new Set();
      
      for (let i = 0; i < 10; i++) {
        happyResponses.add(generatePetResponse(happyPet, 'こんにちは', 'greeting').content);
        sadResponses.add(generatePetResponse(sadPet, 'こんにちは', 'greeting').content);
      }
      
      // 異なる気分では異なる応答パターンが得られることを期待
      const allHappyInSad = Array.from(happyResponses).every(happy => 
        Array.from(sadResponses).includes(happy as string)
      );
      expect(allHappyInSad).toBe(false);
    });

    it('should handle tired pet appropriately', () => {
      const response = generatePetResponse(tiredPet, '遊ぼう', 'play');
      
      expect(response).toBeDefined();
      expect(response.sender).toBe('pet');
      expect(response.content).toBeDefined();
    });

    it('should handle hungry pet appropriately', () => {
      const response = generatePetResponse(hungryPet, 'こんにちは', 'greeting');
      
      expect(response).toBeDefined();
      expect(response.sender).toBe('pet');
      expect(response.content).toBeDefined();
    });

    it('should handle excited pet appropriately', () => {
      const response = generatePetResponse(excitedPet, 'こんにちは', 'greeting');
      
      expect(response).toBeDefined();
      expect(response.sender).toBe('pet');
      expect(response.content).toBeDefined();
    });

    it('should handle high level pet with special responses', () => {
      const response = generatePetResponse(highLevelPet, 'こんにちは', 'greeting');
      
      expect(response).toBeDefined();
      expect(response.sender).toBe('pet');
      expect(response.content).toBeDefined();
    });

    it('should provide response variation', () => {
      const responses = new Set();
      
      // 同じ条件で複数回応答を生成
      for (let i = 0; i < 20; i++) {
        const response = generatePetResponse(happyPet, 'こんにちは', 'greeting');
        responses.add(response.content);
      }
      
      // 複数の異なる応答が得られることを期待
      expect(responses.size).toBeGreaterThan(1);
    });

    it('should handle errors gracefully', () => {
      const invalidPet = {} as Pet;
      
      expect(() => {
        generatePetResponse(invalidPet, 'テスト');
      }).not.toThrow();
      
      const response = generatePetResponse(invalidPet, 'テスト');
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
    });
  });

  describe('createUserMessage', () => {
    it('should create a user message correctly', () => {
      const content = 'こんにちは！';
      const message = createUserMessage(content);
      
      expect(message.sender).toBe('user');
      expect(message.content).toBe(content);
      expect(message.timestamp).toBeDefined();
      expect(message.id).toBeDefined();
    });
  });

  describe('ConversationHistory', () => {
    let history: ConversationHistory;

    beforeEach(() => {
      history = new ConversationHistory();
    });

    it('should add messages to history', () => {
      const userMessage = createUserMessage('テストメッセージ');
      history.addMessage(userMessage);
      
      const messages = history.getMessages();
      expect(messages.length).toBe(1);
      expect(messages[0]).toEqual(userMessage);
    });

    it('should maintain message order', () => {
      const message1 = createUserMessage('メッセージ1');
      const message2 = createUserMessage('メッセージ2');
      
      history.addMessage(message1);
      history.addMessage(message2);
      
      const messages = history.getMessages();
      expect(messages[0]).toEqual(message1);
      expect(messages[1]).toEqual(message2);
    });

    it('should limit messages to max count', () => {
      const limitedHistory = new ConversationHistory(3);
      
      for (let i = 0; i < 5; i++) {
        limitedHistory.addMessage(createUserMessage(`メッセージ${i}`));
      }
      
      const messages = limitedHistory.getMessages();
      expect(messages.length).toBe(3);
      expect(messages[0].content).toBe('メッセージ2');
      expect(messages[2].content).toBe('メッセージ4');
    });

    it('should get recent messages correctly', () => {
      for (let i = 0; i < 5; i++) {
        history.addMessage(createUserMessage(`メッセージ${i}`));
      }
      
      const recent = history.getRecentMessages(2);
      expect(recent.length).toBe(2);
      expect(recent[0].content).toBe('メッセージ3');
      expect(recent[1].content).toBe('メッセージ4');
    });

    it('should clear history', () => {
      history.addMessage(createUserMessage('テスト'));
      expect(history.getMessageCount()).toBe(1);
      
      history.clear();
      expect(history.getMessageCount()).toBe(0);
      expect(history.getMessages().length).toBe(0);
    });

    it('should return correct message count', () => {
      expect(history.getMessageCount()).toBe(0);
      
      history.addMessage(createUserMessage('テスト1'));
      expect(history.getMessageCount()).toBe(1);
      
      history.addMessage(createUserMessage('テスト2'));
      expect(history.getMessageCount()).toBe(2);
    });
  });

  describe('categorizeUserInput', () => {
    it('should categorize greeting messages', () => {
      expect(categorizeUserInput('こんにちは')).toBe('greeting');
      expect(categorizeUserInput('おはよう')).toBe('greeting');
      expect(categorizeUserInput('こんばんは')).toBe('greeting');
      expect(categorizeUserInput('やあ')).toBe('greeting');
      expect(categorizeUserInput('Hello')).toBe('greeting');
      expect(categorizeUserInput('Hi there')).toBe('greeting');
    });

    it('should categorize encouragement messages', () => {
      expect(categorizeUserInput('頑張って')).toBe('encouragement');
      expect(categorizeUserInput('応援してるよ')).toBe('encouragement');
      expect(categorizeUserInput('元気出して')).toBe('encouragement');
      expect(categorizeUserInput('頑張れ')).toBe('encouragement');
    });

    it('should categorize play messages', () => {
      expect(categorizeUserInput('遊ぼう')).toBe('play');
      expect(categorizeUserInput('ゲームしよう')).toBe('play');
      expect(categorizeUserInput('楽しいことしよう')).toBe('play');
      expect(categorizeUserInput('面白いゲーム')).toBe('play');
    });

    it('should categorize unknown messages as general', () => {
      expect(categorizeUserInput('天気はどう？')).toBe('general');
      expect(categorizeUserInput('今日は忙しい')).toBe('general');
      expect(categorizeUserInput('ランダムなメッセージ')).toBe('general');
    });
  });
});
