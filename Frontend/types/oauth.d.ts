declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
    FB?: {
      init: (config: any) => void
      login: (callback: (response: any) => void, options?: any) => void
      api: (path: string, params: any, callback: (response: any) => void) => void
    }
  }
}

export {}

