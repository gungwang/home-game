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
    <div className="absolute inset-0 bg-black flex items-center justify-center text-white font-mono">
      <div className="w-[95vw] h-[95vh] flex flex-col">
        <h1 className="text-lg sm:text-3xl md:text-5xl text-cyan-500 mb-1 sm:mb-2 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] text-center shrink-0">System Override Complete</h1>
        <div className="text-base sm:text-2xl md:text-3xl text-yellow-400 mb-3 sm:mb-6 font-bold animate-pulse text-center shrink-0">FINAL SCORE: {score}</div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 min-h-0 mb-3 sm:mb-6">
          {/* Personnel File Section — 3/4 width */}
          <div className="lg:col-span-3 border border-cyan-800 p-3 sm:p-6 md:p-8 bg-black/50 backdrop-blur flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start border-b border-cyan-900 pb-2 sm:pb-4 mb-3 sm:mb-6">
              <div>
                <h3 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">GUNG WANG</h3>
                <p className="text-cyan-400 text-sm sm:text-lg md:text-2xl">AI Software Engineer</p>
              </div>
              <div className="text-right text-gray-400 text-xs sm:text-sm md:text-base">
                <p>ID: #8921-X</p>
                <p>STATUS: ACTIVE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10 mt-2 sm:mt-4">
              <div>
                <h4 className="text-pink-400 text-sm sm:text-lg md:text-2xl font-bold border-b border-pink-900 mb-2 sm:mb-5 pb-1 sm:pb-2 drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]">Technical Skills</h4>
                <ul className="space-y-1 sm:space-y-3 text-gray-100 text-xs sm:text-base md:text-xl">
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> Full-Stack Web Development</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> AI-Powered Web Applications</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> AI Agents — OpenClaw · Gemini CLI · Copilot CLI</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> React · Next.js · TypeScript</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> Node.js · Python · System Architecture</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> Drupal — Senior Software Engineer</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> AWS · Azure · Google Cloud / AI Search</li>
                </ul>
              </div>
              <div>
                <h4 className="text-pink-400 text-sm sm:text-lg md:text-2xl font-bold border-b border-pink-900 mb-2 sm:mb-5 pb-1 sm:pb-2 drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]">Professional Experience</h4>
                <ul className="space-y-1 sm:space-y-3 text-gray-100 text-xs sm:text-base md:text-xl">
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> <span className="text-cyan-300">UL New AI Project</span> ...</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> <a href="https://www.dfs.ny.gov" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline decoration-cyan-800">NY Dept. of Financial Services</a></li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> Enterprise System Architect (2023–2025)</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> 100+ YouTube Music Videos Produced</li>
                  <li><span className="text-cyan-500 mr-2">{'>'}</span> 2026: Built <em className="text-yellow-400 not-italic">Dragon vs New York</em></li>
                </ul>
              </div>
            </div>

            <div className="mt-auto pt-4 sm:pt-8 text-center flex justify-center gap-4 sm:gap-8">
              <a
                href="https://bio.gungwang.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline decoration-cyan-900 underline-offset-4 text-base sm:text-2xl md:text-4xl"
              >
                bio.gungwang.com
              </a>
              <a
                href="/README.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 transition-colors duration-300 underline decoration-pink-900 underline-offset-4 text-base sm:text-2xl md:text-4xl"
              >
                Game README
              </a>
            </div>
          </div>

          {/* Leaderboard Section — 1/4 width */}
          <div className="lg:col-span-1 border border-yellow-800 p-3 sm:p-6 bg-black/50 backdrop-blur flex flex-col overflow-y-auto">
            <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-yellow-500 mb-2 sm:mb-4 border-b border-yellow-900 pb-1 sm:pb-2 uppercase tracking-tighter shrink-0">
              TOP 10 LOCAL RECORDS
            </h3>
            <div className="space-y-1 sm:space-y-3 overflow-y-auto">
              {highScores.length > 0 ? (
                highScores.map((hs, index) => (
                  <div key={index} className="flex justify-between items-center text-xs sm:text-base md:text-lg border-b border-white/5 pb-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-gray-500 w-5 sm:w-6">#{index + 1}</span>
                      <span className={index === 0 ? "text-yellow-400 font-bold" : "text-gray-300"}>
                        {hs.score.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-gray-600 text-xs">{hs.date}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4 sm:py-8 text-xs sm:text-base">No records found. Be the first!</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="mx-auto px-4 sm:px-8 py-2 sm:py-4 border-2 border-pink-500 text-pink-500 text-sm sm:text-xl md:text-2xl font-bold hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.5)] active:scale-95 uppercase tracking-widest shrink-0"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}