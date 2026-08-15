"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";

const projectFilters = [
  { label: "All", value: "All" },
  { label: "AI Automation", value: "ai-automation" },
  { label: "Vibe Project", value: "vibe-project" },
  { label: "Web", value: "web" },
  { label: "Others", value: "others" },
];

function formatCategory(category: string) {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function truncateDescription(description: string) {
  if (description.length <= 160) {
    return description;
  }

  return description.slice(0, 157).trimEnd() + "...";
}

function getPrimaryLine(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find(Boolean) ?? "";
}

function getYoutubeThumbnail(url: string) {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.split("/").filter(Boolean)[0]
      : parsed.searchParams.get("v");

    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  } catch {
    return "";
  }
}

type ProjectsShowcaseProps = {
  id?: string;
  limit?: number;
  showFilters?: boolean;
  showViewAll?: boolean;
  contactHref?: string;
  ctaLabel?: string;
  eyebrow?: string;
  title?: string;
};

export default function ProjectsShowcase({
  id = "case-studies",
  limit,
  showFilters = true,
  showViewAll = false,
  contactHref = "scroll:contact",
  ctaLabel = "Plan Your Project",
  eyebrow = "/WHAT WE BUILD",
  title = "From the first workflow map to production software, one team owns the delivery path.",
}: ProjectsShowcaseProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("All");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeProjectImageIndex, setActiveProjectImageIndex] = useState(0);

  const filteredProjects = useMemo(() => {
    const scopedProjects =
      selectedProjectFilter === "All"
        ? projects
        : projects.filter((project) => project.category === selectedProjectFilter);

    if (typeof limit === "number") {
      return scopedProjects.slice(0, limit);
    }

    return scopedProjects;
  }, [limit, projects, selectedProjectFilter]);

  const currentProjectImages = useMemo(() => {
    if (!activeProject) {
      return [] as string[];
    }

    if (activeProject.imageUrls?.length) {
      return activeProject.imageUrls;
    }

    return activeProject.imageUrl ? [activeProject.imageUrl] : [];
  }, [activeProject]);

  const currentProjectImage = currentProjectImages[activeProjectImageIndex] ?? "";
  const activeProjectVideoThumbnail = useMemo(
    () => {
      const primaryYoutubeUrl = activeProject?.youtubeUrl ? getPrimaryLine(activeProject.youtubeUrl) : "";
      return primaryYoutubeUrl ? getYoutubeThumbnail(primaryYoutubeUrl) : "";
    },
    [activeProject],
  );

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Project data request failed with ${response.status}`);
        }

        const data: { projects?: Project[]; error?: boolean } = await response.json();
        if (data.error) {
          throw new Error("Project data fetch failed");
        }

        if (active) {
          setProjects(data.projects ?? []);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setProjects([]);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  function openProject(project: Project) {
    setActiveProject(project);
    setActiveProjectImageIndex(0);
  }

  function handleContactClick(event: MouseEvent<HTMLAnchorElement>) {
    if (contactHref.startsWith("scroll:")) {
      event.preventDefault();
      const target = contactHref.replace("scroll:", "");
      const element = document.getElementById(target);
      if (!element) {
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState({}, "", "/");
      return;
    }

    if (contactHref.startsWith("go-home:")) {
      event.preventDefault();
      const target = contactHref.replace("go-home:", "");
      window.sessionStorage.setItem("findflow-scroll-target", target);
      window.location.href = "/";
    }
  }

  function showPreviousProjectImage() {
    setActiveProjectImageIndex((currentIndex) => {
      if (!currentProjectImages.length) {
        return 0;
      }

      return currentIndex === 0 ? currentProjectImages.length - 1 : currentIndex - 1;
    });
  }

  function showNextProjectImage() {
    setActiveProjectImageIndex((currentIndex) => {
      if (!currentProjectImages.length) {
        return 0;
      }

      return currentIndex === currentProjectImages.length - 1 ? 0 : currentIndex + 1;
    });
  }

  return (
    <>
      <section className="case-section" id={id}>
        <div className="case-inner">
          <p className="eyebrow eyebrow--light reveal">{eyebrow}</p>
          <div className="case-intro reveal">
            <h2>{title}</h2>
            <a className="button button--outline" href="/" onClick={handleContactClick}>
              {ctaLabel} <span>-&gt;</span>
            </a>
          </div>
          {showFilters ? (
            <div className="case-filters tags reveal" role="group" aria-label="Filter projects by category">
              {projectFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={selectedProjectFilter === filter.value ? "button button--primary case-filter" : "button button--outline case-filter"}
                  type="button"
                  onClick={() => setSelectedProjectFilter(filter.value)}
                  aria-pressed={selectedProjectFilter === filter.value}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="case-grid" id="more-work">
            {filteredProjects.map((project) => (
              <article className="case-card reveal" key={project.id || project.title}>
                <button className="case-card__trigger" type="button" onClick={() => openProject(project)} aria-label={`Open ${project.title}`}>
                  {project.imageUrl ? (
                    <div className="case-image">
                      <img src={project.imageUrl} alt={project.title} loading="lazy" />
                      {project.imageUrls?.length > 1 ? (
                        <span className="case-image__count">{project.imageUrls.length} images</span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="case-card__body">
                    <div className="case-card__header">
                      {project.category ? (
                        <div className="tags case-card__category">
                          <span>{formatCategory(project.category)}</span>
                        </div>
                      ) : <span />}
                      {project.featured ? <span className="case-card__featured">Featured</span> : null}
                    </div>
                    <h3>{project.title}</h3>
                    <p className="case-card__description">{truncateDescription(project.description)}</p>
                    {project.tags.length ? (
                      <div className="tags case-card__tags">
                        {project.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </button>
                <div className="case-card__footer">
                  <button className="button button--outline case-card__action" type="button" onClick={() => openProject(project)}>
                    View Project
                  </button>
                  {project.projectLink ? (
                    <a className="button button--outline case-card__action" href={project.projectLink} target="_blank" rel="noreferrer">
                      Visit Live
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          {showViewAll ? (
            <div className="case-view-all reveal">
              <Link className="button button--outline" href="/projects">
                View all projects
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {activeProject ? (
        <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" onClick={() => setActiveProject(null)}>
          <div className="project-modal__panel" onClick={(event) => event.stopPropagation()}>
            <button className="project-modal__close" type="button" aria-label="Close project details" onClick={() => setActiveProject(null)}>
              x
            </button>
            {currentProjectImage ? (
              <div className="project-modal__hero">
                <img src={currentProjectImage} alt={activeProject.title} loading="lazy" />
                {currentProjectImages.length > 1 ? (
                  <>
                    <button className="project-modal__nav project-modal__nav--prev" type="button" aria-label="Show previous project image" onClick={showPreviousProjectImage}>
                      &lt;
                    </button>
                    <button className="project-modal__nav project-modal__nav--next" type="button" aria-label="Show next project image" onClick={showNextProjectImage}>
                      &gt;
                    </button>
                    <span className="project-modal__count">{activeProjectImageIndex + 1}/{currentProjectImages.length}</span>
                  </>
                ) : null}
              </div>
            ) : null}
            <div className="project-modal__content">
              <div className="project-modal__meta-row">
                {activeProject.category ? (
                  <div className="tags case-card__category">
                    <span>{formatCategory(activeProject.category)}</span>
                  </div>
                ) : null}
                {activeProject.featured ? <span className="project-modal__featured">Featured</span> : null}
              </div>
              <h3 id="project-modal-title">{activeProject.title}</h3>
              {activeProject.tags.length ? (
                <div className="tags case-card__tags">
                  {activeProject.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
              {getPrimaryLine(activeProject.youtubeUrl) && activeProjectVideoThumbnail ? (
                <a className="project-modal__video" href={getPrimaryLine(activeProject.youtubeUrl)} target="_blank" rel="noreferrer">
                  <img src={activeProjectVideoThumbnail} alt={`${activeProject.title} YouTube demo preview`} loading="lazy" />
                  <span className="project-modal__play">Play</span>
                  <span className="project-modal__watch">Watch on YouTube</span>
                </a>
              ) : null}
              <div className="project-modal__copy">
                <p>{activeProject.fullDescription || activeProject.description}</p>
              </div>
              {activeProject.projectLink || getPrimaryLine(activeProject.youtubeUrl) ? (
                <div className="project-modal__actions">
                  {activeProject.projectLink ? (
                    <a className="button button--outline case-card__action" href={activeProject.projectLink} target="_blank" rel="noreferrer">
                      Visit Project
                    </a>
                  ) : null}
                  {getPrimaryLine(activeProject.youtubeUrl) ? (
                    <a className="button button--outline case-card__action" href={getPrimaryLine(activeProject.youtubeUrl)} target="_blank" rel="noreferrer">
                      Watch Demo
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
