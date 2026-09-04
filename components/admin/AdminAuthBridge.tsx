"use client";

import { useEffect } from "react";

const signupTypes = new Set(["signup", "invite", "magiclink", "email_change"]);

export default function AdminAuthBridge() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const searchParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const searchType = searchParams.get("type");
    const hashType = hashParams.get("type");
    const onAdminLogin = pathname === "/admin/login";
    const onConfirmRoute = pathname === "/auth/confirm";

    if (!onConfirmRoute && searchType && signupTypes.has(searchType) && searchParams.get("token_hash")) {
      window.location.replace(`/auth/confirm${search}`);
      return;
    }

    if (!onAdminLogin && searchType === "recovery") {
      window.location.replace(`/admin/login${search}${hash}`);
      return;
    }

    if (!onAdminLogin && hashType === "recovery") {
      window.location.replace(`/admin/login${search}${hash}`);
      return;
    }

    if (!onAdminLogin && hashType && signupTypes.has(hashType)) {
      window.location.replace("/admin/login?confirmed=1");
    }
  }, []);

  return null;
}
