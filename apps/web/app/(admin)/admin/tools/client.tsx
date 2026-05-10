'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Cpu } from 'lucide-react'
import { createTool, updateTool, deleteTool } from '@/actions/tools'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ToolsClient({ initialTools }: { initialTools: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<any>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setEditingTool(null)
  }

  const handleEdit = (tool: any) => {
    setEditingTool(tool)
    setName(tool.name)
    setSlug(tool.slug)
    setDescription(tool.description || '')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('submitting')
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('description', description)

    try {
      if (editingTool) {
        await updateTool(editingTool.id, formData)
      } else {
        await createTool(formData)
      }
      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      alert('Failed to save tool')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will affect content chapters linked to this tool.`)) return
    
    setLoading(id)
    try {
      await deleteTool(id)
      router.refresh()
    } catch (err) {
      alert('Failed to delete tool')
    } finally {
      setLoading(null)
    }
  }

  const generateSlug = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>AI Tools Manager</CardTitle>
            <CardDescription>Manage the list of AI tools available for content chapters.</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val)
            if (!val) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Tool
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTool ? 'Edit Tool' : 'Add New AI Tool'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!editingTool) setSlug(generateSlug(e.target.value))
                    }} 
                    placeholder="ChatGPT, Midjourney..." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL identifier)</Label>
                  <Input 
                    id="slug" 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="chatgpt" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Input 
                    id="desc" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Brief overview of the tool" 
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading === 'submitting'}>
                    {editingTool ? 'Update Tool' : 'Create Tool'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {initialTools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialTools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      {tool.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">/{tool.slug}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {tool.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(tool)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(tool.id, tool.name)}
                          disabled={loading === tool.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Cpu className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">No tools found. Add your first AI tool to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
