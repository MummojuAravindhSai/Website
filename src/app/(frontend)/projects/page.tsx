import { getProjects } from '@/lib/content'
import { ProjectBrowser } from '../components/project-browser'

export const dynamic = 'force-static'

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <main className="pt-[78px]">
      <section className="section-shell page-hero">
        <p className="eyebrow">Portfolio</p>
        <h1 className="page-title">Interiors designed for Hyderabad life.</h1>
        <p className="page-intro">
          All current project entries are clearly marked samples. Replace them with verified project
          photography and metadata in the admin before launch.
        </p>
      </section>
      <section className="section-shell pt-0">
        <ProjectBrowser projects={projects} directory />
      </section>
    </main>
  )
}
