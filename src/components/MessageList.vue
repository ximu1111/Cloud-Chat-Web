<template>
  <div class="space-y-6">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-enter"
    >
      <MessageBubble :message="message" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/types'
import MessageBubble from './MessageBubble.vue'

defineProps<{
  messages: Message[]
}>()
</script>
