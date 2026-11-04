import Link from 'next/link'
import { getServices } from '@/lib/content'

export const dynamic = 'force-static'

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <main className="pt-[78px]">
      <section className="section-shell page-hero">
        <p className="eyebrow">Interior design services</p>
        <h1 className="page-title">A considered service, configured around your property.</h1>
        <p className="page-intro">
          The services below are sample offerings in the CMS. Disable anything the studio does not
          provide before launch.
        </p>
      </section>
      <section className="section-shell pt-0">
        {services.length === 0 ? (
          <p className="empty-state">No services are currently published.</p>
        ) : (
          <div className="divide-y divide-[#d8cbbd] border-y border-[#d8cbbd]">
            {services.map((service, index) => (
              <article key={service.id} className="grid gap-5 py-9 lg:grid-cols-[70px_1fr_1.2fr]">
                <span className="font-mono text-xs text-[#88796e]">0{index + 1}</span>
                <div>
                  <h2 className="font-serif text-3xl">{service.title}</h2>
                  {service.isSample && (
                    <span className="sample-label mt-3 inline-flex">Sample service</span>
                  )}
                </div>
                <div>
                  <p className="leading-7 text-[#62564d]">{service.summary}</p>
                  {service.deliverables && (
                    <p className="mt-4 text-sm leading-7 text-[#88796e]">{service.deliverables}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        <Link className="btn-dark mt-10 inline-flex" href="/contact">
          Discuss your project ↗
        </Link>
      </section>
    </main>
  )
}
