'use client'

import { useState } from 'react'
import { FacebookIcon, TwitterIcon, LinkedinIcon, Link2Icon } from 'lucide-react'

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Share:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-blue-600 hover:text-white transition-colors"
      >
        <FacebookIcon className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-sky-500 hover:text-white transition-colors"
      >
        <TwitterIcon className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-blue-700 hover:text-white transition-colors"
      >
        <LinkedinIcon className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
        title="Copy link"
      >
        <Link2Icon className="h-4 w-4" />
      </button>
      {copied && (
        <span className="text-xs text-green-600 dark:text-green-400 ml-2">Copied!</span>
      )}
    </div>
  )
}
