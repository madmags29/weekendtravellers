'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative z-10">
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-30 group-hover:opacity-50 blur transition duration-500"></div>

                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Where do you want to go this weekend? (e.g., 'Hiking in Himachal')"
                        className="w-full px-6 py-4 text-lg text-white placeholder-gray-400 bg-gray-900 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-gray-800 transition-all duration-300"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all duration-300 font-medium shadow-lg shadow-cyan-900/20"
                    >
                        Plan Trip
                    </button>
                </div>
            </div>
        </form>
    );
}
