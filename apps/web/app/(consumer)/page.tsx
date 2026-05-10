import { apiClient } from "@/lib/api-client";
import { TrendingBanner } from "@/components/consumer/trending-banner";
import { RailRow } from "@/components/consumer/rail-row";

export default async function HomePage() {
  let feed: any[] = [];
  let trending: any = null;

  try {
    const feedRes = await (apiClient as any).feed.$get();
    if (feedRes.ok) {
      feed = await feedRes.json();
    }
  } catch (e) {
    console.error("Failed to fetch feed:", e);
  }

  try {
    const trendingRes = await (apiClient as any).feed.trending.$get();
    if (trendingRes.ok) {
      trending = await trendingRes.json();
    }
  } catch (e) {
    console.error("Failed to fetch trending:", e);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      {trending && <TrendingBanner item={trending} />}

      <div className="space-y-8 pt-6">
        {feed.length > 0 ? (
          feed.map((rail: any) => <RailRow key={rail.id} rail={rail} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <p className="text-lg font-bold">No content yet</p>
            <p className="text-sm mt-2 font-medium opacity-50">
              Check back later for new releases.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
