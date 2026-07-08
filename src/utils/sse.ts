import type { Message, UploadedFile } from '@/types'

interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

interface ChatRequest {
  messages: Message[]
  files?: UploadedFile[]
  signal?: AbortSignal
}

export async function streamChat(
  request: ChatRequest,
  callbacks: StreamCallbacks
): Promise<void> {
  const { messages, files, signal } = request

  const payload = {
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    files: files?.filter(f => f.status === 'done').map(f => ({
      name: f.name,
      type: f.type,
      content: f.content
    }))
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        callbacks.onDone()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          callbacks.onDone()
          return
        }

        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            callbacks.onToken(parsed.content)
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      callbacks.onDone()
      return
    }
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}
