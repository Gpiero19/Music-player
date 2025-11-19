// create a function with metronome, which can change the tempo speed using 2 buttons

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
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function increaseTempo() {
        tempo += 5;
        if (intervalId) start(); // Restart interval with new tempo
    }

    function decreaseTempo() {
        tempo -= 5;
        if (intervalId) start(); // Restart interval with new tempo
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