import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TrendingUp, Play, Plus } from "lucide-react";

export function TrendingBanner({ item }: { item: any }) {
  if (!item) return null;
  const isLocked = !item.availableFree;

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={item.heroThumbUrl || item.smallThumbUrl || "/placeholder.jpg"}
          alt={item.chapterTitle}
          fill
          className={cn(
            "object-cover opacity-50 transition-transform duration-1000",
            isLocked && "blur-sm",
          )}
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-16 max-w-4xl text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">
            <TrendingUp className="h-3 w-3" />
            {item.toolName || "Trending Now"}
          </div>

          <h2 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase drop-shadow-2xl">
            {item.chapterTitle}
          </h2>

          <p className="text-sm md:text-xl text-gray-300 max-w-2xl line-clamp-3 font-medium leading-relaxed">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {isLocked ? (
              <Link href="/upgrade">
                <Button
                  size="lg"
                  className="bg-amber-500 text-black hover:bg-amber-400 font-black uppercase tracking-widest text-sm px-10 h-14 rounded-2xl shadow-2xl"
                >
                  Unlock Premium
                </Button>
              </Link>
            ) : (
              <Link href={`/watch/${item.id}`}>
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-sm px-10 h-14 rounded-2xl shadow-2xl"
                >
                  Watch Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
