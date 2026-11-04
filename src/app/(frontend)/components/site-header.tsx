'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/about', label: 'Studio' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/journal', label: 'Journal' },
]

export function SiteHeader({ studioName, city }: { studioName: string; city: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#6a594d]/10 bg-[#fbf8f1]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1400px] items-center gap-8 px-5 sm:px-8">
        <Link href="/" className="mr-auto leading-none" onClick={() => setOpen(false)}>
          <span className="font-serif text-[22px] font-medium tracking-[0.08em]">{studioName}</span>
          <span className="mt-1.5 block text-[8px] font-semibold uppercase tracking-[0.16em] text-[#6b584b]">
            Interior design studio
          </span>
        </Link>
        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.14em] text-[#88796e] lg:block">
          {city}
        </span>
        <nav
          aria-label="Primary navigation"
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-[78px] flex-col border-b border-[#d8cbbd] bg-[#fbf8f1] px-5 py-6 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`border-b border-[#d8cbbd] py-3 font-serif text-2xl md:border-0 md:px-3 md:py-2 md:font-sans md:text-[10px] md:font-medium md:uppercase md:tracking-[0.1em] ${
                pathname.startsWith(link.href) ? 'text-[#9d4b2c]' : 'text-[#302822]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="hidden bg-[#eee6dc] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] transition hover:-translate-y-0.5 sm:block"
        >
          Request consultation
        </Link>
        <button
          type="button"
          className="grid size-10 place-content-center gap-1.5 bg-[#eee6dc] md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="block h-px w-4 bg-[#302822]" />
          <span className="block h-px w-4 bg-[#302822]" />
        </button>
      </div>
    </header>
  )
}
