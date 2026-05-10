'use client'

import { useEffect, useState } from 'react'
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
  Settings2, 
  Eye, 
  EyeOff, 
  Trash2, 
  LayoutList  
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createRail, updateRailOrder, deleteRail } from '@/actions/rails'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Rail {
  id: string
  name: string
  isVisible: boolean
  sortOrder: number
  tiles: any[]
}

function SortableRailItem({ rail, onDelete }: { rail: Rail, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rail.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "mb-4 rounded-2xl border bg-slate-900 transition-all",
        isDragging ? "shadow-2xl scale-[1.02] border-blue-500/50" : "border-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-center p-6">
        <div {...attributes} {...listeners} className="mr-6 cursor-grab active:cursor-grabbing p-3 hover:bg-white/5 rounded-xl transition-colors text-slate-500">
          <GripVertical className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">{rail.name}</h3>
            {!rail.isVisible && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none uppercase text-[10px] font-black">
                <EyeOff className="h-3 w-3 mr-1" /> Hidden
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <LayoutList className="h-3.5 w-3.5 text-slate-600" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {rail.tiles.length} video{rail.tiles.length !== 1 ? 's' : ''} in this rail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/admin/rails/${rail.id}`}>
            <Button variant="outline" size="sm" className="font-bold uppercase text-[10px] rounded-xl bg-slate-800 border-white/5 hover:bg-white/5 text-white">
              Manage Content
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
            onClick={() => onDelete(rail.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RailsClient({ initialRails }: { initialRails: any[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Rail[]>(initialRails)
  
  useEffect(() => {
    setItems(initialRails)
  }, [initialRails])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newRailName, setNewRailName] = useState('')
  const [newRailVisible, setNewRailVisible] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      
      try {
        await updateRailOrder(newItems.map(i => i.id))
      } catch (err) {
        alert('Failed to update order')
        setItems(items) // Revert
      }
    }
  }

  const handleCreateRail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRailName) return
    
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', newRailName)
    formData.append('isVisible', String(newRailVisible))
    
    try {
      const res = await createRail(formData)
      if (res.success) {
        setIsCreateOpen(false)
        setNewRailName('')
        setNewRailVisible(true)
        router.refresh()
      } else {
        alert('Failed to create rail')
      }
    } catch (err) {
      alert('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRail = async (id: string) => {
    if (!confirm('Are you sure? This will remove the rail from the feed (videos remain in library).')) return
    
    try {
      await deleteRail(id)
      router.refresh()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-end mb-8">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl h-14 px-8 shadow-xl shadow-blue-600/20">
              <Plus className="h-5 w-5 mr-2" />
              Create New Rail
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-slate-900 border-white/5 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">Create Content Rail</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Rails group your videos into horizontal rows on the home page feed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRail}>
              <div className="space-y-8 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rail Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Featured AI Tools" 
                    className="bg-slate-950 border-white/5 h-14 rounded-2xl px-6 font-bold text-white focus:border-blue-500/50"
                    value={newRailName}
                    onChange={e => setNewRailName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight text-white">Visibility</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Show this rail on the home page</p>
                  </div>
                  <Switch 
                    checked={newRailVisible}
                    onCheckedChange={setNewRailVisible}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="font-bold text-slate-500 hover:text-white">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-lg shadow-blue-600/10" disabled={isSubmitting || !newRailName}>
                  {isSubmitting ? 'Creating...' : 'Create Rail'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {items.map(item => (
                <SortableRailItem key={item.id} rail={item} onDelete={handleDeleteRail} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/50">
          <LayoutList className="h-16 w-16 mx-auto mb-4 text-slate-800" />
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">No rails created</h3>
          <p className="text-slate-500 font-medium mt-2">Create a rail to start organizing your home page feed.</p>
        </div>
      )}
    </div>
  )
}
