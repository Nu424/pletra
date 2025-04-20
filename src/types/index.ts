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