'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import SearchBar from './components/SearchBar';
import BackgroundVideo from './components/BackgroundVideo';
import TripCard from './components/TripCard';
import LocationDetails from './components/LocationDetails';
import Typewriter from './components/Typewriter';

// Define Trip interface
interface Trip {
    id: string;
    slug: string;
    title: string;
    location: string;
    description: string;
    price: string;
    duration: string;
    rating: number;
    attractions: string[];
    image_url: string;
    video_url?: string;
    tags?: string[];
    itinerary?: {
        header: string;
        days: Array<{
            day_label: string;
            title: string;
            subtitle: string;
            morning: string[];
            afternoon: string[];
            evening: string[];
        }>;
        footer: string;
        waypoints?: string[];
        intro?: string; // Legacy fallback
        morning?: string;
        afternoon?: string;
        evening?: string;
    };
}

interface SearchResponse {
    query?: string;
    trips: Trip[];
}

function HomeContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    const [data, setData] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [showRoute, setShowRoute] = useState(true); // Toggle for Route Map

    // Derived state for cleaner access
    const firstTrip = data?.trips?.[0];

    useEffect(() => {
        setSelectedSlug(null);
    }, [query]);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!query) {
                setData(null);
                setSelectedSlug(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_BASE}/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                });

                if (!res.ok) throw new Error(`Error: ${res.status}`);

                const jsonData = await res.json();
                setData(jsonData);

                // Auto-select the first trip if available to show single destination details immediately
                if (jsonData.trips && jsonData.trips.length > 0) {
                    setSelectedSlug(jsonData.trips[0].slug);
                } else {
                    setSelectedSlug(null);
                }

            } catch (err) {
                console.error("Failed to fetch trips:", err);
                setError("Failed to load trip ideas.");
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [query]);

    // Split View Layout (Reference Style)
    if (query) {
        return (
            <main className="flex h-screen overflow-hidden bg-white text-gray-900 font-sans">
                {/* Left Panel - Itinerary & Search (40%) */}
                <div className="w-[40%] flex flex-col border-r border-gray-200 shadow-xl z-20 bg-white order-1">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold shrink-0">
                            AI
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-gray-800 leading-snug">{query}</h1>
                            <p className="text-sm text-gray-500 mt-1">Customized Itinerary</p>
                        </div>
                    </div>

                    {/* Scrollable Itinerary Content */}
                    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        {loading && (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        )}

                        {!loading && firstTrip?.itinerary && (
                            <div className="prose prose-slate max-w-none">
                                <div className="text-gray-700 leading-relaxed mb-8 border-l-4 border-cyan-500 pl-4 py-1 bg-cyan-50 rounded-r">
                                    <Typewriter
                                        key={`header-${query}`}
                                        text={firstTrip.itinerary?.header || ''}
                                        speed={10}
                                        className="font-medium"
                                    />
                                </div>

                                <div className="space-y-12">
                                    {firstTrip.itinerary?.days?.map((day, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Day Header */}
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                    <span className="bg-black text-white text-xs px-2 py-1 rounded uppercase tracking-wider">{day.day_label}</span>
                                                    {day.title}
                                                </h2>
                                                <p className="text-sm text-gray-500 italic mt-1">{day.subtitle}</p>
                                            </div>

                                            <div className="pl-4 border-l-2 border-dashed border-gray-300 space-y-6">
                                                {/* Morning */}
                                                <div>
                                                    <h3 className="font-bold text-cyan-700 mb-2 flex items-center gap-2">
                                                        <span>🌅</span> Morning
                                                    </h3>
                                                    <ul className="list-disc list-outside ml-4 space-y-2 text-gray-600 text-sm">
                                                        {day.morning?.map((point, pIdx) => (
                                                            <li key={pIdx}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Afternoon */}
                                                <div>
                                                    <h3 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
                                                        <span>☀️</span> Afternoon
                                                    </h3>
                                                    <ul className="list-disc list-outside ml-4 space-y-2 text-gray-600 text-sm">
                                                        {day.afternoon?.map((point, pIdx) => (
                                                            <li key={pIdx}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Evening */}
                                                <div>
                                                    <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                                        <span>🌙</span> Evening
                                                    </h3>
                                                    <ul className="list-disc list-outside ml-4 space-y-2 text-gray-600 text-sm">
                                                        {day.evening?.map((point, pIdx) => (
                                                            <li key={pIdx}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 italic text-gray-500 text-sm">
                                    <Typewriter
                                        key={`footer-${query}`}
                                        text={firstTrip.itinerary?.footer || ''}
                                        speed={20}
                                    />
                                </div>
                            </div>
                        )}

                        {!loading && (!data?.trips || data.trips.length === 0) && (
                            <p className="text-gray-500">I couldn't find a direct match for that destination. Try searching for "Goa" or "Jaipur".</p>
                        )}

                        {error && <div className="text-red-500">{error}</div>}
                    </div>

                    {/* Footer - Search Bar */}
                    <div className="p-6 bg-white border-t border-gray-100">
                        <SearchBar />
                    </div>
                </div>

                {/* Right Panel - Single Destination Details (60%) */}
                <div className="w-[60%] bg-gray-50 h-full overflow-y-auto order-2 relative group">
                    <div className="relative z-10 h-full">
                        {selectedSlug ? (
                            <>
                                {/* Visuals Layer */}
                                <LocationDetails
                                    slug={selectedSlug}
                                // Removing onBack to lock the view to details as requested
                                />

                                {/* Route Map / Waypoints Overlay */}
                                {data?.trips[0]?.itinerary?.waypoints && (
                                    <div className="absolute top-8 right-8 z-30 flex flex-col items-end pointer-events-none">
                                        <button
                                            onClick={() => setShowRoute(!showRoute)}
                                            className="pointer-events-auto bg-white/90 backdrop-blur shadow-lg px-4 py-2 rounded-full text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 hover:bg-white transition-all transform hover:scale-105 active:scale-95"
                                        >
                                            <span>🗺️</span> {showRoute ? "Hide Route" : "Show Route Map"}
                                        </button>

                                        {showRoute && (
                                            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/50 w-72 animate-in slide-in-from-right-10 duration-500">
                                                <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                                    Suggested Route
                                                </h3>
                                                <div className="relative border-l-2 border-dashed border-gray-400 ml-2 space-y-6 pb-2">
                                                    {data.trips[0].itinerary.waypoints.map((point, idx) => (
                                                        <div key={idx} className="relative pl-6">
                                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-600 ring-2 ring-white"></div>
                                                            <p className="text-sm font-semibold text-gray-800">{point}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">Stop {idx + 1}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            // ... Loading/Empty state
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                                {loading ? (
                                    <div className="animate-pulse">Loading details...</div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <span className="text-6xl">🗺️</span>
                                        <p className="text-lg">Enter a destination to start planning.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // Default Landing Page (Keep as is, or align style?)
    // Keeping centered as requested previously, but maybe ensure visual consistency
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 relative overflow-hidden bg-gray-950">
            <BackgroundVideo />
            <div className="relative flex place-items-center flex-col text-center w-full z-10">
                <div className="mb-6 relative w-24 h-24">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
                    Weekend Traveller
                </h1>
                <p className="text-xl text-white font-medium mb-12 max-w-2xl leading-relaxed drop-shadow-md">
                    Discover your perfect weekend getaway.
                </p>
                <div className="w-full max-w-2xl">
                    <SearchBar />
                </div>
            </div>
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}
