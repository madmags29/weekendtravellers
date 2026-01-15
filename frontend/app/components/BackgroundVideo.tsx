'use client';

import { useEffect, useState } from 'react';

interface VideoData {
    video_url: string | null;
    photographer_name?: string;
    photographer_url?: string;
}

export default function BackgroundVideo() {
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                // Fetch random timelapse
                const res = await fetch('/api/video/background?query=nature timelapse, city timelapse, clouds');
                if (res.ok) {
                    const data = await res.json();
                    if (data.video_url) {
                        setVideoData(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch background video:", error);
            }
        };

        fetchVideo();
    }, []);

    if (!videoData?.video_url) return null; // Component does nothing if no video

    return (
        <div className="fixed inset-0 -z-15 overflow-hidden bg-gray-900 transition-opacity duration-1000">
            {/* The Video */}
            <video
                src={videoData.video_url}
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Dark Overlay for text readability */}
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Credits (Optional) */}
            {loaded && videoData.photographer_name && (
                <div className="absolute bottom-4 right-4 z-10 text-[10px] text-white/50 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/5">
                    Video by <a href={videoData.photographer_url || '#'} target="_blank" className="hover:text-white underline">{videoData.photographer_name}</a> on Pexels
                </div>
            )}
        </div>
    );
}
