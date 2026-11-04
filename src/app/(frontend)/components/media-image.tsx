import Image from 'next/image'
import type { Media } from '@/payload-types'
import { getMediaSourceUrl } from '@/lib/media-url'

export function MediaImage({
  media,
  className = '',
  priority = false,
  sizes = '100vw',
}: {
  media?: Media | Media['id'] | null
  className?: string
  priority?: boolean
  sizes?: string
}) {
  if (!media || typeof media !== 'object' || !media.url) return null

  return (
    <Image
      src={getMediaSourceUrl(media.url)}
      alt={media.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  )
}
