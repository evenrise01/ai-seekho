'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Plus, Pencil, Trash2, ExternalLink, Film, Clock, RefreshCcw } from 'lucide-react'
import { deleteContent, updateContentStatus, syncVideoStatus } from '@/actions/content'
import { useRouter } from 'next/navigation'

interface ContentItem {
  id: string
  chapterTitle: string
  description: string
  toolName: string
  status: string
  videoStatus: string
  createdAt: string
  categories: string[]
}

export function ContentLibraryClient({ initialContent }: { initialContent: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleDelete(id: string, chapterTitle: string) {
    if (!confirm(`Are you sure you want to delete "${chapterTitle}"?`)) return
    
    setLoading(id)
    try {
      await deleteContent(id)
      router.refresh()
    } catch (err) {
      alert('Failed to delete content')
    } finally {
      setLoading(null)
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    setLoading(id)
    try {
      await updateContentStatus(id, newStatus as any)
      router.refresh()
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  async function handleSync(id: string) {
    setLoading(id)
    try {
      const res = await syncVideoStatus(id)
      if (res.status === 'ready') {
        router.refresh()
      } else {
        alert('Video is still processing on Bunny.net')
      }
    } catch (err) {
      alert('Failed to sync status')
    } finally {
      setLoading(null)
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

  function getVideoStatusBadge(status: string) {
    switch (status) {
      case 'ready':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Ready</Badge>
      case 'processing':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 animate-pulse">Processing</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Content Library</CardTitle>
          <CardDescription>Manage your AI tool tutorials and videos</CardDescription>
        </div>
        <Link href="/admin/content/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Video
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {initialContent.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Video Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="flex flex-col">
                      <span className="truncate">{item.chapterTitle}</span>
                      <span className="text-xs text-muted-foreground truncate font-normal">ID: {item.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.toolName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.categories.map((cat: string) => (
                        <Badge key={cat} variant="outline" className="text-[10px] px-1 h-4">
                          {cat}
                        </Badge>
                      ))}
                      {item.categories.length === 0 && <span className="text-xs text-muted-foreground">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      disabled={loading === item.id}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {getStatusBadge(item.status)}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getVideoStatusBadge(item.videoStatus)}
                      {item.videoStatus === 'processing' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => handleSync(item.id)}
                          disabled={loading === item.id}
                          title="Sync status with Bunny.net"
                        >
                          <RefreshCcw className={`h-3 w-3 ${loading === item.id ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/content/${item.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id, item.chapterTitle)}
                        disabled={loading === item.id}
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
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <Film className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">Your library is empty</h3>
            <p className="text-muted-foreground mb-6">Start by uploading your first AI tool tutorial.</p>
            <Link href="/admin/content/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Your First Video
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
