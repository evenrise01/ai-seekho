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
import { TrendingUp, Star, Search } from 'lucide-react'
import { setTrending } from '@/actions/content'
import { Input } from '@/components/ui/input'

export function TrendingClient({ initialContent }: { initialContent: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const handleSetTrending = async (id: string) => {
    setLoading(id)
    try {
      const res = await setTrending(id)
      if (res.success) {
        router.refresh()
      }
    } catch (err) {
      alert('Failed to set trending')
    } finally {
      setLoading(null)
    }
  }

  const filteredContent = initialContent.filter(c => 
    c.chapterTitle.toLowerCase().includes(search.toLowerCase()) || 
    c.toolName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trending Content</CardTitle>
            <CardDescription>Select one video to highlight at the top of the home page</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search videos..." 
              className="pl-9 h-9"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredContent.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video Title</TableHead>
                <TableHead>AI Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id} className={item.isTrending ? 'bg-amber-500/10' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.isTrending && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                      {item.chapterTitle}
                    </div>
                  </TableCell>
                  <TableCell>{item.toolName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className={item.videoStatus === 'ready' ? 'text-emerald-500' : 'text-amber-500'}>
                        {item.videoStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.isTrending ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                        Current Trending
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 gap-1 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20"
                        onClick={() => handleSetTrending(item.id)}
                        disabled={loading === item.id || item.status !== 'published' || item.videoStatus !== 'ready'}
                        title={item.status !== 'published' ? 'Must be published first' : 'Set as Trending'}
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Set Trending
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <TrendingUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">No content found</h3>
            <p className="text-muted-foreground mb-6">You need to upload and publish content before setting trending status.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
