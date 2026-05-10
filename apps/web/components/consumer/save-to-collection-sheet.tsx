"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Plus, Bookmark, Check, FolderPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SaveToCollectionSheetProps {
  contentId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveToCollectionSheet({
  contentId,
  isOpen,
  onOpenChange,
}: SaveToCollectionSheetProps) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  async function fetchCollections() {
    try {
      setLoading(true);
      const res = await (apiClient as any).collections.$get();
      if (res.ok) {
        setCollections(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch collections:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(collectionId: string) {
    try {
      const res = await (apiClient as any).collections[":id"].items.$post({
        param: { id: collectionId },
        json: { contentId },
      });

      if (res.ok) {
        toast.success("Saved to collection");
        onOpenChange(false);
      }
    } catch (e) {
      toast.error("Failed to save item");
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) return;

    try {
      const res = await (apiClient as any).collections.$post({
        json: { name: newCollectionName },
      });

      if (res.ok) {
        const newCol = await res.json();
        await handleSave(newCol.id);
      }
    } catch (e) {
      toast.error("Failed to create collection");
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[32px] bg-black border-white/10 px-6 pb-10"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-blue-500" />
            Save to Collection
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            Choose a collection to save this tool.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Loading collections...
            </div>
          ) : (
            <>
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleSave(col.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors group"
                >
                  <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {col.name}
                  </span>
                  <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-gray-500" />
                  </div>
                </button>
              ))}

              {!showNewInput ? (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full flex items-center gap-3 p-4 text-blue-500 font-bold hover:bg-blue-500/5 rounded-2xl transition-colors"
                >
                  <FolderPlus className="h-5 w-5" />
                  Create New Collection
                </button>
              ) : (
                <div className="flex gap-2 p-2">
                  <Input
                    placeholder="Collection name..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                    autoFocus
                  />
                  <Button
                    onClick={handleCreateCollection}
                    className="bg-blue-600 hover:bg-blue-500 rounded-xl"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
