const MIN_TEMPO = 40;
const MAX_TEMPO = 240;

export interface MetronomeInstance {
    start: () => void;
    stop: () => void;
    getTempo: () => number;
    isAtMin: () => boolean;
    isAtMax: () => boolean;
    increaseTempo: () => void;
    decreaseTempo: () => void;
}

function metronome(onTick: () => void): MetronomeInstance {
    let tempo = 120;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function start(): void {
        stop();
        intervalId = setInterval(() => {
            onTick();
        }, 60000 / tempo);
    }

    function stop(): void {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function increaseTempo(): void {
        if (tempo >= MAX_TEMPO) return;
        tempo = Math.min(tempo + 5, MAX_TEMPO);
        if (intervalId !== null) start();
    }

    function decreaseTempo(): void {
        if (tempo <= MIN_TEMPO) return;
        tempo = Math.max(tempo - 5, MIN_TEMPO);
        if (intervalId !== null) start();
    }

    return {
        start,
        stop,
        getTempo: () => tempo,
        isAtMin: () => tempo <= MIN_TEMPO,
        isAtMax: () => tempo >= MAX_TEMPO,
        increaseTempo,
        decreaseTempo,
    };
}

export default metronome;
