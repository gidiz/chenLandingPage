import { CloudFrontClient, ListDistributionsCommand } from "@aws-sdk/client-cloudfront"
import { GetBucketLocationCommand, ListBucketsCommand, S3Client } from "@aws-sdk/client-s3"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { Octokit } from "@octokit/rest"
import { google } from "googleapis"
import { z } from "zod"

const DEFAULT_AWS_REGION = process.env.AWS_REGION || "us-east-1"
const DEFAULT_GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || "gidiz/chenLandingPage"
const GOOGLE_ANALYTICS_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
]

const GOOGLE_TAG_MANAGER_SCOPES = [
  "https://www.googleapis.com/auth/tagmanager.readonly",
] as const

type RepositoryRef = {
  owner: string
  repo: string
}

const server = new McpServer({
  name: "chen-integrations",
  version: "0.1.0",
})

function createTextResult(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  }
}

function formatErrorMessage(toolName: string, error: unknown): string {
  if (error instanceof Error) {
    return `${toolName} failed: ${error.message}`
  }

  return `${toolName} failed with an unknown error`
}

async function runTool(toolName: string, action: () => Promise<string>) {
  try {
    return createTextResult(await action())
  } catch (error) {
    return createTextResult(formatErrorMessage(toolName, error))
  }
}

function normalizeRepository(repository?: string): RepositoryRef {
  const rawRepository = (repository || DEFAULT_GITHUB_REPOSITORY).trim()
  const [owner, repo] = rawRepository.split("/")

  if (!owner || !repo) {
    throw new Error(
      "Expected a repository in owner/repo format. Set GITHUB_REPOSITORY or pass a repository argument.",
    )
  }

  return { owner, repo }
}

function parseOptionalCredentialsJson(): Record<string, unknown> | undefined {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()

  if (!credentialsJson) {
    return undefined
  }

  const parsedCredentials = JSON.parse(credentialsJson) as unknown

  if (!parsedCredentials || typeof parsedCredentials !== "object") {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must be a valid JSON object")
  }

  return parsedCredentials as Record<string, unknown>
}

function createGoogleAuth(scopes: readonly string[]) {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  const credentials = parseOptionalCredentialsJson()

  return new google.auth.GoogleAuth({
    scopes: [...scopes],
    keyFile: keyFile || undefined,
    credentials,
  })
}

function createS3Client(region = DEFAULT_AWS_REGION): S3Client {
  return new S3Client({ region })
}

function createCloudFrontClient(region = DEFAULT_AWS_REGION): CloudFrontClient {
  return new CloudFrontClient({ region })
}

function createOctokit(): Octokit {
  const auth = process.env.GITHUB_TOKEN?.trim()

  return new Octokit(auth ? { auth } : undefined)
}

function formatMultilineList(title: string, items: readonly string[]): string {
  if (!items.length) {
    return `${title}\n\nNo results found.`
  }

  return `${title}\n\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}`
}

server.registerTool(
  "ga4_list_accounts",
  {
    description: "List the GA4 accounts accessible to the configured Google credentials.",
    inputSchema: {
      pageSize: z.number().int().min(1).max(100).optional().describe("Maximum number of accounts to return."),
    },
  },
  async ({ pageSize = 20 }) =>
    runTool("ga4_list_accounts", async () => {
      const analyticsAdmin = google.analyticsadmin({
        version: "v1beta",
        auth: createGoogleAuth(GOOGLE_ANALYTICS_SCOPES),
      })

      const response = await analyticsAdmin.accounts.list({ pageSize })
      const accounts = response.data.accounts || []

      return formatMultilineList(
        "GA4 accounts",
        accounts.map((account) => `${account.name || "accounts/unknown"} - ${account.displayName || "Unnamed account"}`),
      )
    }),
)

server.registerTool(
  "ga4_list_properties",
  {
    description: "List GA4 properties for a specific GA4 account.",
    inputSchema: {
      accountId: z.string().min(1).describe("GA4 account ID, for example 123456789."),
      pageSize: z.number().int().min(1).max(200).optional().describe("Maximum number of properties to return."),
    },
  },
  async ({ accountId, pageSize = 50 }) =>
    runTool("ga4_list_properties", async () => {
      const analyticsAdmin = google.analyticsadmin({
        version: "v1beta",
        auth: createGoogleAuth(GOOGLE_ANALYTICS_SCOPES),
      })

      const response = await analyticsAdmin.properties.list({
        filter: `parent:accounts/${accountId}`,
        pageSize,
      })
      const properties = response.data.properties || []

      return formatMultilineList(
        `GA4 properties for account ${accountId}`,
        properties.map(
          (property) =>
            `${property.name || "properties/unknown"} - ${property.displayName || "Unnamed property"} (${property.propertyType || "unknown type"})`,
        ),
      )
    }),
)

server.registerTool(
  "ga4_run_report",
  {
    description: "Run a read-only GA4 Data API report for a property.",
    inputSchema: {
      propertyId: z.string().min(1).describe("GA4 property ID, for example 345678901."),
      dimensions: z.array(z.string().min(1)).min(1).optional().describe("Dimension names to include, such as date or country."),
      metrics: z.array(z.string().min(1)).min(1).describe("Metric names to include, such as activeUsers."),
      startDate: z.string().min(1).describe("Report start date, for example 7daysAgo or 2026-06-01."),
      endDate: z.string().min(1).describe("Report end date, for example today or 2026-06-28."),
      limit: z.number().int().min(1).max(1000).optional().describe("Maximum number of rows to return."),
    },
  },
  async ({ propertyId, dimensions = ["date"], metrics, startDate, endDate, limit = 100 }) =>
    runTool("ga4_run_report", async () => {
      const analyticsData = google.analyticsdata({
        version: "v1beta",
        auth: createGoogleAuth(GOOGLE_ANALYTICS_SCOPES),
      })

      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: dimensions.map((name: string) => ({ name })),
          metrics: metrics.map((name: string) => ({ name })),
          limit: String(limit),
        },
      })

      const payload = {
        rowCount: response.data.rowCount || 0,
        dimensionHeaders: response.data.dimensionHeaders?.map((header) => header.name) || [],
        metricHeaders: response.data.metricHeaders?.map((header) => header.name) || [],
        rows:
          response.data.rows?.map((row) => ({
            dimensions: row.dimensionValues?.map((value) => value.value || "") || [],
            metrics: row.metricValues?.map((value) => value.value || "") || [],
          })) || [],
      }

      return `GA4 Data API report for property ${propertyId}\n\n${JSON.stringify(payload, null, 2)}`
    }),
)

server.registerTool(
  "gtm_list_accounts",
  {
    description: "List Google Tag Manager accounts accessible to the configured Google credentials.",
    inputSchema: {},
  },
  async () =>
    runTool("gtm_list_accounts", async () => {
      const tagManager = google.tagmanager({
        version: "v2",
        auth: createGoogleAuth(GOOGLE_TAG_MANAGER_SCOPES),
      })

      const response = await tagManager.accounts.list()
      const accounts = response.data.account || []

      return formatMultilineList(
        "GTM accounts",
        accounts.map((account) => `${account.accountId || "unknown"} - ${account.name || "Unnamed GTM account"}`),
      )
    }),
)

server.registerTool(
  "gtm_list_containers",
  {
    description: "List Google Tag Manager containers for an account.",
    inputSchema: {
      accountId: z.string().min(1).describe("GTM account ID."),
    },
  },
  async ({ accountId }) =>
    runTool("gtm_list_containers", async () => {
      const tagManager = google.tagmanager({
        version: "v2",
        auth: createGoogleAuth(GOOGLE_TAG_MANAGER_SCOPES),
      })

      const response = await tagManager.accounts.containers.list({
        parent: `accounts/${accountId}`,
      })
      const containers = response.data.container || []

      return formatMultilineList(
        `GTM containers for account ${accountId}`,
        containers.map(
          (container) => `${container.containerId || "unknown"} - ${container.name || "Unnamed container"} (${container.publicId || "no public ID"})`,
        ),
      )
    }),
)

server.registerTool(
  "gtm_list_workspaces",
  {
    description: "List Google Tag Manager workspaces for a container.",
    inputSchema: {
      accountId: z.string().min(1).describe("GTM account ID."),
      containerId: z.string().min(1).describe("GTM container ID."),
    },
  },
  async ({ accountId, containerId }) =>
    runTool("gtm_list_workspaces", async () => {
      const tagManager = google.tagmanager({
        version: "v2",
        auth: createGoogleAuth(GOOGLE_TAG_MANAGER_SCOPES),
      })

      const response = await tagManager.accounts.containers.workspaces.list({
        parent: `accounts/${accountId}/containers/${containerId}`,
      })
      const workspaces = response.data.workspace || []

      return formatMultilineList(
        `GTM workspaces for container ${containerId}`,
        workspaces.map((workspace) => `${workspace.workspaceId || "unknown"} - ${workspace.name || "Unnamed workspace"}`),
      )
    }),
)

server.registerTool(
  "gtm_list_tags",
  {
    description: "List Google Tag Manager tags in a workspace.",
    inputSchema: {
      accountId: z.string().min(1).describe("GTM account ID."),
      containerId: z.string().min(1).describe("GTM container ID."),
      workspaceId: z.string().min(1).describe("GTM workspace ID."),
    },
  },
  async ({ accountId, containerId, workspaceId }) =>
    runTool("gtm_list_tags", async () => {
      const tagManager = google.tagmanager({
        version: "v2",
        auth: createGoogleAuth(GOOGLE_TAG_MANAGER_SCOPES),
      })

      const response = await tagManager.accounts.containers.workspaces.tags.list({
        parent: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      })
      const tags = response.data.tag || []

      return formatMultilineList(
        `GTM tags for workspace ${workspaceId}`,
        tags.map((tag) => `${tag.tagId || "unknown"} - ${tag.name || "Unnamed tag"} (${tag.type || "unknown type"})`),
      )
    }),
)

server.registerTool(
  "aws_list_s3_buckets",
  {
    description: "List S3 buckets visible to the configured AWS credentials.",
    inputSchema: {
      region: z.string().min(1).optional().describe("AWS region for the SDK client. Defaults to AWS_REGION or us-east-1."),
    },
  },
  async ({ region }) =>
    runTool("aws_list_s3_buckets", async () => {
      const response = await createS3Client(region).send(new ListBucketsCommand({}))
      const buckets = response.Buckets || []

      return formatMultilineList(
        "AWS S3 buckets",
        buckets.map((bucket) => `${bucket.Name || "unnamed-bucket"} - created ${bucket.CreationDate?.toISOString() || "unknown"}`),
      )
    }),
)

server.registerTool(
  "aws_get_s3_bucket_location",
  {
    description: "Inspect the configured region for a specific S3 bucket.",
    inputSchema: {
      bucketName: z.string().min(1).describe("S3 bucket name."),
      region: z.string().min(1).optional().describe("AWS region for the SDK client. Defaults to AWS_REGION or us-east-1."),
    },
  },
  async ({ bucketName, region }) =>
    runTool("aws_get_s3_bucket_location", async () => {
      const response = await createS3Client(region).send(
        new GetBucketLocationCommand({
          Bucket: bucketName,
        }),
      )

      return `S3 bucket ${bucketName} location: ${response.LocationConstraint || "us-east-1"}`
    }),
)

server.registerTool(
  "aws_list_cloudfront_distributions",
  {
    description: "List CloudFront distributions visible to the configured AWS credentials.",
    inputSchema: {
      region: z.string().min(1).optional().describe("AWS region for the SDK client. Defaults to AWS_REGION or us-east-1."),
    },
  },
  async ({ region }) =>
    runTool("aws_list_cloudfront_distributions", async () => {
      const response = await createCloudFrontClient(region).send(new ListDistributionsCommand({}))
      const distributions = response.DistributionList?.Items || []

      return formatMultilineList(
        "AWS CloudFront distributions",
        distributions.map(
          (distribution) =>
            `${distribution.Id || "unknown"} - ${distribution.DomainName || "no domain"} (${distribution.Status || "unknown status"})`,
        ),
      )
    }),
)

server.registerTool(
  "github_get_repository",
  {
    description: "Read GitHub repository metadata for this repo or another owner/repo pair.",
    inputSchema: {
      repository: z.string().min(1).optional().describe("Repository in owner/repo format. Defaults to the current repo."),
    },
  },
  async ({ repository }) =>
    runTool("github_get_repository", async () => {
      const octokit = createOctokit()
      const { owner, repo } = normalizeRepository(repository)
      const response = await octokit.repos.get({ owner, repo })
      const repositoryData = response.data

      const summary = {
        fullName: repositoryData.full_name,
        private: repositoryData.private,
        defaultBranch: repositoryData.default_branch,
        openIssuesCount: repositoryData.open_issues_count,
        description: repositoryData.description,
        url: repositoryData.html_url,
      }

      return `GitHub repository metadata\n\n${JSON.stringify(summary, null, 2)}`
    }),
)

server.registerTool(
  "github_list_issues",
  {
    description: "List GitHub issues for this repo or another owner/repo pair.",
    inputSchema: {
      repository: z.string().min(1).optional().describe("Repository in owner/repo format. Defaults to the current repo."),
      state: z.enum(["open", "closed", "all"]).optional().describe("Which issue state to return."),
      perPage: z.number().int().min(1).max(100).optional().describe("Maximum number of issues to return."),
    },
  },
  async ({ repository, state = "open", perPage = 20 }) =>
    runTool("github_list_issues", async () => {
      const octokit = createOctokit()
      const { owner, repo } = normalizeRepository(repository)
      const response = await octokit.issues.listForRepo({
        owner,
        repo,
        state,
        per_page: perPage,
      })
      const issues = response.data.filter((issue) => !issue.pull_request)

      return formatMultilineList(
        `GitHub issues for ${owner}/${repo}`,
        issues.map((issue) => `#${issue.number} - ${issue.title} (${issue.state})`),
      )
    }),
)

async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("chen-integrations MCP server running on stdio")
}

main().catch((error: unknown) => {
  console.error("Fatal error while starting the MCP server", error)
  process.exit(1)
})