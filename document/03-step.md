# 実装ステップ

1. ストレージ抽象化レイヤー  
   2.1. IStorageService インターフェース定義  
   2.2. LocalStorageService 実装  
     - loadTasks／saveTasks／loadRecords／saveRecords  
     - JSONパース例外ハンドリング  
   2.3. StorageServiceProvider の用意  
     - React Context でアプリ全体から注入できるように  

2. グローバル状態管理（Context + useReducer）  
   3.1. TaskContext  
     - state: Task[]  
     - actions: addTask, updateTask, deleteTask  
     - reducer 実装＋StorageService 呼び出し（side‐effect は useEffect or middleware パターン）  
   3.2. RecordContext  
     - state: Record[], activeRecordId?  
     - actions: startRecord, pauseRecord, resumeRecord, completeRecord, cancelRecord, updateRecord, deleteRecord  
     - reducer 実装＋StorageService 連携  
   3.3. UIContext（モーダル開閉・テーマ管理など）  
     - state: { taskModal: { open, mode, taskId? }, recordModal: …, theme: “light”|“dark” }  

3. タイマー管理ユーティリティ（TimerService / useTimer フック）  
   4.1. 必要データ構造の整理（startAt, accumulated, intervalId, refs）  
   4.2. useTimer フック実装  
     - start／pause／resume／clear のメソッド提供  
     - setInterval のクリーンアップ＋最新 state を参照できる仕組み  
   4.3. RecordContext と連携して、開始～一時停止～完了のワークフローを確立  

4. ルーティング＆ページ骨子  
   5.1. React Router 設定  
     - /tracking → TrackingPage  
     - /history  → HistoryPage  
     - /settings → SettingsPage  
   5.2. 共通レイアウト（Header/Nav/Footer など）  

5. TrackingPage 実装  
   6.1. ActiveRecordCard コンポーネント  
     - 現在の経過時間表示  
     - [一時停止] → [再開][完了][中断] 切替制御  
   6.2. TaskGrid／TaskButton／AddTaskButton  
     - アイコン＋タスク名表示  
     - クリックで startRecord、長押しでモーダル開くロジック  
   6.3. TaskModal（追加・編集・削除）  
     - name, icon 入力＋バリデーション  
     - 保存（add/update）、削除（delete）  

6. HistoryPage 実装  
   7.1. SearchSortBar コンポーネント  
     - テキスト検索／ソートドロップダウン  
   7.2. TotalTimeDisplay  
     - 表示中レコードの合計時間計算  
   7.3. RecordList・RecordCard  
     - startAt/endAt/note 表示  
     - タップで RecordModal 起動  
   7.4. RecordModal（編集・メモ追加・削除）  

7. SettingsPage 実装（足がかり）  
   8.1. テーマ切替 UI と UIContext 連携  
   8.2. エクスポート（JSONダンプ）のボタン・ダイアログ  

8. スタイリング＆UX強化  
   9.1. TailwindCSS でグラデーション・モバイルファースト対応  
   9.2. アニメーション（カードフェードイン、ボタン押下エフェクト）  
   9.3. タッチ領域・ARIA 属性によるアクセシビリティ担保  

9.  ドキュメント・仕上げ  
   11.1. README 更新（環境構築／起動方法／テスト手順／アーキテクチャ概要）  
   11.2. コードコメント・TODO 管理  
   11.3. リリース・バージョニング  
