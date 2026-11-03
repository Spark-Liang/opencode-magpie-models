# opencode-magpie-models

[OpenCode](https://opencode.ai) V2 plugin for a [Magpie](https://usemagpie.ai) gateway: registers a
provider whose models come from Magpie's `/v1/models`, so no model list has to be written into
`opencode.jsonc` or kept up to date by hand.

This repository is the [`Spark-Liang`](https://github.com/Spark-Liang) fork of
[`seanmamasde/opencode-magpie-models`](https://github.com/seanmamasde/opencode-magpie-models). It
adds the fields the upstream plugin did not map yet:

- `tool_call` / `supported_parameters` → OpenCode `capabilities.tools`
- `max_input_tokens` → `limit.input`
- `context_window` fallback when `context_length` is absent
- inline `apiKey` as an alternative to `keyFile`

Each model gets Magpie's label, context/input/output limits, input/output types, tool support and
reasoning levels (as OpenCode variants). The list is read when OpenCode starts and again every hour.
If Magpie can't be reached, the last list saved in
`$XDG_CACHE_HOME/opencode-magpie-models/<id>.json` is used.

## Install

For a local checkout or a git submodule, point `package` at the folder's absolute path:

```jsonc
{
  "plugins": [
    {
      "package": "/path/to/opencode-magpie-models",
      "options": {
        "baseURL": "https://magpie.example.com/v1",
        "apiKey": "sk-magpie-key-...",
        // or: "keyFile": "~/.secrets/magpie-key",
        // optional: "id" (default "magpie"), "name" (default "Magpie"),
        // "refreshMinutes" (default 60)
      },
    },
  ],
}
```

`apiKey` takes precedence when both `apiKey` and `keyFile` are provided. Use a Magpie **Gateway** key,
not the Web UI login key. Do not commit a key file or an inline key to a repository.

OpenCode picks up the change by itself (or run `opencode service restart`). Models appear as
`magpie/<provider>/<model>`, e.g. `magpie/claude/claude-sonnet-5-5#high`.

The plugin only maps the OpenAI-compatible Chat transport. Magpie's `native_endpoints`, `pricing`,
and Model Map aliases are not exposed through OpenCode's model shape yet.

## Develop

```sh
npm install
bun test
```

Tested with OpenCode 2.1.2 and 2.2.5.

## License

MIT. See [LICENSE](LICENSE); the original project is by
[`seanmamasde`](https://github.com/seanmamasde/opencode-magpie-models).
