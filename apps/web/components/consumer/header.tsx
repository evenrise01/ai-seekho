"use client";

import { Search, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/ai_seekho_logo_premium_1778318179449.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter text-white">
              AI SEEKHO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/trending"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Trending
            </Link>
            <Link
              href="/collections"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Collections
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button className="hidden md:block text-gray-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <Link
            href="/profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-blue-500 transition-all"
          >
            U
          </Link>
        </div>
      </div>
    </header>
  );
}
