'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import TripCard from '../components/TripCard';

// Define the shape of a trip result
interface Trip {
    id: number;
    title: string;
    location: string;
    description: string;
    price: string;
    duration?: string;
    rating?: number;
    attractions?: string[];
    image_url?: string;
    video_url?: string;
    slug?: string;
}

interface SearchResponse {
    query?: string;
    trips: Trip[];
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    const [data, setData] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTrips = async () => {
        if (!query) return;
        setLoading(true);
        setError(null);
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_BASE}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }

            const jsonData = await res.json();
            setData(jsonData);
        } catch (err) {
            console.error("Failed to fetch trips:", err);
            setError("Failed to load trip ideas. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [query]);

    if (!query) {
        return <div className="p-12 text-center text-gray-400">Please enter a search term above.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Trip Ideas for "<span className="text-cyan-600">{query}</span>"
            </h1>
            <p className="text-gray-600 mb-10">Here are some AI-curated weekend getaways just for you.</p>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center">
                    <p className="mb-3">{error}</p>
                    <button
                        onClick={fetchTrips}
                        className="px-4 py-2 bg-white hover:bg-red-50 text-red-700 rounded-md text-sm transition-colors border border-red-200 shadow-sm"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {data && data.trips && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            title={trip.title}
                            location={trip.location}
                            description={trip.description}
                            price={trip.price}
                            duration={trip.duration}
                            rating={trip.rating}
                            attractions={trip.attractions}
                            imageUrl={trip.image_url}
                            videoUrl={trip.video_url}
                            slug={trip.slug}
                        />
                    ))}
                </div>
            )}

            {data && data.trips.length === 0 && !loading && (
                <p className="text-gray-500">No results found.</p>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <main className="min-h-screen">
            {/* Simple header */}
            <div className="bg-white border-b border-gray-200 py-4 px-6 mb-8 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <a href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain group-hover:drop-shadow-sm transition-all"
                            />
                        </div>
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Weekend Traveller</span>
                    </a>

                    <a href="/" className="group flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors">
                        <div className="p-2 rounded-full bg-gray-100 border border-gray-200 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <path d="M12 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="font-medium text-sm">Back to Home</span>
                    </a>
                </div>
            </div>

            <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading search...</div>}>
                <SearchResultsContent />
            </Suspense>
        </main>
    );
}
