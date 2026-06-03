import React, {useEffect, useRef, useMemo, useCallback} from "react";
import Drum from "../assets/bass-drum.mp3";
import Crash from "../assets/crash-drum.mp3";
import Drum2 from "../assets/drums-1-converted.mp3";
import Clap from "../assets/clap1.mp3";
import Drum3 from "../assets/drum2.mp3";
import SnareDrum from "../assets/snare-drum.mp3";
import DrumKick from "../assets/acoustic-drum-kick.mp3";
import DrumStick from "../assets/drum-stick.mp3";
import MetronomeTick from "../assets/metronome-tick.mp3";
import metronome from "./metronome";
import './keyboard.css'

export default function Keyboard({ metronomeTick }) {
    const btnRefs = useRef({});
    const [recording, setRecording] = React.useState(false);
    const [recordedKeys, setRecordedKeys] = React.useState([]);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const recordStartTime = useRef(null);
    const playbackAbortRef = useRef(false);
    const [recentHistory, setRecentHistory] = React.useState([]);
    const [recordCounter, setRecordCounter] = React.useState(
        () => Number(localStorage.getItem('recordCounter') || 1));
    const loadRecording = (record) => {
        setRecordedKeys(record.keys);
    }

    const keySound = useMemo(
        () => {
            return [
                { name: "A", key: "A", sound: SnareDrum },
                { name: "S", key: "S", sound: DrumKick },
                { name: "D", key: "D", sound: Crash },
                { name: "F", key: "F", sound: Drum },
                { name: "H", key: "H", sound: Drum2 },
                { name: "J", key: "J", sound: Clap },
                { name: "K", key: "K", sound: Drum3 },
                { name: "L", key: "L", sound: DrumStick },
            ];
        }, []);

    const soundMap = useMemo(() =>
        keySound.reduce((acc, k) => {
            acc[k.key] = new Audio(k.sound);
            return acc;
        }, {}),
    [keySound]);

    const metronomeAudio = useMemo(() => new Audio(MetronomeTick), []);

    const playMetronomeTick = useCallback(() => {
        metronomeAudio.currentTime = 0;
        metronomeAudio.play();
        if (metronomeTick) metronomeTick();
    }, [metronomeTick, metronomeAudio]);

    const metroRef = useRef(null);

    if (metroRef.current === null) {
    metroRef.current = metronome(playMetronomeTick);
    }
    const metro = metroRef.current;

    const [tempo, setTempo] = React.useState(metro.getTempo());

    const playSound = useCallback((key) => {
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

    const flashKey = useCallback((k) => {
        const el = btnRefs.current[k] || document.getElementById(`key-${k}`);
        if (!el) return;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 150);
    }, []);

    const handlePlayKey = useCallback((key) => {
        playSound(key.key);
        flashKey(key.key);
        if (recording) {
            const now = Date.now();
            setRecordedKeys(prev => [
                ...prev,
                { key: key.key, sound: key.sound, time: now - recordStartTime.current }
            ]);
        }
    }, [playSound, flashKey, recording]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toUpperCase();
            const soundObj = keySound.find((x) => x.key === key);
            if (!soundObj) return;
            handlePlayKey(soundObj);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
        }, [keySound, recording, handlePlayKey]);

    const startRecording = () => {
        setRecordedKeys([]);
        setRecording(true);
        recordStartTime.current = Date.now();
    };

    const stopRecording = () => {
        setRecording(false);

        if (recordedKeys.length > 0) {
            setRecentHistory(prev => [
                {id: Date.now(), keys: recordedKeys, index: recordCounter}, 
                ...prev].slice(0, 5));
                
            setRecordCounter(prev => {
                const next = prev + 1;
                localStorage.setItem("recordCounter", next);
                return next;
                });
        }
    };

    const stopPlayback = useCallback(() => {
        playbackAbortRef.current = true;
        setIsPlaying(false);
    }, []);

    const playRecording = async (keys = recordedKeys) => {
        if (!Array.isArray(keys) || keys.length === 0) return;
        try {
            playbackAbortRef.current = false;
            setIsPlaying(true);
            for (let i = 0; i < keys.length; i++) {
                if (playbackAbortRef.current) break;
                const { key, time } = keys[i];
                const delay = i === 0 ? time : time - keys[i - 1].time;
                await new Promise(res => setTimeout(res, delay));
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
        <>
        <div className="keyboard-column">

            <div className="metronome-controls">
                <p>Current Tempo: {tempo}</p>
                <button onClick={metro.start}>Start Metronome</button>
                <button onClick={metro.stop}>Stop Metronome</button>
                <button onClick={handleIncreaseTempo}>Increase Tempo</button>
                <button onClick={handleDecreaseTempo}>Decrease Tempo</button>
            </div>

            <div className="keyboard">
                {keySound.map((key) => (
                    <button 
                    id={`key-${key.key}`}
                    className='keys' 
                    key={key.name} 
                    ref={(el) => (btnRefs.current[key.key] = el)}
                    onMouseDown={() => handlePlayKey(key)}
                    disabled={isPlaying}
                    >
                        {key.name}
                    </button>
                ))}
            </div>

            <div style={{marginTop: 16}}>
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
                {recentHistory.length > 0 &&(
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
                                        <button onClick={stopPlayback}>
                                            Stop
                                        </button>
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
        </>
    );
}