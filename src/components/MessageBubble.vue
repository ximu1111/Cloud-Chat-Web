<template>
  <div :class="['flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row']">
    <!-- Avatar -->
    <div
      :class="[
        'w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5',
        isUser ? 'bg-accent text-white' : 'bg-highlight/15 text-highlight'
      ]"
    >
      <svg v-if="isUser" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>

    <!-- Message content -->
    <div :class="['max-w-[85%] min-w-0', isUser ? 'items-end' : 'items-start']">
      <!-- File attachments -->
      <div
        v-if="message.files && message.files.length > 0"
        class="flex flex-wrap gap-2 mb-2"
      >
        <div
          v-for="file in message.files"
          :key="file.id"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-sidebar border border-border text-xs text-text-secondary"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.325a1.5 1.5 0 01-2.121-2.121l9.624-9.624" />
          </svg>
          <span class="truncate max-w-[120px]">{{ file.name }}</span>
        </div>
      </div>

      <!-- Bubble -->
      <div
        :class="[
          'rounded-2xl px-4 py-3 text-[15px]',
          isUser
            ? 'bg-bubble-user text-text-primary rounded-tr-md'
            : 'bg-bubble-ai text-text-primary rounded-tl-md'
        ]"
      >
        <!-- Loading state -->
        <div v-if="!message.content && message.isStreaming" class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <!-- Content -->
        <div
          v-else
          :class="['message-content', message.isStreaming ? 'streaming-cursor' : '']"
          v-html="renderedContent"
        />
      </div>

      <!-- Timestamp -->
      <div :class="['text-[11px] text-text-muted mt-1 px-1', isUser ? 'text-right' : 'text-left']">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { Message } from '@/types'

const props = defineProps<{
  message: Message
}>()

const isUser = computed(() => props.message.role === 'user')

const renderedContent = computed(() => {
  if (!props.message.content) return ''
  if (isUser.value) {
    // User messages: plain text with line breaks
    return escapeHtml(props.message.content).replace(/\n/g, '<br>')
  }
  // AI messages: render markdown
  try {
    return marked.parse(props.message.content, { async: false }) as string
  } catch {
    return escapeHtml(props.message.content)
  }
})

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
