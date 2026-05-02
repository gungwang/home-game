import { useCallback, useEffect, useState } from 'react';

/**
 * Small button (top-right) that toggles the browser Fullscreen API.
 * Hides itself if fullscreen is not supported.
 */
export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof document.documentElement.requestFullscreen === 'function' ||
      typeof (document.documentElement as any).webkitRequestFullscreen === 'function'
    );

    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded bg-transparent border border-cyan-400/50 text-cyan-400 text-lg sm:text-xl hover:bg-cyan-400/20 active:bg-cyan-400/30 transition-colors cursor-pointer"
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? '⊠' : '⛶'}
    </button>
  );
}
