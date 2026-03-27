import YouTube, { YouTubeProps } from 'react-youtube';

export default function VideoModal({ videoId, onComplete }: { videoId: string, onComplete: () => void }) {
  const opts: YouTubeProps['opts'] = { height: '390', width: '640', playerVars: { autoplay: 1 } };
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative border-4 border-cyan-500 shadow-[0_0_20px_#0ff]">
        <YouTube videoId={videoId} opts={opts} onEnd={onComplete} />
        <button onClick={onComplete} className="absolute -top-12 right-0 bg-red-600 px-4 py-2 font-mono text-white">Skip</button>
      </div>
    </div>
  );
}