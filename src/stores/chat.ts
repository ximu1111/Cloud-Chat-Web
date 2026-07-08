import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const isStreaming = ref(false)
  const abortController = ref<AbortController | null>(null)
  const sidebarOpen = ref(true)
  const isMobile = ref(false)

  function startStreaming(): void {
    isStreaming.value = true
    abortController.value = new AbortController()
  }

  function stopStreaming(): void {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    isStreaming.value = false
  }

  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(open: boolean): void {
    sidebarOpen.value = open
  }

  function setMobile(mobile: boolean): void {
    isMobile.value = mobile
    if (mobile) {
      sidebarOpen.value = false
    }
  }

  return {
    isStreaming,
    abortController,
    sidebarOpen,
    isMobile,
    startStreaming,
    stopStreaming,
    toggleSidebar,
    setSidebarOpen,
    setMobile
  }
})
