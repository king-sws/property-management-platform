'use client'

import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle'
}

export default function AdUnit({ slot, format = 'auto' }: AdUnitProps) {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className="my-6 overflow-hidden flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '90px' }}
        data-ad-client="ca-pub-1335845015981714"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}