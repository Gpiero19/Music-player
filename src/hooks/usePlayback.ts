import { useState, useRef, useCallback } from "react";
import { RecordedKey } from "../types";

export function usePlayback(
    playSound: (key: string) => void,
    flashKey: (key: string) => void,
) {
    const [isPlaying, setIsPlaying] = useState(false);
    const abortRef = useRef(false);

    const stopPlayback = useCallback(() => {
        abortRef.current = true;
        setIsPlaying(false);
    }, []);

    const playRecording = useCallback(async (keys: RecordedKey[]) => {
        if (!Array.isArray(keys) || keys.length === 0) return;
        try {
            abortRef.current = false;
            setIsPlaying(true);
            for (let i = 0; i < keys.length; i++) {
                if (abortRef.current) break;
                const { key, time } = keys[i];
                const delay = i === 0 ? time : time - keys[i - 1].time;
                await new Promise<void>(res => setTimeout(res, delay));
                if (abortRef.current) break;
                playSound(key);
                flashKey(key);
            }
            setIsPlaying(false);
        } catch (error) {
            console.error("Error playing recording:", error);
            setIsPlaying(false);
        }
    }, [playSound, flashKey]);

    return { isPlaying, playRecording, stopPlayback };
}
