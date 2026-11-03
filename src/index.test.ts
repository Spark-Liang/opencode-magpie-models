import { expect, test } from "bun:test"
import { parseList, toModels } from "./index"

test("maps Magpie's /v1/models entry to OpenCode's model shape", () => {
  const [m] = toModels("magpie", [{
    id: "claude/claude-sonnet-5-5",
    magpie_label: "Claude Sonnet 5.5 · Claude Code",
    context_length: 1_000_000,
    max_output_tokens: 128_000,
    modalities: { input: ["text", "image"], output: ["text"] },
    reasoning: true,
    reasoning_levels: ["low", "max"],
  }])
  expect(m.name).toBe("Claude Sonnet 5.5 · Claude Code")
  expect(m.limit).toEqual({ context: 1_000_000, output: 128_000 })
  expect(m.capabilities.input).toEqual(["text", "image"])
  expect(m.variants).toEqual([
    { id: "low", settings: { reasoningEffort: "low" } },
    { id: "max", settings: { reasoningEffort: "max" } },
  ] as any)
})

test("missing metadata: text only, no variants, default limits", () => {
  const [m] = toModels("magpie", [{ id: "x", reasoning_levels: ["high"], context_length: -1 }])
  expect(m.capabilities.input).toEqual(["text"])
  expect(m.variants).toEqual([])
  expect(m.limit.context).toBe(200_000)
})

test("reasoning levels are lower-cased", () => {
  const [m] = toModels("magpie", [{ id: "zed/gemini", reasoning: true, reasoning_levels: ["LOW", "HIGH"] }])
  expect(m.variants.map((v) => v.id)).toEqual(["low", "high"] as any)
})

test("maps tool support and input limits", () => {
  const [m] = toModels("magpie", [{
    id: "x",
    context_length: 128_000,
    context_window: 256_000,
    max_input_tokens: 120_000,
    max_output_tokens: 8_192,
    tool_call: false,
    supported_parameters: ["tools", "reasoning"],
  }])
  expect(m.capabilities.tools).toBe(false)
  expect(m.limit).toEqual({ context: 128_000, input: 120_000, output: 8_192 })
})

test("falls back to context_window and supported_parameters", () => {
  const [m] = toModels("magpie", [{
    id: "x",
    context_window: 32_768,
    supported_parameters: ["tools"],
  }])
  expect(m.limit.context).toBe(32_768)
  expect(m.capabilities.tools).toBe(true)
})

test("supported_parameters without tools disables tools", () => {
  const [m] = toModels("magpie", [{ id: "x", supported_parameters: ["temperature"] }])
  expect(m.capabilities.tools).toBe(false)
})

test("keeps the default tool capability when no tool metadata exists", () => {
  const [m] = toModels("magpie", [{ id: "x" }])
  expect(m.capabilities.tools).toBe(true)
})

test("rejects a response without a data array and drops entries without an id", () => {
  expect(() => parseList({ error: "nope" })).toThrow()
  expect(parseList({ data: [{ id: "a" }, { id: 3 }, null] }).map((m) => m.id)).toEqual(["a"])
})
