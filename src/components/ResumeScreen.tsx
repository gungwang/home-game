export default function ResumeScreen() {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white p-8 font-mono overflow-y-auto">
      <h1 className="text-5xl text-cyan-500 mb-8 tracking-widest uppercase shadow-cyan-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">System Override Complete</h1>
      <h2 className="text-3xl text-pink-500 mb-4 tracking-wide">Accessing Personnel File...</h2>
      
      <div className="max-w-3xl w-full border border-cyan-800 p-8 bg-black/50 backdrop-blur">
        <div className="flex justify-between items-start border-b border-cyan-900 pb-4 mb-4">
          <div>
            <h3 className="text-4xl font-bold text-white mb-2">WANG</h3>
            <p className="text-cyan-400">Senior Cybernetic Developer</p>
          </div>
          <div className="text-right text-gray-400 text-sm">
            <p>ID: #8921-X</p>
            <p>STATUS: ACTIVE</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <h4 className="text-pink-400 text-xl border-b border-pink-900 mb-4 pb-2">Skills</h4>
            <ul className="space-y-2 text-gray-300">
              <li>{'>'} Full-Stack Web Development</li>
              <li>{'>'} React & TypeScript</li>
              <li>{'>'} Node.js / Python Architecture</li>
              <li>{'>'} Cyberpunk Game UI/UX</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-400 text-xl border-b border-pink-900 mb-4 pb-2">Experience</h4>
            <ul className="space-y-2 text-gray-300">
              <li>{'>'} 2026: Built Dragon vs New York</li>
              <li>{'>'} 2023-2025: Corporate System Architect</li>
              <li>{'>'} 100+ YouTube Music Videos Created</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}