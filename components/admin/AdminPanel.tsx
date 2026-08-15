"use client";

import { useMemo, useState } from "react";
import type { SiteContent } from "@/lib/default-site-content";
import type { AccessRequestRecord } from "@/lib/admin-auth";
import type { ContactSubmission } from "@/lib/contact-submissions";
import type { Project } from "@/lib/projects";
import type { WebhookSetting } from "@/lib/webhook-settings";

type AdminPanelProps = {
  currentAdminEmail: string;
  initialSiteContent: SiteContent;
  initialProjects: Project[];
  pendingRequests: AccessRequestRecord[];
  initialSubmissions: ContactSubmission[];
  initialWebhooks: WebhookSetting[];
};

type PanelKey =
  | "dashboard"
  | "navigation"
  | "hero"
  | "services"
  | "whatWeBuild"
  | "about"
  | "process"
  | "contact"
  | "faq"
  | "footer"
  | "submissions"
  | "access";

type ProjectManagerView = "active" | "trash";

type ProjectEditorState = Project & {
  tagsText: string;
  imageUrlsText: string;
};

const PANELS: Array<{ key: PanelKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "hero", label: "Home" },
  { key: "services", label: "Services" },
  { key: "whatWeBuild", label: "What We Build" },
  { key: "about", label: "About Us" },
  { key: "process", label: "How We Work" },
  { key: "contact", label: "Plan a Project" },
  { key: "navigation", label: "Navigation" },
  { key: "submissions", label: "Form Fills" },
  { key: "faq", label: "Questions" },
  { key: "footer", label: "Footer" },
  { key: "access", label: "Access" },
];

function cloneContent<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function statusLabel(value: string) {
  return value.replace(/_/g, " ");
}

function sortProjectsForEditor(projects: Project[]) {
  return [...projects].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function formatProjectForEditor(project: Project): ProjectEditorState {
  return {
    ...project,
    imageUrl: project.imageUrl || project.imageUrls[0] || "",
    tagsText: project.tags.join(", "),
    imageUrlsText: project.imageUrls.join("\n"),
    projectLink: project.projectLinks.length ? project.projectLinks.join("\n") : project.projectLink,
  };
}

function parseProjectTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseProjectImageUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function parseProjectLinkUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function organizeProjects(projects: ProjectEditorState[]) {
  const published = projects
    .filter((project) => project.status === "published")
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const hidden = projects
    .filter((project) => project.status !== "published")
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return [...published, ...hidden].map((project, index) => ({
    ...project,
    order: index + 1,
  }));
}

function createEmptyProject(index: number): ProjectEditorState {
  return formatProjectForEditor({
    id: `draft-${crypto.randomUUID()}`,
    order: index + 1,
    title: "",
    status: "published",
    category: "others",
    featured: false,
    tags: [],
    imageUrl: "",
    imageUrls: [],
    description: "",
    fullDescription: "",
    projectLink: "",
    projectLinks: [],
    youtubeUrl: "",
  });
}

function createSingleWebhookDraft(existing?: WebhookSetting): WebhookSetting {
  const now = new Date().toISOString();
  return (
    existing ?? {
      id: `contact-webhook-${Date.now()}`,
      key: "contact-submission",
      label: "Contact Submission Webhook",
      eventType: "contact_submission",
      endpointUrl: "",
      method: "GET",
      enabled: false,
      secretHeader: "",
      notes: "",
      lastTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    }
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="admin-field admin-field--full">
      <span>{label}</span>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function formatProjectPayload(project: ProjectEditorState, fallbackOrder: number): Project {
  const imageUrls = parseProjectImageUrls(project.imageUrlsText);
  const tags = parseProjectTags(project.tagsText);
  const projectLinks = parseProjectLinkUrls(project.projectLink);
  const youtubeUrls = parseProjectLinkUrls(project.youtubeUrl);

  return {
    id: project.id,
    order: Number(project.order) || fallbackOrder,
    title: project.title.trim(),
    status: project.status,
    category: project.category.trim() || "others",
    featured: Boolean(project.featured),
    tags,
    imageUrl: imageUrls[0] || project.imageUrl.trim() || "",
    imageUrls,
    description: project.description.trim(),
    fullDescription: project.fullDescription.trim() || project.description.trim(),
    projectLink: projectLinks[0] || "",
    projectLinks,
    youtubeUrl: youtubeUrls.join("\n"),
  };
}

export default function AdminPanel({
  currentAdminEmail,
  initialSiteContent,
  initialProjects,
  pendingRequests,
  initialSubmissions,
  initialWebhooks,
}: AdminPanelProps) {
  const [activePanel, setActivePanel] = useState<PanelKey>("dashboard");
  const [siteContent, setSiteContent] = useState(() => cloneContent(initialSiteContent));
  const [sectionStatus, setSectionStatus] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState(() =>
    organizeProjects(sortProjectsForEditor(initialProjects).map(formatProjectForEditor)),
  );
  const [projectStatus, setProjectStatus] = useState("");
  const [projectManagerView, setProjectManagerView] = useState<ProjectManagerView>("active");
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [projectTagDrafts, setProjectTagDrafts] = useState<Record<string, string>>({});
  const [projectGalleryUrlDrafts, setProjectGalleryUrlDrafts] = useState<Record<string, string>>({});
  const [projectLinkDrafts, setProjectLinkDrafts] = useState<Record<string, string>>({});
  const [projectYoutubeDrafts, setProjectYoutubeDrafts] = useState<Record<string, string>>({});
  const [projectUploadStatus, setProjectUploadStatus] = useState<Record<string, string>>({});
  const [accessState, setAccessState] = useState(pendingRequests);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [webhook, setWebhook] = useState(() => createSingleWebhookDraft(initialWebhooks[0]));
  const [webhookStatus, setWebhookStatus] = useState("");
  const [projectBusyId, setProjectBusyId] = useState<string | null>(null);
  const [projectBusyAction, setProjectBusyAction] = useState("");
  const [submissionBusyId, setSubmissionBusyId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const published = projects.filter((project) => project.status === "published").length;
    const hidden = projects.filter((project) => project.status !== "published").length;
    const newSubmissions = submissions.filter((submission) => submission.status === "new").length;

    return {
      totalProjects: projects.length,
      publishedProjects: published,
      hiddenProjects: hidden,
      pendingAccess: accessState.length,
      newSubmissions,
    };
  }, [accessState.length, projects, submissions]);

  const visibleProjects = useMemo(
    () =>
      projects.filter((project) =>
        projectManagerView === "active" ? project.status === "published" : project.status !== "published",
      ),
    [projectManagerView, projects],
  );

  const orderedVisibleProjects = useMemo(() => {
    const openDraftProject = openProjectId
      ? visibleProjects.find((project) => project.id === openProjectId && project.id.startsWith("draft-"))
      : null;

    if (!openDraftProject) {
      return visibleProjects;
    }

    return [openDraftProject, ...visibleProjects.filter((project) => project.id !== openDraftProject.id)];
  }, [openProjectId, visibleProjects]);

  function activatePanel(panel: PanelKey) {
    setActivePanel(panel);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function saveSection(key: keyof SiteContent) {
    try {
      setSectionStatus((current) => ({ ...current, [key]: "Saving..." }));
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data: siteContent[key] }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save section");
      }
      setSectionStatus((current) => ({ ...current, [key]: "Saved" }));
    } catch (error) {
      setSectionStatus((current) => ({
        ...current,
        [key]: error instanceof Error ? error.message : "Failed to save section",
      }));
    }
  }

  function updateProject(projectId: string, field: keyof ProjectEditorState, value: string | boolean | number) {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              [field]: value,
            }
          : project,
      ),
    );
  }

  function addProjectTag(projectId: string) {
    const nextTag = (projectTagDrafts[projectId] ?? "").trim().replace(/,+$/g, "");
    if (!nextTag) {
      return;
    }

    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tagsText: Array.from(new Set([...parseProjectTags(project.tagsText), nextTag])).join(", "),
            }
          : project,
      ),
    );
    setProjectTagDrafts((current) => ({ ...current, [projectId]: "" }));
  }

  function removeProjectTag(projectId: string, tagToRemove: string) {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tagsText: parseProjectTags(project.tagsText)
                .filter((tag) => tag !== tagToRemove)
                .join(", "),
            }
          : project,
      ),
    );
  }

  function setProjectLinkCollection(projectId: string, field: "projectLink" | "youtubeUrl", urls: string[]) {
    const normalizedUrls = Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
    updateProject(projectId, field, normalizedUrls.join("\n"));
  }

  function addProjectLink(projectId: string, field: "projectLink" | "youtubeUrl") {
    const draftState = field === "projectLink" ? projectLinkDrafts : projectYoutubeDrafts;
    const setDraftState = field === "projectLink" ? setProjectLinkDrafts : setProjectYoutubeDrafts;
    const nextUrl = (draftState[projectId] ?? "").trim();

    if (!nextUrl) {
      return;
    }

    const project = projects.find((item) => item.id === projectId);
    const currentUrls = project ? parseProjectLinkUrls(project[field]) : [];
    setProjectLinkCollection(projectId, field, [...currentUrls, nextUrl]);
    setDraftState((current) => ({ ...current, [projectId]: "" }));
  }

  function removeProjectLink(projectId: string, field: "projectLink" | "youtubeUrl", urlToRemove: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    setProjectLinkCollection(
      projectId,
      field,
      parseProjectLinkUrls(project[field]).filter((url) => url !== urlToRemove),
    );
  }

  function setProjectImageCollection(projectId: string, imageUrls: string[]) {
    const normalizedUrls = Array.from(new Set(imageUrls.map((url) => url.trim()).filter(Boolean)));
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              imageUrl: normalizedUrls[0] || "",
              imageUrlsText: normalizedUrls.join("\n"),
            }
          : project,
      ),
    );
  }

  function addProjectGalleryUrl(projectId: string) {
    const nextUrl = (projectGalleryUrlDrafts[projectId] ?? "").trim();
    if (!nextUrl) {
      return;
    }

    const project = projects.find((item) => item.id === projectId);
    const currentUrls = project ? parseProjectImageUrls(project.imageUrlsText) : [];
    setProjectImageCollection(projectId, [...currentUrls, nextUrl]);
    setProjectGalleryUrlDrafts((current) => ({ ...current, [projectId]: "" }));
  }

  function removeProjectGalleryUrl(projectId: string, urlToRemove: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    setProjectImageCollection(
      projectId,
      parseProjectImageUrls(project.imageUrlsText).filter((url) => url !== urlToRemove),
    );
  }

  async function uploadProjectImages(projectId: string, files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      setProjectUploadStatus((current) => ({ ...current, [projectId]: "Uploading images..." }));
      const uploadedUrls = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "projects");

        const response = await fetch("/api/admin/project-images", {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Image upload failed");
        }

        uploadedUrls.push(payload.url);
      }

      const project = projects.find((item) => item.id === projectId);
      const currentUrls = project ? parseProjectImageUrls(project.imageUrlsText) : [];
      setProjectImageCollection(projectId, [...currentUrls, ...uploadedUrls]);
      setProjectUploadStatus((current) => ({ ...current, [projectId]: "Images uploaded" }));
    } catch (error) {
      setProjectUploadStatus((current) => ({
        ...current,
        [projectId]: error instanceof Error ? error.message : "Image upload failed",
      }));
    }
  }

  async function persistProjectCollection(nextProjects: ProjectEditorState[], successMessage: string) {
    try {
      setProjectStatus("Saving projects...");
      const organized = organizeProjects(nextProjects);
      const savedProjects: ProjectEditorState[] = [];

      for (let index = 0; index < organized.length; index += 1) {
        const response = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: formatProjectPayload(organized[index], index + 1),
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to save project");
        }

        savedProjects.push(formatProjectForEditor(payload.project));
      }

      const orderedProjects = organizeProjects(savedProjects);
      setProjects(orderedProjects);
      setProjectStatus(successMessage);
    } catch (error) {
      setProjectStatus(error instanceof Error ? error.message : "Failed to save projects");
    }
  }

  async function saveProject(projectId: string) {
    const currentIndex = projects.findIndex((project) => project.id === projectId);
    if (currentIndex === -1) {
      return;
    }

    try {
      setProjectBusyId(projectId);
      setProjectBusyAction("save");
      setProjectStatus("Saving project...");
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: formatProjectPayload(projects[currentIndex], currentIndex + 1),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save project");
      }

      setProjects((current) =>
        organizeProjects(
          current.map((project) => (project.id === projectId ? formatProjectForEditor(payload.project) : project)),
        ),
      );
      setOpenProjectId(payload.project.id);
      setProjectStatus("Project saved");
    } catch (error) {
      setProjectStatus(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setProjectBusyId(null);
      setProjectBusyAction("");
    }
  }

  async function toggleProjectVisibility(projectId: string) {
    const targetProject = projects.find((project) => project.id === projectId);
    if (!targetProject) {
      return;
    }

    const nextProjects = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            status: project.status === "published" ? "hidden" : "published",
          }
        : project,
    );

    setProjectBusyId(projectId);
    setProjectBusyAction(targetProject.status === "published" ? "hide" : "publish");
    try {
      await persistProjectCollection(
        nextProjects,
        targetProject.status === "published" ? "Project moved to trash" : "Project published",
      );
    } finally {
      setProjectBusyId(null);
      setProjectBusyAction("");
    }
  }

  async function deleteProject(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project?.id) {
      return;
    }

    try {
      setProjectBusyId(projectId);
      setProjectBusyAction("delete");
      setProjectStatus("Deleting project...");
      const response = await fetch(`/api/admin/projects?id=${encodeURIComponent(project.id)}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete project");
      }

      const remaining = organizeProjects(projects.filter((item) => item.id !== projectId));
      setProjects(remaining);
      setOpenProjectId((current) => (current === projectId ? null : current));
      setProjectStatus("Project deleted");
    } catch (error) {
      setProjectStatus(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setProjectBusyId(null);
      setProjectBusyAction("");
    }
  }

  async function moveProjectByDrag(sourceProjectId: string, targetProjectId: string) {
    if (!sourceProjectId || sourceProjectId === targetProjectId) {
      return;
    }

    const publishedProjects = projects.filter((project) => project.status === "published");
    const hiddenProjects = projects.filter((project) => project.status !== "published");
    const sourceIndex = publishedProjects.findIndex((project) => project.id === sourceProjectId);
    const targetIndex = publishedProjects.findIndex((project) => project.id === targetProjectId);

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const reorderedPublished = [...publishedProjects];
    const [movedProject] = reorderedPublished.splice(sourceIndex, 1);
    reorderedPublished.splice(targetIndex, 0, movedProject);

    setProjectBusyId(sourceProjectId);
    setProjectBusyAction("move");
    try {
      await persistProjectCollection([...reorderedPublished, ...hiddenProjects], "Project order updated");
    } finally {
      setDraggedProjectId(null);
      setProjectBusyId(null);
      setProjectBusyAction("");
    }
  }

  async function reviewRequest(requestId: string, approve: boolean) {
    try {
      const response = await fetch("/api/admin/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, approve }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to review request");
      }
      setAccessState((current) => current.filter((request) => request.id !== requestId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to review request");
    }
  }

  async function reviewSubmission(id: string) {
    try {
      setSubmissionBusyId(id);
      setSubmissionStatus("Updating form fill...");
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "reviewed" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to review form fill");
      }
      setSubmissions((current) => current.map((item) => (item.id === id ? payload.submission : item)));
      setSubmissionStatus("Form fill updated");
    } catch (error) {
      setSubmissionStatus(error instanceof Error ? error.message : "Failed to review form fill");
    } finally {
      setSubmissionBusyId(null);
    }
  }

  async function deleteSubmission(id: string) {
    try {
      setSubmissionBusyId(id);
      setSubmissionStatus("Deleting form fill...");
      const response = await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete form fill");
      }
      setSubmissions((current) => current.filter((item) => item.id !== id));
      setSubmissionStatus("Form fill deleted");
    } catch (error) {
      setSubmissionStatus(error instanceof Error ? error.message : "Failed to delete form fill");
    } finally {
      setSubmissionBusyId(null);
    }
  }

  async function saveWebhook() {
    try {
      setWebhookStatus("Saving webhook...");
      const response = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhook: {
            ...webhook,
            eventType: "contact_submission",
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save webhook");
      }
      setWebhook({
        ...payload.webhook,
      });
      setWebhookStatus(payload.validationStatus || "Success");
    } catch (error) {
      setWebhookStatus(error instanceof Error ? error.message : "Failed to save webhook");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-shell admin-shell--enhanced">
      <aside className="admin-sidebar admin-sidebar--sticky">
        <div className="admin-sidebar__header">
          <p className="admin-sidebar__eyebrow">FindFlow Control Room</p>
          <p className="admin-sidebar__role">Owner-approved admin session</p>
        </div>

        <nav className="admin-nav">
          {PANELS.map((panel) => (
            <button
              key={panel.key}
              type="button"
              className={activePanel === panel.key ? "admin-nav__item admin-nav__item--active" : "admin-nav__item"}
              onClick={() => activatePanel(panel.key)}
            >
              {panel.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-secondary-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <section className="admin-content admin-content--enhanced">
        {activePanel === "dashboard" ? (
          <div className="admin-dashboard">
            <p className="admin-panel-eyebrow">Dashboard</p>
            <h1>FindFlow Agency Control Room</h1>
            <div className="admin-stats-grid admin-stats-grid--five">
              <article className="admin-stat-card">
                <span>Total Projects</span>
                <strong>{stats.totalProjects}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Homepage Projects</span>
                <strong>{Math.min(stats.publishedProjects, 9)}</strong>
              </article>
              <article className="admin-stat-card">
                <span>View All Projects</span>
                <strong>{Math.max(stats.publishedProjects - 9, 0)}</strong>
              </article>
              <article className="admin-stat-card">
                <span>New Form Fills</span>
                <strong>{stats.newSubmissions}</strong>
              </article>
              <article className="admin-stat-card">
                <span>Pending Access</span>
                <strong>{stats.pendingAccess}</strong>
              </article>
            </div>
            <div className="admin-card admin-note-card">
              <h3>Quick Actions</h3>
              <div className="admin-quick-actions">
                <button type="button" className="admin-primary-button" onClick={() => activatePanel("whatWeBuild")}>
                  Manage What We Build
                </button>
                <button type="button" className="admin-secondary-button" onClick={() => activatePanel("submissions")}>
                  See Form Fills
                </button>
                <button type="button" className="admin-secondary-button" onClick={() => activatePanel("navigation")}>
                  Edit Navigation
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activePanel === "navigation" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">Navigation</p>
            <h2>Navigation Editor</h2>
            <div className="admin-stack-list">
              {siteContent.navigation.items.map((item, index) => (
                <div className="admin-item-card" key={`${item.label}-${index}`}>
                  <div className="admin-field-grid admin-field-grid--two">
                    <LabeledInput
                      label="Label"
                      value={item.label}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.navigation.items[index].label = value;
                          return next;
                        })
                      }
                    />
                    <LabeledInput
                      label="Target ID"
                      value={item.target}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.navigation.items[index].target = value;
                          return next;
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-mini-button admin-mini-button--danger"
                    onClick={() =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.navigation.items.splice(index, 1);
                        return next;
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() =>
                  setSiteContent((current) => {
                    const next = cloneContent(current);
                    next.navigation.items.push({ label: "New Link", target: "section-id" });
                    return next;
                  })
                }
              >
                Add Navigation Item
              </button>
              <div className="admin-field-grid admin-field-grid--two">
                <LabeledInput
                  label="CTA Label"
                  value={siteContent.navigation.ctaLabel}
                  onChange={(value) => setSiteContent((current) => ({ ...current, navigation: { ...current.navigation, ctaLabel: value } }))}
                />
                <LabeledInput
                  label="CTA Target"
                  value={siteContent.navigation.ctaTarget}
                  onChange={(value) => setSiteContent((current) => ({ ...current, navigation: { ...current.navigation, ctaTarget: value } }))}
                />
              </div>
            </div>
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("navigation")}>
                Save Navigation
              </button>
              {sectionStatus.navigation ? <span className="admin-inline-status">{sectionStatus.navigation}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "hero" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">Home</p>
            <h2>Hero Editor</h2>
            <div className="admin-field-grid admin-field-grid--two">
              <LabeledInput
                label="Title Lead"
                value={siteContent.hero.titleLead}
                onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, titleLead: value } }))}
              />
              <LabeledInput
                label="Title Main"
                value={siteContent.hero.titleMain}
                onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, titleMain: value } }))}
              />
            </div>
            <LabeledTextarea
              label="Description"
              value={siteContent.hero.description}
              onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, description: value } }))}
              rows={5}
            />
            <div className="admin-field-grid admin-field-grid--two">
              <LabeledInput
                label="Primary CTA Label"
                value={siteContent.hero.primaryCtaLabel}
                onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, primaryCtaLabel: value } }))}
              />
              <LabeledInput
                label="Primary CTA Target"
                value={siteContent.hero.primaryCtaTarget}
                onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, primaryCtaTarget: value } }))}
              />
              <LabeledInput
                label="Secondary CTA Label"
                value={siteContent.hero.secondaryCtaLabel}
                onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, secondaryCtaLabel: value } }))}
              />
              <LabeledInput
                label="Secondary CTA Target"
                value={siteContent.hero.secondaryCtaTarget}
                onChange={(value) => setSiteContent((current) => ({ ...current, hero: { ...current.hero, secondaryCtaTarget: value } }))}
              />
            </div>
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("hero")}>
                Save Home
              </button>
              {sectionStatus.hero ? <span className="admin-inline-status">{sectionStatus.hero}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "services" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">Services</p>
            <h2>Services Content</h2>
            <LabeledInput
              label="Eyebrow"
              value={siteContent.services.eyebrow}
              onChange={(value) => setSiteContent((current) => ({ ...current, services: { ...current.services, eyebrow: value } }))}
            />
            <div className="admin-stack-list">
              {siteContent.services.items.map((item, index) => (
                <div className="admin-item-card" key={`${item.key}-${index}`}>
                  <div className="admin-field-grid admin-field-grid--two">
                    <LabeledInput
                      label="Key"
                      value={item.key}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.services.items[index].key = value;
                          return next;
                        })
                      }
                    />
                    <LabeledInput
                      label="Glyph"
                      value={item.glyph}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.services.items[index].glyph = value;
                          return next;
                        })
                      }
                    />
                  </div>
                  <LabeledInput
                    label="Title"
                    value={item.title}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.services.items[index].title = value;
                        return next;
                      })
                    }
                  />
                  <LabeledTextarea
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.services.items[index].description = value;
                        return next;
                      })
                    }
                    rows={4}
                  />
                  <LabeledTextarea
                    label="Tags"
                    value={item.tags.join("\n")}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.services.items[index].tags = value.split(/\r?\n/).map((tag) => tag.trim()).filter(Boolean);
                        return next;
                      })
                    }
                    rows={5}
                  />
                  <button
                    type="button"
                    className="admin-mini-button admin-mini-button--danger"
                    onClick={() =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.services.items.splice(index, 1);
                        return next;
                      })
                    }
                  >
                    Remove Service
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-card__actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() =>
                  setSiteContent((current) => {
                    const next = cloneContent(current);
                    next.services.items.push({
                      key: `service-${next.services.items.length + 1}`,
                      glyph: "strategic",
                      title: "New Service",
                      description: "",
                      tags: [],
                    });
                    return next;
                  })
                }
              >
                Add Service
              </button>
              <button type="button" className="admin-primary-button" onClick={() => saveSection("services")}>
                Save Services
              </button>
              {sectionStatus.services ? <span className="admin-inline-status">{sectionStatus.services}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "whatWeBuild" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">What We Build</p>
            <h2>What We Build Content</h2>
            <div className="admin-field-grid admin-field-grid--two">
              <LabeledInput
                label="Eyebrow"
                value={siteContent.whatWeBuild.eyebrow}
                onChange={(value) => setSiteContent((current) => ({ ...current, whatWeBuild: { ...current.whatWeBuild, eyebrow: value } }))}
              />
              <LabeledInput
                label="CTA Label"
                value={siteContent.whatWeBuild.ctaLabel}
                onChange={(value) => setSiteContent((current) => ({ ...current, whatWeBuild: { ...current.whatWeBuild, ctaLabel: value } }))}
              />
              <LabeledInput
                label="CTA Target"
                value={siteContent.whatWeBuild.ctaTarget}
                onChange={(value) => setSiteContent((current) => ({ ...current, whatWeBuild: { ...current.whatWeBuild, ctaTarget: value } }))}
              />
              <LabeledInput
                label="All Projects Eyebrow"
                value={siteContent.whatWeBuild.allProjectsEyebrow}
                onChange={(value) =>
                  setSiteContent((current) => ({ ...current, whatWeBuild: { ...current.whatWeBuild, allProjectsEyebrow: value } }))
                }
              />
            </div>
            <LabeledTextarea
              label="Homepage Title"
              value={siteContent.whatWeBuild.title}
              onChange={(value) => setSiteContent((current) => ({ ...current, whatWeBuild: { ...current.whatWeBuild, title: value } }))}
              rows={4}
            />
            <LabeledTextarea
              label="All Projects Title"
              value={siteContent.whatWeBuild.allProjectsTitle}
              onChange={(value) =>
                setSiteContent((current) => ({ ...current, whatWeBuild: { ...current.whatWeBuild, allProjectsTitle: value } }))
              }
              rows={4}
            />
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("whatWeBuild")}>
                Save What We Build
              </button>
              {sectionStatus.whatWeBuild ? <span className="admin-inline-status">{sectionStatus.whatWeBuild}</span> : null}
            </div>

            <div className="admin-section-divider" />

            <div className="admin-card__header-row">
              <div>
                <p className="admin-panel-eyebrow">Project Order</p>
                <h3>Project Manager</h3>
                <p className="admin-card__hint">
                  Drag the handle on each published project to control display order. The first 9 published projects appear on the homepage. The rest appear on the view all projects page.
                </p>
              </div>
              <button
                type="button"
                className="admin-primary-button"
                onClick={() => {
                  const nextProject = createEmptyProject(projects.length);
                  const nextProjects = organizeProjects([...projects, nextProject]);
                  setProjects(nextProjects);
                  setOpenProjectId(nextProject.id);
                  setProjectManagerView("active");
                  setProjectStatus("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Add New Project
              </button>
            </div>

            <div className="admin-project-tabs">
              <button
                type="button"
                className={projectManagerView === "active" ? "admin-secondary-button admin-secondary-button--active" : "admin-secondary-button"}
                onClick={() => setProjectManagerView("active")}
              >
                Active
              </button>
              <button
                type="button"
                className={projectManagerView === "trash" ? "admin-secondary-button admin-secondary-button--active" : "admin-secondary-button"}
                onClick={() => setProjectManagerView("trash")}
              >
                Trash
              </button>
            </div>

            {projectStatus ? <p className="admin-inline-status">{projectStatus}</p> : null}

            <div className="admin-project-manager-grid">
              {orderedVisibleProjects.map((project) => {
                const isOpen = openProjectId === project.id;
                const isBusy = projectBusyId === project.id;
                return (
                  <article
                    className="admin-project-manager-card admin-project-manager-card--draggable"
                    key={project.id}
                    onDragOver={(event) => {
                      if (project.status === "published") {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }
                    }}
                    onDrop={async (event) => {
                      event.preventDefault();
                      const sourceProjectId = event.dataTransfer.getData("text/plain") || draggedProjectId;
                      if (project.status === "published" && sourceProjectId) {
                        await moveProjectByDrag(sourceProjectId, project.id);
                      }
                    }}
                    onDragEnd={() => setDraggedProjectId(null)}
                  >
                    <div className="admin-project-manager-card__top">
                      <div className="admin-project-manager-card__heading">
                        <button
                          type="button"
                          className="admin-drag-handle"
                          draggable={project.status === "published"}
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", project.id);
                            setDraggedProjectId(project.id);
                          }}
                          onDragEnd={() => setDraggedProjectId(null)}
                          aria-label="Drag to reorder project"
                        >
                          ⋮⋮
                        </button>
                        <div>
                          <p className="admin-project-manager-card__eyebrow">{project.category || "others"}</p>
                          <h3>{project.title || "Untitled Project"}</h3>
                          <p>{project.description || "Add a short description so this project reads clearly."}</p>
                        </div>
                      </div>
                      <span className="admin-project-status-badge">{project.status}</span>
                    </div>
                    <div className="admin-tag-list">
                      {parseProjectTags(project.tagsText).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="admin-project-actions">
                      <button type="button" className="admin-primary-button" onClick={() => setOpenProjectId(isOpen ? null : project.id)}>
                        {isOpen ? "Close" : "Edit"}
                      </button>
                      <button type="button" className="admin-secondary-button" disabled={isBusy} onClick={() => toggleProjectVisibility(project.id)}>
                        {isBusy && projectBusyAction !== "save" ? "Loading..." : project.status === "published" ? "Hide" : "Publish"}
                      </button>
                      <button type="button" className="admin-danger-button" disabled={isBusy} onClick={() => deleteProject(project.id)}>
                        {isBusy && projectBusyAction === "delete" ? "Deleting..." : "Trash"}
                      </button>
                    </div>

                    {isOpen ? (
                      <div className="admin-project-editor">
                        <div className="admin-field-grid admin-field-grid--two">
                          <LabeledInput label="Title" value={project.title} onChange={(value) => updateProject(project.id, "title", value)} />
                          <LabeledInput label="Category" value={project.category} onChange={(value) => updateProject(project.id, "category", value)} />
                          <LabeledInput
                            label="Order"
                            value={project.order}
                            type="number"
                            onChange={(value) => updateProject(project.id, "order", Number(value))}
                          />
                          <label className="admin-field">
                            <span>Status</span>
                            <select value={project.status} onChange={(event) => updateProject(project.id, "status", event.target.value)}>
                              <option value="published">published</option>
                              <option value="hidden">hidden</option>
                            </select>
                          </label>
                        </div>
                        <label className="admin-checkbox-row">
                          <input
                            type="checkbox"
                            checked={project.featured}
                            onChange={(event) => updateProject(project.id, "featured", event.target.checked)}
                          />
                          <span>Featured project badge</span>
                        </label>
                        <div className="admin-field-grid admin-field-grid--two">
                          <div className="admin-field admin-field--full">
                            <span>Project Link</span>
                            <div className="admin-upload-stack">
                              <div className="admin-inline-input-row">
                                <input
                                  type="text"
                                  value={projectLinkDrafts[project.id] ?? ""}
                                  onChange={(event) =>
                                    setProjectLinkDrafts((current) => ({ ...current, [project.id]: event.target.value }))
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      addProjectLink(project.id, "projectLink");
                                    }
                                  }}
                                  placeholder="Add a project link"
                                />
                                <button type="button" className="admin-icon-button" onClick={() => addProjectLink(project.id, "projectLink")}>
                                  +
                                </button>
                              </div>
                              <div className="admin-chip-list">
                                {parseProjectLinkUrls(project.projectLink).map((url) => (
                                  <span className="admin-chip" key={url}>
                                    {url}
                                    <button type="button" onClick={() => removeProjectLink(project.id, "projectLink", url)} aria-label={"Remove " + url}>
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="admin-field admin-field--full">
                            <span>YouTube URL</span>
                            <div className="admin-upload-stack">
                              <div className="admin-inline-input-row">
                                <input
                                  type="text"
                                  value={projectYoutubeDrafts[project.id] ?? ""}
                                  onChange={(event) =>
                                    setProjectYoutubeDrafts((current) => ({ ...current, [project.id]: event.target.value }))
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      addProjectLink(project.id, "youtubeUrl");
                                    }
                                  }}
                                  placeholder="Add a YouTube URL"
                                />
                                <button type="button" className="admin-icon-button" onClick={() => addProjectLink(project.id, "youtubeUrl")}>
                                  +
                                </button>
                              </div>
                              <div className="admin-chip-list">
                                {parseProjectLinkUrls(project.youtubeUrl).map((url) => (
                                  <span className="admin-chip" key={url}>
                                    {url}
                                    <button type="button" onClick={() => removeProjectLink(project.id, "youtubeUrl", url)} aria-label={"Remove " + url}>
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <label className="admin-field admin-field--full">
                          <span>Tags</span>
                          <div className="admin-chip-input">
                            <div className="admin-chip-list">
                              {parseProjectTags(project.tagsText).map((tag) => (
                                <span className="admin-chip" key={tag}>
                                  {tag}
                                  <button type="button" onClick={() => removeProjectTag(project.id, tag)} aria-label={"Remove " + tag}>
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={projectTagDrafts[project.id] ?? ""}
                              onChange={(event) =>
                                setProjectTagDrafts((current) => ({ ...current, [project.id]: event.target.value }))
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === ",") {
                                  event.preventDefault();
                                  addProjectTag(project.id);
                                }
                              }}
                              placeholder="Type a tag and press Enter"
                            />
                          </div>
                        </label>
                        <div className="admin-field admin-field--full">
                          <span>Gallery Images</span>
                          <div className="admin-upload-stack">
                            <label className="admin-upload-dropzone">
                              <input
                                className="admin-upload-dropzone__input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={async (event) => {
                                  await uploadProjectImages(project.id, event.target.files);
                                  event.target.value = "";
                                }}
                              />
                              <span>Upload Image</span>
                            </label>
                            <div className="admin-inline-input-row">
                              <input
                                type="text"
                                value={projectGalleryUrlDrafts[project.id] ?? ""}
                                onChange={(event) =>
                                  setProjectGalleryUrlDrafts((current) => ({ ...current, [project.id]: event.target.value }))
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    addProjectGalleryUrl(project.id);
                                  }
                                }}
                                placeholder="Paste a public image URL"
                              />
                              <button type="button" className="admin-icon-button" onClick={() => addProjectGalleryUrl(project.id)}>
                                +
                              </button>
                            </div>
                            {projectUploadStatus[project.id] ? <p className="admin-inline-status">{projectUploadStatus[project.id]}</p> : null}
                            <div className="admin-gallery-list">
                              {parseProjectImageUrls(project.imageUrlsText).map((url, index) => (
                                <div className="admin-gallery-item" key={project.id + "-" + url + "-" + index}>
                                  <img src={url} alt={`${project.title || "Project"} gallery ${index + 1}`} loading="lazy" />
                                  <button type="button" className="admin-gallery-remove" onClick={() => removeProjectGalleryUrl(project.id, url)} aria-label={`Remove image ${index + 1}`}>
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <LabeledTextarea
                          label="Short Description"
                          value={project.description}
                          onChange={(value) => updateProject(project.id, "description", value)}
                          rows={4}
                        />
                        <LabeledTextarea
                          label="Full Description"
                          value={project.fullDescription}
                          onChange={(value) => updateProject(project.id, "fullDescription", value)}
                          rows={7}
                        />
                        <div className="admin-card__actions">
                          <button type="button" className="admin-primary-button" disabled={isBusy} onClick={() => saveProject(project.id)}>
                            {isBusy && projectBusyAction === "save" ? "Saving..." : "Save Project"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {activePanel === "about" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">About Us</p>
            <h2>About Content</h2>
            <LabeledInput
              label="Eyebrow"
              value={siteContent.about.eyebrow}
              onChange={(value) => setSiteContent((current) => ({ ...current, about: { ...current.about, eyebrow: value } }))}
            />
            <div className="admin-stack-list">
              {siteContent.about.statement.map((segment, index) => (
                <div className="admin-item-card" key={`statement-${index}`}>
                  <LabeledTextarea
                    label={`Statement ${index + 1}`}
                    value={segment.text}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.about.statement[index].text = value;
                        return next;
                      })
                    }
                    rows={3}
                  />
                  <label className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={Boolean(segment.emphasis)}
                      onChange={(event) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.about.statement[index].emphasis = event.target.checked;
                          return next;
                        })
                      }
                    />
                    <span>Highlight this segment</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="admin-stack-list">
              {siteContent.about.values.map((item, index) => (
                <div className="admin-item-card" key={`${item.label}-${index}`}>
                  <div className="admin-field-grid admin-field-grid--two">
                    <LabeledInput
                      label="Icon"
                      value={item.icon}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.about.values[index].icon = value;
                          return next;
                        })
                      }
                    />
                    <LabeledInput
                      label="Label"
                      value={item.label}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.about.values[index].label = value;
                          return next;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("about")}>
                Save About Us
              </button>
              {sectionStatus.about ? <span className="admin-inline-status">{sectionStatus.about}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "process" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">How We Work</p>
            <h2>How We Work Content</h2>
            <LabeledInput
              label="Eyebrow"
              value={siteContent.process.eyebrow}
              onChange={(value) => setSiteContent((current) => ({ ...current, process: { ...current.process, eyebrow: value } }))}
            />
            <div className="admin-stack-list">
              {siteContent.process.items.map((item, index) => (
                <div className="admin-item-card" key={`${item.marker}-${index}`}>
                  <div className="admin-field-grid admin-field-grid--two">
                    <LabeledInput
                      label="Marker"
                      value={item.marker}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.process.items[index].marker = value;
                          return next;
                        })
                      }
                    />
                    <LabeledInput
                      label="Title"
                      value={item.title}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.process.items[index].title = value;
                          return next;
                        })
                      }
                    />
                  </div>
                  <LabeledTextarea
                    label="Text"
                    value={item.text}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.process.items[index].text = value;
                        return next;
                      })
                    }
                    rows={4}
                  />
                </div>
              ))}
            </div>
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("process")}>
                Save How We Work
              </button>
              {sectionStatus.process ? <span className="admin-inline-status">{sectionStatus.process}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "contact" ? (
          <div className="admin-card">
            <div className="admin-card__header-row">
              <div>
                <p className="admin-panel-eyebrow">Plan a Project</p>
                <h2>Contact Section Content</h2>
              </div>
              <button type="button" className="admin-secondary-button" onClick={() => activatePanel("submissions")}>
                See Form Fills
              </button>
            </div>
            <div className="admin-field-grid admin-field-grid--two">
              <LabeledInput
                label="Eyebrow"
                value={siteContent.contact.eyebrow}
                onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, eyebrow: value } }))}
              />
              <LabeledInput
                label="Legend"
                value={siteContent.contact.legend}
                onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, legend: value } }))}
              />
            </div>
            <LabeledInput
              label="Title"
              value={siteContent.contact.title}
              onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, title: value } }))}
            />
            <LabeledTextarea
              label="Description"
              value={siteContent.contact.description}
              onChange={(value) => setSiteContent((current) => ({ ...current, contact: { ...current.contact, description: value } }))}
              rows={4}
            />
            <div className="admin-stack-list">
              {siteContent.contact.info.map((item, index) => (
                <div className="admin-item-card" key={`${item.label}-${index}`}>
                  <div className="admin-field-grid admin-field-grid--two">
                    <LabeledInput
                      label="Label"
                      value={item.label}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.contact.info[index].label = value;
                          return next;
                        })
                      }
                    />
                    <LabeledInput
                      label="Value"
                      value={item.value}
                      onChange={(value) =>
                        setSiteContent((current) => {
                          const next = cloneContent(current);
                          next.contact.info[index].value = value;
                          return next;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("contact")}>
                Save Plan a Project
              </button>
              {sectionStatus.contact ? <span className="admin-inline-status">{sectionStatus.contact}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "submissions" ? (
          <div className="admin-card">
            <div className="admin-card__header-row">
              <div>
                <p className="admin-panel-eyebrow">Form Fills</p>
                <h2>New Client Enquiries</h2>
              </div>
            </div>

            <div className="admin-item-card admin-item-card--webhook">
              <div className="admin-card__header-row">
                <div>
                  <p className="admin-panel-eyebrow">Webhook</p>
                  <h3>Form Fill Webhook</h3>
                  <p className="admin-card__hint">
                    Add one webhook here. After you save and enable it, every new form fill will stay in this admin panel and also be sent to that webhook.
                  </p>
                </div>
                <span className="admin-pill admin-pill--pending">{webhook.method} enabled</span>
              </div>
              <div className="admin-field-grid admin-field-grid--two">
                <LabeledInput label="Key" value={webhook.key} onChange={(value) => setWebhook((current) => ({ ...current, key: value }))} />
                <LabeledInput label="Label" value={webhook.label} onChange={(value) => setWebhook((current) => ({ ...current, label: value }))} />
              </div>
              <LabeledInput
                label="Endpoint URL"
                value={webhook.endpointUrl}
                onChange={(value) => setWebhook((current) => ({ ...current, endpointUrl: value }))}
                placeholder="https://your-webhook-url"
              />
              <div className="admin-field-grid admin-field-grid--two">
                <label className="admin-field">
                  <span>Method</span>
                  <select value={webhook.method} onChange={(event) => setWebhook((current) => ({ ...current, method: event.target.value as "GET" | "POST" }))}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </label>
                <LabeledInput
                  label="Secret Header"
                  value={webhook.secretHeader}
                  onChange={(value) => setWebhook((current) => ({ ...current, secretHeader: value }))}
                />
              </div>
              <LabeledTextarea
                label="Notes"
                value={webhook.notes}
                onChange={(value) => setWebhook((current) => ({ ...current, notes: value }))}
                rows={3}
              />
              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={webhook.enabled}
                  onChange={(event) => setWebhook((current) => ({ ...current, enabled: event.target.checked }))}
                />
                <span>Send new form fills to this webhook</span>
              </label>
              <div className="admin-card__actions">
                <button type="button" className="admin-primary-button" onClick={saveWebhook}>
                  Save Webhook
                </button>
                {webhookStatus ? <span className="admin-inline-status">{webhookStatus}</span> : null}
              </div>
            </div>

            {submissionStatus ? <p className="admin-inline-status">{submissionStatus}</p> : null}
            <div className="admin-stack-list">
              {submissions.length ? (
                submissions.map((submission) => (
                  <article className="admin-submission-card" key={submission.id}>
                    <div className="admin-submission-card__header">
                      <div>
                        <h3>
                          {submission.firstName} {submission.lastName}
                        </h3>
                        <p>
                          {submission.email}
                          {submission.phone ? ` • ${submission.phone}` : ""}
                        </p>
                      </div>
                      <div className="admin-submission-meta">
                        <span className={`admin-pill admin-pill--${submission.status}`}>{statusLabel(submission.status)}</span>
                        <span className={`admin-pill admin-pill--${submission.webhookDeliveryStatus}`}>
                          {statusLabel(submission.webhookDeliveryStatus)}
                        </span>
                      </div>
                    </div>
                    <div className="admin-submission-grid">
                      <div>
                        <small>Service</small>
                        <strong>{submission.serviceLabel}</strong>
                      </div>
                      <div>
                        <small>Received</small>
                        <strong>{new Date(submission.createdAt).toLocaleString()}</strong>
                      </div>
                      <div>
                        <small>Source</small>
                        <strong>{submission.source}</strong>
                      </div>
                      <div>
                        <small>Webhook</small>
                        <strong>{submission.webhookError || statusLabel(submission.webhookDeliveryStatus)}</strong>
                      </div>
                    </div>
                    <p className="admin-submission-message">{submission.message}</p>
                    <div className="admin-card__actions">
                      {submission.status !== "reviewed" ? (
                        <button type="button" className="admin-primary-button" disabled={submissionBusyId === submission.id} onClick={() => reviewSubmission(submission.id)}>
                          {submissionBusyId === submission.id ? "Loading..." : "Mark Reviewed"}
                        </button>
                      ) : null}
                      <button type="button" className="admin-danger-button" disabled={submissionBusyId === submission.id} onClick={() => deleteSubmission(submission.id)}>
                        {submissionBusyId === submission.id ? "Loading..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="admin-empty-state">No form fills have been captured yet.</div>
              )}
            </div>
          </div>
        ) : null}

        {activePanel === "faq" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">Questions</p>
            <h2>FAQ Content</h2>
            <LabeledInput
              label="Eyebrow"
              value={siteContent.faq.eyebrow}
              onChange={(value) => setSiteContent((current) => ({ ...current, faq: { ...current.faq, eyebrow: value } }))}
            />
            <div className="admin-stack-list">
              {siteContent.faq.items.map((item, index) => (
                <div className="admin-item-card" key={`${item.question}-${index}`}>
                  <LabeledInput
                    label="Question"
                    value={item.question}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.faq.items[index].question = value;
                        return next;
                      })
                    }
                  />
                  <LabeledTextarea
                    label="Answer"
                    value={item.answer}
                    onChange={(value) =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.faq.items[index].answer = value;
                        return next;
                      })
                    }
                    rows={5}
                  />
                  <button
                    type="button"
                    className="admin-mini-button admin-mini-button--danger"
                    onClick={() =>
                      setSiteContent((current) => {
                        const next = cloneContent(current);
                        next.faq.items.splice(index, 1);
                        return next;
                      })
                    }
                  >
                    Remove FAQ
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-card__actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() =>
                  setSiteContent((current) => {
                    const next = cloneContent(current);
                    next.faq.items.push({ question: "New question", answer: "" });
                    return next;
                  })
                }
              >
                Add New Question
              </button>
              <button type="button" className="admin-primary-button" onClick={() => saveSection("faq")}>
                Save Questions
              </button>
              {sectionStatus.faq ? <span className="admin-inline-status">{sectionStatus.faq}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "footer" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">Footer</p>
            <h2>Footer Content</h2>
            <LabeledTextarea
              label="Description"
              value={siteContent.footer.description}
              onChange={(value) => setSiteContent((current) => ({ ...current, footer: { ...current.footer, description: value } }))}
              rows={4}
            />
            <div className="admin-field-grid admin-field-grid--two">
              <LabeledInput
                label="CTA Label"
                value={siteContent.footer.ctaLabel}
                onChange={(value) => setSiteContent((current) => ({ ...current, footer: { ...current.footer, ctaLabel: value } }))}
              />
              <LabeledInput
                label="Copyright"
                value={siteContent.footer.copyright}
                onChange={(value) => setSiteContent((current) => ({ ...current, footer: { ...current.footer, copyright: value } }))}
              />
            </div>
            <LabeledInput
              label="Policy Text"
              value={siteContent.footer.policyText}
              onChange={(value) => setSiteContent((current) => ({ ...current, footer: { ...current.footer, policyText: value } }))}
            />
            <div className="admin-card__actions">
              <button type="button" className="admin-primary-button" onClick={() => saveSection("footer")}>
                Save Footer
              </button>
              {sectionStatus.footer ? <span className="admin-inline-status">{sectionStatus.footer}</span> : null}
            </div>
          </div>
        ) : null}

        {activePanel === "access" ? (
          <div className="admin-card">
            <p className="admin-panel-eyebrow">Access</p>
            <h2>Pending Access Requests</h2>
            {accessState.length ? (
              <div className="admin-access-list">
                {accessState.map((request) => (
                  <article className="admin-access-card" key={request.id}>
                    <div>
                      <strong>{request.email}</strong>
                      <p>Requested at {new Date(request.requested_at).toLocaleString()}</p>
                    </div>
                    <div className="admin-card__actions">
                      <button type="button" className="admin-primary-button" onClick={() => reviewRequest(request.id, true)}>
                        Approve
                      </button>
                      <button type="button" className="admin-danger-button" onClick={() => reviewRequest(request.id, false)}>
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-inline-status">No pending requests right now.</p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}



