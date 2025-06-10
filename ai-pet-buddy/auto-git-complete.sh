#!/bin/bash
# auto-git-complete.sh - Git作業完了自動化スクリプト

# 色付きメッセージ定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}🔄 Git作業完了チェック開始${NC}"
echo "========================================"

# 現在のGit状況分析
echo -e "\n${PURPLE}📊 Git状況分析${NC}"

STAGED_FILES=$(git diff --cached --name-only | wc -l)
UNSTAGED_FILES=$(git diff --name-only | wc -l)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard | wc -l)
TOTAL_CHANGES=$((STAGED_FILES + UNSTAGED_FILES + UNTRACKED_FILES))

echo "ステージング済み: ${STAGED_FILES}ファイル"
echo "ステージング未済み: ${UNSTAGED_FILES}ファイル"  
echo "未追跡ファイル: ${UNTRACKED_FILES}ファイル"
echo "変更総数: ${TOTAL_CHANGES}ファイル"

# リモート同期状況確認
echo -e "\n${PURPLE}🌍 リモート同期状況${NC}"

git fetch --quiet origin 2>/dev/null || echo "⚠️  リモート取得に問題あり"

LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    SYNC_STATUS="✅ 同期済み"
    SYNC_COLOR=$GREEN
else
    SYNC_STATUS="⚠️  未同期"
    SYNC_COLOR=$YELLOW
fi

echo -e "${SYNC_COLOR}リモート同期: ${SYNC_STATUS}${NC}"
echo "ローカル:  ${LOCAL_COMMIT:0:8}"
echo "リモート:  ${REMOTE_COMMIT:0:8}"

# 作業完了判定
echo -e "\n${PURPLE}🎯 作業完了判定${NC}"

if [ $TOTAL_CHANGES -eq 0 ] && [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}✅ 作業完了 - すべて同期済み${NC}"
    echo "🎉 すべての変更がリモートに反映されています"
    
    # 成功音声通知
    afplay /System/Library/Sounds/Basso.aiff &
    
    echo -e "\n${GREEN}📊 最終レポート${NC}"
    echo "==================="
    echo "ステータス: 完了 ✅"
    echo "最終コミット: ${LOCAL_COMMIT:0:8}"
    echo "同期状況: 完全同期 🌍"
    echo "変更ファイル: なし 📝"
    echo "実行時刻: $(date '+%Y-%m-%d %H:%M:%S')"
    
    exit 0
fi

# 未完了の場合の対応提案
echo -e "${YELLOW}⚠️  作業未完了 - 対応が必要です${NC}"

if [ $TOTAL_CHANGES -gt 0 ]; then
    echo -e "\n${RED}📝 未処理の変更があります:${NC}"
    
    if [ $STAGED_FILES -gt 0 ]; then
        echo "ステージング済み変更:"
        git diff --cached --name-only | sed 's/^/  - /'
    fi
    
    if [ $UNSTAGED_FILES -gt 0 ]; then
        echo "ステージング未済み変更:"
        git diff --name-only | sed 's/^/  - /'
    fi
    
    if [ $UNTRACKED_FILES -gt 0 ]; then
        echo "未追跡ファイル:"
        git ls-files --others --exclude-standard | sed 's/^/  - /'
    fi
fi

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo -e "\n${RED}🌍 リモート同期が必要です${NC}"
    echo "ローカルの変更がリモートに反映されていません"
fi

echo -e "\n${BLUE}🚀 推奨アクション:${NC}"
echo "1. git add -A        # 全変更をステージング"
echo "2. git commit -m \"メッセージ\"  # コミット"
echo "3. git push origin main  # プッシュ"
echo ""
echo "または 'gitdone' エイリアスを使用してください"

echo -e "\n${PURPLE}📊 処理完了レポート${NC}"
echo "==================="
echo "実行時刻: $(date '+%Y-%m-%d %H:%M:%S')"
echo "変更ファイル数: ${TOTAL_CHANGES}"
echo "同期状況: $([ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ] && echo "完了" || echo "未完了")"
