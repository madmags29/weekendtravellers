import SearchBar from './components/SearchBar';
import FeatureCard from './components/FeatureCard';
import BackgroundVideo from './components/BackgroundVideo';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 relative overflow-hidden">
            <BackgroundVideo />
            {/* Background elements for depth - keep them but they might be behind video? z-index... */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10"></div>

            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                {/* Header/Nav could go here */}
            </div>

            <div className="relative flex place-items-center flex-col text-center">
                <div className="mb-6 relative w-24 h-24">
                    <img
                        src="/logo.png"
                        alt="Weekend Traveller Logo"
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    />
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 drop-shadow-sm">
                    Weekend Traveller
                </h1>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                    Discover your perfect weekend getaway. Powered by AI to plan trips tailored just for you.
                </p>

                <SearchBar />

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
                    <FeatureCard
                        title="AI Powered"
                        description="Smart recommendations based on your preferences."
                        imageQuery="artificial intelligence, neural network, futuristic technology"
                    />
                    <FeatureCard
                        title="Instant Itineraries"
                        description="Get a full weekend plan in seconds."
                        imageQuery="travel map, compass, adventure planning"
                    />
                    <FeatureCard
                        title="Hidden Gems"
                        description="Discover places off the beaten path."
                        imageQuery="secret cave, hidden waterfall, mysterious forest"
                    />
                </div>
            </div>
        </main>
    );
}
