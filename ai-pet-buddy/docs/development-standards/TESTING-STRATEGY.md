# 🧪 AI Pet Buddy - Testing Strategy & Prevention Plan

## 📋 Testing Guidelines

### 1. Test Creation Rules
- **MUST**: Every new component/function requires corresponding unit tests
- **MUST**: Test coverage should be maintained above 80%
- **MUST**: All tests must pass before committing code
- **SHOULD**: Use Test-Driven Development (TDD) when possible

### 2. File Structure Convention
```
src/
├── components/
│   ├── ComponentName.tsx
│   ├── ComponentName.css
│   └── ComponentName.test.tsx  ← REQUIRED for every component
├── hooks/
│   ├── useHookName.ts
│   └── useHookName.test.ts     ← REQUIRED for every hook
├── utils/
│   ├── utilityName.ts
│   └── utilityName.test.ts     ← REQUIRED for every utility
└── types/
    ├── TypeName.ts
    └── TypeName.test.ts        ← REQUIRED for complex types
```

### 3. Test Categories

#### Component Tests
- **Rendering**: Component renders without crashing
- **Props**: Correct display of props
- **User Interaction**: Click, keyboard, focus events
- **Conditional Rendering**: Different states
- **CSS Classes**: Style application
- **Accessibility**: ARIA attributes, keyboard navigation

#### Hook Tests
- **State Management**: State updates correctly
- **Side Effects**: useEffect behavior
- **Error Handling**: Error states
- **Dependencies**: Dependency changes

#### Utility Tests
- **Input/Output**: Various input scenarios
- **Edge Cases**: Boundary conditions
- **Error Handling**: Invalid inputs

### 4. Prevention Checklist

Before implementing any new feature:
- [ ] Create test file alongside source file
- [ ] Write failing tests first (TDD)
- [ ] Implement minimum code to pass tests
- [ ] Refactor while keeping tests green
- [ ] Verify test coverage with `npm run test:coverage`

### 5. Git Hooks (Future Implementation)
```bash
# Pre-commit hook to ensure tests pass
#!/bin/sh
npm run test:run
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Commit aborted."
  exit 1
fi
echo "✅ All tests passed."
```

### 6. Phase-Specific Testing Requirements

#### Phase 2 (Core Functionality)
- [ ] Auto stat decay system tests
- [ ] Level-up logic tests  
- [ ] AI conversation pattern tests
- [ ] State persistence tests

#### Phase 3 (Visual Enhancements)
- [ ] Sprite rendering tests
- [ ] Evolution animation tests
- [ ] Mini-game logic tests

#### Phase 4 (Data & Deployment)
- [ ] localStorage integration tests
- [ ] Error boundary tests
- [ ] Performance tests

### 7. Testing Commands
```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Generate coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### 8. Test Naming Convention
```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {})
    it('should display correct props', () => {})
  })
  
  describe('user interaction', () => {
    it('should handle click events', () => {})
    it('should support keyboard navigation', () => {})
  })
  
  describe('state management', () => {
    it('should update state correctly', () => {})
  })
})
```

## 🚨 Red Flags - Stop Development If:
1. Test coverage drops below 80%
2. Any test fails in main branch
3. New component added without tests
4. Complex logic implemented without tests

## ✅ 現在の状況
- ✅ Phase 1: **完全なテストカバレッジ (47/47 テスト成功)** 
  - **全体カバレッジ: 85.49%** 🎯
  - コンポーネントカバレッジ: **100%** ✅
  - App.tsxカバレッジ: **97.29%** ✅
  - 型定義カバレッジ: **100%** ✅
- ⏳ Phase 2: テスト実装予定（日本語での開発継続）
- ⏳ Phase 3: テスト実装予定
- ⏳ Phase 4: テスト実装予定

## 📊 カバレッジ目標
- **コンポーネント**: 100% ライン カバレッジ ✅
- **フック**: 100% ライン カバレッジ (実装予定)
- **ユーティリティ**: 100% ライン カバレッジ (実装予定)
- **全体**: 90%+ ライン カバレッジ (現在: **85.49%** - 目標に近づいています！)

## 🌏 日本語開発継続について
- 今後の開発はすべて日本語で行います
- GitHub Copilotとの対話も日本語で実施
- テスト名、コメント、ドキュメントも日本語で記述
- 詳細は `日本語開発継続指針.md` を参照してください
