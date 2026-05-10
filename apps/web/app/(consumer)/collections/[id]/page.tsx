import { apiClient } from "@/lib/api-client";
import { Header } from "@/components/consumer/header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  let collection: any = null;

  try {
    // In a real app, I'd have a specific endpoint or filter the list
    const res = await (apiClient as any).collections.$get();
    if (res.ok) {
      const all = await res.json();
      collection = all.find((c: any) => c.id === id);
    }
  } catch (e) {
    console.error("Failed to fetch collection details:", e);
  }

  if (!collection) {
    return (
      <main className="min-h-screen bg-black text-white pb-24">
        <Header />
        <div className="p-20 text-center text-gray-500">
          Collection not found
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <Header />
      <div className="p-4">
        <Link
          href="/collections"
          className="flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>

        <h1 className="text-2xl font-bold mb-6">{collection.name}</h1>

        <div className="grid grid-cols-2 gap-4">
          {collection.items && collection.items.length > 0 ? (
            collection.items.map((item: any) => (
              <Link
                key={item.content.id}
                href={`/watch/${item.content.id}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-160/220 bg-white/5 rounded-2xl overflow-hidden mb-2">
                  <img
                    src={item.content.smallThumbUrl || "/placeholder.jpg"}
                    alt={item.content.chapterTitle}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">
                  {item.content.tool?.name}
                </p>
                <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {item.content.chapterTitle}
                </h3>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-20 text-gray-500">
              This collection is empty.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
