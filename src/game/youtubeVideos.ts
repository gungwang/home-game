export const YOUTUBE_VIDEOS = [
  "I1K81NmdWdg","0baRwl81obE",
  "4KVzpXJ8W7g","VhyHLa04q88",
  "ouR6fJBcsFA","VsY3CbjbyJ8",
  "Slb1VCpnR6s","Jiuf5FsLwC4",
  "0ES5cvWlDE0","VhyHLa04q88",
  "ITeLVbZ0v80","aXruu0UdaA0",
  "1EAzpV0nWsc","OQyAvR18NYM",
  "fOWvB6wzDqM","EieBn-bkDyQ",
  "BdJx29nA-dw","fPETUiOYkfM",
  "mEKK83L0qqw","FfsNvbUk420",
];

function shuffleVideos(videos: readonly string[]): string[] {
  const shuffled = [...videos];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function createYouTubeVideoPicker(videos: readonly string[] = YOUTUBE_VIDEOS) {
  const uniqueVideos = Array.from(new Set(videos));
  let remainingVideos: string[] = [];
  let lastVideo: string | null = null;

  return () => {
    if (uniqueVideos.length === 0) {
      throw new Error('No YouTube videos configured');
    }

    if (remainingVideos.length === 0) {
      remainingVideos = shuffleVideos(uniqueVideos);

       // Avoid repeating the same MV at the boundary between two full cycles.
      if (lastVideo && remainingVideos.length > 1 && remainingVideos[remainingVideos.length - 1] === lastVideo) {
        const nextCycleVideo = remainingVideos.pop()!;
        remainingVideos.unshift(nextCycleVideo);
      }
    }

    const nextVideo = remainingVideos.pop()!;
    lastVideo = nextVideo;
    return nextVideo;
  };
}
