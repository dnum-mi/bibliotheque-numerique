/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_OPEN_SOURCE: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
