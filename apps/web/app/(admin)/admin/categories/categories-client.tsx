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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Plus, Tag, Archive, CheckCircle2 } from 'lucide-react'
import { createCategory, publishCategory, archiveCategory } from '@/actions/categories'

export function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', newName)
    formData.append('description', newDesc)
    
    try {
      const res = await createCategory(formData)
      if (res.success) {
        setIsCreateOpen(false)
        setNewName('')
        setNewDesc('')
        router.refresh()
      } else {
        alert('Failed to create category')
      }
    } catch (err) {
      alert('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishCategory(id)
      router.refresh()
    } catch (err) {
      alert('Failed to publish')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveCategory(id)
      router.refresh()
    } catch (err) {
      alert('Failed to archive')
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Published</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Content Categories</CardTitle>
          <CardDescription>Organize your videos by topic</CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>Add a new category to group your AI tutorials.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Video Generation" 
                    value={newName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Input 
                    id="desc" 
                    placeholder="Brief description of this category" 
                    value={newDesc}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {initialCategories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {cat.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {cat.description || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(cat.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {cat.status === 'draft' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handlePublish(cat.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Publish
                        </Button>
                      )}
                      {cat.status !== 'archived' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1 text-muted-foreground hover:text-foreground hover:bg-accent"
                          onClick={() => handleArchive(cat.id)}
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <Tag className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">No categories found</h3>
            <p className="text-muted-foreground mb-6">Create categories to organize your content library.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
