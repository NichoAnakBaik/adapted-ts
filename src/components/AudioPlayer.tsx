import React from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className = "" }: AudioPlayerProps) {
  if (!src) return null;

  // Detect Google Drive link
  // e.g., https://drive.google.com/file/d/1abc123/view
  // or https://drive.google.com/open?id=1abc123
  
  let gdriveId = null;
  const matchD = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const matchId = src.match(/id=([a-zA-Z0-9_-]+)/);
  
  if (matchD && matchD[1]) {
    gdriveId = matchD[1];
  } else if (matchId && matchId[1]) {
    gdriveId = matchId[1];
  }

  if (gdriveId) {
    // Return an embedded Google Drive iframe
    const embedUrl = `https://drive.google.com/file/d/${gdriveId}/preview`;
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 h-24 ${className}`}>
        <iframe 
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay"
          title="Audio Player"
        />
      </div>
    );
  }

  // Fallback to standard HTML5 audio player
  return (
    <audio controls src={src} className={`w-full h-12 outline-none ${className}`} />
  );
}
