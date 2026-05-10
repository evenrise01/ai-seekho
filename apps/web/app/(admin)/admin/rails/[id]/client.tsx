'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  ArrowLeft,
  Search,
  Film
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  assignTileToRail, 
  updateTileOrder, 
  deleteRailTile,
  updateRailVisibility
} from '@/actions/rails'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface RailTile {
  contentId: string
  sortOrder: number
  content: {
    id: string
    chapterTitle: string
    toolName: string
    status: string
  }
}

interface RailDetailsClientProps {
  rail: any
  availableContent: any[]
}

function SortableTileItem({ tile, onRemove }: { tile: RailTile, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.contentId })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center p-3 mb-2 bg-background border border-border rounded-xl group transition-all ${isDragging ? 'shadow-2xl border-blue-500/50 scale-[1.02]' : 'hover:border-white/10'}`}>
      <div {...attributes} {...listeners} className="mr-3 cursor-grab active:cursor-grabbing p-1.5 hover:bg-accent rounded-lg text-muted-foreground/30 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate uppercase tracking-tight">{tile.content.chapterTitle}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{tile.content.toolName}</p>
      </div>

      <div className="flex items-center gap-2">
        {tile.content.status !== 'published' && (
          <Badge variant="secondary" className="text-[10px] h-5 font-bold uppercase tracking-tighter">Draft</Badge>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
          onClick={() => onRemove(tile.contentId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function RailDetailsClient({ rail, availableContent }: RailDetailsClientProps) {
  const router = useRouter()
  const [tiles, setTiles] = useState<RailTile[]>(rail.tiles)
  
  useEffect(() => {
    setTiles(rail.tiles)
  }, [rail.tiles])

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredAvailable = availableContent.filter(c => 
    c.chapterTitle.toLowerCase().includes(search.toLowerCase()) || 
    c.toolName.toLowerCase().includes(search.toLowerCase())
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = tiles.findIndex((i) => i.contentId === active.id)
      const newIndex = tiles.findIndex((i) => i.contentId === over.id)
      const newTiles = arrayMove(tiles, oldIndex, newIndex)
      setTiles(newTiles)
      
      try {
        await updateTileOrder(rail.id, newTiles.map(t => t.contentId))
      } catch (err) {
        alert('Failed to update order')
        setTiles(tiles)
      }
    }
  }

  const handleAddContent = async (contentId: string) => {
    setLoading(contentId)
    try {
      const res = await assignTileToRail(rail.id, contentId)
      if (res.success) {
        router.refresh()
      }
    } catch (err) {
      alert('Failed to add content')
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveTile = async (contentId: string) => {
    try {
      await deleteRailTile(rail.id, contentId)
      router.refresh()
    } catch (err) {
      alert('Failed to remove content')
    }
  }

  const handleVisibilityChange = async (isVisible: boolean) => {
    try {
      await updateRailVisibility(rail.id, isVisible)
      router.refresh()
    } catch (err) {
      alert('Failed to update visibility')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin/rails" className="flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground mb-8 transition-colors group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Rails
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Rail Preview & Sorting */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="uppercase tracking-tighter font-black text-2xl">{rail.name}</CardTitle>
                  <CardDescription className="font-medium">Drag and drop to reorder content in this rail.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-3 bg-muted/30 px-4 py-2 rounded-2xl border border-white/5">
                    <Label htmlFor="rail-visibility" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visible</Label>
                    <Switch 
                      id="rail-visibility" 
                      checked={rail.isVisible} 
                      onCheckedChange={handleVisibilityChange} 
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tiles.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={tiles.map(t => t.contentId)} strategy={verticalListSortingStrategy}>
                    <div className="bg-white/[0.02] p-4 rounded-2xl min-h-[100px] border border-white/5">
                      {tiles.map(tile => (
                        <SortableTileItem key={tile.contentId} tile={tile} onRemove={handleRemoveTile} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-24 bg-muted/20 border-2 border-dashed border-border rounded-3xl">
                  <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-10" />
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">This rail is empty. Add content from the library.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Available Content */}
        <div className="space-y-6">
          <Card className="h-[calc(100vh-220px)] flex flex-col border-white/5 bg-white/[0.01]">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Library</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search content..."
                  className="pl-10 h-10 bg-background/50 border-white/5 rounded-xl"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-2">
                  {filteredAvailable.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group">
                      <div className="min-w-0 mr-3">
                        <p className="font-bold text-[11px] truncate uppercase tracking-tight">{item.chapterTitle}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{item.toolName}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 w-8 p-0 shrink-0 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        onClick={() => handleAddContent(item.id)}
                        disabled={loading === item.id}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {filteredAvailable.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                      <Search className="h-8 w-8 mx-auto mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No results</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
