import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import { transpileModule } from "typescript"
import { ref } from "vue"

const readSource = (path: string): Promise<string> =>
  readFile(new URL(path, import.meta.url), "utf8")

const scriptFrom = (source: string): string => {
  const script = source.split("<script setup")[1]?.split("</script>")[0]
  assert.ok(script, "Expected a script setup block")
  return script.replace(/^[^>]*>/, "")
}

const compileScript = (source: string): string =>
  transpileModule(
    source
      .replace(/^import .*$/gm, "")
      .replace(/import\.meta\.client/g, "true"),
    { compilerOptions: { module: 1 } },
  ).outputText

const contrastRatio = (foreground: string, background: string): number => {
  const luminance = (color: string): number => {
    const channels = [1, 3, 5].map((index) =>
      Number.parseInt(color.slice(index, index + 2), 16) / 255,
    )
    const linear = channels.map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    )
    return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
  }

  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (values[0]! + 0.05) / (values[1]! + 0.05)
}

test("mobile menu keeps its close control in the Tab cycle and restores focus on Escape", async () => {
  class TestNode {}

  const documentState: { activeElement: TestElement | null } = { activeElement: null }
  class TestElement extends TestNode {
    focusCount = 0

    constructor(private readonly owns: Set<TestNode> = new Set()) {
      super()
    }

    focus(): void {
      this.focusCount += 1
      documentState.activeElement = this
    }

    getClientRects(): Array<object> {
      return [{}]
    }

    contains(target: TestNode): boolean {
      return this.owns.has(target)
    }

    querySelectorAll(): TestElement[] {
      return []
    }
  }

  const firstItem = new TestElement()
  const lastItem = new TestElement()
  const navMenu = new TestElement(new Set([firstItem, lastItem]))
  const menuToggle = new TestElement()
  const listeners: Record<string, (event: unknown) => void> = {}
  const onMountedCallbacks: Array<() => void> = []
  const rootClasses = { toggle: (): void => undefined, remove: (): void => undefined }
  const documentStub = {
    activeElement: documentState.activeElement,
    documentElement: { classList: rootClasses },
    addEventListener: (name: string, listener: (event: unknown) => void): void => {
      listeners[name] = listener
    },
    removeEventListener: (): void => undefined,
  }
  const windowStub = {
    scrollY: 0,
    matchMedia: (): {
      matches: boolean
      addEventListener: () => void
      removeEventListener: () => void
    } => ({
      matches: true,
      addEventListener: (): void => undefined,
      removeEventListener: (): void => undefined,
    }),
    addEventListener: (): void => undefined,
    removeEventListener: (): void => undefined,
  }

  const source = await readSource("../components/AppHeader.vue")
  const compiled = compileScript(scriptFrom(source))
  const createFixture = new Function(
    "ref",
    "nextTick",
    "onMounted",
    "onBeforeUnmount",
    "watch",
    "useTreatmentCatalog",
    "document",
    "window",
    "Node",
    `${compiled}
      return {
        isOpen,
        isMobileViewport,
        menuToggleElement,
        navMenuElement,
        toggleMenu,
        handleGlobalKeydown,
      }`,
  ) as (...args: unknown[]) => {
    isOpen: { value: boolean }
    isMobileViewport: { value: boolean }
    menuToggleElement: { value: TestElement | null }
    navMenuElement: { value: TestElement | null }
    toggleMenu: () => void
    handleGlobalKeydown: (event: {
      key: string
      shiftKey?: boolean
      target?: TestNode
      preventDefault: () => void
    }) => void
  }
  const fixture = createFixture(
    ref,
    (callback?: () => void): Promise<void> =>
      Promise.resolve().then(() => callback?.()),
    (callback: () => void): void => {
      onMountedCallbacks.push(callback)
    },
    (): void => undefined,
    (): void => undefined,
    () => ({ treatmentCategories: [], getCategoryBySlug: () => null }),
    documentStub,
    windowStub,
    TestNode,
  )

  fixture.menuToggleElement.value = menuToggle
  fixture.navMenuElement.value = navMenu
  navMenu.querySelectorAll = () => [firstItem, lastItem]
  for (const callback of onMountedCallbacks) callback()

  fixture.toggleMenu()
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(fixture.isOpen.value, true)
  assert.equal(documentState.activeElement, firstItem)

  let prevented = false
  fixture.handleGlobalKeydown({
    key: "Tab",
    target: menuToggle,
    preventDefault: () => { prevented = true },
  })
  assert.equal(prevented, true)
  assert.equal(documentState.activeElement, firstItem)

  prevented = false
  fixture.handleGlobalKeydown({
    key: "Tab",
    shiftKey: true,
    target: firstItem,
    preventDefault: () => { prevented = true },
  })
  assert.equal(prevented, true)
  assert.equal(documentState.activeElement, fixture.menuToggleElement.value)

  prevented = false
  fixture.handleGlobalKeydown({
    key: "Tab",
    shiftKey: true,
    target: menuToggle,
    preventDefault: () => { prevented = true },
  })
  assert.equal(prevented, true)
  assert.equal(documentState.activeElement, lastItem)

  prevented = false
  fixture.handleGlobalKeydown({
    key: "Tab",
    target: lastItem,
    preventDefault: () => { prevented = true },
  })
  assert.equal(prevented, true)
  assert.equal(documentState.activeElement, fixture.menuToggleElement.value)

  fixture.toggleMenu()
  assert.equal(fixture.isOpen.value, false)
  assert.equal(documentState.activeElement, fixture.menuToggleElement.value)
  fixture.toggleMenu()
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(fixture.isOpen.value, true)
  assert.equal(documentState.activeElement, firstItem)

  fixture.handleGlobalKeydown({
    key: "Escape",
    target: firstItem,
    preventDefault: () => undefined,
  })
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(fixture.isOpen.value, false)
  assert.equal(documentState.activeElement, fixture.menuToggleElement.value)
})

test("chat opening, Escape close, and close control restore focus without a nested banner", async () => {
  const source = await readSource("../components/FloatingSocialLinks.vue")
  const compiled = compileScript(scriptFrom(source))
  const focused = { input: 0, trigger: 0 }
  const createFixture = new Function(
    "ref",
    "nextTick",
    "useNuxtApp",
    "window",
    `${compiled}
      return {
        isChatOpen,
        chatInputRef,
        chatTriggerRef,
        toggleChat,
        handleChatKeydown,
      }`,
  ) as (...args: unknown[]) => {
    isChatOpen: { value: boolean }
    chatInputRef: { value: { focus: () => void } | null }
    chatTriggerRef: { value: { focus: () => void } | null }
    toggleChat: (open: boolean) => void
    handleChatKeydown: (event: { key: string; preventDefault: () => void }) => void
  }
  const fixture = createFixture(
    ref,
    (callback?: () => void): Promise<void> =>
      Promise.resolve().then(() => callback?.()),
    () => ({ $analytics: { trackEvent: (): void => undefined } }),
    { location: { pathname: "/videos" } },
  )
  fixture.chatInputRef.value = { focus: () => { focused.input += 1 } }
  fixture.chatTriggerRef.value = { focus: () => { focused.trigger += 1 } }

  fixture.toggleChat(true)
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(fixture.isChatOpen.value, true)
  assert.equal(focused.input, 1)

  let prevented = false
  fixture.handleChatKeydown({
    key: "Escape",
    preventDefault: () => { prevented = true },
  })
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(prevented, true)
  assert.equal(fixture.isChatOpen.value, false)
  assert.equal(focused.trigger, 1)
  assert.match(source, /role="dialog"/)
  assert.doesNotMatch(source, /<header\b/)
  assert.match(source, /@keydown="handleChatKeydown"/)

  fixture.toggleChat(true)
  await new Promise<void>((resolve) => setImmediate(resolve))
  fixture.toggleChat(false)
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(focused.trigger, 2)
})

test("videos picker has list and selected semantics with live result and empty states", async () => {
  const videos = await readSource("../pages/videos.vue")
  const breadcrumb = await readSource("../components/AppBreadcrumbs.vue")
  const template = videos.split("<script setup")[0] ?? ""

  assert.match(template, /<ul class="videos-grid">/)
  assert.match(template, /<li\b[^>]*class="video-card-item"/)
  assert.match(template, /:aria-pressed="video\.videoId === activeVideo\?\.videoId"/)
  assert.match(template, /class="videos-count" role="status" aria-live="polite"/)
  assert.match(template, /class="videos-empty"[\s\S]*?role="status"[\s\S]*?aria-live="polite"/)
  assert.match(videos, /\.videos-filter-input\s*\{[^}]*scroll-margin-block-start:\s*7rem/s)
  const globalStyles = await readSource("../assets/css/index.css")
  assert.match(globalStyles, /html\s*\{[^}]*scroll-padding-block-start:\s*7rem/s)
  assert.match(breadcrumb, /videos:\s*"סרטונים"/)
})

test("accessibility document gets a descriptive title without adding statement claims", async () => {
  const page = await readSource("../pages/accessibility.vue")
  assert.match(page, /useSeoMeta\(\{\s*title:\s*"הצהרת נגישות \| ד\\"ר חן פרדו"/)
  assert.equal((page.match(/<h1\b/g) ?? []).length, 1)
})

test("hover gradient and focus rings meet their contrast thresholds", async () => {
  const css = await readSource("../assets/css/index.css")
  const contact = await readSource("../components/ContactSection.vue")
  const gradient = css.match(
    /--gradient-primary-hover:\s*linear-gradient\(135deg,\s*(#[0-9a-f]{6})\s+0%,\s*(#[0-9a-f]{6})\s+100%\)/i,
  )
  assert.ok(gradient?.[1] && gradient[2])
  assert.match(css, /\.cta-button:hover\s*\{[^}]*background:\s*var\(--gradient-primary-hover\)/s)
  assert.match(contact, /#contact-form button:hover\s*\{[^}]*background:\s*var\(--gradient-primary-hover\)/s)

  const sampleCount = 100
  let minimumGradientContrast = Number.POSITIVE_INFINITY
  for (let step = 0; step <= sampleCount; step += 1) {
    const progress = step / sampleCount
    const color = [1, 3, 5]
      .map((index) => {
        const start = Number.parseInt(gradient[1]!.slice(index, index + 2), 16)
        const end = Number.parseInt(gradient[2]!.slice(index, index + 2), 16)
        return Math.round(start + (end - start) * progress)
          .toString(16)
          .padStart(2, "0")
      })
      .join("")
    minimumGradientContrast = Math.min(
      minimumGradientContrast,
      contrastRatio("#ffffff", `#${color}`),
    )
  }
  assert.ok(minimumGradientContrast >= 4.5, `Minimum gradient contrast ${minimumGradientContrast}`)

  assert.match(css, /--color-focus:\s*#263f3e/i)
  assert.match(css, /--color-focus-contrast:\s*#ffffff/i)
  assert.match(css, /:focus-visible\s*\{[^}]*outline: 3px solid var\(--color-focus\)/s)
  assert.match(css, /:focus-visible\s*\{[^}]*box-shadow: 0 0 0 3px var\(--color-focus-contrast\)/s)
  for (const lightSurface of ["#ffffff", "#f0ece6", "#f3eadb"]) {
    assert.ok(contrastRatio("#263f3e", lightSurface) >= 3)
  }
  for (const darkSurface of [gradient[1]!, gradient[2]!]) {
    assert.ok(contrastRatio("#ffffff", darkSurface) >= 3)
  }
})

test("skip link and reduced-motion behavior remain present", async () => {
  const layout = await readSource("../layouts/default.vue")
  const css = await readSource("../assets/css/index.css")
  const header = await readSource("../components/AppHeader.vue")
  assert.match(layout, /class="skip-link" href="#main-content"/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?scroll-behavior:\s*auto/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.cta-button,[\s\S]*?transition:\s*none/)
  assert.match(header, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(header, /\.nav-menu,\s*\.nav-dropdown__chevron,[\s\S]*?transition:\s*none/)
})
