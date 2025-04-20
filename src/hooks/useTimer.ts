import { useState, useRef, useEffect, useCallback } from 'react';

interface TimerState {
  elapsedTime: number; // ミリ秒単位の経過時間
  isRunning: boolean;  // タイマーが動作中かどうか
}

interface UseTimerResult extends TimerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getElapsedTime: () => number;
}

/**
 * タイマー管理用のカスタムフック
 * @param initialAccumulated 初期累積時間（ミリ秒）
 * @returns タイマー操作と状態
 */
export function useTimer(initialAccumulated: number = 0): UseTimerResult {
  // 状態管理
  const [state, setState] = useState<TimerState>({
    elapsedTime: initialAccumulated,
    isRunning: false,
  });

  // refを使って最新の状態を常に参照できるようにする
  const stateRef = useRef(state);
  const intervalIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // stateRefを最新に保つ
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  // 経過時間の計算と更新（setIntervalで定期的に呼ばれる）
  const updateElapsedTime = useCallback(() => {
    if (!stateRef.current.isRunning) return;
    
    const now = Date.now();
    const elapsed = now - startTimeRef.current + stateRef.current.elapsedTime;
    
    setState({
      elapsedTime: elapsed,
      isRunning: true,
    });
  }, []);

  // タイマー開始（初期化して開始）
  const start = useCallback(() => {
    // 既存のタイマーがあればクリア
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
    }
    
    startTimeRef.current = Date.now();
    setState({
      elapsedTime: 0, // 開始時はゼロから
      isRunning: true,
    });
    
    intervalIdRef.current = window.setInterval(updateElapsedTime, 100);
  }, [updateElapsedTime]);

  // タイマー一時停止
  const pause = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  // タイマー再開
  const resume = useCallback(() => {
    if (stateRef.current.isRunning) return; // 既に実行中なら何もしない
    
    startTimeRef.current = Date.now();
    setState((prev) => ({
      ...prev,
      isRunning: true,
    }));
    
    intervalIdRef.current = window.setInterval(updateElapsedTime, 100);
  }, [updateElapsedTime]);

  // タイマーリセット
  const reset = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    setState({
      elapsedTime: 0,
      isRunning: false,
    });
  }, []);

  // 現在の経過時間を取得
  const getElapsedTime = useCallback(() => {
    if (!stateRef.current.isRunning) {
      return stateRef.current.elapsedTime;
    }
    
    // 実行中の場合はリアルタイムで計算
    const now = Date.now();
    return now - startTimeRef.current + stateRef.current.elapsedTime;
  }, []);

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    getElapsedTime,
  };
} 