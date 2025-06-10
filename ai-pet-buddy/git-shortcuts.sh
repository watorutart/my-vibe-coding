#!/bin/bash
# git-shortcuts.sh - Git便利エイリアス・ショートカット設定
# 日常的なGit操作を効率化するためのコマンド集

echo "🚀 Git便利エイリアス・ショートカット設定"
echo "========================================="

# Git便利エイリアス設定
echo "Git便利エイリアスを設定しています..."

# 現在のプロジェクトパスを取得
PROJECT_PATH="$(pwd)"

# gitdone - 包括的作業完了チェック
git config --global alias.done "!f() { 
    echo '🔄 Git作業完了チェック開始';
    cd '$PROJECT_PATH';
    bash auto-git-complete.sh;
}; f"

# gitquick - 緊急保存コマンド  
git config --global alias.quick "!f() {
    echo '⚡ 緊急保存実行中...';
    git add -A;
    git commit -m \"quick save: \$(date '+%Y-%m-%d %H:%M')\";
    git push origin main;
    echo '✅ 緊急保存完了';
    afplay /System/Library/Sounds/Basso.aiff &
}; f"

# gitcheck - 現在の状況確認
git config --global alias.check "!f() {
    echo '📊 Git状況確認';
    echo '================';
    git status --short;
    echo '';
    echo 'ローカル vs リモート:';
    git log --oneline -1;
    git log --oneline -1 origin/main;
}; f"

# gitflow - 対話的作業フロー
git config --global alias.flow "!f() {
    echo '🔄 対話的Git作業フロー';
    echo '=====================';
    git status;
    echo '';
    read -p 'コミットメッセージを入力: ' msg;
    git add -A;
    git commit -m \"\$msg\";
    git push origin main;
    echo '✅ すべて完了';
    afplay /System/Library/Sounds/Basso.aiff &
}; f"

echo "✅ Git便利エイリアス設定完了"
echo ""

# シェル便利関数設定
echo "シェル便利関数を設定しています..."

# zshrcに追加する関数を作成
cat << 'EOF' >> ~/.zshrc

# AI Pet Buddy Git便利関数
# gitdone - 作業完了確認
gitdone() {
    cd "/Users/suzukiwataru/src/my-vibe-coding/ai-pet-buddy"
    bash auto-git-complete.sh
}

# gitquick - 緊急保存
gitquick() {
    echo "⚡ 緊急保存実行中..."
    git add -A
    git commit -m "quick save: $(date '+%Y-%m-%d %H:%M')"
    git push origin main
    echo "✅ 緊急保存完了"
    afplay /System/Library/Sounds/Basso.aiff &
}

# gitflow - 対話的フロー
gitflow() {
    echo "🔄 対話的Git作業フロー"
    echo "====================="
    git status
    echo ""
    read "msg?コミットメッセージを入力: "
    git add -A
    git commit -m "$msg"
    git push origin main
    echo "✅ すべて完了"
    afplay /System/Library/Sounds/Basso.aiff &
}

EOF

echo "✅ シェル便利関数設定完了"
echo ""

# 使用方法説明
echo "📋 使用可能なコマンド:"
echo "====================="
echo "gitdone   - 包括的作業完了チェック"
echo "gitquick  - 緊急保存（add + commit + push）"
echo "gitflow   - 対話的作業フロー"
echo "git check - 現在の状況確認"
echo ""
echo "🔄 設定を有効にする場合は以下を実行："
echo "source ~/.zshrc"
echo ""
echo "🎉 Git効率化システム設定完了！"
