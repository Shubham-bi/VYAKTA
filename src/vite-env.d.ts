/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SIGNAL_URL: string;
  readonly VITE_AI_WS: string;
  readonly VITE_STT_WS?: string;
  readonly VITE_STT_HTTP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

