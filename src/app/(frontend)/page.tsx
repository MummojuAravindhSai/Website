import Link from 'next/link'
import { getJournalArticles, getProjects, getServices, getTestimonials } from '@/lib/content'
import { MediaImage } from './components/media-image'
import { ProjectBrowser } from './components/project-browser'
import { VideoCard } from './components/video-card'

export const dynamic = 'force-static'

const process = [
  ['01', 'Discover', 'We begin with your routines, priorities, property and aspirations.'],
  ['02', 'Define', 'Space plans, mood, material direction and investment priorities take shape.'],
  ['03', 'Detail', 'Every finish, light, storage element and custom detail is documented.'],
  ['04', 'Deliver', 'The approved design moves into coordinated execution and final styling.'],
]

export default async function HomePage() {
  const [projects, services, articles, testimonials] = await Promise.all([
    getProjects({ featured: true }),
    getServices(),
    getJournalArticles(2),
    getTestimonials(),
  ])
  const hero = projects[0]

  return (
    <main className="pt-[78px]">
      <section className="section-shell pt-16 sm:pt-24">
        <p className="eyebrow">Premium interiors · Hyderabad, Telangana</p>
        <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.4rem,7vw,6.8rem)] leading-[0.95] tracking-[-0.04em]">
          Interiors that feel considered, warm and entirely your own.
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-[#62564d]">
          We shape Hyderabad homes around everyday rituals—with thoughtful space planning, generous
          storage, natural materials and quietly refined detail.
        </p>
        <div className="relative mt-12 min-h-[520px] overflow-hidden bg-[#e6dbcf] sm:min-h-[680px]">
          <MediaImage
            media={hero?.coverImage}
            priority
            sizes="100vw"
            className="object-cover transition duration-1000 hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 bg-gradient-to-t from-black/75 to-transparent p-6 pt-28 text-white sm:flex-row sm:items-end sm:justify-between sm:p-9">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e5d7ca]">
                {hero?.isSample ? 'Sample featured project' : 'Featured project'}
              </p>
              <h2 className="mt-2 font-serif text-3xl">{hero?.title ?? 'Portfolio coming soon'}</h2>
              <p className="mt-2 text-xs text-white/75">
                {hero?.location ?? 'Hyderabad, Telangana'}
              </p>
            </div>
            <Link className="btn-light" href={hero ? `/projects/${hero.slug}` : '/projects'}>
              Explore project ↗
            </Link>
          </div>
        </div>
        <div className="grid gap-5 border-b border-[#d8cbbd] py-6 sm:grid-cols-3">
          <div>
            <p className="eyebrow">Focus</p>
            <p className="mt-2 text-sm">Residential & selected commercial interiors</p>
          </div>
          <div>
            <p className="eyebrow">Based in</p>
            <p className="mt-2 text-sm">Hyderabad, Telangana</p>
          </div>
          <div>
            <p className="eyebrow">Content status</p>
            <p className="mt-2 text-sm">Sample portfolio — verification pending</p>
          </div>
        </div>
      </section>

      <section className="mt-20 bg-[#eee6dc]">
        <div className="section-shell grid gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="eyebrow">Our point of view</p>
            <h2 className="section-title mt-4">
              A beautiful home should also make everyday life easier.
            </h2>
            <p className="mt-7 max-w-2xl leading-8 text-[#62564d]">
              We pair an editorial eye with practical planning for Indian homes: intuitive kitchens,
              useful wardrobes, calm bedrooms, welcoming living spaces and storage that is present
              without feeling heavy.
            </p>
            <Link className="text-link mt-8 inline-flex" href="/about">
              About the studio ↗
            </Link>
          </div>
          <div className="relative min-h-[520px] overflow-hidden bg-[#ddd0c2]">
            <MediaImage
              media={hero?.gallery?.[1]?.image}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <span className="sample-badge">Sample image</span>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected portfolio</p>
            <h2 className="section-title mt-3">Homes with a sense of belonging</h2>
          </div>
          <Link className="text-link" href="/projects">
            View all projects ↗
          </Link>
        </div>
        <ProjectBrowser projects={projects} />
      </section>

      <section className="bg-[#e7ddd1]">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Design process film</p>
              <h2 className="section-title mt-3">Made by light. Finished by hand.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#62564d]">
              A sample playback state showing how project films can be presented when verified media
              is available.
            </p>
          </div>
          <VideoCard />
        </div>
      </section>

      <section className="section-shell">
        <p className="eyebrow">Services</p>
        <h2 className="section-title mt-3">Support at every interior scale</h2>
        {services.length > 0 ? (
          <div className="mt-12 divide-y divide-[#d8cbbd] border-y border-[#d8cbbd]">
            {services.slice(0, 6).map((service, index) => (
              <article
                key={service.id}
                className="grid gap-4 py-7 md:grid-cols-[50px_1fr_1.3fr_auto] md:items-start"
              >
                <span className="font-mono text-xs text-[#88796e]">0{index + 1}</span>
                <h3 className="font-serif text-2xl">{service.title}</h3>
                <p className="text-sm leading-7 text-[#62564d]">{service.summary}</p>
                {service.isSample && <span className="sample-label">Sample scope</span>}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Published services will appear here.</p>
        )}
        <Link className="text-link mt-8 inline-flex" href="/services">
          Explore services ↗
        </Link>
      </section>

      <section className="bg-[#211b17] text-[#fbf8f1]">
        <div className="section-shell">
          <p className="eyebrow !text-[#c9aa90]">How we work</p>
          <h2 className="section-title mt-3 max-w-3xl">
            A clear path from first conversation to finished space
          </h2>
          <div className="mt-12 grid gap-px bg-white/15 md:grid-cols-4">
            {process.map(([number, title, copy]) => (
              <article key={number} className="bg-[#211b17] p-7">
                <span className="font-mono text-xs text-[#a9917f]">{number}</span>
                <h3 className="mt-8 font-serif text-2xl">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/65">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section-shell">
          <p className="eyebrow">Client perspective</p>
          <blockquote className="mt-5 max-w-4xl font-serif text-4xl leading-tight">
            “{testimonials[0].quote}”
          </blockquote>
          <p className="mt-6 text-xs uppercase tracking-[0.12em] text-[#77695e]">
            {testimonials[0].clientLabel}
          </p>
        </section>
      )}

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Design journal</p>
            <h2 className="section-title mt-3">Ideas for more considered living</h2>
          </div>
          <Link className="text-link" href="/journal">
            Read the journal ↗
          </Link>
        </div>
        <div className="grid gap-7 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              className="group border-t border-[#d8cbbd] pt-5"
            >
              <div className="relative min-h-[300px] overflow-hidden bg-[#e7ddd1]">
                <MediaImage
                  media={article.coverImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                {article.isSample && <span className="sample-badge">Sample article</span>}
              </div>
              <p className="eyebrow mt-5">{article.category ?? 'Design insight'}</p>
              <h3 className="mt-2 font-serif text-3xl">{article.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#62564d]">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1120px] bg-[#211b17] p-8 text-[#fbf8f1] sm:p-14 lg:p-20">
          <p className="eyebrow !text-[#c9aa90]">Request a consultation</p>
          <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] sm:text-6xl">
            Tell us about the space you want to create.
          </h2>
          <p className="mt-6 max-w-2xl leading-8 text-white/65">
            Share your property, priorities and timeline. The contact form clearly marks all
            required information.
          </p>
          <Link href="/contact" className="btn-light mt-9 inline-flex">
            Begin your enquiry ↗
          </Link>
        </div>
      </section>
    </main>
  )
}
