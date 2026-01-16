'use client';

import { useEffect, useState } from 'react';

interface Destination {
    id: number;
    slug: string;
    Destination: string;
    "State / UT": string;
    Type: string;
    "Best Time to Visit": string;
    "Ideal Duration": string;
    "Suitable For": string;
    "Weekend Trip": string;
    "Famous For": string;
    "Short Description": string;
    image_url?: string;
    video_url?: string;
}

interface LocationDetailsProps {
    slug: string;
    onBack?: () => void;
    overrideData?: any; // Accept AI enhanced data
}

export default function LocationDetails({ slug, onBack, overrideData }: LocationDetailsProps) {
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (overrideData) {
            setDestination(prev => ({
                ...prev,
                ...overrideData,
                // Map AI fields to Destination interface if needed
                "Best Time to Visit": overrideData.best_time || prev?.["Best Time to Visit"] || "Oct - Mar",
            } as Destination));
            if (!slug) setLoading(false); // If just showing override
        }

        if (slug) {
            // Fetch foundational data (coordinates, images, etc.) even if override exists
            // Use relative path to leverage Next.js proxy (avoids CORS/Network issues)
            console.log("Fetching details from proxy: /api/destinations/" + slug);
            fetch(`/api/destinations/${slug}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setDestination(prev => ({
                            ...data,
                            ...prev, // Keep AI overrides logic: actually we want AI to win.
                            // Logic: default backend data < AI override
                            ...overrideData,
                            "Best Time to Visit": overrideData?.best_time || data["Best Time to Visit"] || "Oct - Mar"
                        }));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else if (overrideData) {
            setLoading(false);
        }
    }, [slug, overrideData]);

    if (loading) return <div className="h-full flex items-center justify-center text-gray-400">Loading details...</div>;
    if (!destination) return <div className="h-full flex items-center justify-center text-gray-400">Destination not found</div>;

    return (
        <div className="bg-gray-50 text-gray-900 pb-20 overflow-y-auto h-full relative">
            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/90 backdrop-blur text-sm font-medium text-gray-700 rounded-full shadow-lg hover:bg-white hover:text-cyan-600 transition-all border border-gray-200"
                >
                    &larr; Back to Results
                </button>
            )}

            {/* Hero Section with Video */}
            <div className="relative h-[400px] w-full overflow-hidden rounded-b-3xl shadow-xl mb-8">
                {destination.video_url ? (
                    <video
                        src={destination.video_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white drop-shadow-md">{destination.Destination}</h1>
                    <p className="text-xl text-gray-200 flex items-center gap-2 drop-shadow">
                        <span className="text-cyan-400">📍</span> {destination["State / UT"]}
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="px-6 md:px-10">
                <div className="grid grid-cols-1 gap-8">
                    {/* Main Details */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-l-4 border-cyan-500 pl-4">Overview</h2>
                            <p className="text-lg text-gray-600 leading-relaxed bg-white p-6 rounded-xl border border-gray-100 shadow-sm">{destination["Short Description"]}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">Famous For</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(destination["Famous For"] || "").split(',').map((tag: string, i: number) => (
                                        <span key={i} className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium border border-cyan-100">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">Ideal For</h3>
                                <p className="text-lg text-gray-800">{destination["Suitable For"]}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats (Inline) */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">Trip Essentials</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-gray-400 text-xs block mb-1 uppercase font-bold">Best Time</label>
                                <p className="text-base font-medium text-gray-900">{destination["Best Time to Visit"]}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs block mb-1 uppercase font-bold">Duration</label>
                                <p className="text-base font-medium text-gray-900">{destination["Ideal Duration"]} Days</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs block mb-1 uppercase font-bold">Type</label>
                                <p className="text-base font-medium text-gray-900">{destination.Type}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs block mb-1 uppercase font-bold">Est. Cost</label>
                                <p className="text-base font-medium text-gray-900">₹5,000 - ₹15,000</p>
                            </div>
                        </div>

                        <button className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all">
                            Plan This Trip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
