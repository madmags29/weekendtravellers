'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface FeatureCardProps {
    title: string;
    description: string;
    imageQuery: string;
}

interface BackgroundData {
    image_url: string | null;
    photographer_name: string | null;
    photographer_username: string | null;
}

export default function FeatureCard({ title, description, imageQuery }: FeatureCardProps) {
    const [bgData, setBgData] = useState<BackgroundData | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                // Fetch specific image for this card
                const res = await fetch(`/api/background?query=${encodeURIComponent(imageQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setBgData(data);
                }
            } catch (error) {
                console.error("Failed to fetch feature card image:", error);
            }
        };

        fetchImage();
    }, [imageQuery]);

    return (
        <div className="relative p-6 rounded-xl border border-gray-800 overflow-hidden group h-64 flex flex-col justify-end transition-all duration-300 hover:border-gray-600">
            {/* Background Image */}
            {bgData && bgData.image_url && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={bgData.image_url}
                        alt={`Background for ${title}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-gray-900/30"></div>
                </div>
            )}

            {/* Fallback Background if no image */}
            {(!bgData || !bgData.image_url) && (
                <div className="absolute inset-0 z-0 bg-gray-900"></div>
            )}

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md group-hover:text-cyan-400 transition-colors">{title}</h3>
                <p className="text-gray-200 text-sm font-medium drop-shadow-sm line-clamp-2 md:line-clamp-none group-hover:text-white transition-colors">{description}</p>
            </div>

            {/* Minimal Credit */}
            {bgData && bgData.photographer_name && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded">
                    Img: {bgData.photographer_name}
                </div>
            )}
        </div>
    );
}
