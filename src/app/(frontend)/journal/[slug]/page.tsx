import { notFound } from 'next/navigation'
import { findBySlug } from '@/lib/payload'
import { getJournalArticles } from '@/lib/content'
import { MediaImage } from '../../components/media-image'

export const dynamicParams = false

export async function generateStaticParams() {
  const articles = await getJournalArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export default async function JournalDetailPage({ params }: PageProps<'/journal/[slug]'>) {
  const { slug } = await params
  const article = await findBySlug('journal-articles', slug, { depth: 2 })
  if (!article) notFound()
  return (
    <main className="pt-[78px]">
      <article>
        <header className="section-shell page-hero">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">{article.category ?? 'Design insight'}</p>
            {article.isSample && <span className="sample-label">Sample article</span>}
          </div>
          <h1 className="page-title">{article.title}</h1>
          <p className="page-intro">{article.excerpt}</p>
        </header>
        <div className="section-shell pt-0">
          <div className="relative min-h-[520px] overflow-hidden bg-[#e7ddd1] sm:min-h-[680px]">
            <MediaImage
              media={article.coverImage}
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="section-shell max-w-4xl pt-6">
          {article.body
            .split('\n')
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="mb-6 text-lg leading-9 text-[#51463e]">
                {paragraph}
              </p>
            ))}
        </div>
      </article>
    </main>
  )
}
