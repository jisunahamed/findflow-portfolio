import seedProjects from "@/data/projects-seed.json";
import { hasSupabaseServerAccess, supabaseRestRequest } from "@/lib/supabase-rest";

export type Project = {
  id: string;
  order: number;
  title: string;
  status: string;
  category: string;
  featured: boolean;
  tags: string[];
  imageUrl: string;
  imageUrls: string[];
  description: string;
  fullDescription: string;
  projectLink: string;
  projectLinks: string[];
  youtubeUrl: string;
};

type ProjectRecord = {
  id: string;
  order: number;
  title: string;
  status: string;
  category: string;
  featured: boolean;
  tags: string[] | null;
  image_url: string | null;
  image_urls: string[] | null;
  description: string | null;
  full_description: string | null;
  project_link: string | null;
  project_links?: string[] | null;
  youtube_url: string | null;
};

const DESCRIPTION_OVERRIDES: Record<string, string> = {
  "AI-Powered Lead Generation & Outreach Engine":
    "This system was built as a full lead intelligence and outreach engine that connects backend automation with a usable operational dashboard. Behind the scenes, the workflow handles large-scale prospect collection from LinkedIn, Google Search, and Indeed, then moves leads through qualification, enrichment, routing, and outreach stages with clear control points for the team. On the frontend side, the dashboard gives operators one place to launch scrapes, review lead streams, monitor workflow progress, and manage handoff without needing to touch the underlying automation logic. The result is a scalable outbound operation that reduces manual research, improves speed to lead, and keeps the entire prospecting pipeline visible from collection to action.",
  "AI Knowledge Workspace":
    "This project was created as a multi-tenant AI knowledge environment where teams can interact with documents, internal knowledge, and operational context through a GPT-style interface. It combines a custom Open WebUI experience with n8n workflows, Docker-based deployment, and Weaviate-powered retrieval so users can upload knowledge sources, search across them semantically, and receive grounded responses with conversation memory. The workspace was designed for real operational use, not just chat demos, which is why it includes document ingestion pipelines, tenant separation, monitoring, and fallback notification flows for low-confidence answers. In practice, it works as a central AI workspace for teams that need faster access to trusted company knowledge without losing structure or control.",
  "Real Estate AI Operations Website":
    "This website was designed to present a real-estate AI operations offer in a way that feels credible, modern, and commercially clear for buyers. Instead of only listing services, the experience frames how automated lead response, CRM follow-up, property viewing coordination, and reporting can work together as one operational system. The project demonstrates frontend execution, messaging strategy, and the ability to translate technical automation capabilities into a polished business-facing web experience that is easy for property businesses to understand. It serves both as a marketing asset and as proof that complex workflow automation can be packaged into a sharp, conversion-oriented digital product.",
};

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function normalizeProject(project: Project) {
  const fullDescription = DESCRIPTION_OVERRIDES[project.title] || project.fullDescription || project.description;
  const projectLinks = Array.isArray(project.projectLinks)
    ? project.projectLinks.filter(Boolean)
    : project.projectLink
      ? [project.projectLink]
      : [];
  const imageUrls = Array.isArray(project.imageUrls) ? project.imageUrls.filter(Boolean) : [];
  const imageUrl = project.imageUrl || imageUrls[0] || "";

  return {
    ...project,
    status: project.status || "published",
    category: project.category || "others",
    featured: Boolean(project.featured),
    tags: Array.isArray(project.tags) ? project.tags.filter(Boolean) : [],
    imageUrl,
    imageUrls: imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [],
    description: project.description || fullDescription,
    fullDescription,
    projectLink: projectLinks[0] || project.projectLink || "",
    projectLinks,
    youtubeUrl: project.youtubeUrl || "",
  };
}

function mapRecordToProject(record: ProjectRecord): Project {
  return normalizeProject({
    id: record.id,
    order: record.order ?? 999,
    title: record.title,
    status: record.status ?? "published",
    category: record.category ?? "others",
    featured: Boolean(record.featured),
    tags: record.tags ?? [],
    imageUrl: record.image_url ?? "",
    imageUrls: Array.isArray(record.image_urls) ? record.image_urls : [],
    description: record.description ?? "",
    fullDescription: record.full_description ?? "",
    projectLink: record.project_link ?? "",
    projectLinks: Array.isArray(record.project_links)
      ? record.project_links
      : record.project_link
        ? [record.project_link]
        : [],
    youtubeUrl: record.youtube_url ?? "",
  });
}

function mapProjectToRecord(project: Project, includeProjectLinks = true) {
  const normalized = normalizeProject(project);
  const record: ProjectRecord = {
    id: normalized.id,
    order: normalized.order,
    title: normalized.title,
    status: normalized.status,
    category: normalized.category,
    featured: normalized.featured,
    tags: normalized.tags,
    image_url: normalized.imageUrl,
    image_urls: normalized.imageUrls,
    description: normalized.description,
    full_description: normalized.fullDescription,
    project_link: normalized.projectLink,
    youtube_url: normalized.youtubeUrl,
  };

  if (includeProjectLinks) {
    record.project_links = normalized.projectLinks;
  }

  return record;
}

function getSeedProjects() {
  return sortProjects((seedProjects as Project[]).map(normalizeProject));
}

async function fetchProjectsWithSelect(selectClause: string, status?: string) {
  const filters = status ? `&status=eq.${status}` : "";
  const response = await supabaseRestRequest(`/projects?select=${selectClause}${filters}&order=order.asc`, {}, true);

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`Project query failed with ${response.status}: ${details}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const rows = (await response.json()) as ProjectRecord[];
  return rows.map(mapRecordToProject);
}

async function fetchProjectsFromSupabase(status?: string) {
  try {
    return await fetchProjectsWithSelect(
      "id,order,title,status,category,featured,tags,image_url,image_urls,description,full_description,project_link,project_links,youtube_url",
      status,
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("project_links")) {
      return fetchProjectsWithSelect(
        "id,order,title,status,category,featured,tags,image_url,image_urls,description,full_description,project_link,youtube_url",
        status,
      );
    }

    throw error;
  }
}

export async function getPublishedProjects() {
  if (!hasSupabaseServerAccess()) {
    return getSeedProjects().filter((project) => project.status === "published");
  }

  try {
    const projects = await fetchProjectsFromSupabase("published");
    return projects.length ? projects : getSeedProjects().filter((project) => project.status === "published");
  } catch (error) {
    console.error(error);
    return getSeedProjects().filter((project) => project.status === "published");
  }
}

export async function getAllProjects() {
  if (!hasSupabaseServerAccess()) {
    return getSeedProjects();
  }

  try {
    const projects = await fetchProjectsFromSupabase();
    return projects.length ? projects : getSeedProjects();
  } catch (error) {
    console.error(error);
    return getSeedProjects();
  }
}

async function saveProjectRecord(record: ProjectRecord) {
  const response = await supabaseRestRequest(
    "/projects",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([record]),
    },
    true,
  );

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`Failed to save project with ${response.status}: ${details}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const [saved] = (await response.json()) as ProjectRecord[];
  return mapRecordToProject(saved);
}

export async function saveProject(project: Project) {
  try {
    return await saveProjectRecord(mapProjectToRecord(project, true));
  } catch (error) {
    if (error instanceof Error && error.message.includes("project_links")) {
      return saveProjectRecord(mapProjectToRecord(project, false));
    }

    throw error;
  }
}

export async function deleteProject(id: string) {
  const response = await supabaseRestRequest(
    `/projects?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
    true,
  );

  if (!response.ok) {
    throw new Error(`Failed to delete project with ${response.status}`);
  }
}

export async function seedProjectsIntoSupabase() {
  try {
    const response = await supabaseRestRequest(
      "/projects",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(getSeedProjects().map((project) => mapProjectToRecord(project, true))),
      },
      true,
    );

    if (!response.ok) {
      const details = await response.text();
      if (details.includes("project_links")) {
        throw new Error("PROJECT_LINKS_UNSUPPORTED");
      }
      throw new Error(`Failed to seed projects with ${response.status}: ${details}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("PROJECT_LINKS_UNSUPPORTED")) {
      const fallbackResponse = await supabaseRestRequest(
        "/projects",
        {
          method: "POST",
          headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(getSeedProjects().map((project) => mapProjectToRecord(project, false))),
        },
        true,
      );

      if (!fallbackResponse.ok) {
        throw new Error(`Failed to seed projects with ${fallbackResponse.status}`);
      }

      return fallbackResponse.json();
    }

    throw error;
  }
}
