# AI Pet Buddy システムフロー シーケンス図

このドキュメントでは、AI Pet Buddyプロジェクトの主要な処理フローをシーケンス図で視覚化しています。各図はMermaid記法で記述されており、システムの動作を理解しやすくすることを目的としています。

## 1. ミニゲーム実行フロー

ユーザーがミニゲーム（Memory Game / Reflex Game / Quiz Game）を実行する際の処理フローです。

```mermaid
sequenceDiagram
    participant U as User
    participant MGP as MiniGamePanel
    participant UG as useGame Hook
    participant GE as GameEngine
    participant Game as MemoryGame/ReflexGame/QuizGame
    participant PD as PetDisplay
    participant A as App

    Note over U,A: ゲーム選択・開始フロー
    U->>MGP: ゲーム選択 (type, difficulty)
    MGP->>MGP: handleGameSelect(config)
    U->>MGP: "ゲーム開始" ボタンクリック
    MGP->>UG: startGame(selectedGame)
    UG->>GE: startGame(config)
    GE->>GE: generateQuestion(type, difficulty)
    GE-->>UG: return GameSession
    UG-->>MGP: currentSession updated
    MGP->>UG: playGame()
    UG->>GE: playGame()
    GE->>GE: status = 'playing'
    GE-->>UG: onGameUpdate(session)
    UG-->>MGP: gameState updated

    Note over U,A: ゲームプレイ・UI表示フロー
    MGP->>Game: render with session props
    Game->>Game: showSequence() / 問題表示
    loop ゲームプレイ中
        U->>Game: 回答入力 (クリック/タップ)
        Game->>MGP: onSubmitAnswer(answer)
        MGP->>UG: submitAnswer(answer)
        UG->>GE: submitAnswer(answer)
        GE->>GE: validateAnswer()
        alt 正解の場合
            GE->>GE: updateScore(+points)
            GE->>GE: generateNextQuestion()
        else 不正解または時間切れ
            GE->>GE: endGame()
        end
        GE-->>UG: onGameUpdate(session)
        UG-->>MGP: currentSession updated
        MGP-->>Game: props updated
    end

    Note over U,A: ゲーム終了・報酬配布フロー
    GE->>GE: calculateGameResult()
    GE->>GE: calculateReward()
    GE-->>UG: onGameComplete(result)
    UG-->>MGP: game complete callback
    MGP-->>A: onRewardEarned(reward)
    A->>A: handleGameReward()
    A->>A: setPet (経験値・ステータス更新)
    A->>A: calculateLevelUp()
    A-->>PD: pet props updated
    PD->>PD: render updated expression/stats
```

### ミニゲーム実行フローの説明

1. **ゲーム選択**: ユーザーがゲームタイプと難易度を選択
2. **セッション開始**: GameEngineが問題を生成し、ゲームセッションを作成
3. **ゲームプレイ**: 各ゲームコンポーネントが問題を表示し、ユーザーの回答を処理
4. **回答検証**: GameEngineが回答を検証し、スコアを更新
5. **報酬配布**: ゲーム終了時に獲得した報酬をペットステータスに反映
6. **UI更新**: PetDisplayがペットの新しい状態を表示

---

## 2. 進化システムフロー

ペットの進化判定・実行フローです。ステータス変更時に自動的に進化条件をチェックし、必要に応じて進化を実行します。

```mermaid
sequenceDiagram
    participant A as App
    participant UE as useEvolution Hook
    participant EE as evolutionEngine
    participant PD as PetDisplay
    participant DS as dataStorage

    Note over A,DS: ペットステータス変更時の進化チェック
    A->>A: handleAction (Feed/Play/Rest/GameReward)
    A->>A: setPet(updatedStats)
    
    Note over A,DS: 進化システム初期化・チェック
    A-->>UE: pet props updated
    UE->>EE: syncProgressWithPet(pet, progress)
    EE->>EE: calculateEvolutionProgress(pet)
    EE-->>UE: return updated progress
    
    UE->>EE: getNextEvolutionStage(pet, progress)
    EE->>EE: find next available stage
    EE-->>UE: return nextStage
    
    UE->>EE: checkEvolutionRequirements(pet, nextStage)
    EE->>EE: validate level, stats, conditions
    alt 進化条件満足
        EE-->>UE: return {canEvolve: true, requirements}
        Note over UE: canEvolveNext = true
    else 進化条件不満足
        EE-->>UE: return {canEvolve: false, missing}
        Note over UE: canEvolveNext = false
    end

    Note over A,DS: 自動進化実行 (条件満足時)
    alt 進化可能な場合
        UE->>UE: triggerEvolution()
        UE->>EE: evolvePet(pet, progress)
        EE->>EE: createEvolutionEvent()
        EE->>EE: updatePetStage()
        EE->>EE: updateEvolutionProgress()
        EE-->>UE: return {pet, progress, event}
        
        UE-->>A: onPetUpdate(evolvedPet)
        A->>A: setPet(evolvedPet)
        UE->>UE: setEvolutionProgress(newProgress)
        UE->>UE: setLatestEvolutionEvent(event)
        
        Note over A,DS: UI更新・データ保存
        A-->>PD: pet props updated
        PD->>PD: render evolved appearance
        A->>DS: saveData(pet, conversationHistory)
        DS->>DS: savePetData() to localStorage
    end
```

### 進化システムフローの説明

1. **トリガー**: ペットのステータス変更（餌やり、遊び、ゲーム報酬など）
2. **進化判定**: useEvolutionが現在の進化段階と次の段階を計算
3. **条件チェック**: evolutionEngineが進化要件（レベル、ステータス）を確認
4. **進化実行**: 条件満足時に自動的に進化処理を実行
5. **状態更新**: ペットの見た目・能力・進化履歴を更新
6. **永続化**: 変更されたデータをlocalStorageに保存

---

## 3. データ永続化フロー

アプリケーション起動時のデータ復元と、ペット状態変更時の自動保存フローです。

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant A as App
    participant UDP as useDataPersistence Hook
    participant DS as dataStorage
    participant LS as localStorage

    Note over Browser,LS: アプリケーション起動・データ復元フロー
    Browser->>A: App component mount
    A->>UDP: useDataPersistence({autoSaveInterval: 30000})
    UDP->>UDP: 初期化 (refs, callbacks設定)
    
    A->>UDP: loadInitialData()
    UDP->>DS: loadPetData()
    DS->>LS: getItem('ai-pet-buddy-pet')
    LS-->>DS: return JSON string | null
    alt データが存在する場合
        DS->>DS: JSON.parse(petData)
        DS->>DS: validatePetData()
        DS-->>UDP: return valid Pet object
    else データが存在しない場合
        DS-->>UDP: return null
    end
    
    UDP->>DS: loadConversationHistory()
    DS->>LS: getItem('ai-pet-buddy-conversation')
    LS-->>DS: return JSON string | null
    alt 履歴が存在する場合
        DS->>DS: JSON.parse(history)
        DS->>DS: validateConversationHistory()
        DS-->>UDP: return ConversationMessage[]
    else 履歴が存在しない場合
        DS-->>UDP: return []
    end
    
    UDP-->>A: return {pet, conversationHistory}
    A->>A: setPet(savedPet || DEFAULT_PET)
    A->>A: setConversationHistory(savedHistory)

    Note over Browser,LS: 自動保存システム設定
    A->>UDP: setupAutoSave(pet, conversationHistory)
    UDP->>UDP: setInterval(saveCallback, 30000)
    UDP->>UDP: addEventListener('beforeunload', saveHandler)
    UDP->>UDP: addEventListener('visibilitychange', saveHandler)

    Note over Browser,LS: データ変更・自動保存フロー
    loop ペット状態変更時
        A->>A: handleAction() - ペット状態更新
        A->>A: handleSendMessage() - 会話履歴更新
        
        Note over A,LS: 自動保存実行
        UDP->>UDP: autoSave interval triggered
        UDP->>DS: savePetData(pet)
        DS->>DS: JSON.stringify(pet)
        DS->>LS: setItem('ai-pet-buddy-pet', jsonData)
        
        UDP->>DS: saveConversationHistory(history)
        DS->>DS: JSON.stringify(history)
        DS->>LS: setItem('ai-pet-buddy-conversation', jsonData)
        
        alt 保存エラーが発生した場合
            DS->>DS: catch error
            DS->>DS: console.error('保存失敗')
            Note over DS: 例外を投げず、サイレントに失敗
        end
    end

    Note over Browser,LS: アプリ終了時の保存
    Browser->>Browser: beforeunload event
    UDP->>UDP: beforeUnloadHandler()
    UDP->>DS: savePetData(pet)
    UDP->>DS: saveConversationHistory(history)
    DS->>LS: setItem() - 最終データ保存
```

### データ永続化フローの説明

1. **初期ロード**: アプリ起動時にlocalStorageから保存されたデータを復元
2. **データ検証**: 読み込んだデータの整合性をチェック
3. **自動保存設定**: 30秒間隔での自動保存とブラウザ終了時保存を設定
4. **リアルタイム保存**: ペット状態や会話履歴の変更を検知して自動保存
5. **エラーハンドリング**: 保存失敗時もアプリケーションを継続動作

---

## 4. 会話システムフロー

ペットとの会話・応答システムのフローです。ユーザーの入力に基づいてペットが適切な応答を生成します。

```mermaid
sequenceDiagram
    participant U as User
    participant CP as ConversationPanel
    participant A as App
    participant CE as conversationEngine
    participant PD as PetDisplay
    participant DS as dataStorage

    Note over U,DS: ユーザーメッセージ入力フロー
    U->>CP: メッセージ入力
    U->>CP: Enter押下 / 送信ボタンクリック
    CP->>CP: handleSendMessage()
    CP->>CP: validate message (trim, length)
    
    alt メッセージが有効な場合
        CP-->>A: onSendMessage(trimmedMessage)
        A->>A: handleSendMessage(message)
        
        Note over A,DS: ユーザーメッセージ作成・保存
        A->>CE: createUserMessage(message)
        CE->>CE: generate unique ID
        CE->>CE: set timestamp
        CE-->>A: return UserMessage
        
        Note over A,DS: ペット応答生成
        A->>CE: generatePetResponse(pet, message, 'general')
        CE->>CE: determinePetMood(pet)
        CE->>CE: analyze pet stats (happiness, energy, hunger)
        alt ペットが幸せな場合
            CE->>CE: mood = 'happy'
        else ペットが疲れている場合
            CE->>CE: mood = 'tired'
        else ペットが悲しい場合
            CE->>CE: mood = 'sad'
        else その他
            CE->>CE: mood = 'neutral'
        end
        
        CE->>CE: findConversationPatterns(category, mood, level)
        CE->>CE: selectRandomMessage(patterns)
        CE->>CE: createPetMessage(content)
        CE-->>A: return PetMessage
        
        Note over A,DS: 会話履歴更新・保存
        A->>A: setConversationHistory([...prev, userMessage, petResponse])
        A->>DS: triggerSave() - 自動保存
        DS->>DS: saveConversationHistory()
        
        Note over A,DS: UI更新・表示
        A-->>CP: conversationHistory props updated
        CP->>CP: useEffect - scroll to bottom
        CP->>CP: render new messages
        CP->>CP: format timestamps
        CP->>CP: apply message styling
        
        Note over A,DS: ペット表現更新（会話による影響）
        alt ポジティブな会話内容の場合
            A->>A: ペットの幸福度微調整
            A-->>PD: pet props updated
            PD->>PD: update expression animation
        end
    else メッセージが無効な場合
        CP->>CP: メッセージ送信せず
        Note over CP: 空文字・長すぎる場合は処理しない
    end
    
    Note over U,DS: エラーハンドリング・フォールバック
    alt 応答生成エラーの場合
        CE->>CE: catch error
        CE->>CE: return fallback message
        CE-->>A: "ごめん、ちょっと混乱しちゃった。"
        Note over CE: システムエラー時も会話を継続
    end
```

### 会話システムフローの説明

1. **入力検証**: ユーザーの入力メッセージを検証（空文字・長さチェック）
2. **メッセージ作成**: タイムスタンプ付きのユーザーメッセージを生成
3. **ペット状態分析**: 現在のペットの気分・ステータスを分析
4. **応答生成**: ペットの状態に応じた適切な応答パターンを選択
5. **履歴更新**: 会話履歴にメッセージを追加し、自動保存
6. **UI反映**: 新しいメッセージを画面に表示し、自動スクロール

---

## 技術的特徴・設計原則

### アーキテクチャの特徴

1. **モジュラー設計**: 各機能を独立したモジュールとして実装
2. **型安全性**: TypeScriptによる完全な型定義
3. **エラーハンドリング**: 各レイヤーでの適切なエラー処理
4. **状態管理**: React Hooksによる効率的な状態管理

### パフォーマンス最適化

1. **メモ化**: useCallbackによる関数の最適化
2. **自動保存**: 適切な間隔での非同期保存
3. **UI更新**: 必要最小限のレンダリング
4. **データ検証**: 保存・読み込み時のデータ整合性確保

### 拡張性・保守性

1. **依存性注入**: コールバックによる疎結合設計
2. **設定可能**: 各システムのパラメータを外部から制御可能
3. **テスト容易性**: 255のテストケースで動作を保証
4. **ドキュメント化**: 明確なインターフェース定義

---

## 5. ペットカスタマイズシステムフロー

Phase 4で実装されたペットカスタマイズシステムの処理フローです。名前変更、色変更、アクセサリー管理の各機能を含みます。

### 5.1 カスタマイズパネル開始・初期化フロー

```mermaid
sequenceDiagram
    participant U as User
    participant AB as ActionButtons
    participant A as App
    participant CP as CustomizationPanel
    participant UC as useCustomization Hook
    participant CU as customizationUtils
    participant LS as localStorage

    Note over U,LS: カスタマイズパネル開始フロー
    U->>AB: "🎨 Customize" ボタンクリック
    AB-->>A: onCustomize()
    A->>A: setShowCustomizationPanel(true)
    A->>CP: mount CustomizationPanel
    
    Note over CP,LS: カスタマイズ状態初期化
    CP->>UC: useCustomization() - Hook初期化
    UC->>UC: useState初期化 (DEFAULT_CUSTOMIZATION)
    UC->>UC: loadInitialCustomization()
    UC->>CU: loadCustomizationData()
    
    CU->>LS: getItem('ai-pet-buddy-customization-data')
    LS-->>CU: return current customization | null
    CU->>LS: getItem('ai-pet-buddy-available-accessories')
    LS-->>CU: return accessories | null
    CU->>LS: getItem('ai-pet-buddy-customization-presets')
    LS-->>CU: return presets | null
    
    alt 保存データが存在する場合
        CU->>CU: JSON.parse(savedData)
        CU->>CU: isValidCustomization(data)
        CU->>CU: restore Date objects
        CU-->>UC: return {current, available, presets}
    else 保存データが存在しない場合
        CU-->>UC: return default state
    end
    
    UC->>UC: setCustomizationState(loadedState)
    UC->>UC: setPreviewCustomization(current)
    UC-->>CP: customizationState updated
    
    Note over CP,LS: UI初期化・レンダリング
    CP->>CP: useState - activeTab: 'name'
    CP->>CP: setTempName(current.name)
    CP->>CP: setTempColor(current.color)
    CP->>CP: render tabbed interface
    CP->>CP: render preview section
```

### 5.2 名前変更フロー

```mermaid
sequenceDiagram
    participant U as User
    participant CP as CustomizationPanel
    participant UC as useCustomization Hook
    participant CU as customizationUtils
    participant Val as Validation
    participant LS as localStorage

    Note over U,LS: 名前変更フロー
    U->>CP: Name tab選択
    CP->>CP: setActiveTab('name')
    U->>CP: input field入力
    CP->>CP: handleNameChange(newName)
    CP->>CP: setTempName(newName)
    
    alt プレビューモードの場合
        CP->>UC: updateName(newName)
        UC->>Val: validatePetName(newName)
        
        Val->>Val: check length (1-20 chars)
        Val->>Val: check invalid characters
        Val->>Val: check not empty
        
        alt バリデーション成功
            Val-->>UC: {isValid: true}
            UC->>UC: update previewCustomization
            UC->>UC: setError(null)
            UC-->>CP: validation success
            CP->>CP: remove error styling
        else バリデーション失敗
            Val-->>UC: {isValid: false, error: message}
            UC->>UC: setError(errorMessage)
            UC-->>CP: validation error
            CP->>CP: show error message
            CP->>CP: apply error styling
        end
    end
    
    Note over U,LS: 変更適用フロー
    U->>CP: "適用" ボタンクリック
    CP->>CP: handleApply()
    
    alt プレビューモード中の場合
        CP->>UC: applyPreview()
        UC->>UC: setCustomizationState(previewData)
        UC->>UC: setIsPreviewMode(false)
    else 通常モードの場合
        CP->>UC: updateName(tempName)
        UC->>UC: setCustomizationState(updated)
    end
    
    Note over U,LS: データ保存・終了
    UC->>UC: auto-save timer trigger
    UC->>CU: saveCustomizationData(state)
    CU->>CU: JSON.stringify(current)
    CU->>LS: setItem('ai-pet-buddy-customization-data', data)
    CP-->>U: パネル閉じる
```

### 5.3 色変更・カラーパレットフロー

```mermaid
sequenceDiagram
    participant U as User
    participant CP as CustomizationPanel
    participant UC as useCustomization Hook
    participant CU as customizationUtils
    participant Val as Validation

    Note over U,Val: 色変更フロー
    U->>CP: Color tab選択
    CP->>CP: setActiveTab('color')
    CP->>CP: render color palette
    CP->>CP: render custom color picker
    
    alt プリセットカラー選択
        U->>CP: カラーパレットから色選択
        CP->>CP: handleColorChange(selectedColor)
        CP->>CP: setTempColor(selectedColor)
        
        alt プレビューモード中
            CP->>UC: updateColor(selectedColor)
            UC->>Val: validateColor(selectedColor)
            Val->>Val: check HEX format (#RRGGBB or #RGB)
            Val->>Val: validate color code
            Val-->>UC: {isValid: true}
            UC->>UC: update previewCustomization.color
            UC-->>CP: preview updated
            CP->>CP: update preview pet color
        end
    
    else カスタム色入力
        U->>CP: カスタムカラーピッカー操作
        CP->>CP: onChange(colorEvent)
        CP->>CP: handleColorChange(e.target.value)
        
        alt 色テキスト入力
            U->>CP: HEX入力フィールド入力
            CP->>CP: validate pattern="#[0-9A-Fa-f]{6}"
            
            alt 無効なフォーマット
                CP->>CP: apply error styling
                CP->>CP: show validation message
            else 有効なフォーマット
                CP->>UC: updateColor(hexCode)
                UC->>Val: validateColor(hexCode)
                Val-->>UC: validation result
                UC-->>CP: update preview/state
            end
        end
    end
    
    Note over U,Val: リアルタイムプレビュー
    CP->>CP: render color preview circle
    CP->>CP: style={{ backgroundColor: tempColor }}
    CP->>CP: update pet preview background
    CP->>CP: show current color display
```

### 5.4 アクセサリー管理フロー

```mermaid
sequenceDiagram
    participant U as User
    participant CP as CustomizationPanel
    participant UC as useCustomization Hook
    participant CU as customizationUtils
    participant Val as Validation

    Note over U,Val: アクセサリー管理フロー
    U->>CP: Accessories tab選択
    CP->>CP: setActiveTab('accessories')
    CP->>CP: render accessories grid
    
    loop アクセサリー一覧表示
        CP->>CP: map over available accessories
        CP->>CP: check accessory.unlocked status
        CP->>CP: check current wearing status
        CP->>CP: render accessory item with icon
        CP->>CP: show lock/unlock state
    end
    
    Note over U,Val: アクセサリー装着/解除フロー
    U->>CP: アクセサリーボタンクリック
    CP->>CP: handleAccessoryToggle(accessoryId)
    CP->>CP: check isWearing status
    
    alt 現在装着中の場合
        CP->>UC: removeAccessory(accessoryId)
        UC->>CU: removeAccessoryFromCustomization(current, id)
        CU->>CU: filter out accessory by id
        CU->>CU: update lastModified timestamp
        CU-->>UC: return updated customization
        UC->>UC: update preview/current state
    
    else 未装着の場合
        CP->>UC: addAccessory(accessoryId)
        UC->>Val: validateAccessoryId(id, available)
        
        Val->>Val: check accessory exists
        Val->>Val: check accessory.unlocked status
        
        alt バリデーション成功
            Val-->>UC: {isValid: true}
            UC->>CU: addAccessoryToCustomization(current, accessory)
            CU->>CU: remove same type accessories (override)
            CU->>CU: add new accessory
            CU->>CU: update lastModified
            CU-->>UC: return updated customization
            UC-->>CP: {success: true}
            
        else バリデーション失敗 (ロック中など)
            Val-->>UC: {isValid: false, error: message}
            UC->>UC: setError(errorMessage)
            UC-->>CP: {success: false, error}
            CP->>CP: show error message
        end
    end
    
    Note over U,Val: UI状態更新
    UC-->>CP: customization state updated
    CP->>CP: re-render accessories grid
    CP->>CP: update wearing/not-wearing styles
    CP->>CP: update pet preview accessories
    CP->>CP: show accessory icons on preview pet
```

### 5.5 プレビューシステムフロー

```mermaid
sequenceDiagram
    participant U as User
    participant CP as CustomizationPanel
    participant UC as useCustomization Hook
    participant State as React State

    Note over U,State: プレビューシステムフロー
    U->>CP: "プレビュー開始" ボタンクリック
    CP->>UC: startPreview()
    UC->>UC: setPreviewCustomization(current)
    UC->>UC: setIsPreviewMode(true)
    UC-->>CP: isPreviewMode updated
    
    CP->>CP: hide "プレビュー開始" button
    CP->>CP: show preview controls
    CP->>CP: enable real-time preview
    
    Note over U,State: リアルタイム変更プレビュー
    loop ユーザーが変更を行う
        U->>CP: 名前/色/アクセサリー変更
        CP->>UC: updateName/updateColor/addAccessory
        UC->>UC: update previewCustomization only
        UC->>UC: current customization not modified
        UC-->>CP: preview state updated
        CP->>CP: render updated preview
        CP->>CP: show temporary changes in UI
    end
    
    Note over U,State: プレビュー適用・キャンセル分岐
    alt ユーザーが適用を選択
        U->>CP: "適用" ボタンクリック
        CP->>CP: handleApply()
        CP->>UC: applyPreview()
        UC->>UC: setCustomizationState(preview)
        UC->>UC: current = previewCustomization
        UC->>UC: setIsPreviewMode(false)
        UC-->>CP: changes applied
        CP-->>CP: close panel
        
    else ユーザーがキャンセルを選択
        U->>CP: "キャンセル" ボタンクリック
        CP->>CP: handleCancel()
        CP->>UC: cancelPreview()
        UC->>UC: setPreviewCustomization(current)
        UC->>UC: setIsPreviewMode(false)
        UC->>UC: discard all preview changes
        UC-->>CP: preview cancelled
        CP-->>CP: close panel
        
    else ユーザーがリセットを選択
        U->>CP: "リセット" ボタンクリック
        CP->>CP: handleReset()
        CP->>UC: resetToDefault()
        UC->>UC: apply DEFAULT_CUSTOMIZATION
        UC->>UC: setError(null)
        UC-->>CP: reset to defaults
        CP->>CP: update temp values
        CP->>CP: refresh all UI elements
    end
```

### 5.6 カスタマイズデータ永続化フロー

```mermaid
sequenceDiagram
    participant UC as useCustomization Hook
    participant Timer as Auto-save Timer
    participant CU as customizationUtils
    participant LS as localStorage
    participant Error as Error Handler

    Note over UC,Error: 自動保存システム初期化
    UC->>UC: useEffect - autoSave setup
    UC->>Timer: setInterval(saveCallback, 5000)
    UC->>UC: setup lastSaveTimeRef
    
    Note over UC,Error: 自動保存実行フロー
    loop 5秒間隔での自動保存
        Timer->>UC: auto-save interval trigger
        UC->>UC: check time since last save
        alt 保存間隔を満たした場合
            UC->>UC: saveCustomization()
            UC->>CU: saveCustomizationData(state)
            
            CU->>CU: JSON.stringify(current)
            CU->>LS: setItem('ai-pet-buddy-customization-data', json)
            
            CU->>CU: JSON.stringify(available)
            CU->>LS: setItem('ai-pet-buddy-available-accessories', json)
            
            CU->>CU: JSON.stringify(presets)
            CU->>LS: setItem('ai-pet-buddy-customization-presets', json)
            
            alt 保存成功
                CU-->>UC: return true
                UC->>UC: lastSaveTimeRef.current = Date.now()
                UC->>UC: console.log('saved successfully')
                
            else 保存失敗
                LS-->>CU: throw error (quota exceeded, etc.)
                CU->>Error: catch error
                CU->>Error: console.error('save failed', error)
                CU-->>UC: return false
                UC->>UC: setError('保存に失敗しました')
            end
        end
    end
    
    Note over UC,Error: 手動保存・コンポーネント終了時
    UC->>UC: component unmount
    UC->>Timer: clearInterval(autoSaveTimer)
    UC->>UC: final save attempt
    UC->>CU: saveCustomizationData(finalState)
    CU->>LS: setItem() - 最終保存
    
    Note over UC,Error: エラー処理・フォールバック
    alt ストレージエラー発生時
        LS-->>CU: QuotaExceededError
        CU->>Error: handleError('storage quota exceeded')
        Error->>Error: log error details
        Error->>Error: show user-friendly message
        Error-->>UC: return false, continue operation
        Note over UC: アプリは動作継続、一時的にメモリ内で管理
    end
```

---

## 6. カスタマイズシステム技術詳細

### 6.1 アーキテクチャ設計原則

**レイヤー構造**:
```
UI Layer (CustomizationPanel.tsx)
    ↓
Hook Layer (useCustomization.ts)
    ↓
Business Logic Layer (customizationUtils.ts)
    ↓
Type Safety Layer (Customization.ts)
    ↓
Storage Layer (localStorage)
```

**設計パターン**:
1. **Custom Hook Pattern**: ロジックとUIの分離
2. **Preview Pattern**: 変更前の試行機能
3. **Validation Strategy**: 複数バリデーションの統一管理
4. **Auto-save Pattern**: 非同期データ永続化

### 6.2 バリデーション仕様

**名前バリデーション**:
- 長さ: 1-20文字
- 禁止文字: `<>"/\\|?*`
- 空文字禁止

**色バリデーション**:
- フォーマット: `#RGB` または `#RRGGBB`
- HEX形式: `[A-Fa-f0-9]`のみ許可

**アクセサリーバリデーション**:
- 存在チェック: available配列内に存在
- 解除チェック: `unlocked: true`
- 重複制御: 同タイプは1つまで装着可能

### 6.3 データ構造設計

**PetCustomization Interface**:
```typescript
{
  name: string;           // ペット名
  color: string;          // HEXカラーコード
  accessories: Accessory[]; // 装着アクセサリー配列
  unlocked: boolean;      // カスタマイズ機能解除状態
  lastModified: Date;     // 最終更新時刻
}
```

**Storage Strategy**:
- 3つの独立したlocalStorageキー
- JSON直列化でのデータ保存
- Date型の適切な復元処理
- バックワードコンパチビリティ確保

### 6.4 パフォーマンス最適化

**レンダリング最適化**:
- `useCallback`での関数メモ化
- 必要最小限の状態更新
- 条件分岐による無駄なレンダリング防止

**データ管理最適化**:
- 差分更新によるStorage負荷軽減
- 自動保存間隔の調整可能性
- エラー時のフォールバック処理

### 6.5 拡張性・保守性

**拡張ポイント**:
1. **新しいアクセサリータイプ**: type unionへの追加
2. **追加バリデーション**: 関数型での拡張
3. **新しいプリセット**: presets配列への追加
4. **カスタムカラーパレット**: 設定可能なcolor配列

**テスト戦略**:
- 型定義: 13テスト
- Utils: 26テスト  
- Hook: 25テスト
- UI Component: 28テスト
- **合計: 92テスト** (カスタマイズ関連)

これらのシーケンス図と技術仕様により、AI Pet Buddyのペットカスタマイズシステムの全体像が明確になり、新規開発者の理解促進やシステム拡張時の設計指針として活用できます。
