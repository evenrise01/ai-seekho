'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Play, 
  Bookmark, 
  Share2, 
  MoreVertical 
} from 'lucide-react'
import { SaveToCollectionSheet } from '@/components/consumer/save-to-collection-sheet'
import { cn } from '@/lib/utils'

export default function WatchPage() {
  const { id } = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [hlsUrl, setHlsUrl] = useState('')
  const [content, setContent] = useState<any>(null)
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  useEffect(() => {
    // Fetch stream URL and content details
    async function fetchData() {
      try {
        const [streamRes, detailRes] = await Promise.all([
          (apiClient as any).content[':id'].stream.$get({ param: { id } }),
          (apiClient as any).content[':id'].$get({ param: { id } })
        ])
        
        if (streamRes.ok) {
          const data = await streamRes.json()
          if (data.hlsUrl) setHlsUrl(data.hlsUrl)
        }
        
        if (detailRes.ok) {
          setContent(await detailRes.json())
        }
      } catch (e) {
        console.error('Failed to fetch watch data:', e)
      }
    }
    
    fetchData()
  }, [id])

  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error)
      })
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.error)
      })
    }
  }, [hlsUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleVideoEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleVideoEnded)
    }
  }, [id])

  const handleVideoEnded = async () => {
    try {
      await (apiClient as any).progress['mark-watched'].$post({
        json: { contentId: id }
      })
    } catch (e) {
      console.error('Failed to mark as watched:', e)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    videoRef.current.currentTime = percentage * videoRef.current.duration
  }

  const handleDoubleTap = (side: 'left' | 'right') => {
    if (!videoRef.current) return
    const amount = side === 'left' ? -10 : 10
    videoRef.current.currentTime += amount
  }

  const togglePlaybackSpeed = () => {
    if (!videoRef.current) return
    const speeds = [1, 1.5, 2]
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length]
    videoRef.current.playbackRate = nextSpeed
    setPlaybackSpeed(nextSpeed)
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
      <div className="relative w-full h-full bg-black overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          loop
        />
        
        {/* Interaction Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Double Tap Seek Zones */}
        <div className="absolute inset-0 flex z-10 pointer-events-none">
          <div 
            className="w-1/4 h-full pointer-events-auto cursor-pointer" 
            onDoubleClick={() => handleDoubleTap('left')}
          />
          <div className="w-1/2 h-full" />
          <div 
            className="w-1/4 h-full pointer-events-auto cursor-pointer" 
            onDoubleClick={() => handleDoubleTap('right')}
          />
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-12 flex justify-between items-center z-20">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 text-on-primary/80 hover:text-on-primary transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
            <span className="hidden md:block text-eyebrow tracking-widest">Back</span>
          </button>
          
          <div className="flex gap-6">
            <button 
              onClick={togglePlaybackSpeed}
              className="px-6 h-10 md:h-12 rounded-full bg-scrim/40 backdrop-blur-xl flex items-center justify-center text-on-primary border border-hairline text-micro-caps hover:bg-scrim/60 transition-colors"
            >
              {playbackSpeed}x SPEED
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-scrim/40 backdrop-blur-xl flex items-center justify-center text-on-primary border border-hairline hover:bg-scrim/60 transition-colors"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Bottom Bar Container */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20 flex flex-col gap-10">
          
          {/* Bottom Content Info */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="flex-1 max-w-2xl">
              {content ? (
                <div className="space-y-6">
                  <div className="text-eyebrow text-stone tracking-[0.2em]">
                    {content.tool?.name || 'AI Tool'}
                  </div>
                  <h1 className="text-display md:text-[3.5rem] text-on-primary">
                    {content.chapterTitle}
                  </h1>
                  <p className="text-subtitle text-on-primary/70 line-clamp-2 md:line-clamp-none max-w-xl">
                    {content.description}
                  </p>
                </div>
              ) : (
                <div className="animate-pulse space-y-6">
                  <div className="h-4 w-24 bg-scrim/40 rounded-full" />
                  <div className="h-16 w-full bg-scrim/40 rounded-lg" />
                  <div className="h-6 w-2/3 bg-scrim/40 rounded-lg" />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSaveSheetOpen(true)}
                className="flex items-center gap-3 h-12 px-8 rounded-full bg-on-primary text-scrim hover:bg-on-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Bookmark className="h-5 w-5" />
                <span className="text-micro-caps">Save</span>
              </button>

              <button className="flex items-center gap-3 h-12 px-8 rounded-full bg-scrim/40 backdrop-blur-xl text-on-primary border border-hairline hover:bg-scrim/60 transition-all hover:scale-105 active:scale-95">
                <Share2 className="h-5 w-5" />
                <span className="hidden md:inline text-micro-caps">Share</span>
              </button>

              <button className="h-12 w-12 rounded-full bg-scrim/40 backdrop-blur-xl text-on-primary border border-hairline hover:bg-scrim/60 transition-all">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-3">
            <div 
              className="relative h-1 bg-on-primary/10 rounded-full z-30 cursor-pointer group"
              onClick={handleSeek}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-on-primary rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-[-6px] top-[-6px] w-4 h-4 bg-on-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
            <div className="flex justify-between text-micro-caps text-stone tracking-widest">
              <span>
                {Math.floor((progress / 100) * duration / 60)}:
                {Math.floor(((progress / 100) * duration) % 60).toString().padStart(2, '0')}
              </span>
              <span>
                {Math.floor(duration / 60)}:
                {Math.floor(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Play State Overlay */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-scrim/40 z-20 transition-all duration-500"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-on-primary/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-on-primary/20 transition-transform hover:scale-110 active:scale-90">
              <Play className="h-12 w-12 md:h-16 md:w-16 text-on-primary fill-on-primary ml-2" />
            </div>
          </div>
        )}

        <SaveToCollectionSheet 
          contentId={id as string}
          isOpen={isSaveSheetOpen}
          onOpenChange={setIsSaveSheetOpen}
        />
      </div>
    </div>
  )
}
