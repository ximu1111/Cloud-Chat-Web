import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'cloud-chat-conversations'

function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Conversation[]>(loadConversations())
  const activeConversationId = ref<string | null>(null)

  const activeConversation = computed(() =>
    conversations.value.find(c => c.id === activeConversationId.value) || null
  )

  const sortedConversations = computed(() =>
    [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  function createConversation(): Conversation {
    const now = Date.now()
    const conversation: Conversation = {
      id: uuidv4(),
      title: '新对话',
      messages: [],
      createdAt: now,
      updatedAt: now
    }
    conversations.value.unshift(conversation)
    activeConversationId.value = conversation.id
    saveConversations(conversations.value)
    return conversation
  }

  function setActiveConversation(id: string): void {
    activeConversationId.value = id
  }

  function updateConversationTitle(id: string, title: string): void {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.title = title
      conv.updatedAt = Date.now()
      saveConversations(conversations.value)
    }
  }

  function deleteConversation(id: string): void {
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (activeConversationId.value === id) {
      activeConversationId.value = conversations.value[0]?.id || null
    }
    saveConversations(conversations.value)
  }

  function addMessageToConversation(
    conversationId: string,
    message: Conversation['messages'][number]
  ): void {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.messages.push(message)
      conv.updatedAt = Date.now()
      saveConversations(conversations.value)
    }
  }

  function updateLastAssistantMessage(conversationId: string, content: string): void {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      for (let i = conv.messages.length - 1; i >= 0; i--) {
        if (conv.messages[i].role === 'assistant') {
          conv.messages[i].content = content
          conv.messages[i].isStreaming = true
          break
        }
      }
      conv.updatedAt = Date.now()
      saveConversations(conversations.value)
    }
  }

  function finalizeLastAssistantMessage(conversationId: string): void {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      for (let i = conv.messages.length - 1; i >= 0; i--) {
        if (conv.messages[i].role === 'assistant') {
          conv.messages[i].isStreaming = false
          break
        }
      }
      saveConversations(conversations.value)
    }
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,
    sortedConversations,
    createConversation,
    setActiveConversation,
    updateConversationTitle,
    deleteConversation,
    addMessageToConversation,
    updateLastAssistantMessage,
    finalizeLastAssistantMessage
  }
})
