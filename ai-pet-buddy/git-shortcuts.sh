#!/bin/bash
# git-shortcuts.sh - Git便利エイリアス・ショートカット設定

echo "🚀 Git便利エイリアス・ショートカット設定"
echo "========================================="

# 現在のプロジェクトパスを取得
PROJECT_PATH="$(pwd)"

echo "Git便利エイリアスを設定しています..."

# gitdone - 包括的作業完了チェック
git config --global alias.done "!bash ${PROJECT_PATH}/auto-git-complete.sh"

# gitquick - 緊急保存コマンド  
git config --global alias.quick '!f() {
    echo "⚡ 緊急保存実行中...";
    git add -A;
    git commit -m "quick save: $(date +\"%Y-%m-%d %H:%M\")";
    git push origin main;
    echo "✅ 緊急保存完了";
    afplay /System/Library/Sounds/Basso.aiff &
}; f'

# gitcheck - 現在の状況確認
git config --global alias.check '!f() {
    echo "📊 Git状況確認";
    echo "================";
    git status --short;
    echo "";
    echo "ローカル vs リモート:";
    git log --oneline -1;
    git log --oneline -1 origin/main;
}; f'

echo "✅ Git便利エイリアス設定完了"
echo ""
echo "�� 使用可能なコマンド:"
echo "====================="
echo "git done   - 包括的作業完了チェック"
echo "git quick  - 緊急保存（add + commit + push）"
echo "git check  - 現在の状況確認"
echo ""
echo "🎉 Git効率化システム設定完了！"
