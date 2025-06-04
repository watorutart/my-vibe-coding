#!/bin/bash

# 🔍 AI Pet Buddy - 強化品質チェックスクリプト
# 静的解析エラー再発防止のための包括的チェック

# 色付きメッセージ用の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 AI Pet Buddy 強化品質チェック${NC}"
echo "=========================================="

# エラーカウンター
ERROR_COUNT=0
WARNING_COUNT=0

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

# 1. TypeScript静的解析チェック
echo -e "\n${PURPLE}📝 TypeScript静的解析チェック${NC}"
if npm run build --silent > build_check.log 2>&1; then
    echo -e "${GREEN}✅ TypeScriptコンパイル成功${NC}"
    rm -f build_check.log
else
    echo -e "${RED}🚨 CRITICAL: TypeScriptコンパイルエラー${NC}"
    echo "詳細エラー:"
    cat build_check.log
    ((ERROR_COUNT++))
fi

# 2. 型専用インポートチェック
echo -e "\n${PURPLE}📦 型インポート検証${NC}"
type_import_issues=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*{.*}" | xargs grep -L "import type" | wc -l)
if [ "$type_import_issues" -eq 0 ]; then
    echo -e "${GREEN}✅ 型インポート適切${NC}"
else
    echo -e "${YELLOW}⚠️  型インポート要確認: ${type_import_issues}ファイル${NC}"
    echo "以下のファイルで型インポートの確認が必要です:"
    find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*{.*}" | xargs grep -L "import type"
    ((WARNING_COUNT++))
fi

# 3. 未使用インポートチェック
echo -e "\n${PURPLE}🧹 未使用インポートチェック${NC}"
unused_imports=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep "import.*{.*}" | grep -E "(fireEvent|act)" | wc -l)
if [ "$unused_imports" -eq 0 ]; then
    echo -e "${GREEN}✅ 未使用インポートなし${NC}"
else
    echo -e "${YELLOW}⚠️  未使用の可能性があるインポート: ${unused_imports}個${NC}"
    ((WARNING_COUNT++))
fi

# 4. テスト実行チェック
echo -e "\n${PURPLE}🧪 テスト実行チェック${NC}"
if npm run test:run --silent > test_check.log 2>&1; then
    test_count=$(grep -o "[0-9]\+ passed" test_check.log | head -1 | awk '{print $1}')
    echo -e "${GREEN}✅ 全${test_count}テスト成功${NC}"
    rm -f test_check.log
else
    echo -e "${RED}🚨 CRITICAL: テスト失敗${NC}"
    echo "詳細エラー:"
    cat test_check.log
    ((ERROR_COUNT++))
fi

# 5. 型チェック専用実行
echo -e "\n${PURPLE}🔍 型チェック専用実行${NC}"
if npx tsc --noEmit --skipLibCheck > type_check.log 2>&1; then
    echo -e "${GREEN}✅ 型チェック成功${NC}"
    rm -f type_check.log
else
    echo -e "${RED}🚨 型チェックエラー${NC}"
    echo "詳細エラー:"
    cat type_check.log
    ((ERROR_COUNT++))
fi

# 6. package.json設定確認
echo -e "\n${PURPLE}📋 package.json設定確認${NC}"
if grep -q "\"check:all\"" package.json; then
    echo -e "${GREEN}✅ 品質チェックスクリプト設定済み${NC}"
else
    echo -e "${YELLOW}⚠️  package.jsonに品質チェックスクリプト未設定${NC}"
    ((WARNING_COUNT++))
fi

# 7. Git設定確認
echo -e "\n${PURPLE}🔧 Git hooks確認${NC}"
if [ -f ".git/hooks/pre-commit" ]; then
    echo -e "${GREEN}✅ pre-commitフック設定済み${NC}"
else
    echo -e "${YELLOW}⚠️  pre-commitフック未設定${NC}"
    ((WARNING_COUNT++))
fi

# 結果サマリー
echo -e "\n${BLUE}📊 品質チェック結果サマリー${NC}"
echo "=============================="

if [ "$ERROR_COUNT" -eq 0 ] && [ "$WARNING_COUNT" -eq 0 ]; then
    echo -e "${GREEN}🎉 完璧！すべてのチェックをパスしました${NC}"
    exit 0
elif [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  警告: ${WARNING_COUNT}個の改善点があります${NC}"
    echo -e "${YELLOW}💡 警告は修正推奨ですが、開発継続可能です${NC}"
    exit 0
else
    echo -e "${RED}🚨 エラー: ${ERROR_COUNT}個の重大な問題があります${NC}"
    echo -e "${RED}💥 エラーを修正してから開発を継続してください${NC}"
    
    if [ "$WARNING_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  追加で${WARNING_COUNT}個の警告もあります${NC}"
    fi
    
    exit 1
fi
