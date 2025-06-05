/**
 * 会話システムに関する型定義
 * AI Pet Buddy アプリケーションの会話機能用
 */

/**
 * 会話メッセージの型定義
 */
export interface ConversationMessage {
  id: string;
  sender: 'user' | 'pet';
  content: string;
  timestamp: number;
}

/**
 * ペットの気分状態
 * 会話パターン選択に使用
 */
export type PetMood = 'happy' | 'neutral' | 'sad' | 'excited' | 'tired' | 'hungry';

/**
 * 会話カテゴリー
 * 会話パターンの分類用
 */
export type ConversationCategory = 'greeting' | 'encouragement' | 'play' | 'mood' | 'need' | 'level_up' | 'general';

/**
 * 会話パターンの定義
 */
export interface ConversationPattern {
  category: ConversationCategory;
  mood: PetMood;
  level?: number; // レベル条件（オプション）
  messages: string[];
}

/**
 * 会話履歴の型定義
 */
export interface ConversationHistory {
  messages: ConversationMessage[];
  lastInteraction: number;
}
