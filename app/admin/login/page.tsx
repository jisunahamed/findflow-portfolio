export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getCurrentAdminAccess } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const access = await getCurrentAdminAccess();

  if (access.approved) {
    redirect("/admin");
  }

  if (access.authenticated) {
    redirect("/admin/pending");
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-shell">
        <p className="admin-panel-eyebrow">Admin Login</p>
        <h1>FindFlow Agency Control Room</h1>
        <p className="admin-auth-description">
          Sign in with your approved admin email, request access, or send a password reset link if your email already has admin permission.
        </p>
        <AdminLoginForm />
      </div>
    </main>
  );
}

