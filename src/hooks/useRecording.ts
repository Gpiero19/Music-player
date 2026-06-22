import { useState, useRef, useCallback } from "react";
import { RecordedKey } from "../types";

export function useRecording() {
    const [recording, setRecording] = useState(false);
    const [recordedKeys, setRecordedKeys] = useState<RecordedKey[]>([]);
    const keysRef = useRef<RecordedKey[]>([]);
    const startTimeRef = useRef<number | null>(null);

    const startRecording = useCallback(() => {
        keysRef.current = [];
        setRecordedKeys([]);
        setRecording(true);
        startTimeRef.current = Date.now();
    }, []);

    // Returns the captured keys so the caller can save them without a stale-closure race.
    const stopRecording = useCallback((): RecordedKey[] => {
        setRecording(false);
        return keysRef.current;
    }, []);

    const recordKey = useCallback((key: string, sound: string) => {
        const entry: RecordedKey = {
            key,
            sound,
            time: Date.now() - (startTimeRef.current ?? 0),
        };
        keysRef.current = [...keysRef.current, entry];
        setRecordedKeys(keysRef.current);
    }, []);

    return { recording, recordedKeys, startRecording, stopRecording, recordKey };
}
