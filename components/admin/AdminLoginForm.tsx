"use client";

import { useEffect, useState } from "react";

type Mode = "login" | "signup" | "reset" | "recovery";

export default function AdminLoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryAccessToken, setRecoveryAccessToken] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    async function bootstrapRecovery() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);
      const hashType = hashParams.get("type");
      const hashAccessToken = hashParams.get("access_token");
      const tokenHash = searchParams.get("token_hash");
      const queryType = searchParams.get("type");
      const confirmed = searchParams.get("confirmed");
      const confirmationError = searchParams.get("error");

      if (confirmed === "1") {
        setMessage("Email confirmed. You can log in to the admin panel now.");
        const confirmedEmail = searchParams.get("email");
        if (confirmedEmail) {
          setEmail(confirmedEmail.trim().toLowerCase());
        }
      }

      if (confirmationError === "confirmation") {
        setError("The confirmation link is invalid or expired. Request a fresh signup link and try again.");
      }

      if (hashType === "recovery" && hashAccessToken) {
        setMode("recovery");
        setRecoveryAccessToken(hashAccessToken);
        setRecoveryReady(true);
        setMessage("Choose a new password to finish resetting your admin login.");
        window.history.replaceState({}, "", "/admin/login?reset=1");
        return;
      }

      if (queryType === "recovery" && tokenHash) {
        setLoading(true);
        setError("");
        setMessage("");

        try {
          const response = await fetch("/api/admin/password-recovery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "exchange", tokenHash }),
          });
          const payload = await response.json();

          if (!response.ok || !payload.accessToken) {
            throw new Error(payload.error || "Recovery link is invalid or expired");
          }

          setMode("recovery");
          setRecoveryAccessToken(payload.accessToken);
          setRecoveryReady(true);
          setMessage("Choose a new password to finish resetting your admin login.");
          window.history.replaceState({}, "", "/admin/login?reset=1");
        } catch (recoveryError) {
          setError(recoveryError instanceof Error ? recoveryError.message : "Recovery link is invalid or expired");
        } finally {
          setLoading(false);
        }
      }
    }

    void bootstrapRecovery();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "recovery") {
        if (!recoveryAccessToken || !recoveryReady) {
          throw new Error("Recovery link is invalid or expired");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const response = await fetch("/api/admin/password-recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            accessToken: recoveryAccessToken,
            password,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to update password");
        }

        setMessage("Password updated. Log in with your new password.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setRecoveryAccessToken("");
        setRecoveryReady(false);
        return;
      }

      if (mode === "login") {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Login failed");
        }
        window.location.href = "/admin";
        return;
      }

      if (mode === "signup") {
        const response = await fetch("/api/admin/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Sign up failed");
        }
        setMessage(payload.message || "Confirmation email sent. Verify your email first, then wait for admin approval.");
        setMode("login");
        setPassword("");
        return;
      }

      const response = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Password reset failed");
      }
      setMessage("Password reset link sent if the email is approved for admin access.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth-card">
      <div className="admin-auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "admin-auth-tab admin-auth-tab--active" : "admin-auth-tab"}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "signup" ? "admin-auth-tab admin-auth-tab--active" : "admin-auth-tab"}
          onClick={() => setMode("signup")}
        >
          Sign Up
        </button>
        <button
          type="button"
          className={mode === "reset" ? "admin-auth-tab admin-auth-tab--active" : "admin-auth-tab"}
          onClick={() => setMode("reset")}
        >
          Reset Password
        </button>
      </div>
      <form className="admin-auth-form" onSubmit={handleSubmit}>
        {mode !== "recovery" ? (
          <label>
            Admin Email
            <input type="email" value={email} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} onChange={(event) => setEmail(event.target.value)} required />
          </label>
        ) : null}
        {mode !== "reset" ? (
          <label>
            {mode === "recovery" ? "New Password" : "Password"}
            <input type="password" value={password} autoComplete={mode === "login" ? "new-password" : "off"} onChange={(event) => setPassword(event.target.value)} required />
          </label>
        ) : null}
        {mode === "recovery" ? (
          <label>
            Confirm New Password
            <input type="password" value={confirmPassword} autoComplete="new-password" onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>
        ) : null}
        <button className="admin-primary-button" type="submit" disabled={loading}>
          {loading
            ? "Please wait"
            : mode === "login"
              ? "Login"
              : mode === "signup"
                ? "Sign Up"
                : mode === "recovery"
                  ? "Update Password"
                  : "Send Reset Link"}
        </button>
        {message ? <p className="admin-form-message">{message}</p> : null}
        {error ? <p className="admin-form-error">{error}</p> : null}
      </form>
      <p className="admin-auth-note">
        Sign up sends a Supabase confirmation email. After email confirmation, admin approval is still required before dashboard access.
      </p>
    </div>
  );
}
