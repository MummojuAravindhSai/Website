import Link from 'next/link'
import { getJournalArticles } from '@/lib/content'
import { MediaImage } from '../components/media-image'

export const dynamic = 'force-static'

export default async function JournalPage() {
  const articles = await getJournalArticles()
  return (
    <main className="pt-[78px]">
      <section className="section-shell page-hero">
        <p className="eyebrow">Journal & design insights</p>
        <h1 className="page-title">Notes on materials, planning and everyday living.</h1>
        <p className="page-intro">
          Current articles are sample editorial content and are labelled accordingly.
        </p>
      </section>
      <section className="section-shell grid gap-x-7 gap-y-14 pt-0 md:grid-cols-2">
        {articles.length === 0 ? (
          <p className="empty-state md:col-span-2">Published articles will appear here.</p>
        ) : (
          articles.map((article) => (
            <Link
              href={`/journal/${article.slug}`}
              key={article.id}
              className="group border-t border-[#d8cbbd] pt-5"
            >
              <div className="relative min-h-[340px] overflow-hidden bg-[#e7ddd1]">
                <MediaImage
                  media={article.coverImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                {article.isSample && <span className="sample-badge">Sample article</span>}
              </div>
              <p className="eyebrow mt-5">{article.category ?? 'Design insight'}</p>
              <h2 className="mt-2 font-serif text-3xl">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#62564d]">{article.excerpt}</p>
            </Link>
          ))
        )}
      </section>
    </main>
  )
}
