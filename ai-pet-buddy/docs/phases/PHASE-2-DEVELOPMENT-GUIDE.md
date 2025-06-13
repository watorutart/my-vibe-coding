# 🚀 AI Pet Buddy - Phase 2 開発ガイドライン

## 📋 Phase 2 スコープ: コア機能の実装

### 🎯 目標
1. **自動ステータス減少システム**: 時間経過によるステータスの段階的減少
2. **レベルアップシステム**: 相互作用に基づくペットのレベルアップ
3. **AI会話パターン**: ペットの状態に基づく事前定義済み返答
4. **データ永続化**: ペット状態のlocalStorage統合

### 🧪 テスト駆動開発（TDD）

#### 新しいコードを書く前に必ず：
1. **テストファイルを最初に作成**
   ```bash
   # 実装ファイルと並行してテストファイルを作成
   touch src/hooks/useStatDecay.test.ts
   touch src/hooks/usePetProgress.test.ts  
   touch src/utils/conversationEngine.test.ts
   touch src/utils/localStorage.test.ts
   ```

2. **Write failing tests first**
   - Define expected behavior in tests
   - Run tests (they should fail initially)
   - Implement minimum code to make tests pass

3. **Maintain test coverage above 85%**
   ```bash
   # Check coverage after each feature
   npm run test:coverage
   ```

### 📁 File Structure for Phase 2

```
src/
├── hooks/
│   ├── useStatDecay.ts          ← Auto stat decay logic
│   ├── useStatDecay.test.ts     ← Tests MUST be created first
│   ├── usePetProgress.ts        ← Level-up and progress logic
│   ├── usePetProgress.test.ts   ← Tests MUST be created first
│   └── useLocalStorage.ts       ← Data persistence hook
│   └── useLocalStorage.test.ts  ← Tests MUST be created first
├── utils/
│   ├── conversationEngine.ts    ← AI conversation logic
│   ├── conversationEngine.test.ts ← Tests MUST be created first
│   ├── petCalculations.ts       ← Stat calculation utilities
│   ├── petCalculations.test.ts  ← Tests MUST be created first
│   └── constants.ts             ← Game constants and config
├── components/
│   ├── ConversationPanel.tsx    ← New chat component
│   ├── ConversationPanel.test.tsx ← Tests MUST be created first
│   └── ConversationPanel.css
└── types/
    ├── Conversation.ts          ← Chat message types
    └── Conversation.test.ts     ← Tests MUST be created first
```

### 🔒 Development Rules

#### MANDATORY Test Coverage Requirements:
- [ ] **Every new file** must have a corresponding test file
- [ ] **Every function** must have at least 3 test cases:
  - Happy path (normal input)
  - Edge cases (boundary conditions)
  - Error cases (invalid input)
- [ ] **Every React component** must test:
  - Rendering without crashing
  - Props handling
  - User interactions
  - State changes

#### Development Workflow:
1. ✅ **Write test first** (Red phase)
2. ✅ **Write minimal implementation** (Green phase)
3. ✅ **Refactor while keeping tests green** (Refactor phase)
4. ✅ **Run full test suite** (`npm run test:run`)
5. ✅ **Check coverage** (`npm run test:coverage`)
6. ✅ **Commit only if all tests pass**

### 🎮 Phase 2 Features & Testing Strategy

#### 1. Auto Stat Decay System
```typescript
// useStatDecay.test.ts - Write this FIRST
describe('useStatDecay', () => {
  it('should decrease stats over time', () => {})
  it('should not decrease stats below 0', () => {})
  it('should decay at different rates for different stats', () => {})
  it('should pause decay when pet is being interacted with', () => {})
})
```

#### 2. Level-up System
```typescript
// usePetProgress.test.ts - Write this FIRST
describe('usePetProgress', () => {
  it('should calculate experience correctly', () => {})
  it('should trigger level up when experience threshold is reached', () => {})
  it('should reset experience after level up', () => {})
  it('should not exceed maximum level', () => {})
})
```

#### 3. Conversation Engine
```typescript
// conversationEngine.test.ts - Write this FIRST
describe('conversationEngine', () => {
  it('should return appropriate response based on pet mood', () => {})
  it('should handle unknown inputs gracefully', () => {})
  it('should vary responses to avoid repetition', () => {})
  it('should adapt responses to pet level', () => {})
})
```

#### 4. Data Persistence
```typescript
// useLocalStorage.test.ts - Write this FIRST
describe('useLocalStorage', () => {
  it('should save pet data to localStorage', () => {})
  it('should load pet data from localStorage', () => {})
  it('should handle corrupted data gracefully', () => {})
  it('should provide fallback for unsupported browsers', () => {})
})
```

### 🚨 Phase 2 Red Flags - STOP if:
- [ ] Any new file created without corresponding test file
- [ ] Test coverage drops below 85%
- [ ] Any test fails in main branch
- [ ] New component added without accessibility tests
- [ ] Complex logic implemented without edge case tests

### ✅ Phase 2 Success Criteria
- [ ] All stats decay automatically over time
- [ ] Pet levels up based on care interactions
- [ ] Conversation system responds contextually
- [ ] Pet state persists between browser sessions
- [ ] **Test coverage remains above 85%**
- [ ] **All 47+ tests pass consistently**
- [ ] **No console errors or warnings**

### 🔄 Daily Development Checklist
- [ ] Run `npm test` in watch mode during development
- [ ] Write tests before implementing features
- [ ] Run `npm run test:coverage` after each feature
- [ ] Commit with descriptive messages
- [ ] Update this document with completed features

### 📈 Phase 2 Estimated Timeline
- **Day 2**: Auto stat decay system + tests
- **Day 3**: Level-up system + tests  
- **Day 4**: Conversation engine + tests
- **Day 5**: Data persistence + integration tests

**Remember**: Quality over speed. It's better to have fewer features with excellent test coverage than many features with poor testing!
