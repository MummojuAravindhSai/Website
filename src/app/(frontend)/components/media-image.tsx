import Image from 'next/image'
import type { Media } from '@/payload-types'

export function MediaImage({
  media,
  className = '',
  priority = false,
  sizes = '100vw',
}: {
  media?: Media | string | null
  className?: string
  priority?: boolean
  sizes?: string
}) {
  if (!media || typeof media === 'string' || !media.url) return null

  return (
    <Image
      src={media.url}
      alt={media.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  )
}
