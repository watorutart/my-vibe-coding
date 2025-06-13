# AI Pet Buddy シェア機能 アーキテクチャ図

このドキュメントでは、シェア機能のアーキテクチャを視覚的に表現した図とフローチャートを提供します。

## 🏗️ システムアーキテクチャ概要図

```mermaid
graph TB
    subgraph "User Interface Layer"
        AB[ActionButtons]
        SP[SharePanel]
        PM[Preview Modal]
        ED[Error Display]
    end
    
    subgraph "Business Logic Layer"
        US[useShare Hook]
        SU[shareUtils]
        IG[imageGenerator]
        EH[errorHandler]
    end
    
    subgraph "External APIs & Libraries"
        H2C[html2canvas]
        TWA[Twitter API]
        FBA[Facebook API]
        LNA[LINE API]
        BDL[Browser Download API]
    end
    
    subgraph "Data & State Management"
        LS[Local Storage]
        SC[State Cache]
        SH[Share History]
    end
    
    AB --> SP
    SP --> US
    US --> SU
    US --> IG
    US --> EH
    
    IG --> H2C
    SU --> TWA
    SU --> FBA
    SU --> LNA
    SU --> BDL
    
    US --> SC
    SU --> LS
    US --> SH
    
    EH --> ED
    IG --> PM
```

## 📊 データフロー図

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}
    
    B -->|Screenshot| C[Capture Element]
    B -->|Stats Card| D[Generate Stats]
    B -->|Share| E[Social Share]
    B -->|Download| F[Download Image]
    
    C --> G[html2canvas Processing]
    G --> H[Canvas to DataURL]
    H --> I[Apply Watermark]
    I --> J[Store Image URL]
    
    D --> K[Create Virtual DOM]
    K --> L[Apply Styles]
    L --> M[Render to Canvas]
    M --> N[Convert to Image]
    N --> J
    
    E --> O[Generate Share Text]
    O --> P[Platform Validation]
    P --> Q[Open Share URL]
    Q --> R[Record History]
    
    F --> S[Create Download Link]
    S --> T[Trigger Download]
    T --> R
    
    J --> U[Update UI State]
    R --> V[Update History]
    U --> W[Display Result]
    V --> W
```

## 🔄 コンポーネント相互作用図

```mermaid
sequenceDiagram
    participant User
    participant AB as ActionButtons
    participant App
    participant SP as SharePanel
    participant US as useShare
    participant IG as imageGenerator
    participant SU as shareUtils
    
    User->>AB: Click Share Button
    AB->>App: setSharePanelOpen(true)
    App->>SP: render with isOpen=true
    SP->>US: initialize hook
    
    User->>SP: Select Screenshot
    SP->>US: captureScreenshot()
    US->>IG: captureElement()
    IG-->>US: return imageDataUrl
    US-->>SP: return imageDataUrl
    SP->>SP: update preview
    
    User->>SP: Select Platform & Share
    SP->>US: shareToSocial()
    US->>SU: shareToSocial()
    SU-->>US: return ShareResult
    US-->>SP: return result
    SP->>SP: show success/error
```

## 🗂️ ファイル構成・モジュール図

```mermaid
graph LR
    subgraph "src/types/"
        ST[Share.ts]
    end
    
    subgraph "src/hooks/"
        USH[useShare.ts]
    end
    
    subgraph "src/utils/"
        SUU[shareUtils.ts]
        IGU[imageGenerator.ts]
    end
    
    subgraph "src/components/"
        SPC[SharePanel.tsx]
        SPCS[SharePanel.css]
        ABC[ActionButtons.tsx]
    end
    
    subgraph "src/tests/"
        STT[types.test.ts]
        UST[useShare.test.ts]
        SUT[shareUtils.test.ts]
        IGT[imageGenerator.test.ts]
        SPT[SharePanel.test.ts]
    end
    
    ST --> USH
    ST --> SUU
    ST --> IGU
    ST --> SPC
    
    USH --> SUU
    USH --> IGU
    
    SPC --> USH
    ABC --> SPC
    SPCS --> SPC
    
    STT --> ST
    UST --> USH
    SUT --> SUU
    IGT --> IGU
    SPT --> SPC
```

## ⚙️ 機能別フローチャート

### スクリーンショット生成フロー

```mermaid
flowchart TD
    A[Start Screenshot] --> B[Validate Target Element]
    B --> C{Element Exists?}
    C -->|No| D[Throw Error]
    C -->|Yes| E[Set Loading State]
    
    E --> F[Configure html2canvas Options]
    F --> G[Execute html2canvas]
    G --> H{Canvas Generated?}
    H -->|No| I[Handle Canvas Error]
    H -->|Yes| J[Convert to DataURL]
    
    J --> K{Watermark Enabled?}
    K -->|Yes| L[Add Watermark]
    K -->|No| M[Store Image URL]
    L --> M
    
    M --> N[Update Last Share Image]
    N --> O[Clear Loading State]
    O --> P[Return Image URL]
    
    D --> Q[Display Error]
    I --> Q
    Q --> R[End]
    P --> R
```

### SNSシェア実行フロー

```mermaid
flowchart TD
    A[Start Social Share] --> B[Validate Share Data]
    B --> C{Data Valid?}
    C -->|No| D[Show Validation Error]
    C -->|Yes| E[Generate Share Text]
    
    E --> F[Check Platform]
    F --> G{Platform Type}
    
    G -->|Twitter| H[Build Twitter URL]
    G -->|Facebook| I[Build Facebook URL]
    G -->|LINE| J[Build LINE URL]
    G -->|Instagram| K[Show Download Message]
    
    H --> L[Open Share Window]
    I --> L
    J --> L
    K --> M[Trigger Download]
    
    L --> N{Window Opened?}
    N -->|Yes| O[Record Success]
    N -->|No| P[Record Failure]
    
    M --> Q[Record Download]
    O --> R[Update History]
    P --> R
    Q --> R
    
    R --> S[Update UI State]
    S --> T[End]
    
    D --> T
```

### 統計カード生成フロー

```mermaid
flowchart TD
    A[Start Stats Card] --> B[Validate Stats Data]
    B --> C{Data Complete?}
    C -->|No| D[Use Default Values]
    C -->|Yes| E[Create Container Element]
    D --> E
    
    E --> F[Build Header Section]
    F --> G[Build Stats Grid]
    G --> H[Build Footer Section]
    
    H --> I[Apply CSS Styles]
    I --> J[Insert into DOM]
    J --> K[Execute html2canvas]
    
    K --> L{Render Success?}
    L -->|No| M[Cleanup & Error]
    L -->|Yes| N[Convert to Image]
    
    N --> O[Remove from DOM]
    O --> P[Apply Post-processing]
    P --> Q[Return Image URL]
    
    M --> R[End with Error]
    Q --> S[End with Success]
```

## 🧩 状態管理図

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Capturing : captureScreenshot()
    Idle --> Generating : generateStatsCard()
    Idle --> Sharing : shareToSocial()
    Idle --> Downloading : downloadImage()
    
    Capturing --> Success : Image Generated
    Capturing --> Error : Generation Failed
    
    Generating --> Success : Card Generated
    Generating --> Error : Generation Failed
    
    Sharing --> Success : Share Completed
    Sharing --> Error : Share Failed
    
    Downloading --> Success : Download Started
    Downloading --> Error : Download Failed
    
    Success --> Idle : Clear State
    Error --> Idle : Clear Error
    
    Success --> Sharing : Share Generated Image
    Success --> Downloading : Download Generated Image
```

## 🎯 エラーハンドリングフロー

```mermaid
flowchart TD
    A[Operation Start] --> B[Try Block]
    B --> C{Operation Type}
    
    C -->|Screenshot| D[html2canvas Operation]
    C -->|Stats Card| E[DOM Generation + Canvas]
    C -->|Social Share| F[URL Generation + Window Open]
    C -->|Download| G[File Download Operation]
    
    D --> H{Success?}
    E --> H
    F --> H
    G --> H
    
    H -->|Yes| I[Update Success State]
    H -->|No| J[Catch Error]
    
    J --> K{Error Type}
    K -->|Canvas Error| L[Display Canvas Error Message]
    K -->|Network Error| M[Display Network Error Message]
    K -->|Browser Error| N[Display Browser Error Message]
    K -->|Validation Error| O[Display Validation Error Message]
    K -->|Unknown Error| P[Display Generic Error Message]
    
    L --> Q[Set Error State]
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    I --> R[Record Success History]
    Q --> S[Record Error History]
    
    R --> T[Update UI]
    S --> T
    T --> U[Enable Retry Option]
    U --> V[End]
```

## 📱 レスポンシブ対応図

```mermaid
graph TB
    subgraph "Desktop (1200px+)"
        D1[Full SharePanel Modal]
        D2[Large Preview Images]
        D3[Horizontal Button Layout]
        D4[Detailed Error Messages]
    end
    
    subgraph "Tablet (768px - 1199px)"
        T1[Compact SharePanel]
        T2[Medium Preview Images]
        T3[Grid Button Layout]
        T4[Abbreviated Messages]
    end
    
    subgraph "Mobile (< 768px)"
        M1[Bottom Sheet Panel]
        M2[Small Preview Images]
        M3[Vertical Button Stack]
        M4[Icon-based Messages]
    end
    
    subgraph "Shared Components"
        SC1[useShare Hook Logic]
        SC2[Error Handling]
        SC3[Image Generation]
        SC4[Share Functionality]
    end
    
    D1 --> SC1
    T1 --> SC1
    M1 --> SC1
    
    D2 --> SC3
    T2 --> SC3
    M2 --> SC3
    
    D4 --> SC2
    T4 --> SC2
    M4 --> SC2
```

## 🔧 テスト構造図

```mermaid
graph TD
    subgraph "Unit Tests"
        UT1[Type Validation Tests]
        UT2[Utility Function Tests]
        UT3[Hook Logic Tests]
        UT4[Error Handling Tests]
    end
    
    subgraph "Integration Tests"
        IT1[Component + Hook Tests]
        IT2[API Integration Tests]
        IT3[File System Tests]
        IT4[Platform-specific Tests]
    end
    
    subgraph "E2E Tests"
        E2E1[User Workflow Tests]
        E2E2[Cross-browser Tests]
        E2E3[Performance Tests]
        E2E4[Accessibility Tests]
    end
    
    subgraph "Mock Services"
        MS1[html2canvas Mock]
        MS2[Browser API Mock]
        MS3[Social Platform Mock]
        MS4[File Download Mock]
    end
    
    UT1 --> MS1
    UT2 --> MS2
    UT3 --> MS3
    UT4 --> MS4
    
    IT1 --> UT1
    IT2 --> UT2
    IT3 --> UT3
    IT4 --> UT4
    
    E2E1 --> IT1
    E2E2 --> IT2
    E2E3 --> IT3
    E2E4 --> IT4
```

## 📊 パフォーマンス監視図

```mermaid
flowchart LR
    subgraph "Performance Metrics"
        PM1[Image Generation Time]
        PM2[File Size Optimization]
        PM3[Memory Usage]
        PM4[User Interaction Response]
    end
    
    subgraph "Monitoring Points"
        MP1[html2canvas Performance]
        MP2[DOM Manipulation Speed]
        MP3[Canvas Rendering Time]
        MP4[Network Request Time]
    end
    
    subgraph "Optimization Strategies"
        OS1[Image Compression]
        OS2[Lazy Loading]
        OS3[Memory Cleanup]
        OS4[Async Processing]
    end
    
    PM1 --> MP1
    PM2 --> MP2
    PM3 --> MP3
    PM4 --> MP4
    
    MP1 --> OS1
    MP2 --> OS2
    MP3 --> OS3
    MP4 --> OS4
```

---

これらの図により、AI Pet Buddyシェア機能の全体像と詳細な実装構造が明確になり、開発・保守・拡張作業の効率化が期待されます。各図は相互に関連しており、システムの理解を多角的にサポートします。