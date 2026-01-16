'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SLIDES = [
    {
        id: 1,
        url: "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Taj Mahal, Agra",
        credit: "Martin Peboul",
        source: "Pexels"
    },
    {
        id: 2,
        url: "https://images.pexels.com/photos/3581369/pexels-photo-3581369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Hawa Mahal, Jaipur",
        credit: "Fardeen",
        source: "Pexels"
    },
    {
        id: 3,
        url: "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Kerala Backwaters",
        credit: "Nandhu Kumar",
        source: "Pexels"
    },
    {
        id: 4,
        url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Himalayas, Ladakh",
        credit: "Eberhard Grossgasteiger",
        source: "Pexels"
    },
    {
        id: 5,
        url: "https://images.pexels.com/photos/2522659/pexels-photo-2522659.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Ghats of Varanasi",
        credit: "Gül Işık",
        source: "Pexels"
    },
    {
        id: 6,
        url: "https://images.pexels.com/photos/4429390/pexels-photo-4429390.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Palolem Beach, Goa",
        credit: "Tejal",
        source: "Pexels"
    },
    {
        id: 7,
        url: "https://images.pexels.com/photos/574313/pexels-photo-574313.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Mumbai Cityscape",
        credit: "Aleksandr Neplokhov",
        source: "Pexels"
    },
    {
        id: 8,
        url: "https://images.pexels.com/photos/2413523/pexels-photo-2413523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Golden Temple, Amritsar",
        credit: "Naveen Jha",
        source: "Pexels"
    },
    {
        id: 9,
        url: "https://images.pexels.com/photos/3672387/pexels-photo-3672387.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Mysore Palace",
        credit: "Ashwath",
        source: "Pexels"
    },
    {
        id: 10,
        url: "https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        title: "Rishikesh",
        credit: "Rishabh Gupta",
        source: "Pexels"
    }
];

export default function ImageSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    return (
        <div className="fixed inset-0 w-full h-full z-0">

            {/* Slides */}
            <div className="relative w-full h-full">
                {SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        {/* Image */}
                        <img
                            src={slide.url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-black/40"></div>

                        {/* Text Content */}
                        <div className="absolute bottom-12 left-12 p-8 text-white max-w-xl z-20">
                            <div className="flex items-center gap-3 text-sm font-medium text-white/90 bg-black/20 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/10">
                                <span>📸 Photo by {slide.credit}</span>
                                <span className="w-1 h-1 rounded-full bg-white/60"></span>
                                <span>Source: {slide.source}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors p-2 hover:bg-black/20 rounded-full"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors p-2 hover:bg-black/20 rounded-full"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-12 right-12 z-20 flex gap-3">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8 h-2 rounded-full' : 'bg-white/40 w-2 h-2 rounded-full hover:bg-white/80'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
