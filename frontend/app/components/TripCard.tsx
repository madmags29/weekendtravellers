import Image from 'next/image';

interface TripCardProps {
    title: string;
    location: string;
    description: string;
    price: string;
    imageUrl?: string;
    videoUrl?: string; // New prop
    duration?: string;
    rating?: number;
    attractions?: string[];
}

export default function TripCard({ title, location, description, price, imageUrl, videoUrl, duration, rating, attractions }: TripCardProps) {
    return (
        <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-xl hover:bg-gray-800 transition-all duration-300 overflow-hidden group">
            <div className="relative h-48 w-full overflow-hidden">
                {/* Image (Always visible initially, hidden if video plays and covers it? Or just z-index swap) */}
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}

                {/* Video (Visible on hover if provided) */}
                {videoUrl && (
                    <video
                        src={videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>

                {rating && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1 text-sm border border-white/10 z-10">
                        <span className="text-yellow-400">★</span> {rating}
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{title}</h3>
                        <p className="text-sm font-medium text-cyan-400 mt-1">{location}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-white">{price}</span>
                    </div>
                </div>

                {duration && (
                    <div className="mb-4 flex items-center text-xs text-gray-400 gap-1.5">
                        <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {duration}
                    </div>
                )}

                <p className="text-gray-300 flex-grow leading-relaxed text-sm mb-4">{description}</p>

                {attractions && attractions.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Travel Points</p>
                        <div className="flex flex-wrap gap-2">
                            {attractions.map((point, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-800 text-cyan-400 text-xs rounded border border-gray-700">
                                    {point}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-800 flex justify-end">
                    <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300">
                        View Details <span>&rarr;</span>
                    </button>
                </div>
            </div>
        </div>

    );
}
