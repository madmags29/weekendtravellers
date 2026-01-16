'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import SearchBar from './components/SearchBar';
import TripCard from './components/TripCard';
import LocationDetails from './components/LocationDetails';
import Typewriter from './components/Typewriter';
import ImageSlider from './components/ImageSlider';

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
    best_time?: string; // AI Generated
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
    const [showRoute, setShowRoute] = useState(false); // Toggle for Route Map

    // Derived state for cleaner access - Use Selected Trip, fallback to first
    const displayedTrip = data?.trips?.find(t => t.slug === selectedSlug) || data?.trips?.[0];
    const firstTrip = displayedTrip; // Alias for backward compat with rest of file if needed, or better, replace usages.

    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [destLocation, setDestLocation] = useState<{ lat: number; lon: number } | null>(null);

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => console.log("Geolocation error:", error)
            );
        }
    }, []);

    // Get Destination Location (Simple Nominatim Fetch)
    useEffect(() => {
        if (firstTrip?.location) {
            const fetchCoords = async () => {
                try {
                    // Extract city name (e.g. "Goa, India" -> "Goa")
                    const city = firstTrip.location.split(',')[0];
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}, India`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setDestLocation({
                            lat: parseFloat(data[0].lat),
                            lon: parseFloat(data[0].lon)
                        });
                    }
                } catch (e) {
                    console.error("Failed to geocode destination", e);
                }
            };
            fetchCoords();
        }
    }, [firstTrip?.location]);

    // Haversine Distance Formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

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

    // Puter AI Itinerary Generation
    const [aiGenerating, setAiGenerating] = useState(false);

    useEffect(() => {
        if (!firstTrip || loading || aiGenerating) return;

        const enhanceItinerary = async () => {
            setAiGenerating(true);
            try {
                // Use the displayed trip's location
                const targetLocation = firstTrip?.location || firstTrip?.title || query;

                // Call Backend API
                const res = await fetch('/api/generate-itinerary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        destination: targetLocation,
                        query: query || targetLocation
                    })
                });

                if (!res.ok) throw new Error("AI Gen Failed");

                const aiItinerary = await res.json();

                if (aiItinerary && !aiItinerary.error) {
                    setData((prev: any) => {
                        if (!prev || !prev.trips.length) return prev;
                        const newTrips = [...prev.trips];
                        // Find index of displayed trip
                        const index = newTrips.findIndex((t: any) => t.slug === selectedSlug);
                        if (index !== -1) {
                            newTrips[index] = {
                                ...newTrips[index],
                                itinerary: {
                                    ...aiItinerary,
                                    waypoints: aiItinerary.waypoints || prev.trips[index].itinerary?.waypoints || []
                                }
                            };
                        }
                        return { ...prev, trips: newTrips };
                    });
                }

            } catch (err) {
                console.error("AI Generation Failed:", err);
            } finally {
                setAiGenerating(false);
            }
        };

        const timer = setTimeout(enhanceItinerary, 500);
        return () => clearTimeout(timer);

    }, [firstTrip?.slug]);

    // Split View Layout (Reference Style)
    if (query) {
        return (
            <main className="flex h-screen overflow-hidden bg-white text-gray-900 font-sans">
                {/* Left Panel - Itinerary & Search (40%) */}
                <div className="w-[40%] flex flex-col border-r border-gray-200 shadow-xl z-20 bg-white order-1">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all" aria-label="Back to Home">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                        </Link>
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

                        {/* Puter AI Generation Logic */}
                        {aiGenerating && (
                            <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-pink-100 rounded-lg flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center animate-spin">
                                    <span className="text-white text-xs">✨</span>
                                </div>
                                <div className="text-sm text-pink-700 font-medium">
                                    <Typewriter
                                        text="Enhancing accessibility with AI..."
                                        speed={50}
                                    />
                                </div>
                            </div>
                        )}

                        {!loading && !aiGenerating && firstTrip?.itinerary && (
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
                                    overrideData={firstTrip}
                                />

                                {/* Horizontal Route Map / Waypoints Overlay */}
                                {firstTrip?.itinerary?.waypoints && (
                                    <div className={`absolute top-6 right-6 z-30 flex flex-col items-end pointer-events-none w-auto transition-opacity duration-300 ${showRoute ? 'opacity-100' : 'opacity-0 hover:opacity-100 group-hover:opacity-100'}`}>
                                        {/* Header with Distance Logic is handled inside components or below if needed */}
                                        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-4 pointer-events-auto max-w-sm">
                                            <div className="flex items-center justify-between mb-3 gap-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                                        Suggested Route
                                                    </h3>
                                                    {userLocation && destLocation && (
                                                        <p className="text-xs text-gray-500 mt-0.5 ml-4">
                                                            {calculateDistance(userLocation.lat, userLocation.lon, destLocation.lat, destLocation.lon).toFixed(0)} km from you
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setShowRoute(!showRoute)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:bg-indigo-50 rounded"
                                                >
                                                    {showRoute ? 'Hide' : 'Show'}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                {/* Start Point */}
                                                <div className="flex-shrink-0 flex flex-col items-center gap-1 group/pt">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-500 shadow-sm z-10">
                                                        <span className="text-[10px] font-bold text-indigo-700">A</span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm border border-gray-100">Start</span>
                                                </div>

                                                {/* Connector */}
                                                <div className="flex-shrink-0 w-8 h-0.5 bg-gray-300 rounded-full mt-[-16px]"></div>

                                                {/* Waypoints Render */}
                                                {firstTrip.itinerary.waypoints.map((wp: string, i: number) => (
                                                    <div key={i} className="flex flex-shrink-0 items-center">
                                                        <div className="flex flex-col items-center gap-1 group/pt">
                                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-indigo-400 shadow-sm z-10 transition-transform hover:scale-110 cursor-pointer" title={wp}>
                                                                <span className="text-[9px] font-bold text-indigo-600">{i + 1}</span>
                                                            </div>
                                                            <span className="text-[9px] font-medium text-gray-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 max-w-[60px] truncate">{wp}</span>
                                                        </div>
                                                        {i < (firstTrip.itinerary?.waypoints?.length || 0) - 1 && (
                                                            <div className="flex-shrink-0 w-6 h-0.5 bg-gray-300 rounded-full mt-[-16px] mx-1"></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full w-full bg-gray-100 relative">
                                <ImageSlider />
                                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white z-20 pointer-events-none">
                                    <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">Discover India</h2>
                                    <p className="text-lg opacity-90 drop-shadow-md">Select a destination to explore</p>
                                </div>
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
            {/* Background Image Slider */}
            <ImageSlider />

            <div className="relative flex place-items-center flex-col text-center w-full z-10">
                <h1 className="text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
                    Weekend Traveller
                </h1>
                <p className="text-xl text-white font-medium mb-12 max-w-2xl leading-relaxed drop-shadow-md">
                    Discover your perfect weekend getaway.
                </p>
                <div className="w-full max-w-2xl relaltive z-20">
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
