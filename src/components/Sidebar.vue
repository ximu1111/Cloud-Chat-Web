<template>
  <aside
    :class="[
      'flex flex-col h-full bg-bg-sidebar border-r border-border transition-all duration-300 ease-out shrink-0',
      chatStore.isMobile
        ? `fixed z-40 ${chatStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
        : chatStore.sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
    ]"
    :style="chatStore.isMobile ? 'width: 280px; top: 0; left: 0;' : ''"
  >
    <!-- Sidebar header -->
    <div class="flex items-center justify-between p-4 border-b border-border">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3 3 0 003-3v-6.75a3 3 0 00-3-3H6.75a4.5 4.5 0 00-4.5 4.5V15z" />
          </svg>
        </div>
        <span class="font-semibold text-text-primary text-sm">云间智聊</span>
      </div>
      <button
        v-if="chatStore.isMobile"
        class="p-1.5 rounded-lg hover:bg-border-light transition-colors duration-150"
        @click="chatStore.setSidebarOpen(false)"
      >
        <svg class="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- New chat button -->
    <div class="p-3">
      <button
        class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors duration-150"
        @click="handleNewChat"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        新建对话
      </button>
    </div>

    <!-- Conversation list -->
    <div class="flex-1 overflow-y-auto px-3 pb-3">
      <div class="space-y-1">
        <div
          v-for="conv in conversationStore.sortedConversations"
          :key="conv.id"
          :class="[
            'group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150',
            conv.id === conversationStore.activeConversationId
              ? 'bg-accent/10 text-accent'
              : 'text-text-secondary hover:bg-border-light hover:text-text-primary'
          ]"
          @click="handleSelectConversation(conv.id)"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <span class="flex-1 text-sm truncate">{{ conv.title }}</span>
          <button
            class="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-danger-light transition-all duration-150"
            @click.stop="handleDeleteConversation(conv.id)"
          >
            <svg class="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="conversationStore.conversations.length === 0"
        class="text-center py-8 text-text-muted text-sm"
      >
        暂无对话记录
      </div>
    </div>

    <!-- Sidebar footer -->
    <div class="p-4 border-t border-border">
      <div class="flex items-center gap-2 text-xs text-text-muted">
        <div class="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
          <svg class="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <span>Powered by Cloud Chat AI</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useConversationStore } from '@/stores/conversation'
import { useChatStore } from '@/stores/chat'

const conversationStore = useConversationStore()
const chatStore = useChatStore()

function handleNewChat(): void {
  conversationStore.createConversation()
  if (chatStore.isMobile) {
    chatStore.setSidebarOpen(false)
  }
}

function handleSelectConversation(id: string): void {
  conversationStore.setActiveConversation(id)
  if (chatStore.isMobile) {
    chatStore.setSidebarOpen(false)
  }
}

function handleDeleteConversation(id: string): void {
  conversationStore.deleteConversation(id)
}
</script>
