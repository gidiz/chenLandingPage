<template>
  <div class="chat-launcher">
    <div
      v-if="isChatOpen"
      class="chat-panel"
      role="dialog"
      aria-label="צ'אט ייעוץ"
      @keydown="handleChatKeydown"
    >
      <div class="chat-panel__header">
        <div>
          <h3 class="chat-panel__title">צ'אט ייעוץ מהיר</h3>
          <p class="chat-panel__subtitle">מענה ראשוני מהיר לפני קביעת ייעוץ</p>
        </div>
        <button
          type="button"
          class="chat-panel__close"
          aria-label="סגירת חלון צ'אט"
          @click="toggleChat(false)"
        >
          ×
        </button>
      </div>

      <div ref="chatScrollRef" class="chat-panel__messages" aria-live="polite">
        <article
          v-for="(message, index) in chatMessages"
          :key="`${message.role}-${index}`"
          class="chat-bubble"
          :class="message.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant'"
        >
          {{ message.content }}
        </article>
      </div>

      <form class="chat-panel__composer" @submit.prevent="sendMessage">
        <input
          ref="chatInputRef"
          v-model="draftMessage"
          aria-label="הודעה לצ'אט"
          type="text"
          class="chat-panel__input"
          maxlength="1200"
          placeholder="איך אפשר לעזור לך היום?"
          :disabled="isSending"
        />
        <button type="submit" class="chat-panel__send" :disabled="isSending || !draftMessage.trim()">
          {{ isSending ? "שולח..." : "שלח" }}
        </button>
      </form>
    </div>

    <button
      ref="chatTriggerRef"
      type="button"
      class="chat-launcher__trigger"
      :aria-expanded="isChatOpen"
      @click="toggleChat(!isChatOpen)"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5a8.5 8.5 0 0 0-7.2 13l-.9 4 4.1-1a8.5 8.5 0 1 0 4-16Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        />
      </svg>
      <span>{{ isChatOpen ? "סגירת צ'אט" : "פתיחת צ'אט" }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue"

type ChatRole = "assistant" | "user"

type UiMessage = {
  role: ChatRole
  content: string
}

type ChatApiSuccess = {
  reply: string
  requestId: string
}

type ChatApiError = {
  error?: {
    code?: string
    message?: string
  }
  requestId?: string
}

type ChatFetchError = {
  statusCode?: number
  status?: number
  data?: ChatApiError
  message?: string
}

const nuxtApp = useNuxtApp() as {
  $analytics?: {
    trackEvent?: (eventName: string, payload: Record<string, unknown>) => void
  }
}

const isChatOpen = ref(false)
const isSending = ref(false)
const draftMessage = ref("")
const chatInputRef = ref<HTMLInputElement | null>(null)
const chatTriggerRef = ref<HTMLButtonElement | null>(null)
const chatScrollRef = ref<HTMLElement | null>(null)
const chatMessages = ref<UiMessage[]>([
  {
    role: "assistant",
    content: "היי, אני כאן לשאלות כלליות על הטיפולים. אפשר להתחיל בשאלה קצרה 😊",
  },
])

const trackClick = (eventName: string, clickLocation: string): void => {
  nuxtApp.$analytics?.trackEvent?.(eventName, {
    click_location: clickLocation,
    page_path: window.location.pathname,
  })
}

const scrollMessagesToBottom = async (): Promise<void> => {
  await nextTick()

  if (!chatScrollRef.value) {
    return
  }

  chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
}

const toggleChat = (open: boolean): void => {
  isChatOpen.value = open

  if (open) {
    trackClick("chat_open_click", "floating_chat")
    void nextTick(() => chatInputRef.value?.focus())
    void scrollMessagesToBottom()
    return
  }

  void nextTick(() => chatTriggerRef.value?.focus())
}

const handleChatKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    event.preventDefault()
    toggleChat(false)
  }
}

const sendMessage = async (): Promise<void> => {
  const message = draftMessage.value.trim()

  if (!message || isSending.value) {
    return
  }

  chatMessages.value.push({
    role: "user",
    content: message,
  })
  draftMessage.value = ""
  isSending.value = true
  trackClick("chat_send_click", "floating_chat")
  await scrollMessagesToBottom()

  try {
    const payload = await $fetch<ChatApiSuccess>("/api/chat", {
      method: "POST",
      body: {
        message,
        history: chatMessages.value.slice(-10).map((item) => ({
          role: item.role,
          content: item.content,
        })),
      },
    })

    chatMessages.value.push({
      role: "assistant",
      content: payload.reply,
    })
  } catch (error) {
    const apiError = error as ChatFetchError | null

    const statusCode = apiError?.statusCode || apiError?.status || 0
    const dataMessage = apiError?.data?.error?.message || ""
    const rawMessage = apiError?.message || ""

    let fallbackMessage = "כרגע יש עומס בצ'אט. אפשר לנסות שוב או להשאיר פרטים לייעוץ."

    if (dataMessage) {
      fallbackMessage = dataMessage
    } else if (statusCode === 404) {
      fallbackMessage = "שירות הצ'אט לא זמין כרגע בסביבה הזו (נתיב API חסר)."
    } else if (statusCode === 503) {
      fallbackMessage = "שירות הצ'אט לא זמין כרגע. נסי שוב בעוד דקה."
    } else if (rawMessage.toLowerCase().includes("failed to fetch")) {
      fallbackMessage = "לא ניתן להתחבר כרגע לשרת הצ'אט. בדקי חיבור רשת או נסי שוב."
    }

    chatMessages.value.push({
      role: "assistant",
      content: fallbackMessage,
    })
  } finally {
    isSending.value = false
    await scrollMessagesToBottom()
  }
}
</script>

<style scoped>
.chat-launcher {
  position: relative;
  width: fit-content;
  max-width: 100%;
}

.chat-launcher__trigger {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding-block: 0.45rem;
  padding-inline: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
}

.chat-launcher__trigger svg {
  width: 1.2rem;
  height: 1.2rem;
}

.chat-panel {
  position: absolute;
  inset-block-end: calc(100% + 0.75rem);
  inset-inline-start: 0;
  z-index: var(--z-floating);
  width: min(360px, calc(100vw - 36px));
  height: min(520px, calc(100dvh - 120px));
  border-radius: 18px;
  border: 1px solid rgba(31, 106, 122, 0.25);
  background: linear-gradient(170deg, #f8fcfc 0%, #f0f7f8 100%);
  box-shadow: 0 20px 45px rgba(20, 50, 58, 0.24);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(31, 106, 122, 0.18);
}

.chat-panel__title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
  color: #1f4f5a;
}

.chat-panel__subtitle {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: #5d7981;
}

.chat-panel__close {
  width: 44px;
  min-width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #d9ebef;
  color: #2f5d67;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.chat-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-bubble {
  max-width: 88%;
  padding: 9px 11px;
  border-radius: 12px;
  font-size: 0.92rem;
  line-height: 1.4;
  white-space: pre-wrap;
}

.chat-bubble--assistant {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid rgba(56, 109, 120, 0.2);
  color: #1e3f47;
}

.chat-bubble--user {
  align-self: flex-end;
  background: #1f6a7a;
  color: #ffffff;
}

.chat-panel__composer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid rgba(31, 106, 122, 0.16);
  background: #ffffff;
}

.chat-panel__input {
  flex: 1;
  border: 1px solid rgba(62, 110, 120, 0.35);
  border-radius: 10px;
  min-height: 44px;
  padding: 8px 10px;
  font-size: 0.92rem;
}

.chat-panel__send {
  border: none;
  border-radius: 10px;
  min-height: 44px;
  padding: 8px 13px;
  background: #1f6a7a;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.chat-panel__send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-panel {
    width: min(360px, calc(100vw - 2rem));
    height: min(62vh, 470px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-launcher__trigger {
    transition: none;
  }
}
</style>
