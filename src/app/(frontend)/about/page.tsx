import Image from 'next/image'

export const dynamic = 'force-static'

export default function AboutPage() {
  return (
    <main className="pt-[78px]">
      <section className="section-shell page-hero">
        <p className="eyebrow">About the studio</p>
        <h1 className="page-title">A Hyderabad interior practice built around listening.</h1>
        <p className="page-intro">
          This page intentionally uses placeholder studio information until the business supplies a
          verified story, team, credentials and awards.
        </p>
      </section>
      <section className="section-shell grid gap-12 pt-0 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div className="relative min-h-[600px] overflow-hidden bg-[#e7ddd1]">
          <Image
            src="/assets/88d84.png"
            alt="Sample material-focused interior image"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          <span className="sample-badge">Sample image</span>
        </div>
        <div>
          <p className="eyebrow">Studio philosophy</p>
          <h2 className="section-title mt-4">
            Spaces that support real routines and lasting memories.
          </h2>
          <p className="mt-6 leading-8 text-[#62564d]">
            Our working approach begins with how people use a home: where mornings start, how guests
            gather, what needs to be stored and which rooms should feel quiet. The visual language
            follows from that understanding.
          </p>
          <p className="mt-4 leading-8 text-[#62564d]">
            Team biographies, years in practice, registrations, awards and completed-project
            statistics are hidden until verified information is provided.
          </p>
        </div>
      </section>
      <section className="bg-[#eee6dc]">
        <div className="section-shell grid gap-8 md:grid-cols-3">
          {[
            [
              'Context',
              'Design decisions respond to the property, Hyderabad climate and the household’s daily patterns.',
            ],
            [
              'Craft',
              'Natural materials and custom details are selected for touch, durability and graceful ageing.',
            ],
            [
              'Clarity',
              'Each stage is documented so design intent, investment and execution remain aligned.',
            ],
          ].map(([title, copy]) => (
            <article key={title} className="border-t border-[#bcae9f] pt-5">
              <h3 className="font-serif text-3xl">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#62564d]">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
