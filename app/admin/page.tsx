export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import AdminPanel from "@/components/admin/AdminPanel";
import { getCurrentAdminAccess, getPendingAccessRequests } from "@/lib/admin-auth";
import { getContactSubmissions } from "@/lib/contact-submissions";
import { getAllProjects } from "@/lib/projects";
import { getSiteContent } from "@/lib/site-content";
import { getWebhookSettings } from "@/lib/webhook-settings";

export default async function AdminPage() {
  const access = await getCurrentAdminAccess();

  if (!access.authenticated) {
    redirect("/admin/login");
  }

  if (!access.approved || !access.email) {
    redirect("/admin/pending");
  }

  const [siteContent, projects, pendingRequests, submissions, webhooks] = await Promise.all([
    getSiteContent(),
    getAllProjects(),
    getPendingAccessRequests(),
    getContactSubmissions(),
    getWebhookSettings(),
  ]);

  return (
    <main className="admin-page">
      <AdminPanel
        currentAdminEmail={access.email}
        initialSiteContent={siteContent}
        initialProjects={projects}
        pendingRequests={pendingRequests}
        initialSubmissions={submissions}
        initialWebhooks={webhooks}
      />
    </main>
  );
}
