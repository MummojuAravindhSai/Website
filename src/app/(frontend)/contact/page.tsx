import { getWebsiteSettings } from '@/lib/content'
import { ConsultationForm } from '../components/consultation-form'

export const dynamic = 'force-static'

export default async function ContactPage() {
  const settings = await getWebsiteSettings()
  return (
    <main className="pt-[78px]">
      <section className="section-shell page-hero">
        <p className="eyebrow">Request a consultation</p>
        <h1 className="page-title">Begin with your space, priorities and timeline.</h1>
        <p className="page-intro">
          This form creates a private enquiry in the studio admin. It does not send email or
          WhatsApp messages unless those integrations are configured later.
        </p>
      </section>
      <section className="section-shell grid gap-14 pt-0 lg:grid-cols-[.65fr_1.35fr]">
        <aside className="border-t border-[#d8cbbd] pt-5">
          <p className="eyebrow">Studio contact</p>
          <dl className="mt-6 space-y-6 text-sm">
            <div>
              <dt className="text-[#88796e]">Location</dt>
              <dd className="mt-1">{settings.primaryCity ?? 'Hyderabad, Telangana'}</dd>
            </div>
            <div>
              <dt className="text-[#88796e]">Mobile</dt>
              <dd className="mt-1">{settings.mobile ?? '[+91 mobile number]'}</dd>
            </div>
            <div>
              <dt className="text-[#88796e]">Email</dt>
              <dd className="mt-1">{settings.email ?? '[Verified email pending]'}</dd>
            </div>
          </dl>
          <p className="mt-8 text-sm leading-7 text-[#62564d]">
            {settings.consultationNote ?? 'Consultation process pending verification.'}
          </p>
        </aside>
        <ConsultationForm />
      </section>
    </main>
  )
}
