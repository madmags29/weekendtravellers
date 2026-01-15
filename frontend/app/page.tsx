import SearchBar from './components/SearchBar';
import BackgroundVideo from './components/BackgroundVideo';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 relative overflow-hidden">
            <BackgroundVideo />

            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                {/* Header/Nav could go here */}
            </div>

            <div className="relative flex place-items-center flex-col text-center w-full">
                <div className="mb-6 relative w-24 h-24">
                    <img
                        src="/logo.png"
                        alt="Weekend Traveller Logo"
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    />
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Weekend Traveller
                </h1>
                <p className="text-xl text-white font-medium mb-12 max-w-2xl leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Discover your perfect weekend getaway.
                </p>

                <SearchBar />
            </div>
        </main>
    );
}
