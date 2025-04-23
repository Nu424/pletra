/**
 * ミリ秒を「HH:MM:SS」形式の文字列に変換
 * @param ms ミリ秒
 * @returns フォーマットされた時間文字列
 */
export function formatTime(ms: number): string {
  if (!ms) return '00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }
  return `${padZero(minutes)}:${padZero(seconds)}`;
}

/**
 * ミリ秒を「1h 30m」のような形式に変換
 * @param ms ミリ秒
 * @returns 人間が読みやすい形式の経過時間
 */
export function formatDuration(ms: number): string {
  if (!ms) return '0m';

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor(ms / 1000) % 60;

  const hoursStr = hours > 0 ? `${hours}h` : '';
  const minutesStr = minutes > 0 ? `${minutes}m` : '';
  const secondsStr = seconds > 0 ? `${seconds}s` : '';

  return `${hoursStr}${minutesStr}${secondsStr}`;
}

/**
 * Unix timestamp を日付時刻形式にフォーマット
 * @param timestamp Unix timestamp (ミリ秒)
 * @returns フォーマットされた日付時刻
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 数値を2桁にパディング（例: 9 → "09"）
 */
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
} 