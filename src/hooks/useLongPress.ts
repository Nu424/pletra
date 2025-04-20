import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onClick?: () => void;  // 通常クリック時のコールバック
  onLongPress: () => void;  // 長押し時のコールバック
  threshold?: number;  // 長押しと判断する時間（ミリ秒）
}

/**
 * 長押し検出用のカスタムフック
 * モバイルとデスクトップ両方で動作
 */
export function useLongPress({
  onClick,
  onLongPress,
  threshold = 500, // デフォルトは500ms
}: UseLongPressOptions) {
  // タイマーのID保持用ref
  const timerRef = useRef<number | null>(null);
  // 長押し中かどうかの状態
  const isLongPressRef = useRef(false);
  
  // クリーンアップ関数
  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isLongPressRef.current = false;
  }, []);
  
  // マウスダウン/タッチスタート時のハンドラー
  const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // 右クリックの場合は処理しない
    if (event.type === 'mousedown' && (event as React.MouseEvent).button !== 0) {
      return;
    }
    
    // タイマー設定
    clear();
    isLongPressRef.current = false;
    timerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold, clear]);
  
  // マウスアップ/タッチエンド時のハンドラー
  const end = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // 長押しでなければクリックイベント発火
    if (!isLongPressRef.current && onClick && event.cancelable) {
      onClick();
    }
    
    clear();
  }, [onClick, clear]);
  
  // マウス/タッチキャンセル時のハンドラー
  const cancel = useCallback(() => {
    clear();
  }, [clear]);
  
  // 返却するプロパティ集合
  return {
    // タッチデバイス用
    onTouchStart: start,
    onTouchEnd: end,
    onTouchCancel: cancel,
    
    // マウス用
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
  };
} 