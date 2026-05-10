import { apiClient } from "@/lib/api-client";
import { Header } from "@/components/consumer/header";
import Link from "next/link";

export default async function TrendingPage() {
  let trending: any[] = [];

  try {
    const res = await (apiClient as any).feed.trending.all.$get();
    if (res.ok) {
      trending = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch all trending:", e);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <Header />
      <div className="p-4 md:p-12">
        <h1 className="text-xl md:text-4xl font-black mb-6 md:mb-12 uppercase tracking-tighter">
          Trending Now
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {trending.length > 0 ? (
            trending.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.id}`}
                className="group flex flex-col gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <img
                    src={item.smallThumbUrl || "/placeholder.jpg"}
                    alt={item.chapterTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 backdrop-blur-md">
                    {Math.floor(item.videoDurationSecs / 60)}:
                    {(item.videoDurationSecs % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1">
                    {item.toolName}
                  </p>
                  <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                    {item.chapterTitle}
                  </h3>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
              No trending content found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
