import { useState, useRef, useCallback } from "react";
import './App.css'
import Keyboard from './components/keyboard'
import { IoMusicalNotes as MusicNote } from "react-icons/io5";

function App() {
  const [dance, setDance] = useState(false);
  const danceTimeout = useRef<number | null>(null);

  const handleMetronomeTick = useCallback(() => {
    setDance(false);
    requestAnimationFrame(() => {
      setDance(true);
    });
    if (danceTimeout.current !== null) clearTimeout(danceTimeout.current);
    danceTimeout.current = setTimeout(() => setDance(false), 300);
  }, []);

  return (
    <div className="container">
      <MusicNote className={`music-note${dance ? " dance-trigger" : ""}`} />
      <Keyboard metronomeTick={handleMetronomeTick} />
    </div>
  )
}

export default App
