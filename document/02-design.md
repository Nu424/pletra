# Time Tracking App 設計書

---

## 1. 背景・目的

日々のタスク（勉強、会議、開発など）にかかった時間を手軽に記録・集計できるシンプルかつモダンなタイムトラッキングアプリを開発します。  
将来的にバックエンド（Firebase/Supabase 等）への移行を見据えつつ、まずは `localStorage` を利用してシンプルに実装します。

---

## 2. コア機能

1. タスク登録・編集・削除  
2. タスクごとの時間トラッキング（開始・一時停止・再開・完了・中断）  
3. 記録一覧の閲覧・ソート・フィルタ  
4. 合計時間表示  
5. 設定画面（テーマ切替、エクスポートなど将来機能）  

---

## 3. 画面仕様

### 3.1 記録操作画面（Tracking）

```
┌─────────────────────────────┐
│【進行中カード】               │
│ ┌─────────────────────┐ │
│ │ 🧮 数学の勉強   00:12 │ │ ← グラデカード（グラデーション背景）  
│ │ [一時停止][完了][中断] │ │  
│ └─────────────────────┘ │
│                             │
│【タスクグリッド】           │
│ ┌───┐ ┌───┐ ┌───┐ …       │
│ │📚 │ │💻 │ │🧪 │        │  
│ │読書│ │開発│ │実験│        │  
│ └───┘ └───┘ └───┘ …       │  
│  +(追加)ボタン            │  
└─────────────────────────────┘
```

- 進行中カード  
  - タスク名、アイコン、経過時間をリアルタイム表示  
  - [一時停止] → [再開][完了][中断] に切替  
  - 中断＝ごみ箱アイコン：記録せず終了  
  - 完了＝記録リストへ追加  

- タスクグリッド  
  - 既存タスクはアイコン＋タスク名ボタン  
  - 長押し → 同一のポップアップで「編集モード」を起動  
  - 追加ボタン → 同一ポップアップの「追加モード」を起動  

- タスク追加／編集ポップアップ  
  - 入力項目：タスク名（必須）、アイコン（絵文字選択）  
  - 操作：保存(追加 or 更新)、削除(編集時のみ)  

### 3.2 記録一覧画面（History）

```
┌─────────────────────────────┐
│[検索ボックス][ソート▼]         │
│ 累計：12h 34m                │
│─────────────────────────────│
│┌────────────────────────┐ │
││ 🧮 数学の勉強  00:12    │ │ ← カード  
││ 開始：2024-06-01 10:00  │ │  
││ 終了：2024-06-01 10:12  │ │  
│└────────────────────────┘ │
│   …                           │
└─────────────────────────────┘
```

- ソート：新→旧／旧→新／長→短／短→長  
- フィルタ：タスク名検索  
- 合計時間：画面表示中レコードの合計  
- カードタップ → 編集ポップアップ（タスク変更・メモ追加・削除）  

### 3.3 設定画面（Settings）

- ※ 必要に応じて機能拡張  
- 例：テーマ切替（ライト／ダーク）、データエクスポート、バックアップ連携  

---

## 4. データモデル

```typescript
// Task
type Task = {
  id: string;                // UUID
  name: string;              // タスク名
  icon: string;              // 絵文字
  createdAt: number;         // 作成日時（epoch）
}

// Record
type Record = {
  id: string;                // UUID
  taskId: string;
  startAt: number;           // 直前の開始時刻
  accumulated: number;       // 一時停止時の累計(ms)
  endAt?: number;            // 完了時刻／中断時は undefined
  note?: string;             // メモ
}
```

---

## 5. アーキテクチャ概略

- フロントエンド：React + TypeScript + TailwindCSS  
- 状態管理：React Context + useReducer  
- ストレージ抽象化：`StorageService`（localStorage → 将来のDB切替対応）  
- タイマー管理：`TimerService`（setInterval＋クロージャ注意）  

### 5.1 Context構成

1. TaskContext  
   - state: `tasks: Task[]`  
   - actions: addTask, updateTask, deleteTask  
2. RecordContext  
   - state: `records: Record[]`, `activeRecordId?: string`  
   - actions: startRecord, pauseRecord, resumeRecord, completeRecord, cancelRecord, updateRecord, deleteRecord  
3. UIContext (optional)  
   - モーダルの開閉状態、テーマなど  

---

## 6. StorageService

```typescript
interface IStorageService {
  loadTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  loadRecords(): Record[];
  saveRecords(records: Record[]): void;
}

class LocalStorageService implements IStorageService {
  // getItem/setItem with JSON.parse/stringify
}
```

- ContextのReducerから呼び出す  
- 将来：同名のインターフェース実装をFirebaseService等で差し替え  

---

## 7. タイマー制御（TimerService）

- 管理要素  
  - `accumulated`（ミリ秒）  
  - `startAt: number`（ms）  
- 表示：`accumulated + (now – startAt)`  
- 実装  
  - record が `activeRecordId` を持つときのみ `setInterval` 起動（例：500ms）  
  - クロージャ問題対策：  
    - `useRef` で最新の `startAt`/`accumulated` を保持  
    - あるいは、`setInterval` 内で必ず最新stateを参照するカスタムフック  

- ボタン操作  
  - 開始／再開：`startAt = Date.now()`  
  - 一時停止：`accumulated += Date.now() - startAt` + clearInterval  
  - 完了／中断：pause相当 → レコードに保存 → clearInterval  

---

## 8. コンポーネント構造（例）

```
App
├─ UIProvider
│  ├─ TaskProvider
│  │   ├─ RecordProvider
│  │   │   └─ Router
│  │   │       ├─ TrackingPage
│  │   │       │    ├─ ActiveRecordCard
│  │   │       │    ├─ TaskGrid
│  │   │       │    │    ├─ TaskButton
│  │   │       │    │    └─ AddTaskButton
│  │   │       │    └─ TaskModal (ポップアップ)
│  │   │       ├─ HistoryPage
│  │   │       │    ├─ SearchSortBar
│  │   │       │    ├─ TotalTimeDisplay
│  │   │       │    ├─ RecordList
│  │   │       │    │    └─ RecordCard
│  │   │       │    └─ RecordModal
│  │   │       └─ SettingsPage
```

---

## 9. UI／スタイリング

- TailwindCSSベース  
- カラーパレット：グラデーション主体（例：`from-purple-400 via-pink-500 to-red-500`）  
- レスポンシブ：スマホ優先（mobile-first）  
- アニメーション：ボタン押下時のエフェクト、カードフェードイン  

---

## 10. 実装上の注意

1. **時間計算精度**  
   - 一時停止→再開を繰り返しても誤差が蓄積しないよう、常に `accumulated + (now - startAt)` で算出。
2. **setInterval のクリーンアップ**  
   - コンポーネント非表示や一時停止時には必ず `clearInterval`。  
3. **ロングタッチ vs クリック**  
   - タスクボタンの長押し判定には `touchstart` / `touchend` イベントで一定時間を超えたらモーダル表示。  
4. **データ永続化**  
   - Context の state 更新時に StorageService を非同期呼び出し。  
   - 過度な書き込みを防ぐため、バッチ or `debounce` も検討。  
5. **アクセシビリティ**  
   - ボタンは十分なタッチ領域、ARIA ラベル。  
6. **テスト**  
   - ユニット：Reducer ロジック、StorageService  
   - コンポーネント：クリック／タイマー操作の挙動  

---
