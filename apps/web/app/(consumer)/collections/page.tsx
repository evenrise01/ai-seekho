import { apiClient } from "@/lib/api-client";
import { Header } from "@/components/consumer/header";
import Link from "next/link";
import { Bookmark, Plus, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CollectionsPage() {
  let collections: any[] = [];

  try {
    const res = await (apiClient as any).collections.$get();
    if (res.ok) {
      collections = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch collections:", e);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <Header />
      <div className="p-4 md:p-12">
        <div className="flex items-center justify-between mb-8 md:mb-16">
          <h1 className="text-xl md:text-4xl font-black uppercase tracking-tighter">
            Collections
          </h1>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-white/10 bg-white/5 rounded-full px-4 py-6 md:px-8 md:text-lg"
          >
            <Plus className="h-4 w-4 md:h-6 md:w-6" />
            New
          </Button>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center gap-6 hover:bg-white/10 transition-all hover:scale-[1.02]"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/20 rounded-[24px] flex items-center justify-center border border-blue-500/20">
                  <Folder className="h-8 w-8 md:h-10 md:w-10 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {col.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    {col.items?.length || 0} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Bookmark className="h-10 w-10 text-gray-700" />
            </div>
            <p className="text-gray-500 font-medium mb-2">No collections yet</p>
            <p className="text-xs text-gray-600 max-w-[200px]">
              Save your favorite AI tools and roadmaps to access them easily.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
