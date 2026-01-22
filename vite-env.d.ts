/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly VITE_ASSEMBLYAI_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
