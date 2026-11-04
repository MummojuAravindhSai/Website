import Link from 'next/link'
import type { WebsiteSetting } from '@/payload-types'

export function SiteFooter({ settings }: { settings: WebsiteSetting }) {
  return (
    <footer className="bg-[#eee6dc] px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="eyebrow">Hyderabad interior design</p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-[1.08]">
            Thoughtful interiors for the way life is lived.
          </h2>
          <Link className="text-link mt-8 inline-flex" href="/contact">
            Start a conversation ↗
          </Link>
        </div>
        <div className="text-sm leading-7 text-[#62564d]">
          <p className="eyebrow mb-3">Studio</p>
          <p>{settings.primaryCity ?? 'Hyderabad, Telangana'}</p>
          <p>{settings.address ?? '[Verified address pending]'}</p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-[#62564d]">
          <p className="eyebrow mb-3">Explore</p>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/journal">Journal</Link>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-[#62564d]">
          <p className="eyebrow mb-3">Contact</p>
          <span>{settings.mobile ?? '[+91 mobile number]'}</span>
          <span>{settings.email ?? '[Verified email pending]'}</span>
          <Link href="/admin" className="mt-4 text-[10px] uppercase tracking-[0.1em]">
            Studio administration
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1400px] flex-wrap justify-between gap-3 border-t border-[#bcae9f] pt-6 text-[9px] uppercase tracking-[0.12em] text-[#7b6d62]">
        <span>
          © {new Date().getFullYear()} {settings.studioName ?? '[Studio Name]'}
        </span>
        <span>All business details shown in brackets require verification</span>
      </div>
    </footer>
  )
}
