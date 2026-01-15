import Image from 'next/image';

interface TripCardProps {
    title: string;
    location: string;
    description: string;
    price: string;
    imageUrl?: string;
    videoUrl?: string;
    duration?: string;
    rating?: number;
    attractions?: string[];
    slug?: string;
}

import Link from 'next/link';

export default function TripCard({ title, location, description, price, imageUrl, videoUrl, duration, rating, attractions, slug }: TripCardProps) {
    const CardContent = (
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full">
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

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

                {rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 px-2 py-1 rounded-lg flex items-center gap-1 text-sm border border-gray-200 z-10 shadow-sm">
                        <span className="text-yellow-500">★</span> {rating}
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">{title}</h3>
                        <p className="text-sm font-medium text-cyan-600 mt-1">{location}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-gray-900">{price}</span>
                    </div>
                </div>

                {duration && (
                    <div className="mb-4 flex items-center text-xs text-gray-500 gap-1.5">
                        <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {duration}
                    </div>
                )}

                <p className="text-gray-600 flex-grow leading-relaxed text-sm mb-4">{description}</p>

                {attractions && attractions.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Travel Points</p>
                        <div className="flex flex-wrap gap-2">
                            {attractions.map((point, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                                    {point}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                    <span className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300">
                        View Details <span>&rarr;</span>
                    </span>
                </div>
            </div>
        </div>
    );

    if (slug) {
        return (
            <Link href={`/location/${slug}`} className="block h-full">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}
