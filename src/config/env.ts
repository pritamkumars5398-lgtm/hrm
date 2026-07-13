/**
 * Single place the app reads environment config. Everything is optional in
 * Phase 1 — when a value is absent the app falls back to its mock path, so the
 * prototype runs with no `.env` at all.
 *
 * Everything readable here is PUBLIC (it ships in the browser bundle). Secrets
 * live in hrm-backend/.env and are never imported by this file.
 */

const read = (value: string | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const env = {
  googleClientId: read(import.meta.env.VITE_GOOGLE_CLIENT_ID),
  apiBaseUrl: read(import.meta.env.VITE_API_BASE_URL),
  cloudinaryCloudName: read(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME),
  cloudinaryUploadPreset: read(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET),
}

/** True once a real Google client ID exists — until then, the simulated chooser runs. */
export const hasGoogleOAuth = env.googleClientId !== null

/** True once the NestJS backend is reachable — until then, services return mock data. */
export const hasBackend = env.apiBaseUrl !== null

/** Phase 2 — real file uploads. Until then, Documents runs on mock files. */
export const hasCloudinary =
  env.cloudinaryCloudName !== null && env.cloudinaryUploadPreset !== null
