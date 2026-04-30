/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PROGRESSION_PRESET?: 'casual' | 'returning-player' | 'arcade'
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}