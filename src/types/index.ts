export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  files?: UploadedFile[]
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  content?: string
  progress: number
  status: 'uploading' | 'done' | 'error'
}

export interface StreamState {
  isStreaming: boolean
  abortController: AbortController | null
}
