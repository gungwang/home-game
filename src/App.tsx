import GameCanvas from './components/GameCanvas'
import UIOverlay from './components/UIOverlay'

export default function App() {
  return (
    <div className="w-full h-screen relative bg-black">
      <GameCanvas />
      <UIOverlay />
    </div>
  )
}