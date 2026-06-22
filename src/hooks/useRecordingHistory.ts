import { useState, useRef, useCallback } from "react";
import { HistoryEntry, RecordedKey } from "../types";

export function useRecordingHistory() {
    const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('recentHistory') || '[]') as HistoryEntry[];
        } catch {
            return [];
        }
    });

    // A ref avoids stale-closure issues when reading the counter inside addRecording.
    const counterRef = useRef(Number(localStorage.getItem('recordCounter') || 1));

    const addRecording = useCallback((keys: RecordedKey[]) => {
        if (keys.length === 0) return;
        const index = counterRef.current;
        counterRef.current += 1;
        localStorage.setItem('recordCounter', String(counterRef.current));
        setRecentHistory(prev => {
            const next: HistoryEntry[] = [
                { id: Date.now(), keys, index, name: `Recording #${index}` },
                ...prev,
            ].slice(0, 5);
            localStorage.setItem('recentHistory', JSON.stringify(next));
            return next;
        });
    }, []);

    const deleteRecording = useCallback((id: number) => {
        setRecentHistory(prev => {
            const next = prev.filter(r => r.id !== id);
            localStorage.setItem('recentHistory', JSON.stringify(next));
            return next;
        });
    }, []);

    const renameRecording = useCallback((id: number, name: string) => {
        setRecentHistory(prev => {
            const next = prev.map(r => r.id === id ? { ...r, name } : r);
            localStorage.setItem('recentHistory', JSON.stringify(next));
            return next;
        });
    }, []);

    return { recentHistory, addRecording, deleteRecording, renameRecording };
}
