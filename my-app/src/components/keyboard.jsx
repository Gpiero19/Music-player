import React, {useEffect} from "react";
import TestSound from "../sounds/bass-drum.mp3";
import Singing from "../sounds/singing-guy.mp3";
import Redoble from "../sounds/redoble.mp3";
import Farts from "../sounds/farts-value.mp3";
import Crash from "../sounds/crash-drum.mp3";

export default function Keyboard() {
    const keySound = [
        { name:"A", key: "A", sound: Singing },
        { name:"S", key: "S", sound: Redoble },
        { name:"D", key: "D", sound: Crash },
        { name:"F", key: "F", sound: TestSound },
        { name:"H", key: "H", sound: TestSound },
        { name:"J", key: "J", sound: TestSound },
        { name:"K", key: "K", sound: TestSound },
        { name:"L", key: "L", sound: Farts },
    ];

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.currentTime = 0
        audio.play();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toUpperCase();
            const sound = keySound.find((k) => k.key === key);
            console.log(sound, key);
            if (sound) {
                playSound(sound.sound);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="keyboard">
            {keySound.map((key) => (
                <button 
                className='keys' 
                key={key.name} 
                onClick={() => playSound(key.sound)}
                >
                    {key.name}
                </button>
            ))}
        </div>
    );
}