import { useEffect, useState } from 'react'
import GameCanvas from './components/GameCanvas'
import UIOverlay from './components/UIOverlay'
import VideoModal from './components/VideoModal'
import { GameEvents } from './game/GameEvents'

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    const handleShowVideo = (id: string) => setVideoId(id)
    GameEvents.on('show-video', handleShowVideo)
    return () => {
      GameEvents.off('show-video', handleShowVideo)
    }
  }, [])

  const handleVideoComplete = () => {
    setVideoId(null)
    GameEvents.emit('video-complete')
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <GameCanvas />
      <UIOverlay />
      {videoId && <VideoModal videoId={videoId} onComplete={handleVideoComplete} />}
    </div>
  )
}