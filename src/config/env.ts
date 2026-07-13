/**
 * Single place the app reads environment config. Everything is optional in
 * Phase 1 — when a value is absent the app falls back to its mock path, so the
 * prototype runs with no `.env` at all.
 *
 * Everything readable here is PUBLIC (it ships in the browser bundle). Secrets
 * live in hrm-backend/.env and are never imported by this file.
 *
 * Note there is deliberately no Cloudinary config: uploads go through our own
 * backend, which holds the credentials and signs the request. The browser never
 * talks to Cloudinary directly.
 */

const read = (value: string | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const env = {
  googleClientId: read(import.meta.env.VITE_GOOGLE_CLIENT_ID),
  apiBaseUrl: read(import.meta.env.VITE_API_BASE_URL),
}

/** True once a real Google client ID exists — until then, the simulated chooser runs. */
export const hasGoogleOAuth = env.googleClientId !== null

/** True once the NestJS backend is reachable — until then, services return mock data. */
export const hasBackend = env.apiBaseUrl !== null
