<template>
  <div class="floating-social-root">
    <div v-if="isChatOpen" class="chat-panel" role="dialog" aria-label="OpenAI chat">
      <header class="chat-panel__header">
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
      </header>

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
          v-model="draftMessage"
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

    <div class="floating-social-links" aria-label="Social media quick links">
      <button
        type="button"
        class="floating-social-button floating-social-button--chat"
        :aria-label="isChatOpen ? 'סגור צ׳אט' : 'פתח צ׳אט'"
        @click="toggleChat(!isChatOpen)"
      ></button>
      <a
        class="floating-social-button floating-social-button--instagram"
        href="https://www.instagram.com/dr_chen_pardo/"
        target="_blank"
        rel="noopener"
        aria-label="Instagram"
        @click="trackClick('instagram_click', 'floating_instagram')"
      ></a>
      <a
        class="floating-social-button floating-social-button--facebook"
        href="https://www.facebook.com/profile.php?id=61577031445942"
        target="_blank"
        rel="noopener"
        aria-label="Facebook"
        @click="trackClick('facebook_click', 'floating_facebook')"
      ></a>
      <a
        class="floating-social-button floating-social-button--whatsapp"
        href="https://wa.me/972547577214"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        @click="trackClick('whatsapp_click', 'floating_whatsapp')"
      ></a>
    </div>
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
    void scrollMessagesToBottom()
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
.floating-social-root {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
}

.floating-social-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.floating-social-button {
  width: 55px;
  height: 55px;
  display: inline-block;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.floating-social-button--chat {
  background-color: #1f6a7a;
  background-size: 58%;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3C6.486 3 2 6.925 2 11.75c0 2.03.81 3.901 2.165 5.404L3.1 21l4.286-1.57c1.394.677 2.982 1.07 4.614 1.07 5.514 0 10-3.925 10-8.75S17.514 3 12 3zm0 2c4.411 0 8 3.015 8 6.75s-3.589 6.75-8 6.75c-1.453 0-2.858-.334-4.063-.965l-.379-.199-2.13.78.546-1.915-.29-.36C4.59 14.51 4 13.17 4 11.75 4 8.015 7.589 5 12 5z"/></svg>');
}

.chat-panel {
  width: min(360px, calc(100vw - 36px));
  height: min(520px, calc(100vh - 120px));
  margin-bottom: 12px;
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
  width: 28px;
  height: 28px;
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
  padding: 8px 10px;
  font-size: 0.92rem;
}

.chat-panel__send {
  border: none;
  border-radius: 10px;
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

.floating-social-button--instagram {
  background-color: #e1306c;
  background-size: 56%;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 2C4.298 2 2 4.298 2 7.75v8.5C2 19.702 4.298 22 7.75 22h8.5c3.452 0 5.75-2.298 5.75-5.75v-8.5C22 4.298 19.702 2 16.25 2h-8.5zM4 7.75C4 5.679 5.679 4 7.75 4h8.5C18.321 4 20 5.679 20 7.75v8.5C20 18.321 18.321 20 16.25 20h-8.5C5.679 20 4 18.321 4 16.25v-8.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-2a1 1 0 100 2 1 1 0 000-2z"/></svg>');
}

.floating-social-button--facebook {
  background-color: #3b5998;
  background-size: 56%;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.5c0-2.4 1.43-3.8 3.63-3.8 1.05 0 2.15.2 2.15.2v2.36h-1.21c-1.2 0-1.58.74-1.58 1.5V12H18l-.4 3h-2.8v7A10 10 0 0022 12z"/></svg>');
}

.floating-social-button--whatsapp {
  background-color: #25d366;
  background-size: 60%;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16.002 2.004c-7.732 0-14 6.27-14 14 0 2.469.648 4.826 1.882 6.92l-1.998 7.07 7.257-1.9c1.978 1.08 4.21 1.646 6.86 1.646 7.732 0 14-6.27 14-14s-6.27-14-14-14zm0 2c6.627 0 12 5.373 12 12 0 6.627-5.373 12-12 12-2.32 0-4.375-.598-6.215-1.754l-.43-.258-4.3 1.124 1.172-4.148-.28-.442C4.676 20.88 4 18.493 4 16.004c0-6.627 5.373-12 12-12zm-3.414 6.828l-1.172.078c-.324.01-.633.148-.863.387-.227.24-.352.558-.352.887 0 .305-.016.621-.043.95-.082.988.176 2.145.823 3.362.648 1.215 1.625 2.406 2.922 3.57 1.3 1.164 2.555 1.793 3.766 1.883.32.02.637-.09.875-.305.238-.219.375-.523.387-.844l.07-1.164c.02-.32-.09-.637-.305-.875l-1.074-1.07c-.289-.293-.672-.441-1.063-.414-.289.016-.57.109-.816.27l-.86.554a8.345 8.345 0 01-2.118-2.34c-.324-.52-.484-.96-.48-1.324.008-.34.125-.66.344-.918l.738-.89c.238-.285.355-.648.324-1.016-.027-.39-.191-.754-.488-1.028l-1.062-1.078c-.23-.238-.543-.371-.867-.387z"/></svg>');
}

@media (max-width: 768px) {
  .floating-social-root {
    bottom: 14px;
    left: 14px;
  }

  .chat-panel {
    width: min(360px, calc(100vw - 24px));
    height: min(62vh, 470px);
  }

  .floating-social-button {
    width: 50px;
    height: 50px;
  }
}
</style>
