'use client';

import { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
}

export default function Typewriter({ text, speed = 30, className = '', onComplete }: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reset on text change
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {displayedText.length < text.length && (
                <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-cyan-500 animate-pulse"></span>
            )}
        </span>
    );
}
