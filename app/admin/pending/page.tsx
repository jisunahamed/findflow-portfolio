export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { clearAdminSession, getCurrentAdminAccess } from "@/lib/admin-auth";

export default async function AdminPendingPage() {
  const access = await getCurrentAdminAccess();

  if (!access.authenticated) {
    redirect("/admin/login");
  }

  if (access.approved) {
    redirect("/admin");
  }

  async function logoutAction() {
    "use server";
    await clearAdminSession();
    redirect("/admin/login");
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-shell">
        <p className="admin-panel-eyebrow">Approval Pending</p>
        <h1>Your admin request is waiting for manual approval</h1>
        <p className="admin-auth-description">
          The owner has to approve this email before the control room becomes available. You can log out now and come back after approval.
        </p>
        <form action={logoutAction}>
          <button className="admin-primary-button" type="submit">Logout</button>
        </form>
      </div>
    </main>
  );
}

