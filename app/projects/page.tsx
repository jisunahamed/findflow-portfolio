export const dynamic = "force-dynamic";

import ProjectsShowcase from "@/components/ProjectsShowcase";
import { getSiteContent } from "@/lib/site-content";

export default async function ProjectsPage() {
  const siteContent = await getSiteContent();

  return (
    <main>
      <ProjectsShowcase
        showFilters
        contactHref="go-home:contact"
        ctaLabel={siteContent.whatWeBuild.ctaLabel}
        eyebrow={siteContent.whatWeBuild.allProjectsEyebrow}
        title={siteContent.whatWeBuild.allProjectsTitle}
      />
    </main>
  );
}

