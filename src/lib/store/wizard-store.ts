import { create } from 'zustand'

export type BotFormState = {
    name: string
    tagline: string
    description: string
    avatarUrl: string
    tone: {
        friendly: number // 0-100
        professional: number // 0-100
        funny: number // 0-100
    }
    isPublic: boolean
    files: File[] // temporary holder for uploads
    urls: string[]
    guardrails: {
        topics: string[]
        ctas: string[]
    }
}

interface WizardStore extends BotFormState {
    setField: <K extends keyof BotFormState>(field: K, value: BotFormState[K]) => void
    setTone: (key: keyof BotFormState['tone'], value: number) => void
    addUrl: (url: string) => void
    removeUrl: (index: number) => void
    addFile: (file: File) => void
    removeFile: (index: number) => void
    reset: () => void
}

const initialState: BotFormState = {
    name: '',
    tagline: '',
    description: '',
    avatarUrl: '',
    tone: {
        friendly: 50,
        professional: 50,
        funny: 20,
    },
    isPublic: false,
    files: [],
    urls: [],
    guardrails: {
        topics: [],
        ctas: [],
    },
}

export const useWizardStore = create<WizardStore>((set) => ({
    ...initialState,
    setField: (field, value) => set((state) => ({ ...state, [field]: value })),
    setTone: (key, value) => set((state) => ({
        ...state,
        tone: { ...state.tone, [key]: value }
    })),
    addUrl: (url) => set((state) => ({ ...state, urls: [...state.urls, url] })),
    removeUrl: (index) => set((state) => ({
        ...state,
        urls: state.urls.filter((_, i) => i !== index)
    })),
    addFile: (file) => set((state) => ({ ...state, files: [...state.files, file] })),
    removeFile: (index) => set((state) => ({
        ...state,
        files: state.files.filter((_, i) => i !== index)
    })),
    reset: () => set(initialState),
}))
