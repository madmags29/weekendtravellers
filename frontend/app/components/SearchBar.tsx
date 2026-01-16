'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();

    const fetchSuggestions = async (val: string) => {
        if (val.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_BASE}/api/destinations/suggest?q=${encodeURIComponent(val)}`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        fetchSuggestions(val);
        setShowSuggestions(true);
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setQuery(suggestion);
        setSuggestions([]);
        setShowSuggestions(false);
        router.push(`/?q=${encodeURIComponent(suggestion)}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full relative z-50" autoComplete="off">
            <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="pl-6 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    name="search"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Ask anything..." // Changed placeholder to match image
                    className="w-full px-4 py-4 text-lg text-gray-900 placeholder-gray-400 bg-transparent border-none rounded-full focus:ring-0 focus:outline-none"
                />
                <button
                    type="submit"
                    className="mr-2 p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>

            {/* Suggestions Dropdown (Bottom Up) */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bottom-full mb-4 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xl">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="px-6 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-cyan-600 transition-colors border-b border-gray-50 last:border-none flex items-center gap-3"
                        >
                            <span className="text-gray-400">📍</span> {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
}
