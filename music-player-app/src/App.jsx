import React, { useState, useRef } from "react";
import './App.css'
import Keyboard from './components/keyboard'
import { IoMusicalNotes as MusicNote } from "react-icons/io5";

function App() {
  const [dance, setDance] = useState(false);
  const danceTimeout = useRef(null);

  // Metronome tick callback
  const handleMetronomeTick = () => {
    setDance(true);
    clearTimeout(danceTimeout.current);
    danceTimeout.current = setTimeout(() => setDance(false), 300); // match animation duration
  };

  return (
    <>
      <div className="container">
        <MusicNote className={`music-note${dance ? " dance-trigger" : ""} dancing`} />
        <Keyboard metronomeTick={handleMetronomeTick} />
      </div>
    </>
  )
}

export default App
