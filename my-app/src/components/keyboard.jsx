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

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toUpperCase();
            const sound = keySound.find((x) => x.key === key);
            console.log(sound, key);
            if (!sound) return
            playSound(sound.sound);
            flashKey(key);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [keySound]);

    return (
        <div className="keyboard">
            {keySound.map((key) => (
                <button 
                id={`key-${key.key}`}
                className='keys' 
                key={key.name} 
                ref={(el) => (btnRefs.current[key.key] = el)}
                onMouseDown={() => {
                    playSound(key.sound);
                    flashKey(key.key);
                }}
                >
                    {key.name}
                </button>
            ))}
        </div>
    );
}


// Add a way to record what was played and play it back - so you can create a beat for your own