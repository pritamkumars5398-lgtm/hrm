/**
 * Minimal TypeScript declarations for the Google Identity Services (GIS) SDK
 * loaded from https://accounts.google.com/gsi/client.
 *
 * Only the surfaces this app actually uses are typed — the full spec is at
 * https://developers.google.com/identity/gsi/web/reference/js-reference
 */

interface CredentialResponse {
  /** Signed id_token JWT — verify this on the server, never trust it raw. */
  credential: string
  /** How the credential was selected (auto, user, user_1tap, etc.). */
  select_by?: string
}

interface IdConfiguration {
  client_id: string
  callback: (response: CredentialResponse) => void
  /** Auto-selects a signed-in account if there is exactly one. */
  auto_select?: boolean
  /** Cancel One Tap if the user clicks outside the prompt. */
  cancel_on_tap_outside?: boolean
}

interface GsiButtonConfiguration {
  type: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: string
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
}

interface PromptMomentNotification {
  isNotDisplayed(): boolean
  isSkippedMoment(): boolean
  isDismissedMoment(): boolean
  getNotDisplayedReason(): string
  getSkippedReason(): string
  getDismissedReason(): string
}

interface Google {
  accounts: {
    id: {
      initialize(config: IdConfiguration): void
      prompt(momentListener?: (notification: PromptMomentNotification) => void): void
      renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void
      cancel(): void
      disableAutoSelect(): void
    }
  }
}
interface Window {
  google: Google
}

// Keep the existing global declaration so it works without `window.` too
declare const google: Google
