import { registerSW } from 'virtual:pwa-register'

let updateReady = false

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        updateReady = true
      },
      onOfflineReady() {
        // Offline cache is warm; the game already works without a network.
      },
    })
  } catch {
    // Service workers are unavailable (private mode, unsupported browser):
    // gameplay still works, it just will not be cacheable.
  }
}

export function isUpdateReady(): boolean {
  return updateReady
}

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: InstallPromptEvent | null = null

export function captureInstallPrompt(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as InstallPromptEvent
  })
}

export async function promptInstall(): Promise<'unavailable' | 'accepted' | 'dismissed'> {
  if (!deferredPrompt) return 'unavailable'
  await deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  deferredPrompt = null
  return choice.outcome
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}
