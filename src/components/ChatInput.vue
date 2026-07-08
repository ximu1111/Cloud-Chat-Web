<template>
  <div class="shrink-0 border-t border-border bg-bg-surface/80 backdrop-blur-sm">
    <div class="max-w-[800px] mx-auto px-4 py-3">
      <!-- File preview area -->
      <div v-if="uploadedFiles.length > 0" class="flex flex-wrap gap-2 mb-3">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-sidebar border border-border text-sm"
        >
          <!-- File icon -->
          <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <svg v-if="isImage(file.type)" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <svg v-else class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>

          <!-- File info -->
          <div class="min-w-0">
            <p class="text-xs font-medium text-text-primary truncate max-w-[140px]">{{ file.name }}</p>
            <p class="text-[11px] text-text-muted">{{ formatSize(file.size) }}</p>
          </div>

          <!-- Progress bar -->
          <div v-if="file.status === 'uploading'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-border rounded-b-xl overflow-hidden">
            <div
              class="h-full bg-accent transition-all duration-300"
              :style="{ width: file.progress + '%' }"
            />
          </div>

          <!-- Status indicator -->
          <div v-if="file.status === 'done'" class="text-green-600">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Remove button -->
          <button
            class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            @click="removeFile(file.id)"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="errorMsg" class="mb-2 px-3 py-2 rounded-lg bg-danger-light text-danger text-sm">
        {{ errorMsg }}
      </div>

      <!-- Input area -->
      <div class="flex items-end gap-2">
        <!-- File upload button -->
        <button
          class="p-2.5 rounded-xl hover:bg-border-light text-text-secondary hover:text-text-primary transition-colors duration-150 shrink-0 mb-0.5"
          title="上传文件"
          @click="triggerFileInput"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.325a1.5 1.5 0 01-2.121-2.121l9.624-9.624" />
          </svg>
        </button>

        <!-- Text input -->
        <div class="flex-1 relative">
          <textarea
            ref="textareaRef"
            v-model="inputText"
            class="w-full resize-none rounded-xl border border-border bg-bg-primary px-4 py-3 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors duration-150"
            :rows="1"
            :style="{ height: textareaHeight + 'px' }"
            placeholder="输入消息，或上传文件让我分析..."
            @keydown="handleKeydown"
            @input="adjustTextareaHeight"
          />
        </div>

        <!-- Send / Stop button -->
        <button
          v-if="chatStore.isStreaming"
          class="p-2.5 rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors duration-150 shrink-0 mb-0.5"
          title="停止生成"
          @click="handleStop"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
        <button
          v-else
          :class="[
            'p-2.5 rounded-xl transition-colors duration-150 shrink-0 mb-0.5',
            canSend
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-border text-text-muted cursor-not-allowed'
          ]"
          :disabled="!canSend"
          title="发送消息"
          @click="handleSend"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        :accept="acceptedTypes"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { validateFile, formatFileSize, readFileContent, isImageFile } from '@/utils/file'
import { v4 as uuidv4 } from 'uuid'
import type { UploadedFile } from '@/types'

const emit = defineEmits<{
  send: [payload: { content: string; files: UploadedFile[] }]
}>()

const chatStore = useChatStore()

const inputText = ref('')
const uploadedFiles = ref<UploadedFile[]>([])
const errorMsg = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaHeight = ref(44)

const acceptedTypes = [
  'text/plain', 'text/markdown', 'text/csv', 'application/json',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp'
].join(',')

const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || uploadedFiles.value.length > 0) && !chatStore.isStreaming
})

function isImage(type: string): boolean {
  return isImageFile(type)
}

function formatSize(bytes: number): string {
  return formatFileSize(bytes)
}

function adjustTextareaHeight(): void {
  nextTick(() => {
    const el = textareaRef.value
    if (!el) return
    el.style.height = 'auto'
    const newHeight = Math.min(el.scrollHeight, 200)
    textareaHeight.value = Math.max(44, newHeight)
  })
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

async function handleFileSelect(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  errorMsg.value = ''

  for (const file of Array.from(input.files)) {
    const validation = validateFile(file)
    if (!validation.valid) {
      errorMsg.value = validation.error || '文件校验失败'
      continue
    }

    const uploadedFile: UploadedFile = {
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }

    uploadedFiles.value.push(uploadedFile)

    // Simulate upload progress
    try {
      const content = await readFileContent(file)
      uploadedFile.content = content
      uploadedFile.status = 'done'
      uploadedFile.progress = 100
    } catch {
      uploadedFile.status = 'error'
      uploadedFile.progress = 0
      errorMsg.value = `文件 ${file.name} 读取失败`
    }
  }

  // Reset input
  input.value = ''
}

function removeFile(id: string): void {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

function handleSend(): void {
  if (!canSend.value) return

  const content = inputText.value.trim()
  const files = uploadedFiles.value.filter(f => f.status === 'done')

  emit('send', { content, files })

  // Reset
  inputText.value = ''
  uploadedFiles.value = []
  textareaHeight.value = 44
  errorMsg.value = ''
}

function handleStop(): void {
  chatStore.stopStreaming()
}
</script>
