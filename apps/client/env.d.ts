/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_OPEN_SOURCE: 'true' | 'false'
  readonly VITE_SUDO_VALIDATE_ACCOUNT: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
