import 'server-only'

import type { JournalArticle, Project, Service, Testimonial, WebsiteSetting } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export async function getWebsiteSettings(): Promise<WebsiteSetting> {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'website-settings',
    overrideAccess: false,
    depth: 1,
  })
}

export async function getProjects(options?: {
  featured?: boolean
  limit?: number
}): Promise<Project[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'projects',
    overrideAccess: false,
    draft: false,
    depth: 2,
    limit: options?.limit ?? 100,
    sort: 'sortOrder',
    where: options?.featured ? { featured: { equals: true } } : undefined,
  })
  return result.docs
}

export async function getServices(): Promise<Service[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'services',
    overrideAccess: false,
    draft: false,
    limit: 100,
    sort: 'sortOrder',
  })
  return result.docs
}

export async function getJournalArticles(limit = 100): Promise<JournalArticle[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'journal-articles',
    overrideAccess: false,
    draft: false,
    depth: 2,
    limit,
    sort: '-publishedOn',
  })
  return result.docs
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'testimonials',
    overrideAccess: false,
    draft: false,
    limit: 20,
    sort: '-createdAt',
  })
  return result.docs
}
