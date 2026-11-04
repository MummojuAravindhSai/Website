'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Project } from '@/payload-types'
import { MediaImage } from './media-image'

const typeLabels: Record<string, string> = {
  'full-home': 'Full-home',
  apartment: 'Apartment',
  villa: 'Villa',
  kitchen: 'Kitchen',
  bedroom: 'Bedrooms',
  'living-dining': 'Living & dining',
  renovation: 'Renovation',
  commercial: 'Commercial',
}

export function ProjectBrowser({
  projects,
  directory = false,
}: {
  projects: Project[]
  directory?: boolean
}) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? '')

  const filters = useMemo(
    () => ['all', ...Array.from(new Set(projects.map((project) => project.projectType)))],
    [projects],
  )
  const visible = projects.filter((project) => {
    const matchesFilter = filter === 'all' || project.projectType === filter
    const haystack = `${project.title} ${project.location ?? ''} ${project.summary}`.toLowerCase()
    return matchesFilter && haystack.includes(query.trim().toLowerCase())
  })
  const selected = visible.find((project) => project.slug === selectedSlug) ?? visible[0] ?? null

  if (projects.length === 0) {
    return (
      <div className="border border-[#d8cbbd] bg-[#f3ece3] p-10">
        <p className="eyebrow">Portfolio empty</p>
        <h3 className="mt-3 font-serif text-3xl">Published projects will appear here.</h3>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 border-y border-[#d8cbbd] py-4 lg:flex-row lg:items-center">
        <div className="flex max-w-full gap-5 overflow-x-auto">
          {filters.map((item) => (
            <button
              type="button"
              key={item}
              className={`whitespace-nowrap border-b py-2 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                filter === item
                  ? 'border-[#9d4b2c] text-[#211b17]'
                  : 'border-transparent text-[#88796e]'
              }`}
              onClick={() => {
                setFilter(item)
                const next = projects.find(
                  (project) => item === 'all' || project.projectType === item,
                )
                if (next) setSelectedSlug(next.slug)
              }}
            >
              {item === 'all' ? 'All projects' : (typeLabels[item] ?? item)}
            </button>
          ))}
        </div>
        {directory && (
          <label className="flex min-w-[240px] items-center gap-3 border-b border-[#bcae9f] py-2">
            <span className="sr-only">Search projects</span>
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#998b80]"
            />
          </label>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-[#f3ece3] px-6 py-16 text-center">
          <p className="eyebrow">No results</p>
          <h3 className="mt-3 font-serif text-3xl">Try another project type or search term.</h3>
          <button
            type="button"
            className="text-link mt-6"
            onClick={() => {
              setFilter('all')
              setQuery('')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : selected ? (
        <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
          <aside className="flex gap-2 overflow-x-auto lg:block" aria-label="Project selection">
            {visible.map((project, index) => (
              <button
                type="button"
                key={project.id}
                aria-pressed={selected.slug === project.slug}
                onClick={() => setSelectedSlug(project.slug)}
                className={`grid min-w-[230px] grid-cols-[26px_1fr_16px] items-center gap-3 border-y border-[#d8cbbd] px-4 py-5 text-left transition lg:w-full lg:min-w-0 ${
                  selected.slug === project.slug
                    ? 'bg-[#eee6dc] text-[#211b17]'
                    : 'text-[#88796e] hover:bg-[#f3ece3]'
                }`}
              >
                <span className="font-mono text-[10px]">0{index + 1}</span>
                <span>
                  <strong className="block font-serif text-lg font-medium">{project.title}</strong>
                  <small className="mt-1 block text-[8px] uppercase tracking-[0.1em]">
                    {project.location || 'Location pending'}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </aside>
          <article key={selected.id} className="animate-[reveal_.35s_ease-out]">
            <div className="grid gap-7 xl:grid-cols-[1.7fr_.8fr] xl:items-center">
              <div className="relative min-h-[420px] overflow-hidden bg-[#e7ddd1] sm:min-h-[560px]">
                <MediaImage
                  media={selected.coverImage}
                  sizes="(max-width: 1280px) 100vw, 65vw"
                  className="object-cover transition duration-700 hover:scale-[1.025]"
                />
                {selected.isSample && <span className="sample-badge">Sample project</span>}
              </div>
              <div>
                <p className="eyebrow">{typeLabels[selected.projectType]}</p>
                <h3 className="mt-4 font-serif text-4xl leading-tight">{selected.title}</h3>
                <p className="mt-5 text-sm leading-7 text-[#62564d]">{selected.summary}</p>
                {selected.scope && (
                  <p className="mt-6 border-y border-[#d8cbbd] py-4 text-xs text-[#7b6d62]">
                    {selected.scope}
                  </p>
                )}
                <Link className="text-link mt-6 inline-flex" href={`/projects/${selected.slug}`}>
                  View project details ↗
                </Link>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  )
}
