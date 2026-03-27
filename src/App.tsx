import { useEffect, useState } from 'react'
import GameCanvas from './components/GameCanvas'
import UIOverlay from './components/UIOverlay'
import VideoModal from './components/VideoModal'
import ResumeScreen from './components/ResumeScreen'
import BackgroundMusicPlayer from './components/BackgroundMusicPlayer'
import { GameEvents } from './game/GameEvents'

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    const handleShowVideo = (id: string) => setVideoId(id)
    const handleGameOver = () => setIsGameOver(true)
    
    GameEvents.on('show-video', handleShowVideo)
    GameEvents.on('game-over', handleGameOver)
    
    return () => {
      GameEvents.off('show-video', handleShowVideo)
      GameEvents.off('game-over', handleGameOver)
    }
  }, [])

  const handleVideoComplete = () => {
    setVideoId(null)
    GameEvents.emit('video-complete')
  }

  if (isGameOver) {
    return (
      <>
        <ResumeScreen />
        <BackgroundMusicPlayer />
      </>
    )
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <GameCanvas />
      <UIOverlay />
      <BackgroundMusicPlayer />
      {videoId && <VideoModal videoId={videoId} onComplete={handleVideoComplete} />}
    </div>
  )
}