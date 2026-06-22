import { useState, useRef, useMemo } from "react";
import metronome from "../components/metronome";
import MetronomeTick from "../assets/metronome-tick.mp3";

export function useMetronome(onTick: () => void) {
    // Ref so the metronome closure always calls the latest onTick without recreating the instance.
    const onTickRef = useRef(onTick);
    onTickRef.current = onTick;

    const tickAudio = useMemo(() => new Audio(MetronomeTick), []);

    const metroRef = useRef(metronome(() => {
        tickAudio.currentTime = 0;
        tickAudio.play();
        onTickRef.current();
    }));
    const metro = metroRef.current;

    const [tempo, setTempo] = useState(metro.getTempo());
    const [isRunning, setIsRunning] = useState(false);

    const start = () => { metro.start(); setIsRunning(true); };
    const stop = () => { metro.stop(); setIsRunning(false); };
    const increaseTempo = () => { metro.increaseTempo(); setTempo(metro.getTempo()); };
    const decreaseTempo = () => { metro.decreaseTempo(); setTempo(metro.getTempo()); };

    return {
        tempo,
        isRunning,
        start,
        stop,
        increaseTempo,
        decreaseTempo,
        isAtMin: metro.isAtMin(),
        isAtMax: metro.isAtMax(),
    };
}
