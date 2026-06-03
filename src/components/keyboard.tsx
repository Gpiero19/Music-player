import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import Drum from "../assets/bass-drum.mp3";
import Crash from "../assets/crash-drum.mp3";
import Drum2 from "../assets/drums-1-converted.mp3";
import Clap from "../assets/clap1.mp3";
import Drum3 from "../assets/drum2.mp3";
import SnareDrum from "../assets/snare-drum.mp3";
import DrumKick from "../assets/acoustic-drum-kick.mp3";
import DrumStick from "../assets/drum-stick.mp3";
import MetronomeTick from "../assets/metronome-tick.mp3";
import metronome, { MetronomeInstance } from "./metronome";
import './keyboard.css'

interface KeySound {
    name: string;
    key: string;
    sound: string;
    label: string;
}

interface RecordedKey {
    key: string;
    sound: string;
    time: number;
}

interface HistoryEntry {
    id: number;
    keys: RecordedKey[];
    index: number;
}

interface KeyboardProps {
    metronomeTick: () => void;
}

export default function Keyboard({ metronomeTick }: KeyboardProps) {
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [recording, setRecording] = useState(false);
    const [recordedKeys, setRecordedKeys] = useState<RecordedKey[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const recordStartTime = useRef<number | null>(null);
    const playbackAbortRef = useRef(false);
    const [recentHistory, setRecentHistory] = useState<HistoryEntry[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('recentHistory') || '[]') as HistoryEntry[];
        } catch {
            return [];
        }
    });
    const [recordCounter, setRecordCounter] = useState(
        () => Number(localStorage.getItem('recordCounter') || 1));

    const loadRecording = (record: HistoryEntry) => {
        setRecordedKeys(record.keys);
    };

    const keySound = useMemo<KeySound[]>(() => [
        { name: "A", key: "A", sound: SnareDrum,  label: "Snare Drum" },
        { name: "S", key: "S", sound: DrumKick,   label: "Kick Drum" },
        { name: "D", key: "D", sound: Crash,       label: "Crash Cymbal" },
        { name: "F", key: "F", sound: Drum,        label: "Bass Drum" },
        { name: "H", key: "H", sound: Drum2,       label: "Tom" },
        { name: "J", key: "J", sound: Clap,        label: "Clap" },
        { name: "K", key: "K", sound: Drum3,       label: "Hi-hat" },
        { name: "L", key: "L", sound: DrumStick,   label: "Drum Stick" },
    ], []);

    const soundMap = useMemo<Record<string, HTMLAudioElement>>(() =>
        keySound.reduce((acc, k) => {
            acc[k.key] = new Audio(k.sound);
            return acc;
        }, {} as Record<string, HTMLAudioElement>),
    [keySound]);

    const metronomeAudio = useMemo(() => new Audio(MetronomeTick), []);

    const playMetronomeTick = useCallback(() => {
        metronomeAudio.currentTime = 0;
        metronomeAudio.play();
        metronomeTick();
    }, [metronomeTick, metronomeAudio]);

    const metroRef = useRef<MetronomeInstance | null>(null);
    if (metroRef.current === null) {
        metroRef.current = metronome(playMetronomeTick);
    }
    const metro = metroRef.current;

    const [tempo, setTempo] = useState(metro.getTempo());
    const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);

    const handleStartMetronome = () => { metro.start(); setIsMetronomeRunning(true); };
    const handleStopMetronome = () => { metro.stop(); setIsMetronomeRunning(false); };

    const playSound = useCallback((key: string) => {
        const audio = soundMap[key];
        if (!audio) return;
        audio.currentTime = 0;
        audio.play();
    }, [soundMap]);

    const handleIncreaseTempo = () => {
        metro.increaseTempo();
        setTempo(metro.getTempo());
    };

    const handleDecreaseTempo = () => {
        metro.decreaseTempo();
        setTempo(metro.getTempo());
    };

    const flashKey = useCallback((k: string) => {
        const el = btnRefs.current[k] ?? document.getElementById(`key-${k}`);
        if (!el) return;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 150);
    }, []);

    const handlePlayKey = useCallback((key: KeySound) => {
        playSound(key.key);
        flashKey(key.key);
        if (recording) {
            const now = Date.now();
            setRecordedKeys(prev => [
                ...prev,
                { key: key.key, sound: key.sound, time: now - (recordStartTime.current ?? 0) },
            ]);
        }
    }, [playSound, flashKey, recording]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toUpperCase();
            const soundObj = keySound.find((x) => x.key === key);
            if (!soundObj) return;
            handlePlayKey(soundObj);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [keySound, handlePlayKey]);

    const startRecording = () => {
        setRecordedKeys([]);
        setRecording(true);
        recordStartTime.current = Date.now();
    };

    const stopRecording = () => {
        setRecording(false);
        if (recordedKeys.length > 0) {
            const next: HistoryEntry[] = [
                { id: Date.now(), keys: recordedKeys, index: recordCounter },
                ...recentHistory,
            ].slice(0, 5);
            setRecentHistory(next);
            localStorage.setItem('recentHistory', JSON.stringify(next));
            setRecordCounter(prev => {
                const nextCounter = prev + 1;
                localStorage.setItem("recordCounter", String(nextCounter));
                return nextCounter;
            });
        }
    };

    const stopPlayback = useCallback(() => {
        playbackAbortRef.current = true;
        setIsPlaying(false);
    }, []);

    const playRecording = async (keys: RecordedKey[] = recordedKeys) => {
        if (!Array.isArray(keys) || keys.length === 0) return;
        try {
            playbackAbortRef.current = false;
            setIsPlaying(true);
            for (let i = 0; i < keys.length; i++) {
                if (playbackAbortRef.current) break;
                const { key, time } = keys[i];
                const delay = i === 0 ? time : time - keys[i - 1].time;
                await new Promise<void>(res => setTimeout(res, delay));
                if (playbackAbortRef.current) break;
                playSound(key);
                flashKey(key);
            }
            setIsPlaying(false);
        } catch (error) {
            console.error("Error playing recording:", error);
            setIsPlaying(false);
        }
    };

    return (
        <div className="keyboard-column">
            <div className="metronome-controls">
                <p>
                    {isMetronomeRunning && <span className="metronome-active-dot" aria-hidden="true" />}
                    Current Tempo: {tempo} BPM
                </p>
                <button onClick={isMetronomeRunning ? handleStopMetronome : handleStartMetronome}>
                    {isMetronomeRunning ? "Stop Metronome" : "Start Metronome"}
                </button>
                <button onClick={handleIncreaseTempo} disabled={metro.isAtMax()}>Increase Tempo</button>
                <button onClick={handleDecreaseTempo} disabled={metro.isAtMin()}>Decrease Tempo</button>
            </div>

            <div className="keyboard">
                {keySound.map((key) => (
                    <button
                        id={`key-${key.key}`}
                        className="keys"
                        key={key.name}
                        ref={(el) => { btnRefs.current[key.key] = el; }}
                        onMouseDown={() => handlePlayKey(key)}
                        disabled={isPlaying}
                        aria-label={`${key.label} (${key.key})`}
                    >
                        {key.name}
                    </button>
                ))}
            </div>

            <div style={{ marginTop: 16 }}>
                {!recording ? (
                    <button onClick={startRecording} disabled={isPlaying}>
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording}>
                        Stop Recording
                    </button>
                )}
            </div>

            <div className="recent-history">
                <h3>Recent Recordings</h3>
                {recentHistory.length === 0 && <p>No recent recordings.</p>}
                {recentHistory.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Record #</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentHistory.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.index}</td>
                                    <td>
                                        {isPlaying ? (
                                            <button onClick={stopPlayback}>Stop</button>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    loadRecording(record);
                                                    await playRecording(record.keys);
                                                }}
                                            >
                                                Play
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
