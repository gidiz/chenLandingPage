import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

const EXPECTED_TOOL_NAMES = [
  "aws_get_s3_bucket_location",
  "aws_list_cloudfront_distributions",
  "aws_list_s3_buckets",
  "ga4_list_accounts",
  "ga4_list_properties",
  "ga4_run_report",
  "github_get_repository",
  "github_list_issues",
  "gtm_list_accounts",
  "gtm_list_containers",
  "gtm_list_tags",
  "gtm_list_workspaces",
] as const

function formatList(items: readonly string[]): string {
  return items.join(", ")
}

async function main(): Promise<void> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", "./server/mcp/index.ts"],
    cwd: process.cwd(),
    stderr: "inherit",
  })

  const client = new Client(
    {
      name: "chen-mcp-smoke-test",
      version: "0.1.0",
    },
    {
      capabilities: {},
    },
  )

  try {
    await client.connect(transport)

    const toolsResult = await client.listTools()
    const actualToolNames = toolsResult.tools.map((tool) => tool.name).sort()
    const expectedToolNames = [...EXPECTED_TOOL_NAMES].sort()
    const expectedToolNameSet = new Set<string>(expectedToolNames)

    const missingTools = expectedToolNames.filter((toolName) => !actualToolNames.includes(toolName))
    const unexpectedTools = actualToolNames.filter((toolName) => !expectedToolNameSet.has(toolName))

    if (missingTools.length || unexpectedTools.length) {
      const messages = [
        missingTools.length ? `Missing tools: ${formatList(missingTools)}` : "",
        unexpectedTools.length ? `Unexpected tools: ${formatList(unexpectedTools)}` : "",
      ].filter(Boolean)

      throw new Error(messages.join("\n"))
    }

    process.stdout.write(`MCP smoke test passed. Tools: ${formatList(actualToolNames)}\n`)
  } finally {
    await transport.close()
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown smoke test failure"
  process.stderr.write(`MCP smoke test failed: ${message}\n`)
  process.exit(1)
})