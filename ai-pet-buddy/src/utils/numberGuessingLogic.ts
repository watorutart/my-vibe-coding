/**
 * 数当てゲームのロジック
 */

export interface DifficultySettings {
  min: number;
  max: number;
  maxAttempts: number;
  baseReward: number;
}

/**
 * 難易度設定
 */
export const DIFFICULTY_SETTINGS: Record<
  'easy' | 'medium' | 'hard',
  DifficultySettings
> = {
  easy: { min: 1, max: 50, maxAttempts: 8, baseReward: 75 },
  medium: { min: 1, max: 100, maxAttempts: 10, baseReward: 100 },
  hard: { min: 1, max: 200, maxAttempts: 12, baseReward: 150 },
};

/**
 * ランダムな目標数字を生成
 */
export function generateTargetNumber(
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return (
    Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min
  );
}

/**
 * 推測の結果を判定
 */
export function evaluateGuess(
  guess: number,
  target: number
): 'correct' | 'too-high' | 'too-low' {
  if (guess === target) {
    return 'correct';
  }
  return guess > target ? 'too-high' : 'too-low';
}

/**
 * ヒントメッセージを生成
 */
export function generateHint(guess: number, target: number): string {
  const evaluation = evaluateGuess(guess, target);

  switch (evaluation) {
    case 'correct':
      return '🎉 正解です！';
    case 'too-high':
      return '📉 もっと小さい数字です';
    case 'too-low':
      return '📈 もっと大きい数字です';
  }
}

/**
 * スコアを計算
 */
export function calculateScore(
  attempts: number,
  maxAttempts: number,
  baseReward: number,
  isCorrect: boolean
): number {
  if (!isCorrect) {
    return Math.floor(baseReward * 0.1); // 失敗時は10%
  }

  const efficiency = (maxAttempts - attempts + 1) / maxAttempts;
  return Math.floor(baseReward * efficiency);
}

/**
 * 報酬を計算
 */
export function calculateReward(
  attempts: number,
  maxAttempts: number,
  difficulty: 'easy' | 'medium' | 'hard',
  isCorrect: boolean
) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const score = calculateScore(
    attempts,
    maxAttempts,
    settings.baseReward,
    isCorrect
  );

  const baseRewards = {
    easy: { experience: 50, happiness: 8, energy: -3 },
    medium: { experience: 75, happiness: 10, energy: -4 },
    hard: { experience: 100, happiness: 12, energy: -5 },
  };

  const base = baseRewards[difficulty];

  if (!isCorrect) {
    return {
      experience: Math.floor(base.experience * 0.2),
      happiness: Math.floor(base.happiness * 0.2),
      energy: Math.floor(base.energy * 0.5),
      coins: 0,
    };
  }

  // 効率ボーナス
  const efficiency = (maxAttempts - attempts + 1) / maxAttempts;
  const efficiencyMultiplier = 0.5 + efficiency * 1.5; // 0.5 - 2.0の範囲

  // パーフェクトゲーム（1回で正解）の特別報酬
  const perfectBonus = attempts === 1 ? 1.5 : 1.0;

  return {
    experience: Math.floor(
      base.experience * efficiencyMultiplier * perfectBonus
    ),
    happiness: Math.floor(base.happiness * efficiencyMultiplier),
    energy: base.energy,
    coins: Math.floor(score / 50) + (attempts === 1 ? 3 : 0), // パーフェクトゲームで特別コイン
  };
}

/**
 * ゲーム結果のメッセージを生成
 */
export function getResultMessage(
  isCorrect: boolean,
  attempts: number,
  maxAttempts: number,
  target: number
): string {
  if (!isCorrect) {
    return `残念！正解は ${target} でした。${maxAttempts}回以内に当てられませんでした。`;
  }

  if (attempts === 1) {
    return `🎉 パーフェクト！1回で正解です！素晴らしい！`;
  } else if (attempts <= 3) {
    return `🎊 素晴らしい！${attempts}回で正解です！`;
  } else if (attempts <= maxAttempts / 2) {
    return `👏 良い感じ！${attempts}回で正解です！`;
  } else {
    return `✅ 正解！${attempts}回で当てました！`;
  }
}

/**
 * 残り試行回数に基づく警告メッセージを生成
 */
export function getWarningMessage(attemptsLeft: number): string | null {
  if (attemptsLeft === 1) {
    return '⚠️ 最後のチャンスです！';
  } else if (attemptsLeft === 2) {
    return '⚠️ 残り2回です！';
  } else if (attemptsLeft === 3) {
    return '💡 残り3回です。慎重に！';
  }
  return null;
}

/**
 * 入力値の妥当性をチェック
 */
export function validateGuess(
  guess: number,
  difficulty: 'easy' | 'medium' | 'hard'
): { isValid: boolean; errorMessage?: string } {
  const settings = DIFFICULTY_SETTINGS[difficulty];

  if (isNaN(guess)) {
    return { isValid: false, errorMessage: '数字を入力してください' };
  }

  if (guess < settings.min || guess > settings.max) {
    return {
      isValid: false,
      errorMessage: `${settings.min}〜${settings.max}の範囲で入力してください`,
    };
  }

  if (!Number.isInteger(guess)) {
    return { isValid: false, errorMessage: '整数を入力してください' };
  }

  return { isValid: true };
}
