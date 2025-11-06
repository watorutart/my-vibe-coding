/**
 * じゃんけんゲームのロジック
 */

export type Choice = 'rock' | 'paper' | 'scissors';
export type GameResult = 'win' | 'lose' | 'draw';

/**
 * じゃんけんの勝敗を判定
 */
export function determineWinner(
  playerChoice: Choice,
  aiChoice: Choice
): GameResult {
  if (playerChoice === aiChoice) {
    return 'draw';
  }

  const winConditions: Record<Choice, Choice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };

  return winConditions[playerChoice] === aiChoice ? 'win' : 'lose';
}

/**
 * AIの選択を生成（ランダム）
 */
export function generateAIChoice(): Choice {
  const choices: Choice[] = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * スコアを計算
 */
export function calculateScore(
  result: GameResult,
  consecutiveWins: number,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const baseScores = {
    win: { easy: 100, medium: 150, hard: 200 },
    draw: { easy: 25, medium: 35, hard: 50 },
    lose: { easy: 10, medium: 15, hard: 20 },
  };

  const baseScore = baseScores[result][difficulty];
  const consecutiveBonus = consecutiveWins * 25;

  return baseScore + consecutiveBonus;
}

/**
 * 報酬を計算
 */
export function calculateReward(
  result: GameResult,
  consecutiveWins: number,
  difficulty: 'easy' | 'medium' | 'hard'
) {
  const baseRewards = {
    win: {
      easy: { experience: 75, happiness: 10, energy: -3 },
      medium: { experience: 100, happiness: 12, energy: -4 },
      hard: { experience: 150, happiness: 15, energy: -5 },
    },
    draw: {
      easy: { experience: 25, happiness: 3, energy: -1 },
      medium: { experience: 35, happiness: 4, energy: -1 },
      hard: { experience: 50, happiness: 5, energy: -2 },
    },
    lose: {
      easy: { experience: 15, happiness: 1, energy: -1 },
      medium: { experience: 20, happiness: 2, energy: -1 },
      hard: { experience: 30, happiness: 3, energy: -1 },
    },
  };

  const base = baseRewards[result][difficulty];
  const consecutiveBonus = Math.floor(consecutiveWins * 0.2 * base.experience);

  return {
    experience: base.experience + consecutiveBonus,
    happiness: base.happiness,
    energy: base.energy,
    coins: result === 'win' ? Math.floor(consecutiveWins / 2) + 1 : 0,
  };
}

/**
 * 選択肢のアイコンを取得
 */
export function getChoiceIcon(choice: Choice): string {
  const icons = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️',
  };
  return icons[choice];
}

/**
 * 選択肢の日本語名を取得
 */
export function getChoiceName(choice: Choice): string {
  const names = {
    rock: 'グー',
    paper: 'パー',
    scissors: 'チョキ',
  };
  return names[choice];
}

/**
 * 結果のメッセージを取得
 */
export function getResultMessage(result: GameResult): string {
  const messages = {
    win: 'あなたの勝ち！',
    lose: 'あなたの負け...',
    draw: 'あいこ！',
  };
  return messages[result];
}
