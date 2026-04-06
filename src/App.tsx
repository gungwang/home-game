import { useEffect, useState } from 'react'
import GameCanvas from './components/GameCanvas'
import UIOverlay from './components/UIOverlay'
import MobileControls from './components/MobileControls'
import FullscreenButton from './components/FullscreenButton'
import VideoModal from './components/VideoModal'
import ResumeScreen from './components/ResumeScreen'
import BackgroundMusicPlayer from './components/BackgroundMusicPlayer'
import { GameEvents } from './game/GameEvents'

interface HighScore {
  score: number;
  date: string;
}

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState<HighScore[]>([])

  useEffect(() => {
    // Load high scores from localStorage
    const savedScores = localStorage.getItem('dragon-game-high-scores')
    if (savedScores) {
      setHighScores(JSON.parse(savedScores))
    }

    const handleShowVideo = (id: string) => {
      // Delay showing the video for 3 seconds to allow BGM to fade out
      setTimeout(() => {
        setVideoId(id)
      }, 3000)
    }

    const handleGameOver = () => {
      setIsGameOver(true)
      // Save score when game ends
      setHighScores(prevScores => {
        const newScore: HighScore = {
          score: score,
          date: new Date().toLocaleDateString()
        }
        const updatedScores = [...prevScores, newScore]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        localStorage.setItem('dragon-game-high-scores', JSON.stringify(updatedScores))
        return updatedScores
      })
    }

    const handleScoreChanged = (newScore: number) => setScore(newScore)

    GameEvents.on('show-video', handleShowVideo)
    GameEvents.on('game-over', handleGameOver)
    GameEvents.on('score-changed', handleScoreChanged)

    return () => {
      GameEvents.off('show-video', handleShowVideo)
      GameEvents.off('game-over', handleGameOver)
      GameEvents.off('score-changed', handleScoreChanged)
    }
  }, [score]) // Re-bind effect when score changes to capture latest score in handleGameOver closure

  const handleVideoComplete = (watchedDuration: number) => {
    setVideoId(null)
    // Small delay to ensure modal is gone before BGM starts fading in
    setTimeout(() => {
      GameEvents.emit('video-complete', watchedDuration)
    }, 100)
  }

  const handleRestart = () => {
    setIsGameOver(false)
    setScore(0)
    // Small delay to ensure the DOM is updated before telling Phaser to restart
    setTimeout(() => {
      GameEvents.emit('restart-game')
    }, 10)
  }

  return (
    <div className="w-full h-screen relative bg-[#09111d] overflow-hidden">
      {isGameOver ? (
        <ResumeScreen score={score} onRestart={handleRestart} highScores={highScores} />
      ) : (
        <>
          <GameCanvas />
          <UIOverlay />
          <MobileControls />
          <FullscreenButton />
          {videoId && <VideoModal videoId={videoId} onComplete={handleVideoComplete} />}
        </>
      )}
      <BackgroundMusicPlayer />
    </div>
  )
}