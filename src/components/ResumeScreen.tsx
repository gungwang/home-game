interface HighScore {
  score: number;
  date: string;
}

interface ResumeScreenProps {
  score: number;
  onRestart: () => void;
  highScores: HighScore[];
}

export default function ResumeScreen({ score, onRestart, highScores }: ResumeScreenProps) {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white p-8 font-mono overflow-y-auto">
      <h1 className="text-5xl text-cyan-500 mb-2 tracking-widest uppercase shadow-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] text-center">System Override Complete</h1>
      <div className="text-3xl text-yellow-400 mb-8 font-bold animate-pulse">FINAL SCORE: {score}</div>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Personnel File Section */}
        <div className="border border-cyan-800 p-8 bg-black/50 backdrop-blur h-full flex flex-col">
          <div className="flex justify-between items-start border-b border-cyan-900 pb-4 mb-4">
            <div>
              <h3 className="text-4xl font-bold text-white mb-2">GUNG WANG</h3>
              <p className="text-cyan-400">AI Software Engineer</p>
            </div>
            <div className="text-right text-gray-400 text-sm">
              <p>ID: #8921-X</p>
              <p>STATUS: ACTIVE</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h4 className="text-pink-400 text-xl border-b border-pink-900 mb-4 pb-2">Skills</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>{'>'} Full-Stack Web Development</li>
                <li>{'>'} React & TypeScript</li>
                <li>{'>'} Node.js / Python Architecture</li>
                <li>{'>'} Cyberpunk Game UI/UX</li>
              </ul>
            </div>
            <div>
              <h4 className="text-pink-400 text-xl border-b border-pink-900 mb-4 pb-2">Experience</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>{'>'} 2026: Built Dragon vs New York</li>
                <li>{'>'} 2023-2025: Corporate System Architect</li>
                <li>{'>'} 100+ YouTube Music Videos Created</li>
              </ul>
            </div>
          </div>

          <div className="mt-auto pt-8 text-center">
            <a 
              href="https://bio.gungwang.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline decoration-cyan-900 underline-offset-4"
            >
              bio.gungwang.com
            </a>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="border border-yellow-800 p-8 bg-black/50 backdrop-blur h-full flex flex-col">
          <h3 className="text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-900 pb-2 uppercase tracking-tighter">
            TOP 10 LOCAL RECORDS
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[300px] lg:max-h-none">
            {highScores.length > 0 ? (
              highScores.map((hs, index) => (
                <div key={index} className="flex justify-between items-center text-lg border-b border-white/5 pb-1">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 w-6">#{index + 1}</span>
                    <span className={index === 0 ? "text-yellow-400 font-bold" : "text-gray-300"}>
                      {hs.score.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-gray-600 text-xs">{hs.date}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-8">No records found. Be the first!</p>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="px-8 py-4 border-2 border-pink-500 text-pink-500 text-2xl font-bold hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.5)] active:scale-95 uppercase tracking-widest"
      >
        Play Again
      </button>
    </div>
  )
}