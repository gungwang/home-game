import YouTube, { YouTubeProps } from 'react-youtube';

export default function VideoModal({ videoId, onComplete }: { videoId: string, onComplete: () => void }) {
  const opts: YouTubeProps['opts'] = { 
    height: '100%', 
    width: '100%', 
    playerVars: { 
      autoplay: 1,
      origin: window.location.origin 
    } 
  };
  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-8">
      <div className="flex flex-col w-[85vw] h-[85vh] max-w-7xl">
        <div className="flex justify-between items-end mb-4 gap-4">
          <h3 className="text-cyan-400 font-mono text-lg md:text-xl tracking-tight leading-tight">
            SYSTEM NOTICE: You received scores based on how long you watched the Video.
          </h3>
          <button 
            onClick={onComplete} 
            className="bg-red-600 hover:bg-red-700 px-6 py-2 font-mono text-white font-bold uppercase tracking-widest transition-colors shadow-[4px_4px_0_rgba(255,255,255,0.3)] active:translate-y-1 active:shadow-none"
          >
            Skip
          </button>
        </div>
        <div className="relative flex-grow border-4 border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.3)] bg-black">
          <YouTube 
            videoId={videoId} 
            opts={opts} 
            onEnd={onComplete} 
            className="w-full h-full" 
            iframeClassName="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}