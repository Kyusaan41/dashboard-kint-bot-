'use client'

import Link from 'next/link'
import { FaGamepad, FaTrophy } from 'react-icons/fa'

export default function MiniJeuHome() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0b0d13] px-10 py-20 font-[IBM Plex Mono] text-white select-none">
      <h1 className="text-6xl font-extrabold mb-24 tracking-wide text-cyan-400">
        🎮 Mini Jeux
      </h1>

      <nav className="flex flex-col gap-14 w-full max-w-sm">
        {[
          { href: '/dashboard/mini-jeu/kint', label: 'Classement KINT', icon: <FaTrophy className="text-cyan-400 w-6 h-6" /> },
          { href: '/dashboard/mini-jeu/1v1', label: 'Mode 1v1', icon: <FaGamepad className="text-cyan-400 w-6 h-6" /> },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="
              flex items-center gap-4 rounded-3xl bg-[#12151d] shadow-lg
              py-6 px-10
              font-semibold text-cyan-300
              transition transform
              hover:scale-[1.03] hover:shadow-cyan-600
              focus:outline-none focus:ring-4 focus:ring-cyan-500
            "
            tabIndex={0}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      <footer className="mt-28 text-sm text-[#3e5873] tracking-wide select-none">
        © 2025 Mini Jeux — Kyû
      </footer>
    </main>
  )
}
