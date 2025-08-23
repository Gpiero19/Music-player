import React from "react";
// import { useWithSound } from "./useWithSound";

export default function Keyboard() {

    const handleKeyClick = (key) => {
        console.log("Key pressed:", key);
        // const { playSound } = useWithSound();
        // playSound(key);
    };

    const keys = [
        { label: "A", onClick: () => handleKeyClick("A") },
        { label: "S", onClick: () => handleKeyClick("S") },
        { label: "D", onClick: () => handleKeyClick("D") },
        { label: "F", onClick: () => handleKeyClick("F") },
        { label: "H", onClick: () => handleKeyClick("H") },
        { label: "J", onClick: () => handleKeyClick("J") },
        { label: "K", onClick: () => handleKeyClick("K") },
        { label: "L", onClick: () => handleKeyClick("L") },
    ];

    return (
        <div className="keyboard">
            {keys.map((key) => (
                <button className='keys' key={key.label} onClick={key.onClick}>
                    {key.label}
                </button>
            ))}
        </div>
    );
}