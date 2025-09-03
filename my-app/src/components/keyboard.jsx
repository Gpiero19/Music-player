import React, {useEffect, useRef, useMemo} from "react";
import Drum from "../sounds/bass-drum.mp3";
import Farts from "../sounds/farts-value.mp3";
import Crash from "../sounds/crash-drum.mp3";
import Drum2 from "../sounds/drums-1-converted.mp3";
import Clap from "../sounds/clap1.mp3";
import Drum3 from "../sounds/drum2.mp3";
import SnareDrum from "../sounds/snare-drum.mp3";
import DrumKick from "../sounds/acoustic-drum-kick.mp3";
import DrumStick from "../sounds/drum-stick.mp3";
import './keyboard.css'

export default function Keyboard() {
    const btnRefs = useRef({});
    const [recording, setRecording] = React.useState(false);
    const [recordedKeys, setRecordedKeys] = React.useState([]);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const recordStartTime = useRef(null);

    const keySound = useMemo(
        () => [
        { name:"A", key: "A", sound: SnareDrum },
        { name:"S", key: "S", sound: DrumKick },
        { name:"D", key: "D", sound: Crash },
        { name:"F", key: "F", sound: Drum },
        { name:"H", key: "H", sound: Drum2 },
        { name:"J", key: "J", sound: Clap },
        { name:"K", key: "K", sound: Drum3 },
        { name:"L", key: "L", sound: DrumStick },
    ], []);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.currentTime = 0
        audio.play();
    };

    const flashKey = (k) => {
        const el = btnRefs.current[k] || document.getElementById(`key-${k}`); // fallback if ref not set
        if (!el) return;
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 150);
    };

    const handlePlayKey = (key) => {
    playSound(key.sound);
    flashKey(key.key);
    if (recording) {
        const now = Date.now();
        setRecordedKeys(prev => [
            ...prev,
            { key: key.key, sound: key.sound, time: now - recordStartTime.current }
        ]);
    }
    };

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
    }, [keySound, recording]);

    const startRecording = () => {
        setRecordedKeys([]);
        setRecording(true);
        recordStartTime.current = Date.now();
    };

    const stopRecording = () => {
        setRecording(false);
    };

    const playRecording = async () => {
        if (recordedKeys.length === 0) return;
        setIsPlaying(true);
        for (let i = 0; i < recordedKeys.length; i++) {
            const { key, sound, time } = recordedKeys[i];
            const delay = i === 0 ? time : time - recordedKeys[i - 1].time;
            await new Promise(res => setTimeout(res, delay));
            playSound(sound);
            flashKey(key);
        }
        setIsPlaying(false);
    };

    return (
        <div>
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
                <button onClick={playRecording} disabled={recordedKeys.length === 0 || recording || isPlaying}>
                    Play Recording
                </button>
            </div>
        </div>
        );
        }


// Add a way to record what was played and play it back - so you can create a beat for your own