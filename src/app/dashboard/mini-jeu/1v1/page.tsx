'use client'

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0b0d13] px-10 py-20 font-[IBM Plex Mono] text-white select-none">
      <div className="text-center max-w-lg">
        <h1 className="text-7xl font-extrabold mb-8 text-cyan-400 animate-pulse">
          🚧
        </h1>
        <h2 className="text-4xl font-bold mb-6 tracking-wide">
          Page en construction
        </h2>
        <p className="text-cyan-300 text-lg mb-12">
          Cette fonctionnalité arrive bientôt. Reste connecté et prépare-toi pour la suite !
        </p>
        <div className="inline-block px-8 py-3 rounded-2xl bg-[#12151d] shadow-lg text-cyan-400 font-semibold cursor-not-allowed select-none">
          Arrive bientôt
        </div>
      </div>
    </main>
  )
}
