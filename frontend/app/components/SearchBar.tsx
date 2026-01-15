'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();

    const fetchSuggestions = async (val: string) => {
        if (val.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`http://localhost:8000/api/destinations/suggest?q=${encodeURIComponent(val)}`);
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
        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-7xl mx-auto relative z-10" autoComplete="off">
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 group-hover:opacity-40 blur-md transition duration-500"></div>

                <div className="relative flex items-center">
                    <input
                        type="text"
                        name="search"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        placeholder="Type a city (e.g., Goa, Manali)..."
                        className="w-full px-8 py-6 text-2xl text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 shadow-2xl transition-all duration-300"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full transition-all duration-300 font-bold text-lg shadow-lg shadow-cyan-900/20"
                    >
                        Search
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute left-4 right-4 top-full mt-4 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xl z-50">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="px-8 py-4 hover:bg-gray-50 cursor-pointer text-gray-700 hover:text-cyan-600 transition-colors border-b border-gray-50 last:border-none text-lg flex items-center gap-3"
                            >
                                <span className="text-gray-400">📍</span> {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4 font-medium tracking-wide opacity-80">
                Powered by AI to plan trips tailored just for you.
            </p>
        </form>
    );
}
