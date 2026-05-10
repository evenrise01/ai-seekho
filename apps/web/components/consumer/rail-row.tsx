import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function RailRow({ rail }: { rail: any }) {
  if (!rail.tiles || rail.tiles.length === 0) return null;

  return (
    <div className="py-8">
      <div className="px-6 mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">
            {rail.name}
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {rail.tiles.length} items
          </p>
        </div>
        {rail.categories && rail.categories.length > 0 && (
          <Link
            href={`/category/${rail.categories[0].categoryId}`}
            className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400"
          >
            Explore All
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto space-x-6 px-6 pb-4 scrollbar-hide snap-x">
        {rail.tiles.map((tile: any) => {
          const isLocked = !tile.availableFree;
          const href = isLocked
            ? "/upgrade"
            : `/watch/${tile.id}?railId=${rail.id}`;

          return (
            <Link
              key={tile.id}
              href={href}
              className="relative flex-none w-[240px] md:w-[320px] snap-start group"
            >
              <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-white/5 transition-all duration-500 group-hover:border-blue-500/50 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-blue-500/10">
                <Image
                  src={tile.smallThumbUrl || "/placeholder.jpg"}
                  alt={tile.chapterTitle}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-700 group-hover:scale-110",
                    isLocked
                      ? "opacity-30 blur-sm"
                      : "opacity-90 group-hover:opacity-100",
                  )}
                />

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-white/40" />
                  </div>
                )}

                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white border border-white/10">
                  {Math.floor(tile.videoDurationSecs / 60)}:
                  {(tile.videoDurationSecs % 60).toString().padStart(2, "0")}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                  {tile.toolName}
                </p>
                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {tile.chapterTitle}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
