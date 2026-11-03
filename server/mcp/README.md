# MCP Integrations Server

This workspace includes a local stdio MCP server at `server/mcp/index.ts`.

It exposes read-only tools for:

- GA4 Admin API
- GA4 Data API
- Google Tag Manager API
- AWS S3 and CloudFront
- GitHub repository metadata and issues

It also exposes GTM write tools (`gtm_create_tag`, `gtm_update_tag`, `gtm_create_trigger`, `gtm_create_variable`, `gtm_create_version`, `gtm_deploy_version_to_environment`) that are limited to workspace edits and custom-environment deploys. The `tagmanager.publish` scope is intentionally omitted, and `gtm_deploy_version_to_environment` refuses Live/Latest environments, so the Live container can never be published through this server.

## Start Modes

- VS Code workspace MCP config: `.vscode/mcp.json`
- Manual start: `npm run mcp:start`
- Smoke test: `npm run mcp:smoke`
- Typecheck: `npm run mcp:typecheck`

## Credential Sources

The server does not store secrets in code. It reads credentials from environment variables.

### Google

Supported options:

- `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON file
- `GOOGLE_SERVICE_ACCOUNT_JSON` containing the service-account JSON payload
- Application Default Credentials if neither variable is provided

If your organization blocks service-account key creation, use a custom OAuth client for local ADC instead of the default gcloud client:

```bash
gcloud auth application-default login --client-id-file=/path/to/oauth-client.json --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/tagmanager.readonly
gcloud auth application-default set-quota-project chen-web-500809
```

Use the OAuth client JSON you created in Google Cloud Console.

To create that JSON:

1. Open Google Cloud Console and select the project that owns the OAuth client.
2. Go to APIs & Services > Credentials.
3. Click Create Credentials > OAuth client ID.
4. Choose Desktop app as the application type.
5. Download the JSON file that Google generates.
6. Save it locally and pass its path to `--client-id-file`.

If the app is still blocked for GTM scope after that, the remaining blocker is organization policy or OAuth consent configuration, not the MCP server.

Required scopes:

- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/tagmanager.readonly`
- `https://www.googleapis.com/auth/tagmanager.edit.containers` (GTM write tools)
- `https://www.googleapis.com/auth/tagmanager.edit.containerversions` (GTM version creation)

For the GTM write tools, the service account also needs container-level **Edit** permission in GTM (plus **Approve** for `gtm_create_version` and **Publish** for `gtm_deploy_version_to_environment`). Even with Publish permission in GTM, publishing the Live environment stays blocked because the publish OAuth scope is never requested.

### AWS

The AWS SDK uses its normal credential resolution chain.

Recommended environment variables:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` when temporary credentials are used

Minimum read-only permissions:

- `s3:ListAllMyBuckets`
- `s3:GetBucketLocation`
- `cloudfront:ListDistributions`

### GitHub

Optional environment variables:

- `GITHUB_TOKEN` for higher rate limits or private repository access
- `GITHUB_REPOSITORY` to override the default `gidiz/chenLandingPage`

Minimum token scopes:

- public repo read access for this repository
- `repo` only if private repository access is required

## Smoke Checks

Use these MCP tools first because they are safe read operations:

1. `ga4_list_accounts`
2. `ga4_list_properties`
3. `ga4_run_report`
4. `gtm_list_accounts`
5. `gtm_list_containers`
6. `aws_list_s3_buckets`
7. `aws_list_cloudfront_distributions`
8. `github_get_repository`
9. `github_list_issues`

The repository also includes a protocol smoke check with `npm run mcp:smoke`. That command starts the MCP server over stdio and verifies that the expected tool set is exposed.

## Notes

- Keep this server on stdio-safe logging only. Use stderr, not stdout, for diagnostics.
- `.vscode/mcp.json` points to `.env` for local credentials. Keep `.env.example` as the tracked template only.