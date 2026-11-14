import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import { runInNewContext } from "node:vm"
import { transpileModule } from "typescript"

const source = await readFile(new URL("../plugins/enable.client.ts", import.meta.url), "utf8")
const compiled = transpileModule(source, { compilerOptions: { module: 1 } }).outputText

const createFixture = (origin: string) => {
  const scripts: Array<{
    id: string
    src: string
    async: boolean
    onerror: (() => void) | null
  }> = []
  const errors: string[] = []
  const bodyClasses = new Set<string>()
  let mounted: (() => void) | undefined
  const context = {
    exports: { default: (_app: unknown): void => undefined },
    defineNuxtPlugin: (plugin: unknown) => plugin,
    window: { location: { origin } },
    document: {
      body: { classList: { add: (name: string) => bodyClasses.add(name) } },
      getElementById: (id: string) => scripts.find((script) => script.id === id),
      createElement: (tag: string) => {
        assert.equal(tag, "script")
        return { id: "", src: "", async: false, onerror: null }
      },
      head: {
        appendChild: (script: (typeof scripts)[number]) => scripts.push(script),
      },
    },
    console: { error: (message: string) => errors.push(message) },
  }
  runInNewContext(compiled, context)
  context.exports.default({
    hook: (name: string, callback: () => void) => {
      assert.equal(name, "app:mounted")
      mounted = callback
    },
  })
  assert.ok(mounted)
  return { mount: mounted, scripts, errors, bodyClasses }
}

test("loads the supplied Enable script once on the test origin", () => {
  const { mount, scripts, bodyClasses } = createFixture("https://test.drchenpardo.co.il")
  mount()
  mount()

  assert.equal(scripts.length, 1)
  assert.equal(scripts[0]?.id, "enable-accessibility-script")
  assert.equal(
    scripts[0]?.src,
    "https://cdn.enable.co.il/licenses/enable-L55868azwufvuoa6-0726-84216/init.js",
  )
  assert.equal(scripts[0]?.async, true)
  assert.equal(bodyClasses.has("enable-test-toolbar"), true)
})

test("does not load the script on production, preview, or lookalike origins", () => {
  for (const origin of [
    "https://drchenpardo.co.il",
    "https://www.drchenpardo.co.il",
    "https://example.vercel.app",
    "https://test.drchenpardo.co.il.example.com",
    "http://test.drchenpardo.co.il",
    "https://test.drchenpardo.co.il:8443",
    "http://localhost:3000",
  ]) {
    const { mount, scripts, bodyClasses } = createFixture(origin)
    mount()
    assert.equal(scripts.length, 0, origin)
    assert.equal(bodyClasses.size, 0, origin)
  }
})

test("reports a script loading failure in the browser console", () => {
  const { mount, scripts, errors } = createFixture("https://test.drchenpardo.co.il")
  mount()
  assert.ok(scripts[0]?.onerror)
  scripts[0].onerror()
  assert.deepEqual(errors, ["Failed to load the Enable accessibility widget."])
})
