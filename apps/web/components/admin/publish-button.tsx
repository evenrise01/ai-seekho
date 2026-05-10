'use client'

import { useState } from 'react'
import { executePublish } from '@/actions/publish'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export function PublishButton({ pendingCount }: { pendingCount: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [platforms, setPlatforms] = useState(['web'])
  const router = useRouter()

  const handlePublish = async () => {
    setLoading(true)
    const result = await executePublish(platforms)
    setLoading(false)
    if (result.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={pendingCount === 0}
        className={`relative px-6 py-2 text-xs font-black rounded-full transition-all uppercase tracking-widest ${
          pendingCount > 0
            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
            : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
        }`}
      >
        Publish
        {pendingCount > 0 && (
          <span className="ml-2 bg-white text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-8 rounded-[32px] shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Confirm Publish</h3>
            <p className="text-sm text-muted-foreground mb-8">
              You are about to publish <span className="text-foreground font-bold">{pendingCount}</span> pending changes to the live platform.
            </p>
            
            <div className="space-y-4 mb-8">
              <label className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-2xl cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500"
                    checked={platforms.includes('web')}
                    onChange={(e) => {
                      if (e.target.checked) setPlatforms([...platforms, 'web'])
                      else setPlatforms(platforms.filter(p => p !== 'web'))
                    }}
                  />
                  <span className="text-sm font-bold">Web Platform</span>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5">LIVE</Badge>
              </label>
              
              <label className="flex items-center justify-between p-4 bg-background/20 border border-border/50 rounded-2xl opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-border bg-background" disabled />
                  <span className="text-sm font-bold">Mobile App</span>
                </div>
                <Badge variant="outline" className="text-[10px] h-5">PHASE 2</Badge>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-3 text-xs font-black text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={loading || platforms.length === 0}
                className="flex-[2] px-4 py-3 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.2)]"
              >
                {loading ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
