import './App.css'
import Keyboard from './components/keyboard'
import { IoMusicalNotes as MusicNote } from "react-icons/io5";

function App() {

  return (
    <>
      <div className="container">
        <MusicNote className='music-note' />
        <Keyboard />
      </div>
    </>
  )
}

export default App
