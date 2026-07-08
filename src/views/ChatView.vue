<template>
  <div class="flex h-full w-full overflow-hidden bg-bg-primary">
    <!-- Mobile overlay -->
    <div
      v-if="chatStore.isMobile && chatStore.sidebarOpen"
      class="fixed inset-0 z-30 bg-black/30 md:hidden"
      @click="chatStore.setSidebarOpen(false)"
    />

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main chat area -->
    <main class="flex flex-1 flex-col min-w-0">
      <!-- Header -->
      <header class="flex items-center h-14 px-4 border-b border-border bg-bg-surface/80 backdrop-blur-sm shrink-0">
        <button
          class="mr-3 p-2 rounded-lg hover:bg-border-light transition-colors duration-150 md:hidden"
          @click="chatStore.toggleSidebar()"
        >
          <svg class="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 class="text-base font-semibold text-text-primary truncate">
          {{ conversationStore.activeConversation?.title || '云间智聊' }}
        </h1>
      </header>

      <!-- Messages area -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto"
        @scroll="handleScroll"
      >
        <div class="max-w-[800px] mx-auto px-4 py-6">
          <!-- Empty state -->
          <div
            v-if="!conversationStore.activeConversation || conversationStore.activeConversation.messages.length === 0"
            class="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div class="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-text-primary mb-2">开始新的对话</h2>
            <p class="text-text-secondary text-sm max-w-sm">
              输入你的问题，或上传文件让我帮你分析。支持文档、图片等多种格式。
            </p>
          </div>

          <!-- Message list -->
          <MessageList
            v-else
            :messages="conversationStore.activeConversation.messages"
          />
        </div>
      </div>

      <!-- Input area -->
      <ChatInput @send="handleSend" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConversationStore } from '@/stores/conversation'
import { useChatStore } from '@/stores/chat'
import { streamChat } from '@/utils/sse'
import { v4 as uuidv4 } from 'uuid'
import type { Message, UploadedFile } from '@/types'
import Sidebar from '@/components/Sidebar.vue'
import MessageList from '@/components/MessageList.vue'
import ChatInput from '@/components/ChatInput.vue'

const route = useRoute()
const router = useRouter()
const conversationStore = useConversationStore()
const chatStore = useChatStore()

const messagesContainer = ref<HTMLElement | null>(null)
const autoScroll = ref(true)

function handleScroll(): void {
  const el = messagesContainer.value
  if (!el) return
  const threshold = 100
  autoScroll.value = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

function scrollToBottom(): void {
  if (!autoScroll.value) return
  nextTick(() => {
    const el = messagesContainer.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

async function handleSend(payload: { content: string; files: UploadedFile[] }): Promise<void> {
  const { content, files } = payload

  if (!content.trim() && files.length === 0) return

  // Ensure we have an active conversation
  if (!conversationStore.activeConversation) {
    const conv = conversationStore.createConversation()
    router.replace(`/chat/${conv.id}`)
  }

  const convId = conversationStore.activeConversationId!

  // Update title if it's the first message
  if (conversationStore.activeConversation!.messages.length === 0) {
    const title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
    conversationStore.updateConversationTitle(convId, title)
  }

  // Add user message
  const userMessage: Message = {
    id: uuidv4(),
    role: 'user',
    content,
    timestamp: Date.now(),
    files: files.length > 0 ? files : undefined
  }
  conversationStore.addMessageToConversation(convId, userMessage)
  scrollToBottom()

  // Add placeholder assistant message
  const assistantMessage: Message = {
    id: uuidv4(),
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    isStreaming: true
  }
  conversationStore.addMessageToConversation(convId, assistantMessage)
  scrollToBottom()

  // Start streaming
  chatStore.startStreaming()
  let accumulated = ''

  await streamChat(
    {
      messages: conversationStore.activeConversation!.messages,
      files,
      signal: chatStore.abortController?.signal
    },
    {
      onToken(token: string) {
        accumulated += token
        conversationStore.updateLastAssistantMessage(convId, accumulated)
        scrollToBottom()
      },
      onDone() {
        conversationStore.finalizeLastAssistantMessage(convId)
        chatStore.stopStreaming()
      },
      onError(error: Error) {
        const errorMsg = `抱歉，出现了错误：${error.message}。请稍后重试。`
        conversationStore.updateLastAssistantMessage(convId, errorMsg)
        conversationStore.finalizeLastAssistantMessage(convId)
        chatStore.stopStreaming()
      }
    }
  )
}

function handleResize(): void {
  chatStore.setMobile(window.innerWidth < 768)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  // Set active conversation from route
  const convId = route.params.conversationId as string
  if (convId && conversationStore.conversations.find(c => c.id === convId)) {
    conversationStore.setActiveConversation(convId)
  } else if (conversationStore.conversations.length === 0) {
    // Don't auto-create, let user trigger
  } else if (!conversationStore.activeConversationId) {
    conversationStore.setActiveConversation(conversationStore.conversations[0].id)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => conversationStore.activeConversationId, (newId) => {
  if (newId) {
    router.replace(`/chat/${newId}`)
  }
})

watch(() => conversationStore.activeConversation?.messages?.length, () => {
  scrollToBottom()
})
</script>
