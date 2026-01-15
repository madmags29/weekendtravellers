'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const images = [
    '/images/bg_slide_1.png',
    '/images/bg_slide_2.png'
];

export default function BackgroundSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 -z-20 overflow-hidden">
            {images.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={src}
                        alt={`Background slide ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                    {/* Overlay for readability */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
                </div>
            ))}
        </div>
    );
}
