const MIN_TEMPO = 40;
const MAX_TEMPO = 240;

function metronome(onTick) {
    let tempo = 120;
    let intervalId = null;

    function start() {
        stop();
        intervalId = setInterval(() => {
            if (onTick) onTick();
        }, 60000 / tempo);
    }

    function stop() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function increaseTempo() {
        if (tempo >= MAX_TEMPO) return;
        tempo = Math.min(tempo + 5, MAX_TEMPO);
        if (intervalId !== null) start();
    }

    function decreaseTempo() {
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