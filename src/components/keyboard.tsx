import { useEffect, useRef, useCallback } from "react";
import Drum from "../assets/bass-drum.mp3";
import Crash from "../assets/crash-drum.mp3";
import Drum2 from "../assets/drums-1-converted.mp3";
import Clap from "../assets/clap1.mp3";
import Drum3 from "../assets/drum2.mp3";
import SnareDrum from "../assets/snare-drum.mp3";
import DrumKick from "../assets/acoustic-drum-kick.mp3";
import DrumStick from "../assets/drum-stick.mp3";
import { useAudioPool } from "../hooks/useAudioPool";
import { useRecording } from "../hooks/useRecording";
import { useRecordingHistory } from "../hooks/useRecordingHistory";
import { usePlayback } from "../hooks/usePlayback";
import { useMetronome } from "../hooks/useMetronome";
import { KeySound } from "../types";
import './keyboard.css'

const KEY_SOUNDS: KeySound[] = [
    { name: "A", key: "A", sound: SnareDrum,  label: "Snare Drum" },
    { name: "S", key: "S", sound: DrumKick,   label: "Kick Drum" },
    { name: "D", key: "D", sound: Crash,       label: "Crash Cymbal" },
    { name: "F", key: "F", sound: Drum,        label: "Bass Drum" },
    { name: "H", key: "H", sound: Drum2,       label: "Tom" },
    { name: "J", key: "J", sound: Clap,        label: "Clap" },
    { name: "K", key: "K", sound: Drum3,       label: "Hi-hat" },
    { name: "L", key: "L", sound: DrumStick,   label: "Drum Stick" },
];

interface KeyboardProps {
    metronomeTick: () => void;
}

export default function Keyboard({ metronomeTick }: KeyboardProps) {
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const flashKey = useCallback((k: string) => {
        const el = btnRefs.current[k] ?? document.getElementById(`key-${k}`);
        if (!el) return;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 150);
    }, []);

    const { playSound } = useAudioPool(KEY_SOUNDS);
    const { recording, startRecording, stopRecording, recordKey } = useRecording();
    const { recentHistory, addRecording, deleteRecording, renameRecording } = useRecordingHistory();
    const { isPlaying, playRecording, stopPlayback } = usePlayback(playSound, flashKey);
    const { tempo, isRunning, start, stop, increaseTempo, decreaseTempo, isAtMin, isAtMax } = useMetronome(metronomeTick);

    const handlePlayKey = useCallback((key: KeySound) => {
        playSound(key.key);
        flashKey(key.key);
        if (recording) recordKey(key.key, key.sound);
    }, [playSound, flashKey, recording, recordKey]);

    const handleStopRecording = useCallback(() => {
        addRecording(stopRecording());
    }, [stopRecording, addRecording]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const soundObj = KEY_SOUNDS.find(x => x.key === event.key.toUpperCase());
            if (!soundObj) return;
            handlePlayKey(soundObj);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handlePlayKey]);

    return (
        <div className="keyboard-column">
            <div className="metronome-controls">
                <p>
                    {isRunning && <span className="metronome-active-dot" aria-hidden="true" />}
                    Current Tempo: {tempo} BPM
                </p>
                <button onClick={isRunning ? stop : start}>
                    {isRunning ? "Stop Metronome" : "Start Metronome"}
                </button>
                <button onClick={increaseTempo} disabled={isAtMax}>Increase Tempo</button>
                <button onClick={decreaseTempo} disabled={isAtMin}>Decrease Tempo</button>
            </div>

            <div className="keyboard">
                {KEY_SOUNDS.map((key) => (
                    <button
                        id={`key-${key.key}`}
                        className="keys"
                        key={key.name}
                        ref={(el) => { btnRefs.current[key.key] = el; }}
                        onMouseDown={() => handlePlayKey(key)}
                        onTouchStart={(e) => { e.preventDefault(); handlePlayKey(key); }}
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
                    <button onClick={handleStopRecording}>
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
                                <th>Name</th>
                                <th>Play</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentHistory.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <input
                                            className="recording-name-input"
                                            value={record.name}
                                            onChange={(e) => renameRecording(record.id, e.target.value)}
                                            aria-label="Recording name"
                                        />
                                    </td>
                                    <td>
                                        {isPlaying ? (
                                            <button onClick={stopPlayback}>Stop</button>
                                        ) : (
                                            <button onClick={() => playRecording(record.keys)}>
                                                Play
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => deleteRecording(record.id)}
                                            aria-label={`Delete ${record.name}`}
                                        >
                                            ✕
                                        </button>
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
