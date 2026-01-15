'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface BackgroundData {
    image_url: string;
    photographer_name: string | null;
    photographer_username: string | null;
    unsplash_url: string | null;
}

export default function BackgroundSlider() {
    const [currentBg, setCurrentBg] = useState<BackgroundData>({
        image_url: '/images/bg_slide_1.png',
        photographer_name: null,
        photographer_username: null,
        unsplash_url: null
    });
    const [nextBg, setNextBg] = useState<BackgroundData | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const fetchNewBackground = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/background'); // Use full URL for client-side fetch or proxy
            // Note: In Next.js dev, relative calls like '/api/background' are proxied by next.config.ts rewrites.
            // Using '/api/background' is safer for both dev and prod if prod sets it up.
            // Let's use relative for consistency with previous changes.
            const resRelative = await fetch('/api/background');

            if (resRelative.ok) {
                const data = await resRelative.json();
                if (data.image_url) {
                    setNextBg(data);
                    setIsTransitioning(true);

                    // After transition (e.g. 1s), update current and reset
                    setTimeout(() => {
                        setCurrentBg(data);
                        setNextBg(null);
                        setIsTransitioning(false);
                    }, 1000);
                }
            }
        } catch (error) {
            console.error("Failed to fetch background:", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNewBackground();

        // Interval
        const interval = setInterval(fetchNewBackground, 60000); // Every 1 minute

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 -z-20 overflow-hidden bg-gray-900">
            {/* Current Image */}
            <div className="absolute inset-0">
                <Image
                    src={currentBg.image_url}
                    alt="Background"
                    fill
                    className="object-cover transition-opacity duration-1000"
                    priority
                />
            </div>

            {/* Next Image (fading in) */}
            {nextBg && (
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
                    <Image
                        src={nextBg.image_url}
                        alt="Next Background"
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-950/30"></div>

            {/* Credits */}
            {currentBg.photographer_name && (
                <div className="absolute bottom-4 right-4 z-10 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    Photo by{' '}
                    <a
                        href={`https://unsplash.com/@${currentBg.photographer_username}?utm_source=weekend_traveller&utm_medium=referral`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 underline underline-offset-2 transition-colors"
                    >
                        {currentBg.photographer_name}
                    </a>
                    {' '}on{' '}
                    <a
                        href="https://unsplash.com/?utm_source=weekend_traveller&utm_medium=referral"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 underline underline-offset-2 transition-colors"
                    >
                        Unsplash
                    </a>
                </div>
            )}
        </div>
    );
}
