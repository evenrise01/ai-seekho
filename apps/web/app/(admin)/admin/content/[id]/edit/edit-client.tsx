"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateContent } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export function EditContentClient({
  initialData,
  allCategories,
  allTools,
}: {
  initialData: any;
  allCategories: any[];
  allTools: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [toolId, setToolId] = useState(initialData.toolId);
  const [chapterTitle, setChapterTitle] = useState(initialData.chapterTitle);
  const [chapterOrder, setChapterOrder] = useState(initialData.chapterOrder);
  const [description, setDescription] = useState(initialData.description);
  const [externalUrl, setExternalUrl] = useState(initialData.externalUrl || "");
  const [availableFree, setAvailableFree] = useState(initialData.availableFree);
  const [availablePaid, setAvailablePaid] = useState(initialData.availablePaid);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData.categoryIds,
  );

  // Image files
  const [smallThumb, setSmallThumb] = useState<File | null>(null);
  const [heroThumb, setHeroThumb] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("toolId", toolId);
    formData.append("chapterTitle", chapterTitle);
    formData.append("chapterOrder", String(chapterOrder));
    formData.append("description", description);
    formData.append("externalUrl", externalUrl);
    formData.append("availableFree", String(availableFree));
    formData.append("availablePaid", String(availablePaid));

    if (smallThumb) formData.append("smallThumb", smallThumb);
    if (heroThumb) formData.append("heroThumb", heroThumb);

    categoryIds.forEach((id) => formData.append("categoryIds", id));

    try {
      const res = await updateContent(initialData.id, formData);
      if (res.success) {
        router.push("/admin/content");
        router.refresh();
      } else {
        setError("Failed to update content");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/content"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Content</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tool">AI Tool</Label>
                  <div className="flex gap-2">
                    <select
                      id="tool"
                      value={toolId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setToolId(e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select an AI Tool</option>
                      {allTools.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <Button variant="secondary">
                      <Link href="/admin/tools">Manage Tools</Link>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr,100px] gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapterTitle">Chapter Title</Label>
                    <Input
                      id="chapterTitle"
                      value={chapterTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setChapterTitle(e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapterOrder">Order</Label>
                    <Input
                      id="chapterOrder"
                      type="number"
                      min="0"
                      value={chapterOrder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setChapterOrder(e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDescription(e.target.value)
                    }
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">External URL (Optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={externalUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setExternalUrl(e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access & Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Who can watch this?</Label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="free" className="font-medium">
                          Free Users
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Available to all signed-in users
                        </p>
                      </div>
                      <Switch
                        id="free"
                        checked={availableFree}
                        onCheckedChange={setAvailableFree}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="paid" className="font-medium">
                          Paid Users
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Available to premium subscribers
                        </p>
                      </div>
                      <Switch
                        id="paid"
                        checked={availablePaid}
                        onCheckedChange={setAvailablePaid}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <Badge
                        key={cat.id}
                        variant={
                          categoryIds.includes(cat.id) ? "default" : "outline"
                        }
                        className="cursor-pointer py-1.5 px-3 transition-colors"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Media */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Update video thumbnails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Small Thumbnail (160x220)</Label>
                  {initialData.smallThumbUrl && !smallThumb && (
                    <img
                      src={initialData.smallThumbUrl}
                      alt="Current"
                      className="w-20 rounded border mb-2 shadow-sm"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/webp,image/jpeg"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSmallThumb(e.target.files?.[0] || null)
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hero Banner (1080x608)</Label>
                  {initialData.heroThumbUrl && !heroThumb && (
                    <img
                      src={initialData.heroThumbUrl}
                      alt="Current"
                      className="w-full aspect-video object-cover rounded border mb-2 shadow-sm"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/webp,image/jpeg"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setHeroThumb(e.target.files?.[0] || null)
                    }
                    className="text-xs"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 leading-relaxed">
                  <strong>Note:</strong> Video processing is managed by
                  Bunny.net. Status sync is available on the content library
                  page.
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button className="w-full" variant="outline">
                <Link href="/admin/content">Cancel</Link>
              </Button>
              {error && (
                <p className="text-sm text-red-500 font-medium text-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
