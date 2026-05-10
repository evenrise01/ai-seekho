import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { ChevronRight, PlayCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function ToolPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  let tool: any = null;

  try {
    const res = await (apiClient as any).tools[":slug"].$get({
      param: { slug },
    });
    if (res.ok) {
      tool = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch tool details:", e);
  }

  if (!tool) {
    return <div className="p-20 text-center text-stone">Tool not found</div>;
  }

  return (
    <div className="bg-canvas min-h-screen">
      {/* Tool Header Section */}
      <div className="px-lg py-xl border-b border-hairline-soft bg-canvas-warm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-24 h-24 bg-canvas border border-hairline p-4 flex items-center justify-center shadow-sm">
            <img
              src={tool.logoUrl || "/placeholder-tool.png"}
              alt={tool.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-micro-caps text-stone tracking-widest">
                Masterclass
              </span>
              <span className="h-1 w-1 rounded-full bg-stone" />
              <span className="text-micro-caps text-stone">
                {tool.chapters?.length || 0} Chapters
              </span>
            </div>
            <h1 className="text-heading-lg text-ink">{tool.name}</h1>
            <p className="text-body text-graphite mt-4 max-w-xl">
              {tool.description ||
                `Master ${tool.name} with our step-by-step bite-sized lessons.`}
            </p>
          </div>

          <div className="w-full md:w-auto">
            {tool.chapters && tool.chapters.length > 0 && (
              <Link href={`/watch/${tool.chapters[0].id}`}>
                <Button variant="primary" className="w-full md:w-auto px-10">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="max-w-4xl mx-auto px-lg py-xl">
        <div className="mb-10">
          <h2 className="text-eyebrow text-stone">Course Roadmap</h2>
          <div className="h-[1px] w-12 bg-ink mt-4" />
        </div>

        <div className="space-y-[1px] bg-hairline-soft border border-hairline-soft overflow-hidden">
          {tool.chapters?.map((chapter: any, index: number) => {
            const isLocked = index > 0 && !chapter.availableFree;

            return (
              <Link
                key={chapter.id}
                href={isLocked ? "/upgrade" : `/watch/${chapter.id}`}
                className={cn(
                  "flex items-center gap-6 p-8 bg-canvas transition-all group",
                  isLocked ? "opacity-50" : "hover:bg-canvas-warm",
                )}
              >
                <span className="text-eyebrow text-stone group-hover:text-ink transition-colors w-8">
                  {(index + 1).toString().padStart(2, "0")}
                </span>

                <div className="flex-1">
                  <h3 className="text-heading-sm text-ink group-hover:text-ink/80 transition-colors">
                    {chapter.chapterTitle}
                  </h3>
                  <p className="text-meta text-stone mt-1">
                    {Math.floor(chapter.videoDurationSecs / 60)}m{" "}
                    {chapter.videoDurationSecs % 60}s
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-stone" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-stone group-hover:text-ink transition-colors" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
