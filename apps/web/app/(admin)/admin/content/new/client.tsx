'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as tus from 'tus-js-client'
import { getVideoUploadUrl, createContent } from '@/actions/content'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Upload,
  FileVideo,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Lock,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewContentClientProps {
  tools: { id: string; name: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWordCount(str: string) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length
}

function validateImage(
  file: File,
  opts: { width: number; height: number; maxSizeKb: number; name: string }
) {
  return new Promise<void>((resolve, reject) => {
    if (!['image/jpeg', 'image/webp'].includes(file.type)) {
      return reject(new Error(`${opts.name} must be WebP or JPEG.`))
    }
    if (file.size > opts.maxSizeKb * 1024) {
      return reject(new Error(`${opts.name} exceeds ${opts.maxSizeKb}KB limit.`))
    }
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      if (img.width !== opts.width || img.height !== opts.height) {
        reject(
          new Error(
            `${opts.name} must be ${opts.width}×${opts.height}px. Got ${img.width}×${img.height}px.`
          )
        )
      } else {
        resolve()
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error(`Failed to load ${opts.name} metadata.`))
    }
    img.src = URL.createObjectURL(file)
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ['Upload', 'Details']
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((label, i) => {
        const s = i + 1
        const done = current > s
        const active = current === s
        return (
          <div key={s} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                  done
                    ? 'bg-primary text-primary-foreground'
                    : active
                    ? 'border-2 border-primary text-primary'
                    : 'border border-border text-muted-foreground'
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {s < steps.length && (
              <div className={cn('h-px w-32 transition-colors', current > s ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FileDropZone({
  accept,
  file,
  onChange,
  disabled,
  icon: Icon,
  label,
  hint,
  tall = false,
}: {
  accept: string
  file: File | null
  onChange: (f: File | null) => void
  disabled?: boolean
  icon: React.ElementType
  label: string
  hint: string
  tall?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
        'hover:border-primary/40 hover:bg-accent/50',
        file ? 'border-primary/40 bg-accent/30' : 'border-border',
        tall ? 'h-36' : 'h-16 flex-row justify-start gap-3 px-4',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={disabled}
      />
      <Icon
        className={cn(
          tall ? 'h-6 w-6' : 'h-4 w-4 shrink-0',
          file ? 'text-primary' : 'text-muted-foreground'
        )}
      />
      <div className={cn(tall ? 'text-center' : '')}>
        <p className="text-xs font-medium leading-tight">
          {file ? file.name : label}
        </p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NewContentClient({ tools }: NewContentClientProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [smallThumbFile, setSmallThumbFile] = useState<File | null>(null)
  const [heroThumbFile, setHeroThumbFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [bunnyVideoId, setBunnyVideoId] = useState('')

  // Steps 2–3
  const [description, setDescription] = useState('')
  const [toolId, setToolId] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterOrder, setChapterOrder] = useState('0')
  const [externalUrl, setExternalUrl] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [availableFree, setAvailableFree] = useState(false)
  const [availablePaid, setAvailablePaid] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (uploading) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [uploading])

  const handleUpload = async () => {
    if (!videoFile || !videoTitle || !smallThumbFile) {
      setError('Video title, video file, and small thumbnail are required.')
      return
    }
    setUploading(true)
    setError('')

    try {
      // Validate video resolution
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(videoFile)
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src)
          const { videoWidth: w, videoHeight: h } = video
          if (w !== 1080 || h !== 1920)
            reject(new Error(`Video must be 1080×1920. Got ${w}×${h}.`))
          else resolve(true)
        }
        video.onerror = () => {
          URL.revokeObjectURL(video.src)
          reject(new Error('Failed to load video metadata.'))
        }
      })

      await validateImage(smallThumbFile, { name: 'Small Tile', width: 160, height: 220, maxSizeKb: 100 })
      if (heroThumbFile)
        await validateImage(heroThumbFile, { name: 'Hero Image', width: 1080, height: 608, maxSizeKb: 500 })
    } catch (err: any) {
      setError(err.message)
      setUploading(false)
      return
    }

    const res = await getVideoUploadUrl(videoTitle)
    if (!res.success) {
      setError('Failed to get upload URL.')
      setUploading(false)
      return
    }

    const { videoId, libraryId, tusEndpoint, authSignature, authExpire } = res
    setBunnyVideoId(videoId)

    new tus.Upload(videoFile, {
      endpoint: tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: authSignature,
        AuthorizationExpire: String(authExpire),
        VideoId: videoId,
        LibraryId: libraryId,
      },
      metadata: { filename: videoFile.name, filetype: videoFile.type },
      onError: (err) => { setError(`Upload failed: ${err.message}`); setUploading(false) },
      onProgress: (loaded, total) => setUploadProgress(Math.round((loaded / total) * 100)),
      onSuccess: () => { setUploading(false); setStep(2) },
    }).start()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!availableFree && !availablePaid) {
      setError('Content must be available to at least one audience.')
      return
    }
    if (getWordCount(description) > 1000) {
      setError('Description exceeds 1,000 words.')
      return
    }
    if (!toolId) {
      setError('Please select an AI Tool.')
      return
    }

    const formData = new FormData()
    formData.append('toolId', toolId)
    formData.append('chapterTitle', chapterTitle)
    formData.append('chapterOrder', chapterOrder)
    formData.append('description', description)
    formData.append('externalUrl', externalUrl)
    formData.append('bunnyVideoId', bunnyVideoId)
    formData.append('availableFree', String(availableFree))
    formData.append('availablePaid', String(availablePaid))
    formData.append('smallThumb', smallThumbFile!)
    if (heroThumbFile) formData.append('heroThumb', heroThumbFile)
    categoryIds.forEach((id) => formData.append('categoryIds', id))

    const result = await createContent(formData)
    if (result.success) {
      router.push('/admin/content')
    } else {
      setError('Failed to save content. Check all fields.')
    }
  }

  const wordCount = getWordCount(description)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Upload Content</h1>
          <p className="text-sm text-muted-foreground">
            Add a new chapter to the AI Seekho library.
          </p>
        </div>
      </div>

      <StepIndicator current={step} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Step 1: Upload ── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Video & Thumbnails</CardTitle>
            <CardDescription className="text-xs">
              All assets are validated before upload begins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="videoTitle">Video Title <span className="text-muted-foreground">(admin only)</span></Label>
              <Input
                id="videoTitle"
                placeholder="e.g. Intro to ChatGPT Prompt Engineering"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                maxLength={100}
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Video File</Label>
                <FileDropZone
                  accept="video/mp4"
                  file={videoFile}
                  onChange={setVideoFile}
                  disabled={uploading}
                  icon={FileVideo}
                  label="Select video file"
                  hint="MP4 · 1080×1920"
                  tall
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>
                    Small Tile{' '}
                    <Badge variant="outline" className="ml-1 text-[10px]">Required</Badge>
                  </Label>
                  <FileDropZone
                    accept="image/webp,image/jpeg"
                    file={smallThumbFile}
                    onChange={setSmallThumbFile}
                    disabled={uploading}
                    icon={ImageIcon}
                    label="Upload thumbnail"
                    hint="160×220 · JPEG/WebP · max 100KB"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Hero Image{' '}
                    <Badge variant="outline" className="ml-1 text-[10px]">Optional</Badge>
                  </Label>
                  <FileDropZone
                    accept="image/webp,image/jpeg"
                    file={heroThumbFile}
                    onChange={setHeroThumbFile}
                    disabled={uploading}
                    icon={ImageIcon}
                    label="Upload hero image"
                    hint="1080×608 · JPEG/WebP · max 500KB"
                  />
                </div>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading to Bunny.net…</span>
                  <span className="font-medium text-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || !videoFile || !videoTitle || !smallThumbFile}
              className="w-full"
            >
              {uploading ? 'Uploading…' : 'Continue to Details'}
              {!uploading && <Upload className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Steps 2–3: Details + Access ── */}
      {step >= 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Chapter Details</CardTitle>
              <CardDescription className="text-xs">
                Metadata shown to students on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>AI Tool</Label>
                <div className="flex gap-2">
                  <Select value={toolId} onValueChange={setToolId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an AI Tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" asChild>
                    <Link href="/admin/tools">
                      <Settings2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr,100px] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="chapterTitle">Chapter Title <span className="text-muted-foreground">(public)</span></Label>
                  <Input
                    id="chapterTitle"
                    placeholder="e.g. Introduction to Prompt Engineering"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chapterOrder">Order</Label>
                  <Input
                    id="chapterOrder"
                    type="number"
                    min="0"
                    className="text-center"
                    value={chapterOrder}
                    onChange={(e) => setChapterOrder(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <span
                    className={cn(
                      'text-[11px]',
                      wordCount > 1000 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {wordCount} / 1,000 words
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this chapter…"
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="externalUrl">
                  External URL <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://…"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Access & Visibility</CardTitle>
              <CardDescription className="text-xs">
                Control which audience can view this content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Free Access</p>
                    <p className="text-[11px] text-muted-foreground">Visible to all users</p>
                  </div>
                </div>
                <Switch checked={availableFree} onCheckedChange={setAvailableFree} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Paid Access</p>
                    <p className="text-[11px] text-muted-foreground">Active subscribers only</p>
                  </div>
                </div>
                <Switch checked={availablePaid} onCheckedChange={setAvailablePaid} />
              </div>

              <Separator />

              <Button type="submit" className="w-full">
                Save & Create Record
              </Button>
            </CardContent>
          </Card>

        </form>
      )}
    </div>
  )
}