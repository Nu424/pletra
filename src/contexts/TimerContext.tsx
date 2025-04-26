import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { TimerState } from "../types";
import { useStorageService } from "./StorageContext";

interface TimerContextType extends TimerState {
    start: (initialAccumulated: number) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    getCurrentTime: () => number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

type TimerAction =
    | { type: 'START'; payload: number }
    | { type: 'PAUSE' }
    | { type: 'RESUME' }
    | { type: 'RESET' }
    | { type: 'UPDATE_CURRENT_TIME'; payload: number }
    | { type: 'UPDATE_FIXED_TIME'; payload: number };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
    switch (action.type) {
        case 'START':
            return { ...state, isRunning: true, currentTime: 0, fixedTime: action.payload };
        case 'PAUSE':
            return { ...state, isRunning: false };
        case 'RESUME':
            return { ...state, isRunning: true };
        case 'RESET':
            return { ...state, currentTime: 0, fixedTime: 0, isRunning: false };
        case 'UPDATE_CURRENT_TIME':
            return { ...state, currentTime: action.payload, isRunning: true };
        case 'UPDATE_FIXED_TIME':
            return { ...state, fixedTime: action.payload };
    }
}

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
    const storageService = useStorageService();

    const [state, dispatch] = useReducer(timerReducer, {}, () => {
        return storageService.loadTimer();
    });
    // refを使って最新の状態を常に参照できるようにする
    const timerStateRef = useRef(state);
    const intervalIdRef = useRef<number | null>(null);

    // stateRefを最新に保つ
    // ---タイマー状態の保存
    useEffect(() => {
        timerStateRef.current = state;
        storageService.saveTimer(state);
    }, [state]);

    // ----------
    // ---タイマーの各種操作
    // ----------
    // ---タイマーのクリーンアップおよび再読み込みされた際の更新
    useEffect(() => {
        // 再読み込みされた際の更新
        if (state.isRunning) {
            resumeAtReload();
        }

        return () => {
            if (intervalIdRef.current !== null) {
                window.clearInterval(intervalIdRef.current);
            }
        };
    }, []);
    // ---タイマーの更新
    const updateCurrentTime = useCallback(() => {
        // setIntervalで定期的に呼ばれるコールバック。
        // この中で参照するstateは、useRefを使用しているため、
        // 常に最新の状態を参照できる(stale-state問題を回避できる)
        if (!timerStateRef.current.isRunning) return;
        const now = Date.now();
        const elapsed = (now - timerStateRef.current.startTime) + timerStateRef.current.fixedTime;
        dispatch({ type: 'UPDATE_CURRENT_TIME', payload: elapsed });
    }, []);

    // ---タイマーの開始
    const start = useCallback((initialAccumulated: number = 0) => {
        // ---タイマーのクリーンアップ
        if (intervalIdRef.current !== null) {
            window.clearInterval(intervalIdRef.current);
        }
        timerStateRef.current.startTime = Date.now();
        dispatch({ type: 'START', payload: initialAccumulated });
        intervalIdRef.current = window.setInterval(updateCurrentTime, 100);
    }, [updateCurrentTime]);

    // ---タイマーの一時停止
    const pause = useCallback(() => {
        if (intervalIdRef.current !== null) {
            window.clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        // ---totalTimeを更新する
        const now = Date.now();
        const thisMeasuredTime = (now - timerStateRef.current.startTime);
        const newCurrentTime = timerStateRef.current.fixedTime + thisMeasuredTime;
        dispatch({ type: 'UPDATE_CURRENT_TIME', payload: newCurrentTime });
        dispatch({ type: 'UPDATE_FIXED_TIME', payload: newCurrentTime });
        dispatch({ type: 'PAUSE' });
    }, []);


    // ---タイマーの再開
    const resume = useCallback(() => {
        if (timerStateRef.current.isRunning) return;
        timerStateRef.current.startTime = Date.now();
        dispatch({ type: 'RESUME' });
        intervalIdRef.current = window.setInterval(updateCurrentTime, 100);
    }, [updateCurrentTime]);

    const resumeAtReload = useCallback(() => {
        if (!timerStateRef.current.isRunning) return; // 再読込時にはisRunning=trueになっているはず
        dispatch({ type: 'RESUME' });
        intervalIdRef.current = window.setInterval(updateCurrentTime, 100);
    }, [updateCurrentTime]);

    // ---タイマーのリセット
    const reset = useCallback(() => {
        if (intervalIdRef.current !== null) {
            window.clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        dispatch({ type: 'RESET' });
    }, []);

    // ---タイマーの現在の経過時間を取得
    const getCurrentTime = useCallback(() => {
        if (!timerStateRef.current.isRunning) {
            return timerStateRef.current.currentTime;
        }
        // ---実行中の場合はリアルタイムで計算
        const now = Date.now();
        const elapsed = (now - timerStateRef.current.startTime) + timerStateRef.current.fixedTime;
        return elapsed;
    }, []);

    const value: TimerContextType = {
        ...state,
        start: (initialAccumulated: number = 0) => start(initialAccumulated),
        pause: () => pause(),
        resume: () => resume(),
        reset: () => reset(),
        getCurrentTime: () => getCurrentTime(),
    };

    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimerContext = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }
    return context;
};
