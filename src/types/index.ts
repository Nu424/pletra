export type Task = {
  id: string;                // UUID
  name: string;              // タスク名
  icon: string;              // 絵文字
  createdAt: number;         // 作成日時（epoch）
};

export type Record = {
  id: string;                // UUID
  taskId: string;
  startAt: number;           // 直前の開始時刻
  accumulated: number;       // 一時停止時の累計(ms)
  endAt?: number;            // 完了時刻／中断時は undefined
  note?: string;             // メモ
};

export type TimerState = {
  currentTime: number; // タイマーの累計時間。表示用
  fixedTime: number; // すでに確定した時間量。時間は、一時停止により確定される。
  isRunning: boolean;  // タイマーが動作中かどうか
  startTime: number; // タイマーの開始時刻(開始or再開時刻)
}