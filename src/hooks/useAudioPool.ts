import { useMemo, useCallback } from "react";
import { KeySound } from "../types";

const POOL_SIZE = 3;

interface AudioPool {
    elements: HTMLAudioElement[];
    idx: number;
}

export function useAudioPool(keySounds: KeySound[]) {
    const poolMap = useMemo<Record<string, AudioPool>>(
        () => keySounds.reduce((acc, k) => {
            acc[k.key] = {
                elements: Array.from({ length: POOL_SIZE }, () => new Audio(k.sound)),
                idx: 0,
            };
            return acc;
        }, {} as Record<string, AudioPool>),
        [keySounds]
    );

    const playSound = useCallback((key: string) => {
        const pool = poolMap[key];
        if (!pool) return;
        const audio = pool.elements[pool.idx % POOL_SIZE];
        pool.idx++;
        audio.currentTime = 0;
        audio.play();
    }, [poolMap]);

    return { playSound };
}
