'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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

export default function LocationPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            fetch(`${API_BASE}/api/destinations/${slug}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setDestination(data);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>;
    if (!destination) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Destination not found</div>;

    return (
        <main className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Hero Section with Video */}
            <div className="relative h-[60vh] w-full overflow-hidden">
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
                    <div className="absolute inset-0 bg-gray-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/" className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
                            <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 group-hover:bg-cyan-500/10 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </svg>
                            </div>
                            <span className="font-medium">Back to Home</span>
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-bold mb-2">{destination.Destination}</h1>
                        <p className="text-xl md:text-2xl text-gray-300 flex items-center gap-2">
                            <span className="text-cyan-500">📍</span> {destination["State / UT"]}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold mb-4 text-cyan-400">Overview</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">{destination["Short Description"]}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Famous For</h3>
                            <div className="flex flex-wrap gap-2">
                                {destination["Famous For"].split(',').map((tag, i) => (
                                    <span key={i} className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-800/50">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Ideal For</h3>
                            <p className="text-lg text-white">{destination["Suitable For"]}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-4">Trip Essentials</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-gray-500 text-sm block mb-1">Best Time to Visit</label>
                                <p className="text-lg font-medium text-white">{destination["Best Time to Visit"]}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm block mb-1">Ideal Duration</label>
                                <p className="text-lg font-medium text-white">{destination["Ideal Duration"]} Days</p>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm block mb-1">Trip Type</label>
                                <p className="text-lg font-medium text-white">{destination.Type}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm block mb-1">Estimated Cost</label>
                                <p className="text-lg font-medium text-white">₹5,000 - ₹15,000</p>
                            </div>
                        </div>

                        <button className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all">
                            Plan This Trip
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
