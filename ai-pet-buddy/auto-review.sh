#!/bin/bash

# 🔄 AI Pet Buddy - 自動振り返り実行スクリプト
# 使用方法: ./auto-review.sh [phase|daily|problem]

# 色付きメッセージ用の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 AI Pet Buddy 自動振り返りシステム${NC}"
echo "======================================"

# 引数チェック
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}使用方法: ./auto-review.sh [phase|daily|problem]${NC}"
    echo "  phase   : Phase完了時の包括的振り返り"
    echo "  daily   : 日次の簡易振り返り"  
    echo "  problem : 問題発生時の緊急振り返り"
    exit 1
fi

REVIEW_TYPE=$1
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

case $REVIEW_TYPE in
    "phase")
        echo -e "${GREEN}📊 Phase完了時振り返りを開始します...${NC}"
        
        # 1. テストカバレッジ確認
        echo -e "\n${BLUE}🧪 テスト品質評価${NC}"
        npm run test:coverage --silent > coverage_report_${TIMESTAMP}.txt
        coverage=$(grep "All files" coverage_report_${TIMESTAMP}.txt | awk '{print $4}' | sed 's/%//')
        echo "カバレッジ: ${coverage}%"
        
        # 小数点を含むカバレッジ値の比較（bcコマンドを使用）
        if [ "$(echo "$coverage >= 90" | bc -l)" -eq 1 ]; then
            echo -e "${GREEN}✅ 優秀なカバレッジです${NC}"
        elif [ "$(echo "$coverage >= 80" | bc -l)" -eq 1 ]; then
            echo -e "${GREEN}✅ カバレッジは目標を達成しています！${NC}"
        else
            echo -e "${RED}🚨 カバレッジが不足しています（目標: 80%以上）${NC}"
        fi
        
        # 2. 日本語コメント率確認
        echo -e "\n${BLUE}🌏 日本語化状況評価${NC}"
        japanese_comments=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -h "// " | grep -E "[ひらがなカタカナ漢字]" | wc -l)
        total_comments=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -h "// " | wc -l)
        
        if [ "$total_comments" -gt 0 ]; then
            jp_ratio=$((japanese_comments * 100 / total_comments))
            echo "日本語コメント率: ${jp_ratio}%"
            
            if [ "$jp_ratio" -ge 80 ]; then
                echo -e "${GREEN}✅ 日本語化が適切に進んでいます${NC}"
            else
                echo -e "${YELLOW}⚠️  日本語コメントの増加を推奨します${NC}"
            fi
        fi
        
        # 3. 振り返りテンプレート生成
        echo -e "\n${BLUE}📝 振り返りレポート生成${NC}"
        cat > "Phase振り返り_${TIMESTAMP}.md" << EOF
# 📊 Phase振り返りレポート - $(date '+%Y年%m月%d日')

## 🎯 定量評価
- **テストカバレッジ**: ${coverage}%
- **日本語コメント率**: ${jp_ratio}%
- **テスト成功数**: $(npm run test:run --silent 2>&1 | grep "Tests" | awk '{print $2}')個
- **実装ファイル数**: $(find src/ -name "*.tsx" -o -name "*.ts" | grep -v test | wc -l)個

## ✅ 良かった点
- [ ] [具体的な成功ポイントを記入]
- [ ] [効率的だった手法を記入]
- [ ] [品質が高かった部分を記入]

## 🔴 改善点
- [ ] [問題となった点を記入]
- [ ] [非効率だった部分を記入]  
- [ ] [品質向上が必要な箇所を記入]

## 🎯 次回への改善策
- [ ] [具体的な改善アクションを記入]
- [ ] [プロセス改善案を記入]
- [ ] [ツール・環境改善案を記入]

## 📚 学習した知見
- [新しく学んだ技術・手法]
- [避けるべき実装パターン]
- [効率的な開発手法]

## 🚀 次Phaseでの目標
- [ ] [品質目標]
- [ ] [効率性目標]  
- [ ] [新機能目標]
EOF
        
        echo -e "${GREEN}✅ 振り返りレポートを生成しました: Phase振り返り_${TIMESTAMP}.md${NC}"
        ;;
        
    "daily")
        echo -e "${GREEN}📅 日次振り返りを開始します...${NC}"
        
        # 簡易チェック
        echo -e "\n${BLUE}🔍 簡易品質チェック${NC}"
        
        # テスト実行
        if npm run test:run --silent > /dev/null 2>&1; then
            echo -e "${GREEN}✅ すべてのテストが成功${NC}"
        else
            echo -e "${RED}🚨 テストが失敗しています${NC}"
        fi
        
        # TypeScriptエラーチェック  
        if npm run build --silent > /dev/null 2>&1; then
            echo -e "${GREEN}✅ TypeScriptエラーなし${NC}"
        else
            echo -e "${RED}🚨 TypeScriptエラーが存在します${NC}"
        fi
        
        echo -e "\n${BLUE}📝 今日の開発での気づき：${NC}"
        echo "1. うまくいった点："
        echo "2. 改善が必要な点："
        echo "3. 明日への改善アクション："
        ;;
        
    "problem")
        echo -e "${RED}🚨 問題発生時振り返りを開始します...${NC}"
        
        echo -e "\n${BLUE}📝 問題分析テンプレート生成${NC}"
        cat > "問題分析_${TIMESTAMP}.md" << EOF
# 🚨 問題分析レポート - $(date '+%Y年%m月%d日 %H:%M')

## 📋 問題概要
- **発生時刻**: $(date '+%Y年%m月%d日 %H:%M')
- **問題の種類**: [ ] バグ / [ ] パフォーマンス / [ ] テストエラー / [ ] その他
- **影響範囲**: [ ] 軽微 / [ ] 中程度 / [ ] 重大

## 🔍 問題詳細
### 現象
- [具体的な問題の現象を記述]

### 再現手順  
1. [手順1]
2. [手順2]
3. [手順3]

### エラーメッセージ
\`\`\`
[エラーメッセージをそのまま記録]
\`\`\`

## 🔎 根本原因分析
### 直接的原因
- [問題の直接的な原因]

### 根本的原因
- [なぜその問題が発生したのか、より深い原因]

### 背景・環境要因
- [問題発生に影響した環境や状況]

## 🛠️ 解決策
### 緊急対応（即座に実施）
- [ ] [緊急対応アクション1]
- [ ] [緊急対応アクション2]

### 恒久対策（再発防止）
- [ ] [再発防止策1]
- [ ] [再発防止策2]
- [ ] [プロセス改善案]

## 📚 学習内容
- [この問題から学んだこと]
- [今後気をつけるべき点]
- [チェックリストに追加すべき項目]

## ✅ 対応完了チェック
- [ ] 問題が解決したことを確認
- [ ] テストケースを追加  
- [ ] ドキュメントを更新
- [ ] 再発防止策を実装
EOF
        
        echo -e "${GREEN}✅ 問題分析テンプレートを生成しました: 問題分析_${TIMESTAMP}.md${NC}"
        echo -e "${YELLOW}💡 このテンプレートを埋めて、根本原因分析と再発防止策を検討してください${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ 不正な引数です: $REVIEW_TYPE${NC}"
        echo -e "${YELLOW}使用可能な引数: phase, daily, problem${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎉 振り返り完了！継続的な改善を続けましょう！${NC}"
