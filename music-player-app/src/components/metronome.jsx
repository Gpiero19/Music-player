function metronome(onTick) {
    let tempo = 120;
    let intervalId = null;

    function start() {
        stop(); // Clear any existing interval

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
        tempo += 5;
        if (intervalId !== null) start(); // Restart interval with new tempo
    }

    function decreaseTempo() {
        tempo -= 5;
        if (intervalId !== null) start(); // Restart interval with new tempo
    }

    return {
        start,
        stop,
        getTempo: () => tempo,
        increaseTempo,
        decreaseTempo
    };
}

export default metronome;