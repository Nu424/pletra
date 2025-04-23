import { useState, useRef, useEffect, useCallback } from 'react';

interface TimerState {
  currentTime: number; // タイマーの累計時間
  fixedTime: number; // すでに確定した時間量。時間は、一時停止により確定される。
  isRunning: boolean;  // タイマーが動作中かどうか
}

interface UseTimerResult extends TimerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getCurrentTime: () => number;
}

/**
 * タイマー管理用のカスタムフック
 * @param initialAccumulated 初期累積時間（ミリ秒）
 * @returns タイマー操作と状態
 */
export function useTimer(initialAccumulated: number = 0): UseTimerResult {
  // 状態管理
  const [state, setState] = useState<TimerState>({
    currentTime: initialAccumulated,
    fixedTime: 0,
    isRunning: false,
  });

  // refを使って最新の状態を常に参照できるようにする
  const stateRef = useRef(state);
  const intervalIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0); // 開始or再開を押した時刻

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
    // setIntervalで定期的に呼ばれるコールバック。
    // この中で参照するstateは、useRefを使用しているため、
    // 常に最新の状態を参照できる(stale-state問題を回避できる)
    if (!stateRef.current.isRunning) return;

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) + stateRef.current.fixedTime; // 確定した時間量+(今回の計測時間)

    setState({
      ...stateRef.current,
      currentTime: elapsed,
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
      currentTime: 0, // 開始時はゼロから
      fixedTime: 0,
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
    // totalTimeを更新する
    const now = Date.now();
    const thisMeasuredTime = (now - startTimeRef.current);
    setState((prev) => ({
      ...prev,
      currentTime: stateRef.current.fixedTime + thisMeasuredTime,
      fixedTime: stateRef.current.fixedTime + thisMeasuredTime, // 確定した時間量を加算していく
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
      currentTime: 0,
      fixedTime: 0,
      isRunning: false,
    });
  }, []);

  // 現在の経過時間を取得
  const getCurrentTime = useCallback(() => {
    if (!stateRef.current.isRunning) {
      return stateRef.current.currentTime;
    }

    // 実行中の場合はリアルタイムで計算
    const now = Date.now();
    return (now - startTimeRef.current) + stateRef.current.currentTime;
  }, []);

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    getCurrentTime,
  };
} 