import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findBySlug } from '@/lib/payload'
import { getProjects } from '@/lib/content'
import { MediaImage } from '../../components/media-image'

export const dynamicParams = false

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export default async function ProjectDetailPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params
  const project = await findBySlug('projects', slug, { depth: 2 })
  if (!project) notFound()
  const related = (await getProjects()).filter((item) => item.slug !== project.slug).slice(0, 2)

  return (
    <main className="pt-[78px]">
      <section className="section-shell page-hero pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">{project.projectType.replaceAll('-', ' ')}</p>
          {project.isSample && <span className="sample-label">Sample project</span>}
        </div>
        <h1 className="page-title">{project.title}</h1>
        <p className="page-intro">{project.summary}</p>
      </section>
      <section className="section-shell pt-0">
        <div className="relative min-h-[560px] overflow-hidden bg-[#e7ddd1] sm:min-h-[760px]">
          <MediaImage media={project.coverImage} priority sizes="100vw" className="object-cover" />
        </div>
        <div className="grid gap-10 border-b border-[#d8cbbd] py-10 md:grid-cols-3">
          <div>
            <p className="eyebrow">Location</p>
            <p className="mt-3">{project.location || 'Not supplied'}</p>
          </div>
          <div>
            <p className="eyebrow">Scope</p>
            <p className="mt-3">{project.scope || 'Not supplied'}</p>
          </div>
          <div>
            <p className="eyebrow">Materials</p>
            <p className="mt-3">
              {project.materials?.map((item) => item.material).join(' · ') || 'Not supplied'}
            </p>
          </div>
        </div>
      </section>
      {project.designApproach && (
        <section className="section-shell grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <p className="eyebrow">Design approach</p>
          <p className="font-serif text-3xl leading-[1.35]">{project.designApproach}</p>
        </section>
      )}
      {project.gallery && project.gallery.length > 0 && (
        <section className="section-shell pt-0">
          <div className="grid gap-5 md:grid-cols-2">
            {project.gallery.map((item, index) => (
              <figure key={item.id ?? index} className={index === 0 ? 'md:col-span-2' : ''}>
                <div
                  className={`relative overflow-hidden bg-[#e7ddd1] ${index === 0 ? 'min-h-[650px]' : 'min-h-[440px]'}`}
                >
                  <MediaImage
                    media={item.image}
                    sizes={index === 0 ? '100vw' : '50vw'}
                    className="object-cover"
                  />
                </div>
                {item.caption && (
                  <figcaption className="mt-2 text-xs text-[#77695e]">{item.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="bg-[#eee6dc]">
          <div className="section-shell">
            <p className="eyebrow">Related projects</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <Link href={`/projects/${item.slug}`} key={item.id} className="group">
                  <div className="relative min-h-[360px] overflow-hidden bg-[#ded2c5]">
                    <MediaImage
                      media={item.coverImage}
                      sizes="50vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-3xl">{item.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
