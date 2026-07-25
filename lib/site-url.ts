export function getSiteUrl(): string | undefined {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const candidate = explicitUrl ?? (vercelHost ? `https://${vercelHost}` : undefined);

  if (!candidate) {
    return undefined;
  }

  try {
    return new URL(candidate).origin;
  } catch {
    return undefined;
  }
}
