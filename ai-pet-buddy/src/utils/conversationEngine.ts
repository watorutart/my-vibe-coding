import type { Pet } from '../types/Pet';
import type { 
  ConversationMessage, 
  ConversationPattern, 
  ConversationCategory, 
  PetMood 
} from '../types/Conversation';

// 会話パターンデータベース
const conversationPatterns: ConversationPattern[] = [
  // 挨拶パターン - 幸せな気分
  {
    category: 'greeting',
    mood: 'happy',
    messages: [
      'こんにちは！今日も元気だよ！',
      'やっほー！会えて嬉しいな！',
      'おはよう！今日は何して遊ぼうか？',
      'ハロー！君に会えて最高の気分だよ！'
    ]
  },
  // 挨拶パターン - 普通の気分
  {
    category: 'greeting',
    mood: 'neutral',
    messages: [
      'こんにちは。',
      'やあ、元気？',
      'おはよう。',
      'こんばんは。'
    ]
  },
  // 挨拶パターン - 悲しい気分
  {
    category: 'greeting',
    mood: 'sad',
    messages: [
      'こんにちは...なんだか寂しいな。',
      'やあ...今日はあまり元気が出ないや。',
      'おはよう...もう少し一緒にいてくれる？',
      'こんばんは...ちょっと落ち込んでるんだ。'
    ]
  },
  // 挨拶パターン - 疲れた気分
  {
    category: 'greeting',
    mood: 'tired',
    messages: [
      'こんにちは...ちょっと疲れちゃった。',
      'やあ...眠いなあ。',
      'おはよう...まだ眠いよ。',
      'ふぁ...疲れたから少し休もうかな。'
    ]
  },
  // 挨拶パターン - 興奮した気分
  {
    category: 'greeting',
    mood: 'excited',
    messages: [
      'こんにちは！すっごく楽しいことがあったんだ！',
      'やっほー！今日は最高の日だね！',
      'おはよう！エネルギー満タンだよ！',
      'わーい！君と話せて超嬉しい！'
    ]
  },
  // 挨拶パターン - お腹が空いた気分
  {
    category: 'greeting',
    mood: 'hungry',
    messages: [
      'こんにちは...お腹が空いたなあ。',
      'やあ...何か美味しいものない？',
      'おはよう...朝ごはんまだかな？',
      'グルルル...お腹の音が聞こえる？'
    ]
  },

  // 応援パターン - 幸せな気分
  {
    category: 'encouragement',
    mood: 'happy',
    messages: [
      '君なら絶対できるよ！応援してる！',
      '大丈夫、きっと上手くいくよ！',
      '頑張って！僕も一緒にいるからね！',
      '君はすごいんだから、自信を持って！'
    ]
  },
  // 応援パターン - 普通の気分
  {
    category: 'encouragement',
    mood: 'neutral',
    messages: [
      '頑張って。',
      '応援してるよ。',
      'きっと大丈夫。',
      '君ならできる。'
    ]
  },

  // 遊びパターン - 興奮した気分
  {
    category: 'play',
    mood: 'excited',
    messages: [
      'わーい！遊ぼう遊ぼう！',
      '何して遊ぶ？すっごく楽しみ！',
      'やったー！遊びの時間だ！',
      '僕と一緒に楽しいことしよう！'
    ]
  },
  // 遊びパターン - 幸せな気分
  {
    category: 'play',
    mood: 'happy',
    messages: [
      '遊ぼうよ！楽しそう！',
      '一緒に遊べて嬉しいな！',
      '何かゲームしない？',
      '君と遊ぶの大好き！'
    ]
  },
  // 遊びパターン - 疲れた気分
  {
    category: 'play',
    mood: 'tired',
    messages: [
      'ちょっと疲れたけど...少しなら遊べるよ。',
      '軽めの遊びならいいかな？',
      'あまり激しくない遊びがいいな。',
      '疲れてるけど君となら遊びたいな。'
    ]
  },

  // レベルアップ特殊パターン
  {
    category: 'greeting',
    mood: 'excited',
    level: 5,
    messages: [
      'レベル5になったよ！すごいでしょ？',
      'やったー！レベルアップしたんだ！',
      '成長した僕を見て！レベル5だよ！'
    ]
  },

  // デフォルトパターン
  {
    category: 'general',
    mood: 'neutral',
    messages: [
      'そうなんだ。',
      'なるほどね。',
      'うん、わかったよ。',
      'そういうことか。',
      '面白いね。'
    ]
  }
];

/**
 * ペットの状態から気分を判定する
 */
function determinePetMood(pet: Pet): PetMood {
  const { happiness, energy, hunger } = pet.stats;

  // お腹が空いている場合
  if (hunger < 30) {
    return 'hungry';
  }

  // エネルギーが低い場合
  if (energy < 30) {
    return 'tired';
  }

  // 幸福度が高い場合
  if (happiness >= 80) {
    return 'excited';
  } else if (happiness >= 60) {
    return 'happy';
  } else if (happiness >= 40) {
    return 'neutral';
  } else {
    return 'sad';
  }
}

/**
 * 適切な会話パターンを検索する
 */
function findConversationPatterns(
  category: ConversationCategory,
  mood: PetMood,
  level?: number
): ConversationPattern[] {
  // まず、レベル指定がある場合は完全一致を探す
  if (level !== undefined) {
    const levelSpecificPatterns = conversationPatterns.filter(
      pattern => 
        pattern.category === category &&
        pattern.mood === mood &&
        pattern.level === level
    );
    if (levelSpecificPatterns.length > 0) {
      return levelSpecificPatterns;
    }
  }

  // レベル指定なしまたは見つからない場合、カテゴリと気分で検索
  const categoryMoodPatterns = conversationPatterns.filter(
    pattern =>
      pattern.category === category &&
      pattern.mood === mood &&
      pattern.level === undefined
  );
  if (categoryMoodPatterns.length > 0) {
    return categoryMoodPatterns;
  }

  // それでも見つからない場合、カテゴリのみで検索（気分は neutral に降格）
  const categoryPatterns = conversationPatterns.filter(
    pattern =>
      pattern.category === category &&
      pattern.mood === 'neutral' &&
      pattern.level === undefined
  );
  if (categoryPatterns.length > 0) {
    return categoryPatterns;
  }

  // 最終的にデフォルトパターンを返す
  return conversationPatterns.filter(
    pattern => pattern.category === 'general' && pattern.mood === 'neutral'
  );
}

/**
 * ランダムなメッセージを選択する
 */
function selectRandomMessage(patterns: ConversationPattern[]): string {
  if (patterns.length === 0) {
    return 'こんにちは！';
  }

  // 全パターンからメッセージを収集
  const allMessages: string[] = [];
  patterns.forEach(pattern => {
    allMessages.push(...pattern.messages);
  });

  if (allMessages.length === 0) {
    return 'こんにちは！';
  }

  const randomIndex = Math.floor(Math.random() * allMessages.length);
  return allMessages[randomIndex];
}

/**
 * ペットからの応答を生成する
 */
export function generatePetResponse(
  pet: Pet,
  _userMessage: string,
  category: ConversationCategory = 'general'
): ConversationMessage {
  try {
    const mood = determinePetMood(pet);
    const patterns = findConversationPatterns(category, mood, pet.stats.level);
    const responseContent = selectRandomMessage(patterns);

    return {
      id: Date.now().toString(),
      sender: 'pet',
      content: responseContent,
      timestamp: Date.now()
    };
  } catch {
    // エラーが発生した場合のフォールバック
    return {
      id: Date.now().toString(),
      sender: 'pet',
      content: 'ごめん、ちょっと混乱しちゃった。',
      timestamp: Date.now()
    };
  }
}

/**
 * ユーザーメッセージを作成する
 */
export function createUserMessage(content: string): ConversationMessage {
  return {
    id: Date.now().toString(),
    sender: 'user',
    content,
    timestamp: Date.now()
  };
}

/**
 * 会話履歴を管理するクラス
 */
export class ConversationHistory {
  private messages: ConversationMessage[] = [];
  private maxMessages: number;

  constructor(maxMessages: number = 50) {
    this.maxMessages = maxMessages;
  }

  addMessage(message: ConversationMessage): void {
    this.messages.push(message);
    
    // 最大メッセージ数を超えた場合、古いメッセージを削除
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  getRecentMessages(count: number): ConversationMessage[] {
    return this.messages.slice(-count);
  }

  clear(): void {
    this.messages = [];
  }

  getMessageCount(): number {
    return this.messages.length;
  }
}

/**
 * カテゴリを自動判定する（シンプルなキーワードベース）
 */
export function categorizeUserInput(userMessage: string): ConversationCategory {
  const message = userMessage.toLowerCase();

  if (message.includes('こんにちは') || 
      message.includes('おはよう') || 
      message.includes('こんばんは') ||
      message.includes('やあ') ||
      message.includes('hello') ||
      message.includes('hi')) {
    return 'greeting';
  }

  if (message.includes('頑張') || 
      message.includes('応援') || 
      message.includes('励まし') ||
      message.includes('元気') ||
      message.includes('頑張れ')) {
    return 'encouragement';
  }

  if (message.includes('遊') || 
      message.includes('ゲーム') || 
      message.includes('楽しい') ||
      message.includes('面白い') ||
      message.includes('play')) {
    return 'play';
  }

  return 'general';
}
